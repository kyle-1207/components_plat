import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { getRadiationFilterOptions, listRadiationData } from '../controllers/radiationDataController';

const router = Router();

/**
 * @route   GET /api/radiation-data
 * @desc    获取通用器件辐照数据
 * @query   keyword, category, subcategory, supplier, qualityGrade,
 *          totalDoseMin, totalDoseMax, singleEventMin, singleEventMax,
 *          sortField, sortOrder, page, limit
 * @access  Private (受保护路由，由前端处理)
 */
router.get('/', asyncHandler(listRadiationData));

/**
 * @route   GET /api/radiation-data/options
 * @desc    获取筛选下拉可选项
 * @access  Private
 */
router.get('/options', asyncHandler(getRadiationFilterOptions));

export default router;


