import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { SupplierService } from '../services';

const supplierService = new SupplierService();

// 供应商绩效评估
export const evaluateSupplierPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const { timeRange = '6m' } = req.query;
    
    if (!supplierId) {
      throw new CustomError('请提供供应商ID', 400, 'MISSING_SUPPLIER_ID');
    }

    const performance = await supplierService.evaluateSupplierPerformance(
      supplierId,
      timeRange as '3m' | '6m' | '1y'
    );

    const response: ApiResponse = {
      success: true,
      data: {
        ...performance,
        evaluation: {
          grade: getPerformanceGrade(performance.overallRating),
          strengths: identifyStrengths(performance),
          improvementAreas: identifyImprovementAreas(performance)
        }
      },
      message: `完成供应商 ${performance.supplierName} 的绩效评估`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('供应商绩效评估失败:', error);
    throw new CustomError('供应商绩效评估失败', 500);
  }
};

// 供应商风险评估
export const assessSupplierRisk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    
    if (!supplierId) {
      throw new CustomError('请提供供应商ID', 400, 'MISSING_SUPPLIER_ID');
    }

    const riskAssessment = await supplierService.assessSupplierRisk(supplierId);

    // 分析风险因素分布
    const riskDistribution = riskAssessment.riskFactors.reduce((acc, factor) => {
      acc[factor.category] = (acc[factor.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response: ApiResponse = {
      success: true,
      data: {
        ...riskAssessment,
        analysis: {
          riskDistribution,
          criticalFactors: riskAssessment.riskFactors.filter(f => f.severity >= 8),
          totalRiskScore: calculateTotalRiskScore(riskAssessment.riskFactors),
          priorityActions: riskAssessment.mitigationStrategies.slice(0, 3)
        }
      },
      message: `完成供应商风险评估，风险等级: ${riskAssessment.riskLevel}`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('供应商风险评估失败:', error);
    throw new CustomError('供应商风险评估失败', 500);
  }
};

// 供应商对比分析
export const compareSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierIds } = req.body;
    
    if (!supplierIds || !Array.isArray(supplierIds) || supplierIds.length < 2) {
      throw new CustomError('请至少选择2个供应商进行对比', 400, 'INVALID_COMPARISON_INPUT');
    }
    
    if (supplierIds.length > 6) {
      throw new CustomError('最多只能同时对比6个供应商', 400, 'TOO_MANY_SUPPLIERS');
    }

    const comparison = await supplierService.compareSuppliers(supplierIds);

    // 生成对比洞察
    const insights = generateComparisonInsights(comparison);

    const response: ApiResponse = {
      success: true,
      data: {
        ...comparison,
        insights,
        summary: {
          totalSuppliers: comparison.suppliers.length,
          comparisonDate: new Date().toISOString(),
          topPerformer: insights.bestOverall,
          keyDifferentiators: insights.keyDifferences
        }
      },
      message: `成功对比 ${comparison.suppliers.length} 个供应商`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('供应商对比失败:', error);
    throw new CustomError('供应商对比失败', 500);
  }
};

// 供应商审核
export const conductSupplierAudit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const { auditType } = req.body;
    
    if (!supplierId) {
      throw new CustomError('请提供供应商ID', 400, 'MISSING_SUPPLIER_ID');
    }
    
    if (!auditType || !['quality', 'financial', 'compliance', 'security'].includes(auditType)) {
      throw new CustomError('请提供有效的审核类型', 400, 'INVALID_AUDIT_TYPE');
    }

    const auditResult = await supplierService.conductSupplierAudit(supplierId, auditType);

    // 分析审核结果
    const analysis = analyzeAuditResult(auditResult);

    const response: ApiResponse = {
      success: true,
      data: {
        ...auditResult,
        analysis,
        actionPlan: generateActionPlan(auditResult)
      },
      message: `完成 ${auditType} 审核，总分: ${auditResult.overallScore}`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('供应商审核失败:', error);
    throw new CustomError('供应商审核失败', 500);
  }
};

// 供应商资格预审
export const prequalifySupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplierData = req.body;
    
    if (!supplierData || !supplierData.name) {
      throw new CustomError('请提供供应商基本信息', 400, 'MISSING_SUPPLIER_DATA');
    }

    const prequalification = await supplierService.prequalifySupplier(supplierData);

    const response: ApiResponse = {
      success: true,
      data: {
        ...prequalification,
        recommendation: prequalification.qualified ? 'APPROVE' : 'REJECT',
        riskLevel: calculatePrequalificationRisk(prequalification),
        nextActions: prequalification.qualified ? 
          ['进行正式审核', '建立合作关系', '签署框架协议'] :
          ['完善资质文件', '改善财务状况', '提升技术能力']
      },
      message: prequalification.qualified ? 
        `供应商资格预审通过，评分: ${prequalification.score}` :
        `供应商资格预审未通过，评分: ${prequalification.score}`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('供应商资格预审失败:', error);
    throw new CustomError('供应商资格预审失败', 500);
  }
};

