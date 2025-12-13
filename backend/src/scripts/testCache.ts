/**
 * Redis缓存功能测试脚本
 * 
 * 测试内容：
 * 1. Redis连接测试
 * 2. 基础缓存操作测试
 * 3. 搜索缓存性能测试
 * 4. 缓存命中率测试
 */

import mongoose from 'mongoose';
import { getRedisClient, closeRedisClient } from '../config/redis';
import { getCacheService } from '../services/CacheService';
import { doeeetSearchService } from '../services/DoeeetSearchService';
import { cacheWarmupService } from '../services/CacheWarmupService';
import dotenv from 'dotenv';

dotenv.config();

// 连接MongoDB
const MONGODB_URI = process.env.MONGODB_DOEET_URI || 'mongodb://localhost:27017/doeet';

async function connectDB() {
  console.log('📦 连接MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ MongoDB连接成功');
}

async function disconnectDB() {
  await mongoose.disconnect();
  await closeRedisClient();
  console.log('✅ 数据库连接已关闭');
}

/**
 * 测试1: Redis连接测试
 */
async function testRedisConnection() {
  console.log('\n========== 测试1: Redis连接 ==========');
  
  const redis = getRedisClient();
  const cacheService = getCacheService();
  
  try {
    const isConnected = await cacheService.ping();
    
    if (isConnected) {
      console.log('✅ Redis连接成功');
      return true;
    } else {
      console.log('❌ Redis连接失败');
      return false;
    }
  } catch (error) {
    console.error('❌ Redis连接异常:', error);
    return false;
  }
}

/**
 * 测试2: 基础缓存操作
 */
async function testBasicCacheOperations() {
  console.log('\n========== 测试2: 基础缓存操作 ==========');
  
  const cacheService = getCacheService();
  const testKey = 'test:basic:key';
  const testData = {
    id: '123',
    name: 'Test Component',
    timestamp: Date.now()
  };

  try {
    // 测试 set
    console.log('📝 测试 set...');
    await cacheService.set(testKey, testData, 60);
    console.log('✅ set 成功');

    // 测试 get
    console.log('📖 测试 get...');
    const retrieved = await cacheService.get(testKey);
    if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
      console.log('✅ get 成功，数据一致');
    } else {
      console.log('❌ get 失败，数据不一致');
      return false;
    }

    // 测试 exists
    console.log('🔍 测试 exists...');
    const exists = await cacheService.exists(testKey);
    console.log(`✅ exists: ${exists}`);

    // 测试 del
    console.log('🗑️  测试 del...');
    await cacheService.del(testKey);
    const afterDel = await cacheService.exists(testKey);
    if (!afterDel) {
      console.log('✅ del 成功');
    } else {
      console.log('❌ del 失败');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ 基础操作测试失败:', error);
    return false;
  }
}

/**
 * 测试3: 搜索缓存性能对比
 */
async function testSearchCachePerformance() {
  console.log('\n========== 测试3: 搜索缓存性能对比 ==========');
  
  const cacheService = getCacheService();
  
  // 清除搜索缓存，确保公平测试
  await cacheWarmupService.clearSearchCache();
  console.log('🗑️  已清除旧缓存\n');

  const testQueries = [
    'LM324',
    'TI',
    'resistor',
    '555',
    'capacitor'
  ];

  for (const keyword of testQueries) {
    console.log(`\n测试搜索词: "${keyword}"`);
    
    // 第一次查询（无缓存）
    const start1 = Date.now();
    const result1 = await doeeetSearchService.fullTextSearch(keyword, { limit: 20, page: 1 });
    const time1 = Date.now() - start1;
    console.log(`  ⚡ 无缓存查询: ${time1}ms (${result1.length}条结果)`);

    // 第二次查询（有缓存）
    const start2 = Date.now();
    const result2 = await doeeetSearchService.fullTextSearch(keyword, { limit: 20, page: 1 });
    const time2 = Date.now() - start2;
    console.log(`  ✅ 缓存查询: ${time2}ms (${result2.length}条结果)`);
    
    const speedup = (time1 / time2).toFixed(1);
    const improvement = ((1 - time2 / time1) * 100).toFixed(1);
    console.log(`  🚀 性能提升: ${speedup}x (节省${improvement}%)`);
  }
}

/**
 * 测试4: 元数据缓存性能对比
 */
