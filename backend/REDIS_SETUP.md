# Redis缓存设置指南

## 📋 目录

1. [安装Redis](#安装redis)
2. [配置环境变量](#配置环境变量)
3. [启动Redis](#启动redis)
4. [测试缓存功能](#测试缓存功能)
5. [缓存管理](#缓存管理)
6. [性能监控](#性能监控)
7. [故障排查](#故障排查)

---

## 🚀 安装Redis

### Windows

#### 方法1: 使用Docker (推荐)

```powershell
# 拉取Redis镜像
docker pull redis:latest

# 启动Redis容器
docker run --name redis-doeet -p 6379:6379 -d redis:latest

# 验证运行
docker ps | findstr redis
```

#### 方法2: 使用WSL2

```bash
# 在WSL2中安装Redis
sudo apt update
sudo apt install redis-server

# 启动Redis
sudo service redis-server start

# 验证
redis-cli ping
# 应返回: PONG
```

#### 方法3: Windows原生安装

下载地址: https://github.com/microsoftarchive/redis/releases

```powershell
# 下载并解压后，在解压目录运行
redis-server.exe
```

### Linux/macOS

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# macOS (使用Homebrew)
brew install redis
brew services start redis

# 验证安装
redis-cli ping
# 应返回: PONG
```

---

## ⚙️ 配置环境变量

复制`.env.example`到`.env`并配置：

```bash
cp .env.example .env
```

编辑`.env`文件：

```env
# Redis配置
REDIS_HOST=localhost        # Redis主机地址
REDIS_PORT=6379            # Redis端口
REDIS_PASSWORD=            # Redis密码（如果设置了密码）
REDIS_DB=0                 # 数据库编号 (0-15)
```

### Docker配置

如果使用Docker，可以使用以下命令启动带密码的Redis：

```powershell
docker run --name redis-doeet \
  -p 6379:6379 \
  -e REDIS_PASSWORD=your_password_here \
  -d redis:latest \
  --requirepass your_password_here
```

然后在`.env`中配置：

```env
REDIS_PASSWORD=your_password_here
```

---

## 🎯 启动Redis

### Docker方式

```powershell
# 启动容器
docker start redis-doeet

# 查看日志
docker logs -f redis-doeet

# 进入Redis CLI
docker exec -it redis-doeet redis-cli
```

### 本地方式

```bash
# Linux/macOS
sudo service redis-server start

# 或使用systemctl
sudo systemctl start redis

# Windows (在Redis安装目录)
redis-server.exe
```

---

## 🧪 测试缓存功能

### 1. 测试Redis连接

```bash
redis-cli ping
# 应返回: PONG
```

### 2. 运行缓存测试脚本

```bash
cd backend

# 编译TypeScript
npm run build

# 运行测试脚本
npm run test:cache
```

或直接使用ts-node：

```bash
npx ts-node src/scripts/testCache.ts
```

### 3. 预期输出

```
🧪 开始Redis缓存测试

==================================================
========== 测试1: Redis连接 ==========
✅ Redis连接成功

========== 测试2: 基础缓存操作 ==========
📝 测试 set...
✅ set 成功
📖 测试 get...
✅ get 成功，数据一致
🔍 测试 exists...
✅ exists: true
🗑️  测试 del...
✅ del 成功

========== 测试3: 搜索缓存性能对比 ==========
测试搜索词: "LM324"
  ⚡ 无缓存查询: 150ms (20条结果)
  ✅ 缓存查询: 8ms (20条结果)
  🚀 性能提升: 18.8x (节省94.7%)

========== 测试6: 缓存统计 ==========
📊 缓存统计信息:
  - 键数量: 15
  - 内存使用: 2.5M
  - 命中次数: 45
  - 未命中次数: 12
  - 命中率: 78.95%
```

### 4. 在应用中使用

启动应用时会自动预热缓存：

```bash
npm run dev
```

查看日志输出：

```
🔥 开始缓存预热...
  ✓ 参数定义: 313条
  ✓ 制造商列表: 1847个
  ✓ 分类树: 5234个分类
  ✓ 统计数据: 1800000个组件
✅ 缓存预热完成！耗时: 2456ms
📊 缓存统计:
  - 键数量: 4
  - 内存使用: 1.2M
```

---

## 🎨 缓存管理

### 查看缓存内容

```bash
# 进入Redis CLI
redis-cli

# 查看所有keys
127.0.0.1:6379> KEYS doeet:*

# 查看特定key的值
127.0.0.1:6379> GET doeet:meta:statistics

# 查看key的TTL
127.0.0.1:6379> TTL doeet:meta:statistics

# 查看数据库大小
127.0.0.1:6379> DBSIZE

# 查看内存使用
127.0.0.1:6379> INFO memory
```

### 清除缓存

#### 使用Redis CLI

```bash
redis-cli

# 清除所有doeet相关的缓存
127.0.0.1:6379> SCAN 0 MATCH doeet:* COUNT 100
127.0.0.1:6379> DEL doeet:key1 doeet:key2 ...

# 清空当前数据库
127.0.0.1:6379> FLUSHDB

# 清空所有数据库
127.0.0.1:6379> FLUSHALL
```

#### 使用代码

在应用中创建清除缓存的API端点（见下文）。

---

## 📊 性能监控

### Redis监控命令

```bash
redis-cli

# 实时监控所有命令
127.0.0.1:6379> MONITOR

# 查看慢查询日志
127.0.0.1:6379> SLOWLOG GET 10

# 查看服务器信息
127.0.0.1:6379> INFO

# 查看客户端连接
127.0.0.1:6379> CLIENT LIST

# 查看统计信息
127.0.0.1:6379> INFO stats
```

### 性能指标

使用我们的缓存统计API：

```bash
# 获取缓存统计
curl http://localhost:3000/api/doeet/cache/stats
```

返回：

```json
{
  "hits": 1250,
  "misses": 48,
  "hitRate": 96.30,
  "memory": "2.5M",
  "keys": 25,
  "dbSize": 25
}
```

---

## 🔧 缓存管理API

### 1. 获取缓存统计

```http
GET /api/doeet/cache/stats
```

### 2. 清除所有缓存

```http
POST /api/doeet/cache/clear/all
```

### 3. 清除搜索缓存

```http
POST /api/doeet/cache/clear/search
```

### 4. 清除元数据缓存

```http
POST /api/doeet/cache/clear/meta
```

### 5. 清除特定组件缓存

```http
POST /api/doeet/cache/clear/component/:componentId
```

### 6. 预热缓存

```http
POST /api/doeet/cache/warmup
```

---

## 🐛 故障排查

### 问题1: 无法连接Redis

**错误信息**:
```
❌ Redis错误: connect ECONNREFUSED 127.0.0.1:6379
```

**解决方案**:

1. 检查Redis是否运行：
```bash
# Docker
docker ps | findstr redis

# Linux
sudo systemctl status redis

# Windows
tasklist | findstr redis-server
```

2. 检查端口是否被占用：
```bash
# Windows
netstat -ano | findstr :6379

# Linux/macOS
lsof -i :6379
```

3. 检查防火墙设置

4. 检查`.env`配置是否正确

### 问题2: Redis密码错误

**错误信息**:
```
❌ Redis错误: NOAUTH Authentication required
```

**解决方案**:

1. 检查`.env`中的`REDIS_PASSWORD`配置
2. 使用redis-cli测试：
```bash
redis-cli -a your_password ping
```

### 问题3: 内存不足

**错误信息**:
```
❌ Redis错误: OOM command not allowed when used memory
```

**解决方案**:

1. 查看内存使用：
```bash
redis-cli INFO memory
```

2. 增加Redis内存限制（redis.conf）：
```
maxmemory 256mb
maxmemory-policy allkeys-lru
```

3. 清除旧缓存：
```bash
redis-cli FLUSHDB
```

### 问题4: 缓存命中率低

**表现**: 缓存命中率 < 50%

**解决方案**:

1. 检查TTL设置是否过短
2. 增加缓存的TTL：编辑`src/services/CacheService.ts`中的`CacheTTL`
3. 预热更多热门数据
4. 检查是否有频繁的缓存清除操作

### 问题5: 应用启动慢

**原因**: 缓存预热时间过长

**解决方案**:

1. 减少预热的数据量
2. 使用异步预热（不阻塞启动）
3. 调整预热策略，只预热最常用的数据

---

## 📈 性能优化建议

### 1. TTL策略

- **热数据** (搜索结果): 1小时
- **温数据** (组件详情): 2小时
- **冷数据** (元数据): 24小时

### 2. 内存优化

- 定期清理过期数据
- 使用合适的数据结构
- 避免缓存过大的对象

### 3. 缓存策略

- **Cache-Aside**: 先查缓存，未命中再查数据库
- **Write-Through**: 更新时同时更新缓存和数据库
- **Refresh-Ahead**: 预测性刷新即将过期的缓存

### 4. 监控指标

- **命中率**: 目标 > 80%
- **响应时间**: 缓存查询 < 10ms
- **内存使用**: < 1GB

---

## 📚 参考资料

- [Redis官方文档](https://redis.io/documentation)
- [ioredis文档](https://github.com/luin/ioredis)
- [Redis最佳实践](https://redis.io/topics/best-practices)
- [缓存设计模式](https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside)

---

**创建时间**: 2024-10-30  
**作者**: 开发团队  
**版本**: v1.0

