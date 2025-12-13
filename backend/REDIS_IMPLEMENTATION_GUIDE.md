# Redis缓存层实现指南

## 📋 概述

本指南详细说明如何为DoEEEt搜索引擎集成Redis缓存层，预期可将响应时间从200ms降至10-20ms。

---

## 🚀 快速开始

### 1. 安装Redis

#### Windows（推荐使用WSL或Docker）
```bash
# 使用Docker（推荐）
docker run -d --name redis -p 6379:6379 redis:7-alpine

# 或使用WSL安装
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

#### 验证安装
```bash
redis-cli ping
# 预期响应: PONG
```

---

### 2. 安装Node.js客户端

```bash
cd backend
npm install ioredis
npm install --save-dev @types/ioredis
```

---

## 📝 实现步骤

### 第一步：创建Redis配置

**文件**: `backend/src/config/redis.ts`

```typescript
import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Redis连接配置
const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
};

// 创建Redis客户端实例
export const redisClient = new Redis(redisConfig);

// 连接事件监听
redisClient.on('connect', () => {
  logger.info('✅ Redis连接成功');
});

redisClient.on('error', (error) => {
  logger.error('❌ Redis连接错误:', error);
});

redisClient.on('ready', () => {
  logger.info('🟢 Redis就绪');
});

redisClient.on('close', () => {
  logger.warn('⚠️  Redis连接关闭');
});

// 优雅关闭
process.on('SIGTERM', async () => {
  await redisClient.quit();
  logger.info('Redis连接已关闭');
});

export default redisClient;
```

---

### 第二步：创建缓存服务

**文件**: `backend/src/services/CacheService.ts`

```typescript
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

/**
 * 缓存服务类
 * 提供统一的缓存操作接口
 */
export class CacheService {
  private client = redisClient;
  
  /**
   * 生成缓存键
   */
  private generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `doeeet:${prefix}:${parts.join(':')}`;
  }
  
  /**
   * 设置缓存
   */
  async set(
    prefix: string, 
    key: string | number, 
    value: any, 
    ttl: number = 3600
  ): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(prefix, key);
      const serialized = JSON.stringify(value);
      
      await this.client.setex(cacheKey, ttl, serialized);
      logger.debug(`缓存已设置: ${cacheKey}, TTL: ${ttl}s`);
      
      return true;
    } catch (error) {
      logger.error('设置缓存失败:', error);
      return false;
    }
  }
  
  /**
   * 获取缓存
   */
  async get<T>(prefix: string, key: string | number): Promise<T | null> {
    try {
      const cacheKey = this.generateKey(prefix, key);
      const cached = await this.client.get(cacheKey);
      
      if (!cached) {
        logger.debug(`缓存未命中: ${cacheKey}`);
        return null;
      }
      
      logger.debug(`缓存命中: ${cacheKey}`);
      return JSON.parse(cached) as T;
    } catch (error) {
      logger.error('获取缓存失败:', error);
      return null;
    }
  }
  
  /**
   * 删除缓存
   */
  async del(prefix: string, key: string | number): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(prefix, key);
      await this.client.del(cacheKey);
      logger.debug(`缓存已删除: ${cacheKey}`);
      return true;
    } catch (error) {
      logger.error('删除缓存失败:', error);
      return false;
    }
  }
  
  /**
   * 批量删除（通过模式匹配）
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      
      await this.client.del(...keys);
      logger.info(`批量删除缓存: ${keys.length}个键`);
      return keys.length;
    } catch (error) {
      logger.error('批量删除缓存失败:', error);
      return 0;
    }
  }
  
  /**
   * 检查缓存是否存在
   */
  async exists(prefix: string, key: string | number): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(prefix, key);
      const result = await this.client.exists(cacheKey);
      return result === 1;
    } catch (error) {
      logger.error('检查缓存失败:', error);
      return false;
    }
  }
  
  /**
   * 设置哈希缓存
   */
  async hset(
    prefix: string,
    key: string,
    field: string,
    value: any,
    ttl?: number
  ): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(prefix, key);
      const serialized = JSON.stringify(value);
      
      await this.client.hset(cacheKey, field, serialized);
      
      if (ttl) {
        await this.client.expire(cacheKey, ttl);
      }
      
      return true;
    } catch (error) {
      logger.error('设置哈希缓存失败:', error);
      return false;
    }
  }
  
  /**
   * 获取哈希缓存
   */
  async hget<T>(prefix: string, key: string, field: string): Promise<T | null> {
    try {
      const cacheKey = this.generateKey(prefix, key);
      const cached = await this.client.hget(cacheKey, field);
      
      if (!cached) return null;
      
      return JSON.parse(cached) as T;
    } catch (error) {
      logger.error('获取哈希缓存失败:', error);
      return null;
    }
  }
  
  /**
   * 缓存统计
   */
  async getStats(): Promise<{
    used_memory: string;
    connected_clients: string;
    total_commands_processed: string;
    keyspace_hits: string;
    keyspace_misses: string;
    hit_rate: string;
  }> {
    try {
      const info = await this.client.info('stats');
      const memory = await this.client.info('memory');
      
      // 解析info字符串
      const parseInfo = (infoStr: string) => {
        const obj: any = {};
        infoStr.split('\r\n').forEach(line => {
          if (line && !line.startsWith('#')) {
            const [key, value] = line.split(':');
            if (key && value) obj[key] = value;
          }
        });
        return obj;
      };
      
      const stats = parseInfo(info);
      const memInfo = parseInfo(memory);
      
      const hits = parseInt(stats.keyspace_hits || '0');
      const misses = parseInt(stats.keyspace_misses || '0');
      const total = hits + misses;
      const hitRate = total > 0 ? ((hits / total) * 100).toFixed(2) : '0';
      
      return {
        used_memory: memInfo.used_memory_human,
        connected_clients: stats.connected_clients,
        total_commands_processed: stats.total_commands_processed,
        keyspace_hits: stats.keyspace_hits,
        keyspace_misses: stats.keyspace_misses,
        hit_rate: `${hitRate}%`
      };
    } catch (error) {
      logger.error('获取缓存统计失败:', error);
      throw error;
    }
  }
}

