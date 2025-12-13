import { Request, Response } from 'express';
import { ProcurementRequest, Supplier } from '../models';
import { logger } from '../utils/logger';

/**
 * 获取采购请求列表
 * GET /api/procurement/requests
 */
export const getProcurementRequests = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      priority,
      department,
      requestType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};
    
    if (search) {
      query.$or = [
        { requestId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { 'requirements.partNumber': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (department) query.department = department;
    if (requestType) query.requestType = requestType;

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const [requests, total] = await Promise.all([
      ProcurementRequest.find(query)
        .populate('requirements.componentId', 'partNumber manufacturer category')
        .populate('selectedSupplier.supplierId', 'name qualificationLevel')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      ProcurementRequest.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          current: Number(page),
          pageSize: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      },
      message: '采购请求列表获取成功'
    });
  } catch (error) {
    logger.error('获取采购请求列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取采购请求列表失败'
    });
  }
};

/**
 * 创建采购请求
 * POST /api/procurement/requests
 */
export const createProcurementRequest = async (req: Request, res: Response) => {
  try {
    const requestData = req.body;
    
    // 生成请求ID
    const requestCount = await ProcurementRequest.countDocuments();
    const requestId = `PR${new Date().getFullYear()}${String(requestCount + 1).padStart(4, '0')}`;
    
    const request = new ProcurementRequest({
      ...requestData,
      requestId
    });
    
    await request.save();

    res.status(201).json({
      success: true,
      data: request,
      message: '采购请求创建成功'
    });
  } catch (error) {
    logger.error('创建采购请求失败:', error);
    res.status(500).json({
      success: false,
      message: '创建采购请求失败'
    });
  }
};

/**
 * 供应商评估
 * POST /api/procurement/requests/:id/evaluate
 */
export const evaluateSuppliers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { supplierEvaluations } = req.body;

    const request = await ProcurementRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: '采购请求未找到'
      });
    }

    // 更新供应商评估
    for (const evaluation of supplierEvaluations) {
      const supplierIndex = request.suppliers.findIndex(
        s => s.supplierId.toString() === evaluation.supplierId
      );
      
      if (supplierIndex !== -1) {
        request.suppliers[supplierIndex].evaluation = evaluation.evaluation;
        request.suppliers[supplierIndex].status = 'quoted';
      }
    }

    await request.save();

    return res.json({
      success: true,
      data: request,
      message: '供应商评估完成'
    });
  } catch (error) {
    logger.error('供应商评估失败:', error);
    return res.status(500).json({
      success: false,
      message: '供应商评估失败'
    });
  }
};

/**
 * 获取采购统计信息
 * GET /api/procurement/statistics
 */
export const getProcurementStatistics = async (req: Request, res: Response) => {
  try {
    const [
      totalRequests,
      statusDistribution,
      priorityDistribution,
      departmentStats,
      recentRequests,
      budgetStats
    ] = await Promise.all([
      ProcurementRequest.countDocuments(),
      ProcurementRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      ProcurementRequest.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      ProcurementRequest.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      ProcurementRequest.find()
        .populate('requirements.componentId', 'partNumber manufacturer')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('requestId title status priority department createdAt')
        .lean(),
      ProcurementRequest.aggregate([
        {
          $group: {
            _id: null,
            totalBudget: { $sum: '$budget.allocated' },
            averageBudget: { $avg: '$budget.allocated' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total: totalRequests,
        statusDistribution,
        priorityDistribution,
        departmentStats,
        recentRequests,
        budgetStats: budgetStats[0] || { totalBudget: 0, averageBudget: 0, count: 0 }
      },
      message: '采购统计信息获取成功'
    });
  } catch (error) {
    logger.error('获取采购统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取采购统计信息失败'
    });
  }
};
