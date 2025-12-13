import mongoose, { Schema, Document } from 'mongoose';

// 标准版本管理数据接口
export interface IStandardVersion extends Document {
  _id: mongoose.Types.ObjectId;
  standardCode: string; // 标准编号
  standardTitle: string; // 标准标题
  standardType: string; // 标准类型
  
  // 版本信息
  versions: {
    versionId: string;
    version: string; // 版本号
    publishDate: Date; // 发布日期
    effectiveDate: Date; // 生效日期
    status: 'current' | 'superseded' | 'withdrawn' | 'draft'; // 版本状态
    
    // 版本变更信息
    changeInfo: {
      changeType: 'major' | 'minor' | 'revision' | 'correction'; // 变更类型
      changeDescription: string; // 变更描述
      changedSections: string[]; // 变更章节
      impactAssessment: string; // 影响评估
      migrationGuidance: string; // 迁移指导
    };
    
    // 文档信息
    documentInfo: {
      fileUrl?: string; // 文档文件URL
      fileSize?: number; // 文件大小
      pageCount?: number; // 页数
      language: string; // 语言
      format: string; // 格式 (PDF/DOC/HTML)
    };
    
    // 关联关系
    relationships: {
      supersedes?: string[]; // 替代的版本
      supersededBy?: string; // 被替代的版本
      relatedStandards?: string[]; // 相关标准
      referencedBy?: string[]; // 引用此版本的标准
    };
  }[];
  
  // 版本历史追踪
  versionHistory: {
    action: 'created' | 'updated' | 'superseded' | 'withdrawn';
    versionId: string;
    timestamp: Date;
    operator: string;
    reason: string;
    details?: string;
  }[];
  
  // 订阅管理
  subscriptions: {
    userId: string;
    userEmail: string;
    subscriptionType: 'all_changes' | 'major_changes' | 'status_changes';
    isActive: boolean;
    subscribedAt: Date;
  }[];
  
  // 影响分析
  impactAnalysis: {
    affectedComponents: string[]; // 受影响的器件
    affectedProjects: string[]; // 受影响的项目
    affectedSuppliers: string[]; // 受影响的供应商
    riskLevel: 'low' | 'medium' | 'high' | 'critical'; // 风险等级
    actionRequired: boolean; // 是否需要采取行动
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// 版本变更信息Schema
const ChangeInfoSchema = new Schema({
  changeType: { 
    type: String, 
    required: true,
    enum: ['major', 'minor', 'revision', 'correction']
  },
  changeDescription: { type: String, required: true },
  changedSections: [{ type: String }],
  impactAssessment: { type: String, required: true },
  migrationGuidance: { type: String }
}, { _id: false });

// 文档信息Schema
const DocumentInfoSchema = new Schema({
  fileUrl: { type: String },
  fileSize: { type: Number },
  pageCount: { type: Number },
  language: { type: String, default: '中文' },
  format: { 
    type: String, 
    required: true,
    enum: ['PDF', 'DOC', 'DOCX', 'HTML', 'XML']
  }
}, { _id: false });

// 关联关系Schema
const RelationshipsSchema = new Schema({
  supersedes: [{ type: String }],
  supersededBy: { type: String },
  relatedStandards: [{ type: String }],
  referencedBy: [{ type: String }]
}, { _id: false });

// 版本Schema
const VersionSchema = new Schema({
  versionId: { type: String, required: true },
  version: { type: String, required: true },
  publishDate: { type: Date, required: true },
  effectiveDate: { type: Date, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['current', 'superseded', 'withdrawn', 'draft'],
    index: true
  },
  changeInfo: ChangeInfoSchema,
  documentInfo: DocumentInfoSchema,
  relationships: RelationshipsSchema
}, { _id: false });

// 版本历史Schema
const VersionHistorySchema = new Schema({
  action: { 
    type: String, 
    required: true,
    enum: ['created', 'updated', 'superseded', 'withdrawn']
  },
  versionId: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  operator: { type: String, required: true },
  reason: { type: String, required: true },
  details: { type: String }
}, { _id: false });

// 订阅Schema
const SubscriptionSchema = new Schema({
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  subscriptionType: { 
    type: String, 
    required: true,
    enum: ['all_changes', 'major_changes', 'status_changes']
  },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now }
}, { _id: false });

// 影响分析Schema
const ImpactAnalysisSchema = new Schema({
  affectedComponents: [{ type: String }],
  affectedProjects: [{ type: String }],
  affectedSuppliers: [{ type: String }],
  riskLevel: { 
    type: String, 
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    index: true
  },
  actionRequired: { type: Boolean, default: false }
}, { _id: false });

// 标准版本Schema
const StandardVersionSchema = new Schema<IStandardVersion>({
  standardCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    index: true
  },
  standardTitle: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  standardType: {
    type: String,
    required: true,
    enum: ['MIL', 'ESCC', 'ISO', 'IEC', 'GB', 'GJB', 'JEDEC', 'Other'],
    index: true
  },
  
  versions: [VersionSchema],
  versionHistory: [VersionHistorySchema],
  subscriptions: [SubscriptionSchema],
  impactAnalysis: ImpactAnalysisSchema
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
StandardVersionSchema.index({ standardCode: 1, 'versions.version': 1 });
StandardVersionSchema.index({ 'versions.status': 1, 'versions.effectiveDate': -1 });
StandardVersionSchema.index({ 'impactAnalysis.riskLevel': 1, updatedAt: -1 });

export const StandardVersion = mongoose.model<IStandardVersion>('StandardVersion', StandardVersionSchema);
