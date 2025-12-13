import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  type: 'technical' | 'standard' | 'application' | 'test_report' | 'certificate' | 'manual';
  category: string;
  subcategory?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  version: string;
  description?: string;
  tags: string[];
  relatedComponents: mongoose.Types.ObjectId[];
  relatedStandards: string[];
  author?: string;
  publisher?: string;
  publishDate?: Date;
  uploadDate: Date;
  lastModified: Date;
  accessLevel: 'public' | 'restricted' | 'confidential';
  downloadCount: number;
  status: 'active' | 'archived' | 'deprecated';
  checksum?: string;
  metadata: {
    language?: string;
    pages?: number;
    keywords?: string[];
    abstract?: string;
  };
}

const DocumentSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['technical', 'standard', 'application', 'test_report', 'certificate', 'manual'],
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  subcategory: {
    type: String,
    index: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
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
    required: true,
    default: '1.0'
  },
  description: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    index: true
  }],
  relatedComponents: [{
    type: Schema.Types.ObjectId,
    ref: 'Component'
  }],
  relatedStandards: [{
    type: String,
    trim: true
  }],
  author: {
    type: String,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  publishDate: {
    type: Date
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  accessLevel: {
    type: String,
    enum: ['public', 'restricted', 'confidential'],
    default: 'public',
    index: true
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deprecated'],
    default: 'active',
    index: true
  },
  checksum: {
    type: String
  },
  metadata: {
    language: {
      type: String,
      default: 'zh-CN'
    },
    pages: {
      type: Number,
      min: 0
    },
    keywords: [{
      type: String,
      trim: true
    }],
    abstract: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
DocumentSchema.index({ title: 'text', description: 'text', 'metadata.keywords': 'text' });
DocumentSchema.index({ type: 1, category: 1 });
DocumentSchema.index({ uploadDate: -1 });
DocumentSchema.index({ downloadCount: -1 });

// 虚拟字段
DocumentSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// 中间件
DocumentSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
