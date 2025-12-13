import { Router } from 'express';
import {
  getTestRecords,
  getTestRecordById,
  createTestRecord,
  updateTestRecord,
  completeTest,
  getTestStatistics,
  getRadiationTests
} from '../controllers/testController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/tests
 * @desc    获取测试记录列表 (支持搜索、过滤、分页)
 * @query   page: 页码
 * @query   limit: 每页数量
 * @query   search: 搜索关键词 (测试ID、测试标准、实验室名称)
 * @query   testType: 测试类型过滤 (electrical, environmental, radiation, mechanical, reliability, emc)
 * @query   status: 状态过滤 (planned, in_progress, completed, cancelled, failed)
 * @query   priority: 优先级过滤 (low, medium, high, urgent)
 * @query   componentId: 器件ID过滤
 * @query   sortBy: 排序字段 (testDate.start, priority, status)
 * @query   sortOrder: 排序方向 (asc, desc)
 * @access  Public
 */
router.get('/', asyncHandler(getTestRecords));

/**
 * @route   GET /api/tests/statistics
 * @desc    获取测试统计信息
 * @access  Public
 */
router.get('/statistics', asyncHandler(getTestStatistics));

/**
 * @route   GET /api/tests/radiation
 * @desc    获取辐照测试数据
 * @query   page: 页码
 * @query   limit: 每页数量
 * @query   radiationType: 辐照类型 (TID, SEE, DD, neutron, proton)
 * @query   componentId: 器件ID过滤
 * @access  Public
 */
router.get('/radiation', asyncHandler(getRadiationTests));

/**
 * @route   GET /api/tests/:id
 * @desc    根据ID获取测试记录详情
 * @params  id: 测试记录ID
 * @access  Public
 */
router.get('/:id', asyncHandler(getTestRecordById));

/**
 * @route   POST /api/tests
 * @desc    创建测试记录
 * @body    测试记录数据
 * @access  Private
 */
router.post('/', asyncHandler(createTestRecord));

/**
 * @route   PUT /api/tests/:id
 * @desc    更新测试记录
 * @params  id: 测试记录ID
 * @body    更新的测试记录数据
 * @access  Private
 */
router.put('/:id', asyncHandler(updateTestRecord));

/**
 * @route   POST /api/tests/:id/complete
 * @desc    完成测试
 * @params  id: 测试记录ID
 * @body    testResults: 测试结果
 * @body    reportFile: 报告文件
 * @body    certificateFile: 证书文件
 * @access  Private
 */
router.post('/:id/complete', asyncHandler(completeTest));

export default router;
