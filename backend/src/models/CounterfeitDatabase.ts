import mongoose, { Schema, Document } from 'mongoose';

// 假冒伪劣数据库接口
export interface ICounterfeitDatabase extends Document {
  _id: mongoose.Types.ObjectId;
  recordId: string; // 记录编号
  reportDate: Date; // 报告日期
  
  // 器件信息
  componentInfo: {
    partNumber: string; // 器件型号
    manufacturer: string; // 声称的制造商
    actualManufacturer?: string; // 实际制造商
    description: string; // 器件描述
    category: string; // 器件类别
    packageType: string; // 封装类型
  };
  
  // 假冒类型
  counterfeitType: {
    primaryType: 'remarked' | 'recycled' | 'cloned' | 'overproduced' | 'defective' | 'forged_docs';
    subType: string; // 子类型
    severity: 'critical' | 'major' | 'minor'; // 严重程度
    description: string; // 假冒描述
  };
  
  // 识别特征
  identificationFeatures: {
    // 物理特征
    physicalFeatures: {
      packageAbnormalities: string[]; // 封装异常
      markingIssues: string[]; // 标记问题
      leadCondition: string; // 引脚状态
      surfaceCondition: string; // 表面状态
      dimensionalVariations: string[]; // 尺寸变化
    };
    
    // 电气特征
    electricalFeatures: {
      parameterDeviations: {
        parameter: string;
        expectedValue: string;
        actualValue: string;
        deviation: string;
      }[];
      functionalFailures: string[]; // 功能失效
      performanceIssues: string[]; // 性能问题
    };
    
    // 文档特征
    documentationFeatures: {
      certificateIssues: string[]; // 证书问题
      labelingProblems: string[]; // 标签问题
      traceabilityGaps: string[]; // 可追溯性缺失
    };
  };
  
  // 检测方法
  detectionMethods: {
    visualInspection: {
      used: boolean;
      findings: string[];
      equipment: string[];
    };
    xrayInspection: {
      used: boolean;
      findings: string[];
      images: string[]; // X射线图像
    };
    electricalTesting: {
      used: boolean;
      testResults: {
        testName: string;
        expected: string;
        actual: string;
        result: 'pass' | 'fail';
      }[];
    };
    chemicalAnalysis: {
      used: boolean;
      analysisType: string[];
      results: string[];
    };
    decapsulation: {
      used: boolean;
      findings: string[];
      images: string[]; // 开封图像
    };
  };
  
  // 来源信息
  sourceInfo: {
    supplier: string; // 供应商
    supplierType: 'authorized' | 'unauthorized' | 'broker' | 'unknown';
    purchaseDate: Date; // 采购日期
    purchaseLocation: string; // 采购地点
    batchNumber?: string; // 批次号
    lotCode?: string; // 批号
    traceabilityChain: string[]; // 追溯链
  };
  
  // 影响评估
  impactAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    potentialFailures: string[]; // 潜在失效
    safetyImplications: string[]; // 安全影响
    economicImpact: {
      directCost: number; // 直接成本
      indirectCost: number; // 间接成本
      totalLoss: number; // 总损失
    };
    affectedApplications: string[]; // 受影响应用
  };
  
  // 报告信息
  reportInfo: {
    reportedBy: string; // 报告人
    reportingOrganization: string; // 报告机构
    contactInfo: {
      email: string;
      phone: string;
    };
    investigatedBy?: string; // 调查人
    verifiedBy?: string; // 验证人
    reportStatus: 'pending' | 'investigating' | 'verified' | 'closed';
  };
  
  // 预防措施
  preventiveMeasures: {
    supplierActions: string[]; // 供应商措施
    procurementActions: string[]; // 采购措施
    inspectionActions: string[]; // 检验措施
    documentationActions: string[]; // 文档措施
  };
  
  // 法律行动
  legalActions: {
    actionTaken: boolean;
    actionType: string[]; // 法律行动类型
    status: string; // 状态
    outcome?: string; // 结果
    documents: string[]; // 相关文档
  };
  
  // 相关案例
  relatedCases: {
    caseId: string;
    similarity: number; // 相似度 (0-100%)
    relationship: string; // 关系描述
  }[];
  
  // 证据文件
  evidenceFiles: {
    fileName: string;
    fileType: 'image' | 'document' | 'test_report' | 'video' | 'other';
    fileUrl: string;
    description: string;
    uploadDate: Date;
  }[];
  
  // 公开信息
  publicInfo: {
    isPublic: boolean; // 是否公开
    publicationDate?: Date; // 公开日期
    warningIssued: boolean; // 是否发出警告
    warningLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// 参数偏差Schema
const ParameterDeviationSchema = new Schema({
  parameter: { type: String, required: true },
  expectedValue: { type: String, required: true },
  actualValue: { type: String, required: true },
  deviation: { type: String, required: true }
}, { _id: false });

// 测试结果Schema
const TestResultSchema = new Schema({
  testName: { type: String, required: true },
  expected: { type: String, required: true },
  actual: { type: String, required: true },
  result: { 
    type: String, 
    required: true,
    enum: ['pass', 'fail']
  }
}, { _id: false });

// 经济影响Schema
const EconomicImpactSchema = new Schema({
  directCost: { type: Number, required: true },
  indirectCost: { type: Number, required: true },
  totalLoss: { type: Number, required: true }
}, { _id: false });

// 联系信息Schema
const ContactInfoSchema = new Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true }
}, { _id: false });

