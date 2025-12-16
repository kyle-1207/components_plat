# Docker 容器化生产环境迁移指南（Windows 7）

## 📋 概述

本指南详细说明如何在 **Windows 7 系统**上使用 Docker 容器化方式部署**生产环境**。使用 Docker 可以大大简化迁移过程，一次打包，到处运行。

**优势：**
- ✅ 一次打包，到处运行
- ✅ 包含所有依赖，无需单独安装 Node.js、Python 等
- ✅ 环境一致，减少配置问题
- ✅ 易于备份和恢复
- ✅ 生产环境优化配置

---

## 🎯 Windows 7 上的 Docker 支持

### 重要说明

**Windows 7 不支持 Docker Desktop**（需要 Windows 10+），必须使用 **Docker Toolbox**。

### Docker Toolbox 简介

- **基于 VirtualBox** 的 Docker 环境
- 在虚拟机中运行 Linux，然后在 Linux 中运行 Docker
- 完全支持 Docker 和 docker-compose
- 适合 Windows 7/8/8.1 系统

### 系统要求

- **操作系统**：Windows 7 SP1 或更高版本
- **内存**：至少 4GB RAM（推荐 8GB+）
- **CPU**：支持虚拟化的 64 位处理器
- **磁盘空间**：至少 20GB 可用空间
- **虚拟化**：BIOS 中启用虚拟化（VT-x/AMD-V）

---

## 📦 阶段1：准备和打包（在有网络的机器上）

### 步骤1：安装 Docker Desktop（准备机器）

**Windows 10/11：**
```powershell
# 1. 下载 Docker Desktop
# 访问：https://www.docker.com/products/docker-desktop
# 下载并安装 Docker Desktop for Windows

# 2. 验证安装
docker --version
docker-compose --version
```

**Linux（如果有 Linux 机器）：**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# CentOS/RHEL
sudo yum install docker docker-compose

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证
docker --version
docker-compose --version
```

### 步骤2：准备项目文件

```powershell
# 1. 进入项目目录
cd F:\Business_plat

# 2. 确保项目代码是最新的
git pull  # 如果有 Git

# 3. 检查必要文件是否存在
# - backend/Dockerfile
# - frontend/Dockerfile
# - docker-compose.prod.yml
```

### 步骤3：构建生产环境镜像

```powershell
# 在项目根目录执行

# 方法1：使用生产环境配置（推荐）
docker-compose -f docker-compose.prod.yml build

# 方法2：使用默认配置
docker-compose build

# 构建过程可能需要 10-30 分钟，取决于网络速度
```

**构建说明：**
- 后端镜像会编译 TypeScript 代码
- 前端镜像会构建生产版本的 React 应用
- 所有镜像都使用生产环境配置

**验证构建：**
```powershell
# 查看构建的镜像
docker images

# 应该看到以下镜像：
# - business_plat_backend:latest
# - business_plat_frontend:latest
```

### 步骤4：备份 MongoDB 数据库

**如果 MongoDB 正在运行（非容器）：**

```powershell
# 1. 使用 mongodump 备份
# 确保已安装 MongoDB Database Tools

# 创建备份目录
New-Item -ItemType Directory -Force -Path ".\mongodb_backup"

# 备份数据库
mongodump --uri="mongodb://127.0.0.1:27017/business_plat" --out=".\mongodb_backup\business_plat_backup"

# 验证备份
Get-ChildItem ".\mongodb_backup" -Recurse | Measure-Object -Property Length -Sum
```

**如果 MongoDB 在容器中运行：**

```powershell
# 启动 MongoDB 容器（如果未运行）
docker-compose -f docker-compose.prod.yml up -d mongodb

# 等待 MongoDB 启动
Start-Sleep -Seconds 15

# 备份数据库
docker exec business_plat_mongodb mongodump --db=business_plat --out=/backup/business_plat_backup

# 复制备份文件到主机
docker cp business_plat_mongodb:/backup/business_plat_backup .\mongodb_backup\

