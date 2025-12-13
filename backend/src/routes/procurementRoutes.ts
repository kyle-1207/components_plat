import { Router } from 'express';
import {
  getProcurementRequests,
  createProcurementRequest,
  evaluateSuppliers,
  getProcurementStatistics
} from '../controllers/procurementController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/procurement/requests
 * @desc    获取采购请求列表
 * @access  Public
 */
router.get('/requests', asyncHandler(getProcurementRequests));

/**
 * @route   GET /api/procurement/statistics
 * @desc    获取采购统计信息
 * @access  Public
 */
router.get('/statistics', asyncHandler(getProcurementStatistics));

/**
 * @route   POST /api/procurement/requests
 * @desc    创建采购请求
 * @access  Private
 */
router.post('/requests', asyncHandler(createProcurementRequest));

/**
 * @route   POST /api/procurement/requests/:id/evaluate
 * @desc    供应商评估
 * @access  Private
 */
router.post('/requests/:id/evaluate', asyncHandler(evaluateSuppliers));

export default router;
