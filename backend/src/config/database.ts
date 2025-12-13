import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// 设置 Mongoose 配置
mongoose.set('strictQuery', false);

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/business_plat';
    
    await mongoose.connect(mongoUri, {
      // 连接选项 - 使用 Mongoose 6 兼容的选项
      maxPoolSize: 10, // 连接池最大连接数
      serverSelectionTimeoutMS: 5000, // 服务器选择超时
      socketTimeoutMS: 45000 // Socket超时
    });

    logger.info('🗄️  MongoDB 连接成功');
    
    // 监听连接事件
    mongoose.connection.on('error', (error) => {
      logger.error('❌ MongoDB 连接错误:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB 连接断开');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB 重新连接成功');
    });

  } catch (error) {
    logger.error('❌ MongoDB 连接失败:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('🗄️  MongoDB 连接已关闭');
  } catch (error) {
    logger.error('❌ MongoDB 断开连接失败:', error);
  }
};
