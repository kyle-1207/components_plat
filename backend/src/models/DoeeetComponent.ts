import mongoose, { Schema, Document } from 'mongoose';

/**
 * DoEEEt组件接口
 * 对应 doeet.components 集合
 */
export interface IDoeeetComponent extends Document {
  component_id: string;           // 组件唯一ID
  family_path: string[];          // 分类路径 (JSON数组)
  part_number: string;            // 型号
  part_type: string;              // 产品类型
  manufacturer_name: string;      // 制造商
  obsolescence_type: string;      // 淘汰状态: Active, Last Time Buy, Obsolete, Risk
  has_stock: boolean;             // 是否有库存
  cad_available: boolean;         // CAD模型可用性
  quality_name?: string;          // 质量等级
  qualified?: string;             // 是否合格 (Y/N)
  qpl_name?: string;              // QPL清单名称
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DoEEEt参数接口
 * 对应 doeet.parameters 集合
 */
export interface IDoeeetParameter extends Document {
  component_id: string;           // 关联组件ID
  parameter_key: string;          // 参数键 (UUID)
  parameter_value: string;        // 参数值
  numeric_value?: number;         // 数值型参数 (用于范围搜索)
  createdAt: Date;
}

/**
 * DoEEEt参数定义接口
 * 对应 doeet.parameter_definitions 集合
 */
export interface IDoeeetParameterDefinition extends Document {
  parameter_key: string;          // 参数键 (UUID)
  category: string;               // 参数分类
  name: string;                   // 参数名称
  short_name?: string;            // 参数简称
  example?: string;               // 示例值
}

/**
 * DoEEEt产品族元数据接口
 * 对应 doeet.families 集合
 */
export interface IDoeeetFamily extends Document {
  family_id: string;              // 产品族ID
  family_path: string[];          // 产品族路径
  meta: Array<{
    key: string;                  // 参数键
    name: string;                 // 参数名
    shortName?: string;           // 参数简称
  }>;
}

// ============ Mongoose Schemas ============

/**
 * DoEEEt组件 Schema
 */
const DoeeetComponentSchema = new Schema<IDoeeetComponent>({
  component_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  family_path: {
    type: [String],
    required: true,
    index: true
  },
  part_number: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  part_type: {
    type: String,
    required: true,
    trim: true
  },
  manufacturer_name: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  obsolescence_type: {
    type: String,
    required: true,
    enum: ['Active', 'Last Time Buy', 'Obsolete', 'Risk', 'Unknown'],
    default: 'Unknown',
    index: true
  },
  has_stock: {
    type: Boolean,
    required: true,
    default: false,
    index: true
  },
  cad_available: {
    type: Boolean,
    default: false
  },
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
  }
}, {
  timestamps: true,
  collection: 'components',  // 指定集合名称
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// 全文搜索索引
DoeeetComponentSchema.index({ 
  part_number: 'text', 
  part_type: 'text',
  manufacturer_name: 'text' 
}, { 
  weights: {
    part_number: 10,      // 型号权重最高
    part_type: 5,         // 产品类型次之
    manufacturer_name: 3  // 制造商再次之
  },
  name: 'component_text_index'
});

// 复合索引优化查询
DoeeetComponentSchema.index({ manufacturer_name: 1, has_stock: 1 });
DoeeetComponentSchema.index({ family_path: 1, obsolescence_type: 1 });

/**
 * DoEEEt参数 Schema
 */
const DoeeetParameterSchema = new Schema<IDoeeetParameter>({
  component_id: {
    type: String,
    required: true,
    index: true
  },
  parameter_key: {
    type: String,
    required: true,
    index: true
  },
  parameter_value: {
    type: String,
    required: true
  },
  numeric_value: {
    type: Number,
    index: true  // 支持范围查询
  }
}, {
  timestamps: true,
  collection: 'parameters',
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// 复合索引：组件ID + 参数键
DoeeetParameterSchema.index({ component_id: 1, parameter_key: 1 });
// 参数搜索索引
DoeeetParameterSchema.index({ parameter_key: 1, parameter_value: 1 });
DoeeetParameterSchema.index({ parameter_key: 1, numeric_value: 1 });

/**
 * DoEEEt参数定义 Schema
 */
const DoeeetParameterDefinitionSchema = new Schema<IDoeeetParameterDefinition>({
  parameter_key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  short_name: {
    type: String
  },
  example: {
    type: String
  }
}, {
  collection: 'parameter_definitions',
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * DoEEEt产品族 Schema
 */
const DoeeetFamilySchema = new Schema<IDoeeetFamily>({
  family_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  family_path: {
    type: [String],
    required: true,
    index: true
  },
  meta: [{
    key: { type: String, required: true },
    name: { type: String, required: true },
    shortName: { type: String }
  }]
}, {
  collection: 'families',
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// ============ 实例方法 ============

/**
 * 获取组件的完整分类路径字符串
 */
DoeeetComponentSchema.methods.getFullPath = function(): string {
  return this.family_path.join(' > ');
};

/**
 * 检查组件是否停产
 */
DoeeetComponentSchema.methods.isObsolete = function(): boolean {
  return this.obsolescence_type === 'Obsolete' || 
         this.obsolescence_type === 'Last Time Buy';
};

/**
 * 检查组件是否有风险
 */
DoeeetComponentSchema.methods.isAtRisk = function(): boolean {
  return this.obsolescence_type === 'Risk' || 
         this.obsolescence_type === 'Last Time Buy';
};

// ============ 静态方法 ============

/**
 * 按型号搜索
 */
DoeeetComponentSchema.statics.findByPartNumber = function(partNumber: string) {
  return this.find({ 
    part_number: new RegExp(partNumber, 'i') 
  });
};

/**
 * 按制造商搜索
 */
DoeeetComponentSchema.statics.findByManufacturer = function(manufacturer: string) {
  return this.find({ 
    manufacturer_name: new RegExp(manufacturer, 'i') 
  });
};

/**
 * 按分类路径搜索
 */
DoeeetComponentSchema.statics.findByFamilyPath = function(familyPath: string | string[]) {
  if (typeof familyPath === 'string') {
    // 模糊匹配分类
    return this.find({ 
      family_path: new RegExp(familyPath, 'i') 
    });
  } else {
    // 精确匹配分类路径
    return this.find({ 
      family_path: familyPath 
    });
  }
};

/**
 * 查找有库存的组件
 */
DoeeetComponentSchema.statics.findInStock = function() {
  return this.find({ has_stock: true });
};

/**
 * 查找活跃（非停产）组件
 */
DoeeetComponentSchema.statics.findActive = function() {
  return this.find({ obsolescence_type: 'Active' });
};

/**
 * 全文搜索
 */
DoeeetComponentSchema.statics.fullTextSearch = function(query: string, limit: number = 20) {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit);
};

// ============ 导出模型 ============

// 使用 doeet 数据库连接
export const DoeeetComponent = mongoose.model<IDoeeetComponent>(
  'DoeeetComponent', 
  DoeeetComponentSchema
);

export const DoeeetParameter = mongoose.model<IDoeeetParameter>(
  'DoeeetParameter',
  DoeeetParameterSchema
);

export const DoeeetParameterDefinition = mongoose.model<IDoeeetParameterDefinition>(
  'DoeeetParameterDefinition',
  DoeeetParameterDefinitionSchema
);

export const DoeeetFamily = mongoose.model<IDoeeetFamily>(
  'DoeeetFamily',
  DoeeetFamilySchema
);

