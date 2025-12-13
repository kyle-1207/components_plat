import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { QualityService } from '../services';

const qualityService = new QualityService();

// 器件质量评估
export const assessComponentQuality = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId } = req.params;
    
    if (!componentId) {
      throw new CustomError('请提供器件ID', 400, 'MISSING_COMPONENT_ID');
    }

    const assessment = await qualityService.assessComponentQuality(componentId);

    // 生成质量等级
    const qualityGrade = getQualityGrade(assessment.overallQualityScore);
    
    // 统计测试结果
    const testSummary = {
      total: assessment.testResults.length,
      passed: assessment.testResults.filter(t => t.status === 'passed').length,
      failed: assessment.testResults.filter(t => t.status === 'failed').length,
      pending: assessment.testResults.filter(t => t.status === 'pending').length
    };

    const response: ApiResponse = {
      success: true,
      data: {
        ...assessment,
        qualityGrade,
        testSummary,
        riskLevel: calculateQualityRisk(assessment)
      },
      message: `器件质量评估完成，质量等级: ${qualityGrade}`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('器件质量评估失败:', error);
    throw new CustomError('器件质量评估失败', 500);
  }
};

// 缺陷分析
export const analyzeDefects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId } = req.params;
    const { timeRange = '90d' } = req.query;
    
    if (!componentId) {
      throw new CustomError('请提供器件ID', 400, 'MISSING_COMPONENT_ID');
    }

    const defectAnalysis = await qualityService.analyzeDefects(
      componentId,
      timeRange as '30d' | '90d' | '1y'
    );

    // 生成缺陷洞察
    const insights = generateDefectInsights(defectAnalysis);

    const response: ApiResponse = {
      success: true,
      data: {
        ...defectAnalysis,
        insights,
        severity: getDefectSeverity(defectAnalysis.defectRate),
        actionPlan: generateDefectActionPlan(defectAnalysis)
      },
      message: `缺陷分析完成，缺陷率: ${defectAnalysis.defectRate.toFixed(2)}%`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('缺陷分析失败:', error);
    throw new CustomError('缺陷分析失败', 500);
  }
};

// 合规性检查
export const checkCompliance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId } = req.params;
    
    if (!componentId) {
      throw new CustomError('请提供器件ID', 400, 'MISSING_COMPONENT_ID');
    }

    const compliance = await qualityService.checkCompliance(componentId);

    // 计算合规性评分
    const complianceScore = calculateComplianceScore(compliance);
    
    // 识别关键风险
    const criticalGaps = compliance.gaps.filter(gap => gap.priority === 'critical' || gap.priority === 'high');

    const response: ApiResponse = {
      success: true,
      data: {
        ...compliance,
        complianceScore,
        status: getComplianceStatus(complianceScore),
        criticalGaps,
        recommendations: generateComplianceRecommendations(compliance)
      },
      message: `合规性检查完成，合规评分: ${complianceScore}`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('合规性检查失败:', error);
    throw new CustomError('合规性检查失败', 500);
  }
};

// 质量指标统计
export const getQualityMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { timeRange = '90d', componentCategory } = req.query;

    const metrics = await qualityService.getQualityMetrics(
      timeRange as '30d' | '90d' | '1y',
      componentCategory as string
    );

    // 生成质量洞察
    const insights = generateQualityInsights(metrics);
    
    // 计算质量健康度
    const healthScore = calculateQualityHealthScore(metrics);

    const response: ApiResponse = {
      success: true,
      data: {
        ...metrics,
        insights,
        healthScore,
        alerts: generateQualityAlerts(metrics)
      },
      message: `质量指标统计完成，时间范围: ${timeRange}`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('质量指标统计失败:', error);
    throw new CustomError('质量指标统计失败', 500);
  }
};