# 停止容器（可选）
docker-compose -f docker-compose.prod.yml stop mongodb
```

### 步骤5：导出 Docker 镜像

```powershell
# 1. 确保所有需要的镜像都已构建或拉取
# 检查镜像是否存在
docker images | Select-String "business_plat_backend|business_plat_frontend|mongo|redis|nginx|node"

# 2. 如果缺少基础镜像，先拉取
docker pull mongo:5.0
docker pull redis:7-alpine
docker pull nginx:alpine
docker pull node:16-alpine

# 3. 导出所有镜像
$images = @(
    "business_plat_backend:latest",
    "business_plat_frontend:latest",
    "mongo:5.0",
    "redis:7-alpine",
    "nginx:alpine",
    "node:16-alpine"
)

docker save $images -o business_plat_images.tar

# 4. 验证导出文件
Get-Item business_plat_images.tar | Select-Object Name, Length
# 文件大小应该在 2-3 GB 左右
```

### 步骤6：压缩镜像文件（强烈推荐）

```powershell
# 使用 7-Zip 压缩（压缩率更高）
# 如果没有 7-Zip，可以从 https://www.7-zip.org/ 下载

7z a -t7z -mx=9 business_plat_images.7z business_plat_images.tar

# 验证压缩文件
Get-Item business_plat_images.7z | Select-Object Name, Length
# 压缩后大小应该在 800MB-1.5 GB 左右

# 删除未压缩的文件以节省空间
Remove-Item business_plat_images.tar
```

### 步骤7：准备迁移包

```powershell
# 创建迁移包目录
$migrationPackage = ".\docker_migration_package"
New-Item -ItemType Directory -Force -Path $migrationPackage

# 复制必要文件
Copy-Item "business_plat_images.7z" -Destination $migrationPackage\
Copy-Item "docker-compose.prod.yml" -Destination $migrationPackage\
Copy-Item "mongodb_backup" -Destination $migrationPackage\ -Recurse -Force

# 创建 .env 示例文件（如果需要自定义配置）
@"
# 生产环境配置
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://mongodb:27017/business_plat
MONGODB_DOEET_URI=mongodb://mongodb:27017/doeet
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000
"@ | Out-File -FilePath "$migrationPackage\.env.example" -Encoding UTF8

# 创建迁移说明
@"
Docker 生产环境迁移包
========================================

包含文件：
1. business_plat_images.7z - Docker 镜像文件（压缩）
2. docker-compose.prod.yml - 生产环境配置
3. mongodb_backup/ - MongoDB 数据库备份
4. .env.example - 环境变量示例

迁移步骤请参考：DOCKER_MIGRATION_GUIDE.md
"@ | Out-File -FilePath "$migrationPackage\README.txt" -Encoding UTF8

Write-Host "迁移包已准备完成：$migrationPackage" -ForegroundColor Green
```

---

## 🚀 阶段2：在 Windows 7 上部署（离线环境）

### 步骤1：安装 Docker Toolbox

#### 1.1 下载 Docker Toolbox

```powershell
# 下载地址：https://github.com/docker/toolbox/releases
# 推荐版本：DockerToolbox-19.03.1.exe（最后一个稳定版本）

# 文件大小：~200MB
# 下载后保存到本地
```

#### 1.2 安装 Docker Toolbox

```powershell
# 1. 双击运行 DockerToolbox-19.03.1.exe

# 2. 安装向导步骤：
#    - 选择安装路径（默认：C:\Program Files\Docker Toolbox）
#    - 选择组件（全部勾选）：
#      ✓ Docker binaries
#      ✓ VirtualBox
#      ✓ Git for Windows
#      ✓ Kitematic (可选)
#    - 点击"安装"

# 3. 安装完成后，会提示安装 VirtualBox（如果未安装）
#    - 按照提示安装 VirtualBox

# 4. 安装完成后，桌面会出现以下图标：
#    - Docker Quickstart Terminal
```

#### 1.3 启动 Docker Toolbox

```powershell
# 1. 双击桌面上的 "Docker Quickstart Terminal" 图标

# 2. 首次启动会：
#    - 创建默认的 Docker 虚拟机（default）
#    - 配置 Docker 环境
#    - 这个过程可能需要几分钟

