import { Request, Response } from 'express';
import { Standard } from '../models';
import { logger } from '../utils/logger';

/**
 * 获取标准列表
 * GET /api/standards
 */
export const getStandards = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      status,
      sortBy = 'publishDate',
      sortOrder = 'desc'
    } = req.query;

    // 构建查询条件
    const query: any = {};
    
    if (search) {
      query.$or = [
        { standardCode: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      query.standardType = type;
    }
    
    if (status) {
      query.status = status;
    }

    // 构建排序
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // 分页计算
    const skip = (Number(page) - 1) * Number(limit);

    // 查询数据
    const [standards, total] = await Promise.all([
      Standard.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Standard.countDocuments(query)
    ]);

    // 计算分页信息
    const totalPages = Math.ceil(total / Number(limit));
    const hasNext = Number(page) < totalPages;
    const hasPrev = Number(page) > 1;

    res.json({
      success: true,
      data: {
        standards,
        pagination: {
          current: Number(page),
          pageSize: Number(limit),
          total,
          totalPages,
          hasNext,
          hasPrev
        }
      },
      message: '标准列表获取成功'
    });
  } catch (error) {
    logger.error('获取标准列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取标准列表失败',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * 根据ID获取标准详情
 * GET /api/standards/:id
 */
export const getStandardById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const standard = await Standard.findById(id)
      .populate('relatedComponents', 'partNumber manufacturer category')
      .lean();

    if (!standard) {
      return res.status(404).json({
        success: false,
        message: '标准未找到'
      });
    }

    return res.json({
      success: true,
      data: standard,
      message: '标准详情获取成功'
    });
  } catch (error) {
    logger.error('获取标准详情失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取标准详情失败',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * 创建标准
 * POST /api/standards
 */
export const createStandard = async (req: Request, res: Response) => {
  try {
    const standardData = req.body;
    
    // 检查标准编号是否已存在
    const existingStandard = await Standard.findOne({
      standardCode: standardData.standardCode
    });

    if (existingStandard) {
      return res.status(409).json({
        success: false,
        message: '标准编号已存在'
      });
    }

    const standard = new Standard(standardData);
    await standard.save();

    return res.status(201).json({
      success: true,
      data: standard,
      message: '标准创建成功'
    });
  } catch (error) {
    logger.error('创建标准失败:', error);
    return res.status(500).json({
      success: false,
      message: '创建标准失败',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * 更新标准
 * PUT /api/standards/:id
 */
export const updateStandard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const standard = await Standard.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!standard) {
      return res.status(404).json({
        success: false,
        message: '标准未找到'
      });
    }

    return res.json({
      success: true,
      data: standard,
      message: '标准更新成功'
    });
  } catch (error) {
    logger.error('更新标准失败:', error);
    return res.status(500).json({
      success: false,
      message: '更新标准失败',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * 删除标准
 * DELETE /api/standards/:id
 */
export const deleteStandard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const standard = await Standard.findByIdAndDelete(id);

    if (!standard) {
      return res.status(404).json({
        success: false,
        message: '标准未找到'
      });
    }

    return res.json({
      success: true,
      message: '标准删除成功'
    });
  } catch (error) {
    logger.error('删除标准失败:', error);
    return res.status(500).json({
      success: false,
      message: '删除标准失败',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * 标准对比分析
 * POST /api/standards/compare
 */
export const compareStandards = async (req: Request, res: Response) => {
  try {
    const { standardIds } = req.body;

    if (!Array.isArray(standardIds) || standardIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: '至少需要选择两个标准进行对比'
      });
    }

    const standards = await Standard.find({
      _id: { $in: standardIds }
    }).lean();

    if (standards.length !== standardIds.length) {
      return res.status(404).json({
        success: false,
        message: '部分标准未找到'
      });
    }

    // 简单的对比分析
    const comparison = {
      standards,
      analysis: {
        commonFields: [] as string[],
        differences: [] as string[],
        recommendations: [] as string[]
      }
    };

    // 这里可以添加更复杂的对比逻辑
    if (standards.length > 0) {
      const firstStandard = standards[0];
      comparison.analysis.recommendations.push(
        `对比了 ${standards.length} 个标准`,
        `主要标准类型: ${firstStandard.standardType}`,
        '建议根据具体应用场景选择合适的标准'
      );
    }

    return res.json({
      success: true,
      data: comparison,
      message: '标准对比分析完成'
    });
  } catch (error) {
    logger.error('标准对比分析失败:', error);
    return res.status(500).json({
      success: false,
      message: '标准对比分析失败',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * 获取标准统计信息
 * GET /api/standards/statistics
 */
export const getStandardStatistics = async (req: Request, res: Response) => {
  try {
    const [
      totalCount,
      typeDistribution,
      statusDistribution,
      recentStandards
    ] = await Promise.all([
      Standard.countDocuments(),
      Standard.aggregate([
        { $group: { _id: '$standardType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Standard.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Standard.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('standardCode title standardType status createdAt')
        .lean()
    ]);

    res.json({
      success: true,
      data: {
        total: totalCount,
        typeDistribution,
        statusDistribution,
        recentStandards
      },
      message: '标准统计信息获取成功'
    });
  } catch (error) {
    logger.error('获取标准统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取标准统计信息失败',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
