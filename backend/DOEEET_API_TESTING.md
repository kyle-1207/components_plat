# DoEEEt 组件搜索 API 测试指南

## 前提条件

在测试前，请确保：

1. **MongoDB** 已启动并运行
2. **Redis** 已启动并配置好环境变量
3. **后端服务** 已启动（`npm run dev`）
4. **DoEEEt 数据** 已导入到 MongoDB

## 启动步骤

### 1. 启动 Redis（如果未启动）

```bash
# Windows
redis-server

# 或使用 WSL
wsl redis-server
```

### 2. 启动后端服务

```bash
cd backend
npm run dev
```

服务将在 `http://localhost:3001` 上运行。

---

## API 测试用例

### 1. 基础统计信息

#### 获取系统统计

```bash
# 使用 curl
curl http://localhost:3001/api/doeeet-components/statistics

# 使用 PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/statistics" -Method Get
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "totalComponents": 123456,
    "totalManufacturers": 850,
    "totalCategories": 45,
    "lastUpdated": "2025-10-30T..."
  }
}
```

---

### 2. 制造商列表

#### 获取所有制造商

```bash
curl http://localhost:3001/api/doeeet-components/manufacturers

# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/manufacturers" -Method Get
```

**预期响应：**
```json
{
  "success": true,
  "data": [
    {
      "name": "Texas Instruments",
      "count": 15234,
      "aliases": ["TI"]
    },
    {
      "name": "STMicroelectronics",
      "count": 12456,
      "aliases": ["ST"]
    }
  ]
}
```

---

### 3. 分类列表

#### 获取所有分类

```bash
curl http://localhost:3001/api/doeeet-components/family-paths

# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/family-paths" -Method Get
```

**预期响应：**
```json
{
  "success": true,
  "data": [
    {
      "familyPath": "集成电路(IC)/接口",
      "count": 5678,
      "subcategories": ["CAN收发器", "RS-232收发器"]
    }
  ]
}
```

---

### 4. 组件搜索

#### 4.1 基础关键词搜索

```bash
# 搜索 "STM32"
curl "http://localhost:3001/api/doeeet-components/search?keyword=STM32&page=1&pageSize=20"

# PowerShell
$params = @{
    keyword = "STM32"
    page = 1
    pageSize = 20
}
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/search" -Method Get -Body $params
```

#### 4.2 按制造商筛选

```bash
curl "http://localhost:3001/api/doeeet-components/search?keyword=STM32&manufacturer=STMicroelectronics&page=1&pageSize=20"

# PowerShell
$params = @{
    keyword = "STM32"
    manufacturer = "STMicroelectronics"
    page = 1
    pageSize = 20
}
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/search" -Method Get -Body $params
```

#### 4.3 按分类搜索

```bash
curl "http://localhost:3001/api/doeeet-components/search?familyPath=集成电路(IC)/微控制器&page=1&pageSize=20"

# PowerShell
$params = @{
    familyPath = "集成电路(IC)/微控制器"
    page = 1
    pageSize = 20
}
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/search" -Method Get -Body $params
```

#### 4.4 带参数范围筛选

```bash
curl "http://localhost:3001/api/doeeet-components/search?keyword=电阻&minValue=1000&maxValue=10000&unit=Ω&page=1&pageSize=20"

# PowerShell
$params = @{
    keyword = "电阻"
    minValue = 1000
    maxValue = 10000
    unit = "Ω"
    page = 1
    pageSize = 20
}
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/search" -Method Get -Body $params
```

#### 4.5 排序

```bash
# 按价格升序
curl "http://localhost:3001/api/doeeet-components/search?keyword=STM32&sortBy=price&sortOrder=asc&page=1&pageSize=20"

# 按库存降序
curl "http://localhost:3001/api/doeeet-components/search?keyword=STM32&sortBy=stock&sortOrder=desc&page=1&pageSize=20"

# PowerShell
$params = @{
    keyword = "STM32"
    sortBy = "price"
    sortOrder = "asc"
    page = 1
    pageSize = 20
}
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/search" -Method Get -Body $params
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "components": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "型号": "STM32F103C8T6",
        "制造商": "STMicroelectronics",
        "描述": "ARM Cortex-M3 微控制器",
        "分类": "集成电路(IC)/微控制器",
        "封装": "LQFP-48",
        "库存": 5000,
        "价格": "¥8.50",
        "datasheet": "http://..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 156,
      "totalPages": 8
    },
    "filters": {
      "manufacturers": ["STMicroelectronics", "Texas Instruments"],
      "categories": ["集成电路(IC)/微控制器"],
      "parameterRanges": {
        "工作温度": { "min": -40, "max": 85, "unit": "℃" }
      }
    }
  }
}
```

---

### 5. 全文搜索

```bash
curl "http://localhost:3001/api/doeeet-components/fulltext-search?query=32位微控制器&page=1&pageSize=20"

# PowerShell
$params = @{
    query = "32位微控制器"
    page = 1
    pageSize = 20
}
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/fulltext-search" -Method Get -Body $params
```

---

### 6. 搜索建议（自动补全）

