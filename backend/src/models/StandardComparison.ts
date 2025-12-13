import mongoose, { Schema, Document } from 'mongoose';

// 标准比对数据接口
export interface IStandardComparison extends Document {
  _id: mongoose.Types.ObjectId;
  comparisonId: string; // 比对编号
  comparisonName: string; // 比对名称
  
  // 比对的标准
  standards: {
    standardId: string;
    standardCode: string;
    standardTitle: string;
    version: string;
    publishDate: Date;
    type: string; // MIL/ESCC/ISO/IEC/GB/GJB
  }[];
  
  // 比对维度
  comparisonDimensions: {
    dimensionId: string;
    dimensionName: string; // 技术要求、适用范围、测试方法等
    dimensionType: 'technical' | 'scope' | 'method' | 'requirement';
  }[];
  
  // 比对结果
  comparisonResults: {
    dimensionId: string;
    dimensionName: string;
    standardResults: {
      standardId: string;
      standardCode: string;
      content: string; // 该标准在此维度的内容
      status: 'identical' | 'similar' | 'different' | 'missing'; // 一致、相似、不同、缺失
    }[];
    summary: string; // 该维度的比对总结
    differences: string[]; // 主要差异点
  }[];
  
  // 比对分析报告
  analysisReport: {
    overallSimilarity: number; // 整体相似度 (0-100%)
    majorDifferences: string[]; // 主要差异
    recommendations: string[]; // 建议
    equivalenceAssessment: 'equivalent' | 'partially_equivalent' | 'not_equivalent'; // 等效性评估
    applicabilityAnalysis: string; // 适用性分析
  };
  
  // 比对元数据
  metadata: {
    createdBy: string; // 创建人
    reviewedBy?: string; // 审核人
    approvedBy?: string; // 批准人
    status: 'draft' | 'reviewing' | 'approved' | 'rejected';
    purpose: string; // 比对目的
    scope: string; // 比对范围
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// 标准信息Schema
const StandardInfoSchema = new Schema({
  standardId: { type: String, required: true },
  standardCode: { type: String, required: true },
  standardTitle: { type: String, required: true },
  version: { type: String, required: true },
  publishDate: { type: Date, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['MIL', 'ESCC', 'ISO', 'IEC', 'GB', 'GJB', 'JEDEC', 'Other']
  }
}, { _id: false });

// 比对维度Schema
const ComparisonDimensionSchema = new Schema({
  dimensionId: { type: String, required: true },
  dimensionName: { type: String, required: true },
  dimensionType: { 
    type: String, 
    required: true,
    enum: ['technical', 'scope', 'method', 'requirement']
  }
}, { _id: false });

// 标准结果Schema
const StandardResultSchema = new Schema({
  standardId: { type: String, required: true },
  standardCode: { type: String, required: true },
  content: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['identical', 'similar', 'different', 'missing']
  }
}, { _id: false });

// 比对结果Schema
const ComparisonResultSchema = new Schema({
  dimensionId: { type: String, required: true },
  dimensionName: { type: String, required: true },
  standardResults: [StandardResultSchema],
  summary: { type: String, required: true },
  differences: [{ type: String }]
}, { _id: false });

// 标准比对Schema
const StandardComparisonSchema = new Schema<IStandardComparison>({
  comparisonId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  comparisonName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  // 比对的标准
  standards: [StandardInfoSchema],
  
  // 比对维度
  comparisonDimensions: [ComparisonDimensionSchema],
  
  // 比对结果
  comparisonResults: [ComparisonResultSchema],
  
  // 比对分析报告
  analysisReport: {
    overallSimilarity: { 
      type: Number, 
      required: true, 
      min: 0, 
      max: 100 
    },
    majorDifferences: [{ type: String }],
    recommendations: [{ type: String }],
    equivalenceAssessment: { 
      type: String, 
      required: true,
      enum: ['equivalent', 'partially_equivalent', 'not_equivalent'],
      index: true
    },
    applicabilityAnalysis: { type: String, required: true }
  },
  
  // 比对元数据
  metadata: {
    createdBy: { type: String, required: true, index: true },
    reviewedBy: { type: String },
    approvedBy: { type: String },
    status: { 
      type: String, 
      required: true,
      enum: ['draft', 'reviewing', 'approved', 'rejected'],
      default: 'draft',
      index: true
    },
    purpose: { type: String, required: true },
    scope: { type: String, required: true }
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
StandardComparisonSchema.index({ 'standards.standardCode': 1 });
StandardComparisonSchema.index({ 'metadata.status': 1, createdAt: -1 });
StandardComparisonSchema.index({ 'analysisReport.equivalenceAssessment': 1, 'metadata.status': 1 });

export const StandardComparison = mongoose.model<IStandardComparison>('StandardComparison', StandardComparisonSchema);