// 导出单例
export const cacheService = new CacheService();
```

---

### 第三步：集成到搜索服务

**更新文件**: `backend/src/services/DoeeetSearchService.ts`

```typescript
import { cacheService } from './CacheService';

export class DoeeetSearchService {
  
  /**
   * 全文搜索（带缓存）
   */
  async fullTextSearch(
    keyword: string,
    options: { limit?: number; hasStock?: boolean; obsolescenceType?: string[]; } = {}
  ): Promise<any[]> {
    try {
      // 生成缓存键
      const cacheKey = `fulltext:${keyword}:${JSON.stringify(options)}`;
      
      // 1. 尝试从缓存获取
      const cached = await cacheService.get<any[]>('search', cacheKey);
      if (cached) {
        logger.info(`全文搜索缓存命中: "${keyword}"`);
        return cached;
      }
      
      // 2. 执行数据库查询
      const limit = options.limit || 20;
      const query: any = { $text: { $search: keyword } };
      
      if (options.hasStock !== undefined) {
        query.has_stock = options.hasStock;
      }
      
      if (options.obsolescenceType && options.obsolescenceType.length > 0) {
        query.obsolescence_type = { $in: options.obsolescenceType };
      }
      
      const components = await DoeeetComponent.find(
        query,
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();
      
      // 3. 缓存结果（1小时）
      await cacheService.set('search', cacheKey, components, 3600);
      
      logger.info(`全文搜索 "${keyword}": 找到 ${components.length} 个结果`);
      return components;
      
    } catch (error) {
      logger.error('全文搜索失败:', error);
      throw new Error('全文搜索失败');
    }
  }
  
  /**
   * 获取制造商列表（带缓存）
   */
  async getManufacturers(): Promise<string[]> {
    try {
      // 1. 尝试从缓存获取
      const cached = await cacheService.get<string[]>('metadata', 'manufacturers');
      if (cached) {
        logger.info('制造商列表缓存命中');
        return cached;
      }
      
      // 2. 从数据库查询
      const manufacturers = await DoeeetComponent.distinct('manufacturer_name');
      const sorted = manufacturers.sort();
      
      // 3. 缓存结果（24小时）
      await cacheService.set('metadata', 'manufacturers', sorted, 86400);
      
      return sorted;
    } catch (error) {
      logger.error('获取制造商列表失败:', error);
      throw new Error('获取制造商列表失败');
    }
  }
  
  /**
   * 获取分类列表（带缓存）
   */
  async getFamilyPaths(): Promise<string[][]> {
    try {
      // 1. 尝试从缓存获取
      const cached = await cacheService.get<string[][]>('metadata', 'categories');
      if (cached) {
        logger.info('分类列表缓存命中');
        return cached;
      }
      
      // 2. 从数据库查询
      const paths = await DoeeetComponent.distinct('family_path');
      const sorted = paths.sort((a, b) => a.join(' > ').localeCompare(b.join(' > ')));
      
      // 3. 缓存结果（24小时）
      await cacheService.set('metadata', 'categories', sorted, 86400);
      
      return sorted;
    } catch (error) {
      logger.error('获取分类列表失败:', error);
      throw new Error('获取分类列表失败');
    }
  }
  
  /**
   * 获取统计信息（带缓存）
   */
  async getStatistics(): Promise<any> {
    try {
      // 1. 尝试从缓存获取
      const cached = await cacheService.get<any>('metadata', 'statistics');
      if (cached) {
        logger.info('统计信息缓存命中');
        return cached;
      }
      
      // 2. 从数据库查询
      const [
        totalComponents,
        activeComponents,
        obsoleteComponents,
        componentsInStock,
        manufacturers,
        categories
      ] = await Promise.all([
        DoeeetComponent.countDocuments(),
        DoeeetComponent.countDocuments({ obsolescence_type: 'Active' }),
        DoeeetComponent.countDocuments({ 
          obsolescence_type: { $in: ['Obsolete', 'Last Time Buy'] } 
        }),
        DoeeetComponent.countDocuments({ has_stock: true }),
        DoeeetComponent.distinct('manufacturer_name'),
        DoeeetComponent.distinct('family_path')
      ]);
      
      const stats = {
        totalComponents,
        activeComponents,
        obsoleteComponents,
        componentsInStock,
        manufacturerCount: manufacturers.length,
        categoryCount: categories.length
      };
      
      // 3. 缓存结果（1小时）
      await cacheService.set('metadata', 'statistics', stats, 3600);
      
      return stats;
    } catch (error) {
      logger.error('获取统计信息失败:', error);
      throw new Error('获取统计信息失败');
    }
  }
}
```

---

### 第四步：添加缓存管理API

**文件**: `backend/src/controllers/cacheController.ts`

```typescript
import { Request, Response } from 'express';
import { cacheService } from '../services/CacheService';
import { logger } from '../utils/logger';

/**
 * 获取缓存统计
 */
export const getCacheStats = async (req: Request, res: Response) => {
  try {
    const stats = await cacheService.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取缓存统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取缓存统计失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 清空搜索缓存
 */
export const clearSearchCache = async (req: Request, res: Response) => {
  try {
    const count = await cacheService.deletePattern('doeeet:search:*');
    
    res.json({
      success: true,
      message: `已清空${count}个搜索缓存`
    });
  } catch (error) {
    logger.error('清空搜索缓存失败:', error);
    res.status(500).json({
      success: false,
      message: '清空搜索缓存失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 清空元数据缓存
 */
export const clearMetadataCache = async (req: Request, res: Response) => {
  try {
    const count = await cacheService.deletePattern('doeeet:metadata:*');
    
    res.json({
      success: true,
      message: `已清空${count}个元数据缓存`
    });
  } catch (error) {
    logger.error('清空元数据缓存失败:', error);
    res.status(500).json({
      success: false,
      message: '清空元数据缓存失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};
```

**路由**: `backend/src/routes/cacheRoutes.ts`

```typescript
import { Router } from 'express';
import { getCacheStats, clearSearchCache, clearMetadataCache } from '../controllers/cacheController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /api/cache/stats - 获取缓存统计
router.get('/stats', asyncHandler(getCacheStats));

// POST /api/cache/clear/search - 清空搜索缓存
router.post('/clear/search', asyncHandler(clearSearchCache));

// POST /api/cache/clear/metadata - 清空元数据缓存
router.post('/clear/metadata', asyncHandler(clearMetadataCache));

export default router;
```

---

### 第五步：更新环境配置

**文件**: `backend/.env`

```env
# Redis配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

---

### 第六步：注册路由

**更新文件**: `backend/src/index.ts`

```typescript
import cacheRoutes from './routes/cacheRoutes';

// 缓存管理路由
app.use('/api/cache', cacheRoutes);
```

---

## 🧪 测试

### 1. 启动Redis
```bash
docker start redis
# 或
sudo service redis-server start
```

### 2. 启动后端服务
```bash
cd backend
npm run dev
```

### 3. 测试缓存功能

```bash
# 第一次搜索（无缓存）
curl "http://localhost:3001/api/doeeet/fulltext?q=TL084&limit=5"
# 响应时间: ~200ms

# 第二次搜索（有缓存）
curl "http://localhost:3001/api/doeeet/fulltext?q=TL084&limit=5"
# 响应时间: ~10ms

# 查看缓存统计
curl "http://localhost:3001/api/cache/stats"

# 清空搜索缓存
curl -X POST "http://localhost:3001/api/cache/clear/search"
```

---

## 📊 缓存策略

### 缓存时间（TTL）建议

| 数据类型 | TTL | 原因 |
|---------|-----|------|
| 搜索结果 | 1小时 (3600s) | 平衡实时性和性能 |
| 元数据（制造商、分类） | 24小时 (86400s) | 变化频率低 |
| 统计信息 | 1小时 (3600s) | 需要一定实时性 |
| 组件详情 | 6小时 (21600s) | 变化频率中等 |

### 缓存键命名规范

```
doeeet:{prefix}:{key}

示例:
doeeet:search:fulltext:TL084:{"limit":20}
doeeet:metadata:manufacturers
doeeet:metadata:categories
doeeet:component:12345
```

---

## 🎯 预期效果

### 性能提升

- ✅ 搜索响应时间: 200ms → 10-20ms (90%↓)
- ✅ 数据库负载: 降低80%
- ✅ 并发能力: 100 req/s → 1000+ req/s (10x↑)
- ✅ 缓存命中率: 目标80%+

### 资源消耗

- Redis内存: ~100-500MB（取决于缓存数据量）
- CPU: 几乎无额外开销
- 网络: 本地连接，延迟<1ms

---

## 🔧 故障处理

### Redis不可用时的降级策略

```typescript
async get<T>(prefix: string, key: string | number): Promise<T | null> {
  try {
    const cacheKey = this.generateKey(prefix, key);
    const cached = await this.client.get(cacheKey);
    
    if (!cached) return null;
    return JSON.parse(cached) as T;
  } catch (error) {
    // Redis不可用时，记录日志但不抛出异常
    logger.warn('Redis不可用，降级为无缓存模式:', error);
    return null;  // 返回null，让服务继续从数据库查询
  }
}
```

这样即使Redis故障，系统仍然可以正常运行，只是性能会下降。

---

## 📝 总结

完成这6个步骤后，您将获得：

1. ✅ 完整的Redis缓存层
2. ✅ 90%的性能提升
3. ✅ 缓存管理API
4. ✅ 缓存统计监控
5. ✅ 优雅的降级策略

**预计实施时间**: 1-2天

**下一步**: 继续实现参数对比功能或分面搜索

---

**文档版本**: v1.0  
**创建时间**: 2024-10-29  
**适用版本**: DoEEEt搜索引擎 v1.0

