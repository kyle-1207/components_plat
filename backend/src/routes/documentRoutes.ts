import { Router } from 'express';
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
  getDocumentStatistics
} from '../controllers/documentController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/documents
 * @desc    获取文档列表 (支持搜索、过滤、分页)
 * @query   page: 页码
 * @query   limit: 每页数量
 * @query   search: 搜索关键词 (全文搜索)
 * @query   type: 文档类型过滤 (technical, standard, application, test_report, certificate, manual)
 * @query   category: 分类过滤
 * @query   accessLevel: 访问级别过滤 (public, restricted, confidential)
 * @query   status: 状态过滤 (active, archived, deprecated)
 * @query   sortBy: 排序字段 (uploadDate, downloadCount, title)
 * @query   sortOrder: 排序方向 (asc, desc)
 * @access  Public
 */
router.get('/', asyncHandler(getDocuments));

/**
 * @route   GET /api/documents/statistics
 * @desc    获取文档统计信息
 * @access  Public
 */
router.get('/statistics', asyncHandler(getDocumentStatistics));

/**
 * @route   GET /api/documents/:id
 * @desc    根据ID获取文档详情
 * @params  id: 文档ID
 * @access  Public
 */
router.get('/:id', asyncHandler(getDocumentById));

/**
 * @route   POST /api/documents
 * @desc    上传文档
 * @body    文档数据
 * @access  Private
 */
router.post('/', asyncHandler(uploadDocument));

/**
 * @route   PUT /api/documents/:id
 * @desc    更新文档
 * @params  id: 文档ID
 * @body    更新的文档数据
 * @access  Private
 */
router.put('/:id', asyncHandler(updateDocument));

/**
 * @route   DELETE /api/documents/:id
 * @desc    删除文档
 * @params  id: 文档ID
 * @access  Private
 */
router.delete('/:id', asyncHandler(deleteDocument));

export default router;
