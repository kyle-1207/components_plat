import mongoose, { Schema, Document } from 'mongoose';

// 质量归零数据接口
export interface IQualityZeroing extends Document {
  _id: mongoose.Types.ObjectId;
  zeroingId: string; // 归零编号
  problemId: string; // 关联的质量问题ID
  
  // 问题基本信息
  problemInfo: {
    problemTitle: string; // 问题标题
    problemDescription: string; // 问题描述
    componentPartNumber: string; // 器件型号
    manufacturer: string; // 制造商
    batchNumber: string; // 批次号
    discoveryDate: Date; // 发现日期
    reportedBy: string; // 报告人
    severity: 'critical' | 'major' | 'minor'; // 严重程度
  };
  
  // 归零流程状态
  zeroingStatus: {
    currentPhase: 'problem_analysis' | 'root_cause_analysis' | 'corrective_action' | 'verification' | 'closure';
    overallStatus: 'in_progress' | 'completed' | 'suspended' | 'cancelled';
    startDate: Date;
    targetCompletionDate: Date;
    actualCompletionDate?: Date;
    responsible: string; // 负责人
    participants: string[]; // 参与人员
  };
  
  // 问题分析阶段
  problemAnalysis: {
    // 现象分析
    phenomenonAnalysis: {
      observedSymptoms: string[]; // 观察到的症状
      failureMode: string; // 失效模式
      failureConditions: string; // 失效条件
      affectedQuantity: number; // 影响数量
      failureRate: number; // 失效率
    };
    
    // 影响范围评估
    impactAssessment: {
      affectedBatches: string[]; // 受影响批次
      affectedProjects: string[]; // 受影响项目
      potentialRisk: string; // 潜在风险
      urgencyLevel: 'low' | 'medium' | 'high' | 'critical'; // 紧急程度
    };
    
    // 初步分析结论
    preliminaryConclusions: string[];
    analysisDate: Date;
    analyzedBy: string;
  };
  
  // 根因分析阶段
  rootCauseAnalysis: {
    // 分析方法
    analysisMethods: {
      fishboneAnalysis?: {
        used: boolean;
        categories: {
          category: string; // 人员/机器/材料/方法/环境/测量
          causes: string[];
        }[];
      };
      fiveWhyAnalysis?: {
        used: boolean;
        whyChain: {
          question: string;
          answer: string;
        }[];
      };
      faultTreeAnalysis?: {
        used: boolean;
        topEvent: string;
        analysis: string;
        faultTreeFile?: string; // 故障树文件
      };
      otherMethods?: {
        method: string;
        description: string;
        results: string;
      }[];
    };
    
    // 根本原因
    rootCauses: {
      causeId: string;
      causeType: 'design' | 'manufacturing' | 'material' | 'process' | 'human' | 'environmental';
      causeDescription: string;
      evidenceSupporting: string[];
      contributionLevel: 'primary' | 'secondary' | 'contributing'; // 贡献程度
    }[];
    
    // 验证试验
    verificationTests: {
      testId: string;
      testDescription: string;
      testMethod: string;
      testResults: string;
      conclusion: string;
      testDate: Date;
      testBy: string;
    }[];
    
    analysisDate: Date;
    analyzedBy: string;
    reviewedBy: string;
  };
  
  // 纠正措施阶段
  correctiveActions: {
    // 立即措施 (遏制措施)
    immediateActions: {
      actionId: string;
      actionDescription: string;
      responsible: string;
      targetDate: Date;
      completionDate?: Date;
      status: 'planned' | 'in_progress' | 'completed' | 'overdue';
      effectiveness: string;
    }[];
    
    // 纠正措施 (针对根本原因)
    correctiveMeasures: {
      measureId: string;
      targetRootCause: string; // 针对的根本原因ID
      measureType: 'design_change' | 'process_improvement' | 'training' | 'procedure_update' | 'system_enhancement';
      measureDescription: string;
      implementationPlan: string;
      responsible: string;
      targetDate: Date;
      completionDate?: Date;
      status: 'planned' | 'in_progress' | 'completed' | 'overdue';
      resources: string[]; // 所需资源
      riskAssessment: string; // 风险评估
    }[];
    
    // 预防措施 (防止类似问题再次发生)
    preventiveMeasures: {
      measureId: string;
      measureDescription: string;
      scope: string; // 适用范围
      responsible: string;
      targetDate: Date;
      completionDate?: Date;
      status: 'planned' | 'in_progress' | 'completed' | 'overdue';
    }[];
  };
  
