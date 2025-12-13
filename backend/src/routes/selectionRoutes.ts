import { Router } from 'express';
import {
  getSelectionLists,
  getSelectionListById,
  createSelectionList,
  updateSelectionList,
  deleteSelectionList,
  addSelectionItem,
  updateSelectionItem,
  deleteSelectionItem,
  bulkUpdateSelectionItems,
  analyzeSelectionList,
  getSelectionRecommendations
} from '../controllers/selectionController';

const router = Router();

/**
 * @route   GET /api/selections
 * @desc    获取选型清单列表 (支持搜索、过滤、分页)
 * @query   page: 页码
 * @query   limit: 每页数量
 * @query   search: 搜索关键词 (清单名称、描述、项目名称)
 * @query   status: 状态过滤 (draft, in_review, approved, completed, cancelled)
 * @query   priority: 优先级过滤 (urgent, high, medium, low)
 * @query   projectId: 项目ID过滤
 * @query   createdBy: 创建者过滤
 * @query   tag: 标签过滤
 * @query   sortBy: 排序字段 (name, priority, status, createdAt, deadline, totalCost)
 * @query   sortOrder: 排序方向 (asc, desc)
 * @query   dateFrom: 开始日期
 * @query   dateTo: 结束日期
 * @access  Public
 */
router.get('/', getSelectionLists);

/**
 * @route   GET /api/selections/:id
 * @desc    根据ID获取选型清单详情
 * @params  id: 选型清单ID
 * @access  Public
 */
router.get('/:id', getSelectionListById);

/**
 * @route   POST /api/selections
 * @desc    创建新的选型清单
 * @body    CreateSelectionListRequest
 * @access  Private
 */
router.post('/', createSelectionList);

/**
 * @route   PUT /api/selections/:id
 * @desc    更新选型清单基本信息
 * @params  id: 选型清单ID
 * @body    UpdateSelectionListRequest
 * @access  Private
 */
router.put('/:id', updateSelectionList);

/**
 * @route   DELETE /api/selections/:id
 * @desc    删除选型清单
 * @params  id: 选型清单ID
 * @access  Private
 */
router.delete('/:id', deleteSelectionList);

/**
 * @route   POST /api/selections/:listId/items
 * @desc    向选型清单添加新项目
 * @params  listId: 选型清单ID
 * @body    CreateSelectionItemRequest
 * @access  Private
 */
router.post('/:listId/items', addSelectionItem);

/**
 * @route   PUT /api/selections/:listId/items/:itemId
 * @desc    更新选型项目
 * @params  listId: 选型清单ID
 * @params  itemId: 选型项目ID
 * @body    UpdateSelectionItemRequest
 * @access  Private
 */
router.put('/:listId/items/:itemId', updateSelectionItem);

/**
 * @route   DELETE /api/selections/:listId/items/:itemId
 * @desc    删除选型项目
 * @params  listId: 选型清单ID
 * @params  itemId: 选型项目ID
 * @access  Private
 */
router.delete('/:listId/items/:itemId', deleteSelectionItem);

/**
 * @route   POST /api/selections/:listId/items/bulk
 * @desc    批量操作选型项目
 * @params  listId: 选型清单ID
 * @body    BulkSelectionOperation
 * @access  Private
 */
router.post('/:listId/items/bulk', bulkUpdateSelectionItems);

/**
 * @route   GET /api/selections/:id/analysis
 * @desc    获取选型清单分析报告
 * @params  id: 选型清单ID
 * @access  Public
 */
router.get('/:id/analysis', analyzeSelectionList);

/**
 * @route   POST /api/selections/:listId/recommendations
 * @desc    获取智能选型推荐
 * @params  listId: 选型清单ID
 * @body    SelectionCriteria
 * @access  Public
 */
router.post('/:listId/recommendations', getSelectionRecommendations);

export default router;