# 3. 启动成功后，会看到 Docker 鲸鱼图标和提示信息：
#    "Docker is configured to use the default machine with IP 192.168.99.100"
#    注意这个 IP 地址，后续可能需要用到

# 4. 验证 Docker 安装
docker --version
docker-compose --version
docker-machine ls
```

**常见问题：**

**问题1：VirtualBox 未安装**
- 解决方案：从 https://www.virtualbox.org/ 下载并安装 VirtualBox

**问题2：虚拟化未启用**
- 解决方案：
  1. 重启电脑
  2. 进入 BIOS 设置（通常是 F2、F10 或 Del）
  3. 找到虚拟化选项（Virtualization Technology、VT-x、AMD-V）
  4. 启用虚拟化
  5. 保存并退出

**问题3：Docker 虚拟机创建失败**
- 解决方案：
  ```powershell
  # 手动创建虚拟机
  docker-machine create --driver virtualbox default
  
  # 配置环境变量
  docker-machine env default | Invoke-Expression
  ```

### 步骤2：传输迁移包到 Windows 7

```powershell
# 方法1：使用移动硬盘/U盘
# 1. 将 docker_migration_package 目录复制到移动存储设备
# 2. 在 Windows 7 机器上复制到本地目录，例如：
#    C:\Business_plat\docker_migration_package

# 方法2：使用网络共享
# 1. 在 Windows 7 上映射网络驱动器
# 2. 复制文件

# 方法3：使用 FTP/SCP（如果有网络访问）
```

### 步骤3：解压和准备文件

```powershell
# 1. 进入迁移包目录
cd C:\Business_plat\docker_migration_package

# 2. 解压 Docker 镜像文件
# 确保已安装 7-Zip（如果没有，从 https://www.7-zip.org/ 下载）
7z x business_plat_images.7z

# 3. 验证文件
Get-Item business_plat_images.tar | Select-Object Name, Length
# 应该看到 2-3 GB 的文件

# 4. 创建数据目录
New-Item -ItemType Directory -Force -Path "C:\Business_plat\data\mongodb"
New-Item -ItemType Directory -Force -Path "C:\Business_plat\data\redis"
New-Item -ItemType Directory -Force -Path "C:\Business_plat\backend\logs"
New-Item -ItemType Directory -Force -Path "C:\Business_plat\backend\uploads"
```

### 步骤4：导入 Docker 镜像

```powershell
# 1. 确保 Docker Toolbox 已启动
#    打开 Docker Quickstart Terminal

# 2. 切换到迁移包目录
cd /c/Business_plat/docker_migration_package
# 注意：在 Docker Toolbox 中使用 Linux 路径格式

# 3. 导入镜像（这可能需要 5-10 分钟）
docker load -i business_plat_images.tar

# 4. 验证导入
docker images

# 应该看到以下镜像：
# REPOSITORY                  TAG       IMAGE ID       CREATED         SIZE
# business_plat_backend       latest    ...            ...             ...
# business_plat_frontend      latest    ...            ...             ...
# mongo                       5.0       ...            ...             ...
# redis                       7-alpine  ...            ...             ...
# nginx                       alpine    ...            ...             ...
# node                        16-alpine ...            ...             ...
```

**如果导入失败：**

```powershell
# 检查磁盘空间
docker system df

# 清理未使用的镜像和容器
docker system prune -a

# 重新导入
docker load -i business_plat_images.tar
```

### 步骤5：配置环境变量（可选）

```powershell
# 1. 复制示例文件
Copy-Item .env.example .env

# 2. 编辑 .env 文件（如果需要自定义配置）
notepad .env

# 3. 主要配置项：
#    - MONGODB_URI: MongoDB 连接字符串
#    - REDIS_HOST: Redis 主机地址
#    - PORT: 后端端口（默认 3001）
#    - CORS_ORIGIN: 前端地址（默认 http://localhost:3000）
```

### 步骤6：恢复 MongoDB 数据库

```powershell
# 1. 修改 docker-compose.prod.yml，确保数据目录映射正确
#    检查 volumes 部分的路径映射

