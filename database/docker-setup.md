# 使用Docker快速搭建PostgreSQL测试环境

## 前置条件
- 安装Docker Desktop for Windows

## 快速启动PostgreSQL

### 1. 启动PostgreSQL容器
```bash
# 拉取并启动PostgreSQL容器
docker run -d \
  --name business-plat-db \
  -e POSTGRES_DB=business_plat \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -p 5432:5432 \
  postgres:15

# Windows PowerShell版本
docker run -d --name business-plat-db -e POSTGRES_DB=business_plat -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 -p 5432:5432 postgres:15
```

### 2. 连接数据库
```bash
# 进入容器
docker exec -it business-plat-db psql -U admin -d business_plat

# 或者使用外部工具连接
# 主机: localhost
# 端口: 5432
# 数据库: business_plat
# 用户名: admin
# 密码: admin123
```

### 3. 执行测试脚本
```bash
# 在容器内执行
\i /path/to/core_schema_design.sql
\i /path/to/core_schema_initial_data.sql
```

### 4. 停止和清理
```bash
# 停止容器
docker stop business-plat-db

# 删除容器
docker rm business-plat-db
```
