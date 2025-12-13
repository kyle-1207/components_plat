import { Router } from 'express';
import {
  getMarketTrends,
  getComponentUsageStats,
  analyzePrices,
  assessSupplyChainRisk,
  analyzeCostOptimization,
  predictTechnologyTrends,
  generateAnalyticsReport
} from '../controllers/analyticsController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /api/analytics/market-trends - 获取市场趋势分析
router.get('/market-trends', asyncHandler(getMarketTrends));

// POST /api/analytics/usage-stats - 获取器件使用统计
router.post('/usage-stats', asyncHandler(getComponentUsageStats));

// POST /api/analytics/price-analysis - 价格分析和预测
router.post('/price-analysis', asyncHandler(analyzePrices));

// POST /api/analytics/supply-chain-risk - 供应链风险评估
router.post('/supply-chain-risk', asyncHandler(assessSupplyChainRisk));

// POST /api/analytics/cost-optimization - 成本优化分析
router.post('/cost-optimization', asyncHandler(analyzeCostOptimization));

// GET /api/analytics/tech-trends - 技术趋势预测
router.get('/tech-trends', asyncHandler(predictTechnologyTrends));

// POST /api/analytics/report - 生成综合分析报告
router.post('/report', asyncHandler(generateAnalyticsReport));

export default router;
