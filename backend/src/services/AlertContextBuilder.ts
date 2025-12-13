import { QualityZeroing, IQualityZeroing } from '../models/QualityZeroing';
import { RuleEvaluationContext } from './AlertRuleEngine';
import { logger } from '../utils/logger';

interface BuildOptions {
  since?: Date;
  limit?: number;
}

class AlertContextBuilder {
  async buildFromQualityZeroing(options: BuildOptions = {}): Promise<RuleEvaluationContext[]> {
    const { since, limit = 100 } = options;

    const filter: Record<string, any> = {};
    if (since) {
      filter.updatedAt = { $gte: since };
    }

    const zeroingRecords = await QualityZeroing.find(filter)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean<IQualityZeroing>();

    logger.info(`从质量归零记录构建上下文: ${zeroingRecords.length} 条`);

    return zeroingRecords.map((doc) => this.mapZeroingToContext(doc)).filter(Boolean) as RuleEvaluationContext[];
  }

  private mapZeroingToContext(doc: IQualityZeroing): RuleEvaluationContext | null {
    if (!doc || !doc.problemInfo) {
      return null;
    }

    const impactAssessment = doc.problemAnalysis?.impactAssessment;
    const phenomenon = doc.problemAnalysis?.phenomenonAnalysis;

    const context: RuleEvaluationContext = {
      sourceIssueId: doc.problemId || doc.zeroingId,
      title: doc.problemInfo.problemTitle,
      issueSummary: doc.problemInfo.problemDescription,
      category: this.mapCategory(doc),
      manufacturer: doc.problemInfo.manufacturer,
      processTags: this.extractProcessTags(doc),
      materialTags: [],
      structureTags: [],
      functionTags: [],
      relatedObjects: {
        components: [doc.problemInfo.componentPartNumber].filter(Boolean),
        batches: [doc.problemInfo.batchNumber].filter(Boolean),
        suppliers: [doc.problemInfo.manufacturer].filter(Boolean),
        projects: impactAssessment?.affectedProjects || [],
      },
      metrics: {
        affectedBatches: impactAssessment?.affectedBatches?.length || 0,
        defectRate: phenomenon?.failureRate || 0,
        failureTrend: this.mapTrend(doc),
      },
    };

    return context;
  }

  private extractProcessTags(doc: IQualityZeroing): string[] {
    const tags: string[] = [];

    if (doc.zeroingStatus?.currentPhase) {
      tags.push(doc.zeroingStatus.currentPhase);
    }

    doc.rootCauseAnalysis?.rootCauses?.forEach((cause) => {
      if (cause.causeType) {
        tags.push(cause.causeType);
      }
    });

    return Array.from(new Set(tags));
  }

  private mapCategory(doc: IQualityZeroing): RuleEvaluationContext['category'] {
    const cause = doc.rootCauseAnalysis?.rootCauses?.[0]?.causeType;
    switch (cause) {
      case 'process':
        return 'process';
      case 'manufacturing':
      case 'material':
        return 'supply_chain';
      case 'design':
      case 'human':
        return 'reliability';
      default:
        return 'process';
    }
  }

  private mapTrend(doc: IQualityZeroing): 'increasing' | 'stable' | 'decreasing' {
    const trend = doc.problemAnalysis?.preliminaryConclusions?.length || 0;
    if (trend > 3) {
      return 'increasing';
    }
    if (trend === 0) {
      return 'stable';
    }
    return 'decreasing';
  }
}

export const alertContextBuilder = new AlertContextBuilder();

