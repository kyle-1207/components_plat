# DoEEEt 集成功能 - README

欢迎使用 DoEEEt（Defense & Aerospace Electronic Equipment Database）集成功能！

本文档提供了快速导航，帮助您找到所需的文档和资源。

---

## 📚 文档导航

### 🚀 快速开始

如果您是第一次使用，请从这些文档开始：

1. **[前端分类筛选-快速开始.md](./前端分类筛选-快速开始.md)**
   - 5分钟快速上手分类筛选功能
   - 包含完整的代码示例

2. **[动态参数表头-快速开始.md](./frontend/docs/动态参数表头-快速开始.md)**
   - 5分钟快速上手动态参数表头
   - 包含API参考和使用场景

---

### 📖 详细文档

需要深入了解功能实现和技术细节，请查阅：

#### 分类筛选功能
- **[前端分类筛选功能实施方案.md](./前端分类筛选功能实施方案.md)**
  - 完整的技术架构和实施方案
  - 包含Phase 1-4的详细步骤
  - 测试计划和部署清单

- **[CategoryFilter使用说明.md](./frontend/docs/CategoryFilter使用说明.md)**
  - CategoryFilter组件完整API文档
  - Props、示例用法、后端API规范
  - 性能优化和常见问题

#### 动态参数表头功能
- **[动态参数表头展示说明.md](./frontend/docs/动态参数表头展示说明.md)**
  - 数据结构详解
  - UI展示逻辑和实现代码
  - HTML渲染处理和安全性

- **[DoEEEt动态参数表头实施总结.md](./DoEEEt动态参数表头实施总结.md)**
  - 核心功能总结
  - 技术实现方案
  - 性能优化和安全性

---

### 📋 总览文档

需要了解整体进度和规划，请查阅：

- **[DoEEEt功能开发总览.md](./DoEEEt功能开发总览.md)** ⭐ 推荐
  - 所有功能模块的开发进度
  - 技术架构总览
  - 近期开发计划和里程碑

- **[DoEEEt集成实施总结.md](./DoEEEt集成实施总结.md)**
  - 整体集成工作总结
  - 数据库设计和API接口
  - 实施进度和时间线

- **[DoEEEt项目开发计划.md](./DoEEEt项目开发计划.md)**
  - 项目阶段规划
  - 功能优先级
  - 资源分配

---

## 🎯 功能模块

### 1. ✅ 分类筛选功能（已完成）

**功能特点**：
- 15个顶层分类
- 2-5层深度导航
- 级联选择器 + Tab侧边栏双重交互

**快速开始**：
```tsx
import CategoryFilter from '@/components/CategoryFilter';

<CategoryFilter 
  onCategoryChange={(path) => console.log('选择:', path)}
/>
```

**相关文档**：
- [快速开始](./前端分类筛选-快速开始.md)
- [使用说明](./frontend/docs/CategoryFilter使用说明.md)
- [实施方案](./前端分类筛选功能实施方案.md)

---

### 2. ✅ 动态参数表头（核心完成）

**功能特点**：
- 智能表头展示（short_name + Tooltip）
- HTML标签支持（下标、上标）
- 360个动态参数灵活展示

**快速开始**：
```tsx
import { generateDynamicParameterColumns } from '@/utils/parameterUtils';

const dynamicColumns = generateDynamicParameterColumns(
  parameterDefinitions,
  { sortable: true }
);
```

**相关文档**：
- [快速开始](./frontend/docs/动态参数表头-快速开始.md)
- [展示说明](./frontend/docs/动态参数表头展示说明.md)
- [实施总结](./DoEEEt动态参数表头实施总结.md)

---

### 3. ⏳ 组件搜索功能（进行中）

**功能特点**：
- 关键词搜索
- 分类筛选
- 参数范围筛选
- 分页、排序、导出

**状态**: 40% 完成

---

### 4. ⏳ 动态参数筛选器（计划中）

**功能特点**：
- 根据分类动态显示参数筛选器
- 范围筛选（数值型）
- 枚举筛选（离散值）

**状态**: 0% - 待开发

---

## 💻 示例代码

### 基础示例

#### CategoryFilter 组件
```tsx
import React, { useState } from 'react';
import CategoryFilter from '@/components/CategoryFilter';

const MyComponent = () => {
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);

  return (
    <CategoryFilter 
      onCategoryChange={setSelectedCategory}
      selectedCategory={selectedCategory}
    />
  );
};
```

#### 动态参数表头
```tsx
import { Table } from 'antd';
import { generateDynamicParameterColumns } from '@/utils/parameterUtils';

const MyTable = ({ components, parameterDefinitions }) => {
  const staticColumns = [
    { title: '器件型号', dataIndex: 'partNumber', width: 150 },
  ];

  const dynamicColumns = generateDynamicParameterColumns(
    parameterDefinitions,
    { sortable: true, ellipsis: true }
  );

  return (
    <Table
      columns={[...staticColumns, ...dynamicColumns]}
      dataSource={components}
    />
  );
};
```

### 完整示例

