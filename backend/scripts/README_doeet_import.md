# DoEEET 数据导入脚本说明

## 概述

这个脚本用于将 DoEEET 数据从4个源文件导入到 MongoDB 数据库中。

## 数据文件结构

### 1. general.csv - 组件基本信息
**列名**: `id,comp-familypath,comp-partnumber,comp-parttype,comp-manufacturer-name,comp-obsolescence-type-value,has-stock,CAD,comp-quality-name,comp-qualified,comp-qpl-name`

**用途**: 存储每个组件的基本信息，一行一个组件。

### 2. parameter.csv - 组件参数值
**列名**: `id,key,value`

**用途**: 存储组件的参数值，一行一个参数。`id` 对应组件ID，`key` 是参数键，`value` 是参数值。

### 3. parameter_final.csv - 参数定义
**列名**: `key,category,example,name,shortName`

**用途**: 定义参数键的含义，用于解释 `parameter.csv` 中的 `key` 字段。

### 4. meta.json - 产品族元数据
**结构**: 
```json
[
  {
    "family_path": ["Connectors", "Circular", "Circular Accessories"],
    "family_id": "248450d4-2244-4f8d-aab2-b9c62b75b528",
    "meta": [
      {
        "key": "3197675d-0949-4d98-a6f4-c069a66f9f6e",
        "name": "Storage Temperature Range",
        "shortName": "T<sub>STG</sub>"
      }
    ]
  }
]
```

**用途**: 定义产品族的层次结构和动态参数配置。

## MongoDB 集合结构

### 1. components - 组件集合
- 存储 `general.csv` 的数据
- 主键: `component_id`
- `family_path` 字段会被解析为数组格式

### 2. parameters - 参数集合
- 存储 `parameter.csv` 的数据
- 复合主键: `component_id` + `parameter_key`

### 3. parameter_definitions - 参数定义集合
- 存储 `parameter_final.csv` 的数据
- 主键: `parameter_key`

### 4. families - 产品族集合
- 存储 `meta.json` 的数据
- 主键: `family_id`

## 使用方法

### 运行导入脚本
```bash
cd backend/scripts
node stream_import_doeet.js
```

### 查询示例

脚本提供了一个示例查询函数 `getComponentWithParameters(componentId)`，展示如何关联查询：

```javascript
const { getComponentWithParameters } = require('./stream_import_doeet');

// 获取组件完整信息（包括参数和产品族信息）
const componentInfo = await getComponentWithParameters('03fce191-210d-4cfb-a75f-e85fb00770a1');
```

返回的数据结构：
```javascript
{
  component_id: "03fce191-210d-4cfb-a75f-e85fb00770a1",
  family_path: ["D-Shaped Connectors", "D-Shaped", "Connectors"],
  part_number: "SDD26S4R6NT2G",
  // ... 其他组件信息
  parameters: [
    {
      component_id: "03fce191-210d-4cfb-a75f-e85fb00770a1",
      parameter_key: "some-key",
      parameter_value: "some-value",
      definition: {
        parameter_key: "some-key",
        category: "Physical",
        name: "Parameter Name",
        short_name: "PN"
      }
    }
  ],
  family_info: {
    family_id: "248450d4-2244-4f8d-aab2-b9c62b75b528",
    family_path: ["D-Shaped Connectors", "D-Shaped", "Connectors"],
    meta: [...]
  }
}
```

## 数据关系

1. **组件 ↔ 参数**: 通过 `component_id` 关联
2. **参数 ↔ 参数定义**: 通过 `parameter_key` 关联  
3. **组件 ↔ 产品族**: 通过 `family_path` 数组匹配关联

## 性能优化

- 使用流式处理处理大文件
- 批量插入数据（批次大小：1000）
- 创建了适当的数据库索引
- 支持 upsert 操作避免重复数据

## 注意事项

1. 脚本会清理现有数据后重新导入
2. `family_path` 字段会从字符串格式自动解析为数组
3. 空值字段会被自动移除
4. 支持错误恢复和重复键处理
