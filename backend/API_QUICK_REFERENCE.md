# DoEEEt API 快速参考

## 🚀 常用命令速查

### PowerShell 快速测试
```powershell
# 统计信息
Invoke-RestMethod http://localhost:3001/api/doeeet-components/statistics

# 搜索 STM32
Invoke-RestMethod "http://localhost:3001/api/doeeet-components/search?keyword=STM32&page=1&pageSize=10"

# 制造商列表
Invoke-RestMethod http://localhost:3001/api/doeeet-components/manufacturers
```

### Curl 快速测试
```bash
# 统计信息
curl http://localhost:3001/api/doeeet-components/statistics

# 搜索 STM32
curl "http://localhost:3001/api/doeeet-components/search?keyword=STM32&page=1&pageSize=10"

# 制造商列表
curl http://localhost:3001/api/doeeet-components/manufacturers
```

### 浏览器直接访问
```
http://localhost:3001/api/doeeet-components/statistics
http://localhost:3001/api/doeeet-components/search?keyword=STM32&page=1&pageSize=10
http://localhost:3001/api/doeeet-components/manufacturers
```

---

## 📋 API 端点速查表

| 端点 | 方法 | 功能 | 示例 |
|------|------|------|------|
| `/statistics` | GET | 获取统计信息 | `GET /api/doeeet-components/statistics` |
| `/manufacturers` | GET | 制造商列表 | `GET /api/doeeet-components/manufacturers` |
| `/family-paths` | GET | 分类列表 | `GET /api/doeeet-components/family-paths` |
| `/search` | GET | 组件搜索 | `GET /api/doeeet-components/search?keyword=STM32` |
| `/fulltext-search` | GET | 全文搜索 | `GET /api/doeeet-components/fulltext-search?query=微控制器` |
| `/suggestions` | GET | 搜索建议 | `GET /api/doeeet-components/suggestions?prefix=STM` |
| `/:id` | GET | 组件详情 | `GET /api/doeeet-components/{id}` |
| `/:id/similar` | GET | 相似组件 | `GET /api/doeeet-components/{id}/similar` |
| `/compare` | POST | 批量比较 | `POST /api/doeeet-components/compare` |
| `/batch` | POST | 批量获取 | `POST /api/doeeet-components/batch` |
| `/popular-filters` | GET | 热门筛选项 | `GET /api/doeeet-components/popular-filters` |
| `/parameter-definitions` | GET | 参数定义 | `GET /api/doeeet-components/parameter-definitions` |

---

## 🔍 搜索参数速查

### 基础参数
```
keyword       搜索关键词
page          页码（默认 1）
pageSize      每页数量（默认 20）
```

### 筛选参数
```
manufacturer  制造商名称
familyPath    分类路径
minValue      最小值
maxValue      最大值
unit          单位
```

### 排序参数
```
sortBy        排序字段: price | stock | createdAt
sortOrder     排序方向: asc | desc
```

---

## 📝 常用搜索示例

### 1. 基础搜索
```bash
# 搜索 STM32
/api/doeeet-components/search?keyword=STM32&page=1&pageSize=20

# 搜索电阻
/api/doeeet-components/search?keyword=电阻&page=1&pageSize=20
```

### 2. 制造商筛选
```bash
# 搜索 ST 的所有产品
/api/doeeet-components/search?manufacturer=STMicroelectronics&page=1&pageSize=20

# 搜索 ST 的 STM32
/api/doeeet-components/search?keyword=STM32&manufacturer=STMicroelectronics&page=1&pageSize=20
```

### 3. 分类筛选
```bash
# 获取所有微控制器
/api/doeeet-components/search?familyPath=集成电路(IC)/微控制器&page=1&pageSize=20

# 获取所有 IC
/api/doeeet-components/search?familyPath=集成电路(IC)&page=1&pageSize=20
```

### 4. 参数范围筛选
```bash
# 1kΩ - 10kΩ 的电阻
/api/doeeet-components/search?keyword=电阻&minValue=1000&maxValue=10000&unit=Ω&page=1&pageSize=20

# 工作温度 -40℃ ~ 85℃
/api/doeeet-components/search?keyword=芯片&minValue=-40&maxValue=85&unit=℃&page=1&pageSize=20
```

### 5. 排序
```bash
# 按价格从低到高
/api/doeeet-components/search?keyword=电阻&sortBy=price&sortOrder=asc&page=1&pageSize=20

# 按库存从高到低
/api/doeeet-components/search?keyword=电容&sortBy=stock&sortOrder=desc&page=1&pageSize=20

# 最新添加的组件
/api/doeeet-components/search?sortBy=createdAt&sortOrder=desc&page=1&pageSize=20
```

### 6. 组合查询
```bash
# 复杂查询示例
/api/doeeet-components/search?keyword=STM32&manufacturer=STMicroelectronics&familyPath=集成电路(IC)/微控制器&sortBy=price&sortOrder=asc&page=1&pageSize=20
```

