/**
 * 管理员路由 - 用于系统管理操作
 */
import express from 'express';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { persistentStorage } from '../config/persistentStorage';
import { memoryStorage } from '../config/memoryStorage';

const router = express.Router();

/**
 * 清除持久化数据并重置为默认数据
 * POST /api/admin/reset-data
 */
router.post('/reset-data', async (req: Request, res: Response) => {
  try {
    // 清除持久化数据文件
    const cleared = persistentStorage.clearPersistedData();
    
    if (cleared) {
      // 重新创建MemoryStorage实例以重新加载默认数据
      (memoryStorage as any).isDataLoaded = false;
      (memoryStorage as any).digitalModels = [];
      (memoryStorage as any).components.clear();
      (memoryStorage as any).suppliers.clear();
      (memoryStorage as any).identifications.clear();
      
      // 重新初始化数据
      (memoryStorage as any).initializeData();
      
      logger.info('🔄 系统数据已重置为默认状态');
      
      res.json({
        success: true,
        message: '系统数据已重置为默认状态'
      });
    } else {
      res.status(404).json({
        success: false,
        message: '未找到持久化数据文件'
      });
    }
  } catch (error) {
    logger.error('重置数据失败:', error);
    res.status(500).json({
      success: false,
      message: '重置数据失败'
    });
  }
});

/**
 * 手动触发数据保存
 * POST /api/admin/save-data
 */
router.post('/save-data', async (req: Request, res: Response) => {
  try {
    const success = persistentStorage.manualSave();
    
    if (success) {
      res.json({
        success: true,
        message: '数据保存成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '数据保存失败'
      });
    }
  } catch (error) {
    logger.error('手动保存数据失败:', error);
    res.status(500).json({
      success: false,
      message: '数据保存失败'
    });
  }
});

/**
 * 获取数据状态信息
 * GET /api/admin/data-status
 */
router.get('/data-status', async (req: Request, res: Response) => {
  try {
    const hasPersistedData = persistentStorage.hasPersistedData();
    
    res.json({
      success: true,
      data: {
        hasPersistedData,
        digitalModelsCount: memoryStorage.digitalModels?.length || 0,
        componentsCount: memoryStorage.getAllComponents()?.length || 0,
        suppliersCount: memoryStorage.getAllSuppliers()?.length || 0,
        identificationsCount: memoryStorage.getAllIdentifications()?.length || 0
      }
    });
  } catch (error) {
    logger.error('获取数据状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据状态失败'
    });
  }
});

export default router;
