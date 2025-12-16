# Docker 容器化迁移检查清单

## 📋 快速检查清单

### 阶段1：准备工作（在有网络的机器上）

#### Docker 环境准备
- [ ] 安装 Docker Desktop（Windows 10+）或 Docker（Linux）
- [ ] 验证 Docker 安装：`docker --version`
- [ ] 验证 docker-compose：`docker-compose --version`

#### Docker 镜像构建
- [ ] 构建后端生产镜像：`docker-compose -f docker-compose.prod.yml build backend`
- [ ] 构建前端生产镜像：`docker-compose -f docker-compose.prod.yml build frontend`
- [ ] 验证镜像构建成功：`docker images`

#### MongoDB 数据库备份
- [ ] 备份 business_plat 数据库（使用 mongodump 或容器内备份）
- [ ] 压缩备份文件（可选，但推荐）
- [ ] 验证备份完整性

#### Docker 镜像导出
- [ ] 导出所有 Docker 镜像：`docker save ... -o business_plat_images.tar`
- [ ] 压缩镜像文件（使用 7z 或 gzip）
- [ ] 验证镜像文件完整性

#### 验证文件
- [ ] 计算所有文件的 MD5 或 SHA256 校验和
- [ ] 记录文件大小和路径

---

### 阶段2：Windows 7 环境准备

#### 系统要求检查
- [ ] Windows 7 SP1 已安装
- [ ] 系统更新已安装
- [ ] BIOS 虚拟化已启用（VT-x/AMD-V）
- [ ] 至少 4GB RAM（推荐 8GB+）
- [ ] 至少 20GB 可用磁盘空间

#### 安装 Docker Toolbox
- [ ] 下载 Docker Toolbox：https://github.com/docker/toolbox/releases
- [ ] 安装 Docker Toolbox（包含 VirtualBox）
- [ ] 启动 Docker Quickstart Terminal
- [ ] 验证 Docker 安装：`docker --version`
- [ ] 验证 docker-compose：`docker-compose --version`
- [ ] 记录虚拟机 IP：`docker-machine ip default`（通常是 192.168.99.100）

#### 验证安装
- [ ] Docker 虚拟机运行正常：`docker-machine ls`
- [ ] Docker 命令可用：`docker ps`
- [ ] 网络连接正常：`docker-machine ssh default ping -c 1 8.8.8.8`

---

### 阶段3：Docker 镜像和文件部署

#### 文件传输
- [ ] 传输 Docker 镜像文件到 Windows 7（business_plat_images.7z）
- [ ] 传输 docker-compose.prod.yml 配置文件
- [ ] 传输 MongoDB 数据库备份（mongodb_backup/）
- [ ] 验证文件完整性

#### 镜像导入
- [ ] 解压 Docker 镜像文件：`7z x business_plat_images.7z`
- [ ] 在 Docker Quickstart Terminal 中导入镜像：`docker load -i business_plat_images.tar`
- [ ] 验证镜像导入：`docker images`
- [ ] 确认所有镜像都存在（backend, frontend, mongo, redis, nginx, node）

#### 数据目录准备
- [ ] 创建 MongoDB 数据目录：`mkdir C:\Business_plat\data\mongodb`
- [ ] 创建 Redis 数据目录：`mkdir C:\Business_plat\data\redis`
- [ ] 创建日志目录：`mkdir C:\Business_plat\backend\logs`
- [ ] 创建上传目录：`mkdir C:\Business_plat\backend\uploads`

---

### 阶段4：数据库恢复

#### 数据库恢复准备
- [ ] 验证备份文件完整性（MD5/SHA256）
- [ ] 确认备份文件路径正确
- [ ] 检查磁盘空间（至少 40GB 可用）

#### 恢复数据库
- [ ] 启动临时 MongoDB 容器
- [ ] 等待 MongoDB 启动完成（约 15 秒）
- [ ] 运行 mongorestore 恢复数据库
- [ ] 监控恢复进度
- [ ] 验证恢复结果：`docker exec temp_mongodb mongosh --eval "use business_plat; db.components.countDocuments()"`
- [ ] 停止并删除临时容器

---

### 阶段5：服务启动和测试

#### 启动生产环境服务
- [ ] 在 Docker Quickstart Terminal 中切换到项目目录
- [ ] 启动所有服务：`docker-compose -f docker-compose.prod.yml up -d`
- [ ] 查看服务状态：`docker-compose -f docker-compose.prod.yml ps`
- [ ] 确认所有服务都是 "Up" 状态
- [ ] 查看服务日志：`docker-compose -f docker-compose.prod.yml logs -f`

#### 功能测试
- [ ] 获取虚拟机 IP：`docker-machine ip default`
- [ ] 测试后端健康检查：`curl http://192.168.99.100:3001/health`（或浏览器访问）
- [ ] 测试前端访问：浏览器打开 `http://192.168.99.100:3000`
- [ ] 测试 MongoDB 连接：`docker exec business_plat_mongodb mongosh --eval "db.version()"`
- [ ] 测试 Redis 连接：`docker exec business_plat_redis redis-cli ping`（应返回 PONG）
- [ ] 测试 API 接口功能

---

## 🚨 常见问题快速解决

### Node.js 相关问题
- **问题**：`npm install` 失败
- **解决**：使用已打包的 node_modules，或使用 `npm install --offline`

### Python 相关问题
- **问题**：`ModuleNotFoundError`
- **解决**：检查 Python 路径，使用 `pip install --no-index --find-links ./python_packages 包名`

### MongoDB 相关问题
- **问题**：无法连接 MongoDB
- **解决**：检查服务是否启动，检查端口 27017 是否开放

### Redis 相关问题
- **问题**：无法连接 Redis
- **解决**：启动 Redis 服务，检查端口 6379 是否开放

### 数据导入问题
- **问题**：内存不足
- **解决**：减少批量大小，使用分阶段导入（`--components-only` 或 `--parameters-only`）

---

## 📊 文件大小参考

| 项目 | 大小 | 说明 |
|------|------|------|
| Node.js 安装包 | ~30MB | |
| Python 安装包 | ~30MB | |
| MongoDB 安装包 | ~200MB | |
| Redis | ~5MB | |
| Python 依赖包 | ~10MB | 所有 wheel 文件 |
| 后端 node_modules | ~200-500MB | 压缩后 |
| 前端 node_modules | ~100-300MB | 压缩后 |
| Docker 镜像（压缩后） | ~800MB-1.5 GB | 7z 压缩 |
| MongoDB 备份 | ~8-20GB | 取决于是否压缩 |
| **总计** | **~9-23 GB** | 取决于数据库大小 |

---

## ✅ 最终验证

迁移完成后，运行以下命令验证：

```powershell
# 1. 检查 Docker 环境
docker --version
docker-compose --version
docker-machine ip default

# 2. 检查容器状态
docker-compose -f docker-compose.prod.yml ps
docker ps

# 3. 检查服务健康
docker-compose -f docker-compose.prod.yml logs backend | Select-String "MongoDB 连接成功"
docker-compose -f docker-compose.prod.yml logs backend | Select-String "Redis 连接成功"

# 4. 测试 API（使用虚拟机 IP）
$vmIp = docker-machine ip default
curl http://$vmIp:3001/health

# 5. 检查数据库
docker exec business_plat_mongodb mongosh --eval "use business_plat; db.components.countDocuments()"
docker exec business_plat_redis redis-cli ping
```

---

**提示**：建议在迁移前先在一个测试环境验证所有步骤，确保流程正确。