```bash
curl "http://localhost:3001/api/doeeet-components/suggestions?prefix=STM32&limit=10"

# PowerShell
$params = @{
    prefix = "STM32"
    limit = 10
}
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/suggestions" -Method Get -Body $params
```

**预期响应：**
```json
{
  "success": true,
  "data": [
    {
      "text": "STM32F103C8T6",
      "type": "model",
      "category": "集成电路(IC)/微控制器",
      "count": 1
    },
    {
      "text": "STM32F407VGT6",
      "type": "model",
      "count": 1
    }
  ]
}
```

---

### 7. 获取单个组件详情

```bash
# 替换 {componentId} 为实际的组件 ID
curl http://localhost:3001/api/doeeet-components/507f1f77bcf86cd799439011

# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/507f1f77bcf86cd799439011" -Method Get
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "型号": "STM32F103C8T6",
    "制造商": "STMicroelectronics",
    "描述": "ARM Cortex-M3 MCU, 64KB Flash, 20KB RAM",
    "分类": "集成电路(IC)/微控制器",
    "封装": "LQFP-48",
    "参数": {
      "内核": "ARM Cortex-M3",
      "主频": "72MHz",
      "Flash": "64KB",
      "RAM": "20KB",
      "工作电压": "2.0V ~ 3.6V",
      "工作温度": "-40℃ ~ 85℃"
    },
    "价格信息": {
      "单价": "¥8.50",
      "阶梯价格": [
        { "quantity": 1, "price": 8.50 },
        { "quantity": 10, "price": 7.80 },
        { "quantity": 100, "price": 7.20 }
      ]
    },
    "库存": 5000,
    "datasheet": "http://...",
    "图片": "http://..."
  }
}
```

---

### 8. 获取分类下的组件

```bash
curl "http://localhost:3001/api/doeeet-components/category/集成电路(IC)/微控制器?page=1&pageSize=20"

# PowerShell
# 注意：需要对中文进行 URL 编码
$category = [System.Web.HttpUtility]::UrlEncode("集成电路(IC)/微控制器")
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/category/$category?page=1&pageSize=20" -Method Get
```

---

### 9. 获取相似组件

```bash
# 获取与指定组件相似的其他组件
curl "http://localhost:3001/api/doeeet-components/507f1f77bcf86cd799439011/similar?limit=10"

# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/507f1f77bcf86cd799439011/similar?limit=10" -Method Get
```

**预期响应：**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "型号": "STM32F103CBT6",
      "制造商": "STMicroelectronics",
      "描述": "ARM Cortex-M3 MCU, 128KB Flash",
      "相似度": 0.95,
      "差异": ["Flash容量: 64KB -> 128KB"]
    }
  ]
}
```

---

### 10. 批量比较组件

```bash
# 使用 POST 请求比较多个组件
curl -X POST http://localhost:3001/api/doeeet-components/compare \
  -H "Content-Type: application/json" \
  -d '{
    "componentIds": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439013"
    ]
  }'

# PowerShell
$body = @{
    componentIds = @(
        "507f1f77bcf86cd799439011",
        "507f1f77bcf86cd799439012",
        "507f1f77bcf86cd799439013"
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/compare" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "components": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "型号": "STM32F103C8T6",
        "参数": {...}
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "型号": "STM32F103CBT6",
        "参数": {...}
      }
    ],
    "comparison": {
      "commonParameters": ["内核", "工作电压"],
      "differences": {
        "Flash": ["64KB", "128KB"],
        "价格": ["¥8.50", "¥12.30"]
      }
    }
  }
}
```

---

### 11. 批量获取组件

```bash
curl -X POST http://localhost:3001/api/doeeet-components/batch \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012"
    ]
  }'

