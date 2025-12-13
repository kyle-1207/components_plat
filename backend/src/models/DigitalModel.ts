import mongoose, { Schema, Document } from 'mongoose';

// 数字模型数据接口
export interface IDigitalModel extends Document {
  _id: mongoose.Types.ObjectId;
  modelId: string; // 模型编号
  componentId?: string; // 关联器件ID
  
  // 新增字段匹配前端表头
  componentCategory: string; // 器件类别
  componentName: string; // 器件名称
  modelSpecification: string; // 型号规格
  manufacturer: string; // 生产厂家
  modelCategory: string; // 模型类别
  modelPurpose: string; // 模型用途
  
  // 兼容旧字段
  componentPartNumber?: string; // 器件型号 (兼容)
  
  // 模型基本信息
  modelInfo?: {
    modelName: string; // 模型名称
    modelType: 'IBIS' | 'SPICE' | 'S-Parameter' | 'Thermal' | 'Mechanical' | 'Other'; // 模型类型
    modelVersion: string; // 模型版本
    description: string; // 模型描述
    keywords: string[]; // 关键词
  };
  
  // IBIS模型特定信息
  ibisModel?: {
    ibisVersion: string; // IBIS版本
    component: string; // 器件名称
    manufacturer: string; // 制造商
    pins: {
      pinNumber: string;
      pinName: string;
      modelName: string;
      signalType: 'Input' | 'Output' | 'I/O' | 'Power' | 'Ground';
    }[];
    models: {
      modelName: string;
      modelType: string;
      polarity: 'Inverting' | 'Non-Inverting';
      enable: string;
      vinl: number; // 输入低电平阈值
      vinh: number; // 输入高电平阈值
      vmeas: number; // 测量电压
      cref: number; // 参考电容
      rref: number; // 参考电阻
      vref: number; // 参考电压
    }[];
    packageModel?: {
      resistance: number; // 封装电阻
      inductance: number; // 封装电感
      capacitance: number; // 封装电容
    };
  };
  
  // SPICE模型特定信息
  spiceModel?: {
    spiceVersion: string; // SPICE版本
    modelLevel: number; // 模型等级
    modelParameters: {
      [key: string]: number | string; // 模型参数
    };
    subcircuit?: {
      name: string;
      nodes: string[];
      netlist: string; // 子电路网表
    };
    temperatureRange: {
      min: number;
      max: number;
      nominal: number;
    };
    frequencyRange?: {
      min: number; // Hz
      max: number; // Hz
    };
  };
  
  // S参数模型特定信息
  sParameterModel?: {
    frequency: number[]; // 频率点 (Hz)
    ports: number; // 端口数
    impedance: number; // 特征阻抗
    sParameters: {
      frequency: number;
      s11: { real: number; imag: number };
      s12: { real: number; imag: number };
      s21: { real: number; imag: number };
      s22: { real: number; imag: number };
      // 可扩展到更多端口
    }[];
    format: 'Touchstone' | 'CITI' | 'Other';
    dataFormat: 'MA' | 'DB' | 'RI'; // 幅度角度/分贝/实虚部
  };
  
  // 模型文件信息
  fileInfo: {
    fileName: string; // 文件名
    fileSize: number; // 文件大小 (bytes)
    fileUrl?: string; // 文件URL
    fileFormat: string; // 文件格式
    checksum?: string; // 文件校验和
    uploadDate?: Date; // 上传日期
  };
  
  // 验证信息
  validation?: {
    isValidated: boolean; // 是否已验证
    validationDate?: Date; // 验证日期
    validatedBy?: string; // 验证人
    validationMethod?: string; // 验证方法
    validationResults?: {
      accuracy: number; // 精度 (%)
      frequencyRange: string; // 频率范围
      temperatureRange: string; // 温度范围
      notes: string; // 验证备注
    };
    testBench?: {
      circuitDescription: string; // 测试电路描述
      testConditions: string; // 测试条件
      measurementSetup: string; // 测量设置
    };
  };
  
  // 应用信息
  applicationInfo: {
    simulationTools: string[]; // 支持的仿真工具
    applicationAreas: string[]; // 应用领域
    designExamples: {
      exampleName: string;
      description: string;
      fileUrl?: string;
    }[];
    limitations: string[]; // 使用限制
    recommendations: string[]; // 使用建议
  };
  
  // 版本管理
  versionControl: {
    version: string;
    changeLog: string;
    previousVersion?: string;
    isLatest: boolean;
    deprecationDate?: Date;
  };
  
