import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// 数据库导入
import { connectDB, disconnectDB } from './config/database';

// 路由导入
import supplierRoutes from './routes/supplierRoutes';
import searchRoutes from './routes/searchRoutes';
import selectionRoutes from './routes/selectionRoutes';
import standardRoutes from './routes/standardRoutes';
import qualityRoutes from './routes/qualityRoutes';
import qualityAlertRoutes from './routes/qualityAlertRoutes';
import testRoutes from './routes/testRoutes';
import procurementRoutes from './routes/procurementRoutes';
import identificationRoutes from './routes/identificationRoutes';
import documentRoutes from './routes/documentRoutes';
import policyRegulationRoutes from './routes/policyRegulationRoutes';
import applicationSupportRoutes from './routes/applicationSupportRoutes';
import digitalModelRoutes from './routes/digitalModelRoutes';
import adminRoutes from './routes/adminRoutes';
import premiumProductRoutes from './routes/premiumProductRoutes';
import userRoutes from './routes/userRoutes';

// 新增分析路由
import analyticsRoutes from './routes/analyticsRoutes';
import supplierAnalyticsRoutes from './routes/supplierAnalyticsRoutes';
import qualityAnalyticsRoutes from './routes/qualityAnalyticsRoutes';

// DoEEEt搜索路由
import doeeetRoutes from './routes/doeeetRoutes';

// 辐照数据路由
import radiationDataRoutes from './routes/radiationDataRoutes';
import domesticRoutes from './routes/domesticRoutes';
import { AlertMonitoringJob } from './jobs/AlertMonitoringJob';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// API路由
app.use('/api/users', userRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/selections', selectionRoutes);
app.use('/api/standards', standardRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/quality/alerts', qualityAlertRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/identification', identificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/policy-regulations', policyRegulationRoutes);
app.use('/api/application-support', applicationSupportRoutes);
app.use('/api/digital-models', digitalModelRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/premium-products', premiumProductRoutes);

// 分析服务路由
app.use('/api/analytics', analyticsRoutes);
app.use('/api/supplier-analytics', supplierAnalyticsRoutes);
app.use('/api/quality-analytics', qualityAnalyticsRoutes);

// DoEEEt搜索服务路由
app.use('/api/doeeet', doeeetRoutes);
app.use('/api/domestic', domesticRoutes);

// 辐照数据服务路由
app.use('/api/radiation-data', radiationDataRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const alertMonitoringJob = new AlertMonitoringJob();

async function startServer() {
  try {
    // 连接数据库
    await connectDB();
    
    app.listen(PORT, () => {
      logger.info(`🚀 服务器启动成功，端口: ${PORT}`);
      logger.info(`📡 API地址: http://localhost:${PORT}`);
      logger.info(`🏥 健康检查: http://localhost:${PORT}/health`);
      logger.info(`💾 数据存储: MongoDB`);
      alertMonitoringJob.start();
    });
  } catch (error) {
    logger.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  logger.info('🛑 收到SIGTERM信号，开始优雅关闭...');
  
  try {
    await disconnectDB();
    logger.info('💾 已断开数据库连接');
    alertMonitoringJob.stop();
  } catch (error) {
    logger.error('❌ 断开数据库连接失败:', error);
  }
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('🛑 收到SIGINT信号，开始优雅关闭...');
  
  try {
    await disconnectDB();
    logger.info('💾 已断开数据库连接');
    alertMonitoringJob.stop();
  } catch (error) {
    logger.error('❌ 断开数据库连接失败:', error);
  }
  
  process.exit(0);
});

startServer();
