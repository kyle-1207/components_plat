import { IComponent, Component } from '../models/Component';

export interface CategoryStats {
  category: string;
  level: number; // 0 = most specific, increases with generalization
  count: number;
  percentage: number;
  path: string[]; // full path from specific to general
}

export interface MarketTrendData {
  period: string;
  averagePrice: number;
  totalVolume: number;
  priceChange: number;
  volumeChange: number;
  topManufacturers: {
    name: string;
    marketShare: number;
  }[];
}

export interface ComponentUsageStats {
  componentId: string;
  partNumber: string;
  searchCount: number;
  orderCount: number;
  viewCount: number;
  lastSearchDate: Date;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface PriceAnalysis {
  componentId: string;
  currentPrice: number;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  priceHistory: {
    date: Date;
    price: number;
  }[];
  prediction: {
    nextMonthPrice: number;
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface SupplyChainRisk {
  componentId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: {
    type: 'supplier' | 'geographic' | 'demand' | 'regulatory';
    description: string;
    impact: number;
  }[];
  mitigation: string[];
  alternativeComponents: string[];
}

export class AnalyticsService {
  /**
   * 获取分类统计
   * 基于 family_path 字段统计各分类的组件数量
   * 
   * @param level - 分类层级
   *   - level 0: 顶层分类（family_path 的最后一个元素）
   *   - level 1: 次级分类（family_path 倒数第二个元素）
   *   - level N: 从后往前数第 N+1 个元素
   * @param parentPath - 指定父路径，只统计该路径下的子分类
   */
  async getCategoryStats(
    level?: number, // 指定层级，undefined 表示所有层级
    parentPath?: string[] // 指定父路径，只统计该路径下的子分类
  ): Promise<CategoryStats[]> {
    try {
      const totalComponents = await Component.countDocuments({ family_path: { $ne: [] } });
      
      const pipeline: any[] = [
        // 只考虑有分类的组件
        { $match: { family_path: { $ne: [] } } }
      ];

      // 如果指定了父路径，只统计该路径下的组件
      if (parentPath && parentPath.length > 0) {
        pipeline.push({
          $match: {
            family_path: {
              $all: parentPath,
              $size: { $gt: parentPath.length }
            }
          }
        });
      }

      // 添加字段用于提取指定层级的分类
      // level 0 表示顶层（最后一个元素），level 1 表示次级（倒数第二个），以此类推
      const levelToExtract = level !== undefined ? level : 0;
      pipeline.push(
        {
          $addFields: {
            pathLength: { $size: '$family_path' },
            // 从后往前数：-1 是最后一个，-2 是倒数第二个
            arrayIndex: {
              $subtract: [
                { $size: '$family_path' },
                levelToExtract + 1
              ]
            }
          }
        },
        // 过滤掉路径长度不足的组件
        {
          $match: {
            pathLength: { $gt: levelToExtract },
            arrayIndex: { $gte: 0 }
          }
        },
        {
          $addFields: {
            categoryAtLevel: { $arrayElemAt: ['$family_path', '$arrayIndex'] }
          }
        },
        // 按分类分组统计
        {
          $group: {
            _id: '$categoryAtLevel',
            count: { $sum: 1 },
            samplePath: { $first: '$family_path' }
          }
        },
        // 排序
        { $sort: { count: -1 } }
      );

      const results = await Component.aggregate(pipeline).exec();

      // 计算百分比并格式化结果
      const stats: CategoryStats[] = results.map((r: any) => ({
        category: r._id,
        level: levelToExtract,
        count: r.count,
        percentage: (r.count / totalComponents) * 100,
        path: r.samplePath
      }));

      return stats;
    } catch (error) {
      console.error('Category stats error:', error);
      throw new Error('分类统计失败');
    }
  }

  /**
   * 获取完整的分类层次结构
   * 返回树形结构的分类统计
   */
  async getCategoryHierarchy(): Promise<any> {
    try {
      // 获取所有唯一的分类路径
      const paths = await Component.aggregate([
        { $match: { family_path: { $ne: [] } } },
        { $group: { _id: '$family_path', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).exec();

      // 构建树形结构
      const tree: any = {};
      const totalComponents = paths.reduce((sum: number, p: any) => sum + p.count, 0);

      for (const pathData of paths) {
        const path = pathData._id;
        const count = pathData.count;
        let currentLevel = tree;

        for (let i = path.length - 1; i >= 0; i--) {
          const category = path[i];
          
          if (!currentLevel[category]) {
            currentLevel[category] = {
              name: category,
              level: path.length - 1 - i,
              count: 0,
              percentage: 0,
              children: {}
            };
          }
          
          currentLevel[category].count += count;
          currentLevel = currentLevel[category].children;
        }
      }

      // 计算百分比
      const calculatePercentages = (node: any) => {
        node.percentage = (node.count / totalComponents) * 100;
        for (const child of Object.values(node.children)) {
          calculatePercentages(child);
        }
      };

      for (const node of Object.values(tree)) {
        calculatePercentages(node);
      }

      return tree;
    } catch (error) {
      console.error('Category hierarchy error:', error);
      throw new Error('分类层次结构获取失败');
    }
  }

  /**
   * 市场趋势分析
   * 分析器件类别的市场趋势，包括价格变化、需求量变化等
   */
  async getMarketTrends(
    category: string,
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<MarketTrendData[]> {
    try {
      const endDate = new Date();
      const startDate = this.calculateStartDate(endDate, timeRange);
      
      // 获取历史数据
      const historicalData = await this.getHistoricalMarketData(category, startDate, endDate);
      
      // 分析趋势
      const trendData = this.analyzeTrends(historicalData);
      
      return trendData;
    } catch (error) {
      console.error('Market trend analysis error:', error);
      throw new Error('市场趋势分析失败');
    }
  }

  /**
   * 器件使用统计
   * 分析器件的搜索、查看、订购等使用统计
   */
  async getComponentUsageStats(
    componentIds?: string[],
    timeRange: '7d' | '30d' | '90d' = '30d'
  ): Promise<ComponentUsageStats[]> {
    try {
      const endDate = new Date();
      const startDate = this.calculateStartDate(endDate, timeRange);
      
      // 获取使用统计数据
      const usageData = await this.getUsageData(componentIds, startDate, endDate);
      
      // 计算趋势方向
      const statsWithTrend = usageData.map(stat => ({
        ...stat,
        trendDirection: this.calculateTrendDirection(stat) as 'up' | 'down' | 'stable'
      }));
      
      return statsWithTrend;
    } catch (error) {
      console.error('Usage stats error:', error);
      throw new Error('使用统计分析失败');
    }
  }

  /**
   * 价格分析和预测
   * 分析器件价格趋势并预测未来价格
   */
  async analyzePrices(componentIds: string[]): Promise<PriceAnalysis[]> {
    try {
      const analyses: PriceAnalysis[] = [];
      
      for (const componentId of componentIds) {
        // 获取价格历史数据
        const priceHistory = await this.getPriceHistory(componentId);
        
        if (priceHistory.length === 0) {
          continue;
        }
        
        // 计算统计指标
        const currentPrice = priceHistory[priceHistory.length - 1].price;
        const prices = priceHistory.map(p => p.price);
        const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        
        // 价格预测
        const prediction = await this.predictPrice(priceHistory);
        
        analyses.push({
          componentId,
          currentPrice,
          averagePrice,
          priceRange: {
            min: Math.min(...prices),
            max: Math.max(...prices)
          },
          priceHistory,
          prediction
        });
      }
      
      return analyses;
    } catch (error) {
      console.error('Price analysis error:', error);
      throw new Error('价格分析失败');
    }
  }

  /**
   * 供应链风险评估
   * 评估器件的供应链风险并提供缓解建议
   */
  async assessSupplyChainRisk(componentIds: string[]): Promise<SupplyChainRisk[]> {
    try {
      const riskAssessments: SupplyChainRisk[] = [];
      
      for (const componentId of componentIds) {
        // 获取器件供应链信息
        const supplyChainInfo = await this.getSupplyChainInfo(componentId);
        
        // 评估风险因素
        const riskFactors = await this.evaluateRiskFactors(componentId, supplyChainInfo);
        
        // 计算总体风险等级
        const riskLevel = this.calculateOverallRisk(riskFactors);
        
        // 生成缓解建议
        const mitigation = this.generateMitigationStrategies(riskFactors);
        
        // 查找替代器件
        const alternativeComponents = await this.findAlternativeComponents(componentId);
        
        riskAssessments.push({
          componentId,
          riskLevel,
          riskFactors,
          mitigation,
          alternativeComponents
        });
      }
      
      return riskAssessments;
    } catch (error) {
      console.error('Supply chain risk assessment error:', error);
      throw new Error('供应链风险评估失败');
    }
  }

  /**
   * 成本优化分析
   * 分析器件成本优化机会
   */
  async analyzeCostOptimization(
    bomComponents: { componentId: string; quantity: number }[]
  ): Promise<{
    totalCost: number;
    optimizationOpportunities: {
      componentId: string;
      currentCost: number;
      optimizedCost: number;
      savings: number;
      strategy: string;
    }[];
    alternativeBom: {
      componentId: string;
      alternativeId: string;
      costSavings: number;
      riskLevel: string;
    }[];
  }> {
    try {
      let totalCost = 0;
      const optimizationOpportunities = [];
      const alternativeBom = [];
      
      for (const item of bomComponents) {
        // 获取当前器件成本
        const currentCost = await this.getComponentCost(item.componentId, item.quantity);
        totalCost += currentCost;
        
        // 分析优化机会
        const opportunities = await this.findCostOptimizationOpportunities(
          item.componentId, 
          item.quantity
        );
        
        if (opportunities.length > 0) {
          optimizationOpportunities.push(...opportunities);
        }
        
        // 查找替代器件
        const alternatives = await this.findCostEffectiveAlternatives(item.componentId);
        if (alternatives.length > 0) {
          alternativeBom.push(...alternatives);
        }
      }
      
      return {
        totalCost,
        optimizationOpportunities,
        alternativeBom
      };
    } catch (error) {
      console.error('Cost optimization analysis error:', error);
      throw new Error('成本优化分析失败');
    }
  }

  /**
   * 技术趋势预测
   * 预测技术发展趋势和新兴器件
   */
  async predictTechnologyTrends(category: string): Promise<{
    emergingTechnologies: {
      name: string;
      description: string;
      maturityLevel: number;
      adoptionRate: number;
      impactLevel: 'low' | 'medium' | 'high';
    }[];
    obsolescenceRisk: {
      componentId: string;
      riskLevel: number;
      timeToObsolescence: number;
      recommendedAction: string;
    }[];
    innovationOpportunities: {
      area: string;
      potential: number;
      description: string;
    }[];
  }> {
    try {
      // 分析新兴技术
      const emergingTechnologies = await this.analyzeEmergingTechnologies(category);
      
      // 评估过时风险
      const obsolescenceRisk = await this.assessObsolescenceRisk(category);
      
      // 识别创新机会
      const innovationOpportunities = await this.identifyInnovationOpportunities(category);
      
      return {
        emergingTechnologies,
        obsolescenceRisk,
        innovationOpportunities
      };
    } catch (error) {
      console.error('Technology trend prediction error:', error);
      throw new Error('技术趋势预测失败');
    }
  }

  // 私有辅助方法
  private calculateStartDate(endDate: Date, timeRange: string): Date {
    const date = new Date(endDate);
    
    switch (timeRange) {
      case '7d':
        date.setDate(date.getDate() - 7);
        break;
      case '30d':
        date.setDate(date.getDate() - 30);
        break;
      case '90d':
        date.setDate(date.getDate() - 90);
        break;
      case '1y':
        date.setFullYear(date.getFullYear() - 1);
        break;
    }
    
    return date;
  }

  private async getHistoricalMarketData(
    category: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<any[]> {
    // 获取历史市场数据的实现
    return [];
  }

  private analyzeTrends(historicalData: any[]): MarketTrendData[] {
    // 分析趋势数据的实现
    return [];
  }

  private async getUsageData(
    componentIds: string[] | undefined, 
    startDate: Date, 
    endDate: Date
  ): Promise<ComponentUsageStats[]> {
    // 获取使用数据的实现
    return [];
  }

  private calculateTrendDirection(stat: ComponentUsageStats): string {
    // 计算趋势方向的实现
    return 'stable';
  }

  private async getPriceHistory(componentId: string): Promise<{ date: Date; price: number }[]> {
    // 获取价格历史的实现
    return [];
  }

  private async predictPrice(priceHistory: { date: Date; price: number }[]): Promise<{
    nextMonthPrice: number;
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }> {
    // 价格预测算法实现
    return {
      nextMonthPrice: 0,
      confidence: 0,
      trend: 'stable'
    };
  }

  private async getSupplyChainInfo(componentId: string): Promise<any> {
    // 获取供应链信息的实现
    return {};
  }

  private async evaluateRiskFactors(componentId: string, supplyChainInfo: any): Promise<any[]> {
    // 评估风险因素的实现
    return [];
  }

  private calculateOverallRisk(riskFactors: any[]): 'low' | 'medium' | 'high' | 'critical' {
    // 计算总体风险等级的实现
    return 'low';
  }

  private generateMitigationStrategies(riskFactors: any[]): string[] {
    // 生成缓解策略的实现
    return [];
  }

  private async findAlternativeComponents(componentId: string): Promise<string[]> {
    // 查找替代器件的实现
    return [];
  }

  private async getComponentCost(componentId: string, quantity: number): Promise<number> {
    // 获取器件成本的实现
    return 0;
  }

  private async findCostOptimizationOpportunities(
    componentId: string, 
    quantity: number
  ): Promise<any[]> {
    // 查找成本优化机会的实现
    return [];
  }

  private async findCostEffectiveAlternatives(componentId: string): Promise<any[]> {
    // 查找成本效益替代方案的实现
    return [];
  }

  private async analyzeEmergingTechnologies(category: string): Promise<any[]> {
    // 分析新兴技术的实现
    return [];
  }

  private async assessObsolescenceRisk(category: string): Promise<any[]> {
    // 评估过时风险的实现
    return [];
  }

  private async identifyInnovationOpportunities(category: string): Promise<any[]> {
    // 识别创新机会的实现
    return [];
  }
}

export default AnalyticsService;
