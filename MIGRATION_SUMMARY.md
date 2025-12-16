# Docker 容器化迁移工作总览

## 📋 迁移任务概览

将项目从在线环境迁移到**没有互联网的 Windows 7 系统**，使用 **Docker 容器化方式**。

**优势：**
- ✅ **最简单**：一次打包，到处运行
- ✅ **包含所有依赖**：无需单独安装 Node.js、Python 等
- ✅ **环境一致**：减少配置问题
- ✅ **生产环境优化**：自动重启、资源限制、日志管理
- 📦 **文件大小**：~1-3 GB（镜像）+ 数据库备份

---

## 🐳 Docker 容器化迁移（推荐）

### 快速开始

**准备阶段（有网络）：**
```powershell
# 1. 构建和打包
cd scripts
.\package_docker.ps1

# 2. 将 docker_package 目录复制到目标机器
```

**迁移阶段（离线）：**
```powershell
# 1. 导入镜像
docker load -i business_plat_images.tar

# 2. 启动服务
docker-compose up -d
```

**详细说明请参考：** [DOCKER_MIGRATION_GUIDE.md](./DOCKER_MIGRATION_GUIDE.md)

---

## 🎯 核心任务

### 1. Docker 镜像构建和打包（~1-3 GB）

**需要准备：**
- Docker Desktop（Windows 10+）或 Docker（Linux）
- 项目源代码
- MongoDB 数据库备份

**打包步骤：**
```powershell
# 1. 构建生产环境镜像
docker-compose -f docker-compose.prod.yml build

# 2. 使用打包脚本（自动完成所有步骤）
cd scripts
.\package_docker.ps1
```

**打包脚本会自动：**
- 构建后端和前端镜像
- 备份 MongoDB 数据库（如果运行中）
- 导出所有 Docker 镜像
- 压缩镜像文件

---

### 2. MongoDB 数据库备份（~8-20GB）

**重要：直接使用 MongoDB 数据库备份，而不是 CSV 文件！**

**数据库信息：**
- `business_plat` 数据库
- `components` 集合：241.78 MB，180万文档
- `parameters` 集合：6.04 GB，1.37亿文档
- 总索引大小：约 10.7 GB
- **总数据库大小：约 16-20 GB**

**备份方法：**
```powershell
# 方法1：使用备份脚本
cd backend/scripts
.\backup_mongodb.ps1 -Compress

# 方法2：如果 MongoDB 在容器中运行
docker exec business_plat_mongodb mongodump --db=business_plat --out=/backup/business_plat_backup
docker cp business_plat_mongodb:/backup ./mongodb_backup

# 方法3：手动备份（如果 MongoDB 不在容器中）
mongodump --db=business_plat --out=.\mongodb_backup\business_plat_backup
```

**注意事项：**
- 备份文件大小约 16-20 GB（未压缩）
- 压缩后可能减少到 8-12 GB
- 备份时间约 15-30 分钟
- 建议使用 7-Zip 压缩以获得更好的压缩率
- 确保文件完整性（计算 MD5/SHA256）

---

## 📦 完整打包清单

### 必需文件总览

| 类别 | 文件/目录 | 大小估算 | 说明 |
|------|----------|----------|------|
| **Docker 镜像** | | **~1-3 GB** | |
| Docker 镜像（压缩后） | business_plat_images.7z | ~800MB-1.5 GB | 所有服务镜像 |
| **配置文件** | | **~几 KB** | |
| docker-compose.prod.yml | docker-compose.prod.yml | ~几 KB | 生产环境配置 |
| **数据库备份** | | **~8-20GB** | |
| MongoDB 备份 | business_plat_backup.7z | ~8-20GB | 压缩后的数据库备份 |
| **总计** | | **~9-23 GB** | 取决于数据库大小 |

---

## 🚀 快速开始

### 步骤1：准备阶段（在有网络的机器上）

1. **安装 Docker**
   - Windows 10+: Docker Desktop
   - Linux: docker.io 或 docker-ce

