# Redis 环境变量配置指南

## 📋 概述

本文档详细说明如何在项目中配置 Redis 相关的环境变量。

## 🔧 配置步骤

### 1. 创建 .env 文件

在 `backend` 目录下创建 `.env` 文件（如果还没有的话）：

```bash
# Windows PowerShell
cd backend
Copy-Item env.example .env

# 或者手动创建
New-Item -Path ".env" -ItemType File
```

### 2. 在 .env 中添加 Redis 配置

打开 `backend/.env` 文件，添加以下 Redis 配置：

```env
# Redis 缓存配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## 📝 配置项详解

### `REDIS_HOST`
- **说明**: Redis 服务器的主机地址
- **类型**: 字符串
- **默认值**: `localhost`
- **示例**:
  ```env
  # 本地开发环境
  REDIS_HOST=localhost
  
  # 远程服务器
  REDIS_HOST=192.168.1.100
  
  # 使用域名
  REDIS_HOST=redis.example.com
  
  # Docker 容器名称
  REDIS_HOST=redis-container
  ```

### `REDIS_PORT`
- **说明**: Redis 服务器的端口号
- **类型**: 数字
- **默认值**: `6379`
- **示例**:
  ```env
  # 默认端口
  REDIS_PORT=6379
  
  # 自定义端口
  REDIS_PORT=6380
  ```

### `REDIS_PASSWORD`
- **说明**: Redis 服务器的连接密码
- **类型**: 字符串
- **默认值**: 空（无密码）
- **重要性**: ⭐⭐⭐⭐⭐ 生产环境必须设置！
- **示例**:
  ```env
  # 无密码（开发环境）
  REDIS_PASSWORD=
  
  # 有密码（生产环境推荐）
  REDIS_PASSWORD=your_secure_password_here
  
  # 复杂密码示例
  REDIS_PASSWORD=MyS3cur3P@ssw0rd!2024
  ```

### `REDIS_DB`
- **说明**: Redis 数据库编号（Redis 支持 0-15 共 16 个数据库）
- **类型**: 数字
- **默认值**: `0`
- **使用场景**: 
  - 不同环境使用不同数据库
  - 同一服务器上多个项目隔离
- **示例**:
  ```env
  # 开发环境使用 DB 0
  REDIS_DB=0
  
  # 测试环境使用 DB 1
  REDIS_DB=1
  
  # 预发布环境使用 DB 2
  REDIS_DB=2
  ```

## 🌍 不同环境的配置示例

### 开发环境 (本地)

```env
# 开发环境 - 本地 Redis
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 测试环境

```env
# 测试环境 - 共享 Redis 服务器
NODE_ENV=test
REDIS_HOST=test-redis.internal.com
REDIS_PORT=6379
REDIS_PASSWORD=test_password_123
REDIS_DB=1
```

### 生产环境

```env
# 生产环境 - 高可用 Redis
NODE_ENV=production
REDIS_HOST=prod-redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=VerySecureProductionPassword!@#2024
REDIS_DB=0
```

### Docker 环境

```env
# Docker Compose 环境
NODE_ENV=development
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=docker_redis_pass
REDIS_DB=0
```

## 🔐 安全建议

### 1. 密码设置原则

✅ **推荐做法**:
```env
# 生产环境必须设置强密码
REDIS_PASSWORD=Xk9#mP2$vL8@qR5
```

❌ **不推荐做法**:
```env
# 生产环境不要留空
REDIS_PASSWORD=

# 不要使用弱密码
REDIS_PASSWORD=123456
REDIS_PASSWORD=password
```

### 2. 密码强度要求

生产环境建议密码满足：
- 长度 ≥ 16 位
- 包含大小写字母、数字、特殊字符
- 不包含个人信息或常见单词

### 3. 生成安全密码

```bash
# 使用 Node.js 生成随机密码
node -e "console.log(require('crypto').randomBytes(20).toString('hex'))"

# 使用 PowerShell 生成随机密码
Add-Type -AssemblyName System.Web
[System.Web.Security.Membership]::GeneratePassword(20,5)
```

## 🚀 启动流程

### 1. 确保 Redis 已安装并运行

```bash
# 检查 Redis 是否运行
redis-cli ping
# 应该返回: PONG

# 如果需要启动 Redis
redis-server

# 或使用 Windows Service
net start Redis
```

### 2. 验证环境变量

创建测试脚本 `test-redis-env.js`:

```javascript
require('dotenv').config();

console.log('Redis 配置:');
console.log('HOST:', process.env.REDIS_HOST || 'localhost');
console.log('PORT:', process.env.REDIS_PORT || '6379');
console.log('PASSWORD:', process.env.REDIS_PASSWORD ? '已设置 (' + process.env.REDIS_PASSWORD.length + ' 字符)' : '未设置');
console.log('DB:', process.env.REDIS_DB || '0');
```