// 辐射测试管理
export const manageRadiationTesting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId } = req.params;
    
    if (!componentId) {
      throw new CustomError('请提供器件ID', 400, 'MISSING_COMPONENT_ID');
    }

    const testingInfo = await qualityService.manageRadiationTesting(componentId);

    // 生成测试计划
    const testPlan = generateRadiationTestPlan(testingInfo);

    const response: ApiResponse = {
      success: true,
      data: {
        ...testingInfo,
        testPlan,
        urgency: calculateTestUrgency(testingInfo),
        compliance: assessRadiationCompliance(testingInfo)
      },
      message: `辐射测试状态: ${testingInfo.currentStatus}`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('辐射测试管理失败:', error);
    throw new CustomError('辐射测试管理失败', 500);
  }
};

// 质量零点管理
export const manageQualityZeroing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId } = req.params;
    
    if (!componentId) {
      throw new CustomError('请提供器件ID', 400, 'MISSING_COMPONENT_ID');
    }

    const zeroingInfo = await qualityService.manageQualityZeroing(componentId);

    // 生成校准建议
    const calibrationAdvice = generateCalibrationAdvice(zeroingInfo);

    const response: ApiResponse = {
      success: true,
      data: {
        ...zeroingInfo,
        calibrationAdvice,
        dueDate: zeroingInfo.nextCalibration,
        priority: getCalibrationPriority(zeroingInfo.status)
      },
      message: `质量零点状态: ${zeroingInfo.status}`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('质量零点管理失败:', error);
    throw new CustomError('质量零点管理失败', 500);
  }
};

// 创建质量改进计划
export const createQualityImprovementPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId } = req.params;
    const { issues } = req.body;
    
    if (!componentId) {
      throw new CustomError('请提供器件ID', 400, 'MISSING_COMPONENT_ID');
    }
    
    if (!issues || !Array.isArray(issues) || issues.length === 0) {
      throw new CustomError('请提供质量问题列表', 400, 'MISSING_ISSUES');
    }

    const improvementPlan = await qualityService.createQualityImprovementPlan(componentId, issues);

    // 计算计划指标
    const planMetrics = calculatePlanMetrics(improvementPlan);

    const response: ApiResponse = {
      success: true,
      data: {
        ...improvementPlan,
        metrics: planMetrics,
        estimatedBenefit: calculateEstimatedBenefit(improvementPlan),
        riskMitigation: assessRiskMitigation(improvementPlan)
      },
      message: `质量改进计划创建成功，计划ID: ${improvementPlan.planId}`,
      timestamp: new Date().toISOString()
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('创建质量改进计划失败:', error);
    throw new CustomError('创建质量改进计划失败', 500);
  }
};

// 批量质量分析
export const batchQualityAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentIds, analysisTypes = ['quality', 'defects', 'compliance'] } = req.body;
    
    if (!componentIds || !Array.isArray(componentIds) || componentIds.length === 0) {
      throw new CustomError('请提供器件ID列表', 400, 'MISSING_COMPONENT_IDS');
    }

    const batchResults: any = {
      totalComponents: componentIds.length,
      analysisTypes,
      results: {},
      summary: {},
      completedAt: new Date().toISOString()
    };

    // 并行执行分析
    const analysisPromises = [];

    if (analysisTypes.includes('quality')) {
      analysisPromises.push(
        Promise.all(componentIds.map(id => 
          qualityService.assessComponentQuality(id)
        )).then(assessments => {
          batchResults.results.quality = assessments;
          batchResults.summary.avgQualityScore = 
            assessments.reduce((sum, a) => sum + a.overallQualityScore, 0) / assessments.length;
        })
      );
    }

    if (analysisTypes.includes('defects')) {
      analysisPromises.push(
        Promise.all(componentIds.map(id => 
          qualityService.analyzeDefects(id, '90d')
        )).then(defects => {
          batchResults.results.defects = defects;
          batchResults.summary.avgDefectRate = 
            defects.reduce((sum, d) => sum + d.defectRate, 0) / defects.length;
        })
      );
    }

    if (analysisTypes.includes('compliance')) {
      analysisPromises.push(
        Promise.all(componentIds.map(id => 
          qualityService.checkCompliance(id)
        )).then(compliance => {
          batchResults.results.compliance = compliance;
          batchResults.summary.complianceRate = 
            compliance.filter(c => calculateComplianceScore(c) >= 80).length / compliance.length * 100;
        })
      );
    }

    await Promise.all(analysisPromises);

    // 生成批量分析洞察
    batchResults.insights = generateBatchQualityInsights(batchResults);

    const response: ApiResponse = {
      success: true,
      data: batchResults,
      message: `完成 ${componentIds.length} 个器件的批量质量分析`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('批量质量分析失败:', error);
    throw new CustomError('批量质量分析失败', 500);
  }
};

