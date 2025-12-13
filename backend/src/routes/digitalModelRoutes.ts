import express from 'express';
import {
  getDigitalModels,
  getDigitalModel,
  createDigitalModel,
  updateDigitalModel,
  deleteDigitalModel,
  uploadModelFile,
  downloadModelFile,
  validateDigitalModel
} from '../controllers/digitalModelController';

const router = express.Router();

// 获取数字模型列表
router.get('/', getDigitalModels);

// 获取单个数字模型详情
router.get('/:id', getDigitalModel);

// 创建数字模型
router.post('/', createDigitalModel);

// 更新数字模型
router.put('/:id', updateDigitalModel);

// 删除数字模型
router.delete('/:id', deleteDigitalModel);

// 上传模型文件
router.post('/:id/upload', uploadModelFile);

// 下载模型文件
router.get('/:id/download', downloadModelFile);

// 验证数字模型
router.post('/:id/validate', validateDigitalModel);

export default router;
