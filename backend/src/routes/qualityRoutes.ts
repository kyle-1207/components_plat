import { Router } from 'express';
import {
  createQualityNotification
} from '../controllers/qualityController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   POST /api/quality/notifications
 * @desc    发布质量通报
 * @body    title: 通报标题
 * @body    content: 通报内容
 * @body    severity: 严重程度
 * @body    affectedComponents: 影响的器件
 * @body    recipients: 接收者
 * @access  Private (需要管理员权限)
 */
router.post('/notifications', asyncHandler(createQualityNotification));

export default router;