// 辅助函数
function getQualityGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function calculateQualityRisk(assessment: any): string {
  if (assessment.overallQualityScore >= 85) return 'low';
  if (assessment.overallQualityScore >= 70) return 'medium';
  return 'high';
}

function generateDefectInsights(analysis: any): any {
  const insights = {
    trendDirection: 'stable',
    majorConcerns: [] as string[],
    improvements: [] as string[],
    recommendations: [] as string[]
  };

  // 分析趋势
  if (analysis.trendAnalysis.length > 1) {
    const recent = analysis.trendAnalysis[analysis.trendAnalysis.length - 1];
    const previous = analysis.trendAnalysis[analysis.trendAnalysis.length - 2];
    
    if (recent.defectRate > previous.defectRate * 1.1) {
      insights.trendDirection = 'increasing';
      insights.majorConcerns.push('缺陷率呈上升趋势');
    } else if (recent.defectRate < previous.defectRate * 0.9) {
      insights.trendDirection = 'decreasing';
      insights.improvements.push('缺陷率持续下降');
    }
  }

  // 分析主要缺陷类型
  const majorDefectTypes = analysis.defectTypes
    .filter((type: any) => type.percentage > 10)
    .map((type: any) => type.type);
  
  if (majorDefectTypes.length > 0) {
    insights.majorConcerns.push(`主要缺陷类型: ${majorDefectTypes.join(', ')}`);
  }

  return insights;
}

function getDefectSeverity(defectRate: number): string {
  if (defectRate >= 5) return 'critical';
  if (defectRate >= 2) return 'high';
  if (defectRate >= 0.5) return 'medium';
  return 'low';
}

function generateDefectActionPlan(analysis: any): any[] {
  const plan: any[] = [];
  
  // 针对高影响根本原因制定行动
  analysis.rootCauses
    .filter((cause: any) => cause.frequency > 5)
    .slice(0, 3)
    .forEach((cause: any) => {
      plan.push({
        priority: 'high',
        action: `解决根本原因: ${cause.cause}`,
        preventiveMeasures: cause.preventiveMeasures,
        timeline: '30天'
      });
    });

  return plan;
}

function calculateComplianceScore(compliance: any): number {
  const totalStandards = compliance.standards.length;
  const compliantStandards = compliance.standards.filter(
    (s: any) => s.status === 'compliant'
  ).length;
  
  const totalCertifications = compliance.certifications.length;
  const validCertifications = compliance.certifications.filter(
    (c: any) => c.status === 'valid'
  ).length;
  
  const standardsScore = totalStandards > 0 ? (compliantStandards / totalStandards) * 60 : 0;
  const certificationsScore = totalCertifications > 0 ? (validCertifications / totalCertifications) * 40 : 0;
  
  return Math.round(standardsScore + certificationsScore);
}

function getComplianceStatus(score: number): string {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'acceptable';
  if (score >= 60) return 'needs_improvement';
  return 'non_compliant';
}

