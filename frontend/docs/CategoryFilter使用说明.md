# CategoryFilter 组件使用说明

## 概述

`CategoryFilter` 是一个用于DoEEEt电子元件分类筛选的React组件。它支持两种交互方式：
1. **级联选择器** - 快速选择分类路径
2. **Tab + 侧边栏** - 浏览完整分类树

## 数据来源

组件从后端API `/api/doeeet/categories/tree` 加载分类数据，该数据基于 `meta.json` 文件：
- **15个顶层分类**（如 Microcircuits, Capacitors 等）
- **181个叶子分类**（最细分类）
- **2-5层深度的层级结构**

## 组件API

### Props

```typescript
interface CategoryFilterProps {
  // 分类变化回调函数
  onCategoryChange: (categoryPath: string[]) => void;
  
  // 当前选中的分类路径（可选）
  selectedCategory?: string[];
}
```

### 示例用法

#### 1. 基础用法

```tsx
import React, { useState } from 'react';
import CategoryFilter from '@/components/CategoryFilter';

const ComponentSearchPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);

  const handleCategoryChange = (categoryPath: string[]) => {
    console.log('选择的分类路径:', categoryPath);
    setSelectedCategory(categoryPath);
    
    // 发送搜索请求
    searchComponents({ familyPath: categoryPath });
  };

  return (
    <div>
      <CategoryFilter 
        onCategoryChange={handleCategoryChange}
        selectedCategory={selectedCategory}
      />
    </div>
  );
};
```

#### 2. 集成到搜索页面

```tsx
import React, { useState } from 'react';
import { Row, Col, Card } from 'antd';
import CategoryFilter from '@/components/CategoryFilter';
import ComponentTable from '@/components/ComponentTable';

const ComponentSearchPage = () => {
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    familyPath: [],
    page: 1,
    limit: 20
  });
  
  const [components, setComponents] = useState([]);

  const handleCategoryChange = (categoryPath: string[]) => {
    setSearchParams(prev => ({
      ...prev,
      familyPath: categoryPath,
      page: 1  // 重置页码
    }));
    
    // 重新搜索
    performSearch({ ...searchParams, familyPath: categoryPath });
  };

  const performSearch = async (params: any) => {
    try {
      const response = await fetch(`/api/doeeet/search?${new URLSearchParams({
        ...params,
        familyPath: params.familyPath.join('/')
      })}`);
      
      const result = await response.json();
      if (result.success) {
        setComponents(result.data.components);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    }
  };

  return (
    <Row gutter={16}>
      <Col span={6}>
        <CategoryFilter 
          onCategoryChange={handleCategoryChange}
          selectedCategory={searchParams.familyPath}
        />
      </Col>
      <Col span={18}>
        <Card title="搜索结果">
          <ComponentTable data={components} />
        </Card>
      </Col>
    </Row>
  );
};

export default ComponentSearchPage;
```

## UI交互说明

### 1. 级联选择器（快速筛选）

```
┌──────────────────────────────────────┐
│ 快速选择: [选择分类路径 ▼]            │
└──────────────────────────────────────┘
```

**特点**：
- 支持逐级选择（顶层 → 二级 → 三级 → ...）
- 支持搜索功能（输入关键词快速定位）
- 每级选择后可以立即应用筛选
- 显示完整路径：`Microcircuits > Digital > Memory > RAM > SRAM`

**用户操作**：
1. 点击选择器
2. 选择顶层分类（如 `Microcircuits`）
3. 选择二级分类（如 `Digital`）
4. 继续选择更细的分类
5. 点击任意级别都会触发 `onCategoryChange` 回调

### 2. Tab + 侧边栏（完整浏览）

```
┌────────────────────────────────────────────────────┐
│ Microcircuits │ Capacitors │ Connectors │ ...     │
├────────────┬───────────────────────────────────────┤
│ Digital    │  • Memory                             │
│ RF-Micro   │    - RAM: SRAM, DRAM, MRAM, NVRAM    │
│ Power Mgt  │    - ROM: Flash, EEPROM, OTP         │
│            │  • Logic                              │
│            │    - Gates, Flip-Flop, Latch         │
└────────────┴───────────────────────────────────────┘
```

