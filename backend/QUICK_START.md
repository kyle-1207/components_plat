# 航天元器件应用服务平台 - 快速启动指南

## 🚀 项目概述

基于 `DEVELOPMENT_RULES.md` 规范，已实现7大核心业务模块的基础功能：

1. **标准服务** - 标准文档查询、版本管理、对比分析
2. **器件查询服务** - 器件搜索、参数对比、供应商信息
3. **采购服务** - 采购需求管理、供应商评估、库存跟踪
4. **应用支持服务** - 功能单元、数字模型、技术文档
5. **质量管理服务** - 质量问题上报、跟踪、通报系统
6. **试验检测服务** - 测试管理、辐照数据、报告生成
7. **文档管理服务** - 文档存储、分类管理、搜索下载

## 📁 项目结构

```
backend/
├── src/
│   ├── controllers/          # 控制器层
│   │   ├── componentController.ts
│   │   ├── standardController.ts
│   │   ├── qualityController.ts
│   │   ├── testController.ts
│   │   ├── procurementController.ts
│   │   ├── documentController.ts
│   │   ├── applicationSupportController.ts
│   │   ├── supplierController.ts
│   │   ├── searchController.ts
│   │   └── selectionController.ts
│   ├── routes/               # 路由层
│   │   ├── componentRoutes.ts
│   │   ├── standardRoutes.ts
│   │   ├── qualityRoutes.ts
│   │   ├── testRoutes.ts
│   │   ├── procurementRoutes.ts
│   │   ├── documentRoutes.ts
│   │   ├── applicationSupportRoutes.ts
│   │   ├── supplierRoutes.ts
│   │   ├── searchRoutes.ts
│   │   └── selectionRoutes.ts
│   ├── models/               # 数据模型
│   │   ├── Component.ts
│   │   ├── Standard.ts
│   │   ├── QualityIssue.ts
│   │   ├── TestRecord.ts
│   │   ├── ProcurementRequest.ts
│   │   ├── Document.ts
│   │   ├── ApplicationSupport.ts
│   │   ├── Supplier.ts
│   │   ├── RadiationTest.ts
│   │   └── index.ts
│   ├── middleware/           # 中间件
│   ├── utils/               # 工具函数
│   ├── config/              # 配置文件
│   └── index.ts             # 主服务器文件
├── API_MODULES_SUMMARY.md   # API文档总结
└── QUICK_START.md          # 本文件
```

## 🛠️ 快速启动

### 1. 安装依赖
```bash
cd backend
npm install
```

### 2. 环境配置
复制环境变量文件：
```bash
cp .env.example .env
```

### 3. 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

### 4. 验证服务
访问健康检查端点：
```bash
curl http://localhost:3001/health
```

## 📚 API 端点总览

### 核心模块API
| 模块 | 基础路径 | 描述 |
|------|----------|------|
| 标准服务 | `/api/standards` | 标准文档管理和查询 |
| 器件服务 | `/api/components` | 器件信息查询和对比 |
| 采购服务 | `/api/procurement` | 采购流程管理 |
| 应用支持 | `/api/application-support` | 功能单元和数字模型 |
| 质量管理 | `/api/quality` | 质量问题跟踪管理 |
| 试验检测 | `/api/tests` | 测试记录和辐照数据 |
| 文档管理 | `/api/documents` | 技术文档存储管理 |

### 辅助服务API
| 服务 | 基础路径 | 描述 |
|------|----------|------|
| 供应商 | `/api/suppliers` | 供应商信息管理 |
| 搜索 | `/api/search` | 全局搜索服务 |
| 选型 | `/api/selections` | 选型清单管理 |

## 🔧 功能特性

### ✅ 已实现功能
- [x] 完整的7大核心模块API
- [x] 统一的错误处理机制
- [x] 分页、搜索、排序支持
- [x] 数据模型和关系定义
- [x] API文档和接口规范
- [x] 健康检查和监控端点

### 🔄 待开发功能
- [ ] 用户认证和权限管理
- [ ] 文件上传和存储服务
- [ ] 实时通知系统
- [ ] 数据导入导出
- [ ] 高级搜索和推荐
- [ ] 工作流引擎
- [ ] 报表生成功能
- [ ] API限流和缓存

## 🧪 API测试示例

### 获取标准列表
```bash
curl "http://localhost:3001/api/standards?page=1&limit=10&type=MIL"
```

### 创建质量问题
```bash
curl -X POST "http://localhost:3001/api/quality/issues" \
  -H "Content-Type: application/json" \
  -d '{
    "componentId": "60f1b2b3c4d5e6f7g8h9i0j1",
    "issueType": "design_defect",
    "severity": "critical",
    "description": "器件在高温环境下性能异常"
  }'
```

### 获取测试统计
```bash
curl "http://localhost:3001/api/tests/statistics"
```

## 📊 数据库设计

### 核心数据模型
1. **Component** - 器件基础信息、规格参数、供应商信息
2. **Standard** - 标准文档、版本管理、关联器件
3. **QualityIssue** - 质量问题跟踪、归零流程
4. **TestRecord** - 测试记录、结果数据、报告文件
5. **ProcurementRequest** - 采购需求、供应商评估、合同管理
6. **Document** - 技术文档、分类管理、访问控制
7. **FunctionalUnit** - 功能单元、电路设计、验证信息
8. **DigitalModel** - 数字模型、仿真参数、验证数据

### 关系设计
- 器件与标准：多对多关系
- 器件与质量问题：一对多关系
- 器件与测试记录：一对多关系
- 采购请求与供应商：多对多关系
- 文档与器件：多对多关系

## 🔍 开发指导

### 添加新功能
1. 在相应的控制器中添加新方法
2. 在路由文件中定义新端点
3. 更新数据模型（如需要）
4. 添加适当的错误处理
5. 更新API文档

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint规则
- 添加适当的注释和文档
- 实现统一的错误处理
- 使用异步处理模式

## 📝 日志和监控

### 日志级别
- `error`: 错误信息
- `warn`: 警告信息
- `info`: 一般信息
- `debug`: 调试信息

### 监控指标
- API响应时间
- 错误率统计
- 数据库查询性能
- 系统资源使用情况

## 🚀 部署建议

### 开发环境
- 使用内存存储进行快速开发
- 启用详细日志输出
- 使用热重载功能

### 生产环境
- 配置MongoDB数据库
- 启用API缓存
- 配置负载均衡
- 设置监控告警
- 实施安全策略

## 📞 技术支持

如需技术支持或有任何问题，请：
1. 查看API文档 (`API_MODULES_SUMMARY.md`)
2. 检查开发规范 (`DEVELOPMENT_RULES.md`)
3. 查看错误日志和系统状态
4. 联系开发团队

---

🎯 **目标**: 构建航天级质量的元器件应用服务平台，为商业航天发展提供可靠的技术支撑！
