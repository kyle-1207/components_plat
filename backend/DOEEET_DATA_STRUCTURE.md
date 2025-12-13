# DoEEEt 数据结构说明

本文档说明DoEEEt数据在MongoDB中的结构和使用方式。

## 📊 数据库集合概览

MongoDB数据库 `business_plat` 包含4个主要集合：

1. **components** - 组件基本信息（来自 general.csv）
2. **parameters** - 组件详细参数（来自 parameter.csv）
3. **parameter_definitions** - 参数定义表（来自 parameter_final.csv）
4. **families** - 分类信息（来自 meta.json）

---

## 1️⃣ Components 集合

### 数据来源
原始CSV: `general.csv`

### 字段说明

| MongoDB字段名 | CSV字段名 | 说明 | 类型 |
|--------------|----------|------|------|
| `component_id` | `id` | 产品ID，全局唯一 | String |
| `family_path` | `comp-familypath` | 产品分类路径（字符串） | String |
| `part_number` | `comp-partnumber` | 产品型号 | String |
| `part_type` | `comp-parttype` | 产品类型 | String |
| `manufacturer_name` | `comp-manufacturer-name` | 制造商名称 | String |
| `obsolescence_type` | `comp-obsolescence-type-value` | 生命周期状态 | String |
| `has_stock` | `has-stock` | 库存状态 ("Yes"/"No") | String |
| `cad` | `CAD` | CAD信息（页面拼接，无真实数据） | String |
| `quality_name` | `comp-quality-name` | 质量等级 | String |
| `qualified` | `comp-qualified` | 是否合格 ("Y"/"N") | String |
| `qpl_name` | `comp-qpl-name` | QPL认证名称 | String |
| `datasheet_url` | - | 数据手册URL | String |
| `description` | - | 产品描述 | String |

### 注意事项
- ⚠️ **很多字段可能为空字符串** `""`
- 🔑 **唯一标识**: `component_id`
- 📁 **分类字段**: `family_path` 是字符串（与families集合中的数组不同）

---

## 2️⃣ Parameters 集合

### 数据来源
原始CSV: `parameter.csv`

### 字段说明

| MongoDB字段名 | CSV字段名 | 说明 | 类型 | 必需 |
|--------------|----------|------|------|------|
| `component_id` | `id` | 组件ID（关联components） | String | ✅ |
| `parameter_key` | `key` | 参数键（关联parameter_definitions） | String | ✅ |
| `value` | `value` | 参数值 | String | ✅ |

### 核心CSV字段（仅3个）
根据数据说明文档，`parameter.csv` **只包含3个字段**：
- `id` → component_id
- `key` → parameter_key  
- `value` → value

### MongoDB额外字段
以下字段是导入MongoDB后额外添加的，保留以兼容现有数据：
- `parameter_value`
- `parameter_type`
- `parameter_unit`

### 固定参数 🔒

所有类别都包含以下**固定参数**：

| 参数名 | parameter_key |
|--------|--------------|
| **Operating Temperature (TOP)** | `2f2e7f5a-7cd0-47da-8feb-a29336285a3e` |
| **Package** | `5df8d422-39bd-431f-9095-582a3f6f8fc1` |

### 查询示例
```javascript
// 获取组件的所有参数
const parameters = await DoeeetParameter.find({
  component_id: '86b64601-743d-4667-8af1-caed35717636'
});

// 查询Operating Temperature参数
const { FIXED_PARAM_KEYS } = require('./models/DoeeetParameter');
const temps = await DoeeetParameter.find({
  parameter_key: FIXED_PARAM_KEYS.OPERATING_TEMPERATURE
});
```

---

## 3️⃣ Parameter Definitions 集合

### 数据来源
原始CSV: `parameter_final.csv`

### 字段说明

| MongoDB字段名 | CSV字段名 | 说明 | 使用 |
|--------------|----------|------|------|
| `parameter_key` | `key` | 参数键（唯一） | ✅ 主键 |
| `category` | `category` | 参数分类 | ✅ 使用 |
| `name` | `name` | 参数名称 | ✅ 使用 |
| `short_name` | `shortName` | 参数简称 | ✅ 使用 |
| `example` | `example` | 参数示例 | ❌ **不使用** |

