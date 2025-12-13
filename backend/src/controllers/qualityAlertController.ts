import { Request, Response } from 'express';
import { qualityAlertService, alertRuleEngine, alertContextBuilder } from '../services';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const createAlertRule = async (req: Request, res: Response) => {
  const rule = await qualityAlertService.createRule(req.body);
  res.status(201).json({
    success: true,
    data: rule,
    message: '预警规则创建成功',
  });
};

export const listAlertRules = async (_req: Request, res: Response) => {
  const rules = await qualityAlertService.listRules();
  res.json({
    success: true,
    data: rules,
  });
};

export const updateAlertRule = async (req: Request, res: Response) => {
  const { ruleId } = req.params;
  if (!ruleId) {
    throw new CustomError('缺少规则ID', 400, 'MISSING_RULE_ID');
  }

  const rule = await qualityAlertService.updateRule(ruleId, {
    ...req.body,
    updatedBy: req.body.updatedBy || 'system',
  });

  res.json({
    success: true,
    data: rule,
    message: '预警规则更新成功',
  });
};

export const listQualityAlerts = async (req: Request, res: Response) => {
  const result = await qualityAlertService.listAlerts(req.query);
  res.json({
    success: true,
    data: result.items,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
    },
  });
};

export const getQualityAlertDetail = async (req: Request, res: Response) => {
  const { alertId } = req.params;
  if (!alertId) {
    throw new CustomError('缺少预警ID', 400, 'MISSING_ALERT_ID');
  }

  const alert = await qualityAlertService.getAlertById(alertId);
  res.json({
    success: true,
    data: alert,
  });
};

export const updateQualityAlertStatus = async (req: Request, res: Response) => {
  const { alertId } = req.params;
  const { status, actor, note } = req.body;

  if (!alertId || !status) {
    throw new CustomError('缺少必要参数', 400, 'MISSING_PARAMETERS');
  }

  const updated = await qualityAlertService.updateAlertStatus(alertId, status, actor || 'system', note);
  res.json({
    success: true,
    data: updated,
    message: '预警状态更新成功',
  });
};

export const addQualityAlertAssignment = async (req: Request, res: Response) => {
  const { alertId } = req.params;
  if (!alertId) {
    throw new CustomError('缺少预警ID', 400, 'MISSING_ALERT_ID');
  }

  const updated = await qualityAlertService.addAssignment(alertId, req.body);
  res.status(201).json({
    success: true,
    data: updated,
    message: '处理措施创建成功',
  });
};

export const listAlertStatistics = async (req: Request, res: Response) => {
  const { timeRange = '30d' } = req.query;
  try {
    const stats = await qualityAlertService.listStatistics(timeRange as '30d' | '90d' | '1y');
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('获取质量预警统计失败', error);
    throw error;
  }
};

export const runQualityAlertScan = async (req: Request, res: Response) => {
  const { contexts } = req.body;

  if (!Array.isArray(contexts) || contexts.length === 0) {
    throw new CustomError('请提供至少一个待评估的质量问题上下文', 400, 'MISSING_CONTEXTS');
  }

  const result = await alertRuleEngine.evaluateContexts(contexts);

  res.json({
    success: true,
    data: result,
    message: '预警扫描完成',
  });
};

export const runQualityZeroingScan = async (req: Request, res: Response) => {
  const { since, limit } = req.query;

  const contexts = await alertContextBuilder.buildFromQualityZeroing({
    since: since ? new Date(String(since)) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  if (!contexts.length) {
    return res.json({
      success: true,
      data: [],
      message: '未发现可用于预警的质量归零记录',
    });
  }

  const result = await alertRuleEngine.evaluateContexts(contexts);

  res.json({
    success: true,
    data: result,
    meta: {
      contexts: contexts.length,
    },
    message: '质量归零数据预警扫描完成',
  });
};

