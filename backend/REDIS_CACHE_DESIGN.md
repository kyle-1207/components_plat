# Redis缓存设计文档

## 📋 数据结构分析

基于 `数据说明(2).md` 和当前MongoDB模型，我们的数据结构：

### 当前MongoDB结构
```
1. components 集合 (1.8M文档)
   - component_id (UUID, 唯一)
   - family_path (数组: ['Category1', 'Category2', ...])
   - part_number (型号)
   - manufacturer_name (制造商)
   - obsolescence_type (淘汰状态)
   - has_stock (库存)
   - 等...

2. parameters 集合 (137M文档)
   - component_id (关联组件)
   - parameter_key (参数键UUID)
   - parameter_value (参数值)
   - numeric_value (数值, 可选)

3. parameter_definitions 集合 (313文档)
   - parameter_key (UUID)
   - category
   - name (参数名)
   - short_name
   - example

4. 重要参数键 (固定):
   - TOP (工作温度): 2f2e7f5a-7cd0-47da-8feb-a29336285a3e
   - Package (封装): 5df8d422-39bd-431f-9095-582a3f6f8fc1
```

### 数据关系
```
Component (1) -----> (N) Parameters
                       |
                       v
                  ParameterDefinition

查询时需要 JOIN:
  components + parameters + parameter_definitions
```

---

## 🎯 缓存策略设计

### 1. 缓存层级

```
Level 1: 热数据缓存 (TTL: 1小时)
  - 搜索结果
  - 组件详情
  - 分类浏览

Level 2: 静态数据缓存 (TTL: 24小时)
  - 参数定义列表
  - 制造商列表
  - 分类树结构
  - 统计数据

Level 3: 会话缓存 (TTL: 30分钟)
  - 用户搜索历史
  - 搜索建议
```

### 2. 缓存Key设计

#### 原则
- **可读性**: 使用清晰的前缀
- **唯一性**: 基于查询参数hash
- **结构化**: 使用冒号分隔命名空间

#### Key命名规范
```typescript
// 搜索结果缓存
search:query:{hash}           // 复合搜索结果
search:fulltext:{hash}        // 全文搜索结果
search:category:{familyPath}:p{page}  // 分类浏览

// 组件相关
component:detail:{componentId}         // 组件详情+参数
component:params:{componentId}         // 组件参数列表

// 元数据缓存
meta:manufacturers                    // 制造商列表
meta:categories:tree                  // 分类树
meta:parameter_definitions            // 参数定义
meta:statistics                       // 统计数据
meta:family:{familyPath}              // 分类元数据

// 搜索建议
suggest:query:{prefix}                // 搜索建议

// 聚合数据 (Facets)
facets:query:{hash}                   // 分面搜索聚合

// 对比功能
compare:{sorted_ids}                  // 组件对比结果
```

### 3. Hash生成策略

```typescript
import crypto from 'crypto';

function generateCacheKey(queryObj: any): string {
  // 排序对象键，确保相同查询生成相同hash
  const sorted = Object.keys(queryObj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = queryObj[key];
      return acc;
    }, {} as any);
    
  const str = JSON.stringify(sorted);
  return crypto.createHash('md5').update(str).digest('hex').substring(0, 16);
}

// 示例
generateCacheKey({ 
  keyword: 'LM324', 
  manufacturer: 'TI', 
  page: 1 
}) 
// => 'a1b2c3d4e5f6g7h8'
```

---

## 🚀 缓存实现方案

### 方案A: 缓存完整搜索结果 ⭐⭐⭐ (推荐)

**优点**:
- ✅ 实现简单，逻辑清晰
- ✅ 命中率高（相同查询返回相同结果）
- ✅ 性能提升明显（10-20ms vs 200ms）

**缺点**:
- ⚠️ 内存占用较大
- ⚠️ 数据更新时需要清除相关缓存

**数据结构**:
```typescript
// Key: search:query:{hash}
// Value: JSON字符串
{
  components: [...],  // 组件列表（不含参数）
  total: 1234,
  page: 1,
  limit: 20,
  hasNext: true,
  hasPrev: false,
  timestamp: 1234567890
}

// Key: component:detail:{componentId}
// Value: JSON字符串
{
  ...componentData,
  parameters: [
    { key: 'xxx', name: '电压', value: '5V' },
    { key: 'yyy', name: '封装', value: 'DIP8' }
  ]
}
```

**TTL策略**:
```typescript
const TTL = {
  SEARCH_RESULT: 3600,        // 1小时
  COMPONENT_DETAIL: 7200,     // 2小时
  MANUFACTURERS: 86400,       // 24小时
  CATEGORIES: 86400,          // 24小时
  PARAMETER_DEFS: 86400,      // 24小时
  SUGGESTIONS: 1800,          // 30分钟
  STATISTICS: 3600            // 1小时
};
```

### 方案B: 多级缓存（组件+参数分离）

**优点**:
- ✅ 内存利用率更高
- ✅ 更新粒度更细

**缺点**:
- ❌ 实现复杂
- ❌ 需要多次Redis请求
- ❌ 性能提升不如方案A

