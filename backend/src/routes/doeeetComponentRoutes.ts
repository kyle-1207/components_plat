import { Router } from 'express';
import { 
  searchComponents,
  getComponentById,
  getComponentsByCategory,
  compareComponents,
  getSimilarComponents,
  getPopularFilters,
  fullTextSearch,
  getSearchSuggestions,
  getComponentsByIds,
  getManufacturers,
  getFamilyPaths,
  getCategoryMeta,
  getParameterDefinitions,
  getStatistics
} from '../controllers/doeeetComponentController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /api/doeeet-components/search - 搜索组件（支持分页、排序、筛选）
router.get('/search', asyncHandler(searchComponents));

// GET /api/doeeet-components/fulltext-search - 全文搜索
router.get('/fulltext-search', asyncHandler(fullTextSearch));

// GET /api/doeeet-components/suggestions - 搜索建议
router.get('/suggestions', asyncHandler(getSearchSuggestions));

// GET /api/doeeet-components/manufacturers - 获取制造商列表
router.get('/manufacturers', asyncHandler(getManufacturers));

// GET /api/doeeet-components/family-paths - 获取分类列表
router.get('/family-paths', asyncHandler(getFamilyPaths));

// GET /api/doeeet-components/statistics - 获取统计信息
router.get('/statistics', asyncHandler(getStatistics));

// GET /api/doeeet-components/popular-filters - 获取热门筛选项
router.get('/popular-filters', asyncHandler(getPopularFilters));

// GET /api/doeeet-components/category/:familyPath/meta - 获取分类元数据
router.get('/category/:familyPath/meta', asyncHandler(getCategoryMeta));

// GET /api/doeeet-components/category/:category - 根据分类获取器件
router.get('/category/:category', asyncHandler(getComponentsByCategory));

// GET /api/doeeet-components/parameter-definitions - 获取参数定义
router.get('/parameter-definitions', asyncHandler(getParameterDefinitions));

// GET /api/doeeet-components/:id - 根据ID获取单个器件
router.get('/:id', asyncHandler(getComponentById));

// GET /api/doeeet-components/:id/similar - 获取相似组件
router.get('/:id/similar', asyncHandler(getSimilarComponents));

// POST /api/doeeet-components/compare - 批量比对器件
router.post('/compare', asyncHandler(compareComponents));

// POST /api/doeeet-components/batch - 批量获取组件
router.post('/batch', asyncHandler(getComponentsByIds));

export default router;
