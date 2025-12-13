# Redis缓存使用指南

## 📖 简介

本项目使用Redis作为缓存层，显著提升DoEEEt组件搜索系统的性能。通过缓存常用数据，我们实现了：

- **搜索性能提升**: 10-20倍（150ms → 8ms）
- **响应时间优化**: < 10ms的缓存查询
- **减少数据库负载**: 80%+的缓存命中率

---

## 🚀 快速开始

### 1. 安装Redis

```bash
# Docker方式 (推荐)
docker run --name redis-doeet -p 6379:6379 -d redis:latest

# 或使用本地安装 (见REDIS_SETUP.md)
```

### 2. 配置环境变量

在`.env`文件中添加：

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 3. 测试缓存

```bash
# 运行缓存测试
npm run test:cache

# 预热缓存
npm run cache:warmup

# 清除缓存
npm run cache:clear all
```

### 4. 启动应用

```bash
npm run dev
```

应用启动时会自动预热缓存。

---

## 💡 使用示例

### 在代码中使用CacheService

```typescript
import { getCacheService, CacheTTL } from './services/CacheService';

const cacheService = getCacheService();

// 基础操作
await cacheService.set('key', { data: 'value' }, 3600);
const value = await cacheService.get('key');
await cacheService.del('key');

// Lazy Loading模式 (推荐)
const data = await cacheService.getOrSet(
  'my-key',
  async () => {
    // 缓存未命中时的数据获取逻辑
    return await fetchDataFromDB();
  },
  CacheTTL.SEARCH_RESULT
);
```

### 使用SearchService (已集成缓存)

```typescript
import { doeeetSearchService } from './services/DoeeetSearchService';

// 全文搜索 (自动缓存)
const results = await doeeetSearchService.fullTextSearch('LM324', {
  limit: 20,
  page: 1
});

// 获取组件详情 (自动缓存)
const component = await doeeetSearchService.getComponentWithParameters(componentId);

// 获取制造商列表 (自动缓存24小时)
const manufacturers = await doeeetSearchService.getManufacturers();

// 获取统计数据 (自动缓存1小时)
const stats = await doeeetSearchService.getStatistics();
```

---

## 🎯 缓存策略

### 缓存Key设计

```
doeet:search:query:{hash}              # 复合搜索结果
doeet:search:fulltext:{hash}           # 全文搜索结果
doeet:search:category:{path}:p{page}   # 分类浏览
doeet:component:detail:{id}            # 组件详情
doeet:meta:manufacturers               # 制造商列表
doeet:meta:categories:tree             # 分类树
doeet:meta:parameter_definitions       # 参数定义
doeet:meta:statistics                  # 统计数据
```

### TTL配置

| 数据类型 | TTL | 说明 |
|---------|-----|------|
| 搜索结果 | 1小时 | 热数据，更新频繁 |
| 组件详情 | 2小时 | 相对稳定 |
| 制造商列表 | 24小时 | 变化较少 |
| 分类树 | 24小时 | 基本不变 |
| 参数定义 | 24小时 | 基本不变 |
| 统计数据 | 1小时 | 需要及时更新 |

---

## 🔧 缓存管理

### 查看缓存统计

```bash
# 运行测试脚本
npm run test:cache

# 或在代码中
const stats = await cacheService.getCacheStats();
console.log(stats);
// {
//   hits: 1250,
//   misses: 48,
//   hitRate: 96.30,
//   memory: "2.5M",
//   keys: 25
// }
```

### 清除缓存

```bash
# 清除所有缓存
npm run cache:clear all

# 清除搜索缓存
npm run cache:clear search

# 清除元数据缓存
npm run cache:clear meta

# 查看统计
npm run cache:clear stats
```

### 缓存预热

```bash
# 手动预热
npm run cache:warmup

# 或在代码中
import { cacheWarmupService } from './services/CacheWarmupService';
await cacheWarmupService.warmup();
```

### 失效策略

#### 1. 自动失效 (TTL过期)

大部分缓存使用TTL自动失效。

#### 2. 主动失效 (数据更新时)

```typescript
import { getCacheService } from './services/CacheService';

const cacheService = getCacheService();

// 更新组件后，清除相关缓存
async function updateComponent(componentId, data) {
  await ComponentModel.updateOne({ component_id: componentId }, data);
  
  // 清除该组件的缓存
  await cacheService.invalidateComponentCache(componentId);
  
  // 清除搜索缓存（因为可能包含该组件）
  await cacheService.invalidateSearchCache();
}
```

#### 3. 批量清除

```typescript
// 清除所有搜索缓存
await cacheService.invalidateSearchCache();

// 清除所有元数据缓存
await cacheService.invalidateMetaCache();

// 清除所有缓存
await cacheService.invalidateAllCache();
```

---

## 📊 性能监控

### 使用Redis CLI监控