async function testMetaCachePerformance() {
  console.log('\n========== 测试4: 元数据缓存性能对比 ==========');

  // 清除元数据缓存
  await cacheWarmupService.clearMetaCache();
  console.log('🗑️  已清除旧缓存\n');

  const tests = [
    {
      name: '参数定义',
      fn: () => doeeetSearchService.getParameterDefinitions()
    },
    {
      name: '制造商列表',
      fn: () => doeeetSearchService.getManufacturers()
    },
    {
      name: '分类树',
      fn: () => doeeetSearchService.getFamilyPaths()
    },
    {
      name: '统计数据',
      fn: () => doeeetSearchService.getStatistics()
    }
  ];

  for (const test of tests) {
    console.log(`\n测试: ${test.name}`);
    
    // 第一次查询（无缓存）
    const start1 = Date.now();
    const result1 = await test.fn();
    const time1 = Date.now() - start1;
    console.log(`  ⚡ 无缓存查询: ${time1}ms`);

    // 第二次查询（有缓存）
    const start2 = Date.now();
    const result2 = await test.fn();
    const time2 = Date.now() - start2;
    console.log(`  ✅ 缓存查询: ${time2}ms`);
    
    const speedup = (time1 / time2).toFixed(1);
    const improvement = ((1 - time2 / time1) * 100).toFixed(1);
    console.log(`  🚀 性能提升: ${speedup}x (节省${improvement}%)`);
  }
}

/**
 * 测试5: 组件详情缓存
 */
async function testComponentDetailCache() {
  console.log('\n========== 测试5: 组件详情缓存 ==========');

  // 先搜索获取一个组件ID
  const searchResult = await doeeetSearchService.fullTextSearch('LM324', { limit: 1 });
  
  if (searchResult.length === 0) {
    console.log('⚠️  没有找到测试组件，跳过此测试');
    return;
  }

  const componentId = searchResult[0].component_id;
  console.log(`\n测试组件ID: ${componentId}`);

  const cacheService = getCacheService();
  await cacheService.del(`doeet:component:detail:${componentId}`);

  // 第一次查询（无缓存）
  const start1 = Date.now();
  const result1 = await doeeetSearchService.getComponentWithParameters(componentId);
  const time1 = Date.now() - start1;
  console.log(`  ⚡ 无缓存查询: ${time1}ms (${result1?.parameters?.length || 0}个参数)`);

  // 第二次查询（有缓存）
  const start2 = Date.now();
  const result2 = await doeeetSearchService.getComponentWithParameters(componentId);
  const time2 = Date.now() - start2;
  console.log(`  ✅ 缓存查询: ${time2}ms (${result2?.parameters?.length || 0}个参数)`);
  
  const speedup = (time1 / time2).toFixed(1);
  const improvement = ((1 - time2 / time1) * 100).toFixed(1);
  console.log(`  🚀 性能提升: ${speedup}x (节省${improvement}%)`);
}

/**
 * 测试6: 缓存统计
 */
async function testCacheStats() {
  console.log('\n========== 测试6: 缓存统计 ==========');
  
  const cacheService = getCacheService();
  const stats = await cacheService.getCacheStats();
  
  console.log('\n📊 缓存统计信息:');
  console.log(`  - 键数量: ${stats.keys}`);
  console.log(`  - 内存使用: ${stats.memory}`);
  console.log(`  - 命中次数: ${stats.hits}`);
  console.log(`  - 未命中次数: ${stats.misses}`);
  console.log(`  - 命中率: ${stats.hitRate.toFixed(2)}%`);
  
  // 列出所有缓存keys
  console.log('\n🔑 缓存Key列表:');
  const searchKeys = await cacheService.getKeys('search:*');
  const metaKeys = await cacheService.getKeys('meta:*');
  const componentKeys = await cacheService.getKeys('component:*');
  
  console.log(`  - 搜索缓存: ${searchKeys.length}个`);
  console.log(`  - 元数据缓存: ${metaKeys.length}个`);
  console.log(`  - 组件缓存: ${componentKeys.length}个`);
}

/**
 * 测试7: 缓存预热
 */
async function testCacheWarmup() {
  console.log('\n========== 测试7: 缓存预热 ==========');
  
  // 清除所有缓存
  await cacheWarmupService.clearAllCache();
  
  // 执行预热
  await cacheWarmupService.warmup();
  
  console.log('\n✅ 预热测试完成');
}

/**
 * 主测试函数
 */
async function runAllTests() {
  console.log('🧪 开始Redis缓存测试\n');
  console.log('='.repeat(50));

  try {
    // 连接数据库
    await connectDB();

    // 运行测试
    const test1 = await testRedisConnection();
    if (!test1) {
      console.log('\n❌ Redis连接失败，终止测试');
      process.exit(1);
    }

    await testBasicCacheOperations();
    await testCacheWarmup();
    await testSearchCachePerformance();
    await testMetaCachePerformance();
    await testComponentDetailCache();
    await testCacheStats();

    console.log('\n' + '='.repeat(50));
    console.log('✅ 所有测试完成！');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ 测试过程中出错:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// 运行测试
runAllTests();

