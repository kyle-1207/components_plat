import mongoose, { Schema, Document } from 'mongoose';

export interface IPolicyRegulation extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  category: 'national' | 'ministry' | 'local' | 'industry';
  type: 'law' | 'regulation' | 'policy' | 'standard' | 'notice';
  field: 'commercial_space' | 'components' | 'technology' | 'trade' | 'safety' | 'quality';
  issuer: string;
  issuerLevel: 'central' | 'ministry' | 'provincial' | 'municipal' | 'industry';
  policyNumber?: string;
  publishDate: Date;
  effectiveDate: Date;
  expiryDate?: Date;
  status: 'effective' | 'draft' | 'abolished' | 'revised' | 'pending';
  level: 'high' | 'medium' | 'low';
  summary: string;
  content: string;
  keyPoints: string[];
  impactAnalysis?: string;
  implementationGuidance?: string;
  attachments: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
    uploadDate: Date;
  }>;
  relatedPolicies: mongoose.Types.ObjectId[];
  supersededBy?: mongoose.Types.ObjectId;
  supersedes?: mongoose.Types.ObjectId[];
  tags: string[];
  keywords: string[];
  applicableRegions: string[];
  targetIndustries: string[];
  viewCount: number;
  downloadCount: number;
  favoriteCount: number;
  shareCount: number;
  feedback: Array<{
    userId: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
    date: Date;
  }>;
  versions: Array<{
    version: string;
    publishDate: Date;
    changes: string;
    documentUrl?: string;
  }>;
  metadata: {
    language: string;
    pages?: number;
    wordCount?: number;
    sourceUrl?: string;
    verificationStatus: 'verified' | 'pending' | 'unverified';
    lastVerificationDate?: Date;
    verifiedBy?: string;
  };
  compliance: {
    relatedLaws: string[];
    conflictsWith: string[];
    amendedBy: string[];
  };
  notification: {
    subscribedUsers: mongoose.Types.ObjectId[];
    lastNotified?: Date;
    notificationSent: boolean;
  };
}

const AttachmentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

const FeedbackSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const VersionSchema = new Schema({
  version: {
    type: String,
    required: true
  },
  publishDate: {
    type: Date,
    required: true
  },
  changes: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String
  }
});

const PolicyRegulationSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['national', 'ministry', 'local', 'industry'],
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['law', 'regulation', 'policy', 'standard', 'notice'],
    index: true
  },
  field: {
    type: String,
    required: true,
    enum: ['commercial_space', 'components', 'technology', 'trade', 'safety', 'quality'],
    index: true
  },
  issuer: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  issuerLevel: {
    type: String,
    required: true,
    enum: ['central', 'ministry', 'provincial', 'municipal', 'industry'],
    index: true
  },
  policyNumber: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  },
  publishDate: {
    type: Date,
    required: true,
    index: true
  },
  effectiveDate: {
    type: Date,
    required: true,
    index: true
  },
  expiryDate: {
    type: Date,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['effective', 'draft', 'abolished', 'revised', 'pending'],
    default: 'effective',
    index: true
  },
  level: {
    type: String,
    required: true,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
    index: true
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  keyPoints: [{
    type: String,
    trim: true
  }],
  impactAnalysis: {
    type: String,
    trim: true
  },
  implementationGuidance: {
    type: String,
    trim: true
  },
  attachments: [AttachmentSchema],
  relatedPolicies: [{
    type: Schema.Types.ObjectId,
    ref: 'PolicyRegulation'
  }],
  supersededBy: {
    type: Schema.Types.ObjectId,
    ref: 'PolicyRegulation'
  },
  supersedes: [{
    type: Schema.Types.ObjectId,
    ref: 'PolicyRegulation'
  }],
  tags: [{
    type: String,
    trim: true,
    index: true
  }],
  keywords: [{
    type: String,
    trim: true,
    index: true
  }],
  applicableRegions: [{
    type: String,
    trim: true
  }],
  targetIndustries: [{
    type: String,
    trim: true
  }],
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  favoriteCount: {
    type: Number,
    default: 0,
    min: 0
  },
  shareCount: {
    type: Number,
    default: 0,
    min: 0
  },
  feedback: [FeedbackSchema],
  versions: [VersionSchema],
  metadata: {
    language: {
      type: String,
      default: 'zh-CN'
    },
    pages: {
      type: Number,
      min: 0
    },
    wordCount: {
      type: Number,
      min: 0
    },
    sourceUrl: {
      type: String,
      trim: true
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'pending', 'unverified'],
      default: 'pending'
    },
    lastVerificationDate: {
      type: Date
    },
    verifiedBy: {
      type: String,
      trim: true
    }
  },
  compliance: {
    relatedLaws: [{
      type: String,
      trim: true
    }],
    conflictsWith: [{
      type: String,
      trim: true
    }],
    amendedBy: [{
      type: String,
      trim: true
    }]
  },
  notification: {
    subscribedUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    lastNotified: {
      type: Date
    },
    notificationSent: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
PolicyRegulationSchema.index({ 
  title: 'text', 
  summary: 'text', 
  content: 'text',
  keywords: 'text',
  tags: 'text'
});

PolicyRegulationSchema.index({ category: 1, type: 1 });
PolicyRegulationSchema.index({ field: 1, status: 1 });
PolicyRegulationSchema.index({ publishDate: -1 });
PolicyRegulationSchema.index({ effectiveDate: -1 });
PolicyRegulationSchema.index({ level: 1, publishDate: -1 });
PolicyRegulationSchema.index({ issuer: 1, publishDate: -1 });
PolicyRegulationSchema.index({ status: 1, effectiveDate: -1 });

// 复合索引
PolicyRegulationSchema.index({ 
  field: 1, 
  category: 1, 
  status: 1, 
  publishDate: -1 
});

// 虚拟字段
PolicyRegulationSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

PolicyRegulationSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'effective' && 
         this.effectiveDate <= now && 
         (!this.expiryDate || this.expiryDate > now);
});

PolicyRegulationSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  const now = new Date();
  const diff = this.expiryDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
});

PolicyRegulationSchema.virtual('averageRating').get(function() {
  if (this.feedback.length === 0) return 0;
  const sum = this.feedback.reduce((acc, item) => acc + item.rating, 0);
  return (sum / this.feedback.length).toFixed(1);
});

// 中间件
PolicyRegulationSchema.pre('save', function(next) {
  // 自动设置关键词
  if (this.isModified('title') || this.isModified('summary')) {
    const extractKeywords = (text: string): string[] => {
      const keywords = [];
      // 提取中文关键词的简单实现
      if (text.includes('商业航天')) keywords.push('商业航天');
      if (text.includes('元器件')) keywords.push('元器件');
      if (text.includes('质量管理')) keywords.push('质量管理');
      if (text.includes('安全')) keywords.push('安全');
      if (text.includes('标准')) keywords.push('标准');
      if (text.includes('认证')) keywords.push('认证');
      if (text.includes('技术')) keywords.push('技术');
      if (text.includes('创新')) keywords.push('创新');
      return keywords;
    };
    
    const titleKeywords = extractKeywords(this.title);
    const summaryKeywords = extractKeywords(this.summary);
    this.keywords = [...new Set([...titleKeywords, ...summaryKeywords])];
  }

  // 自动设置版本信息
  if (this.isNew) {
    this.versions.push({
      version: '1.0',
      publishDate: this.publishDate,
      changes: '初始版本发布',
      documentUrl: this.attachments[0]?.url
    });
  }

  next();
});

// 静态方法
PolicyRegulationSchema.statics.findEffective = function() {
  const now = new Date();
  return this.find({
    status: 'effective',
    effectiveDate: { $lte: now },
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: { $gt: now } }
    ]
  });
};

PolicyRegulationSchema.statics.findByField = function(field: string) {
  return this.find({ field, status: 'effective' })
             .sort({ level: -1, publishDate: -1 });
};

PolicyRegulationSchema.statics.findRecentUpdates = function(days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  return this.find({
    $or: [
      { publishDate: { $gte: since } },
      { updatedAt: { $gte: since } }
    ],
    status: 'effective'
  }).sort({ publishDate: -1 });
};

// 实例方法
PolicyRegulationSchema.methods.addView = function() {
  this.viewCount += 1;
  return this.save();
};

PolicyRegulationSchema.methods.addDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

PolicyRegulationSchema.methods.addFeedback = function(userId: mongoose.Types.ObjectId, rating: number, comment?: string) {
  // 检查用户是否已经评价过
  const existingFeedback = this.feedback.find(
    (f: any) => f.userId.toString() === userId.toString()
  );
  
  if (existingFeedback) {
    existingFeedback.rating = rating;
    existingFeedback.comment = comment;
    existingFeedback.date = new Date();
  } else {
    this.feedback.push({
      userId,
      rating,
      comment,
      date: new Date()
    });
  }
  
  return this.save();
};

export const PolicyRegulationModel = mongoose.model<IPolicyRegulation>('PolicyRegulation', PolicyRegulationSchema);
