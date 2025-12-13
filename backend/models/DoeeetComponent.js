/**
 * DoEEEt组件模型
 * 对应MongoDB中的components集合
 * 使用实际的字段名（下划线命名）
 */

const mongoose = require('mongoose');

const doeeetComponentSchema = new mongoose.Schema({
  component_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // 基本信息
  part_number: {
    type: String,
    trim: true,
    index: true
  },
  
  part_type: {
    type: String,
    trim: true,
    index: true
  },
  
  manufacturer_name: {
    type: String,
    trim: true,
    index: true
  },
  
  // 分类信息
  family_path: {
    type: String,  // 在components集合中是字符串
    trim: true,
    index: true
  },
  
  // 生命周期
  obsolescence_type: {
    type: String,
    trim: true,
    index: true
  },
  
  // 库存状态
  has_stock: {
    type: String,  // "Yes" or "No"
    enum: ['Yes', 'No', ''],
    default: 'No'
  },
  
  // 质量信息
  quality_name: {
    type: String,
    trim: true
  },
  
  qualified: {
    type: String,
    trim: true
  },
  
  qpl_name: {
    type: String,
    trim: true
  },
  
  // 文档和描述
  cad: {
    type: String,
    trim: true
  },
  
  datasheet_url: {
    type: String,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // 时间戳
  created_at: {
    type: Date,
    default: Date.now
  },
  
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'components',  // 明确指定集合名
  timestamps: false,  // 使用自定义的created_at和updated_at
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 复合索引
doeeetComponentSchema.index({ manufacturer_name: 1, part_number: 1 });
doeeetComponentSchema.index({ family_path: 1, obsolescence_type: 1 });
doeeetComponentSchema.index({ has_stock: 1, obsolescence_type: 1 });

// 文本搜索索引
doeeetComponentSchema.index({
  part_number: 'text',
  part_type: 'text',
  manufacturer_name: 'text',
  description: 'text'
}, {
  weights: {
    part_number: 10,
    part_type: 8,
    manufacturer_name: 6,
    description: 3
  },
  name: 'component_text_search'
});

// 虚拟字段 - 将has_stock转换为布尔值
doeeetComponentSchema.virtual('hasStockBoolean').get(function() {
  return this.has_stock === 'Yes';
});

// 虚拟字段 - 获取分类路径数组
doeeetComponentSchema.virtual('familyPathArray').get(function() {
  if (!this.family_path || this.family_path === '') {
    return [];
  }
  // 如果family_path包含分隔符，分割成数组
  return this.family_path.split('>').map(s => s.trim()).filter(s => s);
});

// 静态方法 - 高级搜索
doeeetComponentSchema.statics.advancedSearch = async function(options = {}) {
  const {
    searchTerm = '',
    manufacturer = '',
    partType = '',
    familyPath = '',
    obsolescenceType = '',
    hasStock = null,
    qualityName = '',
    qualified = '',
    page = 1,
    limit = 20,
    sortBy = 'updated_at',
    sortOrder = -1
  } = options;

  const pipeline = [];

  // 1. 文本搜索阶段
  if (searchTerm && searchTerm.trim()) {
    pipeline.push({
      $match: {
        $text: { $search: searchTerm }
      }
    });
    pipeline.push({
      $addFields: {
        searchScore: { $meta: 'textScore' }
      }
    });
  }

  // 2. 过滤阶段
  const matchConditions = {};
  
  if (manufacturer && manufacturer.trim()) {
    matchConditions.manufacturer_name = new RegExp(manufacturer, 'i');
  }
  
  if (partType && partType.trim()) {
    matchConditions.part_type = new RegExp(partType, 'i');
  }
  
  if (familyPath && familyPath.trim()) {
    matchConditions.family_path = new RegExp(familyPath, 'i');
  }
  
  if (obsolescenceType && obsolescenceType.trim()) {
    matchConditions.obsolescence_type = obsolescenceType;
  }
  
  if (hasStock !== null) {
    matchConditions.has_stock = hasStock ? 'Yes' : 'No';
  }
  
  if (qualityName && qualityName.trim()) {
    matchConditions.quality_name = new RegExp(qualityName, 'i');
  }
  
  if (qualified && qualified.trim()) {
    matchConditions.qualified = qualified;
  }

  if (Object.keys(matchConditions).length > 0) {
    pipeline.push({ $match: matchConditions });
  }

  // 3. 排序阶段
  const sortStage = {};
  if (searchTerm && searchTerm.trim()) {
    sortStage.searchScore = -1;
  }
  sortStage[sortBy] = sortOrder;
  pipeline.push({ $sort: sortStage });

  // 4. 分页
  const skip = (page - 1) * limit;
  
  // 使用facet同时获取数据和总数
  pipeline.push({
    $facet: {
      metadata: [
        { $count: 'total' }
      ],
      data: [
        { $skip: skip },
        { $limit: limit }
      ]
    }
  });

  const result = await this.aggregate(pipeline);
  
  const total = result[0].metadata[0]?.total || 0;
  const data = result[0].data || [];

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// 静态方法 - 获取统计信息
doeeetComponentSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        total: [
          { $count: 'count' }
        ],
        byManufacturer: [
          {
            $group: {
              _id: '$manufacturer_name',
              count: { $sum: 1 }
            }
          },
          { $match: { _id: { $ne: '' } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ],
        byObsolescence: [
          {
            $group: {
              _id: '$obsolescence_type',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ],
        withStock: [
          {
            $match: { has_stock: 'Yes' }
          },
          { $count: 'count' }
        ],
        byQuality: [
          {
            $group: {
              _id: '$quality_name',
              count: { $sum: 1 }
            }
          },
          { $match: { _id: { $ne: '' } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]
      }
    }
  ]);

  return {
    total: stats[0].total[0]?.count || 0,
    byManufacturer: stats[0].byManufacturer,
    byObsolescence: stats[0].byObsolescence,
    withStock: stats[0].withStock[0]?.count || 0,
    byQuality: stats[0].byQuality
  };
};

module.exports = mongoose.model('DoeeetComponent', doeeetComponentSchema);