**结论**: 暂不采用

---

## 📊 缓存数据量估算

### 假设
- 日活用户: 1000人
- 平均每人搜索: 20次
- 每次搜索结果: 20条组件
- 每条组件+参数: 2KB

### 估算

```
# 搜索结果缓存
搜索次数/天: 1000 * 20 = 20,000
去重后(命中率50%): 10,000
每个结果大小: 20条 * 2KB = 40KB
总计: 10,000 * 40KB = 400MB

# 组件详情缓存
查看详情次数/天: 1000 * 10 = 10,000
去重后: 5,000
每个详情大小: 2KB
总计: 5,000 * 2KB = 10MB

# 元数据缓存
制造商列表: ~100KB
分类树: ~500KB
参数定义: ~50KB
统计数据: ~10KB
总计: ~1MB

# 总内存占用
总计: 400MB + 10MB + 1MB ≈ 411MB
```

**结论**: Redis内存需求约 **500MB - 1GB**（包含冗余）

---

## 🔄 缓存更新策略

### 1. 被动更新（Lazy Loading）⭐ 推荐

```typescript
async function getCachedOrFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl: number
): Promise<T> {
  // 1. 尝试从缓存获取
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 2. 缓存未命中，从数据库获取
  const data = await fetchFn();
  
  // 3. 写入缓存
  await redis.setex(cacheKey, ttl, JSON.stringify(data));
  
  return data;
}
```

### 2. 主动更新（Write-Through）

```typescript
// 数据更新时清除相关缓存
async function invalidateCache(componentId: string) {
  const keys = [
    `component:detail:${componentId}`,
    'search:*',  // 清除所有搜索缓存
    'meta:statistics'
  ];
  
  for (const pattern of keys) {
    if (pattern.includes('*')) {
      // 使用SCAN清除匹配的keys
      await deletePattern(pattern);
    } else {
      await redis.del(pattern);
    }
  }
}
```

### 3. 定时刷新（Scheduled Refresh）

```typescript
// 每小时刷新统计数据
cron.schedule('0 * * * *', async () => {
  const stats = await getStatistics();
  await redis.setex('meta:statistics', 3600, JSON.stringify(stats));
});
```

---

## 🎨 缓存服务实现

### 核心接口设计

```typescript
export class CacheService {
  // 基础操作
  async get<T>(key: string): Promise<T | null>;
  async set(key: string, value: any, ttl?: number): Promise<void>;
  async del(key: string): Promise<void>;
  async exists(key: string): Promise<boolean>;
  
  // 高级操作
  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T>;
  async deletePattern(pattern: string): Promise<number>;
  async mget<T>(keys: string[]): Promise<(T | null)[]>;
  async mset(entries: [string, any, number?][]): Promise<void>;
  
  // 搜索相关
  async cacheSearchResult(query: any, result: any): Promise<void>;
  async getCachedSearchResult(query: any): Promise<any | null>;
  
  // 组件相关
  async cacheComponentDetail(componentId: string, data: any): Promise<void>;
  async getCachedComponentDetail(componentId: string): Promise<any | null>;
  
  // 元数据相关
  async cacheManufacturers(manufacturers: string[]): Promise<void>;
  async getCachedManufacturers(): Promise<string[] | null>;
  
  async cacheCategoriesTree(tree: any): Promise<void>;
  async getCachedCategoriesTree(): Promise<any | null>;
  
  // 缓存清除
  async invalidateSearchCache(): Promise<void>;
  async invalidateComponentCache(componentId: string): Promise<void>;
  async invalidateAllCache(): Promise<void>;
  
  // 统计
  async getCacheStats(): Promise<{
    hits: number;
    misses: number;
    hitRate: number;
    memory: string;
    keys: number;
  }>;
}
```

---

## 🔍 检索优化方案

### 1. 参数检索优化

**当前问题**: 
- 参数表137M记录，JOIN查询慢
- 参数定义需要翻译（key -> name）

**优化方案**:

#### 方案1: 组件详情时合并参数 ⭐
```typescript
// 获取组件详情时，一次性获取所有参数并缓存
async getComponentWithParameters(componentId: string) {
  const cacheKey = `component:detail:${componentId}`;
  
  return await this.cacheService.getOrSet(cacheKey, async () => {
    // 1. 获取组件基本信息
    const component = await DoeeetComponent.findOne({ component_id: componentId });
    
    // 2. 获取所有参数
    const parameters = await DoeeetParameter.find({ component_id: componentId });
    
    // 3. 获取参数定义（从缓存）
    const paramDefs = await this.cacheService.getOrSet(
      'meta:parameter_definitions',
      async () => {
        return await DoeeetParameterDefinition.find({});
      },
      86400
    );
    
    // 4. 构建参数定义映射
    const paramMap = new Map(
      paramDefs.map(p => [p.parameter_key, { name: p.name, shortName: p.short_name }])
    );
    
    // 5. 合并参数信息
    const enrichedParams = parameters.map(p => ({
      key: p.parameter_key,
      name: paramMap.get(p.parameter_key)?.name || 'Unknown',
      shortName: paramMap.get(p.parameter_key)?.shortName,
      value: p.parameter_value,
      numericValue: p.numeric_value
    }));
    
    return {
      ...component.toJSON(),
      parameters: enrichedParams
    };
  }, 7200);
}
```

