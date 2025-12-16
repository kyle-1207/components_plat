# 前端 Dockerfile
# 多阶段构建，使用 Nginx 提供静态文件服务

# 阶段1：构建阶段
FROM node:16-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./

# 安装依赖
RUN npm ci && npm cache clean --force

# 复制源代码
COPY src ./src
COPY public ./public
COPY index.html ./

# 设置生产环境变量
ENV NODE_ENV=production
ENV VITE_API_URL=http://localhost:3001

# 构建应用（生产模式）
RUN npm run build

# 阶段2：Nginx 服务阶段
FROM nginx:alpine

# 复制构建产物到 Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置（如果有）
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]

