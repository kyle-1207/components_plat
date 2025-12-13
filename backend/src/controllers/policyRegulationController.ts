import { Request, Response } from 'express';
import { PolicyRegulationModel } from '../models/PolicyRegulation';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

/**
 * 获取政策法规列表
 * GET /api/policy-regulations
 */
export const getPolicyRegulations = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      type,
      field,
      status,
      issuer,
      level,
      publishDateFrom,
      publishDateTo,
      effectiveDateFrom,
      effectiveDateTo,
      sortBy = 'publishDate',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};
    
    // 文本搜索
    if (search) {
      query.$text = { $search: search as string };
    }
    
    // 分类过滤
    if (category) query.category = category;
    if (type) query.type = type;
    if (field) query.field = field;
    if (status) query.status = status;
    if (issuer) query.issuer = new RegExp(issuer as string, 'i');
    if (level) query.level = level;

    // 日期范围过滤
    if (publishDateFrom || publishDateTo) {
      query.publishDate = {};
      if (publishDateFrom) query.publishDate.$gte = new Date(publishDateFrom as string);
      if (publishDateTo) query.publishDate.$lte = new Date(publishDateTo as string);
    }

    if (effectiveDateFrom || effectiveDateTo) {
      query.effectiveDate = {};
      if (effectiveDateFrom) query.effectiveDate.$gte = new Date(effectiveDateFrom as string);
      if (effectiveDateTo) query.effectiveDate.$lte = new Date(effectiveDateTo as string);
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const [policies, total] = await Promise.all([
      PolicyRegulationModel.find(query)
        .populate('relatedPolicies', 'title type publishDate')
        .populate('supersededBy', 'title publishDate')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      PolicyRegulationModel.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        policies,
        pagination: {
          current: Number(page),
          pageSize: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      },
      message: '政策法规列表获取成功'
    });
  } catch (error) {
    logger.error('获取政策法规列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取政策法规列表失败'
    });
  }
};

/**
 * 根据ID获取政策法规详情
 * GET /api/policy-regulations/:id
 */
export const getPolicyRegulationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的政策法规ID'
      });
    }

    const policy = await PolicyRegulationModel.findById(id)
      .populate('relatedPolicies', 'title type category publishDate level')
      .populate('supersededBy', 'title publishDate')
      .populate('supersedes', 'title publishDate')
      .lean();

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: '政策法规未找到'
      });
    }

    // 增加查看计数
    await PolicyRegulationModel.findByIdAndUpdate(id, {
      $inc: { viewCount: 1 }
    });

    return res.json({
      success: true,
      data: policy,
      message: '政策法规详情获取成功'
    });
  } catch (error) {
    logger.error('获取政策法规详情失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取政策法规详情失败'
    });
  }
};

/**
 * 创建政策法规
 * POST /api/policy-regulations
 */
export const createPolicyRegulation = async (req: Request, res: Response) => {
  try {
    const policyData = req.body;
    
    const policy = new PolicyRegulationModel(policyData);
    await policy.save();

    res.status(201).json({
      success: true,
      data: policy,
      message: '政策法规创建成功'
    });
  } catch (error) {
    logger.error('创建政策法规失败:', error);
    res.status(500).json({
      success: false,
      message: '创建政策法规失败'
    });
  }
};

/**
 * 更新政策法规
 * PUT /api/policy-regulations/:id
 */
export const updatePolicyRegulation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的政策法规ID'
      });
    }

    const policy = await PolicyRegulationModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: '政策法规未找到'
      });
    }

    return res.json({
      success: true,
      data: policy,
      message: '政策法规更新成功'
    });
  } catch (error) {
    logger.error('更新政策法规失败:', error);
    return res.status(500).json({
      success: false,
      message: '更新政策法规失败'
    });
  }
};

/**
 * 删除政策法规
 * DELETE /api/policy-regulations/:id
 */
export const deletePolicyRegulation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的政策法规ID'
      });
    }

    const policy = await PolicyRegulationModel.findByIdAndDelete(id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: '政策法规未找到'
      });
    }

    return res.json({
      success: true,
      message: '政策法规删除成功'
    });
  } catch (error) {
    logger.error('删除政策法规失败:', error);
    return res.status(500).json({
      success: false,
      message: '删除政策法规失败'
    });
  }
};

/**
 * 获取政策法规统计信息
 * GET /api/policy-regulations/statistics
 */
