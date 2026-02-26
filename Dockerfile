# 使用 Node.js 官方镜像
FROM node:20-slim

# 安装 SQLite 运行所需的库
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制 package.json 并安装依赖
COPY package*.json ./
RUN npm install

# 复制所有源代码
COPY . .

# 构建前端静态文件
RUN npm run build

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动服务器
CMD ["npm", "start"]
