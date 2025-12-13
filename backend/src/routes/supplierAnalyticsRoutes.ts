import { Router } from 'express';
import {
  evaluateSupplierPerformance,
  assessSupplierRisk,
  compareSuppliers,
  conductSupplierAudit,
  prequalifySupplier,
  manageSupplierRelationship,
  batchAnalyzeSuppliers
} from '../controllers/supplierAnalyticsController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /api/supplier-analytics/:supplierId/performance - 供应商绩效评估
router.get('/:supplierId/performance', asyncHandler(evaluateSupplierPerformance));

// GET /api/supplier-analytics/:supplierId/risk - 供应商风险评估
router.get('/:supplierId/risk', asyncHandler(assessSupplierRisk));

// POST /api/supplier-analytics/compare - 供应商对比分析
router.post('/compare', asyncHandler(compareSuppliers));

// POST /api/supplier-analytics/:supplierId/audit - 供应商审核
router.post('/:supplierId/audit', asyncHandler(conductSupplierAudit));

// POST /api/supplier-analytics/prequalify - 供应商资格预审
router.post('/prequalify', asyncHandler(prequalifySupplier));

// GET /api/supplier-analytics/:supplierId/relationship - 供应商关系管理
router.get('/:supplierId/relationship', asyncHandler(manageSupplierRelationship));

// POST /api/supplier-analytics/batch-analyze - 批量供应商分析
router.post('/batch-analyze', asyncHandler(batchAnalyzeSuppliers));

export default router;
