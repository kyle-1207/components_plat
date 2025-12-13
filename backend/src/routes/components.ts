import { Router } from 'express';
import * as doeeetController from '../controllers/doeeetComponentController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/components/search
 * @desc    搜索组件
 * @params  familyPath, manufacturer, partNumber, partType, hasStock, parameters, page, limit, sortBy, sortOrder
 */
router.get('/search', asyncHandler(doeeetController.searchComponents));

/**
 * @route   GET /api/components/search/fulltext
 * @desc    全文搜索组件
 * @params  q (搜索关键词), limit
 */
router.get('/search/fulltext', asyncHandler(doeeetController.fullTextSearch));

/**
 * @route   GET /api/components/manufacturers
 * @desc    获取所有制造商列表
 */
router.get('/manufacturers', asyncHandler(doeeetController.getManufacturers));

/**
 * @route   GET /api/components/categories
 * @desc    获取所有分类路径
 */
router.get('/categories', asyncHandler(doeeetController.getFamilyPaths));

/**
 * @route   GET /api/components/categories/:familyPath/meta
 * @desc    获取指定分类的元数据配置
 */
router.get('/categories/:familyPath/meta', asyncHandler(doeeetController.getCategoryMeta));

/**
 * @route   GET /api/components/parameters/definitions
 * @desc    获取参数定义
 * @params  keys (逗号分隔的参数键列表，可选)
 */
router.get('/parameters/definitions', asyncHandler(doeeetController.getParameterDefinitions));

/**
 * @route   GET /api/components/statistics
 * @desc    获取组件统计信息
 */
router.get('/statistics', asyncHandler(doeeetController.getStatistics));

/**
 * @route   GET /api/components/filters/popular
 * @desc    获取热门过滤条件（制造商和分类）
 */
router.get('/filters/popular', asyncHandler(doeeetController.getPopularFilters));

/**
 * @route   POST /api/components/batch
 * @desc    批量获取组件信息
 * @body    { ids: string[] }
 */
router.post('/batch', asyncHandler(doeeetController.getComponentsByIds));

/**
 * @route   GET /api/components/:id
 * @desc    获取组件详情（包含参数）
 */
router.get('/:id', asyncHandler(doeeetController.getComponentById));

/**
 * @route   GET /api/components/:id/parameters
 * @desc    获取组件参数（包含参数定义）
 */
router.get('/:id/parameters', asyncHandler(doeeetController.getComponentById));

/**
 * @route   GET /api/components/:id/similar
 * @desc    获取相似组件
 * @params  limit (默认10，最大50)
 */
router.get('/:id/similar', asyncHandler(doeeetController.getSimilarComponents));

export default router;
