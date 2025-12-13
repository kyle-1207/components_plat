const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const componentController = require('../controllers/componentController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// 数据验证规则
const componentValidation = [
  body('partNumber')
    .notEmpty()
    .withMessage('型号不能为空')
    .isLength({ max: 100 })
    .withMessage('型号长度不能超过100字符'),
  
  body('manufacturer')
    .notEmpty()
    .withMessage('制造商不能为空')
    .isLength({ max: 100 })
    .withMessage('制造商名称长度不能超过100字符'),
  
  body('primaryCategory')
    .notEmpty()
    .withMessage('主分类不能为空')
    .isIn([
      '数字单片集成电路',
      '模拟单片集成电路', 
      '混合集成电路',
      '电能源',
      '光电器件',
      '分立器件',
      '传感器',
      '连接器',
      '无源器件'
    ])
    .withMessage('无效的主分类'),
  
  body('secondaryCategory')
    .notEmpty()
    .withMessage('子分类不能为空')
    .isLength({ max: 100 })
    .withMessage('子分类长度不能超过100字符'),
  
  body('package')
    .notEmpty()
    .withMessage('封装类型不能为空')
    .isLength({ max: 50 })
    .withMessage('封装类型长度不能超过50字符'),
  
  body('qualityLevel')
    .notEmpty()
    .withMessage('质量等级不能为空')
    .isIn(['军用级', '工业级', '商用级', '医用级', '汽车级'])
    .withMessage('无效的质量等级'),
  
  body('lifecycle')
    .notEmpty()
    .withMessage('生命周期状态不能为空')
    .isIn(['新品', '生产中', '停产通知', '已停产', '最后订购'])
    .withMessage('无效的生命周期状态'),
  
  body('description')
    .notEmpty()
    .withMessage('描述不能为空')
    .isLength({ max: 500 })
    .withMessage('描述长度不能超过500字符'),
  
  body('functionalPerformance')
    .notEmpty()
    .withMessage('功能性能描述不能为空')
    .isLength({ max: 1000 })
    .withMessage('功能性能描述长度不能超过1000字符'),
  
  body('referencePrice')
    .isFloat({ min: 0 })
    .withMessage('参考价格必须为非负数'),
  
  body('parameters')
    .optional()
    .isObject()
    .withMessage('技术参数必须为对象格式'),
  
  body('inventory.totalStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('总库存必须为非负整数'),
  
  body('inventory.availableStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('可用库存必须为非负整数'),
  
  body('inventory.minStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('最小库存水位必须为非负整数')
];

// 公开路由 - 不需要认证
router.get('/', componentController.getComponents);
router.get('/stats/categories', componentController.getCategoryStats);
router.get('/part/:partNumber', componentController.getComponentByPartNumber);
router.get('/:id', componentController.getComponentById);

// 需要认证的路由
router.use(auth);

// 管理员路由 - 需要管理员权限
router.post('/', adminAuth, componentValidation, componentController.createComponent);
router.put('/:id', adminAuth, componentValidation, componentController.updateComponent);
router.delete('/:id', adminAuth, componentController.deleteComponent);
router.post('/bulk-import', adminAuth, componentController.bulkImportComponents);
router.patch('/:id/stock', adminAuth, componentController.updateStock);
router.get('/management/low-stock', adminAuth, componentController.getLowStockComponents);

module.exports = router;
