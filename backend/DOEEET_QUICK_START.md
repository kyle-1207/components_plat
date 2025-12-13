# DoEEEt 搜索引擎 快速开始指南

## 🎯 概述

本指南帮助您快速启动和测试DoEEEt搜索引擎核心功能。

---

## ✅ 前置条件检查

### 1. 检查MongoDB数据

确保MongoDB中已导入DoEEEt数据：

```bash
# 运行MongoDB检查脚本
node backend/scripts/check_mongodb_status.js
```

**预期输出**：
- 数据库 `doeet` 存在
- 包含以下集合：
  - `components` (组件数据，约238万条)
  - `parameters` (参数数据)
  - `parameter_definitions` (参数定义)
  - `families` (产品族元数据)

### 2. 检查环境配置

确保 `backend/.env` 文件包含：

```env
MONGODB_URI=mongodb://127.0.0.1:27017/doeet
PORT=3001
NODE_ENV=development
```

---

## 🚀 启动服务

### 方法一：开发模式（推荐）

```bash
cd backend
npm run dev
```

### 方法二：生产模式

```bash
cd backend
npm run build
npm start
```

### 验证服务状态

```bash
# 健康检查
curl http://localhost:3001/health

# 预期响应：
# {"status":"OK","timestamp":"2024-10-29T...","environment":"development"}
```

---

## 🧪 测试搜索功能

### 自动化测试

运行测试脚本验证所有API端点：

```bash
cd backend
node test-doeeet-search.js
```

**测试内容包括**：
1. ✅ 获取统计信息
2. ✅ 获取制造商列表  
3. ✅ 获取分类列表
4. ✅ 全文搜索
5. ✅ 搜索建议
6. ✅ 复合搜索（多维度）
7. ✅ 分类浏览
8. ✅ 组件详情查询

---

## 📝 手动测试示例

### 1. 全文搜索

```bash
# 搜索"TL084"相关组件
curl "http://localhost:3001/api/doeeet/fulltext?q=TL084&limit=5"
```

### 2. 搜索建议（自动补全）

```bash
# 输入"TL"获取建议
curl "http://localhost:3001/api/doeeet/suggestions?q=TL&limit=10"
```

### 3. 复合搜索

```bash
# 搜索Texas Instruments的有库存组件
curl "http://localhost:3001/api/doeeet/search?manufacturer=Texas&hasStock=true&limit=5"

# 搜索活跃状态的放大器
curl "http://localhost:3001/api/doeeet/search?keyword=amplifier&obsolescenceType=Active&limit=5"

# 按型号精确搜索
curl "http://localhost:3001/api/doeeet/search?partNumber=TL084CN"
```

### 4. 分类浏览

```bash
# 浏览"Analog"分类
curl "http://localhost:3001/api/doeeet/category/Analog?page=1&limit=10"
```

### 5. 获取组件详情

```bash
# 先搜索获取component_id
curl "http://localhost:3001/api/doeeet/search?keyword=TL084&limit=1"

# 使用component_id获取详情（包含参数）
curl "http://localhost:3001/api/doeeet/components/<component_id>"
```

### 6. 获取元数据

```bash
# 所有制造商
curl "http://localhost:3001/api/doeeet/manufacturers"

# 所有分类
curl "http://localhost:3001/api/doeeet/categories"

# 统计信息
curl "http://localhost:3001/api/doeeet/statistics"

# 参数定义
curl "http://localhost:3001/api/doeeet/parameter-definitions"
```

---

## 🎨 前端集成示例

### React 组件示例

