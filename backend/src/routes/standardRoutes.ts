import { Router } from 'express';
import {
  getStandards,
  getStandardById,
  createStandard,
  updateStandard,
  deleteStandard,
  compareStandards,
  getStandardStatistics,
  searchStandardsText,
  getStandardCategories
} from '../controllers/standardController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/standards
 * @desc    获取标准列表 (支持搜索、过滤、分页)
 * @query   page: 页码
 * @query   limit: 每页数量
 * @query   search: 搜索关键词 (标准编号、标题)
 * @query   type: 标准类型过滤 (MIL, ESCC, ISO, IEC, GB, GJB)
 * @query   status: 状态过滤 (现行, 废止, 替代)
 * @query   sortBy: 排序字段 (publishDate, standardCode, title)
 * @query   sortOrder: 排序方向 (asc, desc)
 * @access  Public
 */
router.get('/', asyncHandler(getStandards));

/**
 * @route   GET /api/standards/statistics
 * @desc    获取标准统计信息
 * @access  Public
 */
router.get('/statistics', asyncHandler(getStandardStatistics));

/**
 * 文本搜索（支持分类、年份、状态等）
 */
router.get('/search', asyncHandler(searchStandardsText));

/**
 * 获取标准类别（category）
 */
router.get('/categories', asyncHandler(getStandardCategories));

/**
 * @route   POST /api/standards/compare
 * @desc    标准对比分析
 * @body    standardIds: 标准ID数组
 * @access  Public
 */
router.post('/compare', asyncHandler(compareStandards));

/**
 * @route   GET /api/standards/:id
 * @desc    根据ID获取标准详情
 * @params  id: 标准ID
 * @access  Public
 */
router.get('/:id', asyncHandler(getStandardById));

/**
 * @route   POST /api/standards
 * @desc    创建新标准
 * @body    标准数据
 * @access  Private (需要管理员权限)
 */
router.post('/', asyncHandler(createStandard));

/**
 * @route   PUT /api/standards/:id
 * @desc    更新标准信息
 * @params  id: 标准ID
 * @body    更新的标准数据
 * @access  Private (需要管理员权限)
 */
router.put('/:id', asyncHandler(updateStandard));

/**
 * @route   DELETE /api/standards/:id
 * @desc    删除标准
 * @params  id: 标准ID
 * @access  Private (需要管理员权限)
 */
router.delete('/:id', asyncHandler(deleteStandard));

export default router;