# PowerShell
$body = @{
    ids = @(
        "507f1f77bcf86cd799439011",
        "507f1f77bcf86cd799439012"
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/batch" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

---

### 12. 获取热门筛选项

```bash
curl "http://localhost:3001/api/doeeet-components/popular-filters?category=集成电路(IC)/微控制器"

# PowerShell
$params = @{
    category = "集成电路(IC)/微控制器"
}
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/popular-filters" -Method Get -Body $params
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "manufacturers": [
      { "name": "STMicroelectronics", "count": 1234 },
      { "name": "NXP", "count": 890 }
    ],
    "parameters": {
      "内核": ["ARM Cortex-M3", "ARM Cortex-M4", "ARM Cortex-M7"],
      "封装": ["LQFP-48", "LQFP-64", "QFN-48"]
    }
  }
}
```

---

### 13. 获取分类元数据

```bash
curl http://localhost:3001/api/doeeet-components/category/集成电路(IC)/微控制器/meta

# PowerShell
$category = [System.Web.HttpUtility]::UrlEncode("集成电路(IC)/微控制器")
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/category/$category/meta" -Method Get
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "familyPath": "集成电路(IC)/微控制器",
    "totalComponents": 5678,
    "commonParameters": [
      {
        "name": "内核",
        "type": "string",
        "values": ["ARM Cortex-M3", "ARM Cortex-M4"]
      },
      {
        "name": "Flash",
        "type": "range",
        "unit": "KB",
        "min": 16,
        "max": 2048
      }
    ],
    "topManufacturers": [
      { "name": "STMicroelectronics", "count": 1234 },
      { "name": "NXP", "count": 890 }
    ]
  }
}
```

---

### 14. 获取参数定义

```bash
curl http://localhost:3001/api/doeeet-components/parameter-definitions

# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/doeeet-components/parameter-definitions" -Method Get
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "parameters": {
      "工作温度": {
        "type": "range",
        "unit": "℃",
        "description": "组件的工作温度范围",
        "common_values": ["-40℃ ~ 85℃", "-40℃ ~ 125℃"]
      },
      "封装": {
        "type": "enum",
        "description": "组件的封装类型",
        "common_values": ["LQFP-48", "QFN-48", "BGA-176"]
      }
    }
  }
}
```

---

## 使用 Postman 测试

### 导入 Postman Collection

创建一个 Postman Collection，包含以下请求：

1. **基础信息**
   - GET Statistics
   - GET Manufacturers
   - GET Family Paths

2. **搜索**
   - GET Search by Keyword
   - GET Search by Category
   - GET Search with Filters
   - GET Full-Text Search
   - GET Search Suggestions

3. **组件详情**
   - GET Component by ID
   - GET Similar Components
   - GET Components by Category

4. **批量操作**
   - POST Compare Components
   - POST Batch Get Components

5. **元数据**
   - GET Popular Filters
   - GET Category Meta
   - GET Parameter Definitions

---

## 使用浏览器测试

对于 GET 请求，可以直接在浏览器中访问：

1. **统计信息**：
   ```
   http://localhost:3001/api/doeeet-components/statistics
   ```

2. **搜索 STM32**：
   ```
   http://localhost:3001/api/doeeet-components/search?keyword=STM32&page=1&pageSize=20
   ```

3. **制造商列表**：
   ```
   http://localhost:3001/api/doeeet-components/manufacturers
   ```

4. **分类列表**：
   ```
   http://localhost:3001/api/doeeet-components/family-paths
   ```

---

## 测试 Redis 缓存

### 验证缓存是否工作

1. **首次请求**（应该较慢，从 MongoDB 读取）：
   ```bash
   time curl "http://localhost:3001/api/doeeet-components/search?keyword=STM32&page=1&pageSize=20"
   ```

2. **第二次请求**（应该很快，从 Redis 读取）：
   ```bash
   time curl "http://localhost:3001/api/doeeet-components/search?keyword=STM32&page=1&pageSize=20"
   ```

### 查看 Redis 中的缓存

```bash
# 连接到 Redis CLI
redis-cli

# 查看所有 DoEEEt 相关的缓存键
KEYS doeeet:*

# 查看特定缓存的内容
GET doeeet:search:keyword:STM32:page:1:pageSize:20

# 查看缓存的 TTL
TTL doeeet:search:keyword:STM32:page:1:pageSize:20

# 清除所有 DoEEEt 缓存
FLUSHDB
```

---

## 常见问题排查

### 1. 连接被拒绝

**错误**：`ECONNREFUSED`

**解决方案**：
- 确认后端服务已启动
- 检查端口是否正确（默认 3001）
- 检查防火墙设置

### 2. MongoDB 连接错误

**错误**：`MongoNetworkError`

**解决方案**：
- 确认 MongoDB 已启动
- 检查 `.env` 中的 `MONGODB_URI` 配置
- 验证数据库名称是否正确

### 3. Redis 连接错误

**错误**：`Redis connection failed`

**解决方案**：
- 确认 Redis 已启动
- 检查 `.env` 中的 Redis 配置
- 如果 Redis 未配置，系统会降级到无缓存模式

### 4. 搜索结果为空

**可能原因**：
- 数据尚未导入
- 搜索关键词不匹配
- 索引未创建

**解决方案**：
```bash
# 检查数据库中的文档数量
mongosh
use aerospace_platform
db.doeeet_components.countDocuments()

# 检查索引
db.doeeet_components.getIndexes()

# 重新创建索引
db.doeeet_components.createIndex({ "型号": "text", "描述": "text", "制造商": "text" })
```

---

## 性能基准

### 预期响应时间

| 操作 | 首次（无缓存） | 缓存命中 |
|------|----------------|----------|
| 统计信息 | < 100ms | < 10ms |
| 制造商列表 | < 50ms | < 5ms |
| 关键词搜索 | < 200ms | < 20ms |
| 分类搜索 | < 150ms | < 15ms |
| 组件详情 | < 50ms | < 5ms |
| 全文搜索 | < 300ms | < 30ms |

### 优化建议

1. **启用 Redis 缓存**以获得最佳性能
2. **确保 MongoDB 索引**已正确创建
3. **调整分页大小**（推荐 20-50 条/页）
4. **使用参数筛选**缩小搜索范围

---

## 下一步

1. ✅ **基础 API 测试** - 验证所有端点正常工作
2. ✅ **性能测试** - 测试缓存效果和响应时间
3. ✅ **前端集成** - 将 API 集成到前端组件
4. ✅ **用户测试** - 收集用户反馈并优化

测试愉快！🚀

