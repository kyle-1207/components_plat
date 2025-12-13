import { Router } from 'express';
import {
  getFunctionalUnits,
  createFunctionalUnit,
  getDigitalModels,
  createDigitalModel,
  downloadFunctionalUnit,
  downloadDigitalModel,
  getApplicationSupportStatistics
} from '../controllers/applicationSupportController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/application-support/statistics
 * @desc    获取应用支持统计信息
 * @access  Public
 */
router.get('/statistics', asyncHandler(getApplicationSupportStatistics));

/**
 * @route   GET /api/application-support/functional-units
 * @desc    获取功能单元列表
 * @query   page: 页码
 * @query   limit: 每页数量
 * @query   search: 搜索关键词
 * @query   category: 分类过滤 (analog, digital, power, rf, mixed_signal, interface)
 * @query   status: 状态过滤 (draft, published, deprecated)
 * @query   sortBy: 排序字段 (downloadCount, rating.average, createdAt)
 * @query   sortOrder: 排序方向 (asc, desc)
 * @access  Public
 */
router.get('/functional-units', asyncHandler(getFunctionalUnits));

/**
 * @route   GET /api/application-support/digital-models
 * @desc    获取数字模型列表
 * @query   page: 页码
 * @query   limit: 每页数量
 * @query   search: 搜索关键词
 * @query   modelType: 模型类型过滤 (spice, ibis, s_parameter, thermal, mechanical, behavioral)
 * @query   status: 状态过滤 (active, deprecated)
 * @query   componentId: 器件ID过滤
 * @query   sortBy: 排序字段 (downloadCount, createdAt)
 * @query   sortOrder: 排序方向 (asc, desc)
 * @access  Public
 */
router.get('/digital-models', asyncHandler(getDigitalModels));

/**
 * @route   GET /api/application-support/functional-units/:id/download
 * @desc    下载功能单元
 * @params  id: 功能单元ID
 * @access  Public
 */
router.get('/functional-units/:id/download', asyncHandler(downloadFunctionalUnit));

/**
 * @route   GET /api/application-support/digital-models/:id/download
 * @desc    下载数字模型
 * @params  id: 数字模型ID
 * @access  Public
 */
router.get('/digital-models/:id/download', asyncHandler(downloadDigitalModel));

/**
 * @route   POST /api/application-support/functional-units
 * @desc    创建功能单元
 * @body    功能单元数据
 * @access  Private
 */
router.post('/functional-units', asyncHandler(createFunctionalUnit));

/**
 * @route   POST /api/application-support/digital-models
 * @desc    创建数字模型
 * @body    数字模型数据
 * @access  Private
 */
router.post('/digital-models', asyncHandler(createDigitalModel));

export default router;
