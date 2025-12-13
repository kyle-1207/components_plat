# DoEEEt API 快速测试指南

## 🚀 快速开始

### 第一步：启动服务

```bash
# 1. 启动 MongoDB (如果未启动)
# MongoDB 应该在默认端口 27017 运行

# 2. 启动 Redis (可选，但强烈建议)
redis-server

# 或使用 WSL
wsl redis-server

# 3. 启动后端服务
cd backend
npm run dev
```

看到以下输出表示启动成功：
```
✓ MongoDB connected successfully
✓ Redis connected successfully (或 ⚠ Redis not configured - running without cache)
Server is running on port 3001
```

---

### 第二步：运行测试脚本

选择适合你的测试方式：

#### 方式 1: 使用 PowerShell 脚本（推荐 Windows 用户）

```powershell
cd backend
.\test_doeeet_api.ps1
```

#### 方式 2: 使用 Bash 脚本（WSL / Git Bash / Linux / Mac）

```bash
cd backend
chmod +x test_doeeet_api.sh
./test_doeeet_api.sh
```

#### 方式 3: 手动测试单个 API

```bash
# 获取统计信息
curl http://localhost:3001/api/doeeet-components/statistics

# 搜索 STM32
curl "http://localhost:3001/api/doeeet-components/search?keyword=STM32&page=1&pageSize=10"

# 获取制造商列表
curl http://localhost:3001/api/doeeet-components/manufacturers
```

---

## 📋 核心 API 端点

### 1. 统计信息
```
GET /api/doeeet-components/statistics
```

### 2. 制造商列表
```
GET /api/doeeet-components/manufacturers
```

### 3. 分类列表
```
GET /api/doeeet-components/family-paths
```

### 4. 组件搜索
```
GET /api/doeeet-components/search?keyword={关键词}&page=1&pageSize=20
```

**支持的查询参数：**
- `keyword`: 搜索关键词
- `manufacturer`: 制造商名称
- `familyPath`: 分类路径
- `minValue` / `maxValue`: 参数值范围
- `unit`: 参数单位
- `sortBy`: 排序字段 (price, stock, createdAt)
- `sortOrder`: 排序方向 (asc, desc)
- `page`: 页码（从 1 开始）
- `pageSize`: 每页数量（默认 20）

### 5. 组件详情
```
GET /api/doeeet-components/{componentId}
```

### 6. 相似组件
```
GET /api/doeeet-components/{componentId}/similar?limit=10
```

### 7. 批量比较
```
POST /api/doeeet-components/compare
Content-Type: application/json

{
  "componentIds": ["id1", "id2", "id3"]
}
```

---

## 🔍 测试示例

### 示例 1: 搜索 STM32 微控制器

```bash
curl "http://localhost:3001/api/doeeet-components/search?keyword=STM32&page=1&pageSize=5"
```

**预期结果：**
- 返回包含 STM32 关键词的组件列表
- 包含分页信息
- 包含可用的筛选项

### 示例 2: 按制造商筛选

```bash
curl "http://localhost:3001/api/doeeet-components/search?manufacturer=STMicroelectronics&page=1&pageSize=10"
```

### 示例 3: 按分类搜索

```bash
# 注意：需要对中文进行 URL 编码
curl "http://localhost:3001/api/doeeet-components/search?familyPath=%E9%9B%86%E6%88%90%E7%94%B5%E8%B7%AF(IC)&page=1&pageSize=10"
```

### 示例 4: 参数范围筛选

```bash
# 搜索阻值在 1kΩ - 10kΩ 的电阻
curl "http://localhost:3001/api/doeeet-components/search?keyword=电阻&minValue=1000&maxValue=10000&unit=Ω&page=1&pageSize=10"
```

### 示例 5: 组合筛选 + 排序

```bash
# 搜索 STM32，按价格升序排列
curl "http://localhost:3001/api/doeeet-components/search?keyword=STM32&manufacturer=STMicroelectronics&sortBy=price&sortOrder=asc&page=1&pageSize=10"
```

---

## 📊 理解响应格式

所有成功的响应都遵循以下格式：

```json
{
  "success": true,
  "data": {
    // 实际数据内容
  }
}
```

### 搜索响应示例

```json
{
  "success": true,
  "data": {
    "components": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "型号": "STM32F103C8T6",
        "制造商": "STMicroelectronics",
        "描述": "ARM Cortex-M3 MCU, 64KB Flash",
        "分类": "集成电路(IC)/微控制器",
        "封装": "LQFP-48",
        "库存": 5000,
        "价格": "¥8.50",
        "参数": {
          "内核": "ARM Cortex-M3",
          "主频": "72MHz",
          "Flash": "64KB",
          "RAM": "20KB"
        }
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

## ⚡ 性能测试

### 测试缓存效果

```bash
# 第一次请求（无缓存）
time curl "http://localhost:3001/api/doeeet-components/search?keyword=STM32&page=1&pageSize=20"

