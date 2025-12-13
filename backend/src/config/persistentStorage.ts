/**
 * 持久化存储管理器 - 将数据保存到文件系统
 */
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { DigitalModel, Component, Supplier, Identification } from './memoryStorage';

export interface PersistentData {
  digitalModels: DigitalModel[];
  components: Component[];
  suppliers: Supplier[];
  identifications: Identification[];
  lastUpdated: string;
}

export class PersistentStorage {
  private static instance: PersistentStorage;
  private dataFilePath: string;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // 确保data目录存在
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.dataFilePath = path.join(dataDir, 'persistent-data.json');
    
    // 启动自动保存机制 (每30秒保存一次)
    this.startAutoSave();
  }

  public static getInstance(): PersistentStorage {
    if (!PersistentStorage.instance) {
      PersistentStorage.instance = new PersistentStorage();
    }
    return PersistentStorage.instance;
  }

  /**
   * 检查持久化数据文件是否存在
   */
  public hasPersistedData(): boolean {
    return fs.existsSync(this.dataFilePath);
  }

  /**
   * 读取持久化数据
   */
  public loadData(): PersistentData | null {
    try {
      if (!this.hasPersistedData()) {
        logger.info('📄 未找到持久化数据文件，将使用默认测试数据');
        return null;
      }

      const data = fs.readFileSync(this.dataFilePath, 'utf-8');
      const parsedData = JSON.parse(data) as PersistentData;
      
      logger.info('📄 成功加载持久化数据', { 
        digitalModels: parsedData.digitalModels?.length || 0,
        components: parsedData.components?.length || 0,
        suppliers: parsedData.suppliers?.length || 0,
        identifications: parsedData.identifications?.length || 0,
        lastUpdated: parsedData.lastUpdated 
      });
      
      return parsedData;
    } catch (error) {
      logger.error('❌ 读取持久化数据失败:', error);
      return null;
    }
  }

  /**
   * 保存数据到持久化文件
   */
  public saveData(data: PersistentData): boolean {
    try {
      data.lastUpdated = new Date().toISOString();
      
      // 写入临时文件，然后重命名，避免写入过程中数据损坏
      const tempFilePath = this.dataFilePath + '.tmp';
      fs.writeFileSync(tempFilePath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFilePath, this.dataFilePath);
      
      logger.debug('💾 数据已保存到持久化文件', { 
        digitalModels: data.digitalModels?.length || 0,
        lastUpdated: data.lastUpdated 
      });
      
      return true;
    } catch (error) {
      logger.error('❌ 保存持久化数据失败:', error);
      return false;
    }
  }

  /**
   * 启动自动保存机制
   */
  private startAutoSave(): void {
    // 每30秒自动保存一次
    this.autoSaveInterval = setInterval(() => {
      this.triggerAutoSave();
    }, 30000);
    
    logger.info('🔄 启动数据自动保存机制 (间隔: 30秒)');
  }

  /**
   * 触发自动保存
   */
  private triggerAutoSave(): void {
    try {
      // 动态导入memoryStorage避免循环依赖
      const { memoryStorage } = require('./memoryStorage');
      
      if (memoryStorage) {
        const data: PersistentData = {
          digitalModels: memoryStorage.digitalModels || [],
          components: memoryStorage.getAllComponents() || [],
          suppliers: memoryStorage.getAllSuppliers() || [],
          identifications: memoryStorage.getAllIdentifications() || [],
          lastUpdated: new Date().toISOString()
        };
        
        this.saveData(data);
      }
    } catch (error) {
      logger.error('❌ 自动保存失败:', error);
    }
  }

  /**
   * 手动触发保存
   */
  public manualSave(): boolean {
    try {
      const { memoryStorage } = require('./memoryStorage');
      
      if (memoryStorage) {
        const data: PersistentData = {
          digitalModels: memoryStorage.digitalModels || [],
          components: memoryStorage.getAllComponents() || [],
          suppliers: memoryStorage.getAllSuppliers() || [],
          identifications: memoryStorage.getAllIdentifications() || [],
          lastUpdated: new Date().toISOString()
        };
        
        return this.saveData(data);
      }
      
      return false;
    } catch (error) {
      logger.error('❌ 手动保存失败:', error);
      return false;
    }
  }

  /**
   * 停止自动保存机制
   */
  public stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      logger.info('⏹️ 已停止数据自动保存机制');
    }
  }

  /**
   * 清除持久化数据（谨慎使用）
   */
  public clearPersistedData(): boolean {
    try {
      if (this.hasPersistedData()) {
        fs.unlinkSync(this.dataFilePath);
        logger.info('🗑️ 已清除持久化数据文件');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('❌ 清除持久化数据失败:', error);
      return false;
    }
  }
}

// 创建并导出实例
export const persistentStorage = PersistentStorage.getInstance();