2. **构建和打包**
   ```powershell
   # 使用打包脚本（推荐）
   cd scripts
   .\package_docker.ps1
   
   # 脚本会自动完成：
   # - 构建生产环境镜像
   # - 备份 MongoDB 数据库（如果运行中）
   # - 导出 Docker 镜像
   # - 压缩镜像文件
   ```

3. **准备迁移包**
   - 将 `docker_package` 目录复制到移动存储设备
   - 包含：镜像文件、配置文件、数据库备份

### 步骤2：迁移阶段（Windows 7 离线环境）

1. **安装 Docker Toolbox**
   - 下载：https://github.com/docker/toolbox/releases
   - 安装并启动 Docker Quickstart Terminal

2. **导入镜像**
   ```powershell
   # 解压镜像文件
   7z x business_plat_images.7z
   
   # 在 Docker Quickstart Terminal 中导入
   docker load -i business_plat_images.tar
   ```

3. **恢复数据库**
   ```powershell
   # 启动临时 MongoDB 并恢复数据
   docker run -d --name temp_mongodb -v /c/Business_plat/data/mongodb:/data/db -p 27017:27017 mongo:5.0
   sleep 15
   docker run --rm --link temp_mongodb:mongo -v /c/Business_plat/docker_migration_package/mongodb_backup:/backup mongo:5.0 mongorestore --host=mongo:27017 --db=business_plat /backup/business_plat_backup/business_plat
   docker stop temp_mongodb && docker rm temp_mongodb
   ```

4. **启动生产环境服务**
   ```powershell
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. **验证服务**
   ```powershell
   # 查看服务状态
   docker-compose -f docker-compose.prod.yml ps
   
   # 访问服务（使用虚拟机 IP，通常是 192.168.99.100）
   # 前端：http://192.168.99.100:3000
   # 后端：http://192.168.99.100:3001
   ```

---

## 📚 相关文档

- **[DOCKER_MIGRATION_GUIDE.md](./DOCKER_MIGRATION_GUIDE.md)** - Docker 容器化迁移完整指南（详细版）
- **[WINDOWS7_PRODUCTION_QUICKSTART.md](./WINDOWS7_PRODUCTION_QUICKSTART.md)** - Windows 7 快速部署指南
- **[MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)** - 迁移检查清单
- **[scripts/package_docker.ps1](./scripts/package_docker.ps1)** - Docker 打包脚本（Windows）
- **[scripts/package_docker.sh](./scripts/package_docker.sh)** - Docker 打包脚本（Linux/Mac）
- **[backend/scripts/backup_mongodb.ps1](./backend/scripts/backup_mongodb.ps1)** - MongoDB 备份脚本

---

## ⚠️ 重要提醒

### Windows 7 上的 Docker

1. **Docker Toolbox**: Windows 7 必须使用 Docker Toolbox（不支持 Docker Desktop）
2. **系统要求**: 
   - Windows 7 SP1 或更高
   - 至少 4GB RAM（推荐 8GB+）
   - 启用虚拟化（VT-x/AMD-V）
3. **网络访问**: Docker Toolbox 使用虚拟机 IP（通常是 192.168.99.100），不是 localhost

### 数据备份和传输

- MongoDB 备份文件较大（~8-20GB）
- 建议使用移动硬盘或网络共享传输
- 压缩后可能减少到 8-12 GB
- 确保文件完整性（MD5/SHA256 校验）

### 生产环境特性

- 自动重启：容器异常退出时自动重启
- 资源限制：内存和 CPU 限制，防止资源耗尽
- 日志管理：自动轮转，限制日志大小
- 健康检查：自动检测服务状态

---

## ✅ 验证清单

迁移完成后，验证以下项目：

- [ ] Docker Toolbox 安装成功并运行
- [ ] Docker 镜像导入成功
- [ ] MongoDB 数据库恢复成功
- [ ] 所有容器正常运行（`docker-compose ps`）
- [ ] 前端可以访问（http://192.168.99.100:3000）
- [ ] 后端 API 可以访问（http://192.168.99.100:3001）
- [ ] MongoDB 连接正常
- [ ] Redis 连接正常

---

**最后更新**: 2025-01-XX  
**版本**: 1.0

