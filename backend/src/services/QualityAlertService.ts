import { FilterQuery, UpdateQuery } from 'mongoose';
import { AlertRule, IAlertRule, QualityAlert, IQualityAlert, AlertStatus } from '../models';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface AlertListQuery {
  level?: string;
  status?: string;
  supplier?: string;
  component?: string;
  category?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AssignmentPayload {
  description: string;
  responsible: string;
  deadline?: string;
}

export class QualityAlertService {
  async createRule(payload: Partial<IAlertRule>): Promise<IAlertRule> {
    if (!payload.ruleId) {
      payload.ruleId = this.generateRuleId();
    }

    const rule = await AlertRule.create({
      ...payload,
      createdBy: payload.createdBy || 'system',
      updatedBy: payload.updatedBy || payload.createdBy || 'system',
    });

    return rule;
  }

  async listRules(): Promise<IAlertRule[]> {
    return AlertRule.find().sort({ priority: 1, createdAt: -1 }).lean();
  }

  async updateRule(ruleId: string, payload: Partial<IAlertRule>): Promise<IAlertRule> {
    const rule = await AlertRule.findOneAndUpdate({ ruleId }, payload, {
      new: true,
      runValidators: true,
    });

    if (!rule) {
      throw new CustomError('未找到对应的预警规则', 404, 'RULE_NOT_FOUND');
    }

    return rule;
  }

  async createAlert(payload: Partial<IQualityAlert>): Promise<IQualityAlert> {
    const alert = await QualityAlert.create({
      ...payload,
      alertId: payload.alertId || this.generateAlertId(),
      statusFlow: payload.statusFlow?.length
        ? payload.statusFlow
        : [
            {
              status: 'pending_analysis',
              actor: payload.triggerSnapshot?.sourceIssueId || 'system',
              note: '预警触发',
              updatedAt: new Date(),
            },
          ],
    });

    return alert;
  }

  async listAlerts(query: AlertListQuery): Promise<{
    items: IQualityAlert[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      level,
      status,
      supplier,
      component,
      category,
      keyword,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;

    const filter: FilterQuery<IQualityAlert> = {};

    if (level) {
      filter.level = level;
    }

    if (status) {
      filter.currentStatus = status;
    }

    if (category) {
      filter.category = category;
    }

    if (supplier) {
      filter['relatedObjects.suppliers'] = supplier;
    }

    if (component) {
      filter['relatedObjects.components'] = component;
    }

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { 'triggerSnapshot.issueSummary': { $regex: keyword, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const [items, total] = await Promise.all([
      QualityAlert.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      QualityAlert.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  }

  async getAlertById(alertId: string): Promise<IQualityAlert> {
    const alert = await QualityAlert.findOne({ alertId }).lean();

    if (!alert) {
      throw new CustomError('未找到质量预警', 404, 'ALERT_NOT_FOUND');
    }

    return alert;
  }

  async updateAlertStatus(alertId: string, status: AlertStatus, actor: string, note?: string): Promise<IQualityAlert> {
    const update: UpdateQuery<IQualityAlert> = {
      currentStatus: status,
      $push: {
        statusFlow: {
          status,
          actor,
          note,
          updatedAt: new Date(),
        },
      },
    };

    if (status === 'closed') {
      update.closedAt = new Date();
    }

    const alert = await QualityAlert.findOneAndUpdate({ alertId }, update, {
      new: true,
    });

    if (!alert) {
      throw new CustomError('未找到质量预警', 404, 'ALERT_NOT_FOUND');
    }

    return alert;
  }

  async addAssignment(alertId: string, payload: AssignmentPayload): Promise<IQualityAlert> {
    const assignment = {
      actionId: this.generateAssignmentId(),
      description: payload.description,
      responsible: payload.responsible,
      deadline: payload.deadline ? new Date(payload.deadline) : undefined,
      status: 'planned',
    };

    const alert = await QualityAlert.findOneAndUpdate(
      { alertId },
      { $push: { assignments: assignment } },
      { new: true },
    );

    if (!alert) {
      throw new CustomError('未找到质量预警', 404, 'ALERT_NOT_FOUND');
    }

    return alert;
  }

  async listStatistics(timeRange: '30d' | '90d' | '1y' = '30d') {
    const now = new Date();
    const startDate = this.calculateStartDate(now, timeRange);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            level: '$level',
            category: '$category',
          },
          count: { $sum: 1 },
        },
      },
    ];

    const stats = await QualityAlert.aggregate(pipeline);
    return stats;
  }

  private generateRuleId(): string {
    return `RULE-${Date.now()}`;
  }

  private generateAlertId(): string {
    return `QA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  private generateAssignmentId(): string {
    return `AS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  private calculateStartDate(endDate: Date, timeRange: '30d' | '90d' | '1y'): Date {
    const date = new Date(endDate);
    switch (timeRange) {
      case '30d':
        date.setDate(date.getDate() - 30);
        break;
      case '90d':
        date.setDate(date.getDate() - 90);
        break;
      case '1y':
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        break;
    }
    return date;
  }
}

export const qualityAlertService = new QualityAlertService();