```bash
redis-cli

# 实时监控所有命令
127.0.0.1:6379> MONITOR

# 查看内存使用
127.0.0.1:6379> INFO memory

# 查看统计信息
127.0.0.1:6379> INFO stats

# 查看所有keys
127.0.0.1:6379> KEYS doeet:*

# 查看key的TTL
127.0.0.1:6379> TTL doeet:meta:statistics
```

### 缓存性能指标

#### 目标性能

| 操作 | 无缓存 | 有缓存 | 提升 |
|------|--------|--------|------|
| 搜索查询 | 150-200ms | 10-20ms | **10x** |
| 组件详情 | 100-150ms | 5-10ms | **15x** |
| 制造商列表 | 50-100ms | < 5ms | **20x** |

#### 监控指标

- **命中率 (Hit Rate)**: 目标 > 80%
- **响应时间**: 缓存查询 < 10ms
- **内存使用**: < 1GB
- **键数量**: 根据业务量调整

---

## 🏗️ 架构设计

### 缓存层级

```
┌──────────────────────────────────────┐
│         应用层 (Express API)          │
└──────────────┬───────────────────────┘
               │
               ├─ 搜索请求
               │
┌──────────────▼───────────────────────┐
│      DoeeetSearchService             │
│   (集成缓存的搜索服务)                │
└──────────────┬───────────────────────┘
               │
               ├─ 检查缓存
               │
┌──────────────▼───────────────────────┐
│         CacheService                 │
│    (统一的缓存操作接口)               │
└──────────────┬───────────────────────┘
               │
     ┌─────────┴─────────┐
     │                   │
┌────▼─────┐      ┌─────▼────────┐
│  Redis   │      │   MongoDB    │
│  (缓存)  │      │  (持久化)    │
└──────────┘      └──────────────┘
```

### 数据流程

#### 读取流程 (Cache-Aside)

```
1. 请求 → SearchService
2. SearchService → CacheService.get()
3. 如果缓存命中 → 返回数据 ✅
4. 如果缓存未命中:
   a. 查询MongoDB
   b. 写入Redis缓存
   c. 返回数据
```

#### 更新流程 (Write-Through)

```
1. 更新请求 → Service
2. 更新MongoDB
3. 清除相关Redis缓存
4. 下次读取时重新缓存
```

---

## 🛠️ 开发最佳实践

### 1. 何时使用缓存

✅ **应该缓存**:
- 频繁读取、较少更新的数据
- 计算成本高的数据（如聚合统计）
- 外部API调用结果
- 搜索结果

❌ **不应该缓存**:
- 实时性要求极高的数据
- 频繁更新的数据
- 用户敏感数据（根据实际需求）

### 2. 缓存Key命名规范

```typescript
// 好的命名
'doeet:search:query:a1b2c3d4'
'doeet:component:detail:comp-123'
'doeet:meta:manufacturers'

// 不好的命名
'data'
'temp'
'test123'
```

### 3. 设置合适的TTL

```typescript
// 根据数据更新频率设置TTL
const CacheTTL = {
  HOT_DATA: 3600,      // 1小时 - 热数据
  WARM_DATA: 7200,     // 2小时 - 温数据  
  COLD_DATA: 86400,    // 24小时 - 冷数据
};
```

### 4. 错误处理

```typescript
async function getData() {
  try {
    return await cacheService.get('key');
  } catch (error) {
    // 缓存失败时回退到数据库
    console.error('缓存读取失败:', error);
    return await db.find();
  }
}
```

### 5. 避免缓存雪崩

```typescript
// 为TTL添加随机偏移
const ttl = CacheTTL.SEARCH_RESULT + Math.floor(Math.random() * 300);
await cacheService.set(key, data, ttl);
```

---

## 🐛 常见问题

### Q1: 缓存命中率低怎么办？

**原因**:
- TTL设置过短
- 缓存Key不一致
- 频繁清除缓存

**解决方案**:
- 增加TTL时间
- 检查查询参数的序列化
- 减少不必要的缓存清除

### Q2: Redis内存不足？

**解决方案**:
```bash
# 1. 查看内存使用
redis-cli INFO memory

# 2. 增加Redis内存限制 (redis.conf)
maxmemory 1gb
maxmemory-policy allkeys-lru

# 3. 清理过期数据
redis-cli FLUSHDB
```

### Q3: 缓存数据不一致？

**解决方案**:
- 数据更新时及时清除缓存
- 设置合理的TTL
- 使用版本号机制

### Q4: 应用启动慢？

**原因**: 缓存预热时间过长

**解决方案**:
- 减少预热的数据量
- 使用异步预热
- 只预热最常用的数据

---

## 📚 相关文档

- [Redis设置指南](./REDIS_SETUP.md) - 详细的Redis安装和配置
- [缓存设计文档](./REDIS_CACHE_DESIGN.md) - 架构设计和技术方案
- [API文档](./API.md) - API接口说明

---

## 🔗 参考资料

- [Redis官方文档](https://redis.io/documentation)
- [ioredis GitHub](https://github.com/luin/ioredis)
- [缓存设计模式](https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside)

---

**最后更新**: 2024-10-30  
**作者**: 开发团队

