import { Request, Response } from 'express';
import { DocumentModel } from '../models';
import { logger } from '../utils/logger';

/**
 * 获取文档列表
 * GET /api/documents
 */
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      category,
      accessLevel,
      status,
      sortBy = 'uploadDate',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (accessLevel) query.accessLevel = accessLevel;
    if (status) query.status = status;

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const [documents, total] = await Promise.all([
      DocumentModel.find(query)
        .populate('relatedComponents', 'partNumber manufacturer category')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      DocumentModel.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          current: Number(page),
          pageSize: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      },
      message: '文档列表获取成功'
    });
  } catch (error) {
    logger.error('获取文档列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文档列表失败'
    });
  }
};

/**
 * 根据ID获取文档详情
 * GET /api/documents/:id
 */
export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const document = await DocumentModel.findById(id)
      .populate('relatedComponents', 'partNumber manufacturer category specifications')
      .lean();

    if (!document) {
      return res.status(404).json({
        success: false,
        message: '文档未找到'
      });
    }

    // 增加下载计数
    await DocumentModel.findByIdAndUpdate(id, {
      $inc: { downloadCount: 1 }
    });

    return res.json({
      success: true,
      data: document,
      message: '文档详情获取成功'
    });
  } catch (error) {
    logger.error('获取文档详情失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取文档详情失败'
    });
  }
};

/**
 * 上传文档
 * POST /api/documents
 */
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const documentData = req.body;
    
    const document = new DocumentModel(documentData);
    await document.save();

    res.status(201).json({
      success: true,
      data: document,
      message: '文档上传成功'
    });
  } catch (error) {
    logger.error('上传文档失败:', error);
    res.status(500).json({
      success: false,
      message: '上传文档失败'
    });
  }
};

/**
 * 更新文档
 * PUT /api/documents/:id
 */
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const document = await DocumentModel.findByIdAndUpdate(
      id,
      { ...updateData, lastModified: new Date() },
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: '文档未找到'
      });
    }

    return res.json({
      success: true,
      data: document,
      message: '文档更新成功'
    });
  } catch (error) {
    logger.error('更新文档失败:', error);
    return res.status(500).json({
      success: false,
      message: '更新文档失败'
    });
  }
};

/**
 * 删除文档
 * DELETE /api/documents/:id
 */
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = await DocumentModel.findByIdAndDelete(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: '文档未找到'
      });
    }

    return res.json({
      success: true,
      message: '文档删除成功'
    });
  } catch (error) {
    logger.error('删除文档失败:', error);
    return res.status(500).json({
      success: false,
      message: '删除文档失败'
    });
  }
};

/**
 * 获取文档统计信息
 * GET /api/documents/statistics
 */
export const getDocumentStatistics = async (req: Request, res: Response) => {
  try {
    const [
      totalDocuments,
      typeDistribution,
      categoryDistribution,
      popularDocuments,
      recentDocuments,
      storageStats
    ] = await Promise.all([
      DocumentModel.countDocuments(),
      DocumentModel.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      DocumentModel.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      DocumentModel.find()
        .sort({ downloadCount: -1 })
        .limit(10)
        .select('title type category downloadCount uploadDate')
        .lean(),
      DocumentModel.find()
        .sort({ uploadDate: -1 })
        .limit(10)
        .select('title type category author uploadDate')
        .lean(),
      DocumentModel.aggregate([
        {
          $group: {
            _id: null,
            totalSize: { $sum: '$fileSize' },
            averageSize: { $avg: '$fileSize' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total: totalDocuments,
        typeDistribution,
        categoryDistribution,
        popularDocuments,
        recentDocuments,
        storageStats: storageStats[0] || { totalSize: 0, averageSize: 0, count: 0 }
      },
      message: '文档统计信息获取成功'
    });
  } catch (error) {
    logger.error('获取文档统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文档统计信息失败'
    });
  }
};
