import { Redis } from 'ioredis';
import { getRedisClient } from '../config/redis';
import crypto from 'crypto';

/**
 * 缓存TTL配置（秒）
 */
export const CacheTTL = {
  SEARCH_RESULT: 3600,        // 搜索结果: 1小时
  COMPONENT_DETAIL: 7200,     // 组件详情: 2小时
  MANUFACTURERS: 86400,       // 制造商列表: 24小时
  CATEGORIES: 86400,          // 分类树: 24小时
  PARAMETER_DEFS: 86400,      // 参数定义: 24小时
  FAMILY_META: 86400,         // 产品族元数据: 24小时
  SUGGESTIONS: 1800,          // 搜索建议: 30分钟
  STATISTICS: 3600,           // 统计数据: 1小时
  FACETS: 3600,               // 分面聚合: 1小时
} as const;

/**
 * 缓存统计接口
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  memory: string;
  keys: number;
  dbSize: number;
}

/**
 * Redis缓存服务
 * 
 * 提供统一的缓存操作接口，支持：
 * - 基础CRUD操作
 * - 批量操作
 * - 模式匹配删除
 * - 缓存统计
 * - 搜索结果缓存
 * - 组件数据缓存
 * - 元数据缓存
 */
export class CacheService {
  private redis: Redis;
  private hits: number = 0;
  private misses: number = 0;

  constructor(redisClient?: Redis) {
    this.redis = redisClient || getRedisClient();
  }

  // ============ 基础操作 ============

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 解析后的对象或null
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      
      if (value === null) {
        this.misses++;
        return null;
      }
      
