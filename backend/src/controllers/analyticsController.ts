import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { AnalyticsService } from '../services';

const analyticsService = new AnalyticsService();

// 获取市场趋势分析
export const getMarketTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, timeRange = '30d' } = req.query;
    
    if (!category) {
      throw new CustomError('请指定器件类别', 400, 'MISSING_CATEGORY');
    }

    const trends = await analyticsService.getMarketTrends(
      category as string, 
      timeRange as '7d' | '30d' | '90d' | '1y'
    );

    const response: ApiResponse = {
      success: true,
      data: {
        category,
        timeRange,
        trends,
        totalPeriods: trends.length
      },
      message: `获取 ${category} 类别 ${timeRange} 时间段的市场趋势`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('获取市场趋势失败:', error);
    throw new CustomError('获取市场趋势失败', 500);
  }
};

// 获取器件使用统计
export const getComponentUsageStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentIds, timeRange = '30d' } = req.body;

    const stats = await analyticsService.getComponentUsageStats(
      componentIds,
      timeRange as '7d' | '30d' | '90d'
    );

    const response: ApiResponse = {
      success: true,
      data: {
        timeRange,
        stats,
        totalComponents: stats.length,
        summary: {
          totalSearches: stats.reduce((sum, stat) => sum + stat.searchCount, 0),
          totalOrders: stats.reduce((sum, stat) => sum + stat.orderCount, 0),
          totalViews: stats.reduce((sum, stat) => sum + stat.viewCount, 0)
        }
      },
      message: `获取 ${stats.length} 个器件的使用统计`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('获取使用统计失败:', error);
    throw new CustomError('获取使用统计失败', 500);
  }
};

// 价格分析和预测
export const analyzePrices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentIds } = req.body;
    
    if (!componentIds || !Array.isArray(componentIds) || componentIds.length === 0) {
      throw new CustomError('请提供要分析的器件ID列表', 400, 'MISSING_COMPONENT_IDS');
    }

    const analyses = await analyticsService.analyzePrices(componentIds);

    const response: ApiResponse = {
      success: true,
      data: {
        analyses,
        summary: {
          totalComponents: analyses.length,
          averageCurrentPrice: analyses.reduce((sum, analysis) => sum + analysis.currentPrice, 0) / analyses.length,
          priceRanges: {
            min: Math.min(...analyses.map(a => a.priceRange.min)),
            max: Math.max(...analyses.map(a => a.priceRange.max))
          }
        }
      },
      message: `完成 ${analyses.length} 个器件的价格分析`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('价格分析失败:', error);
    throw new CustomError('价格分析失败', 500);
  }
};

// 供应链风险评估
export const assessSupplyChainRisk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentIds } = req.body;
    
    if (!componentIds || !Array.isArray(componentIds) || componentIds.length === 0) {
      throw new CustomError('请提供要评估的器件ID列表', 400, 'MISSING_COMPONENT_IDS');
    }

    const riskAssessments = await analyticsService.assessSupplyChainRisk(componentIds);

    // 统计风险等级分布
    const riskDistribution = riskAssessments.reduce((acc, assessment) => {
      acc[assessment.riskLevel] = (acc[assessment.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response: ApiResponse = {
      success: true,
      data: {
        assessments: riskAssessments,
        summary: {
          totalComponents: riskAssessments.length,
          riskDistribution,
          highRiskComponents: riskAssessments.filter(a => a.riskLevel === 'high' || a.riskLevel === 'critical').length,
          averageRiskFactors: riskAssessments.reduce((sum, a) => sum + a.riskFactors.length, 0) / riskAssessments.length
        }
      },
      message: `完成 ${riskAssessments.length} 个器件的供应链风险评估`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('供应链风险评估失败:', error);
    throw new CustomError('供应链风险评估失败', 500);
  }
};

// 成本优化分析
export const analyzeCostOptimization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bomComponents } = req.body;
    
    if (!bomComponents || !Array.isArray(bomComponents) || bomComponents.length === 0) {
      throw new CustomError('请提供BOM器件列表', 400, 'MISSING_BOM_COMPONENTS');
    }

    // 验证BOM格式
    for (const item of bomComponents) {
      if (!item.componentId || !item.quantity) {
        throw new CustomError('BOM项目必须包含componentId和quantity', 400, 'INVALID_BOM_FORMAT');
      }
    }

    const optimization = await analyticsService.analyzeCostOptimization(bomComponents);

    const totalSavings = optimization.optimizationOpportunities.reduce(
      (sum, opp) => sum + opp.savings, 0
    );

    const response: ApiResponse = {
      success: true,
      data: {
        ...optimization,
        summary: {
          totalComponents: bomComponents.length,
          totalCurrentCost: optimization.totalCost,
          totalPotentialSavings: totalSavings,
          savingsPercentage: optimization.totalCost > 0 ? (totalSavings / optimization.totalCost * 100) : 0,
          optimizationOpportunities: optimization.optimizationOpportunities.length,
          alternativeOptions: optimization.alternativeBom.length
        }
      },
      message: `识别出 ${optimization.optimizationOpportunities.length} 个成本优化机会`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('成本优化分析失败:', error);
    throw new CustomError('成本优化分析失败', 500);
  }
};

// 技术趋势预测
export const predictTechnologyTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    
    if (!category) {
      throw new CustomError('请指定器件类别', 400, 'MISSING_CATEGORY');
    }

    const prediction = await analyticsService.predictTechnologyTrends(category as string);

    const response: ApiResponse = {
      success: true,
      data: {
        category,
        ...prediction,
        summary: {
          emergingTechnologiesCount: prediction.emergingTechnologies.length,
          highImpactTechnologies: prediction.emergingTechnologies.filter(
            tech => tech.impactLevel === 'high'
          ).length,
          criticalObsolescenceRisks: prediction.obsolescenceRisk.filter(
            risk => risk.riskLevel > 80
          ).length,
          innovationOpportunitiesCount: prediction.innovationOpportunities.length
        }
      },
      message: `完成 ${category} 类别的技术趋势预测`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('技术趋势预测失败:', error);
    throw new CustomError('技术趋势预测失败', 500);
  }
};

