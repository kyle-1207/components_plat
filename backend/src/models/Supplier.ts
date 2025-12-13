import mongoose, { Schema, Document } from 'mongoose';
import { 
  SupplierInfo, 
  SupplierQualificationLevel,
  SupplierContact
} from '../types';

export interface ISupplier extends Omit<SupplierInfo, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// 供应商联系信息Schema
const SupplierContactSchema = new Schema({
  primaryContact: {
    name: { type: String, required: true },
    title: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    mobile: { type: String }
  },
  technicalContact: {
    name: { type: String },
    title: { type: String },
    email: { type: String },
    phone: { type: String },
    mobile: { type: String }
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true },
    postalCode: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  website: { type: String },
  socialMedia: {
    linkedin: { type: String },
    twitter: { type: String }
  }
}, { _id: false });

const SupplierSchema = new Schema<ISupplier>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  qualificationLevel: {
    type: String,
    required: true,
    enum: Object.values(SupplierQualificationLevel),
    default: SupplierQualificationLevel.UNQUALIFIED,
    index: true
  },
  contactInfo: {
    type: SupplierContactSchema,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastAuditDate: {
    type: Date,
    index: true
  },
  certifications: [{
    type: String,
    trim: true
  }],

  
  // 能力信息
  capabilities: {
    productCategories: [{
      type: String,
      trim: true
    }],
    services: [{
      type: String,
      trim: true
    }],
    qualityStandards: [{
      standard: { type: String, required: true },
      certificationNumber: { type: String },
      validUntil: { type: Date },
      issuedBy: { type: String }
    }],
    radiationTesting: {
      hasCapability: { type: Boolean, default: false },
      testTypes: [{
        type: String,
        enum: ['tid', 'see', 'dd', 'neutron', 'proton']
      }],
      accreditation: { type: String }
    },
    spaceQualification: {
      hasExperience: { type: Boolean, default: false },
      programs: [{ type: String }],
      certificationLevel: { type: String }
    }
  },
  
  // 绩效指标
  performance: {
    qualityRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    deliveryRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    serviceRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    onTimeDeliveryRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 90
    },
    qualityDefectRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 1
    },
    responseTime: {
      value: { type: Number },
      unit: { type: String, enum: ['hours', 'days'], default: 'hours' }
    },
    lastPerformanceReview: { type: Date }
  },
  
  // 风险信息
  riskAssessment: {
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    riskFactors: [{
      factor: { type: String, required: true },
      impact: { type: String, enum: ['low', 'medium', 'high'], required: true },
      probability: { type: String, enum: ['low', 'medium', 'high'], required: true },
      mitigation: { type: String }
    }],
    financialStability: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'unknown'],
      default: 'unknown'
    },
    geopoliticalRisk: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    lastRiskReview: { type: Date }
  },
  
  // 合同信息
  contractInfo: {
    preferredTerms: {
      paymentTerms: { type: String },
      leadTime: { type: Number }, // 周
      minimumOrder: { type: Number },
      volume: { type: String }
    },
    activeContracts: [{
      contractNumber: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      value: { type: Number },
      currency: { type: String, default: 'USD' },
      status: { 
        type: String, 
        enum: ['active', 'expired', 'terminated'],
        default: 'active'
      }
    }],
    totalContractValue: { type: Number, default: 0 }
  },
  
  // 元数据
  metadata: {
    tags: [{ type: String }],
    notes: { type: String },
    lastContactDate: { type: Date },
    nextReviewDate: { type: Date },
    createdBy: { type: String },
    lastModifiedBy: { type: String }
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
SupplierSchema.index({ qualificationLevel: 1, isActive: 1 });
SupplierSchema.index({ 'performance.overallRating': -1, isActive: 1 });
SupplierSchema.index({ 'riskAssessment.riskLevel': 1, qualificationLevel: 1 });
SupplierSchema.index({ 'capabilities.productCategories': 1, isActive: 1 });

// 文本搜索索引
SupplierSchema.index({
  name: 'text',
  code: 'text',
  'contactInfo.address.city': 'text',
  'contactInfo.address.country': 'text',
  'capabilities.productCategories': 'text'
});

// 实例方法
SupplierSchema.methods.isQualified = function(): boolean {
  return this.qualificationLevel !== 'unqualified' && this.isActive;
};

SupplierSchema.methods.needsAudit = function(): boolean {
  if (!this.lastAuditDate) return true;
  
  const now = new Date();
  const lastAudit = new Date(this.lastAuditDate);
  const daysSinceAudit = Math.floor((now.getTime() - lastAudit.getTime()) / (1000 * 60 * 60 * 24));
  
  // 根据资质等级确定审核周期
  const auditCycle: Record<string, number> = {
    'A': 365,      // A级供应商一年审核一次
    'B': 180,      // B级供应商半年审核一次
    'C': 90,       // C级供应商三个月审核一次
    'unqualified': 30  // 未认证供应商一个月审核一次
  };
  
  return daysSinceAudit > (auditCycle[this.qualificationLevel] || 90);
};

SupplierSchema.methods.getOverallScore = function(): number {
  const weights = {
    quality: 0.4,
    delivery: 0.3,
    service: 0.3
  };
  
  return Math.round(
    this.performance.qualityRating * weights.quality +
    this.performance.deliveryRating * weights.delivery +
    this.performance.serviceRating * weights.service
  );
};

SupplierSchema.methods.hasCapability = function(capability: string): boolean {
  return this.capabilities.productCategories.includes(capability) ||
         this.capabilities.services.includes(capability);
};

SupplierSchema.methods.isSpaceQualified = function(): boolean {
  return this.capabilities.spaceQualification.hasExperience &&
         this.qualificationLevel === 'A' &&
         this.isActive;
};

SupplierSchema.methods.getActiveContracts = function() {
  const now = new Date();
  return this.contractInfo.activeContracts.filter((contract: any) =>
    contract.status === 'active' &&
    contract.endDate > now
  );
};

SupplierSchema.methods.updatePerformance = function(metrics: any) {
  Object.assign(this.performance, metrics);
  this.performance.lastPerformanceReview = new Date();
  
  // 更新总体评分
  this.performance.overallRating = this.getOverallScore();
  
  return this.save();
};

// 静态方法
SupplierSchema.statics.findQualified = function(level?: string) {
  const query: any = { 
    isActive: true,
    qualificationLevel: { $ne: 'unqualified' }
  };
  
  if (level) {
    query.qualificationLevel = level;
  }
  
  return this.find(query).sort({ 'performance.overallRating': -1 });
};

SupplierSchema.statics.findByCapability = function(capability: string) {
  return this.find({
    isActive: true,
    $or: [
      { 'capabilities.productCategories': capability },
      { 'capabilities.services': capability }
    ]
  }).sort({ 'performance.overallRating': -1 });
};

SupplierSchema.statics.findSpaceQualified = function() {
  return this.find({
    isActive: true,
    qualificationLevel: 'A',
    'capabilities.spaceQualification.hasExperience': true
  }).sort({ 'performance.overallRating': -1 });
};

SupplierSchema.statics.findHighPerformers = function(minRating: number = 4) {
  return this.find({
    isActive: true,
    'performance.overallRating': { $gte: minRating }
  }).sort({ 'performance.overallRating': -1 });
};

SupplierSchema.statics.findHighRisk = function() {
  return this.find({
    isActive: true,
    'riskAssessment.riskLevel': { $in: ['high', 'critical'] }
  }).sort({ 'riskAssessment.riskLevel': -1 });
};

SupplierSchema.statics.findNeedingAudit = function() {
  const now = new Date();
  
  return this.find({
    isActive: true,
    $or: [
      { lastAuditDate: { $exists: false } },
      {
        $expr: {
          $gt: [
            { $divide: [{ $subtract: [now, '$lastAuditDate'] }, 86400000] },
            {
              $switch: {
                branches: [
                  { case: { $eq: ['$qualificationLevel', 'A'] }, then: 365 },
                  { case: { $eq: ['$qualificationLevel', 'B'] }, then: 180 },
                  { case: { $eq: ['$qualificationLevel', 'C'] }, then: 90 }
                ],
                default: 30
              }
            }
          ]
        }
      }
    ]
  });
};

SupplierSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        byQualification: {
          $push: {
            level: '$qualificationLevel',
            isActive: '$isActive'
          }
        },
        avgRating: { $avg: '$performance.overallRating' },
        avgDeliveryRate: { $avg: '$performance.onTimeDeliveryRate' },
        avgDefectRate: { $avg: '$performance.qualityDefectRate' }
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        active: 1,
        qualificationStats: {
          $reduce: {
            input: ['A', 'B', 'C', 'unqualified'],
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $let: {
                    vars: {
                      levelSuppliers: {
                        $filter: {
                          input: '$byQualification',
                          cond: { $eq: ['$$this.level', '$$this'] }
                        }
                      }
                    },
                    in: {
                      $arrayToObject: [{
                        k: '$$this',
                        v: {
                          total: { $size: '$$levelSuppliers' },
                          active: {
                            $size: {
                              $filter: {
                                input: '$$levelSuppliers',
                                cond: { $eq: ['$$this.isActive', true] }
                              }
                            }
                          }
                        }
                      }]
                    }
                  }
                }
              ]
            }
          }
        },
        performanceStats: {
          avgRating: { $round: ['$avgRating', 2] },
          avgDeliveryRate: { $round: ['$avgDeliveryRate', 1] },
          avgDefectRate: { $round: ['$avgDefectRate', 2] }
        }
      }
    }
  ]);
};

SupplierSchema.statics.searchSuppliers = function(criteria: any) {
  const query: any = {};
  
  if (criteria.keyword) {
    query.$text = { $search: criteria.keyword };
  }
  
  if (criteria.qualificationLevel) {
    query.qualificationLevel = criteria.qualificationLevel;
  }
  
  if (criteria.isActive !== undefined) {
    query.isActive = criteria.isActive;
  }
  
  if (criteria.capability) {
    query.$or = [
      { 'capabilities.productCategories': criteria.capability },
      { 'capabilities.services': criteria.capability }
    ];
  }
  
  if (criteria.minRating) {
    query['performance.overallRating'] = { $gte: criteria.minRating };
  }
  
  if (criteria.riskLevel) {
    query['riskAssessment.riskLevel'] = criteria.riskLevel;
  }
  
  if (criteria.spaceQualified) {
    query['capabilities.spaceQualification.hasExperience'] = true;
    query.qualificationLevel = 'A';
  }
  
  if (criteria.country) {
    query['contactInfo.address.country'] = new RegExp(criteria.country, 'i');
  }
  
  return this.find(query).sort({ 'performance.overallRating': -1 });
};

export const Supplier = mongoose.model<ISupplier>('Supplier', SupplierSchema);