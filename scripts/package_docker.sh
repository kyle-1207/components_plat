#!/bin/bash
# Docker 容器打包脚本（Linux/Mac）
# 用于将项目打包为 Docker 镜像以便离线迁移

set -e

OUTPUT_DIR="./docker_package"
SKIP_BUILD=false
SKIP_BACKUP=false
COMPRESS=true

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --output-dir)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --no-compress)
            COMPRESS=false
            shift
            ;;
        *)
            echo "未知参数: $1"
            exit 1
            ;;
    esac
done

echo "========================================"
echo "  Docker 容器打包脚本"
echo "========================================"
echo ""

# 检查 Docker 是否可用
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未找到！"
    echo ""
    echo "请先安装 Docker"
    exit 1
fi

echo "✓ 找到 Docker: $(which docker)"
echo "  Docker 版本:"
docker --version
echo ""

# 检查 docker-compose 是否可用
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "❌ docker-compose 未找到！"
    exit 1
fi

echo "✓ 使用: $DOCKER_COMPOSE_CMD"
echo ""

# 创建输出目录
if [ -d "$OUTPUT_DIR" ]; then
    echo "清理现有输出目录..."
    rm -rf "$OUTPUT_DIR"
fi
mkdir -p "$OUTPUT_DIR"
echo "输出目录: $OUTPUT_DIR"
echo ""

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# 1. 构建 Docker 镜像
if [ "$SKIP_BUILD" = false ]; then
    echo "1. 构建 Docker 镜像..."
    echo ""
    
    echo "  构建后端镜像..."
    $DOCKER_COMPOSE_CMD build backend
    
    echo "  构建前端镜像..."
    $DOCKER_COMPOSE_CMD build frontend
    
    echo "  ✓ 镜像构建完成"
    echo ""
fi

# 2. 备份 MongoDB 数据库
if [ "$SKIP_BACKUP" = false ]; then
    echo "2. 备份 MongoDB 数据库..."
    
    BACKUP_DIR="$OUTPUT_DIR/mongodb_backup"
    mkdir -p "$BACKUP_DIR"
    
    # 检查 MongoDB 是否运行
    if docker ps --format "{{.Names}}" | grep -q "business_plat_mongodb"; then
        echo "  检测到运行中的 MongoDB 容器，开始备份..."
        docker exec business_plat_mongodb mongodump --db=business_plat --out=/backup/business_plat_backup || true
        docker cp business_plat_mongodb:/backup/business_plat_backup "$BACKUP_DIR" || true
        echo "  ✓ 数据库备份完成"
    else
        echo "  ⚠ MongoDB 容器未运行，跳过备份"
        echo "  提示: 可以稍后手动备份或使用 mongodump"
    fi
    echo ""
fi

# 3. 导出 Docker 镜像
echo "3. 导出 Docker 镜像..."

IMAGES=(
    "business_plat_backend:latest"
    "business_plat_frontend:latest"
    "mongo:5.0"
    "redis:7-alpine"
    "nginx:alpine"
    "node:16-alpine"
)

# 检查并拉取缺失的镜像
MISSING_IMAGES=()
for image in "${IMAGES[@]}"; do
    if ! docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "^${image}$"; then
        MISSING_IMAGES+=("$image")
    fi
done

if [ ${#MISSING_IMAGES[@]} -gt 0 ]; then
    echo "  ⚠ 以下镜像不存在，将从 Docker Hub 拉取:"
    for image in "${MISSING_IMAGES[@]}"; do
        echo "    - $image"
        docker pull "$image"
    fi
    echo ""
fi

# 导出镜像
IMAGES_FILE="$OUTPUT_DIR/business_plat_images.tar"
echo "  导出镜像到: $IMAGES_FILE"
echo "  ⚠ 这可能需要一些时间，请耐心等待..."

START_TIME=$(date +%s)
docker save "${IMAGES[@]}" -o "$IMAGES_FILE"
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

if [ -f "$IMAGES_FILE" ]; then
    FILE_SIZE=$(du -h "$IMAGES_FILE" | cut -f1)
    echo "  ✓ 镜像导出完成"
    echo "    文件大小: $FILE_SIZE"
    echo "    耗时: ${DURATION}秒"
else
    echo "  ✗ 镜像导出失败"
    exit 1
fi
echo ""

# 4. 压缩镜像文件
if [ "$COMPRESS" = true ]; then
    echo "4. 压缩镜像文件..."
    
    if command -v gzip &> /dev/null; then
        echo "  使用 gzip 压缩..."
        gzip "$IMAGES_FILE"
        COMPRESSED_FILE="${IMAGES_FILE}.gz"
        
        if [ -f "$COMPRESSED_FILE" ]; then
            COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
            echo "  ✓ 压缩完成"
            echo "    压缩后大小: $COMPRESSED_SIZE"
        fi
    else
        echo "  ⚠ gzip 未找到，跳过压缩"
    fi
    echo ""
fi

# 5. 复制配置文件
echo "5. 复制配置文件..."

CONFIG_FILES=(
    "docker-compose.yml"
    ".dockerignore"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$OUTPUT_DIR/"
        echo "  ✓ $file"
    fi
done
echo ""

# 6. 生成迁移说明
echo "6. 生成迁移说明..."

README_FILE="$OUTPUT_DIR/README_MIGRATION.txt"
cat > "$README_FILE" << EOF
Docker 容器迁移说明
========================================

打包信息:
----------
打包时间: $(date '+%Y-%m-%d %H:%M:%S')
Docker 版本: $(docker --version)

文件说明:
----------
1. business_plat_images.tar(.gz) - Docker 镜像文件
2. docker-compose.yml - Docker Compose 配置文件
3. mongodb_backup/ - MongoDB 数据库备份（如果有）

迁移步骤:
----------
1. 在目标机器上安装 Docker

2. 导入 Docker 镜像:
   # 如果已压缩，先解压
   gunzip business_plat_images.tar.gz
   
   # 导入镜像
   docker load -i business_plat_images.tar

3. 准备数据目录:
   mkdir -p mongodb_data redis_data backend/logs backend/uploads

4. 恢复数据库（如果需要）:
   docker run -d --name temp_mongodb -v mongodb_data:/data/db mongo:5.0
   sleep 10
   docker run --rm --link temp_mongodb:mongo \\
     -v \$(pwd)/mongodb_backup:/backup \\
     mongo:5.0 mongorestore \\
     --host=mongo:27017 --db=business_plat \\
     /backup/business_plat_backup/business_plat
   docker stop temp_mongodb && docker rm temp_mongodb

5. 启动所有服务:
   docker-compose up -d

6. 验证服务:
   docker-compose ps
   docker-compose logs -f

访问地址:
----------
- 前端: http://localhost:3000
- 后端 API: http://localhost:3001
- MongoDB: localhost:27017
- Redis: localhost:6379

详细说明请参考: DOCKER_MIGRATION_GUIDE.md
EOF

echo "  ✓ 迁移说明已生成: $README_FILE"
echo ""

# 完成
echo "========================================"
echo "  打包完成！"
echo "========================================"
echo ""
echo "输出目录: $OUTPUT_DIR"
echo ""
echo "生成的文件:"
find "$OUTPUT_DIR" -type f -exec ls -lh {} \; | awk '{print "  - " $9 " (" $5 ")"}'
echo ""
echo "下一步:"
echo "  1. 将 $OUTPUT_DIR 目录复制到目标机器"
echo "  2. 在目标机器上按照 README_MIGRATION.txt 中的步骤操作"
echo ""