  // 验证阶段
  verification: {
    // 措施有效性验证
    effectivenessVerification: {
      verificationMethod: string;
      verificationCriteria: string[];
      verificationResults: string;
      verificationDate: Date;
      verifiedBy: string;
      isEffective: boolean;
    };
    
    // 系统性验证 (确保没有引入新问题)
    systemicVerification: {
      verificationScope: string;
      verificationActivities: string[];
      verificationResults: string;
      newRisksIdentified: string[];
      verificationDate: Date;
      verifiedBy: string;
    };
    
    // 长期监控计划
    monitoringPlan: {
      monitoringParameters: string[];
      monitoringFrequency: string;
      monitoringDuration: string;
      responsible: string;
      reportingSchedule: string;
    };
  };
  
  // 关闭阶段
  closure: {
    // 归零总结
    summary: {
      problemSummary: string;
      rootCauseSummary: string;
      actionsSummary: string;
      lessonsLearned: string[];
      bestPractices: string[];
    };
    
    // 关闭评审
    closureReview: {
      reviewDate: Date;
      reviewers: string[];
      reviewComments: string[];
      approvalStatus: 'approved' | 'rejected' | 'conditional';
      approvedBy: string;
      approvalDate?: Date;
    };
    
    // 知识管理
    knowledgeCapture: {
      documentationUpdated: string[]; // 更新的文档
      trainingConducted: string[]; // 开展的培训
      processesImproved: string[]; // 改进的流程
      knowledgeShared: string[]; // 分享的知识
    };
  };
  
  // 归零文档
  documents: {
    documentType: 'analysis_report' | 'test_report' | 'action_plan' | 'verification_report' | 'closure_report';
    documentName: string;
    documentUrl: string;
    uploadDate: Date;
    uploadedBy: string;
  }[];
  
  // 归零评价
  evaluation: {
    timeliness: number; // 及时性评分 (1-5)
    thoroughness: number; // 彻底性评分 (1-5)
    effectiveness: number; // 有效性评分 (1-5)
    overallRating: number; // 总体评分 (1-5)
    evaluationComments: string;
    evaluatedBy: string;
    evaluationDate: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// 现象分析Schema
const PhenomenonAnalysisSchema = new Schema({
  observedSymptoms: [{ type: String }],
  failureMode: { type: String, required: true },
  failureConditions: { type: String, required: true },
  affectedQuantity: { type: Number, required: true },
  failureRate: { type: Number, required: true }
}, { _id: false });

// 影响评估Schema
const ImpactAssessmentSchema = new Schema({
  affectedBatches: [{ type: String }],
  affectedProjects: [{ type: String }],
  potentialRisk: { type: String, required: true },
  urgencyLevel: { 
    type: String, 
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  }
}, { _id: false });

// 鱼骨图分析Schema
const FishboneAnalysisSchema = new Schema({
  used: { type: Boolean, default: false },
  categories: [{
    category: { type: String, required: true },
    causes: [{ type: String }]
  }]
}, { _id: false });

// 五个为什么分析Schema
const FiveWhyAnalysisSchema = new Schema({
  used: { type: Boolean, default: false },
  whyChain: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }]
}, { _id: false });

// 故障树分析Schema
const FaultTreeAnalysisSchema = new Schema({
  used: { type: Boolean, default: false },
  topEvent: { type: String },
  analysis: { type: String },
  faultTreeFile: { type: String }
}, { _id: false });

