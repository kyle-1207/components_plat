import mongoose, { Schema, Document } from 'mongoose';

// 应用支持 - 功能单元模型
export interface IFunctionalUnit extends Document {
  _id: mongoose.Types.ObjectId;
  unitId: string;
  name: string;
  description: string;
  category: 'analog' | 'digital' | 'power' | 'rf' | 'mixed_signal' | 'interface';
  subcategory?: string;
  functionality: string;
  
  // 技术规格
  specifications: {
    inputVoltage?: {
      min: number;
      max: number;
      unit: string;
    };
    outputVoltage?: {
      min: number;
      max: number;
      unit: string;
    };
    frequency?: {
      min: number;
      max: number;
      unit: string;
    };
    power?: {
      typical: number;
      max: number;
      unit: string;
    };
    temperature?: {
      min: number;
      max: number;
      unit: string;
    };
    other?: Record<string, any>;
  };

  // 电路信息
  circuit: {
    schematicUrl?: string;
    layoutUrl?: string;
    simulationFiles?: string[];
    bomList?: {
      partNumber: string;
      manufacturer: string;
      quantity: number;
      reference: string;
      value?: string;
      tolerance?: string;
    }[];
  };

  // 设计文件
  designFiles: {
    fileName: string;
    fileType: 'schematic' | 'layout' | 'simulation' | 'document' | 'model';
    fileUrl: string;
    version: string;
    uploadedAt: Date;
  }[];

  // 验证信息
  verification: {
    status: 'not_verified' | 'in_progress' | 'verified' | 'failed';
    testResults?: string[];
    verifiedBy?: string;
    verificationDate?: Date;
    notes?: string;
  };

  // 使用信息
  usage: {
    applications: string[];
    restrictions?: string[];
    recommendations?: string[];
    bestPractices?: string[];
  };

  author: string;
  contributors: string[];
  version: string;
  license: 'open_source' | 'proprietary' | 'restricted';
  tags: string[];
  downloadCount: number;
  rating: {
    average: number;
    count: number;
  };
  status: 'draft' | 'published' | 'deprecated';
}

// 数字模型
export interface IDigitalModel extends Document {
  _id: mongoose.Types.ObjectId;
  modelId: string;
  name: string;
  description: string;
  componentId?: mongoose.Types.ObjectId;
  modelType: 'spice' | 'ibis' | 's_parameter' | 'thermal' | 'mechanical' | 'behavioral';
  
  // 模型文件
  modelFiles: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    version: string;
    format: string; // .lib, .ibs, .s2p, etc.
    uploadedAt: Date;
  }[];

  // 模型参数
  parameters: {
    name: string;
    value: number | string;
    unit?: string;
    description?: string;
    typical?: boolean;
  }[];

  // 验证数据
  validation: {
    status: 'not_validated' | 'validated' | 'failed';
    testData?: string[];
    correlationReport?: string;
    validatedBy?: string;
    validationDate?: Date;
  };

  // 适用条件
  conditions: {
    temperature?: {
      min: number;
      max: number;
      unit: string;
    };
    voltage?: {
      min: number;
      max: number;
      unit: string;
    };
    frequency?: {
      min: number;
      max: number;
      unit: string;
    };
    other?: Record<string, any>;
  };

  author: string;
  version: string;
  accuracy: 'high' | 'medium' | 'low';
  simulatorCompatibility: string[];
  tags: string[];
  downloadCount: number;
  status: 'active' | 'deprecated';
}