function generateComplianceRecommendations(compliance: any): string[] {
  const recommendations = [];
  
  // 针对不合规标准的建议
  const nonCompliantStandards = compliance.standards.filter(
    (s: any) => s.status === 'non_compliant'
  );
  
  if (nonCompliantStandards.length > 0) {
    recommendations.push('立即处理不合规标准要求');
  }
  
  // 针对过期认证的建议
  const expiredCertifications = compliance.certifications.filter(
    (c: any) => c.status === 'expired'
  );
  
  if (expiredCertifications.length > 0) {
    recommendations.push('更新过期认证');
  }
  
  return recommendations;
}

function generateQualityInsights(metrics: any): any {
  const insights = {
    strengths: [] as string[],
    concerns: [] as string[],
    trends: [] as string[]
  };

  if (metrics.passRate >= 95) {
    insights.strengths.push('测试通过率优秀');
  } else if (metrics.passRate < 90) {
    insights.concerns.push('测试通过率需要改善');
  }

  if (metrics.defectRate <= 1) {
    insights.strengths.push('缺陷率控制良好');
  } else if (metrics.defectRate > 3) {
    insights.concerns.push('缺陷率偏高，需要关注');
  }

  // 分析趋势
  metrics.trends.forEach((trend: any) => {
    if (trend.trend === 'improving') {
      insights.trends.push(`${trend.metric} 呈改善趋势`);
    } else if (trend.trend === 'declining') {
      insights.trends.push(`${trend.metric} 呈下降趋势，需要关注`);
    }
  });

  return insights;
}

function calculateQualityHealthScore(metrics: any): number {
  let score = 0;
  
  // 测试通过率权重40%
  score += (metrics.passRate / 100) * 40;
  
  // 缺陷率权重30% (缺陷率越低分数越高)
  score += Math.max(0, (5 - metrics.defectRate) / 5) * 30;
  
  // 客户满意度权重20%
  score += (metrics.customerSatisfaction / 100) * 20;
  
  // 过程能力权重10%
  score += Math.min(1, metrics.processCapability.cpk / 1.33) * 10;
  
  return Math.round(score);
}

function generateQualityAlerts(metrics: any): string[] {
  const alerts = [];
  
  if (metrics.passRate < 90) {
    alerts.push('测试通过率低于90%，需要立即关注');
  }
  
  if (metrics.defectRate > 3) {
    alerts.push('缺陷率超过3%，建议启动改进计划');
  }
  
  if (metrics.customerSatisfaction < 80) {
    alerts.push('客户满意度低于80%，需要改善服务质量');
  }
  
  return alerts;
}

function generateRadiationTestPlan(testingInfo: any): any {
  const plan = {
    immediateActions: [] as string[],
    scheduledTests: [] as any[],
    longTermPlanning: [] as string[]
  };

  if (testingInfo.currentStatus === 'not_tested') {
    plan.immediateActions.push('安排初始辐射测试');
  } else if (testingInfo.currentStatus === 'failed') {
    plan.immediateActions.push('分析失败原因并重新测试');
  }

  // 根据测试要求安排定期测试
  testingInfo.testRequirements.forEach((req: any) => {
    if (req.required) {
      plan.scheduledTests.push({
        testType: req.testType,
        frequency: req.frequency,
        nextDue: testingInfo.nextTestDate
      });
    }
  });

  return plan;
}

