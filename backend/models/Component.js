const mongoose = require('mongoose');

// 元器件数据模型
const componentSchema = new mongoose.Schema({
  // 基本信息
  partNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  // 分类信息
  primaryCategory: {
    type: String,
    required: true,
    enum: [
      '数字单片集成电路',
      '模拟单片集成电路', 
      '混合集成电路',
      '电能源',
      '光电器件',
      '分立器件',
      '传感器',
      '连接器',
      '无源器件'
    ],
    index: true
  },
  secondaryCategory: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  // 封装和规格
  package: {
    type: String,
    required: true,
    trim: true
  },
  qualityLevel: {
    type: String,
    required: true,
    enum: ['军用级', '工业级', '商用级', '医用级', '汽车级'],
    index: true
  },
  lifecycle: {
    type: String,
    required: true,
    enum: ['新品', '生产中', '停产通知', '已停产', '最后订购'],
    index: true
  },
  standards: [{
    type: String,
    trim: true
  }],
  
  // 描述信息
  description: {
    type: String,
    required: true,
    trim: true
  },
  functionalPerformance: {
    type: String,
    required: true,
    trim: true
  },
  
  // 价格信息
  referencePrice: {
    type: Number,
    required: true,
    min: 0
  },
  priceUnit: {
    type: String,
    default: 'CNY',
    enum: ['CNY', 'USD', 'EUR']
  },
  
  // 技术参数 - 使用灵活的对象结构
  parameters: {
    type: Map,
    of: String,
    default: {}
  },
  
  // 库存信息
  inventory: {
    totalStock: {
      type: Number,
      default: 0,
      min: 0
    },
    availableStock: {
      type: Number,
      default: 0,
      min: 0
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0
    },
    minStockLevel: {
      type: Number,
      default: 10,
      min: 0
    }
  },
  
  // 供应商信息
  suppliers: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    partNumber: String,
    leadTime: Number, // 交期（天）
    minOrderQty: Number,
    price: Number,
    currency: {
      type: String,
      default: 'CNY'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 技术文档
  documents: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['datasheet', 'manual', 'schematic', 'layout', 'other']
    },
    url: String,
    fileId: String, // GridFS文件ID
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 替代器件
  alternatives: [{
    partNumber: String,
    manufacturer: String,
    compatibility: {
      type: String,
      enum: ['完全兼容', '部分兼容', '功能兼容']
    },
    notes: String
  }],
  
  // 应用领域
  applications: [{
    type: String,
    trim: true
  }],
  
  // 认证信息
  certifications: [{
    name: String,
    number: String,
    authority: String,
    validUntil: Date
  }],
  
  // 环保信息
  environmental: {
    rohsCompliant: {
      type: Boolean,
      default: false
    },
    leadFree: {
      type: Boolean,
      default: false
    },
    msl: String, // 湿敏等级
    reachCompliant: Boolean
  },
  
  // 元数据
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // 状态
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending_review'],
    default: 'active',
    index: true
  },
  
  // 审核信息
  approval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    comments: String
  }
}, {
  timestamps: true, // 自动添加createdAt和updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 复合索引
componentSchema.index({ primaryCategory: 1, secondaryCategory: 1 });
componentSchema.index({ manufacturer: 1, partNumber: 1 });
componentSchema.index({ 'inventory.availableStock': 1, status: 1 });
componentSchema.index({ referencePrice: 1, primaryCategory: 1 });

// 文本搜索索引
componentSchema.index({
  partNumber: 'text',
  manufacturer: 'text',
  description: 'text',
  functionalPerformance: 'text',
  'applications': 'text',
  'tags': 'text'
}, {
  weights: {
    partNumber: 10,
    manufacturer: 8,
    description: 5,
    functionalPerformance: 3,
    applications: 2,
    tags: 1
  }
});

// 虚拟字段
componentSchema.virtual('stockStatus').get(function() {
  if (this.inventory.availableStock <= 0) return 'out_of_stock';
  if (this.inventory.availableStock <= this.inventory.minStockLevel) return 'low_stock';
  return 'in_stock';
});

componentSchema.virtual('isLowStock').get(function() {
  return this.inventory.availableStock <= this.inventory.minStockLevel;
});

// 中间件
componentSchema.pre('save', function(next) {
  // 确保库存数据一致性
  if (this.inventory.availableStock + this.inventory.reservedStock > this.inventory.totalStock) {
    this.inventory.totalStock = this.inventory.availableStock + this.inventory.reservedStock;
  }
  next();
});

// 静态方法
componentSchema.statics.findByCategory = function(primaryCategory, secondaryCategory = null) {
  const query = { primaryCategory, status: 'active' };
  if (secondaryCategory) {
    query.secondaryCategory = secondaryCategory;
  }
  return this.find(query);
};

componentSchema.statics.searchComponents = function(searchTerm, filters = {}) {
  const pipeline = [];
  
  // 文本搜索
  if (searchTerm) {
    pipeline.push({
      $match: {
        $text: { $search: searchTerm }
      }
    });
    pipeline.push({
      $addFields: {
        score: { $meta: 'textScore' }
      }
    });
  }
  
  // 应用过滤器
  const matchStage = { status: 'active' };
  if (filters.primaryCategory) matchStage.primaryCategory = filters.primaryCategory;
  if (filters.manufacturer) matchStage.manufacturer = filters.manufacturer;
  if (filters.qualityLevel) matchStage.qualityLevel = filters.qualityLevel;
  if (filters.lifecycle) matchStage.lifecycle = filters.lifecycle;
  if (filters.priceRange) {
    matchStage.referencePrice = {
      $gte: filters.priceRange.min || 0,
      $lte: filters.priceRange.max || Number.MAX_VALUE
    };
  }
  if (filters.inStock) {
    matchStage['inventory.availableStock'] = { $gt: 0 };
  }
  
  pipeline.push({ $match: matchStage });
  
  // 排序
  if (searchTerm) {
    pipeline.push({ $sort: { score: { $meta: 'textScore' }, updatedAt: -1 } });
  } else {
    pipeline.push({ $sort: { updatedAt: -1 } });
  }
  
  return this.aggregate(pipeline);
};

// 实例方法
componentSchema.methods.updateStock = function(quantity, operation = 'set') {
  switch (operation) {
    case 'add':
      this.inventory.totalStock += quantity;
      this.inventory.availableStock += quantity;
      break;
    case 'subtract':
      this.inventory.availableStock = Math.max(0, this.inventory.availableStock - quantity);
      break;
    case 'reserve':
      if (this.inventory.availableStock >= quantity) {
        this.inventory.availableStock -= quantity;
        this.inventory.reservedStock += quantity;
      } else {
        throw new Error('库存不足');
      }
      break;
    case 'release':
      this.inventory.reservedStock = Math.max(0, this.inventory.reservedStock - quantity);
      this.inventory.availableStock += quantity;
      break;
    default:
      this.inventory.availableStock = quantity;
  }
  return this.save();
};

module.exports = mongoose.model('Component', componentSchema);
