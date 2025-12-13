import { Request, Response } from 'express';
import {
  SelectionList,
  SelectionItem,
  SelectionAnalysis,
  CreateSelectionListRequest,
  UpdateSelectionListRequest,
  CreateSelectionItemRequest,
  UpdateSelectionItemRequest,
  SelectionListQuery,
  BulkSelectionOperation,
  SelectionCriteria
} from '../types/selection';

// 模拟数据存储
let selectionLists: SelectionList[] = [
  {
    id: 'list-001',
    name: '卫星通信系统选型',
    description: '新一代卫星通信系统关键器件选型清单',
    projectId: 'proj-001',
    projectName: '北斗三号后续工程',
    status: 'in_review',
    priority: 'high',
    items: [
      {
        id: 'item-001',
        componentId: 'comp-001',
        componentName: '高频功率放大器',
        componentType: '射频器件',
        specification: 'Ka频段 100W 线性放大器',
        quantity: 12,
        unit: '个',
        priority: 'high',
        status: 'selected',
        estimatedCost: 150000,
        actualCost: 145000,
        leadTime: 120,
        supplierId: 'supplier-001',
        supplierName: '中电科技集团',
        alternativeSuppliers: [
          {
            supplierId: 'supplier-002',
            supplierName: '航天科工集团',
            price: 155000,
            leadTime: 110,
            qualificationLevel: 'A'
          }
        ],
        technicalRequirements: ['频率范围20-30GHz', '输出功率≥100W', '效率≥45%'],
        qualityRequirements: ['航天级可靠性', '真空热循环试验', '辐照试验'],
        notes: '需要进行EMC测试',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        createdBy: 'user-001',
        lastModifiedBy: 'user-002'
      },
      {
        id: 'item-002',
        componentId: 'comp-002',
        componentName: '低噪声放大器',
        componentType: '射频器件',
        specification: 'X频段 低噪声系数<1.5dB',
        quantity: 24,
        unit: '个',
        priority: 'medium',
        status: 'pending',
        estimatedCost: 45000,
        leadTime: 90,
        alternativeSuppliers: [
          {
            supplierId: 'supplier-003',
            supplierName: '中科院微电子所',
            price: 42000,
            leadTime: 95,
            qualificationLevel: 'A'
          },
          {
            supplierId: 'supplier-004',
            supplierName: '海特高新',
            price: 48000,
            leadTime: 85,
            qualificationLevel: 'B'
          }
        ],
        technicalRequirements: ['频率范围8-12GHz', '噪声系数≤1.5dB', '增益≥20dB'],
        qualityRequirements: ['宇航级筛选', '长期贮存试验'],
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
        createdBy: 'user-001',
        lastModifiedBy: 'user-001'
      }
    ],
    totalEstimatedCost: 1275000,
    totalActualCost: 145000,
    approvalStatus: 'pending',
    deadline: new Date('2024-06-30'),
    tags: ['卫星通信', '射频器件', '高优先级'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'user-001',
    lastModifiedBy: 'user-002'
  },
  {
    id: 'list-002',
    name: '载荷计算机选型',
    description: '星载计算机及相关处理器件选型',
    projectId: 'proj-002',
    projectName: '深空探测任务',
    status: 'draft',
    priority: 'medium',
    items: [
      {
        id: 'item-003',
        componentId: 'comp-003',
        componentName: '星载处理器',
        componentType: '计算器件',
        specification: 'RISC-V架构 抗辐照加固',
        quantity: 6,
        unit: '个',
        priority: 'high',
        status: 'pending',
        estimatedCost: 280000,
        leadTime: 180,
        alternativeSuppliers: [
          {
            supplierId: 'supplier-005',
            supplierName: '中科院计算所',
            price: 275000,
            leadTime: 185,
            qualificationLevel: 'A'
          }
        ],
        technicalRequirements: ['抗辐照总剂量>100krad', '单粒子效应免疫', '工作温度-55~125°C'],
        qualityRequirements: ['空间级可靠性', '质子辐照试验', '重离子试验'],
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
        createdBy: 'user-003',
        lastModifiedBy: 'user-003'
      }
    ],
    totalEstimatedCost: 1680000,
    totalActualCost: 0,
    approvalStatus: 'pending',
    deadline: new Date('2024-09-30'),
    tags: ['深空探测', '计算器件', '抗辐照'],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    createdBy: 'user-003',
    lastModifiedBy: 'user-003'
  }
];

let nextListId = 3;
let nextItemId = 4;

/**
 * 获取选型清单列表
 */
export const getSelectionLists = async (req: Request, res: Response) => {
  try {
    const query: SelectionListQuery = req.query as any;
    const {
      page = 1,
      limit = 10,
      search,
      status,
      priority,
      projectId,
      createdBy,
      tag,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = query;

    let filteredLists = [...selectionLists];

    // 搜索过滤
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLists = filteredLists.filter(list =>
        list.name.toLowerCase().includes(searchLower) ||
        list.description.toLowerCase().includes(searchLower) ||
        list.projectName.toLowerCase().includes(searchLower)
      );
    }

    // 状态过滤
    if (status) {
      filteredLists = filteredLists.filter(list => list.status === status);
    }

    // 优先级过滤
    if (priority) {
      filteredLists = filteredLists.filter(list => list.priority === priority);
    }

    // 项目过滤
    if (projectId) {
      filteredLists = filteredLists.filter(list => list.projectId === projectId);
    }

    // 创建者过滤
    if (createdBy) {
      filteredLists = filteredLists.filter(list => list.createdBy === createdBy);
    }

    // 标签过滤
    if (tag) {
      filteredLists = filteredLists.filter(list => list.tags.includes(tag));
    }

    // 日期范围过滤
    if (dateFrom) {
      filteredLists = filteredLists.filter(list => list.createdAt >= new Date(dateFrom));
    }
    if (dateTo) {
      filteredLists = filteredLists.filter(list => list.createdAt <= new Date(dateTo));
    }

    // 排序
    filteredLists.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'deadline':
          aValue = a.deadline ? a.deadline.getTime() : 0;
          bValue = b.deadline ? b.deadline.getTime() : 0;
          break;
        case 'totalCost':
          aValue = a.totalEstimatedCost;
          bValue = b.totalEstimatedCost;
          break;
        default:
          aValue = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt || Date.now()).getTime();
          bValue = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt || Date.now()).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // 分页
    const total = filteredLists.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLists = filteredLists.slice(startIndex, endIndex);

    return res.json({
      success: true,
      data: {
        lists: paginatedLists,
        pagination: {
          current: page,
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '获取选型清单列表失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 根据ID获取选型清单详情
 */
export const getSelectionListById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const list = selectionLists.find(l => l.id === id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: '选型清单不存在'
      });
    }

    return res.json({
      success: true,
      data: list
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '获取选型清单详情失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 创建新的选型清单
 */
export const createSelectionList = async (req: Request, res: Response) => {
  try {
    const createData: CreateSelectionListRequest = req.body;
    
    const newList: SelectionList = {
      id: `list-${String(nextListId++).padStart(3, '0')}`,
      name: createData.name,
      description: createData.description,
      projectId: createData.projectId,
      projectName: createData.projectName,
      status: 'draft',
      priority: createData.priority,
      items: [],
      totalEstimatedCost: 0,
      totalActualCost: 0,
      approvalStatus: 'pending',
      deadline: createData.deadline,
      tags: createData.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user', // 实际应用中从认证信息获取
      lastModifiedBy: 'current-user'
    };

    selectionLists.push(newList);

    return res.status(201).json({
      success: true,
      data: newList,
      message: '选型清单创建成功'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '创建选型清单失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 更新选型清单
 */
export const updateSelectionList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateSelectionListRequest = req.body;
    
    const listIndex = selectionLists.findIndex(l => l.id === id);
    if (listIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '选型清单不存在'
      });
    }

    const updatedList = {
      ...selectionLists[listIndex],
      ...updateData,
      updatedAt: new Date(),
      lastModifiedBy: 'current-user'
    };

    selectionLists[listIndex] = updatedList;

    return res.json({
      success: true,
      data: updatedList,
      message: '选型清单更新成功'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '更新选型清单失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 删除选型清单
 */
export const deleteSelectionList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const listIndex = selectionLists.findIndex(l => l.id === id);
    
    if (listIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '选型清单不存在'
      });
    }

    selectionLists.splice(listIndex, 1);

    return res.json({
      success: true,
      message: '选型清单删除成功'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '删除选型清单失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 添加选型项目
 */
export const addSelectionItem = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const itemData: CreateSelectionItemRequest = req.body;
    
    const listIndex = selectionLists.findIndex(l => l.id === listId);
    if (listIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '选型清单不存在'
      });
    }

    const newItem: SelectionItem = {
      id: `item-${String(nextItemId++).padStart(3, '0')}`,
      componentId: itemData.componentId,
      componentName: itemData.componentName,
      componentType: itemData.componentType,
      specification: itemData.specification,
      quantity: itemData.quantity,
      unit: itemData.unit,
      priority: itemData.priority,
      status: 'pending',
      estimatedCost: itemData.estimatedCost,
      leadTime: itemData.leadTime,
      alternativeSuppliers: [],
      technicalRequirements: itemData.technicalRequirements,
      qualityRequirements: itemData.qualityRequirements,
      notes: itemData.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user',
      lastModifiedBy: 'current-user'
    };

    selectionLists[listIndex].items.push(newItem);
    
    // 更新总成本
    selectionLists[listIndex].totalEstimatedCost = selectionLists[listIndex].items.reduce(
      (sum, item) => sum + (item.estimatedCost * item.quantity), 0
    );
    selectionLists[listIndex].updatedAt = new Date();
    selectionLists[listIndex].lastModifiedBy = 'current-user';

    return res.status(201).json({
      success: true,
      data: newItem,
      message: '选型项目添加成功'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '添加选型项目失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 更新选型项目
 */
export const updateSelectionItem = async (req: Request, res: Response) => {
  try {
    const { listId, itemId } = req.params;
    const updateData: UpdateSelectionItemRequest = req.body;
    
    const listIndex = selectionLists.findIndex(l => l.id === listId);
    if (listIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '选型清单不存在'
      });
    }

    const itemIndex = selectionLists[listIndex].items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '选型项目不存在'
      });
    }

    const updatedItem = {
      ...selectionLists[listIndex].items[itemIndex],
      ...updateData,
      updatedAt: new Date(),
      lastModifiedBy: 'current-user'
    };

    selectionLists[listIndex].items[itemIndex] = updatedItem;
    
    // 更新总成本
    selectionLists[listIndex].totalEstimatedCost = selectionLists[listIndex].items.reduce(
      (sum, item) => sum + (item.estimatedCost * item.quantity), 0
    );
    selectionLists[listIndex].totalActualCost = selectionLists[listIndex].items.reduce(
      (sum, item) => sum + ((item.actualCost || 0) * item.quantity), 0
    );
    selectionLists[listIndex].updatedAt = new Date();
    selectionLists[listIndex].lastModifiedBy = 'current-user';

    return res.json({
      success: true,
      data: updatedItem,
      message: '选型项目更新成功'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '更新选型项目失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 删除选型项目
 */
export const deleteSelectionItem = async (req: Request, res: Response) => {
  try {
    const { listId, itemId } = req.params;
    
    const listIndex = selectionLists.findIndex(l => l.id === listId);
    if (listIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '选型清单不存在'
      });
    }

    const itemIndex = selectionLists[listIndex].items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '选型项目不存在'
      });
    }

    selectionLists[listIndex].items.splice(itemIndex, 1);
    
    // 更新总成本
    selectionLists[listIndex].totalEstimatedCost = selectionLists[listIndex].items.reduce(
      (sum, item) => sum + (item.estimatedCost * item.quantity), 0
    );
    selectionLists[listIndex].totalActualCost = selectionLists[listIndex].items.reduce(
      (sum, item) => sum + ((item.actualCost || 0) * item.quantity), 0
    );
    selectionLists[listIndex].updatedAt = new Date();
    selectionLists[listIndex].lastModifiedBy = 'current-user';

    return res.json({
      success: true,
      message: '选型项目删除成功'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '删除选型项目失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 批量操作选型项目
 */
export const bulkUpdateSelectionItems = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const operation: BulkSelectionOperation = req.body;
    
    const listIndex = selectionLists.findIndex(l => l.id === listId);
    if (listIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '选型清单不存在'
      });
    }

    const updatedItems: SelectionItem[] = [];

    operation.itemIds.forEach(itemId => {
      const itemIndex = selectionLists[listIndex].items.findIndex(i => i.id === itemId);
      if (itemIndex !== -1) {
        const item = selectionLists[listIndex].items[itemIndex];
        
        switch (operation.operation) {
          case 'update_status':
            if (operation.data?.status) {
              item.status = operation.data.status;
            }
            break;
          case 'assign_supplier':
            if (operation.data?.supplierId && operation.data?.supplierName) {
              item.supplierId = operation.data.supplierId;
              item.supplierName = operation.data.supplierName;
            }
            break;
          case 'update_priority':
            if (operation.data?.priority) {
              item.priority = operation.data.priority;
            }
            break;
          case 'delete':
            selectionLists[listIndex].items.splice(itemIndex, 1);
            break;
        }
        
        if (operation.operation !== 'delete') {
          item.updatedAt = new Date();
          item.lastModifiedBy = 'current-user';
          updatedItems.push(item);
        }
      }
    });

    // 更新总成本
    selectionLists[listIndex].totalEstimatedCost = selectionLists[listIndex].items.reduce(
      (sum, item) => sum + (item.estimatedCost * item.quantity), 0
    );
    selectionLists[listIndex].totalActualCost = selectionLists[listIndex].items.reduce(
      (sum, item) => sum + ((item.actualCost || 0) * item.quantity), 0
    );
    selectionLists[listIndex].updatedAt = new Date();
    selectionLists[listIndex].lastModifiedBy = 'current-user';

    return res.json({
      success: true,
      data: updatedItems,
      message: `批量${operation.operation}操作成功`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '批量操作失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 选型清单分析
 */
export const analyzeSelectionList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const list = selectionLists.find(l => l.id === id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: '选型清单不存在'
      });
    }

    const totalItems = list.items.length;
    const completedItems = list.items.filter(item => item.status === 'approved').length;
    const pendingItems = list.items.filter(item => item.status === 'pending').length;
    const totalCost = list.totalEstimatedCost;
    const averageLeadTime = totalItems > 0 ? 
      list.items.reduce((sum, item) => sum + item.leadTime, 0) / totalItems : 0;

    // 风险评估
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const riskFactors: string[] = [];

    if (averageLeadTime > 150) {
      riskLevel = 'high';
      riskFactors.push('平均交付周期过长');
    } else if (averageLeadTime > 90) {
      riskLevel = 'medium';
      riskFactors.push('交付周期较长');
    }

    if (pendingItems / totalItems > 0.7) {
      riskLevel = 'high';
      riskFactors.push('大量项目未完成选型');
    }

    const highPriorityPending = list.items.filter(
      item => item.priority === 'high' && item.status === 'pending'
    ).length;
    if (highPriorityPending > 0) {
      riskLevel = riskLevel === 'low' ? 'medium' : 'high';
      riskFactors.push(`${highPriorityPending}个高优先级项目未完成`);
    }

    // 成本分析
    const costBreakdown = list.items.reduce((acc, item) => {
      const existing = acc.find(c => c.category === item.componentType);
      const itemCost = item.estimatedCost * item.quantity;
      
      if (existing) {
        existing.amount += itemCost;
      } else {
        acc.push({
          category: item.componentType,
          amount: itemCost,
          percentage: 0
        });
      }
      return acc;
    }, [] as Array<{ category: string; amount: number; percentage: number }>);

    // 计算百分比
    costBreakdown.forEach(item => {
      item.percentage = Math.round((item.amount / totalCost) * 100);
    });

    // 供应商分布
    const supplierDistribution = list.items.reduce((acc, item) => {
      if (item.supplierId && item.supplierName) {
        const existing = acc.find(s => s.supplierId === item.supplierId);
        const itemValue = (item.actualCost || item.estimatedCost) * item.quantity;
        
        if (existing) {
          existing.itemCount += 1;
          existing.totalValue += itemValue;
        } else {
          acc.push({
            supplierId: item.supplierId,
            supplierName: item.supplierName,
            itemCount: 1,
            totalValue: itemValue
          });
        }
      }
      return acc;
    }, [] as Array<{ supplierId: string; supplierName: string; itemCount: number; totalValue: number }>);

    // 推荐建议
    const recommendations = [];
    if (highPriorityPending > 0) {
      recommendations.push({
        itemId: 'general',
        recommendation: '优先完成高优先级项目的选型',
        reason: `有${highPriorityPending}个高优先级项目尚未完成选型`,
        impact: 'high' as const
      });
    }

    if (averageLeadTime > 120) {
      recommendations.push({
        itemId: 'general',
        recommendation: '考虑寻找交付周期更短的替代供应商',
        reason: '平均交付周期过长，可能影响项目进度',
        impact: 'medium' as const
      });
    }

    const analysis: SelectionAnalysis = {
      listId: id,
      totalItems,
      completedItems,
      pendingItems,
      totalCost,
      averageLeadTime: Math.round(averageLeadTime),
      riskLevel,
      riskFactors,
      recommendations,
      costBreakdown,
      supplierDistribution
    };

    return res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '选型清单分析失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 智能选型推荐
 */
export const getSelectionRecommendations = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const criteria: SelectionCriteria = req.body;
    
    const list = selectionLists.find(l => l.id === listId);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: '选型清单不存在'
      });
    }

    const recommendations = list.items
      .filter(item => item.status === 'pending' && item.alternativeSuppliers.length > 0)
      .map(item => {
        // 为每个备选供应商计算综合评分
        const scoredSuppliers = item.alternativeSuppliers.map(supplier => {
          let score = 0;
          
          // 成本评分 (成本越低评分越高)
          const maxPrice = Math.max(...item.alternativeSuppliers.map(s => s.price));
          const costScore = ((maxPrice - supplier.price) / maxPrice) * criteria.costWeight;
          score += costScore;
          
          // 质量评分 (根据资质等级)
          const qualityScore = (supplier.qualificationLevel === 'A' ? 1 : 
                               supplier.qualificationLevel === 'B' ? 0.7 : 0.4) * criteria.qualityWeight;
          score += qualityScore;
          
          // 交付评分 (交付时间越短评分越高)
          const maxLeadTime = Math.max(...item.alternativeSuppliers.map(s => s.leadTime));
          const deliveryScore = ((maxLeadTime - supplier.leadTime) / maxLeadTime) * criteria.deliveryWeight;
          score += deliveryScore;
          
          // 服务评分 (简化处理，A级供应商服务评分更高)
          const serviceScore = (supplier.qualificationLevel === 'A' ? 0.9 : 
                               supplier.qualificationLevel === 'B' ? 0.7 : 0.5) * criteria.serviceWeight;
          score += serviceScore;
          
          return {
            ...supplier,
            score: Math.round(score * 100) / 100
          };
        });

        // 排序并选择最佳供应商
        scoredSuppliers.sort((a, b) => b.score - a.score);
        const bestSupplier = scoredSuppliers[0];

        return {
          itemId: item.id,
          itemName: item.componentName,
          recommendedSupplier: bestSupplier,
          allOptions: scoredSuppliers,
          recommendation: `推荐选择${bestSupplier.supplierName}`,
          reason: `综合评分最高(${bestSupplier.score})，在成本、质量、交付等方面表现最佳`,
          estimatedSavings: item.estimatedCost - bestSupplier.price
        };
      });

    return res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '获取选型推荐失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};