      this.hits++;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`❌ 缓存获取失败 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值（会自动JSON序列化）
   * @param ttl 过期时间（秒），不传则永不过期
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      console.error(`❌ 缓存设置失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 删除缓存
   * @param key 缓存键
   * @returns 删除的键数量
   */
  async del(key: string): Promise<number> {
    try {
      return await this.redis.del(key);
    } catch (error) {
      console.error(`❌ 缓存删除失败 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`❌ 缓存检查失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 设置过期时间
   * @param key 缓存键
   * @param ttl 过期时间（秒）
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.redis.expire(key, ttl);
      return result === 1;
    } catch (error) {
      console.error(`❌ 设置过期时间失败 [${key}]:`, error);
      return false;
    }
  }

  // ============ 高级操作 ============

  /**
   * 获取或设置缓存（Lazy Loading模式）
   * 
   * 如果缓存存在，返回缓存值；
   * 如果缓存不存在，调用fetchFn获取数据并缓存
   * 
   * @param key 缓存键
   * @param fetchFn 数据获取函数
   * @param ttl 过期时间（秒）
   */
  async getOrSet<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // 1. 尝试从缓存获取
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // 2. 缓存未命中，从数据库获取
    try {
      const data = await fetchFn();
      
      // 3. 写入缓存
      await this.set(key, data, ttl);
      
      return data;
    } catch (error) {
      console.error(`❌ getOrSet失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 批量获取缓存
   * @param keys 缓存键数组
   * @returns 对应的值数组（未命中的为null）
   */
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) return [];

    try {
      const values = await this.redis.mget(...keys);
      
      return values.map((value) => {
        if (value === null) {
          this.misses++;
          return null;
        }
        
        this.hits++;
        return JSON.parse(value) as T;
      });
    } catch (error) {
      console.error('❌ 批量获取缓存失败:', error);
      return keys.map(() => null);
    }
  }

  /**
   * 批量设置缓存
   * @param entries 键值对数组 [key, value, ttl?]
   */
  async mset(entries: [string, any, number?][]): Promise<void> {
    if (entries.length === 0) return;

    try {
      const pipeline = this.redis.pipeline();
      
      for (const [key, value, ttl] of entries) {
        const serialized = JSON.stringify(value);
        
        if (ttl) {
          pipeline.setex(key, ttl, serialized);
        } else {
          pipeline.set(key, serialized);
        }
      }
      
      await pipeline.exec();
    } catch (error) {
      console.error('❌ 批量设置缓存失败:', error);
      throw error;
    }
  }

  /**
   * 删除匹配模式的所有键
   * 
   * 使用SCAN命令安全删除，避免阻塞Redis
   * 
   * @param pattern 匹配模式（支持*和?通配符）
   * @returns 删除的键数量
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      let cursor = '0';
      let deletedCount = 0;
      const matchPattern = pattern.startsWith('doeet:') ? pattern : `doeet:${pattern}`;

      do {
        // 使用SCAN遍历
        const [newCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          matchPattern,
          'COUNT',
          100
        );
        
        cursor = newCursor;
        
        if (keys.length > 0) {
          // 批量删除
          const deleted = await this.redis.del(...keys);
          deletedCount += deleted;
        }
      } while (cursor !== '0');

      console.log(`✅ 删除缓存模式 [${pattern}]: ${deletedCount}个键`);
      return deletedCount;
    } catch (error) {
      console.error(`❌ 删除缓存模式失败 [${pattern}]:`, error);
      return 0;
    }
  }

  // ============ 业务方法 - 搜索相关 ============

  /**
   * 生成查询Hash（用于缓存Key）
   * 
   * 对查询对象进行排序后生成MD5 hash，确保相同查询生成相同key
   */
  private generateQueryHash(query: any): string {
    // 排序对象键，确保相同查询生成相同hash
    const sorted = Object.keys(query)
      .sort()
      .reduce((acc, key) => {
        const value = query[key];
        // 处理数组和对象
        acc[key] = typeof value === 'object' ? JSON.stringify(value) : value;
        return acc;
      }, {} as any);

    const str = JSON.stringify(sorted);
    return crypto.createHash('md5').update(str).digest('hex').substring(0, 16);
  }

  /**
   * 缓存搜索结果
   * @param query 搜索查询对象
   * @param result 搜索结果
   */
  async cacheSearchResult(query: any, result: any): Promise<void> {
    const hash = this.generateQueryHash(query);
    const key = `search:query:${hash}`;
    
    await this.set(key, result, CacheTTL.SEARCH_RESULT);
  }

  /**
   * 获取缓存的搜索结果
   * @param query 搜索查询对象
   */
  async getCachedSearchResult(query: any): Promise<any | null> {
    const hash = this.generateQueryHash(query);
    const key = `search:query:${hash}`;
    
    return await this.get(key);
  }

  /**
   * 缓存全文搜索结果
   */
  async cacheFullTextSearchResult(query: string, page: number, result: any): Promise<void> {
    const hash = this.generateQueryHash({ query, page });
    const key = `search:fulltext:${hash}`;
    
    await this.set(key, result, CacheTTL.SEARCH_RESULT);
  }

  /**
   * 获取缓存的全文搜索结果
   */
  async getCachedFullTextSearchResult(query: string, page: number): Promise<any | null> {
    const hash = this.generateQueryHash({ query, page });
    const key = `search:fulltext:${hash}`;
    
    return await this.get(key);
  }

  /**
   * 缓存分类浏览结果
   */
  async cacheCategoryBrowse(familyPath: string[], page: number, result: any): Promise<void> {
    const pathStr = familyPath.join('/');
    const key = `search:category:${pathStr}:p${page}`;
    
    await this.set(key, result, CacheTTL.SEARCH_RESULT);
  }

  /**
   * 获取缓存的分类浏览结果
   */
  async getCachedCategoryBrowse(familyPath: string[], page: number): Promise<any | null> {
    const pathStr = familyPath.join('/');
    const key = `search:category:${pathStr}:p${page}`;
    
    return await this.get(key);
  }

  // ============ 业务方法 - 组件相关 ============

  /**
   * 缓存组件详情（包含参数）
   * @param componentId 组件ID
   * @param data 组件数据（包含参数）
   */
  async cacheComponentDetail(componentId: string, data: any): Promise<void> {
    const key = `component:detail:${componentId}`;
    await this.set(key, data, CacheTTL.COMPONENT_DETAIL);
  }

  /**
   * 获取缓存的组件详情
   * @param componentId 组件ID
   */
  async getCachedComponentDetail(componentId: string): Promise<any | null> {
    const key = `component:detail:${componentId}`;
    return await this.get(key);
  }

  /**
   * 批量缓存组件详情
   */
  async batchCacheComponentDetails(components: Array<{ id: string; data: any }>): Promise<void> {
    const entries: [string, any, number][] = components.map(({ id, data }) => [
      `component:detail:${id}`,
      data,
      CacheTTL.COMPONENT_DETAIL,
    ]);
    
    await this.mset(entries);
  }

  /**
   * 批量获取组件详情
   */
  async batchGetComponentDetails(componentIds: string[]): Promise<(any | null)[]> {
    const keys = componentIds.map((id) => `doeet:component:detail:${id}`);
    return await this.mget(keys);
  }

  // ============ 业务方法 - 元数据相关 ============

  /**
   * 缓存制造商列表
   */
  async cacheManufacturers(manufacturers: any[]): Promise<void> {
    await this.set('meta:manufacturers', manufacturers, CacheTTL.MANUFACTURERS);
  }

  /**
   * 获取缓存的制造商列表
   */
  async getCachedManufacturers(): Promise<any[] | null> {
    return await this.get('meta:manufacturers');
  }

  /**
   * 缓存分类树
   */
  async cacheCategoriesTree(tree: any): Promise<void> {
    await this.set('meta:categories:tree', tree, CacheTTL.CATEGORIES);
  }

  /**
   * 获取缓存的分类树
   */
  async getCachedCategoriesTree(): Promise<any | null> {
    return await this.get('meta:categories:tree');
  }

  /**
   * 缓存参数定义列表
   */
  async cacheParameterDefinitions(definitions: any[]): Promise<void> {
    await this.set('meta:parameter_definitions', definitions, CacheTTL.PARAMETER_DEFS);
  }

  /**
   * 获取缓存的参数定义列表
   */
  async getCachedParameterDefinitions(): Promise<any[] | null> {
    return await this.get('meta:parameter_definitions');
  }

  /**
   * 缓存产品族元数据
   */
  async cacheFamilyMeta(familyPath: string[], meta: any): Promise<void> {
    const pathStr = familyPath.join('/');
    const key = `meta:family:${pathStr}`;
    await this.set(key, meta, CacheTTL.FAMILY_META);
  }

  /**
   * 获取缓存的产品族元数据
   */
  async getCachedFamilyMeta(familyPath: string[]): Promise<any | null> {
    const pathStr = familyPath.join('/');
    const key = `meta:family:${pathStr}`;
    return await this.get(key);
  }

  /**
   * 缓存统计数据
   */
  async cacheStatistics(stats: any): Promise<void> {
    await this.set('meta:statistics', stats, CacheTTL.STATISTICS);
  }

  /**
   * 获取缓存的统计数据
   */
  async getCachedStatistics(): Promise<any | null> {
    return await this.get('meta:statistics');
  }

  // ============ 缓存失效 ============

  /**
   * 清除所有搜索缓存
   */
  async invalidateSearchCache(): Promise<number> {
    return await this.deletePattern('search:*');
  }

  /**
   * 清除特定组件的缓存
   */
  async invalidateComponentCache(componentId: string): Promise<void> {
    await this.del(`component:detail:${componentId}`);
    // 也清除搜索缓存，因为可能包含该组件
    await this.invalidateSearchCache();
  }

  /**
   * 清除所有元数据缓存
   */
  async invalidateMetaCache(): Promise<number> {
    return await this.deletePattern('meta:*');
  }

  /**
   * 清除所有缓存
   */
  async invalidateAllCache(): Promise<void> {
    await this.redis.flushdb();
    console.log('✅ 已清除所有缓存');
  }

  // ============ 统计和监控 ============

  /**
   * 获取缓存统计信息
   */
  async getCacheStats(): Promise<CacheStats> {
    try {
      // 获取内存信息
      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      const memory = memoryMatch ? memoryMatch[1].trim() : 'Unknown';

      // 获取key数量
      const dbSize = await this.redis.dbsize();

      // 计算命中率
      const total = this.hits + this.misses;
      const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

      return {
        hits: this.hits,
        misses: this.misses,
        hitRate: Math.round(hitRate * 100) / 100,
        memory,
        keys: dbSize,
        dbSize,
      };
    } catch (error) {
      console.error('❌ 获取缓存统计失败:', error);
      throw error;
    }
  }

  /**
   * 重置统计计数器
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 获取所有匹配的keys（用于调试）
   */
  async getKeys(pattern: string = '*'): Promise<string[]> {
    try {
      const matchPattern = pattern.startsWith('doeet:') ? pattern : `doeet:${pattern}`;
      const keys: string[] = [];
      let cursor = '0';

      do {
        const [newCursor, foundKeys] = await this.redis.scan(
          cursor,
          'MATCH',
          matchPattern,
          'COUNT',
          100
        );
        
        cursor = newCursor;
        keys.push(...foundKeys);
      } while (cursor !== '0');

      return keys;
    } catch (error) {
      console.error('❌ 获取keys失败:', error);
      return [];
    }
  }

  // ============ 连接管理 ============

  /**
   * 测试Redis连接
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('❌ Redis ping失败:', error);
      return false;
    }
  }

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

/**
 * 全局缓存服务单例
 */
let cacheServiceInstance: CacheService | null = null;

export function getCacheService(): CacheService {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService();
  }
  return cacheServiceInstance;
}

