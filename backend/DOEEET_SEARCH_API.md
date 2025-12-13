# DoEEEt 搜索引擎 API 文档

## 📋 概述

DoEEEt搜索引擎提供了完整的电子元件搜索功能，支持全文搜索、分类浏览、参数筛选、复合搜索等多种搜索方式。

**基础URL**: `http://localhost:3001/api/doeeet`

---

## 🔍 搜索相关 API

### 1. 复合搜索 (推荐)

**功能**: 支持多维度组合搜索，是最强大和灵活的搜索方式

```http
GET /api/doeeet/search
```

**Query 参数**:
| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| keyword | string | 否 | 关键词搜索（全文） | `TL084` |
| partNumber | string | 否 | 型号精确搜索 | `TL084CN` |
| manufacturer | string | 否 | 制造商 | `Texas Instruments` |
| partType | string | 否 | 产品类型 | `Operational Amplifier` |
| familyPath | string | 否 | 分类路径 | `Analog` |
| hasStock | boolean | 否 | 仅显示有库存 | `true` |
| obsolescenceType | string[] | 否 | 淘汰状态 | `Active,Risk` |
| qualityName | string | 否 | 质量等级 | `883` |
| parameters | JSON string | 否 | 参数筛选 | `{"voltage":"5V"}` |
| page | number | 否 | 页码（默认1） | `1` |
| limit | number | 否 | 每页数量（默认20，最大100） | `20` |
| sortBy | string | 否 | 排序字段 | `partNumber` |
| sortOrder | string | 否 | 排序方向 (`asc`/`desc`) | `asc` |

**示例请求**:
```bash
# 1. 基础关键词搜索
curl "http://localhost:3001/api/doeeet/search?keyword=TL084&page=1&limit=20"

# 2. 搜索有库存的TI芯片
curl "http://localhost:3001/api/doeeet/search?manufacturer=Texas&hasStock=true"

# 3. 搜索特定分类的活跃组件
curl "http://localhost:3001/api/doeeet/search?familyPath=Analog&obsolescenceType=Active&page=1"

# 4. 按型号搜索并排序
curl "http://localhost:3001/api/doeeet/search?partNumber=TL084&sortBy=partNumber&sortOrder=asc"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "components": [
      {
        "component_id": "uuid-123",
        "part_number": "TL084CN",
        "part_type": "Quad JFET-Input Operational Amplifier",
        "manufacturer_name": "Texas Instruments",
        "family_path": ["Analog", "Operational Amplifiers"],
        "obsolescence_type": "Active",
        "has_stock": true,
        "quality_name": "883",
        "qualified": "Y",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false,
    "filters": {
      "keyword": "TL084",
      "hasStock": null,
      "obsolescenceType": null
    }
  }
}
```

---

### 2. 全文搜索（快速搜索）

**功能**: 快速关键词搜索，适合简单查询

```http
GET /api/doeeet/fulltext
```

**Query 参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| q | string | ✅ | 搜索关键词 |
| limit | number | 否 | 结果数量（默认20） |
| hasStock | boolean | 否 | 仅显示有库存 |

**示例请求**:
```bash
curl "http://localhost:3001/api/doeeet/fulltext?q=TL084&limit=10"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "query": "TL084",
    "results": [...],
    "total": 10
  }
}
```

---

### 3. 搜索建议（自动补全）

**功能**: 实时搜索建议和自动补全

```http
GET /api/doeeet/suggestions
```

**Query 参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| q | string | ✅ | 搜索关键词（至少2个字符） |
| limit | number | 否 | 建议数量（默认10） |

**示例请求**:
```bash
curl "http://localhost:3001/api/doeeet/suggestions?q=TL&limit=10"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "components": [
      {
        "partNumber": "TL084CN",
        "manufacturer": "Texas Instruments",
        "partType": "Quad JFET-Input Op Amp"
      }
    ],
    "manufacturers": [
      "Texas Instruments",
      "TI Corporation"
    ],
    "categories": [
      "Analog",
      "Digital Logic"
    ]
  }
}
```

---

### 4. 按分类浏览

**功能**: 按产品分类路径浏览组件

```http
GET /api/doeeet/category/:category
```

**Path 参数**:
- `category`: 分类名称（URL编码）

**Query 参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| limit | number | 否 | 每页数量（默认50） |
| hasStock | boolean | 否 | 仅显示有库存 |

**示例请求**:
```bash
# 浏览"Analog"分类
curl "http://localhost:3001/api/doeeet/category/Analog?page=1&limit=50"

# 浏览有库存的组件
curl "http://localhost:3001/api/doeeet/category/Analog?hasStock=true"
```

---

## 📦 组件详情 API

### 5. 获取组件详情

**功能**: 获取组件完整信息（包含参数）

```http
GET /api/doeeet/components/:id
```

**Path 参数**:
- `id`: 组件的 component_id

