import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import {
  downloadPremiumProductDatasheet,
  getPremiumProductDetail,
  listPremiumProducts,
} from '../controllers/premiumProductController';

const router = Router();

router.get('/', asyncHandler(listPremiumProducts));
router.get('/:id', asyncHandler(getPremiumProductDetail));
router.get('/:id/datasheet', asyncHandler(downloadPremiumProductDatasheet));

export default router;