const FunctionalUnitSchema = new Schema({
  unitId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['analog', 'digital', 'power', 'rf', 'mixed_signal', 'interface'],
    index: true
  },
  subcategory: {
    type: String,
    index: true
  },
  functionality: {
    type: String,
    required: true,
    trim: true
  },
  specifications: {
    inputVoltage: {
      min: { type: Number },
      max: { type: Number },
      unit: { type: String, default: 'V' }
    },
    outputVoltage: {
      min: { type: Number },
      max: { type: Number },
      unit: { type: String, default: 'V' }
    },
    frequency: {
      min: { type: Number },
      max: { type: Number },
      unit: { type: String, default: 'Hz' }
    },
    power: {
      typical: { type: Number },
      max: { type: Number },
      unit: { type: String, default: 'W' }
    },
    temperature: {
      min: { type: Number },
      max: { type: Number },
      unit: { type: String, default: '°C' }
    },
    other: { type: Schema.Types.Mixed }
  },
  circuit: {
    schematicUrl: { type: String },
    layoutUrl: { type: String },
    simulationFiles: [{ type: String }],
    bomList: [{
      partNumber: { type: String, required: true },
      manufacturer: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      reference: { type: String, required: true },
      value: { type: String },
      tolerance: { type: String }
    }]
  },
  designFiles: [{
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true,
      enum: ['schematic', 'layout', 'simulation', 'document', 'model']
    },
    fileUrl: {
      type: String,
      required: true
    },
    version: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  verification: {
    status: {
      type: String,
      enum: ['not_verified', 'in_progress', 'verified', 'failed'],
      default: 'not_verified'
    },
    testResults: [{ type: String }],
    verifiedBy: { type: String },
    verificationDate: { type: Date },
    notes: { type: String }
  },
  usage: {
    applications: [{
      type: String,
      trim: true
    }],
    restrictions: [{
      type: String,
      trim: true
    }],
    recommendations: [{
      type: String,
      trim: true
    }],
    bestPractices: [{
      type: String,
      trim: true
    }]
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  contributors: [{
    type: String,
    trim: true
  }],
  version: {
    type: String,
    required: true,
    default: '1.0'
  },
  license: {
    type: String,
    enum: ['open_source', 'proprietary', 'restricted'],
    default: 'open_source'
  },
  tags: [{
    type: String,
    trim: true,
    index: true
  }],
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'deprecated'],
    default: 'draft',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const DigitalModelSchema = new Schema({
  modelId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  componentId: {
    type: Schema.Types.ObjectId,
    ref: 'Component',
    index: true
  },
  modelType: {
    type: String,
    required: true,
    enum: ['spice', 'ibis', 's_parameter', 'thermal', 'mechanical', 'behavioral'],
    index: true
  },
  modelFiles: [{
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0
    },
    version: {
      type: String,
      required: true
    },
    format: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  parameters: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: Schema.Types.Mixed,
      required: true
    },
    unit: { type: String },
    description: { type: String },
    typical: {
      type: Boolean,
      default: false
    }
  }],
  validation: {
    status: {
      type: String,
      enum: ['not_validated', 'validated', 'failed'],
      default: 'not_validated'
    },
    testData: [{ type: String }],
    correlationReport: { type: String },
    validatedBy: { type: String },
    validationDate: { type: Date }
  },
  conditions: {
    temperature: {
      min: { type: Number },
      max: { type: Number },
      unit: { type: String, default: '°C' }
    },
    voltage: {
      min: { type: Number },
      max: { type: Number },
      unit: { type: String, default: 'V' }
    },
    frequency: {
      min: { type: Number },
      max: { type: Number },
      unit: { type: String, default: 'Hz' }
    },
    other: { type: Schema.Types.Mixed }
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  version: {
    type: String,
    required: true,
    default: '1.0'
  },
  accuracy: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  simulatorCompatibility: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    index: true
  }],
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'deprecated'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
FunctionalUnitSchema.index({ name: 'text', description: 'text' });
FunctionalUnitSchema.index({ category: 1, status: 1 });
FunctionalUnitSchema.index({ downloadCount: -1 });
FunctionalUnitSchema.index({ 'rating.average': -1 });

DigitalModelSchema.index({ name: 'text', description: 'text' });
DigitalModelSchema.index({ modelType: 1, status: 1 });
DigitalModelSchema.index({ downloadCount: -1 });

// 虚拟字段
FunctionalUnitSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

DigitalModelSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export const FunctionalUnit = mongoose.model<IFunctionalUnit>('FunctionalUnit', FunctionalUnitSchema);
export const DigitalModel = mongoose.model<IDigitalModel>('DigitalModel', DigitalModelSchema);
