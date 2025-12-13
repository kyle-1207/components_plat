import mongoose, { Schema, Document } from 'mongoose';

// 合格产品目录数据接口
export interface IQualifiedProductList extends Document {
  _id: mongoose.Types.ObjectId;
  qplId: string; // QPL编号
  listName: string; // 目录名称
  listType: 'QPL' | 'QML' | 'QPLD'; // QPL/QML/QPLD
  
  // 认证机构信息
  certificationAuthority: {
    organization: string; // 认证机构 (NASA/ESA/JAXA/CNSA等)
    department: string; // 部门
    contactInfo: {
      address: string;
      phone: string;
      email: string;
      website: string;
    };
  };
  
  // 认证标准
  certificationStandards: {
    primaryStandard: string; // 主要标准
    additionalStandards: string[]; // 附加标准
    testRequirements: string[]; // 测试要求
    qualityRequirements: string[]; // 质量要求
  };
  
  // 合格产品信息
  qualifiedProducts: {
    productId: string;
    componentPartNumber: string; // 器件型号
    manufacturer: string; // 制造商
    manufacturerCode: string; // 制造商代码
    
    // 产品分类
    category: string; // 产品类别
    subcategory: string; // 子类别
    functionGroup: string; // 功能组
    
    // 认证信息
    certificationInfo: {
      certificationLevel: string; // 认证等级
      certificationDate: Date; // 认证日期
      expiryDate: Date; // 到期日期
      certificateNumber: string; // 证书编号
      isActive: boolean; // 是否有效
    };
    
    // 质量等级
    qualityLevel: {
      level: string; // 质量等级 (宇航级/军用级等)
      reliabilityLevel: string; // 可靠性等级
      screeningLevel: string; // 筛选等级
      radiationLevel?: string; // 抗辐照等级
    };
    
    // 测试数据
    testData: {
      testReports: string[]; // 测试报告
      qualificationTestDate: Date; // 鉴定试验日期
      reliabilityTestDate?: Date; // 可靠性试验日期
      radiationTestDate?: Date; // 辐照试验日期
      testLab: string; // 测试实验室
    };
    
    // 应用限制
    applicationRestrictions: {
      temperatureRange: {
        min: number;
        max: number;
      };
      voltageRange: {
        min: number;
        max: number;
      };
      frequencyRange?: {
        min: number;
        max: number;
      };
      environmentalLimits: string[];
      usageRestrictions: string[];
    };
    
    // 供应商信息
    supplierInfo: {
      authorizedDistributors: string[]; // 授权分销商
      directSupplier: boolean; // 是否可直接供货
      leadTime: number; // 交货周期 (天)
      minimumOrderQuantity: number; // 最小订货量
    };
  }[];
  
  // 目录状态
  listStatus: {
    status: 'active' | 'suspended' | 'withdrawn' | 'under_review';
    lastUpdateDate: Date;
    nextReviewDate: Date;
    version: string;
    changeHistory: {
      version: string;
      changeDate: Date;
      changeType: 'addition' | 'removal' | 'modification' | 'status_change';
      changedItems: string[];
      changeReason: string;
      approvedBy: string;
    }[];
  };
  
  // 查询统计
  queryStats: {
    totalQueries: number;
    monthlyQueries: number;
    topQueriedProducts: {
      productId: string;
      queryCount: number;
    }[];
    lastQueryDate: Date;
  };
  
  // 订阅管理
  subscriptions: {
    userId: string;
    userEmail: string;
    subscriptionType: 'all_updates' | 'additions' | 'modifications' | 'status_changes';
    isActive: boolean;
    subscribedAt: Date;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

// 联系信息Schema
const ContactInfoSchema = new Schema({
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  website: { type: String }
}, { _id: false });

// 认证信息Schema
const CertificationInfoSchema = new Schema({
  certificationLevel: { type: String, required: true },
  certificationDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true, index: true },
  certificateNumber: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true, index: true }
}, { _id: false });

// 质量等级Schema
const QualityLevelSchema = new Schema({
  level: { type: String, required: true },
  reliabilityLevel: { type: String, required: true },
  screeningLevel: { type: String, required: true },
  radiationLevel: { type: String }
}, { _id: false });

