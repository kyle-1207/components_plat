import { Request, Response, NextFunction } from 'express';
import { memoryStorage } from '../config/memoryStorage';
import { logger } from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// 数字模型接口定义
interface DigitalModel {
  id: string;
  modelId: string;
  componentCategory: string;
  componentName: string;
  modelSpecification: string;
  manufacturer: string;
  modelCategory: string;
  modelPurpose: string;
  fileInfo: {
    fileName: string;
    fileSize: number;
    fileUrl?: string;
    fileFormat: string;
    checksum?: string;
    uploadDate?: Date;
  };
  validation?: {
    isValidated: boolean;
    validationDate?: Date;
    validatedBy?: string;
    validationMethod?: string;
    validationResults?: {
      accuracy: number;
      frequencyRange: string;
      temperatureRange: string;
      notes: string;
    };
  };
  modelInfo?: {
    modelName: string;
    modelType: string;
    modelVersion: string;
    description: string;
    keywords: string[];
  };
  versionControl?: {
    version: string;
    isLatest: boolean;
  };
  sharing?: {
    isPublic: boolean;
    accessLevel: string;
    downloadCount: number;
    rating: {
      averageRating: number;
      ratingCount: number;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/digital-models';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    // 允许所有文件类型
    cb(null, true);
  }
});

// 获取所有数字模型
export const getDigitalModels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 10,
      componentCategory,
      componentName,
      modelSpecification,
      manufacturer,
      modelCategory,
      modelPurpose,
      isValidated
    } = req.query;

    let models = memoryStorage.digitalModels || [];

    // 应用筛选条件
    if (componentCategory) {
      models = models.filter(model => 
        model.componentCategory?.toLowerCase().includes((componentCategory as string).toLowerCase())
      );
    }

    if (componentName) {
      models = models.filter(model => 
        model.componentName?.toLowerCase().includes((componentName as string).toLowerCase())
      );
    }

    if (modelSpecification) {
      models = models.filter(model => 
        model.modelSpecification?.toLowerCase().includes((modelSpecification as string).toLowerCase())
      );
    }

    if (manufacturer) {
      models = models.filter(model => 
        model.manufacturer?.toLowerCase().includes((manufacturer as string).toLowerCase())
      );
    }

    if (modelCategory) {
      models = models.filter(model => 
        model.modelCategory?.toLowerCase() === (modelCategory as string).toLowerCase()
      );
    }

    if (modelPurpose) {
      models = models.filter(model => 
        model.modelPurpose?.toLowerCase().includes((modelPurpose as string).toLowerCase())
      );
    }

    if (isValidated !== undefined) {
      const validated = isValidated === 'true';
      models = models.filter(model => model.validation?.isValidated === validated);
    }

    // 分页
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedModels = models.slice(startIndex, endIndex);

    // 统计信息
    const statistics = {
      totalModels: models.length,
      validatedModels: models.filter(m => m.validation?.isValidated).length,
      publicModels: models.filter(m => m.sharing?.isPublic).length,
      totalDownloads: models.reduce((sum, m) => sum + (m.sharing?.downloadCount || 0), 0)
    };

    res.json({
      success: true,
      data: paginatedModels,
      statistics,
      pagination: {
        current: pageNum,
        pageSize: limitNum,
        total: models.length,
        totalPages: Math.ceil(models.length / limitNum)
      }
    });

    logger.info('获取数字模型列表成功', { 
      count: paginatedModels.length, 
      total: models.length,
      filters: { componentCategory, componentName, modelSpecification, manufacturer, modelCategory, isValidated }
    });
  } catch (error) {
    logger.error('获取数字模型列表失败:', error);
    next(error);
  }
};

// 获取单个数字模型详情
export const getDigitalModel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const models = memoryStorage.digitalModels || [];
    const model = models.find(m => m.id === id);

    if (!model) {
      res.status(404).json({
        success: false,
        message: '数字模型不存在'
      });
      return;
    }

    res.json({
      success: true,
      data: model
    });

    logger.info('获取数字模型详情成功', { id });
  } catch (error) {
    logger.error('获取数字模型详情失败:', error);
    next(error);
  }
};