// 综合分析报告
export const generateAnalyticsReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      categories, 
      timeRange = '30d', 
      includeMarketTrends = true,
      includePriceAnalysis = true,
      includeRiskAssessment = true,
      includeTechTrends = true 
    } = req.body;
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      throw new CustomError('请指定要分析的器件类别', 400, 'MISSING_CATEGORIES');
    }

    const report: any = {
      reportId: `ANALYTICS_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      timeRange,
      categories,
      sections: {}
    };

    // 并行执行各种分析
    const analysisPromises = [];

    if (includeMarketTrends) {
      analysisPromises.push(
        Promise.all(categories.map(category => 
          analyticsService.getMarketTrends(category, timeRange as any)
        )).then(trends => {
          report.sections.marketTrends = trends;
        })
      );
    }

    if (includeTechTrends) {
      analysisPromises.push(
        Promise.all(categories.map(category => 
          analyticsService.predictTechnologyTrends(category)
        )).then(predictions => {
          report.sections.technologyTrends = predictions;
        })
      );
    }

    // 等待所有分析完成
    await Promise.all(analysisPromises);

    // 生成执行摘要
    report.executiveSummary = generateExecutiveSummary(report);

    const response: ApiResponse = {
      success: true,
      data: report,
      message: `生成包含 ${categories.length} 个类别的综合分析报告`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('生成分析报告失败:', error);
    throw new CustomError('生成分析报告失败', 500);
  }
};

// 生成执行摘要
function generateExecutiveSummary(report: any): any {
  const summary: any = {
    totalCategories: report.categories.length,
    analysisDate: report.generatedAt,
    keyInsights: [],
    recommendations: [],
    riskAlerts: []
  };

  // 分析市场趋势洞察
  if (report.sections.marketTrends) {
    const allTrends = report.sections.marketTrends.flat();
    const avgPriceChange = allTrends.reduce((sum: number, trend: any) => sum + trend.priceChange, 0) / allTrends.length;
    
    if (avgPriceChange > 10) {
      summary.keyInsights.push('整体市场价格呈上升趋势');
      summary.riskAlerts.push('价格上涨风险：建议提前备货');
    } else if (avgPriceChange < -10) {
      summary.keyInsights.push('整体市场价格呈下降趋势');
      summary.recommendations.push('机会：考虑延迟采购以获得更好价格');
    }
  }

  // 分析技术趋势
  if (report.sections.technologyTrends) {
    const allTechTrends = report.sections.technologyTrends.flat();
    const highImpactTechs = allTechTrends.filter((trend: any) => 
      trend.emergingTechnologies.some((tech: any) => tech.impactLevel === 'high')
    );
    
    if (highImpactTechs.length > 0) {
      summary.keyInsights.push(`发现 ${highImpactTechs.length} 个高影响新兴技术`);
      summary.recommendations.push('建议关注新兴技术发展，制定技术升级计划');
    }
  }

  return summary;
}

// Functions are already exported above individually
