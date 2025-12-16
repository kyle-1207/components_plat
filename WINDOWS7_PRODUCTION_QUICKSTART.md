# Windows 7 生产环境快速部署指南

## 🎯 概述

本指南提供在 Windows 7 上快速部署生产环境的步骤摘要。详细说明请参考 [DOCKER_MIGRATION_GUIDE.md](./DOCKER_MIGRATION_GUIDE.md)。

---

## ⚡ 快速开始（5 步）

### 1. 安装 Docker Toolbox

```powershell
# 下载：https://github.com/docker/toolbox/releases
# 安装：DockerToolbox-19.03.1.exe
# 启动：双击 "Docker Quickstart Terminal"
```

### 2. 导入镜像

```powershell
# 解压
7z x business_plat_images.7z

# 导入（在 Docker Quickstart Terminal 中）
cd /c/Business_plat/docker_migration_package
docker load -i business_plat_images.tar
```

### 3. 准备数据目录

```powershell
# 在 Windows 中创建
mkdir C:\Business_plat\data\mongodb
mkdir C:\Business_plat\data\redis
mkdir C:\Business_plat\backend\logs
mkdir C:\Business_plat\backend\uploads
```

### 4. 恢复数据库（如果需要）

```powershell
# 在 Docker Quickstart Terminal 中
docker run -d --name temp_mongodb -v /c/Business_plat/data/mongodb:/data/db -p 27017:27017 mongo:5.0
sleep 15
docker run --rm --link temp_mongodb:mongo -v /c/Business_plat/docker_migration_package/mongodb_backup:/backup mongo:5.0 mongorestore --host=mongo:27017 --db=business_plat /backup/business_plat_backup/business_plat
docker stop temp_mongodb && docker rm temp_mongodb
```

### 5. 启动服务

```powershell
# 在 Docker Quickstart Terminal 中
cd /c/Business_plat/docker_migration_package
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🌐 访问地址

**重要：** Docker Toolbox 使用虚拟机 IP，不是 localhost！

```powershell
# 查看虚拟机 IP
docker-machine ip default
# 通常是：192.168.99.100

# 访问地址：
# 前端：http://192.168.99.100:3000
# 后端：http://192.168.99.100:3001
```

---

## 📋 常用命令

```powershell
# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 停止服务
docker-compose -f docker-compose.prod.yml stop

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 进入容器
docker exec -it business_plat_backend sh
```

---

## ⚠️ 常见问题

### Docker Toolbox 无法启动
- 检查 VirtualBox 是否安装
- 检查 BIOS 虚拟化是否启用
- 重启电脑

### 无法访问服务
- 使用虚拟机 IP（192.168.99.100），不是 localhost
- 检查防火墙设置
- 检查端口映射：`docker ps`

### 数据库连接失败
- 检查 MongoDB 容器是否运行：`docker ps`
- 查看日志：`docker logs business_plat_mongodb`
- 检查环境变量：`docker exec business_plat_backend env | grep MONGODB`

---

## 📚 详细文档

- **完整指南**：[DOCKER_MIGRATION_GUIDE.md](./DOCKER_MIGRATION_GUIDE.md)
- **迁移总览**：[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)
- **检查清单**：[MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)

---

**提示**：遇到问题先查看日志：`docker-compose -f docker-compose.prod.yml logs`