---

## 💡 实用技巧

### 1. 使用 jq 格式化输出（Bash）
```bash
curl http://localhost:3001/api/doeeet-components/statistics | jq '.'
```

### 2. 查看响应时间（Bash）
```bash
time curl "http://localhost:3001/api/doeeet-components/search?keyword=STM32&page=1&pageSize=20"
```

### 3. 保存响应到文件
```bash
# PowerShell
Invoke-RestMethod http://localhost:3001/api/doeeet-components/statistics | ConvertTo-Json -Depth 10 > statistics.json

# Bash
curl http://localhost:3001/api/doeeet-components/statistics > statistics.json
```

### 4. 测试缓存效果
```bash
# 第一次（慢）
time curl "http://localhost:3001/api/doeeet-components/search?keyword=测试&page=1&pageSize=20"

# 第二次（快）
time curl "http://localhost:3001/api/doeeet-components/search?keyword=测试&page=1&pageSize=20"
```

### 5. 批量测试（Bash）
```bash
#!/bin/bash
for keyword in "STM32" "电阻" "电容" "芯片"; do
    echo "测试关键词: $keyword"
    curl -s "http://localhost:3001/api/doeeet-components/search?keyword=$keyword&page=1&pageSize=5" | jq '.data.pagination.totalItems'
done
```

---

## 🐛 错误代码速查

| 状态码 | 含义 | 常见原因 |
|--------|------|----------|
| 200 | 成功 | 请求成功 |
| 400 | 错误请求 | 参数格式错误 |
| 404 | 未找到 | 组件 ID 不存在 |
| 500 | 服务器错误 | 数据库连接失败等 |

---

## 📊 响应格式速查

### 成功响应
```json
{
  "success": true,
  "data": {
    // 实际数据
  }
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误信息"
}
```

### 搜索响应结构
```json
{
  "success": true,
  "data": {
    "components": [...],      // 组件列表
    "pagination": {           // 分页信息
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 156,
      "totalPages": 8
    },
    "filters": {              // 可用筛选项
      "manufacturers": [...],
      "categories": [...],
      "parameterRanges": {...}
    }
  }
}
```

---

## 🔧 Redis 命令速查

```bash
# 连接 Redis
redis-cli

# 查看所有 DoEEEt 缓存
KEYS doeeet:*

# 查看缓存数量
DBSIZE

# 查看特定缓存
GET doeeet:search:keyword:STM32:page:1:pageSize:20

# 查看缓存 TTL
TTL doeeet:search:keyword:STM32:page:1:pageSize:20

# 清除所有缓存
FLUSHDB

# 查看内存使用
INFO memory

# 监控实时命令
MONITOR
```

---

## 📦 MongoDB 命令速查

```bash
# 连接 MongoDB
mongosh

# 切换数据库
use aerospace_platform

# 查看文档数量
db.doeeet_components.countDocuments()

# 查看索引
db.doeeet_components.getIndexes()

# 创建文本索引
db.doeeet_components.createIndex({ "型号": "text", "描述": "text", "制造商": "text" })

# 查找示例文档
db.doeeet_components.findOne()

# 按制造商统计
db.doeeet_components.aggregate([
  { $group: { _id: "$制造商", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
])

# 查看集合大小
db.doeeet_components.stats()
```

---

## 🎯 测试检查清单

快速验证系统是否正常：

```bash
# 1. 检查服务状态
curl http://localhost:3001/api/doeeet-components/statistics

# 2. 检查搜索功能
curl "http://localhost:3001/api/doeeet-components/search?keyword=STM32&page=1&pageSize=5"

# 3. 检查制造商列表
curl http://localhost:3001/api/doeeet-components/manufacturers

# 4. 检查分类列表
curl http://localhost:3001/api/doeeet-components/family-paths

# 5. 检查缓存（第二次应该更快）
time curl "http://localhost:3001/api/doeeet-components/search?keyword=test&page=1&pageSize=10"
time curl "http://localhost:3001/api/doeeet-components/search?keyword=test&page=1&pageSize=10"
```

---

## 📚 相关文档

- **完整 API 文档**: `DOEEET_API_TESTING.md`
- **快速开始**: `QUICK_START_TESTING.md`
- **Postman Collection**: `DoEEEt_API.postman_collection.json`
- **Redis 配置**: `REDIS_SETUP.md`

---

## 🆘 获取帮助

### 查看日志
```bash
# 后端日志
cd backend
npm run dev

# Redis 日志
redis-cli MONITOR

# MongoDB 日志
mongosh --eval "db.adminCommand({getLog:'global'})"
```

### 常见问题
1. **连接被拒绝** → 确认后端服务已启动
2. **搜索无结果** → 检查数据是否已导入
3. **响应很慢** → 启用 Redis 缓存
4. **Redis 错误** → 系统会自动降级运行

---

**最后更新**: 2025-10-30

**提示**: 将此文档保存为书签，方便快速查找 API 端点和命令！

