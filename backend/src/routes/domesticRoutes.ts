import { Router } from 'express';
import { searchDomesticProducts, getDomesticCategoryTree } from '../controllers/domesticProductController';
import {
  reindexDomesticAttachments,
  getDomesticAttachments,
  downloadDomesticAttachment,
} from '../controllers/domesticAttachmentController';
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

/**
 * GET /api/domestic/attachments/:materialCode
 * 查询附件列表（当前一一对应）
 */
router.get('/attachments/:materialCode', asyncHandler(getDomesticAttachments));

/**
 * GET /api/domestic/attachments/:materialCode/download
 * 下载附件
 */
router.get('/attachments/:materialCode/download', asyncHandler(downloadDomesticAttachment));

/**
 * POST /api/domestic/attachments/reindex
 * 重新扫描目录并建立索引（谨慎开放，默认无需鉴权，可按需加中间件）
 */
router.post('/attachments/reindex', asyncHandler(reindexDomesticAttachments));

export default router;

