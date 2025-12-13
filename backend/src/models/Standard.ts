import mongoose, { Schema, Document } from 'mongoose';
import { 
  StandardData, 
  StandardType, 
  StandardStatus
} from '../types';

export interface IStandard extends Omit<StandardData, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const StandardSchema = new Schema<IStandard>({
  standardCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  standardType: {
    type: String,
    required: true,
    enum: ['MIL', 'ESCC', 'ISO', 'IEC', 'GB', 'GJB', 'JEDEC', 'NASA'],
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  version: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(StandardStatus),
    default: StandardStatus.ACTIVE,
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
  
  // 标准关系
  replacedBy: {
    type: String,
    trim: true,
    index: true
  },
  replaces: [{
    type: String,
    trim: true
  }],
  relatedStandards: [{
    type: String,
    trim: true
  }],
  
  // 内容信息
  abstract: {
    type: String
  },
  scope: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    trim: true
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // 关联信息
  relatedComponents: [{
    type: String,
    index: true
  }],
  category: [{
    type: String,
    trim: true,
    index: true
  }]
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
StandardSchema.index({ standardType: 1, status: 1 });
StandardSchema.index({ publishDate: -1, status: 1 });
StandardSchema.index({ 'category': 1, status: 1 });

// 文本搜索索引
StandardSchema.index({ 
  standardCode: 'text',
  title: 'text', 
  abstract: 'text',
  scope: 'text'
});

// 实例方法
StandardSchema.methods.isActive = function(): boolean {
  return this.status === 'active' && new Date() >= this.effectiveDate;
};

StandardSchema.methods.isSuperseded = function(): boolean {
  return this.status === 'superseded' && this.replacedBy;
};

StandardSchema.methods.getReplacementChain = function(): Promise<any[]> {
  const Standard = this.constructor;
  const chain: any[] = [];
  let current = this;
  
  // 查找替代链
  const findReplacements = async (standard: any): Promise<void> => {
    if (standard.replacedBy) {
      const replacement = await (Standard as any).findOne({ standardCode: standard.replacedBy });
      if (replacement) {
        chain.push(replacement);
        await findReplacements(replacement);
      }
    }
  };
  
  return findReplacements(current).then(() => chain);
};

StandardSchema.methods.incrementDownloadCount = function(): Promise<any> {
  this.downloadCount += 1;
  return this.save();
};

// 静态方法
StandardSchema.statics.findByType = function(standardType: string) {
  return this.find({ standardType, status: 'active' })
             .sort({ publishDate: -1 });
};

StandardSchema.statics.findActive = function() {
  return this.find({ 
    status: 'active',
    effectiveDate: { $lte: new Date() }
  }).sort({ publishDate: -1 });
};

StandardSchema.statics.findByCategory = function(category: string) {
  return this.find({ 
    category: category,
    status: 'active'
  }).sort({ publishDate: -1 });
};

StandardSchema.statics.findSuperseded = function() {
  return this.find({ status: 'superseded' })
             .sort({ publishDate: -1 });
};

StandardSchema.statics.findWithoutReplacements = function() {
  return this.find({ 
    status: { $in: ['withdrawn', 'superseded'] },
    replacedBy: { $exists: false }
  });
};

StandardSchema.statics.searchStandards = function(query: string, filters: any = {}) {
  const searchQuery: any = {
    $text: { $search: query }
  };
  
  // 应用筛选条件
  if (filters.standardType) {
    searchQuery.standardType = filters.standardType;
  }
  
  if (filters.status) {
    searchQuery.status = filters.status;
  } else {
    // 默认只搜索有效标准
    searchQuery.status = 'active';
  }
  
  if (filters.category) {
    searchQuery.category = { $in: [filters.category] };
  }
  
  if (filters.publishedAfter) {
    searchQuery.publishDate = { $gte: new Date(filters.publishedAfter) };
  }
  
  return this.find(searchQuery, {
    score: { $meta: 'textScore' }
  }).sort({ 
    score: { $meta: 'textScore' },
    publishDate: -1 
  });
};

StandardSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byType: {
          $push: {
            type: '$standardType',
            status: '$status'
          }
        },
        byStatus: {
          $push: {
            status: '$status'
          }
        },
        downloadStats: {
          $push: {
            downloads: '$downloadCount'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        typeStats: {
          $reduce: {
            input: ['MIL', 'ESCC', 'ISO', 'IEC', 'GB', 'GJB', 'JEDEC', 'NASA'],
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $let: {
                    vars: {
                      typeCount: {
                        $size: {
                          $filter: {
                            input: '$byType',
                            cond: { $eq: ['$$this.type', '$$this'] }
                          }
                        }
                      }
                    },
                    in: { $arrayToObject: [{ k: '$$this', v: '$$typeCount' }] }
                  }
                }
              ]
            }
          }
        },
        statusStats: {
          $reduce: {
            input: ['active', 'withdrawn', 'superseded', 'draft'],
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $let: {
                    vars: {
                      statusCount: {
                        $size: {
                          $filter: {
                            input: '$byStatus',
                            cond: { $eq: ['$$this.status', '$$this'] }
                          }
                        }
                      }
                    },
                    in: { $arrayToObject: [{ k: '$$this', v: '$$statusCount' }] }
                  }
                }
              ]
            }
          }
        },
        totalDownloads: {
          $sum: '$downloadStats.downloads'
        }
      }
    }
  ]);
};

StandardSchema.statics.findMostDownloaded = function(limit: number = 10) {
  return this.find({ status: 'active' })
             .sort({ downloadCount: -1 })
             .limit(limit);
};

StandardSchema.statics.findRecentlyPublished = function(days: number = 30) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.find({ 
    publishDate: { $gte: cutoffDate },
    status: 'active'
  }).sort({ publishDate: -1 });
};

StandardSchema.statics.findByComponent = function(componentId: string) {
  return this.find({ 
    relatedComponents: componentId,
    status: 'active'
  }).sort({ publishDate: -1 });
};

// 中间件：更新相关标准的关系
StandardSchema.pre('save', async function(next) {
  if (this.isModified('replacedBy') && (this as any).replacedBy) {
    // 更新被替代标准的关系
    const Standard = this.constructor as any;
    await Standard.updateOne(
      { standardCode: (this as any).replacedBy },
      { $addToSet: { replaces: (this as any).standardCode } }
    );
  }
  next();
});

export const Standard = mongoose.model<IStandard>('Standard', StandardSchema);
