import { Router } from 'express';
import { searchDomesticProducts, getDomesticCategoryTree } from '../controllers/domesticProductController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/domestic/search
 * 查询国产元器件
 */
router.get('/search', asyncHandler(searchDomesticProducts));

/**
 * GET /api/domestic/categories/tree
 * 获取国产分类树（level1/level2/level3）
 */
router.get('/categories/tree', asyncHandler(getDomesticCategoryTree));

export default router;