// 创建数字模型
export const createDigitalModel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      componentCategory,
      componentName,
      modelSpecification,
      manufacturer,
      modelCategory,
      modelPurpose,
      modelInfo,
      validation,
      versionControl,
      sharing
    } = req.body;

    // 验证必填字段
    if (!componentCategory || !componentName || !modelSpecification || !manufacturer || !modelCategory || !modelPurpose) {
      res.status(400).json({
        success: false,
        message: '缺少必填字段'
      });
      return;
    }

    // 生成模型ID
    const modelId = `MDL-${Date.now()}`;
    const id = crypto.randomUUID();

    const newModel: DigitalModel = {
      id,
      modelId,
      componentCategory,
      componentName,
      modelSpecification,
      manufacturer,
      modelCategory,
      modelPurpose,
      fileInfo: {
        fileName: 'temp.txt',
        fileSize: 0,
        fileFormat: 'TEMP'
      },
      validation: validation || {
        isValidated: false,
        validationResults: {
          accuracy: 0,
          frequencyRange: '',
          temperatureRange: '',
          notes: ''
        }
      },
      modelInfo: modelInfo || {
        modelName: componentName,
        modelType: modelCategory,
        modelVersion: '1.0',
        description: modelPurpose,
        keywords: []
      },
      versionControl: versionControl || {
        version: '1.0',
        isLatest: true
      },
      sharing: sharing || {
        isPublic: false,
        accessLevel: 'private',
        downloadCount: 0,
        rating: {
          averageRating: 0,
          ratingCount: 0
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 保存到内存存储
    if (!memoryStorage.digitalModels) {
      memoryStorage.digitalModels = [];
    }
    memoryStorage.digitalModels.push(newModel);

    // 触发数据持久化保存
    memoryStorage.saveToStorage();

    res.status(201).json({
      success: true,
      data: newModel,
      message: '数字模型创建成功'
    });

    logger.info('创建数字模型成功', { modelId, componentName });
  } catch (error) {
    logger.error('创建数字模型失败:', error);
    next(error);
  }
};

// 更新数字模型
export const updateDigitalModel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!memoryStorage.digitalModels) {
      memoryStorage.digitalModels = [];
    }

    const modelIndex = memoryStorage.digitalModels.findIndex(m => m.id === id);
    if (modelIndex === -1) {
      res.status(404).json({
        success: false,
        message: '数字模型不存在'
      });
      return;
    }

    // 更新数据
    const updatedModel = {
      ...memoryStorage.digitalModels[modelIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    memoryStorage.digitalModels[modelIndex] = updatedModel;

    // 触发数据持久化保存
    memoryStorage.saveToStorage();

    res.json({
      success: true,
      data: updatedModel,
      message: '数字模型更新成功'
    });

    logger.info('更新数字模型成功', { id, modelId: updatedModel.modelId });
  } catch (error) {
    logger.error('更新数字模型失败:', error);
    next(error);
  }
};

// 删除数字模型
export const deleteDigitalModel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!memoryStorage.digitalModels) {
      memoryStorage.digitalModels = [];
    }

    const modelIndex = memoryStorage.digitalModels.findIndex(m => m.id === id);
    if (modelIndex === -1) {
      res.status(404).json({
        success: false,
        message: '数字模型不存在'
      });
      return;
    }

    const deletedModel = memoryStorage.digitalModels[modelIndex];
    
    // 删除文件
    if (deletedModel.fileInfo?.fileUrl) {
      const filePath = path.join(process.cwd(), deletedModel.fileInfo.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 从内存中删除
    memoryStorage.digitalModels.splice(modelIndex, 1);

    // 触发数据持久化保存
    memoryStorage.saveToStorage();

    res.json({
      success: true,
      message: '数字模型删除成功'
    });

    logger.info('删除数字模型成功', { id, modelId: deletedModel.modelId });
  } catch (error) {
    logger.error('删除数字模型失败:', error);
    next(error);
  }
};