  // 共享和权限
  sharing: {
    isPublic: boolean; // 是否公开
    accessLevel: 'public' | 'registered' | 'authorized' | 'private';
    contributors: string[]; // 贡献者
    downloadCount: number; // 下载次数
    rating: {
      averageRating: number; // 平均评分
      ratingCount: number; // 评分人数
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// IBIS引脚Schema
const IBISPinSchema = new Schema({
  pinNumber: { type: String, required: true },
  pinName: { type: String, required: true },
  modelName: { type: String, required: true },
  signalType: { 
    type: String, 
    required: true,
    enum: ['Input', 'Output', 'I/O', 'Power', 'Ground']
  }
}, { _id: false });

// IBIS模型Schema
const IBISModelSchema = new Schema({
  modelName: { type: String, required: true },
  modelType: { type: String, required: true },
  polarity: { 
    type: String, 
    enum: ['Inverting', 'Non-Inverting']
  },
  enable: { type: String },
  vinl: { type: Number },
  vinh: { type: Number },
  vmeas: { type: Number },
  cref: { type: Number },
  rref: { type: Number },
  vref: { type: Number }
}, { _id: false });

// S参数数据Schema
const SParameterDataSchema = new Schema({
  frequency: { type: Number, required: true },
  s11: {
    real: { type: Number, required: true },
    imag: { type: Number, required: true }
  },
  s12: {
    real: { type: Number, required: true },
    imag: { type: Number, required: true }
  },
  s21: {
    real: { type: Number, required: true },
    imag: { type: Number, required: true }
  },
  s22: {
    real: { type: Number, required: true },
    imag: { type: Number, required: true }
  }
}, { _id: false });

// 设计示例Schema
const DesignExampleSchema = new Schema({
  exampleName: { type: String, required: true },
  description: { type: String, required: true },
  fileUrl: { type: String }
}, { _id: false });

// 数字模型Schema
const DigitalModelSchema = new Schema<IDigitalModel>({
  modelId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  componentId: {
    type: String,
    index: true
  },
  
  // 新增字段
  componentCategory: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  componentName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  modelSpecification: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  modelCategory: {
    type: String,
    required: true,
    enum: ['IBIS', 'SPICE', 'S-Parameter', 'Thermal', 'Mechanical', 'Other'],
    index: true
  },
  modelPurpose: {
    type: String,
    required: true,
    trim: true
  },
  
  // 兼容旧字段
  componentPartNumber: {
    type: String,
    trim: true,
    index: true
  },
  
  // 模型基本信息
  modelInfo: {
    modelName: { type: String, required: true },
    modelType: { 
      type: String, 
      required: true,
      enum: ['IBIS', 'SPICE', 'S-Parameter', 'Thermal', 'Mechanical', 'Other'],
      index: true
    },
    modelVersion: { type: String, required: true },
    description: { type: String, required: true },
    keywords: [{ type: String }]
  },
  
  // IBIS模型
  ibisModel: {
    ibisVersion: { type: String },
    component: { type: String },
    manufacturer: { type: String },
    pins: [IBISPinSchema],
    models: [IBISModelSchema],
    packageModel: {
      resistance: { type: Number },
      inductance: { type: Number },
      capacitance: { type: Number }
    }
  },
  
  // SPICE模型
  spiceModel: {
    spiceVersion: { type: String },
    modelLevel: { type: Number },
    modelParameters: { type: Schema.Types.Mixed },
    subcircuit: {
      name: { type: String },
      nodes: [{ type: String }],
      netlist: { type: String }
    },
    temperatureRange: {
      min: { type: Number },
      max: { type: Number },
      nominal: { type: Number }
    },
    frequencyRange: {
      min: { type: Number },
      max: { type: Number }
    }
  },
  
  // S参数模型
  sParameterModel: {
    frequency: [{ type: Number }],
    ports: { type: Number },
    impedance: { type: Number },
    sParameters: [SParameterDataSchema],
    format: { 
      type: String, 
      enum: ['Touchstone', 'CITI', 'Other'] 
    },
    dataFormat: { 
      type: String, 
      enum: ['MA', 'DB', 'RI'] 
    }
  },
  
  // 文件信息
  fileInfo: {
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileUrl: { type: String },
    fileFormat: { type: String, required: true },
    checksum: { type: String },
    uploadDate: { type: Date, default: Date.now }
  },
  
  // 验证信息
  validation: {
    isValidated: { type: Boolean, default: false, index: true },
    validationDate: { type: Date },
    validatedBy: { type: String },
    validationMethod: { type: String },
    validationResults: {
      accuracy: { type: Number },
      frequencyRange: { type: String },
      temperatureRange: { type: String },
      notes: { type: String }
    },
    testBench: {
      circuitDescription: { type: String },
      testConditions: { type: String },
      measurementSetup: { type: String }
    }
  },
  
  // 应用信息
  applicationInfo: {
    simulationTools: [{ type: String }],
    applicationAreas: [{ type: String }],
    designExamples: [DesignExampleSchema],
    limitations: [{ type: String }],
    recommendations: [{ type: String }]
  },
  
  // 版本控制
  versionControl: {
    version: { type: String, required: true },
    changeLog: { type: String, required: true },
    previousVersion: { type: String },
    isLatest: { type: Boolean, default: true, index: true },
    deprecationDate: { type: Date }
  },
  
  // 共享和权限
  sharing: {
    isPublic: { type: Boolean, default: false, index: true },
    accessLevel: { 
      type: String, 
      required: true,
      enum: ['public', 'registered', 'authorized', 'private'],
      index: true
    },
    contributors: [{ type: String }],
    downloadCount: { type: Number, default: 0 },
    rating: {
      averageRating: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// 复合索引
DigitalModelSchema.index({ componentPartNumber: 1, 'modelInfo.modelType': 1 });
DigitalModelSchema.index({ 'sharing.isPublic': 1, 'validation.isValidated': 1 });
DigitalModelSchema.index({ manufacturer: 1, 'versionControl.isLatest': 1 });

export const DigitalModel = mongoose.model<IDigitalModel>('DigitalModel', DigitalModelSchema);
