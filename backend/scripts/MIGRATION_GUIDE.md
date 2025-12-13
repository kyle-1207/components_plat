# DoEEEt 数据格式迁移指南

## 📋 迁移目的

将 DoEEEt 数据库中的字符串格式数据转换为 MongoDB 原生格式，以支持高效查询和索引。

## 🔄 转换内容

### 1. Components 集合
| 字段 | 转换前 | 转换后 |
|------|--------|--------|
| `family_path` | `"['Digital', 'Microcircuits']"` (字符串) | `["Digital", "Microcircuits"]` (数组) |
| `has_stock` | `"Yes"` / `"No"` (字符串) | `true` / `false` (布尔值) |
| `cad_available` | `"Yes"` / `"No"` (字符串) | `true` / `false` (布尔值) |

### 2. Parameters 集合
| 字段 | 转换前 | 转换后 |
|------|--------|--------|
| `parameter_value` | `"['0.00000']"` (字符串列表) | `"0.00000"` (纯字符串) |
| `numeric_value` | 未设置 | `0.00000` (数值) |

## ⚠️ 执行前准备

### 1. 备份数据库（必须！）

**Windows PowerShell 命令：**
```powershell
# 创建备份目录
New-Item -ItemType Directory -Force -Path "F:\Business_plat\backups"

# 备份整个数据库
mongodump --db=business_plat --out="F:\Business_plat\backups\business_plat_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
```

**验证备份：**
```powershell
# 查看备份文件大小
Get-ChildItem "F:\Business_plat\backups\" -Recurse | Measure-Object -Property Length -Sum
```

### 2. 确认数据库连接

```powershell
# 测试 MongoDB 连接
mongo --eval "db.version()"
```

### 3. 停止后端服务（可选，推荐）

```powershell
# 如果后端正在运行，建议先停止
# 按 Ctrl+C 停止正在运行的后端服务
```

## 🚀 执行迁移

### 步骤 1: 进入后端目录

```powershell
cd F:\Business_plat\backend
```

### 步骤 2: 运行迁移脚本

```powershell
node scripts/migrate_doeeet_data_format.js
```

### 步骤 3: 等待完成

脚本会显示实时进度：
```
╔════════════════════════════════════════════════════════╗
║     DoEEEt 数据格式迁移脚本                           ║
╚════════════════════════════════════════════════════════╝

⚠️  重要提醒：
   1. 请确保已备份数据库！
   2. 迁移过程中请勿操作数据库
   3. 预计运行时间：5-10分钟

⏰ 5秒后开始迁移...

📡 正在连接数据库...
✅ 数据库连接成功

========== 开始迁移 components 集合 ==========

📊 总记录数: 1,800,000
⏳ 进度: 10.0% (180,000 / 1,800,000)
⏳ 进度: 20.0% (360,000 / 1,800,000)
...
```

## ✅ 验证迁移结果

### 自动验证

脚本会自动验证：
```
========== 验证迁移结果 ==========

📋 Components 样本数据:
   - family_path 类型: object ✅ Array
   - has_stock 类型: boolean ✅ Boolean
   - 示例 family_path: ["Digital", "Microcircuits"]
   - 示例 has_stock: true

📋 Parameters 样本数据:
   - parameter_value: 0.00000
   - numeric_value: 0

🔍 剩余问题:
   - family_path 仍为字符串的记录: 0
   - has_stock 仍为字符串的记录: 0

🎉 迁移完美完成！所有数据格式正确！
```

### 手动验证（可选）

```powershell
# 连接 MongoDB
mongo business_plat

# 检查样本数据
db.components.findOne({}, {family_path: 1, has_stock: 1})
db.parameters.findOne({}, {parameter_value: 1, numeric_value: 1})

# 检查是否还有字符串格式的数据
db.components.countDocuments({ family_path: { $type: "string" } })
db.components.countDocuments({ has_stock: { $type: "string" } })
```

## 🔧 测试后端功能

迁移完成后，测试关键功能：

```powershell
# 启动后端服务
cd F:\Business_plat\backend
npm run dev
```

测试接口：
```powershell
# 测试分类搜索
Invoke-WebRequest -Uri "http://localhost:3000/api/doeeet/components/search?familyPath=Digital" | Select-Object -ExpandProperty Content

# 测试库存筛选
Invoke-WebRequest -Uri "http://localhost:3000/api/doeeet/components/search?hasStock=true&limit=10" | Select-Object -ExpandProperty Content

# 测试统计信息
Invoke-WebRequest -Uri "http://localhost:3000/api/doeeet/statistics" | Select-Object -ExpandProperty Content
```

## 🔄 回滚方案（如果需要）

如果迁移出现问题，可以从备份恢复：

```powershell
# 找到备份目录
Get-ChildItem "F:\Business_plat\backups\"

# 恢复数据库（替换日期时间为实际备份目录名）
mongorestore --db=business_plat --drop "F:\Business_plat\backups\business_plat_backup_20251030_XXXXXX\business_plat"
```

## 📊 预期时间

| 数据量 | 预计时间 |
|--------|----------|
| 180万 Components | 3-5 分钟 |
| 数百万 Parameters | 5-8 分钟 |
| **总计** | **8-13 分钟** |

## ❓ 常见问题

### Q: 迁移会影响正在运行的服务吗？
A: 建议停止后端服务后再迁移，避免数据不一致。

### Q: 迁移失败怎么办？
A: 从备份恢复，检查错误日志，然后重新执行。

### Q: 可以分批迁移吗？
A: 脚本已经是批量处理（每批1000条），无需手动分批。

### Q: 前端需要修改吗？
A: 不需要！前端接收的 JSON 格式完全相同。

## 📞 支持

如遇到问题，请检查：
1. 备份是否完整
2. MongoDB 服务是否运行
3. 磁盘空间是否充足
4. Node.js 版本是否兼容

---

**准备好了吗？按照上述步骤开始迁移！** 🚀