```typescript
// SearchComponent.tsx
import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001/api/doeeet';

export function SearchComponent() {
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 搜索建议（防抖）
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (keyword.length >= 2) {
        const response = await fetch(
          `${API_BASE}/suggestions?q=${encodeURIComponent(keyword)}&limit=10`
        );
        const data = await response.json();
        setSuggestions(data.data);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  // 执行搜索
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/search?keyword=${encodeURIComponent(keyword)}&page=1&limit=20`
      );
      const data = await response.json();
      setResults(data.data.components);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜索组件..."
      />
      
      {/* 搜索建议 */}
      {suggestions.components?.length > 0 && (
        <ul>
          {suggestions.components.map((item, i) => (
            <li key={i}>{item.partNumber} - {item.manufacturer}</li>
          ))}
        </ul>
      )}

      <button onClick={handleSearch} disabled={loading}>
        {loading ? '搜索中...' : '搜索'}
      </button>

      {/* 搜索结果 */}
      <div>
        {results.map((component) => (
          <div key={component.component_id}>
            <h3>{component.part_number}</h3>
            <p>{component.manufacturer_name}</p>
            <p>类型: {component.part_type}</p>
            <p>状态: {component.obsolescence_type}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Vue 组件示例

```vue
<template>
  <div class="search-component">
    <input
      v-model="keyword"
      @input="onInput"
      placeholder="搜索组件..."
    />
    
    <!-- 搜索建议 -->
    <ul v-if="suggestions.components?.length">
      <li v-for="(item, i) in suggestions.components" :key="i">
        {{ item.partNumber }} - {{ item.manufacturer }}
      </li>
    </ul>

    <button @click="search" :disabled="loading">
      {{ loading ? '搜索中...' : '搜索' }}
    </button>

    <!-- 搜索结果 -->
    <div v-for="component in results" :key="component.component_id">
      <h3>{{ component.part_number }}</h3>
      <p>{{ component.manufacturer_name }}</p>
      <p>状态: {{ component.obsolescence_type }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const API_BASE = 'http://localhost:3001/api/doeeet';

const keyword = ref('');
const suggestions = ref({});
const results = ref([]);
const loading = ref(false);

let debounceTimer;

const onInput = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (keyword.value.length >= 2) {
      const response = await fetch(
        `${API_BASE}/suggestions?q=${encodeURIComponent(keyword.value)}&limit=10`
      );
      const data = await response.json();
      suggestions.value = data.data;
    }
  }, 300);
};

const search = async () => {
  loading.value = true;
  try {
    const response = await fetch(
      `${API_BASE}/search?keyword=${encodeURIComponent(keyword.value)}&page=1&limit=20`
    );
    const data = await response.json();
    results.value = data.data.components;
  } finally {
    loading.value = false;
  }
};
</script>
```

---

## 🔍 核心功能说明

### 1. 全文搜索
- 基于MongoDB文本索引
- 支持型号、制造商、产品类型搜索
- 按相关性评分排序

### 2. 分类搜索
- 支持分类路径模糊匹配
- 支持层级分类浏览
- 181个产品分类

### 3. 参数搜索
- 按技术参数筛选组件
- 支持精确匹配和范围查询
- 参数定义动态配置

### 4. 复合搜索
- 组合多个搜索条件
- 支持分页和排序
- 灵活的筛选器

### 5. 搜索建议
- 实时自动补全
- 包含组件、制造商、分类建议
- 优化用户体验

---

## ⚡ 性能优化

### 数据库索引

已创建的索引：
```javascript
// 全文搜索索引
{ part_number: 'text', part_type: 'text', manufacturer_name: 'text' }

// 字段索引
{ component_id: 1 }
{ family_path: 1 }
{ manufacturer_name: 1 }
{ has_stock: 1 }
{ obsolescence_type: 1 }

// 复合索引
{ manufacturer_name: 1, has_stock: 1 }
{ family_path: 1, obsolescence_type: 1 }
```

### 查询优化建议

1. **使用分页**: 避免一次加载过多数据
2. **合理limit**: 默认20条，最大100条
3. **缓存结果**: 对不常变化的数据进行缓存
4. **防抖处理**: 搜索建议使用300ms防抖

---

## ❗ 常见问题

### Q1: 搜索结果为空？

**检查**：
- MongoDB中是否有数据
- 搜索关键词是否正确
- 筛选条件是否过于严格

### Q2: 搜索速度慢？

**优化**：
- 检查数据库索引是否创建
- 减小limit值
- 使用更具体的搜索条件

### Q3: 连接数据库失败？

**检查**：
- MongoDB服务是否启动
- MONGODB_URI配置是否正确
- 数据库名称是否为`doeet`

### Q4: 参数搜索不工作？

**确认**：
- parameters集合是否有数据
- parameter_definitions集合是否有定义
- 参数键（parameter_key）是否正确

---

## 📚 相关文档

- [API完整文档](./DOEEET_SEARCH_API.md)
- [DoEEEt项目开发计划](../DoEEEt项目开发计划.md)
- [数据导入指南](./scripts/README_doeet_import.md)

---

## 🆘 获取帮助

如遇问题，请检查：
1. MongoDB日志
2. 后端服务日志
3. API响应错误信息

**日志位置**：
- MongoDB: `backend/data/mongod.log`
- 后端: `backend/logs/combined.log`

---

**🎉 现在您已经可以开始使用DoEEEt搜索引擎了！**

