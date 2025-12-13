import { Router } from 'express';
import {
  getSuppliers,
  getSupplierById,
  analyzeSuppliers,
  getSupplierStatistics,
  getSupplierRecommendations
} from '../controllers/supplierController';

const router = Router();

/**
 * @route   GET /api/suppliers
 * @desc    获取供应商列表 (支持搜索、过滤、分页)
 * @query   page: 页码
 * @query   limit: 每页数量
 * @query   search: 搜索关键词 (供应商名称、代码、注册号)
 * @query   qualificationLevel: 资质等级过滤 (A, B, C, unqualified)
 * @query   isActive: 活跃状态过滤 (true, false)
 * @query   spaceQualified: 航天资质过滤 (true, false)
 * @query   radiationTesting: 辐照测试能力过滤 (true, false)
 * @query   sort: 排序字段 (name, qualificationLevel, performance)
 * @query   order: 排序方向 (asc, desc)
 * @access  Public
 */
router.get('/', getSuppliers);

/**
 * @route   GET /api/suppliers/statistics
 * @desc    获取供应商统计信息
 * @access  Public
 */
router.get('/statistics', getSupplierStatistics);

/**
 * @route   GET /api/suppliers/recommendations
 * @desc    获取供应商推荐
 * @query   componentCategory: 器件类别
 * @query   qualityRequirement: 质量要求 (space, military, industrial, commercial)
 * @query   spaceGrade: 航天等级要求
 * @query   budget: 预算范围
 * @query   urgency: 紧急程度 (low, medium, high)
 * @access  Public
 */
router.get('/recommendations', getSupplierRecommendations);

/**
 * @route   GET /api/suppliers/:id
 * @desc    获取单个供应商详情
 * @param   id: 供应商ID
 * @access  Public
 */
router.get('/:id', getSupplierById);

/**
 * @route   POST /api/suppliers/analyze
 * @desc    供应商对比分析
 * @body    supplierIds: 供应商ID数组
 * @access  Public
 */
router.post('/analyze', analyzeSuppliers);

export default router;