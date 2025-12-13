import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Redis配置
 */
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  keyPrefix: 'doeet:',  // 统一Key前缀
  retryStrategy: (times: number) => {
    // 限制重连次数，避免无限重试
    if (times > 10) {
      console.log('⚠️  Redis 重连次数过多，停止重试');
      return null; // 停止重连
    }
    const delay = Math.min(times * 1000, 5000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: false,  // 禁用离线队列，避免内存堆积
  lazyConnect: true,  // 延迟连接，不阻塞启动
};

/**
 * 创建Redis客户端实例
 */
export function createRedisClient(): Redis {
  const client = new Redis(redisConfig);
  let isConnected = false;
  let errorCount = 0;
  const MAX_ERROR_LOG = 3; // 最多显示3次错误

  client.on('connect', () => {
    console.log('✅ Redis连接成功');
    isConnected = true;
    errorCount = 0; // 重置错误计数
  });

  client.on('ready', () => {
    console.log('✅ Redis就绪，缓存功能已启用');
    isConnected = true;
  });

  client.on('error', (error) => {
    errorCount++;
    if (errorCount <= MAX_ERROR_LOG) {
      console.error('❌ Redis连接错误:', error.message);
      if (errorCount === MAX_ERROR_LOG) {
        console.log('⚠️  Redis 不可用，应用将在无缓存模式下继续运行');
        console.log('💡 提示：如需启用缓存功能，请安装并启动 Redis 服务');
      }
    }
    isConnected = false;
  });

  client.on('close', () => {
    if (isConnected) {
      console.log('⚠️  Redis连接已关闭');
      isConnected = false;
    }
  });

  client.on('reconnecting', (delay: number) => {
    if (errorCount <= MAX_ERROR_LOG) {
      console.log(`🔄 Redis重新连接中... (${delay}ms后重试)`);
    }
  });

  // 尝试连接（不阻塞启动）
  client.connect().catch((err) => {
    console.log('⚠️  Redis 暂时不可用，应用将在无缓存模式下运行');
  });

  return client;
}

/**
 * 全局Redis客户端单例
 */
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

/**
 * 关闭Redis连接
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('✅ Redis连接已关闭');
  }
}

