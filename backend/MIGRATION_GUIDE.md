# DoEEEt 数据迁移指南

## 概述

本指南帮助您完成 DoEEEt 数据格式迁移，将 Python 字符串格式转换为 MongoDB 原生格式。

## 当前状态

✅ 已完成：
- 迁移脚本开发完成
- 备份脚本开发完成
- 回滚脚本开发完成

⚠️ 需要处理：
- 数据库包含约 1.36 亿条文档
- 需要安装 `mongodump` 工具进行高效备份

## 快速开始

### 步骤 1：安装 MongoDB Database Tools

**推荐方法（使用 Chocolatey）**：

```powershell
# 以管理员身份打开 PowerShell
choco install mongodb-database-tools -y

# 验证安装
mongodump --version
```

**详细安装说明**：参见 `INSTALL_MONGODB_TOOLS.md`

### 步骤 2：运行迁移

```powershell
cd F:\Business_plat\backend
powershell -ExecutionPolicy Bypass -File .\scripts\run_migration.ps1
```

迁移脚本会自动：
1. ✅ 备份数据库（使用 mongodump）
2. ✅ 执行数据迁移
3. ✅ 验证迁移结果

### 步骤 3：验证结果

迁移完成后，脚本会显示详细统计信息。

## 备份说明

### 为什么需要 mongodump？

| 方法 | 速度 | 文件大小 | 适用场景 |
|------|------|----------|----------|
| **mongodump** (BSON) | 快速 | 压缩高效 | ✅ 推荐用于大型数据库 |
| mongosh (JSON) | 较慢 | 占用空间大 | ⚠️ 仅适用于小型数据库 |

对于 1.36 亿条文档：
- `mongodump`: 预计 15-20 分钟
- `mongosh`: 可能需要数小时，且易内存溢出

### 备份位置

```
F:\Business_plat\backups\
├── business_plat_backup_20251030_172607\
├── business_plat_backup_20251030_172740\
└── business_plat_backup_YYYYMMDD_HHMMSS\  ← 新备份
```

## 迁移详情

### 转换内容

1. **Components 集合**：
   - `family_path`: `"['A', 'B']"` → `["A", "B"]`
   - `has_stock`: `"Yes"/"No"` → `true/false`
   - `cad_available`: `"Yes"/"No"` → `true/false`

2. **Parameters 集合**：
   - `parameter_value`: `"['value']"` → `"value"`

### 性能参数

- 批处理大小：1000 条/批
- 预计时间：15-20 分钟（含备份）
- 内存占用：适中

## 回滚方案

如果迁移出现问题：

### 方法 1：使用备份恢复

```powershell
# 查看可用备份
Get-ChildItem F:\Business_plat\backups

# 使用 mongorestore 恢复
mongorestore --db=business_plat F:\Business_plat\backups\business_plat_backup_YYYYMMDD_HHMMSS\business_plat\
```

### 方法 2：运行回滚脚本

```powershell
cd F:\Business_plat\backend
node scripts/rollback_migration.js
```

**注意**：回滚脚本会尝试将数据还原为字符串格式，但建议优先使用备份恢复。

## 故障排除

### 问题 1：mongodump 未找到

**错误信息**：
```
无法将"mongodump"项识别为 cmdlet、函数、脚本文件或可运行程序的名称
```

**解决方案**：
1. 安装 MongoDB Database Tools（见步骤 1）
2. 或者选择继续使用 mongosh（不推荐用于大型数据库）

### 问题 2：内存溢出

**错误信息**：
```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**解决方案**：
1. 必须安装并使用 mongodump
2. mongosh 无法处理如此大量的数据

### 问题 3：迁移中断

**解决方案**：
1. 迁移脚本支持断点续传
2. 重新运行迁移脚本，会自动跳过已处理的文档
3. 或者使用备份恢复后重新开始

## 时间估算

| 阶段 | 预计时间 |
|------|----------|
| 安装 mongodump | 2-5 分钟 |
| 数据库备份 | 10-15 分钟 |
| 数据迁移 | 5-10 分钟 |
| 结果验证 | 1-2 分钟 |
| **总计** | **18-32 分钟** |

## 最佳实践

1. ✅ **在非高峰期运行**：避免影响业务
2. ✅ **确保足够磁盘空间**：备份需要约 10-20 GB
3. ✅ **不要中断 MongoDB 服务**：迁移期间保持运行
4. ✅ **保留备份**：至少保留 2-3 个备份
5. ✅ **迁移后测试**：验证应用功能正常

## 联系支持

如遇到问题：
1. 查看错误日志
2. 检查 MongoDB 服务状态
3. 确认磁盘空间充足
4. 提供错误截图和日志

---

**准备好了吗？**

```powershell
# 1. 安装工具
choco install mongodb-database-tools -y

# 2. 开始迁移
cd F:\Business_plat\backend
powershell -ExecutionPolicy Bypass -File .\scripts\run_migration.ps1
```

