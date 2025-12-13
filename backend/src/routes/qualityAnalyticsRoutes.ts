import { Router } from 'express';
import {
  assessComponentQuality,
  analyzeDefects,
  checkCompliance,
  getQualityMetrics,
  manageRadiationTesting,
  manageQualityZeroing,
  createQualityImprovementPlan,
  batchQualityAnalysis
} from '../controllers/qualityAnalyticsController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /api/quality-analytics/:componentId/assessment - 器件质量评估
router.get('/:componentId/assessment', asyncHandler(assessComponentQuality));

// GET /api/quality-analytics/:componentId/defects - 缺陷分析
router.get('/:componentId/defects', asyncHandler(analyzeDefects));

// GET /api/quality-analytics/:componentId/compliance - 合规性检查
router.get('/:componentId/compliance', asyncHandler(checkCompliance));

// GET /api/quality-analytics/metrics - 质量指标统计
router.get('/metrics', asyncHandler(getQualityMetrics));

// GET /api/quality-analytics/:componentId/radiation-testing - 辐射测试管理
router.get('/:componentId/radiation-testing', asyncHandler(manageRadiationTesting));

// GET /api/quality-analytics/:componentId/quality-zeroing - 质量零点管理
router.get('/:componentId/quality-zeroing', asyncHandler(manageQualityZeroing));

// POST /api/quality-analytics/:componentId/improvement-plan - 创建质量改进计划
router.post('/:componentId/improvement-plan', asyncHandler(createQualityImprovementPlan));

// POST /api/quality-analytics/batch-analysis - 批量质量分析
router.post('/batch-analysis', asyncHandler(batchQualityAnalysis));

export default router;