// 其他分析方法Schema
const OtherMethodSchema = new Schema({
  method: { type: String, required: true },
  description: { type: String, required: true },
  results: { type: String, required: true }
}, { _id: false });

// 根本原因Schema
const RootCauseSchema = new Schema({
  causeId: { type: String, required: true },
  causeType: { 
    type: String, 
    required: true,
    enum: ['design', 'manufacturing', 'material', 'process', 'human', 'environmental']
  },
  causeDescription: { type: String, required: true },
  evidenceSupporting: [{ type: String }],
  contributionLevel: { 
    type: String, 
    required: true,
    enum: ['primary', 'secondary', 'contributing']
  }
}, { _id: false });

// 验证试验Schema
const VerificationTestSchema = new Schema({
  testId: { type: String, required: true },
  testDescription: { type: String, required: true },
  testMethod: { type: String, required: true },
  testResults: { type: String, required: true },
  conclusion: { type: String, required: true },
  testDate: { type: Date, required: true },
  testBy: { type: String, required: true }
}, { _id: false });

// 立即措施Schema
const ImmediateActionSchema = new Schema({
  actionId: { type: String, required: true },
  actionDescription: { type: String, required: true },
  responsible: { type: String, required: true },
  targetDate: { type: Date, required: true },
  completionDate: { type: Date },
  status: { 
    type: String, 
    required: true,
    enum: ['planned', 'in_progress', 'completed', 'overdue']
  },
  effectiveness: { type: String }
}, { _id: false });

// 纠正措施Schema
const CorrectiveMeasureSchema = new Schema({
  measureId: { type: String, required: true },
  targetRootCause: { type: String, required: true },
  measureType: { 
    type: String, 
    required: true,
    enum: ['design_change', 'process_improvement', 'training', 'procedure_update', 'system_enhancement']
  },
  measureDescription: { type: String, required: true },
  implementationPlan: { type: String, required: true },
  responsible: { type: String, required: true },
  targetDate: { type: Date, required: true },
  completionDate: { type: Date },
  status: { 
    type: String, 
    required: true,
    enum: ['planned', 'in_progress', 'completed', 'overdue']
  },
  resources: [{ type: String }],
  riskAssessment: { type: String, required: true }
}, { _id: false });

// 预防措施Schema
const PreventiveMeasureSchema = new Schema({
  measureId: { type: String, required: true },
  measureDescription: { type: String, required: true },
  scope: { type: String, required: true },
  responsible: { type: String, required: true },
  targetDate: { type: Date, required: true },
  completionDate: { type: Date },
  status: { 
    type: String, 
    required: true,
    enum: ['planned', 'in_progress', 'completed', 'overdue']
  }
}, { _id: false });

// 文档Schema
const DocumentSchema = new Schema({
  documentType: { 
    type: String, 
    required: true,
    enum: ['analysis_report', 'test_report', 'action_plan', 'verification_report', 'closure_report']
  },
  documentName: { type: String, required: true },
  documentUrl: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  uploadedBy: { type: String, required: true }
}, { _id: false });

