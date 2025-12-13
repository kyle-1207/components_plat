# ⚡ 超高性能导入器 - 快速开始

## 🚀 一行命令开始

```bash
cd backend/scripts && python ultra_high_performance_importer.py
```

---

## 📋 常用命令速查

### 基础用法

```bash
# 完整导入（默认配置）
python ultra_high_performance_importer.py

# 查看帮助
python ultra_high_performance_importer.py --help
```

### 分阶段导入

```bash
# 1️⃣ 只导入组件（10-15分钟）
python ultra_high_performance_importer.py --components-only

# 2️⃣ 只导入参数（3-8小时）
python ultra_high_performance_importer.py --parameters-only
```

### 性能调优

```bash
# 🏎️ 高性能配置（32GB内存）
python ultra_high_performance_importer.py \
  --memory 24 --readers 6 --writers 8 --batch-size 200000

# 💾 低内存配置（8GB内存）
python ultra_high_performance_importer.py \
  --memory 6 --readers 2 --writers 2 --batch-size 25000

# 🧪 测试模式
python ultra_high_performance_importer.py --test
```

### 断点续传

```bash
# ✅ 自动续传（默认）
python ultra_high_performance_importer.py

# 🔄 重新导入
python ultra_high_performance_importer.py --no-resume
```

---

## 📊 性能预估（你的硬件：32GB + Ryzen 9）

| 任务 | 数据量 | 预计时间 |
|------|--------|---------|
| 组件导入 | 261万条 | 5-10分钟 |
| 参数导入 | 1.92亿条 | 3-8小时 |
| **总计** | **1.95亿条** | **4-8小时** |

---

## 🎯 推荐工作流

### 方案A：首次导入（推荐）

```bash
# Step 1: 测试组件导入（验证配置）
python ultra_high_performance_importer.py --test --components-only

# Step 2: 正式导入组件
python ultra_high_performance_importer.py --components-only

# Step 3: 验证组件数据
mongo business_plat --eval "db.components.count()"

# Step 4: 导入参数（耗时较长，建议在夜间运行）
python ultra_high_performance_importer.py --parameters-only
```

### 方案B：快速导入

```bash
# 一次性完整导入
python ultra_high_performance_importer.py --memory 24 --writers 8
```

---

## 🔍 监控进度

### 实时日志

```bash
# 查看实时日志
tail -f ultra_high_perf_import.log

# 只看性能统计
tail -f ultra_high_perf_import.log | grep "性能统计"
```

### 进度文件

```bash
# 查看当前进度
cat import_progress.json | jq

# 实时监控（每5秒刷新）
watch -n 5 'cat import_progress.json | jq'
```

### 系统资源

```bash
# 监控CPU/内存
htop

# 监控磁盘IO
iostat -x 1
```

---

## 🐛 快速故障排除

### MongoDB连接失败

```bash
# 检查MongoDB状态
mongod --version
mongo --eval "db.adminCommand('ping')"

# 启动MongoDB
mongod --dbpath /path/to/data
```

### 内存不足

```bash
# 使用低内存配置
python ultra_high_performance_importer.py \
  --memory 6 --chunk-size 50000 --batch-size 25000
```

### 数据文件不存在

```bash
# 检查数据文件
ls -lh data/doeeet/doeeet/

# 指定数据目录
python ultra_high_performance_importer.py --data-dir /your/path
```

---

## 📦 参数速查表

### 常用参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `--components-only` | 只导入组件 | - |
| `--parameters-only` | 只导入参数 | - |
| `--memory 24` | 内存限制(GB) | 8-32 |
| `--readers 6` | 读取线程数 | 2-8 |
| `--writers 6` | 写入线程数 | 2-12 |
| `--batch-size 100000` | 批量大小 | 10K-200K |
| `--no-resume` | 重新导入 | - |
| `--test` | 测试模式 | - |

### 硬件配置推荐

#### 你的配置（32GB + 16线程）

```bash
python ultra_high_performance_importer.py \
  --memory 24 --readers 6 --writers 8
```

#### 16GB + 8线程

```bash
python ultra_high_performance_importer.py \
  --memory 12 --readers 3 --writers 4
```

#### 64GB + 32线程

```bash
python ultra_high_performance_importer.py \
  --memory 48 --readers 8 --writers 12
```

---

## ✅ 验证导入结果

```bash
# 连接MongoDB
mongo business_plat

# 检查数据量
db.components.count()  // 应该是 2,618,068
db.parameters.count()  // 应该是 192,029,856

# 检查索引
db.components.getIndexes()
db.parameters.getIndexes()

# 随机抽样验证
db.components.findOne()
db.parameters.findOne()
```

---

## 📞 需要帮助？

查看完整文档：`ULTRA_IMPORT_GUIDE.md`

---

**提示**: 首次使用建议先用 `--test` 模式验证！