### 注意事项
- ⚠️ **`example` 字段存在但不在业务逻辑中使用**
- 在Mongoose模型中设置了 `select: false` 默认不返回
- 用于将 `parameters` 表中的 `parameter_key` 翻译成可读的参数名

### 查询示例
```javascript
// 根据key获取参数定义
const definition = await DoeeetParameterDefinition.findOne({
  parameter_key: '2f2e7f5a-7cd0-47da-8feb-a29336285a3e'
});
// 返回: { name: "Operating Temperature Range", shortName: "TOP", ... }

// 获取所有参数类别
const categories = await DoeeetParameterDefinition.getAllCategories();
```

---

## 4️⃣ Families 集合

### 数据来源
原始JSON: `meta.json`

### 字段说明

| 字段名 | 说明 | 类型 |
|--------|------|------|
| `family_id` | 分类ID（唯一） | String |
| `family_path` | 分类路径 **（数组）** | Array[String] |
| `meta` | 该分类的动态参数配置 | Array[Object] |

### family_path 示例
```javascript
family_path: ["Connectors", "Circular", "Circular Accessories"]
```

### meta 字段结构
```javascript
meta: [
  {
    key: "3197675d-0949-4d98-a6f4-c069a66f9f6e",
    name: "Storage Temperature Range",
    shortName: "T<sub>STG</sub>"
  },
  // ... 更多参数
]
```

### 注意事项
- ⚠️ **`family_path` 在 families 集合中是数组，在 components 集合中是字符串**
- 🔑 如果某个类别在 meta.json 中不存在，说明该类别**只有固定参数**（general列 + package + TOP）
- 📋 `meta` 中的参数对应 `parameter_definitions` 表中的行

### 查询示例
```javascript
// 获取顶级分类
const topCategories = await DoeeetFamily.getTopCategories();

// 根据路径查找分类
const family = await DoeeetFamily.findByPath(['Connectors', 'Circular']);
```

---

## 🔗 数据关联关系

```
components (component_id)
    ↓
parameters (component_id + parameter_key)
    ↓
parameter_definitions (parameter_key)

components (family_path)
    ↓
families (family_path)
```

### 完整查询示例

```javascript
// 1. 查询组件
const component = await DoeeetComponent.findOne({
  part_number: '300803404B103MC'
});

// 2. 获取该组件的所有参数
const parameters = await DoeeetParameter.getByComponentId(component.component_id);

// 3. 为每个参数查找定义（翻译参数名）
for (const param of parameters) {
  const definition = await DoeeetParameterDefinition.findOne({
    parameter_key: param.parameter_key
  });
  
  console.log(`${definition.name}: ${param.cleanValue}`);
  // 例如: "Operating Temperature Range: -55ºC to +125ºC"
}

// 4. 查询组件所属的分类
const familyPathArray = component.family_path.split('>').map(s => s.trim());
const family = await DoeeetFamily.findByPath(familyPathArray);

console.log(`分类: ${family.pathString}`);
console.log(`动态参数配置: ${family.meta.length} 个`);
```

---

## 📝 数据特点总结

1. ✅ **字段命名**: 使用下划线命名（snake_case）
2. ⚠️ **空值处理**: 很多字段是空字符串 `""`，需要验证
3. 🔑 **固定参数**: TOP 和 Package 是所有类别共有的
4. 📁 **分类路径**: components中是字符串，families中是数组
5. 🔗 **关联查询**: 需要通过 component_id 和 parameter_key 进行多表关联
6. ❌ **不使用字段**: parameter_definitions 的 example 字段不使用

---

## 🛠️ Mongoose 模型

已创建的模型文件：
- `models/DoeeetComponent.js` - 组件模型
- `models/DoeeetParameter.js` - 参数模型（含固定参数常量）
- `models/DoeeetFamily.js` - 分类模型
- `models/DoeeetParameterDefinition.js` - 参数定义模型

---

## 🧪 测试脚本

运行完整测试：
```bash
node backend/test-doeeet-api.js
```

测试内容：
- ✅ 组件CRUD和搜索
- ✅ 参数查询和固定参数验证
- ✅ 分类树和顶级分类
- ✅ 参数定义翻译
- ✅ 多表关联查询

---

## 📚 参考文档

- 原始数据说明: `data/doeeet/doeeet/数据说明(2).md`
- 项目计划: `DoEEEt项目开发计划.md`

