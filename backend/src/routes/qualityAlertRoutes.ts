import { Router } from 'express';
import {
  createAlertRule,
  listAlertRules,
  updateAlertRule,
  listQualityAlerts,
  getQualityAlertDetail,
  updateQualityAlertStatus,
  addQualityAlertAssignment,
  listAlertStatistics,
  runQualityAlertScan,
  runQualityZeroingScan,
} from '../controllers/qualityAlertController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// 规则管理
router.post('/rules', asyncHandler(createAlertRule));
router.get('/rules', asyncHandler(listAlertRules));
router.patch('/rules/:ruleId', asyncHandler(updateAlertRule));

// 统计
router.get('/stats/summary', asyncHandler(listAlertStatistics));

// 手动扫描
router.post('/scan', asyncHandler(runQualityAlertScan));
router.get('/scan/zeroing', asyncHandler(runQualityZeroingScan));

// 预警记录
router.get('/', asyncHandler(listQualityAlerts));
router.get('/:alertId', asyncHandler(getQualityAlertDetail));
router.patch('/:alertId/status', asyncHandler(updateQualityAlertStatus));
router.post('/:alertId/assignments', asyncHandler(addQualityAlertAssignment));

export default router;