function calculateTestUrgency(testingInfo: any): string {
  if (testingInfo.currentStatus === 'failed') return 'immediate';
  if (testingInfo.currentStatus === 'not_tested') return 'high';
  
  if (testingInfo.nextTestDate) {
    const daysUntilNext = Math.ceil(
      (new Date(testingInfo.nextTestDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilNext <= 30) return 'high';
    if (daysUntilNext <= 90) return 'medium';
  }
  
  return 'low';
}

function assessRadiationCompliance(testingInfo: any): any {
  const requiredTests = testingInfo.testRequirements.filter((req: any) => req.required);
  const completedTests = testingInfo.testHistory.filter((test: any) => test.status === 'passed');
  
  return {
    compliant: testingInfo.currentStatus === 'passed',
    completionRate: requiredTests.length > 0 ? 
      (completedTests.length / requiredTests.length) * 100 : 0,
    missingTests: requiredTests.filter((req: any) => 
      !completedTests.some((test: any) => test.testType === req.testType)
    )
  };
}

function generateCalibrationAdvice(zeroingInfo: any): any {
  const advice = {
    priority: 'normal',
    actions: [] as string[],
    warnings: [] as string[]
  };

  if (zeroingInfo.status === 'overdue') {
    advice.priority = 'urgent';
    advice.actions.push('立即进行校准');
    advice.warnings.push('校准已过期，可能影响测量精度');
  } else if (zeroingInfo.status === 'due') {
    advice.priority = 'high';
    advice.actions.push('安排近期校准');
  }

  return advice;
}

function getCalibrationPriority(status: string): string {
  switch (status) {
    case 'overdue': return 'urgent';
    case 'due': return 'high';
    case 'current': return 'normal';
    default: return 'normal';
  }
}

function calculatePlanMetrics(plan: any): any {
  return {
    totalActions: plan.actions.length,
    totalPhases: plan.timeline.length,
    estimatedDuration: calculatePlanDuration(plan.timeline),
    riskLevel: assessPlanRisk(plan.actions),
    successProbability: calculateSuccessProbability(plan)
  };
}

function calculatePlanDuration(timeline: any[]): number {
  if (timeline.length === 0) return 0;
  
  const startDate = new Date(Math.min(...timeline.map(phase => new Date(phase.startDate).getTime())));
  const endDate = new Date(Math.max(...timeline.map(phase => new Date(phase.endDate).getTime())));
  
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

function assessPlanRisk(actions: any[]): string {
  const highRiskActions = actions.filter(action => 
    action.action.includes('critical') || action.action.includes('urgent')
  );
  
  if (highRiskActions.length > actions.length * 0.5) return 'high';
  if (highRiskActions.length > 0) return 'medium';
  return 'low';
}

function calculateSuccessProbability(plan: any): number {
  // 基于行动数量、时间线复杂度等因素计算成功概率
  let probability = 80; // 基础概率
  
  // 行动数量影响
  if (plan.actions.length > 10) probability -= 10;
  if (plan.actions.length > 20) probability -= 10;
  
  // 时间线影响
  if (plan.timeline.length > 5) probability -= 5;
  
  return Math.max(30, Math.min(95, probability));
}

function calculateEstimatedBenefit(plan: any): any {
  return {
    qualityImprovement: '15-25%',
    defectReduction: '30-50%',
    costSavings: '10-20%',
    timeframe: '6-12个月'
  };
}

function assessRiskMitigation(plan: any): any {
  return {
    identifiedRisks: plan.actions.filter((action: any) => action.action.includes('risk')).length,
    mitigationCoverage: '85%',
    contingencyPlans: plan.timeline.length,
    monitoringPoints: plan.successMetrics.length
  };
}

function generateBatchQualityInsights(batchResults: any): any {
  const insights: any = {
    topPerformers: [],
    qualityAlerts: [],
    trends: [],
    recommendations: []
  };

  // 识别质量优秀的器件
  if (batchResults.results.quality) {
    insights.topPerformers = batchResults.results.quality
      .filter((q: any) => q.overallQualityScore >= 90)
      .map((q: any) => ({ componentId: q.componentId, score: q.overallQualityScore }));
  }

  // 识别质量警报
  if (batchResults.results.defects) {
    insights.qualityAlerts = batchResults.results.defects
      .filter((d: any) => d.defectRate > 3)
      .map((d: any) => ({ componentId: d.componentId, defectRate: d.defectRate }));
  }

  // 生成建议
  if (insights.topPerformers.length > 0) {
    insights.recommendations.push('推广优秀器件的质量管理实践');
  }
  
  if (insights.qualityAlerts.length > 0) {
    insights.recommendations.push('立即制定高缺陷率器件的改进计划');
  }

  return insights;
}

// Functions are already exported above individually
