/**
 * 缓存预热脚本
 * 
 * 用于在应用启动前或定时任务中预热缓存
 */

import mongoose from 'mongoose';
import { closeRedisClient } from '../config/redis';
import { cacheWarmupService } from '../services/CacheWarmupService';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_DOEET_URI || 'mongodb://localhost:27017/doeet';

async function main() {
  console.log('🔥 Redis缓存预热工具\n');
  console.log('='.repeat(50));

  try {
    // 连接MongoDB
    console.log('📦 连接MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB连接成功\n');

    // 执行预热
    await cacheWarmupService.warmup();

    console.log('\n' + '='.repeat(50));
    console.log('✅ 缓存预热完成！');

  } catch (error) {
    console.error('\n❌ 预热失败:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    await closeRedisClient();
    process.exit(0);
  }
}

main();