// 测试数据Schema
const TestDataSchema = new Schema({
  testReports: [{ type: String }],
  qualificationTestDate: { type: Date, required: true },
  reliabilityTestDate: { type: Date },
  radiationTestDate: { type: Date },
  testLab: { type: String, required: true }
}, { _id: false });

// 应用限制Schema
const ApplicationRestrictionsSchema = new Schema({
  temperatureRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  voltageRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  frequencyRange: {
    min: { type: Number },
    max: { type: Number }
  },
  environmentalLimits: [{ type: String }],
  usageRestrictions: [{ type: String }]
}, { _id: false });

// 供应商信息Schema
const SupplierInfoSchema = new Schema({
  authorizedDistributors: [{ type: String }],
  directSupplier: { type: Boolean, default: false },
  leadTime: { type: Number, required: true },
  minimumOrderQuantity: { type: Number, required: true }
}, { _id: false });

// 合格产品Schema
const QualifiedProductSchema = new Schema({
  productId: { type: String, required: true },
  componentPartNumber: { type: String, required: true, index: true },
  manufacturer: { type: String, required: true, index: true },
  manufacturerCode: { type: String, required: true },
  category: { type: String, required: true, index: true },
  subcategory: { type: String, required: true },
  functionGroup: { type: String, required: true },
  certificationInfo: CertificationInfoSchema,
  qualityLevel: QualityLevelSchema,
  testData: TestDataSchema,
  applicationRestrictions: ApplicationRestrictionsSchema,
  supplierInfo: SupplierInfoSchema
}, { _id: false });

// 变更历史Schema
const ChangeHistorySchema = new Schema({
  version: { type: String, required: true },
  changeDate: { type: Date, required: true },
  changeType: { 
    type: String, 
    required: true,
    enum: ['addition', 'removal', 'modification', 'status_change']
  },
  changedItems: [{ type: String }],
  changeReason: { type: String, required: true },
  approvedBy: { type: String, required: true }
}, { _id: false });

// 查询统计中的产品统计Schema
const TopQueriedProductSchema = new Schema({
  productId: { type: String, required: true },
  queryCount: { type: Number, required: true }
}, { _id: false });

// 订阅Schema
const SubscriptionSchema = new Schema({
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  subscriptionType: { 
    type: String, 
    required: true,
    enum: ['all_updates', 'additions', 'modifications', 'status_changes']
  },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now }
}, { _id: false });

// 合格产品目录Schema
const QualifiedProductListSchema = new Schema<IQualifiedProductList>({
  qplId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  listName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  listType: {
    type: String,
    required: true,
    enum: ['QPL', 'QML', 'QPLD'],
    index: true
  },
  
  // 认证机构信息
  certificationAuthority: {
    organization: { type: String, required: true, index: true },
    department: { type: String, required: true },
    contactInfo: ContactInfoSchema
  },
  
  // 认证标准
  certificationStandards: {
    primaryStandard: { type: String, required: true },
    additionalStandards: [{ type: String }],
    testRequirements: [{ type: String }],
    qualityRequirements: [{ type: String }]
  },
  
  // 合格产品
  qualifiedProducts: [QualifiedProductSchema],
  
  // 目录状态
  listStatus: {
    status: { 
      type: String, 
      required: true,
      enum: ['active', 'suspended', 'withdrawn', 'under_review'],
      index: true
    },
    lastUpdateDate: { type: Date, required: true },
    nextReviewDate: { type: Date, required: true, index: true },
    version: { type: String, required: true },
    changeHistory: [ChangeHistorySchema]
  },
  
  // 查询统计
  queryStats: {
    totalQueries: { type: Number, default: 0 },
    monthlyQueries: { type: Number, default: 0 },
    topQueriedProducts: [TopQueriedProductSchema],
    lastQueryDate: { type: Date }
  },
  
  // 订阅管理
  subscriptions: [SubscriptionSchema]
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
QualifiedProductListSchema.index({ 
  'qualifiedProducts.componentPartNumber': 1, 
  'listStatus.status': 1 
});
QualifiedProductListSchema.index({ 
  'certificationAuthority.organization': 1, 
  'listType': 1 
});
QualifiedProductListSchema.index({ 
  'qualifiedProducts.certificationInfo.expiryDate': 1, 
  'qualifiedProducts.certificationInfo.isActive': 1 
});

export const QualifiedProductList = mongoose.model<IQualifiedProductList>('QualifiedProductList', QualifiedProductListSchema);
