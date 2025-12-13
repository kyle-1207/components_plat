# DoEEET 数据导入策略指南

## 📦 数据文件概览

| 文件 | 大小 | 记录数 | 用途 | 导入状态 |
|------|------|--------|------|----------|
| `general.csv` | 450MB | 261万 | 产品基本信息 | ✅ 已导入 |
| `parameter_final.csv` | 33KB | 315 | 参数键定义 | ✅ 已导入 |
| `meta.json` | 763KB | 28,812 | 产品族配置 | ✅ 已导入 |
| `parameter.csv` | **18GB** | ~千万级 | 详细参数 | ⚠️ 条件导入 |

## 🎯 推荐导入策略

### 策略 1: 基础数据 + 样本参数 (推荐用于测试)

**适用场景**：快速验证系统功能，前端开发测试

```javascript
{
  dbName: 'doeet_test',
  sampleSize: 10000,              // 导入1万个产品
  skipParameterImport: false,     // ✅ 导入参数
  forceCleanStart: true
}
```

**导入内容**：
- ✅ 1万个产品的基本信息 (general.csv)
- ✅ 这1万个产品的详细参数 (parameter.csv)
- ✅ 全部参数定义 (parameter_final.csv)
- ✅ 全部产品族配置 (meta.json)

**优点**：
- 数据完整，包含详细参数
- 导入速度快（约5-10分钟）
- 可以充分测试参数搜索、筛选功能

**缺点**：
- 只有部分产品数据

---

### 策略 2: 仅基础数据 (当前测试方案)

**适用场景**：快速验证基本功能

```javascript
{
  dbName: 'doeet_test',
  sampleSize: 200,
  skipParameterImport: true,      // ❌ 跳过参数
  forceCleanStart: true
}
```

**导入内容**：
- ✅ 200个产品的基本信息
- ✅ 参数定义和产品族配置
- ❌ 没有详细参数数据

**优点**：
- 极快（1分钟内）
- 验证制造商等基本字段

**缺点**：
- 无法测试参数搜索功能
- 产品详情页缺少详细参数

---

### 策略 3: 全量产品 + 样本参数

**适用场景**：接近生产环境的测试

```javascript
{
  dbName: 'doeet',
  skipParameterImport: false,
  parameterSampleSize: 100000,    // 只导入前10万个产品的参数
  forceCleanStart: true
}
```

**导入内容**：
- ✅ 全部261万产品基本信息
- ✅ 前10万个产品的详细参数
- ✅ 全部配置数据

**预计时间**：2-4小时

---

### 策略 4: 完整导入 (生产环境)

**适用场景**：正式上线

```javascript
{
  dbName: 'doeet',
  skipParameterImport: false,
  forceCleanStart: true,
  batchSize: 100,
  enableProgressLog: true
}
```

**导入内容**：
- ✅ 全部261万产品
- ✅ 全部详细参数（18GB）
- ✅ 全部配置

**预计时间**：8-24小时（取决于硬件）

---

## 🚀 推荐实施步骤

### 第一步：测试基础功能（已完成 ✅）
```bash
node test_import_sample.js  # 200条，跳过参数
```

### 第二步：测试完整数据结构
```bash
# 修改 test_import_sample.js:
sampleSize: 1000,
skipParameterImport: false  # 包含参数
```

### 第三步：中等规模测试
```bash
# 1万条数据 + 参数
sampleSize: 10000,
skipParameterImport: false
```

### 第四步：全量导入
```bash
node import_full_doeet.js  # 全部数据
```

## 📊 数据库结构

导入后的MongoDB集合：

```
doeet (或 doeet_test)
├── components              # 产品基本信息 (来自 general.csv)
│   ├── id, partNumber, manufacturer
│   ├── category, description, status
│   └── parameters []       # 嵌入的参数数组 (来自 parameter.csv)
│
├── parameter_definitions   # 参数定义 (来自 parameter_final.csv)
│   └── key, name, shortName, example
│
└── category_meta          # 产品族配置 (来自 meta.json)
    └── familyPath, meta []
```

## 💡 特别说明

### parameter.csv 的处理方式

由于 parameter.csv 有18GB，导入策略有两种：

#### 方案A：嵌入到产品文档中（当前方案）
```json
{
  "_id": "product-123",
  "partNumber": "ABC-123",
  "manufacturer": "TI",
  "parameters": [
    { "key": "voltage", "value": "5V" },
    { "key": "temperature", "value": "-55°C to +125°C" }
  ]
}
```

**优点**：查询快，一次获取所有信息
**缺点**：文档较大，导入时间长

#### 方案B：独立参数集合（可选方案）
```json
// components 集合
{ "_id": "product-123", "partNumber": "ABC-123" }

// parameters 集合（独立）
{ "productId": "product-123", "key": "voltage", "value": "5V" }
{ "productId": "product-123", "key": "temperature", "value": "-55°C to +125°C" }
```

**优点**：导入灵活，可以分批导入
**缺点**：需要关联查询

---

## ❓ 常见问题

**Q: 为什么测试时要跳过参数导入？**
A: parameter.csv 有18GB，导入很慢。测试基础功能时可以先跳过，验证制造商等字段后再导入参数。

**Q: 参数数据有多重要？**
A: 非常重要！产品详情页的大部分信息来自参数数据，如：
- 工作温度范围
- 电压/电流规格
- 封装类型
- 认证信息等

**Q: 可以只导入部分产品的参数吗？**
A: 可以！使用 `sampleSize` 参数，只导入前N个产品及其参数。

**Q: 18GB的数据导入要多久？**
A: 取决于硬件，一般需要8-24小时。建议分批导入或在服务器上运行。