# 第二次请求（有缓存）
time curl "http://localhost:3001/api/doeeet-components/search?keyword=STM32&page=1&pageSize=20"
```

**预期结果：**
- 第一次：100-300ms（从 MongoDB 读取）
- 第二次：10-30ms（从 Redis 缓存读取）

### 查看 Redis 缓存

```bash
# 连接到 Redis CLI
redis-cli

# 查看所有 DoEEEt 缓存键
KEYS doeeet:*

# 查看特定缓存
GET doeeet:search:keyword:STM32:page:1:pageSize:20

# 查看缓存过期时间（秒）
TTL doeeet:search:keyword:STM32:page:1:pageSize:20

# 清除所有缓存
FLUSHDB

# 退出
exit
```

---

## 🐛 常见问题排查

### 问题 1: 连接被拒绝

```
Error: connect ECONNREFUSED 127.0.0.1:3001
```

**解决方案：**
- 确认后端服务已启动：`npm run dev`
- 检查是否有其他进程占用 3001 端口
- 查看后端控制台是否有错误信息

### 问题 2: 搜索结果为空

```json
{
  "success": true,
  "data": {
    "components": [],
    "pagination": { "totalItems": 0 }
  }
}
```

**可能原因和解决方案：**

1. **数据未导入**
   ```bash
   # 检查数据库
   mongosh
   use aerospace_platform
   db.doeeet_components.countDocuments()
   ```

2. **索引未创建**
   ```bash
   # 在 mongosh 中创建索引
   db.doeeet_components.createIndex({ "型号": "text", "描述": "text", "制造商": "text" })
   ```

3. **关键词不匹配**
   - 尝试使用更通用的关键词
   - 检查数据库中实际的字段名称

### 问题 3: Redis 错误

```
⚠ Redis not configured - running without cache
```

**说明：**
- 这不是致命错误，系统会降级运行
- 只是意味着没有缓存加速
- 如果需要缓存，请配置 Redis

**解决方案：**
1. 启动 Redis：`redis-server`
2. 配置 `.env` 文件：
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   ```
3. 重启后端服务

### 问题 4: MongoDB 连接错误

```
MongoNetworkError: failed to connect to server
```

**解决方案：**
1. 启动 MongoDB 服务
2. 检查 `.env` 中的 `MONGODB_URI`
3. 确认数据库名称正确

### 问题 5: 响应太慢

**优化建议：**
1. **启用 Redis 缓存**（最有效）
2. **减小 pageSize**（推荐 20-50）
3. **使用具体的筛选条件**缩小搜索范围
4. **检查 MongoDB 索引**是否创建

---

## 📝 测试检查清单

使用此清单确保所有功能正常：

- [ ] 后端服务正常启动
- [ ] MongoDB 连接成功
- [ ] Redis 连接成功（可选）
- [ ] 统计信息 API 返回正确数据
- [ ] 制造商列表 API 返回正确数据
- [ ] 分类列表 API 返回正确数据
- [ ] 关键词搜索正常工作
- [ ] 制造商筛选正常工作
- [ ] 分类筛选正常工作
- [ ] 参数范围筛选正常工作
- [ ] 排序功能正常工作
- [ ] 分页功能正常工作
- [ ] 组件详情 API 正常工作
- [ ] 相似组件推荐正常工作
- [ ] 批量比较功能正常工作
- [ ] 缓存功能正常工作（第二次请求更快）

---

## 🎯 下一步

完成基础测试后，你可以：

1. **集成前端**
   - 在 `ComponentSearch.tsx` 中调用这些 API
   - 实现搜索、筛选、分页功能

2. **性能优化**
   - 监控响应时间
   - 调整缓存策略
   - 优化数据库查询

3. **功能扩展**
   - 添加高级搜索功能
   - 实现智能推荐
   - 添加搜索历史记录

4. **用户测试**
   - 收集用户反馈
   - 优化搜索体验
   - 完善筛选项

---

## 📚 相关文档

- **详细 API 文档**: `backend/DOEEET_API_TESTING.md`
- **Redis 配置指南**: `backend/REDIS_SETUP.md`
- **数据导入说明**: `data/doeeet/doeeet/数据说明(2).md`
- **前端集成方案**: `前端实施方案总结.md`
- **完整实施总结**: `DoEEEt集成实施总结.md`

---

## 💡 提示

- 使用 **Postman** 或 **Insomnia** 可以更方便地测试 API
- 安装 **jq** 工具可以美化 JSON 输出：`npm install -g json`
- 使用浏览器的 **开发者工具** 可以查看实际的网络请求
- **Redis Desktop Manager** 可以可视化查看缓存内容

---

**祝测试顺利！** 🚀

如有问题，请查看详细文档或联系开发团队。