// 上传模型文件
export const uploadModelFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uploadSingle = upload.single('file');
    
    uploadSingle(req, res, async (err): Promise<void> => {
      if (err) {
        logger.error('文件上传失败:', err);
        res.status(400).json({
          success: false,
          message: err.message
        });
        return;
      }

      const { id } = req.params;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: '未选择文件'
        });
        return;
      }

      if (!memoryStorage.digitalModels) {
        memoryStorage.digitalModels = [];
      }

      const modelIndex = memoryStorage.digitalModels.findIndex(m => m.id === id);
      if (modelIndex === -1) {
        // 删除上传的文件
        fs.unlinkSync(file.path);
        res.status(404).json({
          success: false,
          message: '数字模型不存在'
        });
        return;
      }

      // 计算文件校验和
      const fileBuffer = fs.readFileSync(file.path);
      const checksum = crypto.createHash('md5').update(fileBuffer).digest('hex');

      // 更新模型文件信息
      const fileUrl = `/uploads/digital-models/${file.filename}`;
      memoryStorage.digitalModels[modelIndex].fileInfo = {
        fileName: file.originalname,
        fileSize: file.size,
        fileUrl,
        fileFormat: path.extname(file.originalname).replace('.', '').toUpperCase(),
        checksum,
        uploadDate: new Date()
      };

      memoryStorage.digitalModels[modelIndex].updatedAt = new Date().toISOString();

      // 触发数据持久化保存
      memoryStorage.saveToStorage();

      res.json({
        success: true,
        data: {
          fileInfo: memoryStorage.digitalModels[modelIndex].fileInfo
        },
        message: '文件上传成功'
      });

      logger.info('模型文件上传成功', { 
        id, 
        fileName: file.originalname, 
        size: file.size 
      });
    });
  } catch (error) {
    logger.error('上传模型文件失败:', error);
    next(error);
  }
};

// 下载模型文件
export const downloadModelFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!memoryStorage.digitalModels) {
      memoryStorage.digitalModels = [];
    }

    const model = memoryStorage.digitalModels.find(m => m.id === id);
    if (!model) {
      res.status(404).json({
        success: false,
        message: '数字模型不存在'
      });
      return;
    }

    if (!model.fileInfo?.fileUrl) {
      res.status(404).json({
        success: false,
        message: '模型文件不存在'
      });
      return;
    }

    const filePath = path.join(process.cwd(), model.fileInfo.fileUrl);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: '文件不存在'
      });
      return;
    }

    // 增加下载计数
    if (!model.sharing) {
      model.sharing = {
        isPublic: false,
        accessLevel: 'private',
        downloadCount: 0,
        rating: { averageRating: 0, ratingCount: 0 }
      };
    }
    model.sharing.downloadCount += 1;

    // 设置下载头部
    res.setHeader('Content-Disposition', `attachment; filename="${model.fileInfo.fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // 发送文件
    res.sendFile(filePath);

    logger.info('模型文件下载成功', { 
      id, 
      fileName: model.fileInfo.fileName 
    });
  } catch (error) {
    logger.error('下载模型文件失败:', error);
    next(error);
  }
};

// 验证数字模型
export const validateDigitalModel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { validationMethod, validationResults, validatedBy } = req.body;

    if (!memoryStorage.digitalModels) {
      memoryStorage.digitalModels = [];
    }

    const modelIndex = memoryStorage.digitalModels.findIndex(m => m.id === id);
    if (modelIndex === -1) {
      res.status(404).json({
        success: false,
        message: '数字模型不存在'
      });
      return;
    }

    // 更新验证信息
    memoryStorage.digitalModels[modelIndex].validation = {
      ...memoryStorage.digitalModels[modelIndex].validation,
      isValidated: true,
      validationDate: new Date(),
      validatedBy,
      validationMethod,
      validationResults
    };

    memoryStorage.digitalModels[modelIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: memoryStorage.digitalModels[modelIndex],
      message: '模型验证成功'
    });

    logger.info('数字模型验证成功', { id, validatedBy });
  } catch (error) {
    logger.error('验证数字模型失败:', error);
    next(error);
  }
};

export { upload };
