# MongoDB 本地数据目录使用指南

## 📁 数据目录位置

数据存储在: `F:\Business_plat\backend\data`

## 🚀 快速开始

### 1. 启动 MongoDB

使用项目提供的启动脚本：

```bash
# Windows
start-mongodb-local.bat
```

或者手动启动：

```bash
mongod --config mongod.conf
```

### 2. 检查连接

```bash
node scripts/check_data_connection.js
```

### 3. 查看数据库列表

```bash
node scripts/list_databases.js
```

## 📋 配置文件

配置文件: `backend/mongod.conf`

主要配置：
- **数据目录**: `F:\Business_plat\backend\data`
- **日志文件**: `F:\Business_plat\backend\logs\mongod.log`
- **端口**: 27017
- **绑定地址**: 127.0.0.1

## 🔧 配置说明

### 存储配置
- **引擎**: WiredTiger
- **缓存大小**: 8GB（可根据系统内存调整）
- **压缩**: snappy（平衡性能和空间）

### 网络配置
- **端口**: 27017
- **最大连接数**: 100

### 日志配置
- **日志位置**: `backend/logs/mongod.log`
- **日志级别**: 1（中等详细程度）

## 📊 数据统计

根据检查脚本的输出：
- **总大小**: 14.31 GB
- **.wt 文件数**: 380 个
- **最大集合文件**: 5.63 GB

## 🔍 常用命令

### 连接 MongoDB

```bash
# 使用 mongosh
mongosh mongodb://127.0.0.1:27017

# 或直接
mongosh
```

### 查看数据库

```javascript
// 在 mongosh 中
show dbs
use <database_name>
show collections
db.<collection_name>.countDocuments()
```

### 停止 MongoDB

如果使用启动脚本启动，按 `Ctrl+C` 停止。

如果作为服务运行：

```bash
# Windows
net stop MongoDB
```

## ⚠️ 注意事项

1. **数据目录**: 确保数据目录路径正确
2. **端口占用**: 确保端口 27017 未被占用
3. **权限**: 确保有读写数据目录的权限
4. **备份**: 定期备份数据目录

## 🛠️ 故障排除

### MongoDB 无法启动

1. 检查日志文件: `backend/logs/mongod.log`
2. 检查端口是否被占用: `netstat -an | findstr :27017`
3. 检查数据目录权限
4. 检查配置文件路径是否正确

### 连接失败

1. 确认 MongoDB 正在运行
2. 检查连接 URI: `mongodb://127.0.0.1:27017`
3. 检查防火墙设置

### 数据目录问题

1. 确认数据目录存在: `F:\Business_plat\backend\data`
2. 检查目录权限
3. 确认没有其他 MongoDB 实例在使用该目录

## 📝 相关脚本

- `scripts/check_local_data.js` - 检查本地数据目录
- `scripts/check_data_connection.js` - 检查连接
- `scripts/list_databases.js` - 列出所有数据库和集合

