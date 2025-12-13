# 航天元器件应用服务平台 - 7大核心模块API文档

## 概述

基于 `DEVELOPMENT_RULES.md` 中定义的7大核心业务模块，已实现以下基础功能API：

## 1. 标准服务 (Standard Service)
**基础路径**: `/api/standards`

### 核心功能
- 标准文档查询和搜索
- 标准版本管理
- 标准对比分析

### 主要API端点
- `GET /api/standards` - 获取标准列表（支持搜索、过滤、分页）
- `GET /api/standards/:id` - 获取标准详情
- `POST /api/standards` - 创建标准
- `PUT /api/standards/:id` - 更新标准
- `DELETE /api/standards/:id` - 删除标准
- `POST /api/standards/compare` - 标准对比分析
- `GET /api/standards/statistics` - 获取标准统计信息

### 支持的标准类型
- MIL (美军标准)
- ESCC (欧洲标准)
- ISO (国际标准)
- IEC (国际电工标准)
- GB (国标)
- GJB (国军标)

## 2. 器件查询服务 (Component Service)
**基础路径**: `/api/components`

### 核心功能
- 器件多维度搜索
- 器件参数对比
- 供应商信息查询

### 主要API端点
- `GET /api/components` - 获取器件列表
- `GET /api/components/:id` - 获取器件详情
- `GET /api/components/compare` - 器件参数对比
- `GET /api/components/category/:category` - 按分类获取器件
- `GET /api/components/:id/stock` - 获取库存信息

### 支持的搜索维度
- 基础筛选：型号规格、制造商、封装类型、功能分类
- 技术筛选：电气参数、机械参数、环境参数、可靠性指标
- 质量筛选：质量等级、认证状态、辐照等级、生命周期状态

## 3. 采购服务 (Procurement Service)
**基础路径**: `/api/procurement`

### 核心功能
- 采购需求管理
- 供应商评估
- 库存状态查询

### 主要API端点
- `GET /api/procurement/requests` - 获取采购请求列表
- `POST /api/procurement/requests` - 创建采购请求
- `POST /api/procurement/requests/:id/evaluate` - 供应商评估
- `GET /api/procurement/statistics` - 获取采购统计信息

### 采购流程支持
- 需求申请 → 供应商询价 → 评估对比 → 合同签署 → 交付验收

## 4. 应用支持服务 (Application Support Service)
**基础路径**: `/api/application-support`

### 核心功能
- 技术文档管理
- 功能单元管理
- 数字模型管理

### 主要API端点
- `GET /api/application-support/functional-units` - 获取功能单元列表
- `POST /api/application-support/functional-units` - 创建功能单元
- `GET /api/application-support/digital-models` - 获取数字模型列表
- `POST /api/application-support/digital-models` - 创建数字模型
- `GET /api/application-support/functional-units/:id/download` - 下载功能单元
- `GET /api/application-support/digital-models/:id/download` - 下载数字模型
- `GET /api/application-support/statistics` - 获取应用支持统计信息

### 支持的模型类型
- SPICE模型
- IBIS模型
- S参数模型
- 热模型
- 机械模型
- 行为模型

## 5. 质量管理服务 (Quality Management Service)
**基础路径**: `/api/quality`

### 核心功能
- 质量问题上报
- 质量问题跟踪
- 质量通报系统

### 主要API端点
- `GET /api/quality/issues` - 获取质量问题列表
- `GET /api/quality/issues/:id` - 获取质量问题详情
- `POST /api/quality/issues` - 创建质量问题
- `PUT /api/quality/issues/:id` - 更新质量问题
- `POST /api/quality/issues/:id/resolve` - 质量问题归零处理
- `POST /api/quality/notifications` - 发布质量通报
- `GET /api/quality/statistics` - 获取质量统计信息

### 质量问题分类
- 设计缺陷 (design_defect)
- 制造缺陷 (manufacturing_defect)
- 应用问题 (application_issue)

### 严重程度分级
- 严重 (critical)
- 重要 (major)
- 一般 (minor)
- 轻微 (trivial)

## 6. 试验检测服务 (Test Detection Service)
**基础路径**: `/api/tests`

### 核心功能
- 检测项目管理
- 检测报告管理
- 辐照测试数据管理

### 主要API端点
- `GET /api/tests` - 获取测试记录列表
- `GET /api/tests/:id` - 获取测试记录详情
- `POST /api/tests` - 创建测试记录
- `PUT /api/tests/:id` - 更新测试记录
- `POST /api/tests/:id/complete` - 完成测试
- `GET /api/tests/radiation` - 获取辐照测试数据
- `GET /api/tests/statistics` - 获取测试统计信息

### 支持的测试类型
- 电气性能测试 (electrical)
- 环境适应性测试 (environmental)
- 辐照测试 (radiation)
- 机械测试 (mechanical)
- 可靠性测试 (reliability)
- EMC测试 (emc)

### 辐照测试类型
- TID (总剂量)
- SEE (单粒子效应)
- DD (位移损伤)
- 中子辐照
- 质子辐照

## 7. 文档管理服务 (Document Management Service)
**基础路径**: `/api/documents`

### 核心功能
- 技术文档存储
- 文档分类管理
- 文档搜索和下载

### 主要API端点
- `GET /api/documents` - 获取文档列表
- `GET /api/documents/:id` - 获取文档详情
- `POST /api/documents` - 上传文档
- `PUT /api/documents/:id` - 更新文档
- `DELETE /api/documents/:id` - 删除文档
- `GET /api/documents/statistics` - 获取文档统计信息

### 文档类型
- 技术文档 (technical)
- 标准文档 (standard)
- 应用文档 (application)
- 测试报告 (test_report)
- 证书文档 (certificate)
- 用户手册 (manual)

### 访问级别
- 公开 (public)
- 受限 (restricted)
- 机密 (confidential)

## 通用功能特性

### 分页支持
所有列表API都支持分页参数：
- `page`: 页码（默认：1）
- `limit`: 每页数量（默认：20）

### 搜索和过滤
支持多种搜索和过滤方式：
- 关键词搜索
- 多维度筛选
- 排序（升序/降序）

### 统计分析
每个模块都提供统计信息API，包括：
- 数量统计
- 分布分析
- 趋势图表数据

### 错误处理
统一的错误响应格式：
```json
{
  "success": false,
  "message": "错误描述",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 成功响应
统一的成功响应格式：
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 数据模型

### 核心数据模型已创建
1. `Component` - 器件模型
2. `Standard` - 标准模型
3. `QualityIssue` - 质量问题模型
4. `TestRecord` - 测试记录模型
5. `ProcurementRequest` - 采购请求模型
6. `DocumentModel` - 文档模型
7. `FunctionalUnit` - 功能单元模型
8. `DigitalModel` - 数字模型模型
9. `Supplier` - 供应商模型
10. `RadiationTest` - 辐照测试模型

## 部署说明

1. 所有路由已在 `backend/src/index.ts` 中注册
2. 控制器文件位于 `backend/src/controllers/` 目录
3. 路由文件位于 `backend/src/routes/` 目录
4. 数据模型文件位于 `backend/src/models/` 目录

## 下一步开发建议

1. 添加用户认证和权限管理
2. 实现文件上传功能
3. 集成外部API（如供应商价格API）
4. 添加实时通知功能
5. 实现高级搜索和推荐算法
6. 添加数据导入导出功能
7. 实现工作流引擎
8. 添加报表生成功能

这个基础架构为航天元器件应用服务平台提供了完整的7大核心模块功能，符合DEVELOPMENT_RULES.md中定义的业务需求和技术规范。
