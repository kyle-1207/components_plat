# 后端 Dockerfile（使用已有 dist，不在镜像内运行 TypeScript 编译）
FROM node:16-alpine

WORKDIR /app

# 安装 Python（用于脚本）
RUN apk add --no-cache python3 py3-pip

# 复制 package 文件
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 复制已经编译好的 dist（在开发环境中通过 tsc 生成，或仓库中已有）
COPY dist ./dist

# 复制必要的配置和脚本文件
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