// 供应商关系管理
export const manageSupplierRelationship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    
    if (!supplierId) {
      throw new CustomError('请提供供应商ID', 400, 'MISSING_SUPPLIER_ID');
    }

    const relationship = await supplierService.manageSupplierRelationship(supplierId);

    // 生成关系管理建议
    const recommendations = generateRelationshipRecommendations(relationship);

    const response: ApiResponse = {
      success: true,
      data: {
        ...relationship,
        recommendations,
        healthScore: calculateRelationshipHealth(relationship),
        alerts: generateRelationshipAlerts(relationship)
      },
      message: `供应商关系状态: ${relationship.relationshipStatus}`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('供应商关系管理失败:', error);
    throw new CustomError('供应商关系管理失败', 500);
  }
};

// 批量供应商分析
export const batchAnalyzeSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierIds, analysisTypes = ['performance', 'risk'] } = req.body;
    
    if (!supplierIds || !Array.isArray(supplierIds) || supplierIds.length === 0) {
      throw new CustomError('请提供供应商ID列表', 400, 'MISSING_SUPPLIER_IDS');
    }

    const batchResults: any = {
      totalSuppliers: supplierIds.length,
      analysisTypes,
      results: {},
      summary: {},
      completedAt: new Date().toISOString()
    };

    // 并行执行分析
    const analysisPromises = [];

    if (analysisTypes.includes('performance')) {
      analysisPromises.push(
        Promise.all(supplierIds.map(id => 
          supplierService.evaluateSupplierPerformance(id, '6m')
        )).then(performances => {
          batchResults.results.performance = performances;
          batchResults.summary.avgPerformance = 
            performances.reduce((sum, p) => sum + p.overallRating, 0) / performances.length;
        })
      );
    }

    if (analysisTypes.includes('risk')) {
      analysisPromises.push(
        Promise.all(supplierIds.map(id => 
          supplierService.assessSupplierRisk(id)
        )).then(risks => {
          batchResults.results.risk = risks;
          batchResults.summary.highRiskCount = 
            risks.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length;
        })
      );
    }

    await Promise.all(analysisPromises);

    // 生成批量分析洞察
    batchResults.insights = generateBatchInsights(batchResults);

    const response: ApiResponse = {
      success: true,
      data: batchResults,
      message: `完成 ${supplierIds.length} 个供应商的批量分析`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('批量供应商分析失败:', error);
    throw new CustomError('批量供应商分析失败', 500);
  }
};

// 辅助函数
function getPerformanceGrade(rating: number): string {
  if (rating >= 90) return 'A+';
  if (rating >= 85) return 'A';
  if (rating >= 80) return 'B+';
  if (rating >= 75) return 'B';
  if (rating >= 70) return 'C+';
  if (rating >= 65) return 'C';
  return 'D';
}

function identifyStrengths(performance: any): string[] {
  const strengths = [];
  if (performance.deliveryReliability >= 90) strengths.push('交付可靠性优秀');
  if (performance.qualityScore >= 90) strengths.push('质量水平优秀');
  if (performance.priceCompetitiveness >= 85) strengths.push('价格竞争力强');
  if (performance.responseTime <= 12) strengths.push('响应速度快');
  if (performance.documentCompliance >= 95) strengths.push('文档合规性高');
  return strengths;
}

function identifyImprovementAreas(performance: any): string[] {
  const areas = [];
  if (performance.deliveryReliability < 80) areas.push('提升交付可靠性');
  if (performance.qualityScore < 80) areas.push('改善质量管理');
  if (performance.priceCompetitiveness < 70) areas.push('优化价格策略');
  if (performance.responseTime > 48) areas.push('加快响应速度');
  if (performance.documentCompliance < 90) areas.push('完善文档合规');
  return areas;
}

function calculateTotalRiskScore(riskFactors: any[]): number {
  return riskFactors.reduce((sum, factor) => sum + (factor.severity * factor.likelihood), 0);
}

function generateComparisonInsights(comparison: any): any {
  const matrix = comparison.comparisonMatrix;
  const supplierIds = Object.keys(matrix);
  
  // 找出各项最佳表现者
  const bestPricing = supplierIds.reduce((best, current) => 
    matrix[current].pricing > matrix[best].pricing ? current : best
  );
  
  const bestQuality = supplierIds.reduce((best, current) => 
    matrix[current].quality > matrix[best].quality ? current : best
  );
  
  const bestDelivery = supplierIds.reduce((best, current) => 
    matrix[current].delivery > matrix[best].delivery ? current : best
  );

  return {
    bestOverall: comparison.recommendations[0]?.supplierId,
    bestPricing,
    bestQuality,
    bestDelivery,
    keyDifferences: identifyKeyDifferences(matrix)
  };
}

