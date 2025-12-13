# Windows 上安装 Redis 指南

## 🎯 快速选择

根据你的需求选择合适的方案：

| 方案 | 适用场景 | 难度 | 推荐度 |
|------|---------|------|--------|
| **方案1: Memurai** | 生产环境，长期使用 | ⭐ | ⭐⭐⭐⭐⭐ |
| **方案2: Docker** | 开发环境，已有Docker | ⭐⭐ | ⭐⭐⭐⭐ |
| **方案3: WSL** | 偏好Linux环境 | ⭐⭐⭐ | ⭐⭐⭐ |
| **方案4: 暂不安装** | 快速开发测试 | - | ⭐⭐ |

---

## 📦 方案 1：Memurai（推荐）

Memurai 是 Redis 的 Windows 原生版本，性能稳定，易于安装。

### 1.1 下载和安装

1. **访问官网下载页面**
   ```
   https://www.memurai.com/get-memurai
   ```

2. **选择版本**
   - **Memurai Developer**（免费）：适合开发环境
   - **Memurai**（付费）：适合生产环境

3. **下载安装包**
   - 点击 "Download Memurai Developer"
   - 选择适合你的 Windows 版本（x64）

4. **运行安装程序**
   - 双击 `memurai-setup.exe`
   - 按提示完成安装（建议使用默认设置）

### 1.2 配置为 Windows 服务

安装完成后，Memurai 会自动注册为 Windows 服务并启动。

**检查服务状态：**

```cmd
# 打开服务管理器
services.msc

# 或使用命令行
sc query Memurai
```

**手动控制服务：**

```cmd
# 启动服务
net start Memurai

# 停止服务
net stop Memurai

# 重启服务
net stop Memurai && net start Memurai
```

### 1.3 验证安装

1. **使用 Memurai CLI 测试**

```cmd
# 进入安装目录（默认路径）
cd "C:\Program Files\Memurai"

# 测试连接
memurai-cli.exe ping
```

**预期输出：**
```
PONG
```

2. **测试基本操作**

```cmd
# 进入 CLI
memurai-cli.exe

# 设置值
127.0.0.1:6379> SET test "Hello Memurai"
OK

# 获取值
127.0.0.1:6379> GET test
"Hello Memurai"

# 退出
127.0.0.1:6379> EXIT
```

### 1.4 配置文件（可选）

配置文件位置：
```
C:\ProgramData\Memurai\memurai.conf
```

常用配置：

```conf
# 设置密码（推荐生产环境）
requirepass your_password_here

# 最大内存限制
maxmemory 256mb

# 内存淘汰策略
maxmemory-policy allkeys-lru

# 持久化设置
save 900 1
save 300 10
save 60 10000
```

修改配置后需要重启服务：
```cmd
net stop Memurai
net start Memurai
```

---

## 🐳 方案 2：使用 Docker

如果你已经安装了 Docker Desktop for Windows。

### 2.1 安装 Docker Desktop

如果还没有安装 Docker：

1. 访问 https://www.docker.com/products/docker-desktop/
2. 下载并安装 Docker Desktop for Windows
3. 启动 Docker Desktop

### 2.2 运行 Redis 容器

**基础运行（无密码）：**

```cmd
docker run -d ^
  --name redis ^
  -p 6379:6379 ^
  redis:latest
```

**带密码运行（推荐）：**

```cmd
docker run -d ^
  --name redis ^
  -p 6379:6379 ^
  redis:latest ^
  redis-server --requirepass your_password
```

**带持久化运行：**

```cmd
docker run -d ^
  --name redis ^
  -p 6379:6379 ^
  -v redis-data:/data ^
  redis:latest ^
  redis-server --appendonly yes
```

### 2.3 管理 Docker Redis

```cmd
# 查看容器状态
docker ps

# 停止容器
docker stop redis

# 启动容器
docker start redis

# 重启容器
docker restart redis

# 查看日志
docker logs redis

# 进入 Redis CLI
docker exec -it redis redis-cli

# 删除容器
docker rm -f redis
```

### 2.4 验证 Docker Redis

**方法1：在容器内测试**

```cmd
# 进入容器的 Redis CLI
docker exec -it redis redis-cli

# 如果设置了密码，需要先认证
127.0.0.1:6379> AUTH your_password

# 测试
127.0.0.1:6379> PING
PONG
```

**方法2：从宿主机测试**

如果你安装了 Redis CLI 工具：

```cmd
redis-cli -h localhost -p 6379 ping
```

---

## 🐧 方案 3：使用 WSL2

如果你想在 Windows 上使用 Linux 原生的 Redis。

### 3.1 启用 WSL2

```cmd
# 以管理员身份运行 PowerShell
wsl --install

# 重启电脑
```

### 3.2 安装 Ubuntu

```cmd
# 安装 Ubuntu（默认）
wsl --install -d Ubuntu

# 或安装其他发行版
wsl --list --online
wsl --install -d <发行版名称>
```

### 3.3 在 WSL 中安装 Redis

```bash
# 进入 WSL
wsl

# 更新包管理器
sudo apt update

# 安装 Redis
sudo apt install redis-server -y

# 启动 Redis
sudo service redis-server start

# 测试
redis-cli ping
```

