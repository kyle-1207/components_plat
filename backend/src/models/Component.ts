import mongoose, { Schema, Document } from 'mongoose';
import { 
  ComponentData, 
  ComponentSpecifications, 
  ComponentPricing, 
  ComponentAvailability,
  QualityLevel,
  RadiationHardness,
  TemperatureGrade,
  PackageType,
  LifecycleStatus,
  DocumentReference,
  RadiationTestReference
} from '../types';

export interface IComponent extends Omit<ComponentData, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const ComponentSpecificationsSchema = new Schema({}, { strict: false });

const ComponentPricingSchema = new Schema({
  supplier: { type: String, required: true },
  currency: { type: String, required: true, default: 'USD' },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  leadTime: { type: Number, min: 0 } // 交期（天数）
}, { _id: false });

const ComponentAvailabilitySchema = new Schema({
  supplier: { type: String, required: true },
  stockQuantity: { type: Number, required: true, min: 0 },
  location: { type: String },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

// 文档引用Schema
const DocumentReferenceSchema = new Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['datasheet', 'certificate', 'report', 'standard']
  },
  title: { type: String, required: true },
  url: { type: String, required: true },
  version: { type: String },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

// 辐照测试引用Schema
const RadiationTestReferenceSchema = new Schema({
  id: { type: String, required: true },
  testType: { 
    type: String, 
    required: true,
    enum: ['tid', 'see', 'dd', 'neutron', 'proton']
  },
  testDate: { type: Date, required: true },
  testLab: { type: String, required: true },
  certificationLevel: { type: String, required: true },
  reportUrl: { type: String },
  summary: { type: String, required: true }
}, { _id: false });



const ComponentSchema = new Schema<IComponent>({
  partNumber: {
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
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  // 三级分类系统
  mainCategory: {
    type: String,
    required: true,
    trim: true,
    index: true,
    enum: [
      '模拟单片集成电路',
      '数字单片集成电路', 
      '混合集成电路',
      '半导体分立器件',
      '固态微波器件与电路',
      '真空电子器件',
      '光电子器件',
      '机电组件',
      '电能源',
      '通用与特种元件',
      '微系统'
    ]
  },
  category1: {
    type: String,
    trim: true,
    index: true
  },
  category2: {
    type: String,
    trim: true,
    index: true
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  datasheet: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  specifications: {
    type: ComponentSpecificationsSchema,
    default: {}
  },
  pricing: [ComponentPricingSchema],
  availability: [ComponentAvailabilitySchema],
  
  // ===== 航天器件专用字段 =====
  
  // 质量等级
  qualityLevel: {
    type: String,
    enum: ['SPACE', 'MIL', 'HIREL', 'COMMERCIAL', 'AUTOMOTIVE', 'INDUSTRIAL'],
    index: true
  },
  
  // 辐射抗性
  radiationHardness: {
    type: String,
    enum: Object.values(RadiationHardness),
    index: true
  },
  
  // 温度等级
  temperatureGrade: {
    type: String,
    enum: Object.values(TemperatureGrade),
    index: true
  },
  
  // 封装类型
  packageType: {
    type: String,
    enum: Object.values(PackageType),
    index: true
  },
  
  // 生命周期状态
  lifecycleStatus: {
    type: String,
    enum: ['DEVELOPMENT', 'ACTIVE', 'NRND', 'EOL', 'OBSOLETE'],
    required: true,
    index: true
  },
  
  // 认证信息
  certifications: [{
    type: { type: String, required: true },
    number: { type: String, required: true },
    issuedBy: { type: String, required: true },
    issuedDate: { type: Date, required: true },
    expiryDate: { type: Date },
    status: { 
      type: String, 
      enum: ['valid', 'expired', 'suspended', 'revoked'],
      default: 'valid'
    }
  }],
  
  // 质量等级详细信息
  qualityGrade: {
    screening: { type: String }, // 筛选等级
    testing: { type: String },   // 测试等级
    reliability: { type: String } // 可靠性等级
  },
  
  // 辐照测试信息
  radiationTests: [RadiationTestReferenceSchema],
  

  
  // 相关文档
  documents: [DocumentReferenceSchema],
  
  // 标准符合性
  standardCompliance: [{
    standardCode: { type: String, required: true },
    standardType: { 
      type: String, 
      enum: ['MIL', 'ESCC', 'ISO', 'IEC', 'GB', 'GJB', 'JEDEC', 'NASA'],
      required: true 
    },
    complianceLevel: { type: String, required: true },
    verificationDate: { type: Date },
    notes: { type: String }
  }],
  
  // 供应链信息
  supplyChain: {
    primarySupplier: { type: String },
    alternativeSuppliers: [{ type: String }],
    leadTimeWeeks: { type: Number, min: 0 },
    minimumOrderQuantity: { type: Number, min: 1 },
    availability: { 
      type: String, 
      enum: ['in_stock', 'limited', 'long_lead', 'obsolete', 'unknown'],
      default: 'unknown'
    }
  },
  
  // 技术特性
  technicalSpecs: {
    operatingTemp: {
      min: { type: Number },
      max: { type: Number },
      unit: { type: String, default: '°C' }
    },
    storageTemp: {
      min: { type: Number },
      max: { type: Number },
      unit: { type: String, default: '°C' }
    },
    powerConsumption: {
      typical: { type: Number },
      maximum: { type: Number },
      unit: { type: String, default: 'W' }
    },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      unit: { type: String, default: 'mm' }
    },
    weight: {
      value: { type: Number },
      unit: { type: String, default: 'g' }
    }
  },
  
  // 可靠性数据
  reliability: {
    mtbf: { type: Number }, // 平均故障间隔时间 (hours)
    failureRate: { type: Number }, // 故障率 (FIT)
    confidenceLevel: { type: Number }, // 置信度 (%)
    testHours: { type: Number }, // 测试小时数
    lastUpdated: { type: Date }
  },
  
  // 元数据
  metadata: {
    isObsolete: { type: Boolean, default: false },
    isRestricted: { type: Boolean, default: false }, // 是否受出口管制
    isPreferred: { type: Boolean, default: false },  // 是否为首选器件
    riskLevel: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    tags: [{ type: String }], // 自定义标签
    notes: { type: String },  // 备注信息
    lastReviewed: { type: Date }, // 最后审查日期
    reviewedBy: { type: String }  // 审查人
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

// 索引
ComponentSchema.index({ partNumber: 'text', name: 'text', description: 'text' });
ComponentSchema.index({ category: 1, manufacturer: 1 });
ComponentSchema.index({ 'availability.stockQuantity': 1 });

// 航天器件专用索引
ComponentSchema.index({ qualityLevel: 1, radiationHardness: 1 });
ComponentSchema.index({ temperatureGrade: 1, packageType: 1 });
ComponentSchema.index({ lifecycleStatus: 1 });
ComponentSchema.index({ 'metadata.isObsolete': 1 });
ComponentSchema.index({ 'metadata.isRestricted': 1 });
ComponentSchema.index({ 'metadata.riskLevel': 1 });
ComponentSchema.index({ 'supplyChain.availability': 1 });
ComponentSchema.index({ 'standardCompliance.standardCode': 1 });

ComponentSchema.index({ 'radiationTests.testType': 1 });

// 实例方法
ComponentSchema.methods.getAvailableStock = function(): number {
  return this.availability.reduce((total: number, item: ComponentAvailability) => {
    return total + item.stockQuantity;
  }, 0);
};

ComponentSchema.methods.getBestPrice = function(): ComponentPricing | null {
  if (!this.pricing || this.pricing.length === 0) return null;
  
  return this.pricing.reduce((best: ComponentPricing, current: ComponentPricing) => {
    if (current.price < best.price) return current;
    return best;
  });
};

// 静态方法
ComponentSchema.statics.findByCategory = function(category: string) {
  return this.find({ category: new RegExp(category, 'i') });
};

ComponentSchema.statics.findInStock = function() {
  return this.find({ 'availability.stockQuantity': { $gt: 0 } });
};

ComponentSchema.statics.searchComponents = function(query: string) {
  return this.find({
    $text: { $search: query }
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

// ===== 航天器件专用方法 =====

// 实例方法
ComponentSchema.methods.getQualityRisk = function(): string {
  // 计算质量风险等级
  let riskScore = 0;
  
  // 生命周期状态风险
  const lifecycleRisks: Record<string, number> = {
    'DEVELOPMENT': 3,
    'ACTIVE': 0,
    'NRND': 2,
    'EOL': 4,
    'OBSOLETE': 5
  };
  riskScore += lifecycleRisks[this.lifecycleStatus] || 0;
  
  // 质量问题风险
  const openIssues: any[] = [];
  riskScore += openIssues.length;
  
  // 严重质量问题额外风险
  const criticalIssues = openIssues.filter((issue: any) => 
    issue.severity === 'critical' || issue.severity === 'major'
  );
  riskScore += criticalIssues.length * 2;
  
  // 返回风险等级
  if (riskScore >= 8) return 'critical';
  if (riskScore >= 5) return 'high';
  if (riskScore >= 2) return 'medium';
  return 'low';
};

ComponentSchema.methods.hasValidCertifications = function(): boolean {
  if (!this.certifications || this.certifications.length === 0) return false;
  
  const now = new Date();
  return this.certifications.some((cert: any) => 
    cert.status === 'valid' && 
    (!cert.expiryDate || cert.expiryDate > now)
  );
};

ComponentSchema.methods.getRadiationTestSummary = function() {
  const testTypes = ['tid', 'see', 'dd', 'neutron', 'proton'];
  const summary: Record<string, any> = {};
  
  testTypes.forEach(type => {
    const tests = this.radiationTests.filter((test: any) => test.testType === type);
    summary[type] = {
      tested: tests.length > 0,
      latestTest: tests.length > 0 ? 
        tests.sort((a: any, b: any) => b.testDate - a.testDate)[0] : null
    };
  });
  
  return summary;
};

ComponentSchema.methods.isRecommendedForSpace = function(): boolean {
  // 航天应用推荐条件
  return (
    this.qualityLevel === 'SPACE' &&
    this.radiationHardness !== 'NONE' &&
    this.temperatureGrade === 'SPACE' &&
    this.hasValidCertifications() &&
    this.lifecycleStatus === 'ACTIVE' &&
    !this.metadata.isObsolete &&
    this.getQualityRisk() !== 'critical'
  );
};

// 静态方法
ComponentSchema.statics.findByQualityLevel = function(qualityLevel: string) {
  return this.find({ qualityLevel });
};

ComponentSchema.statics.findByRadiationHardness = function(radiationHardness: string) {
  return this.find({ radiationHardness });
};

ComponentSchema.statics.findSpaceQualified = function() {
  return this.find({
    qualityLevel: 'SPACE',
    lifecycleStatus: 'ACTIVE',
    'metadata.isObsolete': false
  });
};

ComponentSchema.statics.findObsoleteComponents = function() {
  return this.find({
    $or: [
      { lifecycleStatus: { $in: ['EOL', 'OBSOLETE'] } },
      { 'metadata.isObsolete': true }
    ]
  });
};

ComponentSchema.statics.findWithQualityIssues = function(severity?: string) {
  const query: any = {
    // Quality issues check removed
  };
  
  if (severity) {
    // Quality issues severity check removed
  }
  
  return this.find(query);
};

ComponentSchema.statics.findByStandard = function(standardCode: string) {
  return this.find({
    'standardCompliance.standardCode': standardCode
  });
};

ComponentSchema.statics.findHighRiskComponents = function() {
  return this.find({
    $or: [
      { 'metadata.riskLevel': 'critical' },
      { 'metadata.riskLevel': 'high' },
      { lifecycleStatus: { $in: ['NRND', 'EOL', 'OBSOLETE'] } },
      // Critical quality issues check removed
    ]
  });
};

ComponentSchema.statics.searchAdvanced = function(criteria: any) {
  const query: any = {};
  
  // 基本搜索
  if (criteria.keyword) {
    query.$text = { $search: criteria.keyword };
  }
  
  // 航天专用筛选
  if (criteria.qualityLevel) {
    query.qualityLevel = criteria.qualityLevel;
  }
  
  if (criteria.radiationHardness) {
    query.radiationHardness = criteria.radiationHardness;
  }
  
  if (criteria.temperatureGrade) {
    query.temperatureGrade = criteria.temperatureGrade;
  }
  
  if (criteria.lifecycleStatus) {
    query.lifecycleStatus = criteria.lifecycleStatus;
  }
  
  if (criteria.packageType) {
    query.packageType = criteria.packageType;
  }
  
  if (criteria.spaceQualified) {
    query.qualityLevel = 'SPACE';
    query.lifecycleStatus = 'ACTIVE';
    query['metadata.isObsolete'] = false;
  }
  
  if (criteria.inStock) {
    query['availability.stockQuantity'] = { $gt: 0 };
  }
  
  if (criteria.excludeObsolete) {
    query.lifecycleStatus = { $nin: ['EOL', 'OBSOLETE'] };
    query['metadata.isObsolete'] = { $ne: true };
  }
  
  return this.find(query);
};

export const Component = mongoose.model<IComponent>('Component', ComponentSchema);