// 质量归零Schema
const QualityZeroingSchema = new Schema<IQualityZeroing>({
  zeroingId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  problemId: {
    type: String,
    required: true,
    index: true
  },
  
  // 问题基本信息
  problemInfo: {
    problemTitle: { type: String, required: true },
    problemDescription: { type: String, required: true },
    componentPartNumber: { type: String, required: true, index: true },
    manufacturer: { type: String, required: true, index: true },
    batchNumber: { type: String, required: true },
    discoveryDate: { type: Date, required: true },
    reportedBy: { type: String, required: true },
    severity: { 
      type: String, 
      required: true,
      enum: ['critical', 'major', 'minor'],
      index: true
    }
  },
  
  // 归零流程状态
  zeroingStatus: {
    currentPhase: { 
      type: String, 
      required: true,
      enum: ['problem_analysis', 'root_cause_analysis', 'corrective_action', 'verification', 'closure'],
      index: true
    },
    overallStatus: { 
      type: String, 
      required: true,
      enum: ['in_progress', 'completed', 'suspended', 'cancelled'],
      index: true
    },
    startDate: { type: Date, required: true },
    targetCompletionDate: { type: Date, required: true },
    actualCompletionDate: { type: Date },
    responsible: { type: String, required: true },
    participants: [{ type: String }]
  },
  
  // 问题分析阶段
  problemAnalysis: {
    phenomenonAnalysis: PhenomenonAnalysisSchema,
    impactAssessment: ImpactAssessmentSchema,
    preliminaryConclusions: [{ type: String }],
    analysisDate: { type: Date },
    analyzedBy: { type: String }
  },
  
  // 根因分析阶段
  rootCauseAnalysis: {
    analysisMethods: {
      fishboneAnalysis: FishboneAnalysisSchema,
      fiveWhyAnalysis: FiveWhyAnalysisSchema,
      faultTreeAnalysis: FaultTreeAnalysisSchema,
      otherMethods: [OtherMethodSchema]
    },
    rootCauses: [RootCauseSchema],
    verificationTests: [VerificationTestSchema],
    analysisDate: { type: Date },
    analyzedBy: { type: String },
    reviewedBy: { type: String }
  },
  
  // 纠正措施阶段
  correctiveActions: {
    immediateActions: [ImmediateActionSchema],
    correctiveMeasures: [CorrectiveMeasureSchema],
    preventiveMeasures: [PreventiveMeasureSchema]
  },
  
  // 验证阶段
  verification: {
    effectivenessVerification: {
      verificationMethod: { type: String },
      verificationCriteria: [{ type: String }],
      verificationResults: { type: String },
      verificationDate: { type: Date },
      verifiedBy: { type: String },
      isEffective: { type: Boolean }
    },
    systemicVerification: {
      verificationScope: { type: String },
      verificationActivities: [{ type: String }],
      verificationResults: { type: String },
      newRisksIdentified: [{ type: String }],
      verificationDate: { type: Date },
      verifiedBy: { type: String }
    },
    monitoringPlan: {
      monitoringParameters: [{ type: String }],
      monitoringFrequency: { type: String },
      monitoringDuration: { type: String },
      responsible: { type: String },
      reportingSchedule: { type: String }
    }
  },
  
  // 关闭阶段
  closure: {
    summary: {
      problemSummary: { type: String },
      rootCauseSummary: { type: String },
      actionsSummary: { type: String },
      lessonsLearned: [{ type: String }],
      bestPractices: [{ type: String }]
    },
    closureReview: {
      reviewDate: { type: Date },
      reviewers: [{ type: String }],
      reviewComments: [{ type: String }],
      approvalStatus: { 
        type: String, 
        enum: ['approved', 'rejected', 'conditional']
      },
      approvedBy: { type: String },
      approvalDate: { type: Date }
    },
    knowledgeCapture: {
      documentationUpdated: [{ type: String }],
      trainingConducted: [{ type: String }],
      processesImproved: [{ type: String }],
      knowledgeShared: [{ type: String }]
    }
  },
  
  // 文档
  documents: [DocumentSchema],
  
  // 评价
  evaluation: {
    timeliness: { type: Number, min: 1, max: 5 },
    thoroughness: { type: Number, min: 1, max: 5 },
    effectiveness: { type: Number, min: 1, max: 5 },
    overallRating: { type: Number, min: 1, max: 5 },
    evaluationComments: { type: String },
    evaluatedBy: { type: String },
    evaluationDate: { type: Date }
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
QualityZeroingSchema.index({ 
  'problemInfo.componentPartNumber': 1, 
  'zeroingStatus.overallStatus': 1 
});
QualityZeroingSchema.index({ 
  'zeroingStatus.currentPhase': 1, 
  'zeroingStatus.targetCompletionDate': 1 
});
QualityZeroingSchema.index({ 
  'problemInfo.severity': 1, 
  'zeroingStatus.responsible': 1 
});

export const QualityZeroing = mongoose.model<IQualityZeroing>('QualityZeroing', QualityZeroingSchema);
