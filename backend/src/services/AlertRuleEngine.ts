import { AlertRule, IAlertRule, QualityAlert } from '../models';
import { qualityAlertService } from './QualityAlertService';
import { logger } from '../utils/logger';

export interface RuleEvaluationContext {
  sourceIssueId: string;
  issueSummary?: string;
  title?: string;
  category?: 'environmental' | 'supply_chain' | 'process' | 'reliability' | 'compliance';
  manufacturer?: string;
  processTags?: string[];
  materialTags?: string[];
  structureTags?: string[];
  functionTags?: string[];
  similarity?: number;
  relatedObjects?: {
    components?: string[];
    batches?: string[];
    suppliers?: string[];
    projects?: string[];
  };
  metrics?: {
    impactScore?: number;
    severityScore?: number;
    trendScore?: number;
    affectedBatches?: number;
    affectedUnits?: number;
    defectRate?: number;
    failureTrend?: 'increasing' | 'stable' | 'decreasing';
  };
}

export interface RuleEvaluationResult {
  ruleId: string;
  contextId: string;
  created: boolean;
  skippedReason?: string;
}

class AlertRuleEngine {
  async evaluateContexts(contexts: RuleEvaluationContext[]): Promise<RuleEvaluationResult[]> {
    if (!contexts || contexts.length === 0) {
      return [];
    }

    const rules = await AlertRule.find({ enabled: true }).sort({ priority: 1 }).lean();
    const results: RuleEvaluationResult[] = [];

    for (const context of contexts) {
      for (const rule of rules) {
        try {
          const payload = await this.evaluateRule(rule, context);

          if (!payload) {
            results.push({
              ruleId: rule.ruleId,
              contextId: context.sourceIssueId,
              created: false,
              skippedReason: 'MATCH_CONDITION_FAILED',
            });
            continue;
          }

          const isDuplicate = await this.isRecentDuplicate(rule.ruleId, context.sourceIssueId);
          if (isDuplicate) {
            results.push({
              ruleId: rule.ruleId,
              contextId: context.sourceIssueId,
              created: false,
              skippedReason: 'DUPLICATE_ALERT',
            });
            continue;
          }

          await qualityAlertService.createAlert(payload);

          results.push({
            ruleId: rule.ruleId,
            contextId: context.sourceIssueId,
            created: true,
          });
        } catch (error) {
          logger.error('规则引擎执行失败', {
            ruleId: rule.ruleId,
            contextId: context.sourceIssueId,
            error,
          });
          results.push({
            ruleId: rule.ruleId,
            contextId: context.sourceIssueId,
            created: false,
            skippedReason: 'EXECUTION_ERROR',
          });
        }
      }
    }

    return results;
  }

  private async evaluateRule(rule: IAlertRule, context: RuleEvaluationContext) {
    const matches = rule.matchingCriteria.filter((criterion) => this.matchesCriterion(criterion, context));
    const matchCount = matches.length;

    if (matchCount < (rule.minimumMatches || 1)) {
      return null;
    }

    const similarity = context.similarity ?? this.calculateSimilarity(context);
    if (similarity < (rule.similarityThreshold || 0)) {
      return null;
    }

    const { riskScore, level, breakdown } = this.calculateRiskScore(rule, context);
    const category = context.category || rule.category;

    return {
      ruleId: rule.ruleId,
      alertId: undefined,
      title: context.title || `${rule.name} - 自动预警`,
      description: context.issueSummary || rule.description,
      category,
      level,
      riskScore,
      matchingAttributes: {
        manufacturer: context.manufacturer,
        processTags: context.processTags || [],
        materialTags: context.materialTags || [],
        structureTags: context.structureTags || [],
        functionTags: context.functionTags || [],
        similarity,
      },
      relatedObjects: {
        components: context.relatedObjects?.components || [],
        batches: context.relatedObjects?.batches || [],
        suppliers: context.relatedObjects?.suppliers || (context.manufacturer ? [context.manufacturer] : []),
        projects: context.relatedObjects?.projects || [],
      },
      triggerSnapshot: {
        sourceIssueId: context.sourceIssueId,
        issueSummary: context.issueSummary,
        metrics: breakdown,
        triggeredAt: new Date(),
      },
      recommendations: [
        {
          action: `请确认 ${category} 类风险并制定处理计划`,
          priority: level === 'critical' ? 'high' : level === 'warning' ? 'medium' : 'low',
        },
      ],
    };
  }

