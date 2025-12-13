import { Router } from 'express';
import {
  getPolicyRegulations,
  getPolicyRegulationById,
  createPolicyRegulation,
  updatePolicyRegulation,
  deletePolicyRegulation,
  getPolicyRegulationStatistics,
  getPolicyRegulationsByField,
  getRecentUpdates,
  searchPolicyRegulations,
  addPolicyFeedback,
  recordDownload
} from '../controllers/policyRegulationController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/policy-regulations
 * @desc    获取政策法规列表 (支持搜索、过滤、分页)
 * @query   page: 页码
 * @query   limit: 每页数量
 * @query   search: 搜索关键词 (全文搜索)
 * @query   category: 分类过滤 (national, ministry, local, industry)
 * @query   type: 类型过滤 (law, regulation, policy, standard, notice)
 * @query   field: 领域过滤 (commercial_space, components, technology, trade, safety, quality)
 * @query   status: 状态过滤 (effective, draft, abolished, revised, pending)
 * @query   issuer: 发布机构过滤 (模糊搜索)
 * @query   level: 级别过滤 (high, medium, low)
 * @query   publishDateFrom: 发布日期起始 (YYYY-MM-DD)
 * @query   publishDateTo: 发布日期结束 (YYYY-MM-DD)
 * @query   effectiveDateFrom: 生效日期起始 (YYYY-MM-DD)
 * @query   effectiveDateTo: 生效日期结束 (YYYY-MM-DD)
 * @query   sortBy: 排序字段 (publishDate, effectiveDate, level, viewCount)
 * @query   sortOrder: 排序方向 (asc, desc)
 * @access  Public
 */
router.get('/', asyncHandler(getPolicyRegulations));

/**
 * @route   GET /api/policy-regulations/statistics
 * @desc    获取政策法规统计信息
 * @access  Public
 */
router.get('/statistics', asyncHandler(getPolicyRegulationStatistics));

/**
 * @route   GET /api/policy-regulations/recent-updates
 * @desc    获取最近更新的政策法规
 * @query   days: 最近天数 (默认30天)
 * @query   limit: 返回数量 (默认20)
 * @access  Public
 */
router.get('/recent-updates', asyncHandler(getRecentUpdates));

/**
 * @route   GET /api/policy-regulations/by-field/:field
 * @desc    根据领域获取有效政策法规
 * @params  field: 领域 (commercial_space, components, technology, trade, safety, quality)
 * @query   limit: 返回数量 (默认50)
 * @access  Public
 */
router.get('/by-field/:field', asyncHandler(getPolicyRegulationsByField));

/**
 * @route   POST /api/policy-regulations/search
 * @desc    高级搜索政策法规
 * @body    keyword: 搜索关键词
 * @body    filters: 过滤条件对象
 * @body    page: 页码
 * @body    limit: 每页数量
 * @body    sortBy: 排序字段
 * @access  Public
 */
router.post('/search', asyncHandler(searchPolicyRegulations));

/**
 * @route   GET /api/policy-regulations/:id
 * @desc    根据ID获取政策法规详情
 * @params  id: 政策法规ID
 * @access  Public
 */
router.get('/:id', asyncHandler(getPolicyRegulationById));

/**
 * @route   POST /api/policy-regulations
 * @desc    创建政策法规
 * @body    政策法规数据
 * @access  Private (需要管理员权限)
 */
router.post('/', asyncHandler(createPolicyRegulation));

/**
 * @route   PUT /api/policy-regulations/:id
 * @desc    更新政策法规
 * @params  id: 政策法规ID
 * @body    更新的政策法规数据
 * @access  Private (需要管理员权限)
 */
router.put('/:id', asyncHandler(updatePolicyRegulation));

/**
 * @route   DELETE /api/policy-regulations/:id
 * @desc    删除政策法规
 * @params  id: 政策法规ID
 * @access  Private (需要管理员权限)
 */
router.delete('/:id', asyncHandler(deletePolicyRegulation));

/**
 * @route   POST /api/policy-regulations/:id/feedback
 * @desc    添加政策法规反馈
 * @params  id: 政策法规ID
 * @body    rating: 评分 (1-5)
 * @body    comment: 评论 (可选)
 * @access  Private (需要登录)
 */
router.post('/:id/feedback', asyncHandler(addPolicyFeedback));

/**
 * @route   POST /api/policy-regulations/:id/download
 * @desc    记录政策法规下载
 * @params  id: 政策法规ID
 * @access  Public
 */
router.post('/:id/download', asyncHandler(recordDownload));

export default router;