#### 方案2: 搜索时不返回参数，按需加载
```typescript
// 搜索只返回组件基本信息
async searchComponents(query: any) {
  const components = await DoeeetComponent.find(query)
    .select('-__v')  // 只选择组件字段，不JOIN参数
    .limit(20);
    
  return components; // 前端需要时再调用 getComponentWithParameters
}
```

### 2. 分类树优化

**方案**: 一次性缓存完整分类树

```typescript
async getCategoriesTree() {
  return await this.cacheService.getOrSet(
    'meta:categories:tree',
    async () => {
      // 聚合所有唯一的family_path
      const categories = await DoeeetComponent.distinct('family_path');
      
      // 构建树结构
      const tree = this.buildTree(categories);
      
      return tree;
    },
    86400
  );
}

private buildTree(paths: string[][]): any {
  const root: any = { children: {} };
  
  for (const path of paths) {
    let current = root;
    for (const segment of path) {
      if (!current.children[segment]) {
        current.children[segment] = { name: segment, children: {} };
      }
      current = current.children[segment];
    }
  }
  
  return root.children;
}
```

### 3. 制造商列表优化

```typescript
async getManufacturers() {
  return await this.cacheService.getOrSet(
    'meta:manufacturers',
    async () => {
      // 返回制造商列表及每个制造商的组件数量
      const manufacturers = await DoeeetComponent.aggregate([
        {
          $group: {
            _id: '$manufacturer_name',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);
      
      return manufacturers.map(m => ({
        name: m._id,
        count: m.count
      }));
    },
    86400
  );
}
```

---

## 🔥 热数据预热

### 启动时预热

```typescript
export class CacheWarmupService {
  async warmup() {
    console.log('🔥 开始缓存预热...');
    
    // 1. 参数定义（最常用）
    await this.warmupParameterDefinitions();
    
    // 2. 制造商列表
    await this.warmupManufacturers();
    
    // 3. 分类树
    await this.warmupCategoriesTree();
    
    // 4. 统计数据
    await this.warmupStatistics();
    
    // 5. 热门搜索（可选）
    await this.warmupPopularSearches();
    
    console.log('✅ 缓存预热完成！');
  }
  
  private async warmupParameterDefinitions() {
    const defs = await DoeeetParameterDefinition.find({});
    await redis.setex(
      'meta:parameter_definitions',
      86400,
      JSON.stringify(defs)
    );
    console.log(`  ✓ 参数定义: ${defs.length}条`);
  }
  
  // ... 其他预热方法
}
```

---

## 📈 性能指标

### 目标性能

| 操作 | 无缓存 | 有缓存 | 提升 |
|------|--------|--------|------|
| 搜索查询 | 150-200ms | 10-20ms | **10x** |
| 组件详情 | 100-150ms | 5-10ms | **15x** |
| 分类浏览 | 100-150ms | 5-10ms | **15x** |
| 制造商列表 | 50-100ms | < 5ms | **20x** |
| 参数定义 | 20-30ms | < 5ms | **5x** |

### 监控指标

```typescript
interface CacheMetrics {
  hits: number;          // 缓存命中次数
  misses: number;        // 缓存未命中次数
  hitRate: number;       // 命中率 (%)
  avgResponseTime: number; // 平均响应时间 (ms)
  memory: string;        // 内存使用
  keys: number;          // Key数量
  evictions: number;     // 驱逐次数
}
```

---

## 🛠️ 实施步骤

### Phase 1: 基础设施 (Day 1上午)
- [x] ✅ 安装Redis（Docker或本地）
- [x] ✅ 安装ioredis依赖
- [ ] 创建CacheService基础类
- [ ] 连接Redis并测试

### Phase 2: 核心功能 (Day 1下午)
- [ ] 实现基础get/set/del操作
- [ ] 实现getOrSet模式
- [ ] 实现hash生成
- [ ] 错误处理和重试逻辑

### Phase 3: 搜索集成 (Day 2上午)
- [ ] 缓存搜索结果
- [ ] 缓存组件详情
- [ ] 缓存分类浏览

### Phase 4: 元数据集成 (Day 2下午)
- [ ] 缓存参数定义
- [ ] 缓存制造商列表
- [ ] 缓存分类树
- [ ] 缓存统计数据

### Phase 5: 测试优化 (Day 2晚上)
- [ ] 性能对比测试
- [ ] 缓存命中率测试
- [ ] 内存使用监控
- [ ] 文档更新

---

## 🎯 下一步

1. **立即开始**: 创建CacheService基础类
2. **快速验证**: 先实现搜索结果缓存，验证效果
3. **逐步扩展**: 添加其他缓存类型
4. **持续监控**: 收集性能数据，优化策略

---

**创建时间**: 2024-10-30  
**作者**: 开发团队  
**版本**: v1.0

