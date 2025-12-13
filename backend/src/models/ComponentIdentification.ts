import mongoose, { Schema, Document } from 'mongoose';

// 器件鉴定数据接口
export interface IComponentIdentification extends Document {
  _id: mongoose.Types.ObjectId;
  componentId: string;
  componentPartNumber: string;
  manufacturer: string;
  identificationId: string; // 鉴定编号
  
  // 鉴定执行标准
  executionStandards: {
    primaryStandard: string; // 主要执行标准 (如 MIL-STD-883)
    additionalStandards: string[]; // 附加标准
    testLevel: string; // 测试等级 (A/B/C)
  };
  
  // 鉴定试验项目
  testItems: {
    itemId: string;
    itemName: string;
    testMethod: string;
    requirement: string;
    result: string;
    status: 'pass' | 'fail' | 'conditional';
    notes?: string;
  }[];
  
  // 鉴定试验结果汇总
  testResults: {
    totalItems: number;
    passedItems: number;
    failedItems: number;
    conditionalItems: number;
    overallStatus: 'qualified' | 'unqualified' | 'conditional';
  };
  
  // 鉴定报告信息
  reportInfo: {
    reportNumber: string;
    reportDate: Date;
    testLab: string;
    testOperator: string;
    reviewer: string;
    approver: string;
    reportFile?: string; // 报告文件路径
  };
  
  // 样品信息
  sampleInfo: {
    batchNumber: string;
    sampleCount: number;
    sampleSource: string; // 样品来源
    receivedDate: Date;
    testStartDate: Date;
    testEndDate: Date;
  };
  
  // 质量等级评定
  qualityAssessment: {
    qualityLevel: string; // 宇航级/军用级/工业级
    reliabilityLevel: string; // 可靠性等级
    applicationArea: string[]; // 适用领域
    restrictions?: string; // 使用限制
  };
  
  // 有效期管理
  validity: {
    issueDate: Date;
    expiryDate: Date;
    isValid: boolean;
    renewalRequired: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// 鉴定试验项目Schema
const TestItemSchema = new Schema({
  itemId: { type: String, required: true },
  itemName: { type: String, required: true },
  testMethod: { type: String, required: true },
  requirement: { type: String, required: true },
  result: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['pass', 'fail', 'conditional']
  },
  notes: { type: String }
}, { _id: false });

// 器件鉴定Schema
const ComponentIdentificationSchema = new Schema<IComponentIdentification>({
  componentId: {
    type: String,
    required: true,
    index: true
  },
  componentPartNumber: {
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
  identificationId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  
  // 鉴定执行标准
  executionStandards: {
    primaryStandard: { type: String, required: true },
    additionalStandards: [{ type: String }],
    testLevel: { 
      type: String, 
      required: true,
      enum: ['A', 'B', 'C']
    }
  },
  
  // 鉴定试验项目
  testItems: [TestItemSchema],
  
  // 鉴定试验结果汇总
  testResults: {
    totalItems: { type: Number, required: true },
    passedItems: { type: Number, required: true },
    failedItems: { type: Number, required: true },
    conditionalItems: { type: Number, required: true },
    overallStatus: { 
      type: String, 
      required: true,
      enum: ['qualified', 'unqualified', 'conditional'],
      index: true
    }
  },
  
  // 鉴定报告信息
  reportInfo: {
    reportNumber: { type: String, required: true, unique: true },
    reportDate: { type: Date, required: true },
    testLab: { type: String, required: true },
    testOperator: { type: String, required: true },
    reviewer: { type: String, required: true },
    approver: { type: String, required: true },
    reportFile: { type: String }
  },
  
  // 样品信息
  sampleInfo: {
    batchNumber: { type: String, required: true, index: true },
    sampleCount: { type: Number, required: true, min: 1 },
    sampleSource: { type: String, required: true },
    receivedDate: { type: Date, required: true },
    testStartDate: { type: Date, required: true },
    testEndDate: { type: Date, required: true }
  },
  
  // 质量等级评定
  qualityAssessment: {
    qualityLevel: { 
      type: String, 
      required: true,
      enum: ['宇航级', '军用级', '工业级'],
      index: true
    },
    reliabilityLevel: { type: String, required: true },
    applicationArea: [{ type: String }],
    restrictions: { type: String }
  },
  
  // 有效期管理
  validity: {
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true, index: true },
    isValid: { type: Boolean, default: true, index: true },
    renewalRequired: { type: Boolean, default: false }
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
ComponentIdentificationSchema.index({ componentId: 1, 'testResults.overallStatus': 1 });
ComponentIdentificationSchema.index({ manufacturer: 1, 'qualityAssessment.qualityLevel': 1 });
ComponentIdentificationSchema.index({ 'validity.expiryDate': 1, 'validity.isValid': 1 });

export const ComponentIdentification = mongoose.model<IComponentIdentification>('ComponentIdentification', ComponentIdentificationSchema);