function identifyKeyDifferences(matrix: any): string[] {
  const differences = [];
  const supplierIds = Object.keys(matrix);
  
  // 分析价格差异
  const prices = supplierIds.map(id => matrix[id].pricing);
  const priceSpread = Math.max(...prices) - Math.min(...prices);
  if (priceSpread > 20) {
    differences.push(`价格差异较大 (${priceSpread.toFixed(1)}分)`);
  }
  
  // 分析质量差异
  const qualities = supplierIds.map(id => matrix[id].quality);
  const qualitySpread = Math.max(...qualities) - Math.min(...qualities);
  if (qualitySpread > 15) {
    differences.push(`质量水平差异显著 (${qualitySpread.toFixed(1)}分)`);
  }
  
  return differences;
}

function analyzeAuditResult(audit: any): any {
  const criticalFindings = audit.findings.filter((f: any) => f.severity === 'critical');
  const highFindings = audit.findings.filter((f: any) => f.severity === 'high');
  
  return {
    riskLevel: criticalFindings.length > 0 ? 'high' : 
               highFindings.length > 2 ? 'medium' : 'low',
    complianceRate: audit.findings.filter((f: any) => f.status === 'resolved').length / audit.findings.length * 100,
    priorityFindings: [...criticalFindings, ...highFindings.slice(0, 3)],
    improvementPotential: calculateImprovementPotential(audit)
  };
}

function generateActionPlan(audit: any): any[] {
  const plan: any[] = [];
  
  // 针对关键发现制定行动计划
  const criticalFindings = audit.findings.filter((f: any) => f.severity === 'critical');
  criticalFindings.forEach((finding: any) => {
    plan.push({
      priority: 'immediate',
      action: `解决关键问题: ${finding.description}`,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天内
      responsible: 'Quality Manager'
    });
  });
  
  // 针对高风险发现制定行动计划
  const highFindings = audit.findings.filter((f: any) => f.severity === 'high');
  highFindings.slice(0, 3).forEach((finding: any) => {
    plan.push({
      priority: 'high',
      action: `改善高风险项: ${finding.description}`,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天内
      responsible: 'Procurement Manager'
    });
  });
  
  return plan;
}

function calculateImprovementPotential(audit: any): number {
  const maxScore = 100;
  const currentScore = audit.overallScore;
  const openIssues = audit.findings.filter((f: any) => f.status === 'open').length;
  
  // 基于当前分数和开放问题数量计算改善潜力
  const potentialGain = Math.min(maxScore - currentScore, openIssues * 5);
  return potentialGain;
}

function calculatePrequalificationRisk(prequalification: any): string {
  if (prequalification.score >= 85) return 'low';
  if (prequalification.score >= 70) return 'medium';
  return 'high';
}

function generateRelationshipRecommendations(relationship: any): string[] {
  const recommendations = [];
  
  if (relationship.collaborationLevel < 60) {
    recommendations.push('增加合作项目，提升协作水平');
  }
  
  if (relationship.communicationFrequency === 'quarterly') {
    recommendations.push('建议增加沟通频率至月度');
  }
  
  if (relationship.relationshipStatus === 'standard') {
    recommendations.push('考虑将表现优秀的供应商升级为首选供应商');
  }
  
  return recommendations;
}

function calculateRelationshipHealth(relationship: any): number {
  let score = 50; // 基础分
  
  // 根据关系状态评分
  const statusScores: Record<string, number> = {
    'strategic': 95,
    'preferred': 85,
    'standard': 65,
    'watch': 40,
    'exit': 20
  };
  
  score = statusScores[relationship.relationshipStatus] || 50;
  
  // 根据协作水平调整
  score += relationship.collaborationLevel * 0.2;
  
  return Math.min(100, Math.max(0, score));
}

function generateRelationshipAlerts(relationship: any): string[] {
  const alerts = [];
  
  if (relationship.relationshipStatus === 'watch') {
    alerts.push('供应商处于观察状态，需要密切关注');
  }
  
  if (relationship.contractStatus?.expiryDate) {
    const expiryDate = new Date(relationship.contractStatus.expiryDate);
    const now = new Date();
    const daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiry <= 90) {
      alerts.push(`合同将在${daysToExpiry}天后到期，请及时续签`);
    }
  }
  
  return alerts;
}

function generateBatchInsights(batchResults: any): any {
  const insights: any = {
    topPerformers: [],
    riskAlerts: [],
    recommendations: []
  };
  
  // 识别顶级表现者
  if (batchResults.results.performance) {
    insights.topPerformers = batchResults.results.performance
      .filter((p: any) => p.overallRating >= 85)
      .map((p: any) => ({ supplierId: p.supplierId, rating: p.overallRating }));
  }
  
  // 识别风险警报
  if (batchResults.results.risk) {
    insights.riskAlerts = batchResults.results.risk
      .filter((r: any) => r.riskLevel === 'high' || r.riskLevel === 'critical')
      .map((r: any) => ({ supplierId: r.supplierId, riskLevel: r.riskLevel }));
  }
  
  // 生成推荐
  if (insights.topPerformers.length > 0) {
    insights.recommendations.push('考虑与顶级表现者建立战略合作关系');
  }
  
  if (insights.riskAlerts.length > 0) {
    insights.recommendations.push('立即制定高风险供应商的风险缓解计划');
  }
  
  return insights;
}

// Functions are already exported above individually
