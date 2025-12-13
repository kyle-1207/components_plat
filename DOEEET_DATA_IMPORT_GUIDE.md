# DoEEET数据导入指南

## 数据结构说明

DoEEET数据包含4个核心文件，总大小超过400MB：

### 1. **general.csv** (~200MB+)
通用产品信息表，每行代表一个产品：
- `id`: 产品唯一标识符
- `comp-familypath`: 产品分类路径（JSON数组格式）
- `comp-partnumber`: 零件号
- `comp-parttype`: 零件类型
- `comp-manufacturer-name`: 制造商名称
- `comp-obsolescence-type-value`: 生命周期状态
- `has-stock`: 库存状态
- `CAD`: CAD信息（DoEEET页面拼接，无实际数据）
- `comp-quality-name`: 质量等级
- `comp-qualified`: 是否合格（Y/N）
- `comp-qpl-name`: QPL名称

### 2. **parameter.csv** (~200MB+)
详细参数表，每行代表一个产品的一个参数：
- `id`: 产品ID（关联general.csv）
- `key`: 参数键（UUID格式，关联parameter_final.csv）
- `value`: 参数值

### 3. **parameter_final.csv**
参数键定义表：
- `key`: 参数键（UUID）
- `category`: 参数类别
- `example`: 参数示例值
- `name`: 参数名称
- `shortName`: 参数简称

### 4. **meta.json**
动态参数配置，按产品族组织：
- `family_path`: 产品分类路径
- `family_id`: 产品族ID
- `meta`: 该族的动态参数配置

## 导入脚本使用

### 1. 数据分析（推荐先运行）

```bash
# 在backend目录下运行
cd backend
node scripts/testDoEEETImport.js
```

测试脚本功能：
- ✅ 验证所有必需文件存在
- 📊 分析数据统计信息（261万产品，18GB参数）
- 📋 显示数据样本
- 🔍 测试数据读取性能

### 2. 优化导入（推荐使用）

```bash
# 使用优化的导入脚本
cd backend
node scripts/runDoEEETImport.js

# 或指定导入策略
node scripts/runDoEEETImport.js test      # 测试导入（1000条）
node scripts/runDoEEETImport.js sample    # 样本导入（1万条）
node scripts/runDoEEETImport.js products_only  # 仅产品信息
node scripts/runDoEEETImport.js chunked   # 分块导入（推荐）

# 查看帮助
node scripts/runDoEEETImport.js --help
```

### 3. 导入策略说明

| 策略 | 适用场景 | 数据量 | 内存需求 | 时间 |
|------|----------|--------|----------|------|
| **test** | 快速测试 | 1000条产品 | 512MB | 1分钟 |
| **sample** | 功能验证 | 1万条产品+参数 | 1GB | 5分钟 |
| **products_only** | 快速导入 | 261万产品（无参数） | 2GB | 30分钟 |
| **chunked** | 生产环境 | 全部数据分块处理 | 2GB | 2-4小时 |
| **full** | 一次性导入 | 全部数据 | 8GB+ | 1-2小时 |

## 数据映射策略

### Component模型映射

| DoEEET字段 | Component字段 | 说明 |
|-----------|---------------|------|
| id | id | 直接映射 |
| comp-partnumber | partNumber | 零件号 |
| comp-parttype | partType | 零件类型 |
| comp-manufacturer-name | manufacturer | 制造商 |
| comp-familypath | category | 转换为字符串路径 |
| comp-obsolescence-type-value | status | 生命周期状态 |
| has-stock | hasStock | 转换为布尔值 |
| comp-quality-name | qualityLevel | 质量等级 |
| comp-qualified | isQualified | 转换为布尔值 |
| comp-qpl-name | qplName | QPL名称 |

### 参数处理策略

1. **固定参数**：所有产品都有的参数
   - `package`: 封装类型 (key: 5df8d422-39bd-431f-9095-582a3f6f8fc1)
   - `operating temperature`: 工作温度 (key: 2f2e7f5a-7cd0-47da-8feb-a29336285a3e)

2. **动态参数**：根据产品族配置的参数
   - 通过meta.json配置确定每个族的参数
   - 按category分组组织

3. **参数格式化**：
   ```json
   {
     "specifications": {
       "Generic Functional & Electrical": {
         "Operating Temperature Range": {
           "value": "-55ºC to +125ºC",
           "shortName": "T<sub>OP</sub>",
           "example": "-55ºC to +125ºC"
         }
       }
     }
   }
   ```

## 性能优化

### 1. 分批处理
- 默认批次大小：1000条记录
- 避免内存溢出
- 支持断点续传

### 2. 索引优化
建议在以下字段上创建索引：
- `id` (主键)
- `partNumber`
- `manufacturer`
- `category`
- `status`

### 3. 内存管理
- 使用流式处理读取大文件
- 及时释放不需要的数据
- 监控内存使用情况

## 数据验证

### 1. 完整性检查
- ✅ 验证所有必需文件存在
- ✅ 检查参数键一致性
- ✅ 验证产品ID唯一性

### 2. 数据质量检查
- 检查必填字段是否为空
- 验证数据格式是否正确
- 检查参考完整性

### 3. 业务规则验证
- 验证制造商名称格式
- 检查产品分类路径有效性
- 验证质量等级枚举值

## 错误处理

### 1. 常见错误及解决方案

| 错误类型 | 原因 | 解决方案 |
|---------|------|---------|
| 文件不存在 | 数据文件路径错误 | 检查data/doeeet/doeeet/目录 |
| 内存溢出 | 批次大小过大 | 减少batchSize参数 |
| 参数键未找到 | parameter_final.csv不完整 | 重新下载参数定义文件 |
| JSON解析错误 | familypath格式错误 | 检查单引号转双引号 |

### 2. 日志记录
- 使用winston记录详细日志
- 分级记录：info、warn、error
- 保存到logs/目录

## 使用示例

### Windows环境（miniconda）

```bash
# 1. 安装依赖
cd backend
npm install csv-parser

# 2. 运行测试
node scripts/testDoEEETImport.js

# 3. 查看结果
# 测试脚本会显示：
# - 文件大小信息
# - 数据样本
# - 统计分析
# - 参数分布
```

### 预期输出示例

```
🚀 开始测试DoEEET数据导入...
📁 general.csv: 215.67 MB
📁 parameter.csv: 298.45 MB
📁 parameter_final.csv: 0.02 MB
📁 meta.json: 1.23 MB
✅ 加载了 315 个参数键定义
✅ 加载了 1247 个产品族配置
📊 通用数据测试: 读取了 1000 行数据

📋 数据样本:
样本 1:
  ID: 1fabbb57-4389-4358-8a94-2918d01c01b4
  零件号: 5962-8864203YA
  制造商: Pyramid Semiconductor
  分类: ['Peripheral-Controller', 'Digital', 'Microcircuits']
  状态: Active
  质量等级: 883
```

## 下一步计划

1. ✅ 创建导入脚本
2. 🔄 测试数据导入
3. ⏳ 集成到现有API
4. ⏳ 更新前端搜索界面
5. ⏳ 性能优化和监控

## 注意事项

1. **数据大小**：DoEEET数据文件很大，确保有足够的磁盘空间和内存
2. **处理时间**：完整导入可能需要较长时间，建议先运行测试脚本
3. **编码格式**：确保文件编码为UTF-8
4. **路径问题**：Windows环境下注意路径分隔符
5. **备份数据**：导入前备份现有数据