### 3.4 配置 Redis 自动启动

**方法1：每次手动启动**

```bash
sudo service redis-server start
```

**方法2：创建启动脚本**

在 WSL 中创建 `/usr/local/bin/start-redis.sh`：

```bash
#!/bin/bash
sudo service redis-server start
```

```bash
# 赋予执行权限
sudo chmod +x /usr/local/bin/start-redis.sh

# 启动
start-redis.sh
```

### 3.5 从 Windows 连接 WSL Redis

WSL2 的 IP 地址是动态的，需要获取：

```cmd
# 在 Windows 中运行
wsl hostname -I
```

然后在 `.env` 中配置：

```env
REDIS_HOST=<WSL_IP地址>
REDIS_PORT=6379
```

或者配置 Redis 监听所有接口：

在 WSL 中编辑 `/etc/redis/redis.conf`：

```bash
sudo nano /etc/redis/redis.conf

# 找到 bind 127.0.0.1，修改为
bind 0.0.0.0

# 保存并重启
sudo service redis-server restart
```

---

## 🚫 方案 4：暂不安装 Redis

如果你暂时不需要缓存功能，应用已经配置为可以在没有 Redis 的情况下运行。

### 4.1 当前配置

代码已经优化，当 Redis 不可用时：
- ✅ 应用会正常启动
- ✅ 只显示3次错误日志
- ✅ 自动切换到无缓存模式
- ✅ 核心功能不受影响

### 4.2 影响

**无 Redis 的影响：**
- ❌ 没有查询结果缓存（每次都从数据库查询）
- ❌ 没有热点数据缓存
- ❌ 性能会略有下降
- ✅ 功能完全正常

**适用场景：**
- 开发初期快速测试
- 数据量较小的项目
- 对性能要求不高的场景

### 4.3 后续安装

当你需要安装 Redis 时，参考上述方案 1-3 即可。
安装后无需修改代码，应用会自动连接并启用缓存。

---

## ✅ 验证 Redis 连接

无论使用哪种方案，都可以通过以下方式验证：

### 1. 使用项目的测试命令

```cmd
cd backend
npm run test:cache
```

### 2. 查看应用启动日志

启动应用：
```cmd
cd backend
npm run dev
```

**成功连接 Redis 的日志：**
```
✅ Redis连接成功
✅ Redis就绪，缓存功能已启用
```

**Redis 不可用的日志：**
```
❌ Redis连接错误: connect ECONNREFUSED 127.0.0.1:6379
⚠️  Redis 不可用，应用将在无缓存模式下继续运行
💡 提示：如需启用缓存功能，请安装并启动 Redis 服务
```

---

## 🔧 常见问题

### 问题 1：端口被占用

**错误信息：**
```
Address already in use
```

**解决方案：**

```cmd
# 查找占用 6379 端口的进程
netstat -ano | findstr :6379

# 杀死进程（替换 <PID> 为实际进程ID）
taskkill /PID <PID> /F
```

### 问题 2：无法连接到 Redis

**检查清单：**

1. **Redis 服务是否运行？**
   ```cmd
   # Memurai
   sc query Memurai
   
   # Docker
   docker ps | findstr redis
   
   # WSL
   wsl redis-cli ping
   ```

2. **端口是否正确？**
   - 检查 `.env` 中的 `REDIS_PORT`（默认 6379）

3. **防火墙是否阻止？**
   ```cmd
   # 添加防火墙规则
   netsh advfirewall firewall add rule name="Redis" dir=in action=allow protocol=TCP localport=6379
   ```

4. **密码是否正确？**
   - 检查 `.env` 中的 `REDIS_PASSWORD`

### 问题 3：性能问题

**优化建议：**

1. **增加最大内存**
   ```conf
   # memurai.conf 或 redis.conf
   maxmemory 512mb
   ```

2. **选择合适的淘汰策略**
   ```conf
   maxmemory-policy allkeys-lru
   ```

3. **禁用持久化（开发环境）**
   ```conf
   save ""
   appendonly no
   ```

### 问题 4：Memurai CLI 命令未找到

**解决方案：**

添加到系统路径：

1. 打开"系统环境变量"
2. 编辑 `Path` 变量
3. 添加：`C:\Program Files\Memurai`
4. 重启命令行窗口

或使用完整路径：
```cmd
"C:\Program Files\Memurai\memurai-cli.exe" ping
```

---

## 📚 推荐配置

### 开发环境

```env
# .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 生产环境

```env
# .env
REDIS_HOST=your-redis-server.com
REDIS_PORT=6379
REDIS_PASSWORD=StrongPassword123!@#
REDIS_DB=0
```

---

## 🎓 学习资源

- [Redis 官方文档](https://redis.io/documentation)
- [Memurai 文档](https://docs.memurai.com/)
- [Redis 命令参考](https://redis.io/commands)
- [Redis 最佳实践](https://redis.io/topics/best-practices)

---

## 📞 需要帮助？

如果遇到问题：

1. 检查 Redis 服务是否运行
2. 检查 `.env` 配置是否正确
3. 查看应用启动日志
4. 参考上面的"常见问题"部分

**记住：即使不安装 Redis，应用也能正常运行！** 🚀