# 2. 启动临时 MongoDB 容器
docker run -d --name temp_mongodb `
  -v /c/Business_plat/data/mongodb:/data/db `
  -p 27017:27017 `
  mongo:5.0

# 3. 等待 MongoDB 启动（约 10-15 秒）
Start-Sleep -Seconds 15

# 4. 验证 MongoDB 是否运行
docker ps | Select-String "temp_mongodb"

# 5. 恢复数据库
docker run --rm --link temp_mongodb:mongo `
  -v /c/Business_plat/docker_migration_package/mongodb_backup:/backup `
  mongo:5.0 mongorestore `
  --host=mongo:27017 `
  --db=business_plat `
  /backup/business_plat_backup/business_plat

# 6. 验证恢复（可选）
docker exec temp_mongodb mongosh --eval "use business_plat; db.components.countDocuments()"

# 7. 停止临时容器
docker stop temp_mongodb
docker rm temp_mongodb
```

**注意：** 在 Docker Toolbox 中，Windows 路径需要使用 `/c/` 格式。

### 步骤7：启动生产环境服务

```powershell
# 1. 确保在迁移包目录
cd C:\Business_plat\docker_migration_package

# 2. 使用生产环境配置启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 3. 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 应该看到所有服务都是 "Up" 状态：
# NAME                      STATUS
# business_plat_backend      Up
# business_plat_frontend    Up
# business_plat_mongodb      Up
# business_plat_redis        Up

# 4. 查看日志（确认服务正常启动）
docker-compose -f docker-compose.prod.yml logs -f

# 按 Ctrl+C 退出日志查看
```

### 步骤8：验证服务运行

```powershell
# 1. 检查容器状态
docker ps

# 2. 检查后端健康状态
# 注意：Docker Toolbox 的 IP 通常是 192.168.99.100
curl http://192.168.99.100:3001/health
# 或使用浏览器访问：http://192.168.99.100:3001/health

# 3. 检查前端
# 浏览器访问：http://192.168.99.100:3000

# 4. 检查 MongoDB
docker exec business_plat_mongodb mongosh --eval "db.version()"

# 5. 检查 Redis
docker exec business_plat_redis redis-cli ping
# 应该返回：PONG
```

**重要：** Docker Toolbox 使用虚拟机 IP（通常是 192.168.99.100），而不是 localhost。

---

## 🔧 生产环境配置说明

### docker-compose.prod.yml 配置详解

#### 服务配置

**MongoDB：**
- `restart: always` - 自动重启
- `wiredTigerCacheSizeGB: 2` - 缓存大小（根据内存调整）
- 数据持久化到 `./data/mongodb`

**Redis：**
- `appendonly yes` - 启用持久化
- `maxmemory 512mb` - 最大内存
- `maxmemory-policy allkeys-lru` - 内存满时的策略

**后端：**
- `NODE_ENV=production` - 生产环境
- 日志限制：最大 10MB，保留 3 个文件
- 资源限制：最大 2GB 内存，2 CPU

**前端：**
- 使用 Nginx 提供静态文件服务
- 已构建的生产版本

### 端口映射

默认端口：
- **前端**：3000 → 80（容器内）
- **后端**：3001 → 3001（容器内）
- **MongoDB**：27017 → 27017（容器内）
- **Redis**：6379 → 6379（容器内）

**修改端口：**
编辑 `docker-compose.prod.yml` 中的 `ports` 部分：
```yaml
ports:
  - "8080:80"  # 将前端改为 8080 端口
```

### 数据持久化

所有数据都持久化到本地目录：
- MongoDB：`./data/mongodb`
- Redis：`./data/redis`
- 日志：`./backend/logs`
- 上传文件：`./backend/uploads`

**备份数据：**
```powershell
# 备份 MongoDB 数据
docker exec business_plat_mongodb mongodump --db=business_plat --out=/backup/backup_$(Get-Date -Format 'yyyyMMdd')