**特点**：
- Tab显示15个顶层分类
- 左侧列表显示二级分类
- 右侧显示三级及更细分类（Tag形式）
- 点击Tag直接应用筛选

**用户操作**：
1. 点击Tab切换顶层分类
2. 查看该顶层分类下的子分类结构
3. 点击任意Tag应用筛选

## 后端API

### GET /api/doeeet/categories/tree

**请求**：
```http
GET /api/doeeet/categories/tree
```

**响应**：
```json
{
  "success": true,
  "data": {
    "tree": [
      {
        "label": "Microcircuits",
        "value": "Microcircuits",
        "children": [
          {
            "label": "Digital",
            "value": "Digital",
            "children": [
              {
                "label": "Memory",
                "value": "Memory",
                "children": [...]
              }
            ]
          }
        ]
      }
    ],
    "subCategories": {
      "Microcircuits": {
        "Digital": ["Memory", "Logic", "Processor", ...],
        "RF-Microwave Microcircuits": ["Control", "Frequency Conversion", ...]
      },
      "Capacitors": {
        "Ceramic": [],
        "Tantalum Solid": []
      }
    }
  }
}
```

**数据结构说明**：

1. **tree** - 完整的层级树（用于级联选择器）
   - `label`: 显示文本
   - `value`: 实际值
   - `children`: 子分类数组

2. **subCategories** - 按顶层分类组织的映射（用于Tab+侧边栏）
   - 键：顶层分类名称
   - 值：二级分类映射
     - 键：二级分类名称
     - 值：三级分类数组

## 性能优化

### 1. 后端缓存
- 分类树数据缓存在Redis中，TTL = 3600秒（1小时）
- 首次加载后，后续请求直接从缓存返回

### 2. 前端优化
- 组件内部使用 `useEffect` 只在挂载时加载一次数据
- 支持降级：如果API失败，使用静态的15个顶层分类

## 样式定制

组件使用 Ant Design 组件库，可以通过以下方式定制样式：

```tsx
<CategoryFilter 
  onCategoryChange={handleCategoryChange}
  selectedCategory={selectedCategory}
  style={{ marginBottom: '24px' }}
  className="custom-category-filter"
/>
```

然后在CSS中：
```css
.custom-category-filter .ant-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.custom-category-filter .ant-tabs-tab {
  font-size: 13px;
}
```

## 常见问题

### Q1: 分类树加载失败怎么办？
**A**: 组件有降级机制，会显示15个顶层分类的静态列表。检查：
1. 后端服务是否正常运行
2. `/api/doeeet/categories/tree` API是否可访问
3. `meta.json` 文件路径是否正确

### Q2: 如何监听用户的选择？
**A**: 使用 `onCategoryChange` 回调函数：
```tsx
const handleCategoryChange = (categoryPath: string[]) => {
  console.log('用户选择:', categoryPath);
  // categoryPath 示例: ["Microcircuits", "Digital", "Memory", "RAM", "SRAM"]
};
```

### Q3: 如何清空选择？
**A**: 传入空数组作为 `selectedCategory`：
```tsx
setSelectedCategory([]);
```

### Q4: 支持多选吗？
**A**: 当前版本不支持多选，只支持单个分类路径选择。如需多选，可以使用 `TreeSelect` 组件的 `multiple` 模式。

## 开发调试

### 启动后端服务
```bash
cd backend
npm run dev
```

### 测试API
```bash
curl http://localhost:3001/api/doeeet/categories/tree
```

### 前端开发
```bash
cd frontend
npm start
```

## 下一步改进

1. **搜索功能增强**
   - 在Tab视图中添加搜索框
   - 支持模糊搜索分类名称

2. **统计信息**
   - 显示每个分类下的组件数量
   - 实时更新可用分类

3. **用户体验**
   - 记住用户最近选择的分类
   - 添加"热门分类"快捷入口
   - 支持键盘导航

4. **国际化**
   - 支持中英文切换
   - 分类名称翻译

---

**最后更新**: 2025-10-31  
**版本**: v1.0  
**维护者**: 开发团队

