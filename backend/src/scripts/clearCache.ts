/**
 * 缓存清除脚本
 * 
 * 用于清除Redis缓存
 */

import mongoose from 'mongoose';
import { closeRedisClient } from '../config/redis';
import { cacheWarmupService } from '../services/CacheWarmupService';
import { getCacheService } from '../services/CacheService';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_DOEET_URI || 'mongodb://localhost:27017/doeet';

async function showMenu() {
  console.log('\n🗑️  Redis缓存清除工具\n');
  console.log('='.repeat(50));
  console.log('请选择操作:');
  console.log('  1. 清除所有缓存');
  console.log('  2. 清除搜索缓存');
  console.log('  3. 清除元数据缓存');
  console.log('  4. 查看缓存统计');
  console.log('  5. 退出');
  console.log('='.repeat(50));
}

async function showStats() {
  const cacheService = getCacheService();
  const stats = await cacheService.getCacheStats();
  
  console.log('\n📊 当前缓存统计:');
  console.log(`  - 键数量: ${stats.keys}`);
  console.log(`  - 内存使用: ${stats.memory}`);
  console.log(`  - 命中率: ${stats.hitRate.toFixed(2)}%`);
  console.log(`  - 命中次数: ${stats.hits}`);
  console.log(`  - 未命中次数: ${stats.misses}`);
  
  // 列出缓存keys
  const searchKeys = await cacheService.getKeys('search:*');
  const metaKeys = await cacheService.getKeys('meta:*');
  const componentKeys = await cacheService.getKeys('component:*');
  
  console.log('\n🔑 缓存分类:');
  console.log(`  - 搜索缓存: ${searchKeys.length}个`);
  console.log(`  - 元数据缓存: ${metaKeys.length}个`);
  console.log(`  - 组件缓存: ${componentKeys.length}个`);
}

async function main() {
  try {
    // 连接MongoDB
    console.log('📦 连接数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功');

    // 检查命令行参数
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
      const action = args[0];
      
      switch (action) {
        case 'all':
          console.log('\n🗑️  清除所有缓存...');
          await cacheWarmupService.clearAllCache();
          break;
          
        case 'search':
          console.log('\n🗑️  清除搜索缓存...');
          await cacheWarmupService.clearSearchCache();
          break;
          
        case 'meta':
          console.log('\n🗑️  清除元数据缓存...');
          await cacheWarmupService.clearMetaCache();
          break;
          
        case 'stats':
          await showStats();
          break;
          
        default:
          console.log('\n❌ 未知操作');
          console.log('用法: npm run cache:clear [all|search|meta|stats]');
          break;
      }
    } else {
      // 交互式模式
      await showMenu();
      await showStats();
      
      console.log('\n提示: 使用参数快速执行操作');
      console.log('例如: npm run cache:clear all');
    }

    console.log('\n✅ 操作完成');

  } catch (error) {
    console.error('\n❌ 操作失败:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    await closeRedisClient();
    process.exit(0);
  }
}

main();

