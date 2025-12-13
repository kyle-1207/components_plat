import { Request, Response } from 'express';
import { RadiationDataService } from '../services/RadiationDataService';
import { logger } from '../utils/logger';

const radiationDataService = new RadiationDataService();

export const listRadiationData = async (req: Request, res: Response) => {
  try {
    const data = await radiationDataService.listRadiationData(req.query);
    res.json({
      success: true,
      data,
      message: '辐照数据获取成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('获取辐照数据失败', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RADIATION_DATA_ERROR',
        message: '获取辐照数据失败，请稍后重试',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
};

export const getRadiationFilterOptions = async (_req: Request, res: Response) => {
  try {
    const options = await radiationDataService.getFilterOptions();
    res.json({
      success: true,
      data: options,
      message: '筛选项获取成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('获取辐照筛选项失败', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RADIATION_FILTER_ERROR',
        message: '获取辐照筛选项失败，请稍后重试',
      },
      timestamp: new Date().toISOString(),
      path: '/api/radiation-data/options',
    });
  }
};


