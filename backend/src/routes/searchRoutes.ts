import { Router } from 'express';
import { 
  searchComponents,
  getSearchSuggestions,
  getSearchFilters,
  advancedSearch
} from '../controllers/searchController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /api/search - 基础搜索
router.get('/', asyncHandler(searchComponents));

// GET /api/search/suggestions - 获取搜索建议
router.get('/suggestions', asyncHandler(getSearchSuggestions));

// GET /api/search/filters - 获取可用的搜索筛选器
router.get('/filters', asyncHandler(getSearchFilters));

// POST /api/search/advanced - 高级搜索
router.post('/advanced', asyncHandler(advancedSearch));

export default router;