  private matchesCriterion(
    criterion: IAlertRule['matchingCriteria'][number],
    context: RuleEvaluationContext,
  ): boolean {
    const values = this.extractAttributeValues(criterion.attribute, context);

    if (!values || values.length === 0) {
      return false;
    }

    switch (criterion.operator) {
      case 'equals':
        return values.some((value) => value === criterion.value);
      case 'includes': {
        const arr = Array.isArray(criterion.value) ? criterion.value : [criterion.value];
        return values.some((value) => arr.includes(value));
      }
      case 'similarity': {
        const arr = Array.isArray(criterion.value) ? criterion.value : [criterion.value];
        const overlap = values.filter((value) => arr.includes(value));
        return overlap.length / arr.length >= (criterion.weight || 0.5);
      }
      default:
        return false;
    }
  }

  private calculateSimilarity(context: RuleEvaluationContext): number {
    const attributes = [
      context.manufacturer ? 1 : 0,
      (context.processTags?.length || 0) > 0 ? 1 : 0,
      (context.materialTags?.length || 0) > 0 ? 1 : 0,
      (context.structureTags?.length || 0) > 0 ? 1 : 0,
      (context.functionTags?.length || 0) > 0 ? 1 : 0,
    ];
    const sum = attributes.reduce((acc, curr) => acc + curr, 0);
    return sum / attributes.length;
  }

  private calculateRiskScore(rule: IAlertRule, context: RuleEvaluationContext) {
    const metrics = context.metrics || {};
    const weights = rule.riskScoring?.weights || { impact: 0.4, severity: 0.35, trend: 0.25 };
    const baseScore = rule.riskScoring?.baseScore ?? 50;

    const impact =
      metrics.impactScore ??
      this.normalizeScore((metrics.affectedBatches || 0) * 10 + (metrics.affectedUnits || 0) * 0.01);
    const severity =
      metrics.severityScore ??
      this.normalizeScore((metrics.defectRate || 0) * 20 + (context.category === 'process' ? 30 : 15));
    const trend =
      metrics.trendScore ??
      (metrics.failureTrend === 'increasing' ? 90 : metrics.failureTrend === 'decreasing' ? 40 : 60);

    const weighted =
      baseScore + impact * weights.impact + severity * weights.severity + trend * weights.trend;

    const riskScore = Math.min(100, Math.round(weighted));
    const level = this.determineLevel(rule, riskScore);

    return {
      riskScore,
      level,
      breakdown: {
        baseScore,
        impact,
        severity,
        trend,
      },
    };
  }

  private determineLevel(rule: IAlertRule, score: number) {
    const mapping = rule.levelMapping || {
      critical: { min: 80 },
      warning: { min: 60 },
      info: { min: 40 },
    };

    if (score >= (mapping.critical?.min ?? 80)) {
      return 'critical';
    }

    if (score >= (mapping.warning?.min ?? 60)) {
      return 'warning';
    }

    if (score >= (mapping.info?.min ?? 40)) {
      return 'info';
    }

    return 'info';
  }

  private extractAttributeValues(attribute: string, context: RuleEvaluationContext): string[] {
    switch (attribute) {
      case 'manufacturer':
        return context.manufacturer ? [context.manufacturer] : [];
      case 'process':
        return context.processTags || [];
      case 'material':
        return context.materialTags || [];
      case 'structure':
        return context.structureTags || [];
      case 'function':
        return context.functionTags || [];
      default:
        return [];
    }
  }

  private normalizeScore(value: number): number {
    if (!value || value <= 0) {
      return 0;
    }
    return Math.min(100, Math.max(0, value));
  }

  private async isRecentDuplicate(ruleId: string, sourceIssueId: string): Promise<boolean> {
    const recent = await QualityAlert.findOne({
      ruleId,
      'triggerSnapshot.sourceIssueId': sourceIssueId,
      currentStatus: { $nin: ['closed', 'false_alarm'] },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).lean();

    return !!recent;
  }
}

export const alertRuleEngine = new AlertRuleEngine();

