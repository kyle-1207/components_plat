# Docker Redis 安装指南 (Windows)

## 方法 1：Docker 认证并拉取镜像

### 步骤 1：登录 Docker Hub

```powershell
# 登录 Docker Hub
docker login

# 输入你的 Docker Hub 用户名和密码
# Username: 你的用户名
# Password: 你的密码
```

### 步骤 2：验证邮箱

如果提示 "email must be verified"：
1. 访问 https://hub.docker.com/
2. 登录你的账号
3. 检查注册邮箱是否有验证邮件
4. 点击邮件中的验证链接
5. 邮箱验证成功后，返回继续

### 步骤 3：拉取并运行 Redis

```powershell
# 登录成功后，拉取并运行 Redis
docker run -d -p 6379:6379 --name redis redis:latest

# 验证 Redis 是否运行
docker ps

# 查看 Redis 日志
docker logs redis
```

---

## 方法 2：使用公共镜像（无需认证） ⭐ 推荐

有些 Docker 镜像仓库不需要认证：

```powershell
# 使用 Docker Hub 的官方镜像（通常不需要认证）
docker pull redis:7-alpine

# 运行 Redis
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

---

## 方法 3：使用 Memurai（Windows 原生 Redis）

Memurai 是 Redis 的 Windows 原生版本，无需 Docker。

### 步骤 1：下载 Memurai

1. 访问：https://www.memurai.com/get-memurai
2. 下载免费的开发者版本（Memurai Developer Edition）

### 步骤 2：安装

1. 运行下载的安装程序
2. 使用默认配置安装
3. 安装完成后，Memurai 会自动作为 Windows 服务启动

### 步骤 3：验证

```powershell
# Memurai 默认监听 6379 端口，与 Redis 兼容
# 你的应用无需任何修改即可使用
```

---

## 方法 4：使用 WSL + Redis（简单快速） ⭐ 推荐

### 步骤 1：确保 WSL 已安装

```powershell
# 检查 WSL
wsl --list --verbose

# 如果未安装 WSL，运行：
wsl --install
```

### 步骤 2：在 WSL 中安装 Redis

```powershell
# 更新包管理器
wsl sudo apt update

# 安装 Redis
wsl sudo apt install redis-server -y
```

### 步骤 3：启动 Redis

```powershell
# 方式 1：直接启动（保持窗口打开）
wsl redis-server

# 方式 2：作为服务启动（后台运行）
wsl sudo service redis-server start

# 检查状态
wsl sudo service redis-server status

# 停止服务
wsl sudo service redis-server stop
```

### 步骤 4：测试连接

```powershell
# 在 WSL 中测试
wsl redis-cli ping
# 应该返回：PONG

# 设置值
wsl redis-cli SET test "Hello Redis"

# 获取值
wsl redis-cli GET test
```

---

## 方法 5：下载预编译的 Windows Redis

### 步骤 1：下载

访问：https://github.com/tporadowski/redis/releases

下载最新版本的 `Redis-x64-x.x.x.zip`

### 步骤 2：解压并运行

```powershell
# 解压到某个目录，例如 C:\Redis

# 进入目录
cd C:\Redis

# 启动 Redis
.\redis-server.exe

# 或在后台运行
Start-Process redis-server.exe -WindowStyle Hidden
```

### 步骤 3：（可选）添加到系统路径

1. 右键"此电脑" → 属性 → 高级系统设置
2. 环境变量 → 系统变量 → Path → 编辑
3. 添加 Redis 目录路径（如 `C:\Redis`）
4. 重新打开 PowerShell

现在可以直接运行：
```powershell
redis-server
```

---

## 推荐选择

根据你的情况，我推荐：

### ⭐ 最快速：方法 2 (Docker alpine 镜像)
```powershell
docker pull redis:7-alpine
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

### ⭐ 最简单：方法 4 (WSL + Redis)
```powershell
wsl sudo apt install redis-server -y
wsl redis-server
```

### ⭐ 最原生：方法 3 (Memurai)
下载安装 Memurai，自动运行

---

## 验证 Redis 是否正常工作

无论使用哪种方法，启动后都可以用以下方式验证：

### 方式 1：使用 PowerShell 测试连接

```powershell
# 安装 redis-cli 工具（如果使用 Docker）
docker exec -it redis redis-cli ping
# 应该返回：PONG

# 或者使用 Telnet 测试
Test-NetConnection localhost -Port 6379
```

### 方式 2：启动后端服务查看日志

```powershell
cd F:\Business_plat\backend
npm run dev
```

查看日志，应该看到：
```
✅ Redis 已连接 - 缓存功能已启用
```

如果看到：
```
⚠️  Redis 未连接 - 将在无缓存模式下运行
```

说明 Redis 未正常启动或连接失败。

---

## 常见问题

### Q: Docker 拉取镜像很慢怎么办？

A: 配置 Docker 国内镜像源：

1. Docker Desktop → Settings → Docker Engine
2. 添加以下配置：

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
```

3. Apply & Restart

### Q: WSL Redis 启动后终端关闭就停止了？

A: 使用服务模式：
```powershell
wsl sudo service redis-server start
```

### Q: 端口 6379 被占用？

A: 检查并关闭占用进程：
```powershell
# 查看占用进程
netstat -ano | findstr :6379

# 结束进程（替换 PID）
taskkill /PID <进程ID> /F
```

---

## 下一步

Redis 启动成功后，运行测试脚本：

```powershell
cd F:\Business_plat\backend
.\test_doeeet_api.ps1
```

或直接启动后端：

```powershell
npm run dev
```

---

**提示**：如果暂时无法配置 Redis，也可以先不用。后端会自动降级运行，只是没有缓存加速功能。