**示例请求**:
```bash
curl "http://localhost:3001/api/doeeet/components/uuid-123"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "component_id": "uuid-123",
    "part_number": "TL084CN",
    "manufacturer_name": "Texas Instruments",
    "family_path": ["Analog", "Operational Amplifiers"],
    "parameters": [
      {
        "key": "param-uuid-1",
        "value": "5V",
        "numericValue": 5,
        "definition": {
          "parameter_key": "param-uuid-1",
          "category": "Electrical",
          "name": "Supply Voltage",
          "short_name": "Vcc"
        }
      }
    ]
  }
}
```

---

## 📊 元数据 API

### 6. 获取制造商列表

```http
GET /api/doeeet/manufacturers
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    "Texas Instruments",
    "Analog Devices",
    "Maxim Integrated"
  ]
}
```

---

### 7. 获取分类列表

```http
GET /api/doeeet/categories
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    ["Analog", "Operational Amplifiers"],
    ["Digital", "Logic Gates"],
    ["Power", "Voltage Regulators"]
  ]
}
```

---

### 8. 获取分类元数据

```http
GET /api/doeeet/category-meta/:familyPath
```

**Path 参数**:
- `familyPath`: JSON数组格式的分类路径（URL编码）

**示例**:
```bash
# 获取["Analog", "Operational Amplifiers"]的元数据
curl "http://localhost:3001/api/doeeet/category-meta/%5B%22Analog%22%2C%22Operational%20Amplifiers%22%5D"
```

---

### 9. 获取参数定义

```http
GET /api/doeeet/parameter-definitions
```

**Query 参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| keys | string | 否 | 逗号分隔的参数键列表 |

**示例**:
```bash
# 获取所有参数定义
curl "http://localhost:3001/api/doeeet/parameter-definitions"

# 获取特定参数定义
curl "http://localhost:3001/api/doeeet/parameter-definitions?keys=key1,key2"
```

---

### 10. 获取统计信息

```http
GET /api/doeeet/statistics
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "totalComponents": 2380049,
    "activeComponents": 1850000,
    "obsoleteComponents": 280000,
    "componentsInStock": 1200000,
    "manufacturerCount": 150,
    "categoryCount": 181
  }
}
```

---

## 🎯 使用场景示例

### 场景 1: 用户输入搜索框

```javascript
// 1. 实时搜索建议（用户输入时）
const getSuggestions = async (input) => {
  const response = await fetch(
    `http://localhost:3001/api/doeeet/suggestions?q=${input}&limit=10`
  );
  return response.json();
};

// 2. 用户按回车执行搜索
const performSearch = async (query) => {
  const response = await fetch(
    `http://localhost:3001/api/doeeet/search?keyword=${query}&page=1&limit=20`
  );
  return response.json();
};
```

### 场景 2: 分类浏览

```javascript
// 用户点击"Analog"分类
const browseCategory = async (category, page = 1) => {
  const response = await fetch(
    `http://localhost:3001/api/doeeet/category/${encodeURIComponent(category)}?page=${page}&limit=50`
  );
  return response.json();
};
```

### 场景 3: 高级筛选

```javascript
// 用户设置多个筛选条件
const advancedSearch = async (filters) => {
  const params = new URLSearchParams({
    manufacturer: filters.manufacturer || '',
    hasStock: filters.hasStock || false,
    obsolescenceType: filters.status?.join(',') || '',
    page: filters.page || 1,
    limit: filters.limit || 20
  });
  
  const response = await fetch(
    `http://localhost:3001/api/doeeet/search?${params}`
  );
  return response.json();
};
```

### 场景 4: 查看组件详情

```javascript
// 用户点击组件查看详情
const getComponentDetail = async (componentId) => {
  const response = await fetch(
    `http://localhost:3001/api/doeeet/components/${componentId}`
  );
  return response.json();
};
```

---

## 🚀 性能优化建议

1. **分页**: 始终使用分页，避免一次性加载过多数据
2. **缓存**: 对于制造商列表、分类列表等不常变化的数据可以前端缓存
3. **防抖**: 搜索建议使用防抖（debounce）降低请求频率
4. **索引**: 数据库已建立全文索引和复合索引，确保查询性能

---

## ⚠️ 错误处理

所有API在错误时返回统一格式：

```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息"
}
```

常见HTTP状态码：
- `200`: 成功
- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 📝 注意事项

1. **URL编码**: 所有URL参数需要进行URL编码
2. **数据库**: 确保MongoDB中`doeet`数据库包含以下集合：
   - `components`
   - `parameters`
   - `parameter_definitions`
   - `families`
3. **索引**: 确保已创建必要的数据库索引以获得最佳性能
4. **限流**: 建议实施API限流以防止滥用

---

## 🔧 开发和测试

### 启动服务器
```bash
cd backend
npm run dev
```

### 测试API
```bash
# 健康检查
curl http://localhost:3001/health

# 测试搜索
curl "http://localhost:3001/api/doeeet/search?keyword=test&limit=5"

# 测试统计
curl http://localhost:3001/api/doeeet/statistics
```

---

## 📚 相关文档

- [DoEEEt项目开发计划](../DoEEEt项目开发计划.md)
- [DoEEEt数据导入指南](./scripts/README_doeet_import.md)
- [数据库Schema设计](../database/doeeet_schema.sql)