运行测试:
```bash
cd backend
node test-redis-env.js
```

### 3. 测试 Redis 连接

创建连接测试脚本 `test-redis-connection.js`:

```javascript
require('dotenv').config();
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0
});

client.on('connect', () => {
  console.log('✅ Redis 连接成功!');
  
  // 测试写入
  client.set('test_key', 'Hello Redis!', (err) => {
    if (err) {
      console.error('❌ 写入失败:', err);
    } else {
      console.log('✅ 写入成功');
      
      // 测试读取
      client.get('test_key', (err, value) => {
        if (err) {
          console.error('❌ 读取失败:', err);
        } else {
          console.log('✅ 读取成功:', value);
        }
        
        // 清理并关闭
        client.del('test_key');
        client.quit();
      });
    }
  });
});

client.on('error', (err) => {
  console.error('❌ Redis 连接错误:', err);
  process.exit(1);
});
```

运行测试:
```bash
node test-redis-connection.js
```

## ⚠️ 常见问题

### 问题 1: 连接失败 "ECONNREFUSED"

**原因**: Redis 服务未启动或端口不正确

**解决方案**:
```bash
# 检查 Redis 是否运行
redis-cli ping

# 启动 Redis
redis-server

# 检查端口
netstat -an | findstr 6379
```

### 问题 2: 认证失败 "NOAUTH"

**原因**: Redis 配置了密码但环境变量中未设置

**解决方案**:
```env
# 在 .env 中添加密码
REDIS_PASSWORD=your_actual_password
```

### 问题 3: 环境变量未生效

**原因**: .env 文件位置不正确或未加载

**解决方案**:
```javascript
// 在入口文件最顶部添加
require('dotenv').config({ path: '.env' });

// 或指定绝对路径
require('dotenv').config({ path: __dirname + '/.env' });
```

### 问题 4: Docker 环境连接失败

**原因**: 容器网络配置问题

**解决方案**:
```env
# 使用 Docker Compose 服务名称
REDIS_HOST=redis

# 或使用容器 IP
REDIS_HOST=172.18.0.2
```

## 📚 完整的 .env 示例

```env
# ========================================
# 服务器配置
# ========================================
NODE_ENV=development
PORT=3001

# ========================================
# 数据库配置
# ========================================
MONGODB_URI=mongodb://localhost:27017/aerospace_platform
MONGODB_DOEET_URI=mongodb://localhost:27017/doeet

# ========================================
# Redis 缓存配置
# ========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ========================================
# 日志配置
# ========================================
LOG_LEVEL=info

# ========================================
# JWT 配置
# ========================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# ========================================
# 文件上传配置
# ========================================
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp,application/pdf

# ========================================
# CORS 配置
# ========================================
CORS_ORIGIN=http://localhost:3000

# ========================================
# 限流配置
# ========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ========================================
# 数据库连接池配置
# ========================================
DB_MAX_POOL_SIZE=10
DB_MIN_POOL_SIZE=5
```

## 🔄 环境变量加载验证

在代码中验证环境变量是否正确加载：

```javascript
// backend/src/config/redis.ts
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 验证必需的环境变量
const requiredEnvVars = ['REDIS_HOST', 'REDIS_PORT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.warn(`⚠️  警告: 以下环境变量未设置，将使用默认值: ${missingEnvVars.join(', ')}`);
}

// 导出配置
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10)
};

// 打印配置（隐藏敏感信息）
console.log('Redis 配置已加载:');
console.log(`  Host: ${redisConfig.host}`);
console.log(`  Port: ${redisConfig.port}`);
console.log(`  Password: ${redisConfig.password ? '***' : '未设置'}`);
console.log(`  Database: ${redisConfig.db}`);
```

## ✅ 检查清单

在启动应用前，请确认：

- [ ] `.env` 文件已创建在 `backend` 目录下
- [ ] Redis 相关的 4 个环境变量已配置
- [ ] Redis 服务已启动并正常运行
- [ ] 如果设置了密码，确保密码正确
- [ ] 生产环境使用了强密码
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] 运行了连接测试脚本验证配置

## 📞 需要帮助？

如果遇到问题，请检查：
1. Redis 服务是否正常运行
2. 环境变量是否正确加载
3. 防火墙是否阻止了连接
4. 密码是否正确（如果有的话）

更多信息请参考：
- [Redis 官方文档](https://redis.io/documentation)
- [node-redis 文档](https://github.com/redis/node-redis)

