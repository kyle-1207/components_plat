# DoEEET 数据库导入方案

## 📋 概述

本方案将 DoEEET 数据从 CSV 文件导入到 MySQL 数据库中，提供高效的数据查询和管理能力。

## 🗄️ 数据库结构

### 表结构设计

1. **`products`** - 产品通用信息表
   - 存储来自 `general.csv` 的产品基本信息
   - 包含产品ID、分类、制造商、库存等信息

2. **`parameter_keys`** - 参数键定义表
   - 存储来自 `parameter_final.csv` 的参数定义
   - 包含参数名称、分类、示例等

3. **`product_parameters`** - 产品参数表
   - 存储来自 `parameter.csv` 的产品详细参数
   - 关联产品和参数键

4. **`product_families`** - 产品分类元数据表
   - 存储来自 `meta.json` 的分类配置信息

## 🚀 快速开始

### 1. 环境准备

#### 安装依赖
```bash
# Node.js 依赖
cd backend
npm install

# Python 依赖
pip install pandas mysql-connector-python
```

#### 数据库准备
- 确保 MySQL 服务已启动
- 准备数据库连接信息（用户名、密码等）

### 2. 自动化设置

运行自动化设置脚本：
```bash
cd backend
npm run db-setup
```

这个脚本将：
- 检查Python依赖
- 创建数据库和表结构
- 生成环境配置文件
- 可选择导入测试数据或完整数据

### 3. 手动设置（可选）

如果需要手动设置，请按以下步骤：

#### 3.1 创建环境配置文件
复制 `env.example` 到 `.env` 并配置：
```bash
cp env.example .env
```

编辑 `.env` 文件：
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=business_plat
DATA_DIR=data/doeeet/doeeet
```

#### 3.2 创建数据库和表
```bash
# 连接MySQL创建数据库
mysql -u root -p -e "CREATE DATABASE business_plat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入表结构
mysql -u root -p business_plat < database/schema.sql
```

#### 3.3 导入数据
```bash
# 导入测试数据（推荐先测试）
npm run db-import-test

# 导入完整数据（需要较长时间）
npm run db-import
```

## 🖥️ 启动服务

### 启动数据库API服务器
```bash
npm run db-server
```

服务器将在 `http://localhost:3002` 启动

### 测试API
```bash
# 健康检查
curl http://localhost:3002/health

# 获取产品列表
curl http://localhost:3002/api/products?limit=5

# 获取统计信息
curl http://localhost:3002/api/products/meta/stats
```

## 📡 API 接口

### 产品相关接口

#### 获取产品列表
```http
GET /api/products?page=1&limit=20&search=keyword&category=path&manufacturer=name&hasStock=true
```

#### 获取产品详情
```http
GET /api/products/:id
```

#### 高级搜索
```http
POST /api/products/search
Content-Type: application/json

{
  "filters": {
    "search": "capacitor",
    "category": "Passive Components",
    "manufacturer": "KEMET",
    "hasStock": true,
    "parameters": {
      "parameter_key_id": {
        "type": "exact",
        "value": "10nF"
      }
    }
  },
  "page": 1,
  "limit": 20,
  "sortBy": "created_at",
  "sortOrder": "DESC"
}
```

### 元数据接口

#### 获取产品分类
```http
GET /api/products/meta/categories
```

#### 获取制造商列表
```http
GET /api/products/meta/manufacturers
```

#### 获取统计信息
```http
GET /api/products/meta/stats
```

## 📊 数据导入详情

### 导入流程

1. **参数键导入** (`parameter_final.csv` → `parameter_keys`)
2. **产品分类导入** (`meta.json` → `product_families`)
3. **产品信息导入** (`general.csv` → `products`)
4. **产品参数导入** (`parameter.csv` → `product_parameters`)

### 导入选项

- `--test`: 导入少量测试数据
- `--keys-only`: 仅导入参数键和分类数据
- 无参数: 导入完整数据

### 性能优化

- 使用批量插入（批次大小可配置）
- 支持断点续传
- 内存优化的大文件读取
- 数据库索引优化

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DB_HOST` | 数据库主机 | localhost |
| `DB_PORT` | 数据库端口 | 3306 |
| `DB_USER` | 数据库用户名 | root |
| `DB_PASSWORD` | 数据库密码 | - |
| `DB_NAME` | 数据库名称 | business_plat |
| `DATA_DIR` | 数据文件目录 | data/doeeet/doeeet |
| `DB_SERVER_PORT` | API服务器端口 | 3002 |

### 导入脚本配置

可在 `import_doeeet_data.py` 中调整：
- 批量导入大小
- 内存使用限制
- 错误处理策略
- 日志级别

## 📈 性能考虑

### 数据量估算

- **产品数据**: ~450MB (general.csv)
- **参数数据**: ~18GB (parameter.csv)
- **预计导入时间**: 2-6小时（取决于硬件配置）

### 优化建议

1. **硬件优化**
   - 使用SSD存储
   - 增加MySQL缓存大小
   - 确保足够的内存

2. **数据库优化**
   ```sql
   -- 临时禁用索引（导入时）
   ALTER TABLE product_parameters DISABLE KEYS;
   -- 导入完成后重新启用
   ALTER TABLE product_parameters ENABLE KEYS;
   ```

3. **网络优化**
   - 本地数据库连接
   - 增加连接超时时间

## 🐛 故障排除

### 常见问题

1. **内存不足**
   - 减少批量导入大小
   - 增加系统内存
   - 使用交换文件

2. **连接超时**
   - 增加数据库连接超时时间
   - 检查网络连接
   - 减少并发连接数

3. **数据格式错误**
   - 检查CSV文件编码（UTF-8）
   - 验证数据完整性
   - 查看导入日志

### 日志文件

- 导入日志: `import_doeeet_data.log`
- 服务器日志: 控制台输出

## 🔄 数据更新

### 增量更新

```bash
# 只更新新增数据
python scripts/import_doeeet_data.py --incremental
```

### 完全重建

```bash
# 清空数据库并重新导入
python scripts/import_doeeet_data.py --rebuild
```

## 📞 支持

如有问题，请检查：
1. 日志文件中的错误信息
2. 数据库连接配置
3. 文件权限和路径
4. 系统资源使用情况

---

*最后更新: 2024年*
