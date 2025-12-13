import { Request, Response } from 'express';
import { TestRecord, Component } from '../models';
import { logger } from '../utils/logger';

/**
 * 获取测试记录列表
 * GET /api/tests
 */
export const getTestRecords = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      testType,
      status,
      priority,
      componentId,
      sortBy = 'testDate.start',
      sortOrder = 'desc'
    } = req.query;

    // 构建查询条件
    const query: any = {};
    
    if (search) {
      query.$or = [
        { testId: { $regex: search, $options: 'i' } },
        { testStandard: { $regex: search, $options: 'i' } },
        { 'testLaboratory.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (testType) {
      query.testType = testType;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (componentId) {
      query.componentId = componentId;
    }

    // 构建排序
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // 分页计算
    const skip = (Number(page) - 1) * Number(limit);

    // 查询数据
    const [tests, total] = await Promise.all([
      TestRecord.find(query)
        .populate('componentId', 'partNumber manufacturer category')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      TestRecord.countDocuments(query)
    ]);

    // 计算分页信息
    const totalPages = Math.ceil(total / Number(limit));
    const hasNext = Number(page) < totalPages;
    const hasPrev = Number(page) > 1;

    res.json({
      success: true,
      data: {
        tests,
        pagination: {
          current: Number(page),
          pageSize: Number(limit),
          total,
          totalPages,
          hasNext,
          hasPrev
        }
      },
      message: '测试记录列表获取成功'
    });
  } catch (error) {
    logger.error('获取测试记录列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取测试记录列表失败',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * 根据ID获取测试记录详情
 * GET /api/tests/:id
 */
export const getTestRecordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const test = await TestRecord.findById(id)
      .populate('componentId', 'partNumber manufacturer category specifications')
      .lean();

    if (!test) {
      return res.status(404).json({
        success: false,
        message: '测试记录未找到'
      });
    }

    return res.json({
      success: true,
      data: test,
      message: '测试记录详情获取成功'
    });
  } catch (error) {
    logger.error('获取测试记录详情失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取测试记录详情失败',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * 创建测试记录
 * POST /api/tests
 */
export const createTestRecord = async (req: Request, res: Response) => {
  try {
    const testData = req.body;
    
    // 生成测试ID
    const testCount = await TestRecord.countDocuments();
    const testId = `TEST${new Date().getFullYear()}${String(testCount + 1).padStart(4, '0')}`;
    
    const test = new TestRecord({
      ...testData,
      testId
    });
    
    await test.save();

    res.status(201).json({
      success: true,
      data: test,
      message: '测试记录创建成功'
    });
  } catch (error) {
    logger.error('创建测试记录失败:', error);
    res.status(500).json({
      success: false,
      message: '创建测试记录失败',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * 更新测试记录
 * PUT /api/tests/:id
 */
export const updateTestRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const test = await TestRecord.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: '测试记录未找到'
      });
    }

    return res.json({
      success: true,
      data: test,
      message: '测试记录更新成功'
    });
  } catch (error) {
    logger.error('更新测试记录失败:', error);
    return res.status(500).json({
      success: false,
      message: '更新测试记录失败',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * 完成测试
 * POST /api/tests/:id/complete
 */
export const completeTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { testResults, reportFile, certificateFile } = req.body;

    const test = await TestRecord.findById(id);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: '测试记录未找到'
      });
    }

    // 更新测试状态为完成
    test.status = 'completed';
    test.testDate.end = new Date();
    test.testResults = testResults;
    
    if (reportFile) {
      test.reportFile = reportFile;
    }
    
    if (certificateFile) {
      test.certificateFile = certificateFile;
    }
    


    await test.save();

    return res.json({
      success: true,
      data: test,
      message: '测试完成'
    });
  } catch (error) {
    logger.error('完成测试失败:', error);
    return res.status(500).json({
      success: false,
      message: '完成测试失败',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * 获取测试统计信息
 * GET /api/tests/statistics
 */
export const getTestStatistics = async (req: Request, res: Response) => {
  try {
    const [
      totalTests,
      statusDistribution,
      typeDistribution,
      passRate,
      recentTests,
      laboratoryStats
    ] = await Promise.all([
      TestRecord.countDocuments(),
      TestRecord.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      TestRecord.aggregate([
        { $group: { _id: '$testType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      TestRecord.aggregate([
        {
          $match: {
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            passed: {
              $sum: {
                $cond: [{ $eq: ['$testResults.status', 'pass'] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            total: 1,
            passed: 1,
            rate: {
              $cond: [
                { $gt: ['$total', 0] },
                { $multiply: [{ $divide: ['$passed', '$total'] }, 100] },
                0
              ]
            }
          }
        }
      ]),
      TestRecord.find()
        .populate('componentId', 'partNumber manufacturer')
        .sort({ 'testDate.start': -1 })
        .limit(10)
        .select('testId testType status testDate componentId testLaboratory')
        .lean(),
      TestRecord.aggregate([
        { $group: { _id: '$testLaboratory.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total: totalTests,
        statusDistribution,
        typeDistribution,
        passRate: passRate[0] || { total: 0, passed: 0, rate: 0 },
        recentTests,
        laboratoryStats
      },
      message: '测试统计信息获取成功'
    });
  } catch (error) {
    logger.error('获取测试统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取测试统计信息失败',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * 获取辐照测试数据
 * GET /api/tests/radiation
 */
export const getRadiationTests = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      radiationType,
      componentId
    } = req.query;

    const query: any = {
      testType: 'radiation'
    };

    if (radiationType) {
      query['testConditions.radiation.type'] = radiationType;
    }

    if (componentId) {
      query.componentId = componentId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [tests, total] = await Promise.all([
      TestRecord.find(query)
        .populate('componentId', 'partNumber manufacturer category')
        .sort({ 'testDate.start': -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      TestRecord.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        tests,
        pagination: {
          current: Number(page),
          pageSize: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      },
      message: '辐照测试数据获取成功'
    });
  } catch (error) {
    logger.error('获取辐照测试数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取辐照测试数据失败',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