// 相关案例Schema
const RelatedCaseSchema = new Schema({
  caseId: { type: String, required: true },
  similarity: { type: Number, required: true, min: 0, max: 100 },
  relationship: { type: String, required: true }
}, { _id: false });

// 证据文件Schema
const EvidenceFileSchema = new Schema({
  fileName: { type: String, required: true },
  fileType: { 
    type: String, 
    required: true,
    enum: ['image', 'document', 'test_report', 'video', 'other']
  },
  fileUrl: { type: String, required: true },
  description: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
}, { _id: false });

// 假冒伪劣数据库Schema
const CounterfeitDatabaseSchema = new Schema<ICounterfeitDatabase>({
  recordId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  reportDate: {
    type: Date,
    required: true,
    index: true
  },
  
  // 器件信息
  componentInfo: {
    partNumber: { type: String, required: true, index: true },
    manufacturer: { type: String, required: true, index: true },
    actualManufacturer: { type: String },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    packageType: { type: String, required: true }
  },
  
  // 假冒类型
  counterfeitType: {
    primaryType: { 
      type: String, 
      required: true,
      enum: ['remarked', 'recycled', 'cloned', 'overproduced', 'defective', 'forged_docs'],
      index: true
    },
    subType: { type: String, required: true },
    severity: { 
      type: String, 
      required: true,
      enum: ['critical', 'major', 'minor'],
      index: true
    },
    description: { type: String, required: true }
  },
  
  // 识别特征
  identificationFeatures: {
    physicalFeatures: {
      packageAbnormalities: [{ type: String }],
      markingIssues: [{ type: String }],
      leadCondition: { type: String },
      surfaceCondition: { type: String },
      dimensionalVariations: [{ type: String }]
    },
    electricalFeatures: {
      parameterDeviations: [ParameterDeviationSchema],
      functionalFailures: [{ type: String }],
      performanceIssues: [{ type: String }]
    },
    documentationFeatures: {
      certificateIssues: [{ type: String }],
      labelingProblems: [{ type: String }],
      traceabilityGaps: [{ type: String }]
    }
  },
  
  // 检测方法
  detectionMethods: {
    visualInspection: {
      used: { type: Boolean, default: false },
      findings: [{ type: String }],
      equipment: [{ type: String }]
    },
    xrayInspection: {
      used: { type: Boolean, default: false },
      findings: [{ type: String }],
      images: [{ type: String }]
    },
    electricalTesting: {
      used: { type: Boolean, default: false },
      testResults: [TestResultSchema]
    },
    chemicalAnalysis: {
      used: { type: Boolean, default: false },
      analysisType: [{ type: String }],
      results: [{ type: String }]
    },
    decapsulation: {
      used: { type: Boolean, default: false },
      findings: [{ type: String }],
      images: [{ type: String }]
    }
  },
  
  // 来源信息
  sourceInfo: {
    supplier: { type: String, required: true, index: true },
    supplierType: { 
      type: String, 
      required: true,
      enum: ['authorized', 'unauthorized', 'broker', 'unknown'],
      index: true
    },
    purchaseDate: { type: Date, required: true },
    purchaseLocation: { type: String, required: true },
    batchNumber: { type: String },
    lotCode: { type: String },
    traceabilityChain: [{ type: String }]
  },
  
  // 影响评估
  impactAssessment: {
    riskLevel: { 
      type: String, 
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      index: true
    },
    potentialFailures: [{ type: String }],
    safetyImplications: [{ type: String }],
    economicImpact: EconomicImpactSchema,
    affectedApplications: [{ type: String }]
  },
  
  // 报告信息
  reportInfo: {
    reportedBy: { type: String, required: true },
    reportingOrganization: { type: String, required: true, index: true },
    contactInfo: ContactInfoSchema,
    investigatedBy: { type: String },
    verifiedBy: { type: String },
    reportStatus: { 
      type: String, 
      required: true,
      enum: ['pending', 'investigating', 'verified', 'closed'],
      index: true
    }
  },
  
  // 预防措施
  preventiveMeasures: {
    supplierActions: [{ type: String }],
    procurementActions: [{ type: String }],
    inspectionActions: [{ type: String }],
    documentationActions: [{ type: String }]
  },
  
  // 法律行动
  legalActions: {
    actionTaken: { type: Boolean, default: false },
    actionType: [{ type: String }],
    status: { type: String },
    outcome: { type: String },
    documents: [{ type: String }]
  },
  
  // 相关案例
  relatedCases: [RelatedCaseSchema],
  
  // 证据文件
  evidenceFiles: [EvidenceFileSchema],
  
  // 公开信息
  publicInfo: {
    isPublic: { type: Boolean, default: false, index: true },
    publicationDate: { type: Date },
    warningIssued: { type: Boolean, default: false },
    warningLevel: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'critical']
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
CounterfeitDatabaseSchema.index({ 
  'componentInfo.partNumber': 1, 
  'counterfeitType.primaryType': 1 
});
CounterfeitDatabaseSchema.index({ 
  'sourceInfo.supplier': 1, 
  'impactAssessment.riskLevel': 1 
});
CounterfeitDatabaseSchema.index({ 
  'reportInfo.reportStatus': 1, 
  'reportDate': -1 
});

export const CounterfeitDatabase = mongoose.model<ICounterfeitDatabase>('CounterfeitDatabase', CounterfeitDatabaseSchema);
