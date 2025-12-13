import { Request, Response } from 'express';
import { memoryStorage, Supplier } from '../config/memoryStorage';
import { ApiResponse, SupplierInfo, SupplierQualificationLevel } from '../types';

const storage = memoryStorage;

// 获取所有供应商
export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      qualificationLevel,
      isActive,
      spaceQualified,
      radiationTesting,
      sort = 'name',
      order = 'asc'
    } = req.query;

    let suppliers = storage.getSuppliers();

    // 搜索过滤
    if (search) {
      const searchTerm = String(search).toLowerCase();
      suppliers = suppliers.filter((supplier: Supplier) => 
        supplier.name.toLowerCase().includes(searchTerm) ||
        supplier.code.toLowerCase().includes(searchTerm) ||
        (supplier.businessInfo?.registrationNumber || '').toLowerCase().includes(searchTerm)
      );
    }

    // 资质等级过滤
    if (qualificationLevel) {
      const levels = Array.isArray(qualificationLevel) ? qualificationLevel : [qualificationLevel];
      suppliers = suppliers.filter((supplier: Supplier) => levels.includes(supplier.qualificationLevel));
    }

    // 活跃状态过滤
    if (isActive !== undefined) {
      suppliers = suppliers.filter((supplier: Supplier) => supplier.isActive === (isActive === 'true'));
    }

    // 航天资质过滤
    if (spaceQualified !== undefined) {
      suppliers = suppliers.filter((supplier: Supplier) => 
        supplier.capabilities?.spaceQualification?.hasExperience === (spaceQualified === 'true')
      );
    }

    // 辐照测试能力过滤
    if (radiationTesting !== undefined) {
      suppliers = suppliers.filter((supplier: Supplier) => 
        supplier.capabilities?.radiationTesting?.hasCapability === (radiationTesting === 'true')
      );
    }

    // 排序
    suppliers.sort((a: Supplier, b: Supplier) => {
      let aValue: any, bValue: any;
      
      switch (sort) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'qualificationLevel':
          const levelOrder = { 'A': 4, 'B': 3, 'C': 2, 'unqualified': 1 };
          aValue = levelOrder[a.qualificationLevel as keyof typeof levelOrder];
          bValue = levelOrder[b.qualificationLevel as keyof typeof levelOrder];
          break;
        case 'performance':
          aValue = a.performance?.overallRating || 0;
          bValue = b.performance?.overallRating || 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (order === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    // 分页
    const total = suppliers.length;
    const pageNum = parseInt(String(page));
    const pageSize = parseInt(String(limit));
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const paginatedSuppliers = suppliers.slice(startIndex, endIndex);

    const response: ApiResponse = {
      success: true,
      data: paginatedSuppliers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / pageSize),
        totalItems: total,
        itemsPerPage: pageSize,
        hasNextPage: endIndex < total,
        hasPrevPage: pageNum > 1
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('获取供应商列表失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUPPLIER_FETCH_ERROR',
        message: '获取供应商列表失败'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
};

// 获取单个供应商详情
export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplier = storage.getSupplierById(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUPPLIER_NOT_FOUND',
          message: '供应商不存在'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    const response: ApiResponse = {
      success: true,
      data: supplier,
      timestamp: new Date().toISOString()
    };

    return res.json(response);
  } catch (error) {
    console.error('获取供应商详情失败:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SUPPLIER_DETAIL_ERROR',
        message: '获取供应商详情失败'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
};

// 供应商评估分析
export const analyzeSuppliers = async (req: Request, res: Response) => {
  try {
    const { supplierIds } = req.body;

    if (!supplierIds || !Array.isArray(supplierIds) || supplierIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SUPPLIER_IDS',
          message: '请提供有效的供应商ID列表'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    const suppliers = supplierIds.map(id => storage.getSupplierById(id)).filter(Boolean);

    if (suppliers.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUPPLIERS_NOT_FOUND',
          message: '未找到指定的供应商'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // 执行供应商评估分析
    const analysis = performSupplierAnalysis(suppliers);

    const response: ApiResponse = {
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    };

    return res.json(response);
  } catch (error) {
    console.error('供应商分析失败:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SUPPLIER_ANALYSIS_ERROR',
        message: '供应商分析失败'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
};

// 获取供应商统计信息
export const getSupplierStatistics = async (req: Request, res: Response) => {
  try {
    const suppliers = storage.getSuppliers();
    
    const statistics = {
      totalSuppliers: suppliers.length,
      activeSuppliers: suppliers.filter((s: Supplier) => s.isActive).length,
      qualificationDistribution: {
        A: suppliers.filter((s: Supplier) => s.qualificationLevel === 'A').length,
        B: suppliers.filter((s: Supplier) => s.qualificationLevel === 'B').length,
        C: suppliers.filter((s: Supplier) => s.qualificationLevel === 'C').length,
        unqualified: suppliers.filter((s: Supplier) => s.qualificationLevel === 'unqualified').length
      },
      capabilityDistribution: {
        spaceQualified: suppliers.filter((s: Supplier) => s.capabilities?.spaceQualification?.hasExperience).length,
        radiationTesting: suppliers.filter((s: Supplier) => s.capabilities?.radiationTesting?.hasCapability).length,
        iso9001: suppliers.filter((s: Supplier) => s.certifications?.includes('ISO9001')).length,
        as9100: suppliers.filter((s: Supplier) => s.certifications?.includes('AS9100')).length
      },
      performanceMetrics: {
        averageQualityRating: calculateAverageRating(suppliers, 'qualityRating'),
        averageDeliveryRating: calculateAverageRating(suppliers, 'deliveryRating'),
        averageServiceRating: calculateAverageRating(suppliers, 'serviceRating'),
        averageOverallRating: calculateAverageRating(suppliers, 'overallRating')
      },
      riskDistribution: {
        low: suppliers.filter((s: Supplier) => s.riskAssessment?.overallRisk === 'low').length,
        medium: suppliers.filter((s: Supplier) => s.riskAssessment?.overallRisk === 'medium').length,
        high: suppliers.filter((s: Supplier) => s.riskAssessment?.overallRisk === 'high').length,
        critical: suppliers.filter((s: Supplier) => s.riskAssessment?.overallRisk === 'critical').length
      }
    };

    const response: ApiResponse = {
      success: true,
      data: statistics,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('获取供应商统计失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUPPLIER_STATISTICS_ERROR',
        message: '获取供应商统计失败'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
};

// 供应商推荐
export const getSupplierRecommendations = async (req: Request, res: Response) => {
  try {
    const { 
      componentCategory,
      qualityRequirement,
      spaceGrade,
      budget,
      urgency 
    } = req.query;

    const suppliers = storage.getSuppliers().filter((s: Supplier) => s.isActive);
    
    // 根据需求进行推荐
    const recommendations = suppliers
      .map((supplier: Supplier) => ({
        supplier,
        score: calculateRecommendationScore(supplier, {
          componentCategory: String(componentCategory || ''),
          qualityRequirement: String(qualityRequirement || ''),
          spaceGrade: String(spaceGrade || ''),
          budget: Number(budget || 0),
          urgency: String(urgency || '')
        })
      }))
      .filter((item: any) => item.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 10)
      .map((item: any) => ({
        ...item.supplier,
        recommendationScore: item.score,
        recommendationReason: generateRecommendationReason(item.supplier, item.score)
      }));

    const response: ApiResponse = {
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('获取供应商推荐失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUPPLIER_RECOMMENDATION_ERROR',
        message: '获取供应商推荐失败'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
};

// 辅助函数：执行供应商分析
function performSupplierAnalysis(suppliers: any[]) {
  const comparison = suppliers.map((supplier: any) => {
    const score = calculateSupplierScore(supplier);
    return {
      id: supplier.id,
      name: supplier.name,
      code: supplier.code,
      qualificationLevel: supplier.qualificationLevel,
      overallScore: score,
      strengths: identifyStrengths(supplier),
      weaknesses: identifyWeaknesses(supplier),
      riskFactors: identifyRiskFactors(supplier),
      recommendations: generateImprovementRecommendations(supplier)
    };
  });

  // 找出最佳供应商
  const bestSupplier = comparison.reduce((best, current) => 
    current.overallScore > best.overallScore ? current : best
  );

  // 关键指标对比
  const metrics = {
    qualityComparison: suppliers.map(s => ({
      supplierId: s.id,
      name: s.name,
      qualityRating: s.performance?.qualityRating || 0,
      defectRate: s.performance?.defectRate || 0,
      certificationCount: s.certifications?.length || 0
    })),
    deliveryComparison: suppliers.map(s => ({
      supplierId: s.id,
      name: s.name,
      deliveryRating: s.performance?.deliveryRating || 0,
      onTimeRate: s.performance?.onTimeDeliveryRate || 0,
      leadTime: s.contractInfo?.preferredTerms?.leadTime || 0
    })),
    costComparison: suppliers.map(s => ({
      supplierId: s.id,
      name: s.name,
      costCompetitiveness: s.performance?.costCompetitiveness || 0,
      paymentTerms: s.contractInfo?.preferredTerms?.paymentTerms || '',
      totalContractValue: s.contractInfo?.totalContractValue || 0
    }))
  };

  return {
    supplierComparison: comparison,
    bestSupplier,
    keyMetrics: metrics,
    summary: {
      totalSuppliers: suppliers.length,
      averageScore: comparison.reduce((sum, s) => sum + s.overallScore, 0) / comparison.length,
      recommendedSupplier: bestSupplier.id,
      analysisDate: new Date().toISOString()
    }
  };
}

// 辅助函数：计算供应商评分
function calculateSupplierScore(supplier: any): number {
  let score = 0;

  // 资质等级 (25%)
  const qualificationScores = { 'A': 25, 'B': 20, 'C': 15, 'unqualified': 0 };
  score += qualificationScores[supplier.qualificationLevel as keyof typeof qualificationScores] || 0;

  // 绩效评级 (30%)
  if (supplier.performance) {
    const performanceScore = (
      (supplier.performance.qualityRating || 0) * 10 +
      (supplier.performance.deliveryRating || 0) * 10 +
      (supplier.performance.serviceRating || 0) * 10
    ) / 3;
    score += performanceScore * 0.3;
  }

  // 认证情况 (20%)
  const certificationScore = Math.min((supplier.certifications?.length || 0) * 5, 20);
  score += certificationScore;

  // 能力匹配 (15%)
  let capabilityScore = 0;
  if (supplier.capabilities?.spaceQualification?.hasExperience) capabilityScore += 7.5;
  if (supplier.capabilities?.radiationTesting?.hasCapability) capabilityScore += 7.5;
  score += capabilityScore;

  // 风险评估 (10%)
  const riskScores = { 'low': 10, 'medium': 7, 'high': 4, 'critical': 0 };
  score += riskScores[supplier.riskAssessment?.overallRisk as keyof typeof riskScores] || 5;

  return Math.min(Math.round(score), 100);
}

// 辅助函数：识别优势
function identifyStrengths(supplier: any): string[] {
  const strengths: string[] = [];
  
  if (supplier.qualificationLevel === 'A') strengths.push('A级资质认证');
  if (supplier.performance?.qualityRating >= 4) strengths.push('优秀质量表现');
  if (supplier.performance?.deliveryRating >= 4) strengths.push('准时交付能力强');
  if (supplier.capabilities?.spaceQualification?.hasExperience) strengths.push('丰富航天经验');
  if (supplier.capabilities?.radiationTesting?.hasCapability) strengths.push('辐照测试能力');
  if (supplier.certifications?.includes('AS9100')) strengths.push('AS9100认证');
  if (supplier.riskAssessment?.overallRisk === 'low') strengths.push('低风险供应商');
  
  return strengths;
}

// 辅助函数：识别弱点
function identifyWeaknesses(supplier: any): string[] {
  const weaknesses: string[] = [];
  
  if (supplier.qualificationLevel === 'unqualified') weaknesses.push('缺乏正式资质认证');
  if (supplier.performance?.qualityRating < 3) weaknesses.push('质量表现需改进');
  if (supplier.performance?.deliveryRating < 3) weaknesses.push('交付及时性不足');
  if (!supplier.capabilities?.spaceQualification?.hasExperience) weaknesses.push('缺乏航天项目经验');
  if (!supplier.capabilities?.radiationTesting?.hasCapability) weaknesses.push('无辐照测试能力');
  if (supplier.riskAssessment?.overallRisk === 'high') weaknesses.push('供应风险较高');
  
  return weaknesses;
}

// 辅助函数：识别风险因素
function identifyRiskFactors(supplier: any): string[] {
  const risks: string[] = [];
  
  if (!supplier.isActive) risks.push('供应商状态不活跃');
  if (supplier.riskAssessment?.financialRisk === 'high') risks.push('财务风险高');
  if (supplier.riskAssessment?.operationalRisk === 'high') risks.push('运营风险高');
  if (supplier.riskAssessment?.complianceRisk === 'high') risks.push('合规风险高');
  
  const lastAudit = supplier.lastAuditDate ? new Date(supplier.lastAuditDate) : null;
  if (!lastAudit || (Date.now() - lastAudit.getTime()) > 365 * 24 * 60 * 60 * 1000) {
    risks.push('审核时间过久');
  }
  
  return risks;
}

// 辅助函数：生成改进建议
function generateImprovementRecommendations(supplier: any): string[] {
  const recommendations: string[] = [];
  
  if (supplier.qualificationLevel !== 'A') {
    recommendations.push('建议提升供应商资质等级');
  }
  
  if (supplier.performance?.qualityRating < 4) {
    recommendations.push('需要改善质量管理体系');
  }
  
  if (supplier.performance?.deliveryRating < 4) {
    recommendations.push('优化供应链和交付流程');
  }
  
  if (!supplier.capabilities?.spaceQualification?.hasExperience) {
    recommendations.push('建议获得航天相关项目经验');
  }
  
  return recommendations;
}

// 辅助函数：计算平均评分
function calculateAverageRating(suppliers: any[], ratingField: string): number {
  const validRatings = suppliers
    .map(s => s.performance?.[ratingField])
    .filter(rating => rating !== undefined && rating !== null);
  
  if (validRatings.length === 0) return 0;
  
  return validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
}

// 辅助函数：计算推荐评分
function calculateRecommendationScore(supplier: any, requirements: any): number {
  let score = 0;

  // 基础评分
  const baseScore = calculateSupplierScore(supplier);
  score += baseScore * 0.4;

  // 产品类别匹配
  if (requirements.componentCategory && supplier.capabilities?.productCategories?.includes(requirements.componentCategory)) {
    score += 20;
  }

  // 质量要求匹配
  if (requirements.qualityRequirement === 'space' && supplier.capabilities?.spaceQualification?.hasExperience) {
    score += 20;
  }

  // 航天等级匹配
  if (requirements.spaceGrade && supplier.qualificationLevel === 'A') {
    score += 15;
  }

  // 预算考虑
  if (requirements.budget > 0 && supplier.performance?.costCompetitiveness >= 3) {
    score += 10;
  }

  // 紧急程度考虑
  if (requirements.urgency === 'high' && supplier.performance?.deliveryRating >= 4) {
    score += 15;
  }

  return Math.min(score, 100);
}

// 辅助函数：生成推荐理由
function generateRecommendationReason(supplier: any, score: number): string {
  const reasons: string[] = [];
  
  if (supplier.qualificationLevel === 'A') reasons.push('A级资质认证');
  if (supplier.capabilities?.spaceQualification?.hasExperience) reasons.push('航天项目经验丰富');
  if (supplier.performance?.qualityRating >= 4) reasons.push('质量表现优秀');
  if (supplier.performance?.deliveryRating >= 4) reasons.push('交付及时可靠');
  if (supplier.riskAssessment?.overallRisk === 'low') reasons.push('供应风险低');
  
  return reasons.join('、') || '综合评分较高';
}