import { Request, Response } from 'express';
import { FunctionalUnit, DigitalModel } from '../models';
import { logger } from '../utils/logger';

/**
 * 获取功能单元列表
 * GET /api/application-support/functional-units
 */
export const getFunctionalUnits = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      status,
      sortBy = 'downloadCount',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    if (category) query.category = category;
    if (status) query.status = status;

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const [units, total] = await Promise.all([
      FunctionalUnit.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      FunctionalUnit.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        units,
        pagination: {
          current: Number(page),
          pageSize: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      },
      message: '功能单元列表获取成功'
    });
  } catch (error) {
    logger.error('获取功能单元列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取功能单元列表失败'
    });
  }
};

/**
 * 创建功能单元
 * POST /api/application-support/functional-units
 */
export const createFunctionalUnit = async (req: Request, res: Response) => {
  try {
    const unitData = req.body;
    
    // 生成单元ID
    const unitCount = await FunctionalUnit.countDocuments();
    const unitId = `FU${new Date().getFullYear()}${String(unitCount + 1).padStart(4, '0')}`;
    
    const unit = new FunctionalUnit({
      ...unitData,
      unitId
    });
    
    await unit.save();

    res.status(201).json({
      success: true,
      data: unit,
      message: '功能单元创建成功'
    });
  } catch (error) {
    logger.error('创建功能单元失败:', error);
    res.status(500).json({
      success: false,
      message: '创建功能单元失败'
    });
  }
};

/**
 * 获取数字模型列表
 * GET /api/application-support/digital-models
 */
export const getDigitalModels = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      modelType,
      status,
      componentId,
      sortBy = 'downloadCount',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    if (modelType) query.modelType = modelType;
    if (status) query.status = status;
    if (componentId) query.componentId = componentId;

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const [models, total] = await Promise.all([
      DigitalModel.find(query)
        .populate('componentId', 'partNumber manufacturer category')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      DigitalModel.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        models,
        pagination: {
          current: Number(page),
          pageSize: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      },
      message: '数字模型列表获取成功'
    });
  } catch (error) {
    logger.error('获取数字模型列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数字模型列表失败'
    });
  }
};

/**
 * 创建数字模型
 * POST /api/application-support/digital-models
 */
export const createDigitalModel = async (req: Request, res: Response) => {
  try {
    const modelData = req.body;
    
    // 生成模型ID
    const modelCount = await DigitalModel.countDocuments();
    const modelId = `DM${new Date().getFullYear()}${String(modelCount + 1).padStart(4, '0')}`;
    
    const model = new DigitalModel({
      ...modelData,
      modelId
    });
    
    await model.save();

    res.status(201).json({
      success: true,
      data: model,
      message: '数字模型创建成功'
    });
  } catch (error) {
    logger.error('创建数字模型失败:', error);
    res.status(500).json({
      success: false,
      message: '创建数字模型失败'
    });
  }
};

/**
 * 下载功能单元
 * GET /api/application-support/functional-units/:id/download
 */
export const downloadFunctionalUnit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const unit = await FunctionalUnit.findById(id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: '功能单元未找到'
      });
    }

    // 增加下载计数
    unit.downloadCount += 1;
    await unit.save();

    return res.json({
      success: true,
      data: {
        downloadUrl: unit.circuit.schematicUrl,
        designFiles: unit.designFiles
      },
      message: '功能单元下载信息获取成功'
    });
  } catch (error) {
    logger.error('下载功能单元失败:', error);
    return res.status(500).json({
      success: false,
      message: '下载功能单元失败'
    });
  }
};

/**
 * 下载数字模型
 * GET /api/application-support/digital-models/:id/download
 */
export const downloadDigitalModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const model = await DigitalModel.findById(id);
    if (!model) {
      return res.status(404).json({
        success: false,
        message: '数字模型未找到'
      });
    }

    // 增加下载计数
    model.downloadCount += 1;
    await model.save();

    return res.json({
      success: true,
      data: {
        modelFiles: model.modelFiles,
        parameters: model.parameters,
        conditions: model.conditions
      },
      message: '数字模型下载信息获取成功'
    });
  } catch (error) {
    logger.error('下载数字模型失败:', error);
    return res.status(500).json({
      success: false,
      message: '下载数字模型失败'
    });
  }
};

/**
 * 获取应用支持统计信息
 * GET /api/application-support/statistics
 */
export const getApplicationSupportStatistics = async (req: Request, res: Response) => {
  try {
    const [
      functionalUnitStats,
      digitalModelStats,
      popularUnits,
      popularModels
    ] = await Promise.all([
      FunctionalUnit.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
            totalDownloads: { $sum: '$downloadCount' },
            avgRating: { $avg: '$rating.average' }
          }
        }
      ]),
      DigitalModel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            totalDownloads: { $sum: '$downloadCount' }
          }
        }
      ]),
      FunctionalUnit.find()
        .sort({ downloadCount: -1 })
        .limit(10)
        .select('name category downloadCount rating')
        .lean(),
      DigitalModel.find()
        .populate('componentId', 'partNumber manufacturer')
        .sort({ downloadCount: -1 })
        .limit(10)
        .select('name modelType downloadCount componentId')
        .lean()
    ]);

    res.json({
      success: true,
      data: {
        functionalUnits: functionalUnitStats[0] || { total: 0, published: 0, totalDownloads: 0, avgRating: 0 },
        digitalModels: digitalModelStats[0] || { total: 0, active: 0, totalDownloads: 0 },
        popularUnits,
        popularModels
      },
      message: '应用支持统计信息获取成功'
    });
  } catch (error) {
    logger.error('获取应用支持统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取应用支持统计信息失败'
    });
  }
};