查看完整示例代码：
- [DynamicParameterTableExample.tsx](./frontend/src/examples/DynamicParameterTableExample.tsx)

---

## 🏗️ 项目结构

```
Business_plat/
├── backend/
│   ├── src/
│   │   ├── models/DoeeetComponent.ts         # 数据模型
│   │   ├── services/DoeeetSearchService.ts   # 搜索服务
│   │   ├── controllers/doeeetComponentController.ts
│   │   └── routes/doeeetRoutes.ts            # API路由
│   └── data/meta.json                        # 分类配置
│
├── frontend/
│   ├── src/
│   │   ├── components/CategoryFilter.tsx     # 分类筛选组件
│   │   ├── utils/parameterUtils.tsx          # 参数工具函数
│   │   ├── examples/DynamicParameterTableExample.tsx
│   │   └── pages/components/ComponentSearch.tsx
│   └── docs/                                 # 前端文档
│
└── [文档]
    ├── DoEEEt-README.md (本文档)
    ├── DoEEEt功能开发总览.md
    ├── DoEEEt集成实施总结.md
    ├── 前端分类筛选功能实施方案.md
    └── DoEEEt动态参数表头实施总结.md
```

---

## 🚀 快速启动

### 后端服务

```bash
cd backend
npm install
npm run dev
```

访问 API: http://localhost:3001/api/doeeet/categories/tree

---

### 前端服务

```bash
cd frontend
npm install

# 安装可选依赖（用于HTML清理）
npm install dompurify @types/dompurify

npm run dev
```

访问前端: http://localhost:3000

---

## 📊 开发进度

| 功能模块 | 进度 | 状态 |
|---------|------|------|
| 分类筛选功能 | 100% | ✅ 完成 |
| 动态参数表头 | 75% | ✅ 核心完成 |
| 组件搜索功能 | 40% | ⏳ 进行中 |
| 动态参数筛选器 | 0% | ⏳ 计划中 |
| 组件详情页 | 20% | ⏳ 计划中 |

**整体进度**: 47%

详见：[DoEEEt功能开发总览.md](./DoEEEt功能开发总览.md)

---

## 📚 API 文档

### 后端 API

#### GET /api/doeeet/categories/tree
获取分类树数据

**响应示例**：
```json
{
  "success": true,
  "data": {
    "tree": [...],
    "subCategories": {...}
  }
}
```

#### GET /api/doeeet/search
搜索组件

**请求参数**：
- `keyword`: 关键词
- `familyPath`: 分类路径
- `page`: 页码
- `limit`: 每页数量

**响应示例**：
```json
{
  "success": true,
  "data": {
    "components": [...],
    "parameterDefinitions": [...],
    "total": 100
  }
}
```

---

## 🐛 常见问题

### Q1: 分类树加载失败？
- 检查后端服务是否运行
- 验证 meta.json 文件路径
- 查看 Redis 缓存状态

### Q2: 表头显示 HTML 源代码？
- 确认使用了 `dangerouslySetInnerHTML`
- 安装 DOMPurify: `npm install dompurify @types/dompurify`

### Q3: 列宽度不合适？
- 调整 `columnWidth` 和 `minColumnWidth` 参数

详见各文档的「常见问题」章节。

---

## 🤝 贡献指南

### 开发流程
1. Fork 项目
2. 创建 feature 分支
3. 提交代码 + 测试
4. 提交 Pull Request

### 代码规范
- TypeScript 严格模式
- ESLint + Prettier
- 必须有单元测试
- 必须有 JSDoc 注释

---

## 📞 联系方式

**项目团队**: 开发团队  
**最后更新**: 2025-10-31  
**当前版本**: v0.5  
**预计发布**: v1.0 (2025-11-15)

---

## 📈 数据规模

- **总组件数**: ~50,000+ 个
- **顶层分类**: 15 个
- **叶子分类**: 181 个
- **动态参数**: 360 个
- **制造商**: ~200+ 家

---

## 🎉 快速链接

### 🚀 快速开始
- [分类筛选快速开始](./前端分类筛选-快速开始.md)
- [动态参数表头快速开始](./frontend/docs/动态参数表头-快速开始.md)

### 📖 详细文档
- [分类筛选实施方案](./前端分类筛选功能实施方案.md)
- [CategoryFilter使用说明](./frontend/docs/CategoryFilter使用说明.md)
- [动态参数表头展示说明](./frontend/docs/动态参数表头展示说明.md)

### 📋 总览
- [功能开发总览](./DoEEEt功能开发总览.md) ⭐
- [集成实施总结](./DoEEEt集成实施总结.md)
- [项目开发计划](./DoEEEt项目开发计划.md)

### 💻 示例代码
- [CategoryFilter.tsx](./frontend/src/components/CategoryFilter.tsx)
- [parameterUtils.tsx](./frontend/src/utils/parameterUtils.tsx)
- [DynamicParameterTableExample.tsx](./frontend/src/examples/DynamicParameterTableExample.tsx)

---

**感谢使用 DoEEEt 系统！有任何问题，欢迎查阅文档或联系我们。**

Happy Coding! 🚀

