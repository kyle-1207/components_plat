# 超高性能导入器使用指南 V2.0

## 🚀 快速开始

### 基本用法

```bash
cd backend/scripts

# 完整导入（默认配置）
python ultra_high_performance_importer.py

# 查看帮助
python ultra_high_performance_importer.py --help
```

---

## 📋 目录

1. [核心特性](#核心特性)
2. [硬件要求](#硬件要求)
3. [安装依赖](#安装依赖)
4. [使用示例](#使用示例)
5. [命令行参数](#命令行参数)
6. [性能调优](#性能调优)
7. [断点续传](#断点续传)
8. [故障排除](#故障排除)
9. [性能预估](#性能预估)

---

## ✨ 核心特性

### V2.0 新增功能

- ✅ **命令行参数支持** - 灵活配置，无需修改代码
- ✅ **分阶段导入** - 组件和参数可独立导入
- ✅ **断点续传** - 支持中断后继续导入
- ✅ **智能内存管理** - 自适应批量大小，防止OOM
- ✅ **实时进度保存** - JSON格式，随时查看
- ✅ **详细性能报告** - 峰值速度、内存使用等

### 核心优化

1. **多线程并行处理**
   - 默认6个读取线程
   - 默认6个写入线程
   - 可根据硬件自定义

2. **大批量操作**
   - 20万行/次 CSV读取
   - 10万条/批次 MongoDB写入
   - 减少IO开销

3. **MongoDB优化**
   - bulkWrite + upsert
   - 不等待写确认 (w=0)
   - 后台索引创建

4. **性能监控**
   - 实时速度监控
   - ETA预测
   - 内存/CPU使用率

---

## 💻 硬件要求

### 最低配置
- **CPU**: 4核
- **内存**: 8GB
- **存储**: 100GB 可用空间
- **MongoDB**: 4.4+

### 推荐配置（你的硬件）
- **CPU**: Ryzen 9 8945HX (16线程)
- **内存**: 32GB DDR5
- **存储**: NVMe SSD
- **MongoDB**: 5.0+

### 性能预估

| 硬件 | 组件导入 | 参数导入 | 总耗时 |
|------|---------|---------|--------|
| 最低配置 | 30分钟 | 20-30小时 | ~30小时 |
| 推荐配置 | 10-15分钟 | 3-8小时 | ~8小时 |
| 优化配置 | 5-8分钟 | 2-5小时 | ~5小时 |

---

## 📦 安装依赖

### 1. Python环境

```bash
# 确保Python 3.8+
python --version

# 安装依赖
pip install pymongo psutil
```

### 2. MongoDB设置

```bash
# 启动MongoDB
mongod --dbpath /path/to/data

# 或使用Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. 数据准备

确保数据文件在正确位置：
```
data/doeeet/doeeet/
  ├── general.csv          # 组件数据 (261万条) → components 集合
  ├── parameter.csv        # 参数数据 (1.92亿条) → parameters 集合
  ├── parameter_final.csv  # 参数定义 → parameter_definitions 集合
  └── meta.json            # 元数据
```

**CSV文件与MongoDB集合对应关系：**

| CSV文件 | 字段示例 | MongoDB集合 | 用途 |
|---------|---------|------------|------|
| `general.csv` | id, comp-familypath, comp-partnumber, comp-manufacturer-name, etc. | `components` | 电子元件基本信息 |
| `parameter_final.csv` | key, category, example, name, shortName | `parameter_definitions` | 参数定义和元数据 |
| `parameter.csv` | id, key, value | `parameters` | 元件的具体参数值 |

---

## 🎯 使用示例

### 1. 完整导入（默认配置）

```bash
python ultra_high_performance_importer.py
```

### 2. 只导入组件

```bash
# 适用于：先快速导入组件，验证数据正确性
python ultra_high_performance_importer.py --components-only
```

**预计时间**: 10-15分钟  
**数据量**: 261万条  
**数据文件**: general.csv → components 集合

### 3. 只导入参数定义

```bash
# 适用于：导入参数的元数据定义
python ultra_high_performance_importer.py --definitions-only
```

**预计时间**: < 1分钟  
**数据量**: 数千条  
**数据文件**: parameter_final.csv → parameter_definitions 集合

### 4. 只导入参数

```bash
# 适用于：组件和参数定义已导入完成，只需导入参数值
python ultra_high_performance_importer.py --parameters-only
```

**预计时间**: 3-8小时  
**数据量**: 1.92亿条  
**数据文件**: parameter.csv → parameters 集合

### 5. 分步导入（推荐方式）

```bash
# 步骤1: 导入组件 (general.csv)
python ultra_high_performance_importer.py --components-only

# 步骤2: 导入参数定义 (parameter_final.csv)
python ultra_high_performance_importer.py --definitions-only

# 步骤3: 导入参数值 (parameter.csv)
python ultra_high_performance_importer.py --parameters-only
```

**优点**:
- 可以分别验证每个阶段的数据
- 出现问题时容易定位
- 可以灵活安排导入时间

### 6. 自定义配置（高性能）

```bash
python ultra_high_performance_importer.py \
  --memory 24 \
  --readers 6 \
  --writers 6 \
  --chunk-size 200000 \
  --batch-size 100000
```

### 7. 测试模式（小批量）

```bash
# 适用于：首次测试，验证流程
python ultra_high_performance_importer.py --test
```

**特点**:
- 批量大小减半
- 线程数减少
- 适合验证配置

### 8. 禁用断点续传（重新导入）

```bash
# 警告：会覆盖现有数据
python ultra_high_performance_importer.py --no-resume
```

---

## 📊 CSV文件结构详解

### general.csv (组件数据)

**字段结构**:
```csv
id, comp-familypath, comp-partnumber, comp-parttype, comp-manufacturer-name, 
comp-obsolescence-type-value, has-stock, CAD, comp-quality-name, 
comp-qualified, comp-qpl-name
```

**导入到**: `components` 集合

### parameter_final.csv (参数定义)

**字段结构**:
```csv
key, category, example, name, shortName
```

**导入到**: `parameter_definitions` 集合  
**说明**: 定义了所有可能的参数类型和含义

### parameter.csv (参数值)

**字段结构**:
```csv
id, key, value
```

**导入到**: `parameters` 集合  
**说明**: 每个组件的具体参数值，通过 id 关联到 components，通过 key 关联到 parameter_definitions

---

## 🛠️ 命令行参数

### 导入模式

| 参数 | 说明 | 数据文件 | 默认值 |
|------|------|---------|--------|
| `--components-only` | 仅导入组件数据 | general.csv | False |
| `--definitions-only` | 仅导入参数定义数据 | parameter_final.csv | False |
| `--parameters-only` | 仅导入参数数据 | parameter.csv | False |
| `--resume` | 启用断点续传 | - | True |
| `--no-resume` | 禁用断点续传，重新开始 | - | False |

### 性能参数

| 参数 | 说明 | 默认值 | 推荐范围 |
|------|------|--------|---------|
| `--memory` | 最大内存使用(GB) | 24 | 8-32 |
| `--readers` | CSV读取线程数 | 6 | 2-8 |
| `--writers` | 数据库写入线程数 | 6 | 2-12 |
| `--chunk-size` | CSV块大小 | 200000 | 50K-500K |
| `--batch-size` | 数据库批量大小 | 100000 | 10K-200K |

### 数据库配置

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--mongo-uri` | MongoDB连接URI | mongodb://localhost:27017/ |
| `--database` | 数据库名称 | business_plat |
| `--data-dir` | 数据目录路径 | data/doeeet/doeeet |

### 其他

| 参数 | 说明 |
|------|------|
| `--test` | 测试模式（小批量） |
| `--help` | 显示帮助信息 |

---

## ⚡ 性能调优

### 根据硬件调整配置

#### 32GB内存 + 16线程CPU（你的配置）

```bash
python ultra_high_performance_importer.py \
  --memory 24 \
  --readers 6 \
  --writers 6 \
  --chunk-size 200000 \
  --batch-size 100000
```

**预期性能**:
- 速度: 5,000-15,000 条/秒
- 内存: 8-16GB
- CPU: 60-80%

#### 16GB内存 + 8线程CPU

```bash
python ultra_high_performance_importer.py \
  --memory 12 \
  --readers 3 \
  --writers 3 \
  --chunk-size 100000 \
  --batch-size 50000
```

#### 64GB内存 + 32线程CPU

```bash
python ultra_high_performance_importer.py \
  --memory 48 \
  --readers 8 \
  --writers 12 \
  --chunk-size 500000 \
  --batch-size 200000
```

**预期性能**:
- 速度: 20,000-50,000 条/秒
- 参数导入: 1-2小时

### 优化建议

#### 1. 内存优化

```bash
# 如果遇到内存不足
--memory 8 --chunk-size 50000 --batch-size 25000

# 如果内存充足，想提速
--memory 32 --chunk-size 500000 --batch-size 200000
```

#### 2. CPU优化

```bash
# 根据CPU核心数调整线程
# 公式：readers + writers ≤ CPU核心数

# 4核CPU
--readers 2 --writers 2

# 8核CPU
--readers 3 --writers 3

# 16核CPU
--readers 6 --writers 6
```

#### 3. 磁盘IO优化

- 使用SSD存储数据文件
- MongoDB数据目录放在SSD上
- 避免在导入期间进行其他磁盘密集操作

#### 4. MongoDB优化

临时性能优化配置（导入期间）：

```javascript
// 连接到MongoDB
mongo

// 临时禁用日志同步（提高性能）
db.adminCommand({ setParameter: 1, syncdelay: 300 })

// 导入完成后恢复
db.adminCommand({ setParameter: 1, syncdelay: 60 })
```

---

## 🔄 断点续传

### 工作原理

脚本会自动保存进度到 `import_progress.json`：

```json
{
  "stage": "parameters",
  "components_imported": 2618068,
  "parameters_imported": 50000000,
  "last_component_id": "",
  "last_parameter_row": 50000000,
  "start_time": "2025-10-29T10:30:00",
  "last_update_time": "2025-10-29T12:45:00",
  "error_count": 12
}
```

### 阶段说明

| 阶段 | 说明 | 数据文件 | 下次启动行为 |
|------|------|---------|-------------|
| `init` | 初始化 | - | 从头开始 |
| `components` | 组件导入中 | general.csv | 跳过组件 |
| `components_complete` | 组件完成 | - | 跳过组件 |
| `parameter_definitions` | 参数定义导入中 | parameter_final.csv | 跳过参数定义 |
| `parameter_definitions_complete` | 参数定义完成 | - | 跳过参数定义 |
| `parameters` | 参数导入中 | parameter.csv | 从断点继续 |
| `parameters_complete` | 参数完成 | - | 跳过参数 |
| `complete` | 全部完成 | - | 全部跳过 |

### 使用示例

#### 场景1：中断后继续

```bash
# 第一次运行（导入到一半时中断）
python ultra_high_performance_importer.py

# 按 Ctrl+C 中断
# 进度已自动保存到 import_progress.json

# 继续导入（自动从断点开始）
python ultra_high_performance_importer.py
```

#### 场景2：强制重新导入

```bash
# 删除进度文件并重新导入
rm import_progress.json
python ultra_high_performance_importer.py

# 或使用 --no-resume 参数
python ultra_high_performance_importer.py --no-resume
```

#### 场景3：查看进度

```bash
# 查看当前进度
cat import_progress.json

# 或使用 jq 格式化输出
cat import_progress.json | jq
```

---

## 🐛 故障排除

### 常见问题

#### 1. MongoDB连接失败

**错误信息**:
```
❌ MongoDB连接测试失败: ServerSelectionTimeoutError
```

**解决方案**:
```bash
# 检查MongoDB是否运行
mongod --version

# 启动MongoDB
mongod --dbpath /path/to/data

# 或检查Docker容器
docker ps | grep mongo
```

#### 2. 内存不足

**错误信息**:
```
MemoryError: Unable to allocate array
```

**解决方案**:
```bash
# 减少内存使用
python ultra_high_performance_importer.py \
  --memory 8 \
  --chunk-size 50000 \
  --batch-size 25000 \
  --readers 2 \
  --writers 2
```

#### 3. 数据文件不存在

**错误信息**:
```
FileNotFoundError: 数据文件不存在
```

**解决方案**:
```bash
# 检查数据文件
ls -lh data/doeeet/doeeet/

# 指定数据目录
python ultra_high_performance_importer.py \
  --data-dir /path/to/your/data
```

#### 4. 写入速度慢

**可能原因**:
- 磁盘IO瓶颈
- MongoDB配置不优化
- 线程数过少

**解决方案**:
```bash
# 增加写入线程
python ultra_high_performance_importer.py --writers 8

# 增大批量大小
python ultra_high_performance_importer.py --batch-size 200000

# 检查磁盘IO
iostat -x 1
```

#### 5. 索引创建失败

**错误信息**:
```
❌ 创建索引失败: IndexOptionsConflict
```

**解决方案**:
```bash
# 删除现有索引
mongo business_plat
db.parameters.dropIndexes()
db.components.dropIndexes()

# 重新运行导入
python ultra_high_performance_importer.py
```

### 日志文件

查看详细日志：
```bash
# 实时查看日志
tail -f ultra_high_perf_import.log

# 查看错误
grep "ERROR" ultra_high_perf_import.log

# 查看性能统计
grep "性能统计" ultra_high_perf_import.log
```

---

## 📊 性能预估

### 基于你的硬件（32GB + Ryzen 9）

#### 完整导入时间线

```
00:00  🚀 开始导入
       ├─ 组件数据 (261万条)
00:10  ├─ ✅ 组件完成
       └─ 参数数据 (1.92亿条)
03:00  └─ ✅ 参数完成 (50%进度)
06:00  🎉 全部完成
```

#### 详细性能指标

| 阶段 | 数据量 | 预计速度 | 预计时间 |
|------|--------|---------|---------|
| 组件导入 | 261万 | 4,000-8,000条/秒 | 5-10分钟 |
| 参数导入 | 1.92亿 | 5,000-15,000条/秒 | 3.5-10小时 |
| **总计** | **1.95亿** | **平均8,000条/秒** | **4-11小时** |

#### 最佳情况

```bash
# 使用优化配置
python ultra_high_performance_importer.py \
  --memory 24 \
  --readers 6 \
  --writers 8 \
  --batch-size 200000

预计总耗时: 3-5小时
```

#### 保守估计

```bash
# 使用默认配置
python ultra_high_performance_importer.py

预计总耗时: 6-8小时
```

### 性能对比

| 方案 | 配置 | 预计时间 | 提升 |
|------|------|---------|------|
| 原始脚本 | 单线程，小批量 | ~30小时 | 1x |
| 高性能版本 | 4线程，中批量 | ~12小时 | 2.5x |
| **超高性能V2.0** | **6线程，大批量** | **~6小时** | **5x** |

---

## 📈 监控和报告

### 实时监控输出

```
============================================================
📊 性能统计报告
============================================================
  ✅ 进度: 50,000,000/192,029,856 (26.03%)
  ⚡ 当前速度: 12,345 条/秒
  📈 平均速度: 11,892 条/秒
  🚀 峰值速度: 15,678 条/秒
  ⏱️  预计完成: 18:32:15
  💾 内存使用: 12,345.6 MB (51.4%)
  📊 内存峰值: 13,456.7 MB
  🖥️  CPU使用: 72.5%
  ❌ 错误计数: 123
============================================================
```

### 进度文件监控

```bash
# 使用watch实时监控进度
watch -n 5 'cat import_progress.json | jq'

# 或创建监控脚本
cat > monitor.sh << 'EOF'
#!/bin/bash
while true; do
  clear
  echo "=== 导入进度监控 ==="
  cat import_progress.json | jq
  sleep 5
done
EOF
chmod +x monitor.sh
./monitor.sh
```

---

## 🎯 最佳实践

### 1. 导入前准备

```bash
# 1. 备份现有数据（如果有）
mongodump --db business_plat --out backup_$(date +%Y%m%d)

# 2. 检查磁盘空间（需要至少200GB）
df -h

# 3. 测试MongoDB连接
mongo --eval "db.adminCommand('ping')"

# 4. 小规模测试
python ultra_high_performance_importer.py --test --components-only
```

### 2. 分阶段导入（推荐）

```bash
# 第一步：导入组件（快速验证）
python ultra_high_performance_importer.py --components-only

# 验证组件数据
mongo business_plat --eval "db.components.count()"

# 第二步：导入参数定义
python ultra_high_performance_importer.py --definitions-only

# 验证参数定义
mongo business_plat --eval "db.parameter_definitions.count()"

# 第三步：导入参数值（耗时最长）
python ultra_high_performance_importer.py --parameters-only
```

### 3. 监控资源使用

```bash
# 终端1：运行导入
python ultra_high_performance_importer.py

# 终端2：监控资源
htop

# 终端3：监控进度
tail -f ultra_high_perf_import.log
```

### 4. 导入后验证

```bash
# 检查数据量
mongo business_plat << EOF
print("组件数量:", db.components.count())
print("参数定义:", db.parameter_definitions.count())
print("参数数量:", db.parameters.count())
print("索引:", db.components.getIndexes())
EOF

# 检查数据完整性
python -c "
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
db = client['business_plat']  # ✅ 数据库名称
print(f'组件 (Components): {db.components.count_documents({}):,}')
print(f'参数定义 (Parameter Definitions): {db.parameter_definitions.count_documents({}):,}')
print(f'参数 (Parameters): {db.parameters.count_documents({}):,}')
# 预期结果：组件 ~184万，参数定义 313，参数数据 ~1.37亿
"
```

---

## 📞 支持

### 问题反馈

如遇到问题，请提供：
1. 错误日志（`ultra_high_perf_import.log`）
2. 进度文件（`import_progress.json`）
3. 硬件配置
4. 使用的命令

### 性能优化咨询

根据你的具体硬件配置，我可以帮你定制最优参数。

---

## 📝 更新日志

### V2.0 (2025-10-29)
- ✨ 新增命令行参数支持
- ✨ 新增分阶段导入功能
- ✨ 新增断点续传功能
- ✨ 优化内存管理
- ✨ 增强性能监控
- 🐛 修复批量写入错误处理
- 📝 完善文档和示例

### V1.0
- 基础多线程导入功能
- MongoDB批量写入优化

---

## 📄 许可证

MIT License

