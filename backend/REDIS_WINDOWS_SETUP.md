# Windows 上快速安装 Redis

## 方法 1：下载预编译版本（推荐，无需安装）

### 步骤 1：下载 Redis

**直接下载链接**：
- Redis 5.0.14.1 (64位)：https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip

或访问发布页面选择版本：
- https://github.com/tporadowski/redis/releases

### 步骤 2：解压到目录

将 ZIP 文件解压到任意目录，例如：
```
C:\Redis\
```

### 步骤 3：启动 Redis 服务器

#### 方式 A：直接运行（临时）
1. 打开 PowerShell 或 CMD
2. 切换到 Redis 目录：
   ```powershell
   cd C:\Redis
   ```
3. 启动 Redis 服务器：
   ```powershell
   .\redis-server.exe
   ```

#### 方式 B：安装为 Windows 服务（推荐）
在 **管理员权限** 的 PowerShell 中运行：
```powershell
cd C:\Redis
.\redis-server.exe --service-install redis.windows.conf
.\redis-server.exe --service-start
```

### 步骤 4：验证安装

打开新的 PowerShell 窗口：
```powershell
cd C:\Redis
.\redis-cli.exe ping
```

如果返回 `PONG`，说明安装成功！

---

## 方法 2：使用 MSI 安装程序

如果 MSI 安装失败（如你遇到的情况），可能是权限问题：

### 解决方案：
1. **右键点击** `.msi` 文件
2. 选择 **"以管理员身份运行"**
3. 按照向导完成安装

---

## 方法 3：使用 WSL2 + Docker（终极方案）

如果以上方法都不行，使用 Docker：

### 前提条件：
- 安装 Docker Desktop for Windows
- 下载：https://www.docker.com/products/docker-desktop/

### 启动 Redis：
```powershell
docker run -d -p 6379:6379 --name redis redis:alpine
```

验证：
```powershell
docker exec -it redis redis-cli ping
```

---

## 常见问题

### Q1: 端口 6379 被占用？
查看占用端口的进程：
```powershell
netstat -ano | findstr :6379
```

杀死进程（替换 PID）：
```powershell
taskkill /PID <PID> /F
```

### Q2: 防火墙阻止连接？
添加防火墙规则：
```powershell
netsh advfirewall firewall add rule name="Redis" dir=in action=allow protocol=TCP localport=6379
```

### Q3: 如何停止 Redis 服务？
如果作为服务运行：
```powershell
.\redis-server.exe --service-stop
```

如果直接运行，在 Redis 窗口按 `Ctrl+C`

---

## 配置项目

Redis 启动后，确保你的 `.env` 文件包含：
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

---

## 测试连接

在项目后端目录运行：
```powershell
npm run test:cache
```

或启动开发服务器：
```powershell
npm run dev
```

如果看到 `✅ Redis连接成功`，说明一切正常！

---

## 快速命令参考

```powershell
# 启动 Redis 服务器
redis-server.exe

# 连接 Redis 客户端
redis-cli.exe

# 测试连接
redis-cli.exe ping

# 查看所有 keys
redis-cli.exe keys *

# 清空数据库
redis-cli.exe flushdb

# 查看 Redis 信息
redis-cli.exe info
```