# 复制备份文件
docker cp business_plat_mongodb:/backup ./mongodb_backup
```

---

## 📊 性能优化

### Docker Toolbox 性能优化

1. **分配更多内存给虚拟机**
   ```powershell
   # 查看当前配置
   docker-machine inspect default

   # 修改 VirtualBox 虚拟机内存（通过 VirtualBox Manager）
   # 推荐：至少 4GB，最好 8GB
   ```

2. **使用 SSD 存储**
   - 将数据目录放在 SSD 上
   - 修改 `docker-compose.prod.yml` 中的 volume 路径

3. **调整 MongoDB 缓存**
   ```yaml
   # 在 docker-compose.prod.yml 中
   command: mongod --wiredTigerCacheSizeGB=4  # 根据内存调整
   ```

4. **限制日志大小**
   - 已在配置中设置日志轮转
   - 定期清理旧日志

### 系统资源监控

```powershell
# 查看容器资源使用
docker stats

# 查看磁盘使用
docker system df

# 清理未使用的资源
docker system prune -a
```

---

## 🐛 故障排除

### 问题1：Docker Toolbox 无法启动

**症状：** 双击 Docker Quickstart Terminal 无响应或报错

**解决方案：**
1. **检查 VirtualBox 是否安装**
   ```powershell
   # 打开 VirtualBox Manager，检查是否能正常启动
   ```

2. **检查虚拟化是否启用**
   - 重启电脑，进入 BIOS
   - 启用虚拟化（VT-x/AMD-V）

3. **手动创建虚拟机**
   ```powershell
   docker-machine create --driver virtualbox default
   docker-machine env default | Invoke-Expression
   ```

4. **检查防火墙**
   - 确保防火墙允许 VirtualBox 和 Docker

### 问题2：容器无法启动

**症状：** `docker-compose up -d` 后容器立即退出

**解决方案：**
```powershell
# 1. 查看容器日志
docker-compose -f docker-compose.prod.yml logs [service_name]

# 2. 检查端口是否被占用
netstat -ano | findstr :3001
netstat -ano | findstr :27017

# 3. 检查数据目录权限
# 确保数据目录存在且有写权限

# 4. 检查磁盘空间
docker system df
```

### 问题3：无法访问服务

**症状：** 浏览器无法访问 http://192.168.99.100:3000

**解决方案：**
1. **确认 Docker Toolbox IP**
   ```powershell
   docker-machine ip default
   # 通常是 192.168.99.100
   ```

2. **检查端口映射**
   ```powershell
   docker ps
   # 查看 PORTS 列，确认端口映射正确
   ```

3. **检查防火墙**
   - Windows 防火墙可能阻止访问
   - 添加端口例外：3000, 3001, 27017, 6379

4. **测试连接**
   ```powershell
   # 在 Docker Toolbox 终端中测试
   curl http://localhost:3001/health
   ```

### 问题4：数据库连接失败

**症状：** 后端日志显示 MongoDB 连接错误

**解决方案：**
```powershell
# 1. 检查 MongoDB 容器是否运行
docker ps | Select-String "mongodb"

# 2. 检查 MongoDB 日志
docker logs business_plat_mongodb

# 3. 测试 MongoDB 连接
docker exec business_plat_mongodb mongosh --eval "db.version()"

# 4. 检查网络连接
docker exec business_plat_backend ping mongodb

# 5. 检查环境变量
docker exec business_plat_backend env | Select-String "MONGODB"
```

### 问题5：内存不足

**症状：** 容器频繁重启或系统卡顿

**解决方案：**
1. **减少资源限制**
   ```yaml
   # 在 docker-compose.prod.yml 中减少内存限制
   deploy:
     resources:
       limits:
         memory: 1G  # 减少内存限制
   ```

2. **减少 MongoDB 缓存**
   ```yaml
   command: mongod --wiredTigerCacheSizeGB=1
   ```

3. **关闭不必要的服务**
   - 如果不需要 Redis，可以注释掉 Redis 服务

### 问题6：数据丢失

**症状：** 重启后数据消失

**解决方案：**
1. **检查数据卷映射**
   ```powershell
   docker inspect business_plat_mongodb | Select-String "Mounts"
   # 确认数据目录正确映射
   ```

2. **检查数据目录**
   ```powershell
   # 检查本地数据目录
   Get-ChildItem C:\Business_plat\data\mongodb -Recurse
   ```

3. **恢复备份**
   ```powershell
   # 按照步骤6重新恢复数据库
   ```

---

## 📚 常用命令参考

### Docker Compose 命令

```powershell
# 启动所有服务（后台运行）
docker-compose -f docker-compose.prod.yml up -d

