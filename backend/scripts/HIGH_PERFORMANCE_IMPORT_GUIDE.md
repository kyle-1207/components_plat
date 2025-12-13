# 高性能DoEEET数据导入器使用指南

## 概述

这是一个专为大规模数据导入优化的高性能导入器，针对1.92亿条记录设计。

## 硬件要求

- **内存**: 16GB+ (推荐32GB+)
- **CPU**: 8核+ (推荐16线程+)  
- **存储**: SSD推荐
- **数据库**: MySQL 5.7+ 或 8.0+

## 主要优化特性

### 1. 多线程并行处理
- 4个CSV读取线程
- 4个数据库写入线程
- 线程间通过队列协调工作

### 2. 大批量内存缓冲
- 单次读取10万行CSV数据
- 5万条记录批量插入数据库
- 100万条记录提交一次事务

### 3. 智能内存管理
- 实时监控内存使用
- 自动调节缓冲区大小
- 防止内存溢出

### 4. 性能监控
- 实时显示导入进度
- 计算当前和平均速度
- 预估完成时间
- 监控CPU和内存使用

## 安装依赖

```bash
pip install -r requirements_high_perf.txt
```

## 配置数据库

### 1. 环境变量配置
```bash
# Windows (PowerShell)
$env:DB_HOST="localhost"
$env:DB_PORT="3306"
$env:DB_USER="root"
$env:DB_PASSWORD="your_password"
$env:DB_NAME="business_plat"
$env:DATA_DIR="data/doeeet/doeeet"

# Linux/Mac
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=business_plat
export DATA_DIR=data/doeeet/doeeet
```

### 2. MySQL优化配置

在MySQL配置文件中添加以下优化设置：

```ini
[mysqld]
# 内存相关
innodb_buffer_pool_size = 8G          # 设置为可用内存的50-70%
innodb_log_buffer_size = 256M
key_buffer_size = 512M

# 日志相关
innodb_log_file_size = 2G
innodb_flush_log_at_trx_commit = 2     # 临时设置，提高写入性能
sync_binlog = 0                        # 临时设置，提高写入性能

# 连接相关
max_connections = 200
thread_cache_size = 50

# 批量插入优化
bulk_insert_buffer_size = 256M
myisam_sort_buffer_size = 512M

# 临时表优化
tmp_table_size = 512M
max_heap_table_size = 512M
```

**注意**: `innodb_flush_log_at_trx_commit = 2` 和 `sync_binlog = 0` 会降低数据安全性，仅在导入期间使用，导入完成后请改回默认值。

## 使用方法

### 1. 完整导入
```bash
cd backend/scripts
python high_performance_doeeet_importer.py
```

### 2. 测试模式（使用较小批量）
```bash
python high_performance_doeeet_importer.py --test
```

## 性能调优

### 根据你的硬件调整配置

在代码中找到 `ImportConfig` 并根据你的硬件调整：

```python
config = ImportConfig(
    max_memory_gb=16.0,          # 调整为你的可用内存
    reader_threads=4,            # 调整为CPU核心数的一半
    writer_threads=4,            # 调整为CPU核心数的一半
    csv_chunk_size=100000,       # 内存充足可增大到200000
    db_batch_size=50000,         # 可调整到100000
    commit_frequency=1000000,    # 可调整到2000000
    pool_size=8                  # 调整为writer_threads的2倍
)
```

### 针对不同硬件的推荐配置

#### 32GB内存 + 16线程CPU
```python
config = ImportConfig(
    max_memory_gb=24.0,
    reader_threads=6,
    writer_threads=6,
    csv_chunk_size=200000,
    db_batch_size=100000,
    commit_frequency=2000000,
    pool_size=12
)
```

#### 16GB内存 + 8线程CPU
```python
config = ImportConfig(
    max_memory_gb=12.0,
    reader_threads=3,
    writer_threads=3,
    csv_chunk_size=100000,
    db_batch_size=50000,
    commit_frequency=1000000,
    pool_size=6
)
```

## 预期性能

基于你的硬件配置（32GB内存 + Ryzen 9 8945HX），预期性能：

- **导入速度**: 50,000 - 100,000 记录/秒
- **总耗时**: 约30-60分钟（1.92亿条记录）
- **内存使用**: 8-16GB
- **CPU使用**: 60-80%

## 监控和日志

### 实时监控
程序会每10秒输出一次性能统计：
```
性能统计:
  进度: 50,000,000/192,029,856 (26.0%)
  当前速度: 75,432 记录/秒
  平均速度: 68,901 记录/秒
  预计完成: 14:32:15
  内存使用: 12.3 GB
  CPU使用: 72.5%
```

### 日志文件
- `high_perf_import.log`: 详细的导入日志
- 包含错误信息和性能统计

## 故障排除

### 1. 内存不足
- 减少 `max_memory_gb`
- 降低 `csv_chunk_size` 和 `db_batch_size`
- 减少线程数

### 2. 数据库连接错误
- 检查数据库配置
- 确保MySQL服务运行
- 检查防火墙设置

### 3. 性能不佳
- 检查磁盘I/O（推荐SSD）
- 调整MySQL配置
- 增加数据库连接池大小

### 4. 中断恢复
程序支持中断后重新运行，使用 `ON DUPLICATE KEY UPDATE` 避免重复插入。

## 安全注意事项

1. 导入前备份数据库
2. 在测试环境先验证
3. 导入完成后恢复MySQL安全配置
4. 监控磁盘空间使用

## 与原版本对比

| 特性 | 原版本 | 高性能版本 | 提升倍数 |
|------|--------|------------|----------|
| 批量大小 | 5,000 | 50,000 | 10x |
| 提交频率 | 5,000条 | 1,000,000条 | 200x |
| 线程数 | 1 | 8 | 8x |
| 内存使用 | ~1GB | ~16GB | 16x |
| 预期速度 | ~5,000/秒 | ~75,000/秒 | 15x |
| 预计耗时 | ~11小时 | ~45分钟 | 15x |
