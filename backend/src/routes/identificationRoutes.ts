import express from 'express';
import { MemoryStorage } from '../config/memoryStorage';
import { logger } from '../utils/logger';

const router = express.Router();
const storage = MemoryStorage.getInstance();

// 获取所有鉴定记录
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      componentPartNumber,
      manufacturer,
      overallStatus,
      qualityLevel,
      isValid
    } = req.query;

    const query: any = {};
    
    if (componentPartNumber) {
      query.componentPartNumber = componentPartNumber;
    }
    
    if (manufacturer) {
      query.manufacturer = manufacturer;
    }
    
    if (overallStatus) {
      query.overallStatus = overallStatus;
    }
    
    if (qualityLevel) {
      query.qualityLevel = qualityLevel;
    }
    
    if (isValid !== undefined) {
      query.isValid = isValid === 'true';
    }

    // 搜索鉴定记录
    const allIdentifications = storage.searchIdentifications(query);
    
    // 排序 - 确保createdAt是Date对象
    allIdentifications.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || Date.now());
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || Date.now());
      return dateB.getTime() - dateA.getTime();
    });
    
    // 分页
    const skip = (Number(page) - 1) * Number(limit);
    const identifications = allIdentifications.slice(skip, skip + Number(limit));
    const total = allIdentifications.length;
    
    res.json({
      success: true,
      data: {
        identifications,
        pagination: {
          current: Number(page),
          pageSize: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
    
  } catch (error) {
    logger.error('获取鉴定记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取鉴定记录失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 根据ID获取鉴定记录详情
router.get('/:id', async (req, res) => {
  try {
    const identification = storage.getIdentificationById(req.params.id);
    
    if (!identification) {
      return res.status(404).json({
        success: false,
        message: '鉴定记录不存在'
      });
    }
    
    return res.json({
      success: true,
      data: identification
    });
    
  } catch (error) {
    logger.error('获取鉴定记录详情失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取鉴定记录详情失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 创建新的鉴定记录
router.post('/', async (req, res) => {
  try {
    const identificationData = req.body;
    
    // 自动计算试验结果汇总
    if (identificationData.testItems && identificationData.testItems.length > 0) {
      const totalItems = identificationData.testItems.length;
      const passedItems = identificationData.testItems.filter((item: any) => item.status === 'pass').length;
      const failedItems = identificationData.testItems.filter((item: any) => item.status === 'fail').length;
      const conditionalItems = identificationData.testItems.filter((item: any) => item.status === 'conditional').length;
      
      // 确定整体状态
      let overallStatus: 'qualified' | 'unqualified' | 'conditional';
      if (failedItems > 0) {
        overallStatus = 'unqualified';
      } else if (conditionalItems > 0) {
        overallStatus = 'conditional';
      } else {
        overallStatus = 'qualified';
      }
      
      identificationData.testResults = {
        totalItems,
        passedItems,
        failedItems,
        conditionalItems,
        overallStatus
      };
    }
    
    const identification = storage.createIdentification(identificationData);
    
    logger.info(`新建鉴定记录: ${identification.identificationId}`);
    
    res.status(201).json({
      success: true,
      data: identification,
      message: '鉴定记录创建成功'
    });
    
  } catch (error) {
    logger.error('创建鉴定记录失败:', error);
    res.status(400).json({
      success: false,
      message: '创建鉴定记录失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 更新鉴定记录
router.put('/:id', async (req, res) => {
  try {
    const identificationData = req.body;
    
    // 重新计算试验结果汇总
    if (identificationData.testItems && identificationData.testItems.length > 0) {
      const totalItems = identificationData.testItems.length;
      const passedItems = identificationData.testItems.filter((item: any) => item.status === 'pass').length;
      const failedItems = identificationData.testItems.filter((item: any) => item.status === 'fail').length;
      const conditionalItems = identificationData.testItems.filter((item: any) => item.status === 'conditional').length;
      
      let overallStatus: 'qualified' | 'unqualified' | 'conditional';
      if (failedItems > 0) {
        overallStatus = 'unqualified';
      } else if (conditionalItems > 0) {
        overallStatus = 'conditional';
      } else {
        overallStatus = 'qualified';
      }
      
      identificationData.testResults = {
        totalItems,
        passedItems,
        failedItems,
        conditionalItems,
        overallStatus
      };
    }
    
    const identification = storage.updateIdentification(req.params.id, identificationData);
    
    if (!identification) {
      return res.status(404).json({
        success: false,
        message: '鉴定记录不存在'
      });
    }
    
    logger.info(`更新鉴定记录: ${identification.identificationId}`);
    
    return res.json({
      success: true,
      data: identification,
      message: '鉴定记录更新成功'
    });
    
  } catch (error) {
    logger.error('更新鉴定记录失败:', error);
    return res.status(400).json({
      success: false,
      message: '更新鉴定记录失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 删除鉴定记录
router.delete('/:id', async (req, res) => {
  try {
    const identification = storage.getIdentificationById(req.params.id);
    
    if (!identification) {
      return res.status(404).json({
        success: false,
        message: '鉴定记录不存在'
      });
    }
    
    const deleted = storage.deleteIdentification(req.params.id);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: '删除失败'
      });
    }
    
    logger.info(`删除鉴定记录: ${identification.identificationId}`);
    
    return res.json({
      success: true,
      message: '鉴定记录删除成功'
    });
    
  } catch (error) {
    logger.error('删除鉴定记录失败:', error);
    return res.status(500).json({
      success: false,
      message: '删除鉴定记录失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 根据器件型号获取鉴定记录
router.get('/component/:partNumber', async (req, res) => {
  try {
    const { partNumber } = req.params;
    const { includeExpired = false } = req.query;
    
    const identifications = storage.getIdentificationsByPartNumber(
      partNumber, 
      includeExpired === 'true'
    );
    
    res.json({
      success: true,
      data: identifications
    });
    
  } catch (error) {
    logger.error('获取器件鉴定记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取器件鉴定记录失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 获取鉴定统计信息
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = storage.getIdentificationStats();
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    logger.error('获取鉴定统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取鉴定统计信息失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router;
