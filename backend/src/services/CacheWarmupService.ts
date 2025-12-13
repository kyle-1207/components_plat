import { getCacheService } from './CacheService';
import { doeeetSearchService } from './DoeeetSearchService';
import { logger } from '../utils/logger';

/**
 * 缓存预热服务
 * 
 * 在应用启动时预热常用数据，提升响应速度
 */
export class CacheWarmupService {
  private cacheService = getCacheService();

  /**
   * 执行完整的缓存预热
   */
  async warmup(): Promise<void> {
    logger.info('🔥 开始缓存预热...');
    const startTime = Date.now();

    try {
      await Promise.all([
        this.warmupParameterDefinitions(),
        this.warmupManufacturers(),
        this.warmupCategoriesTree(),
        this.warmupStatistics(),
      ]);

      const duration = Date.now() - startTime;
      logger.info(`✅ 缓存预热完成！耗时: ${duration}ms`);
      
      // 显示缓存统计
      await this.showCacheStats();
    } catch (error) {
      logger.error('❌ 缓存预热失败:', error);
      throw error;
    }
  }

  /**
   * 预热参数定义（最常用）
   */
  private async warmupParameterDefinitions(): Promise<void> {
    try {
      const defs = await doeeetSearchService.getParameterDefinitions();
      logger.info(`  ✓ 参数定义: ${defs.length}条`);
    } catch (error) {
      logger.error('  ✗ 参数定义预热失败:', error);
    }
  }

  /**
   * 预热制造商列表
   */
  private async warmupManufacturers(): Promise<void> {
    try {
      const manufacturers = await doeeetSearchService.getManufacturers();
      logger.info(`  ✓ 制造商列表: ${manufacturers.length}个`);
    } catch (error) {
      logger.error('  ✗ 制造商列表预热失败:', error);
    }
  }

  /**
   * 预热分类树
   */
  private async warmupCategoriesTree(): Promise<void> {
    try {
      const categories = await doeeetSearchService.getFamilyPaths();
      logger.info(`  ✓ 分类树: ${categories.length}个分类`);
    } catch (error) {
      logger.error('  ✗ 分类树预热失败:', error);
    }
  }

  /**
   * 预热统计数据
   */
  private async warmupStatistics(): Promise<void> {
    try {
      const stats = await doeeetSearchService.getStatistics();
      logger.info(`  ✓ 统计数据: ${stats.totalComponents}个组件`);
    } catch (error) {
      logger.error('  ✗ 统计数据预热失败:', error);
    }
  }

  /**
   * 预热热门搜索（可选）
   * 
   * 可以根据实际情况添加热门搜索词
   */
  async warmupPopularSearches(keywords: string[]): Promise<void> {
    logger.info('🔥 预热热门搜索...');

    for (const keyword of keywords) {
      try {
        await doeeetSearchService.fullTextSearch(keyword, { limit: 20, page: 1 });
        logger.info(`  ✓ 搜索词 "${keyword}"`);
      } catch (error) {
        logger.error(`  ✗ 搜索词 "${keyword}" 预热失败:`, error);
      }
    }
  }

  /**
   * 显示缓存统计
   */
  private async showCacheStats(): Promise<void> {
    try {
      const stats = await this.cacheService.getCacheStats();
      logger.info('📊 缓存统计:');
      logger.info(`  - 键数量: ${stats.keys}`);
      logger.info(`  - 内存使用: ${stats.memory}`);
      logger.info(`  - 命中率: ${stats.hitRate.toFixed(2)}%`);
      logger.info(`  - 命中次数: ${stats.hits}`);
      logger.info(`  - 未命中次数: ${stats.misses}`);
    } catch (error) {
      logger.error('❌ 获取缓存统计失败:', error);
    }
  }

  /**
   * 清除所有缓存
   */
  async clearAllCache(): Promise<void> {
    logger.info('🗑️  清除所有缓存...');
    await this.cacheService.invalidateAllCache();
    logger.info('✅ 缓存已清除');
  }

  /**
   * 清除搜索缓存
   */
  async clearSearchCache(): Promise<void> {
    logger.info('🗑️  清除搜索缓存...');
    const count = await this.cacheService.invalidateSearchCache();
    logger.info(`✅ 已清除 ${count} 个搜索缓存`);
  }

  /**
   * 清除元数据缓存
   */
  async clearMetaCache(): Promise<void> {
    logger.info('🗑️  清除元数据缓存...');
    const count = await this.cacheService.invalidateMetaCache();
    logger.info(`✅ 已清除 ${count} 个元数据缓存`);
  }
}

// 导出单例
export const cacheWarmupService = new CacheWarmupService();

