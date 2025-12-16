# 后端 Dockerfile
# 多阶段构建，优化镜像大小

# 阶段1：构建阶段
FROM node:16-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY tsconfig.json ./

# 安装所有依赖（包括 devDependencies，用于构建）
RUN npm ci && npm cache clean --force

# 复制源代码
COPY src ./src
COPY config ./config

# 编译 TypeScript
RUN npm run build

# 阶段2：运行阶段
FROM node:16-alpine

WORKDIR /app

# 安装 Python（用于脚本）
RUN apk add --no-cache python3 py3-pip

# 复制 package 文件
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 从构建阶段复制编译后的文件
COPY --from=builder /app/dist ./dist

# 复制必要的配置文件
COPY config ./config
COPY scripts ./scripts

# 创建日志目录
RUN mkdir -p /app/logs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/index.js"]