export const getPolicyRegulationStatistics = async (req: Request, res: Response) => {
  try {
    const [
      totalPolicies,
      effectivePolicies,
      categoryDistribution,
      typeDistribution,
      fieldDistribution,
      levelDistribution,
      recentPolicies,
      popularPolicies,
      expiringPolicies
    ] = await Promise.all([
      PolicyRegulationModel.countDocuments(),
      PolicyRegulationModel.countDocuments({ status: 'effective' }),
      PolicyRegulationModel.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      PolicyRegulationModel.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      PolicyRegulationModel.aggregate([
        { $group: { _id: '$field', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      PolicyRegulationModel.aggregate([
        { $group: { _id: '$level', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      PolicyRegulationModel.find({ status: 'effective' })
        .sort({ publishDate: -1 })
        .limit(10)
        .select('title type category field publishDate level')
        .lean(),
      PolicyRegulationModel.find({ status: 'effective' })
        .sort({ viewCount: -1 })
        .limit(10)
        .select('title type category field viewCount downloadCount')
        .lean(),
      PolicyRegulationModel.find({
        status: 'effective',
        expiryDate: {
          $exists: true,
          $gte: new Date(),
          $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90天内到期
        }
      })
        .sort({ expiryDate: 1 })
        .select('title expiryDate')
        .lean()
    ]);

    res.json({
      success: true,
      data: {
        total: totalPolicies,
        effective: effectivePolicies,
        categoryDistribution,
        typeDistribution,
        fieldDistribution,
        levelDistribution,
        recentPolicies,
        popularPolicies,
        expiringPolicies
      },
      message: '政策法规统计信息获取成功'
    });
  } catch (error) {
    logger.error('获取政策法规统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取政策法规统计信息失败'
    });
  }
};

/**
 * 根据领域获取有效政策法规
 * GET /api/policy-regulations/by-field/:field
 */
export const getPolicyRegulationsByField = async (req: Request, res: Response) => {
  try {
    const { field } = req.params;
    const { limit = 50 } = req.query;

      const policies = await PolicyRegulationModel.find({ 
    $or: [
      { title: { $regex: field, $options: 'i' } },
      { category: { $regex: field, $options: 'i' } },
      { tags: { $in: [field] } }
    ]
  })
    .limit(Number(limit))
    .select('title type category issuer publishDate level summary tags');

    res.json({
      success: true,
      data: policies,
      message: `${field}领域政策法规获取成功`
    });
  } catch (error) {
    logger.error('根据领域获取政策法规失败:', error);
    res.status(500).json({
      success: false,
      message: '根据领域获取政策法规失败'
    });
  }
};

/**
 * 获取最近更新的政策法规
 * GET /api/policy-regulations/recent-updates
 */
export const getRecentUpdates = async (req: Request, res: Response) => {
  try {
    const { days = 30, limit = 20 } = req.query;

    const policies = await PolicyRegulationModel.find({
    updatedAt: { $gte: new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000) }
  })
      .limit(Number(limit))
      .select('title type category field publishDate updatedAt level');

    res.json({
      success: true,
      data: policies,
      message: '最近更新的政策法规获取成功'
    });
  } catch (error) {
    logger.error('获取最近更新的政策法规失败:', error);
    res.status(500).json({
      success: false,
      message: '获取最近更新的政策法规失败'
    });
  }
};

/**
 * 搜索政策法规
 * POST /api/policy-regulations/search
 */
export const searchPolicyRegulations = async (req: Request, res: Response) => {
  try {
    const {
      keyword,
      filters = {},
      page = 1,
      limit = 20,
      sortBy = 'relevance'
    } = req.body;

    let query: any = {};

    // 关键词搜索
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // 应用过滤器
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        if (key === 'dateRange') {
          if (filters[key].start || filters[key].end) {
            query.publishDate = {};
            if (filters[key].start) query.publishDate.$gte = new Date(filters[key].start);
            if (filters[key].end) query.publishDate.$lte = new Date(filters[key].end);
          }
        } else if (key === 'tags') {
          query.tags = { $in: filters[key] };
        } else {
          query[key] = filters[key];
        }
      }
    });

    // 排序
    let sort: any = {};
    if (sortBy === 'relevance' && keyword) {
      sort = { score: { $meta: 'textScore' } };
    } else if (sortBy === 'publishDate') {
      sort = { publishDate: -1 };
    } else if (sortBy === 'level') {
      sort = { level: -1, publishDate: -1 };
    } else {
      sort = { [sortBy]: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [policies, total] = await Promise.all([
      PolicyRegulationModel.find(query, keyword ? { score: { $meta: 'textScore' } } : {})
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('relatedPolicies', 'title type')
        .lean(),
      PolicyRegulationModel.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        policies,
        pagination: {
          current: Number(page),
          pageSize: Number(limit),
          total,
          totalPages
        },
        searchInfo: {
          keyword,
          filters,
          total
        }
      },
      message: '政策法规搜索成功'
    });
  } catch (error) {
    logger.error('搜索政策法规失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索政策法规失败'
    });
  }
};

/**
 * 添加政策法规反馈
 * POST /api/policy-regulations/:id/feedback
 */
export const addPolicyFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = (req as any).user?.id; // 假设从认证中间件获取用户ID

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: '无效的政策法规ID'
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户未认证'
      });
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: '评分必须在1-5之间'
      });
      return;
    }

    const policy = await PolicyRegulationModel.findById(id);
    if (!policy) {
      res.status(404).json({
        success: false,
        message: '政策法规未找到'
      });
      return;
    }

    // 添加反馈到 feedback 数组
    policy.feedback.push({
      userId: new mongoose.Types.ObjectId(userId),
      rating,
      comment: comment || '',
      date: new Date()
    });
    await policy.save();

    res.json({
      success: true,
      message: '反馈添加成功'
    });
  } catch (error) {
    logger.error('添加政策法规反馈失败:', error);
    res.status(500).json({
      success: false,
      message: '添加政策法规反馈失败'
    });
  }
};

/**
 * 记录下载
 * POST /api/policy-regulations/:id/download
 */
export const recordDownload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: '无效的政策法规ID'
      });
      return;
    }

    const policy = await PolicyRegulationModel.findById(id);
    if (!policy) {
      res.status(404).json({
        success: false,
        message: '政策法规未找到'
      });
      return;
    }

    // 增加下载次数
    policy.downloadCount = (policy.downloadCount || 0) + 1;
    await policy.save();

    res.json({
      success: true,
      message: '下载记录成功'
    });
  } catch (error) {
    logger.error('记录下载失败:', error);
    res.status(500).json({
      success: false,
      message: '记录下载失败'
    });
  }
};