# 停止所有服务
docker-compose -f docker-compose.prod.yml stop

# 停止并删除容器
docker-compose -f docker-compose.prod.yml down

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml logs -f backend  # 只看后端日志

# 重启服务
docker-compose -f docker-compose.prod.yml restart backend

# 进入容器
docker-compose -f docker-compose.prod.yml exec backend sh
```

### Docker 命令

```powershell
# 查看所有容器
docker ps -a

# 查看容器日志
docker logs business_plat_backend
docker logs -f business_plat_backend  # 实时日志

# 进入容器
docker exec -it business_plat_backend sh

# 查看资源使用
docker stats

# 清理未使用的资源
docker system prune -a

# 查看镜像
docker images

# 删除容器
docker rm business_plat_backend

# 删除镜像
docker rmi business_plat_backend:latest
```

### Docker Machine 命令（Docker Toolbox）

```powershell
# 查看虚拟机状态
docker-machine ls

# 查看虚拟机 IP
docker-machine ip default

# 启动虚拟机
docker-machine start default

# 停止虚拟机
docker-machine stop default

# 重启虚拟机
docker-machine restart default

# 查看虚拟机配置
docker-machine inspect default
```

---

## 🔄 维护和更新

### 日常维护

1. **定期备份**
   ```powershell
   # 每天备份数据库
   docker exec business_plat_mongodb mongodump --db=business_plat --out=/backup/backup_$(Get-Date -Format 'yyyyMMdd')
   docker cp business_plat_mongodb:/backup C:\Business_plat\backups\
   ```

2. **清理日志**
   ```powershell
   # 日志会自动轮转，但可以手动清理
   Get-ChildItem C:\Business_plat\backend\logs -Filter "*.log" | Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-7)} | Remove-Item
   ```

3. **监控资源**
   ```powershell
   # 定期检查资源使用
   docker stats --no-stream
   ```

### 更新应用

```powershell
# 1. 在有网络的机器上构建新镜像
docker-compose -f docker-compose.prod.yml build

# 2. 导出新镜像
docker save business_plat_backend:latest business_plat_frontend:latest -o new_images.tar

# 3. 传输到 Windows 7 机器

# 4. 导入新镜像
docker load -i new_images.tar

# 5. 重启服务（使用新镜像）
docker-compose -f docker-compose.prod.yml up -d --force-recreate backend frontend
```

---

## ✅ 完整检查清单

### 准备阶段（有网络）
- [ ] 安装 Docker Desktop（Windows 10+）或 Docker（Linux）
- [ ] 构建生产环境镜像
- [ ] 备份 MongoDB 数据库
- [ ] 导出 Docker 镜像
- [ ] 压缩镜像文件
- [ ] 准备迁移包

### 部署阶段（Windows 7）
- [ ] 下载并安装 Docker Toolbox
- [ ] 启动 Docker Toolbox
- [ ] 验证 Docker 安装
- [ ] 传输迁移包到 Windows 7
- [ ] 解压镜像文件
- [ ] 导入 Docker 镜像
- [ ] 创建数据目录
- [ ] 恢复 MongoDB 数据库
- [ ] 配置环境变量（如需要）
- [ ] 启动所有服务
- [ ] 验证服务运行
- [ ] 测试前端和后端访问

---

## 📞 获取帮助

如果遇到问题：

1. **查看日志**
   ```powershell
   docker-compose -f docker-compose.prod.yml logs
   ```

2. **检查容器状态**
   ```powershell
   docker-compose -f docker-compose.prod.yml ps
   ```

3. **查看系统资源**
   ```powershell
   docker stats
   ```

4. **参考文档**
   - Docker Toolbox 文档：https://docs.docker.com/toolbox/
   - Docker Compose 文档：https://docs.docker.com/compose/

---

**最后更新**: 2025-01-XX  
**版本**: 2.0（生产环境专用）
