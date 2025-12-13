import mongoose, { Schema, Document } from 'mongoose';

// 追溯查询数据接口
export interface ITraceabilityQuery extends Document {
  _id: mongoose.Types.ObjectId;
  traceabilityId: string; // 追溯记录ID
  queryDate: Date; // 查询日期
  queryBy: string; // 查询人
  
  // 查询目标
  queryTarget: {
    targetType: 'component' | 'batch' | 'lot' | 'serial_number' | 'project';
    targetValue: string; // 目标值 (器件型号、批次号等)
    targetDescription: string; // 目标描述
  };
  
  // 器件族谱信息
  componentGenealogy: {
    // 基础信息
    basicInfo: {
      partNumber: string; // 器件型号
      manufacturer: string; // 制造商
      category: string; // 器件类别
      description: string; // 器件描述
    };
    
    // 设计族谱
    designGenealogy: {
      originalDesigner: string; // 原始设计者
      designVersion: string; // 设计版本
      designDate: Date; // 设计日期
      designChanges: {
        changeVersion: string;
        changeDate: Date;
        changeReason: string;
        changedBy: string;
        impactAssessment: string;
      }[];
      relatedComponents: string[]; // 相关器件
    };
    
    // 制造族谱
    manufacturingGenealogy: {
      manufacturingSite: string; // 制造地点
      productionLine: string; // 生产线
      manufacturingProcess: string; // 制造工艺
      processVersion: string; // 工艺版本
      qualityLevel: string; // 质量等级
      manufacturingPeriod: {
        startDate: Date;
        endDate: Date;
      };
    };
  };
  
  // 批次级追溯信息
  batchTraceability: {
    // 批次基本信息
    batchInfo: {
      batchNumber: string; // 批次号
      lotCode: string; // 批号
      waferLot?: string; // 晶圆批次
      assemblyLot?: string; // 封装批次
      testLot?: string; // 测试批次
      quantity: number; // 数量
      productionDate: Date; // 生产日期
    };
    
    // 原材料追溯
    materialTraceability: {
      materialType: string; // 材料类型
      materialGrade: string; // 材料等级
      supplierName: string; // 供应商名称
      supplierLot: string; // 供应商批次
      receivedDate: Date; // 接收日期
      inspectionResults: string; // 检验结果
      certificateNumber: string; // 证书编号
    }[];
    
    // 生产过程追溯
    productionTraceability: {
      processStep: string; // 工艺步骤
      processParameters: {
        parameter: string;
        value: string;
        unit: string;
        tolerance: string;
      }[];
      equipment: string; // 设备
      operator: string; // 操作员
      processDate: Date; // 工艺日期
      processResult: string; // 工艺结果
      qualityCheckResults: string[]; // 质量检查结果
    }[];
    
    // 测试追溯
    testTraceability: {
      testType: string; // 测试类型
      testStandard: string; // 测试标准
      testParameters: {
        parameter: string;
        specification: string;
        actualValue: string;
        result: 'pass' | 'fail';
      }[];
      testEquipment: string; // 测试设备
      testOperator: string; // 测试员
      testDate: Date; // 测试日期
      testReport: string; // 测试报告
    }[];
  };
  
  // 质量历史追溯
  qualityHistory: {
    // 质量问题记录
    qualityIssues: {
      issueId: string;
      issueType: string;
      issueDescription: string;
      discoveryDate: Date;
      reportedBy: string;
      severity: string;
      status: string;
      resolution: string;
      closureDate?: Date;
    }[];
    
    // 质量改进记录
    qualityImprovements: {
      improvementId: string;
      improvementType: string;
      improvementDescription: string;
      implementationDate: Date;
      implementedBy: string;
      effectivenessAssessment: string;
    }[];
    
    // 认证历史
    certificationHistory: {
      certificationType: string;
      certificationBody: string;
      certificateNumber: string;
      issueDate: Date;
      expiryDate: Date;
      status: 'valid' | 'expired' | 'suspended' | 'withdrawn';
    }[];
  };
  
  // 供应链追溯
  supplyChainTraceability: {
    // 供应商层级
    supplierTiers: {
      tier: number; // 供应商层级 (1/2/3...)
      supplierName: string;
      supplierCode: string;
      supplierType: string;
      location: string;
      certificationLevel: string;
      relationshipStart: Date;
      relationshipStatus: 'active' | 'inactive' | 'suspended';
    }[];
    
    // 物流追溯
    logisticsTraceability: {
      shipmentId: string;
      fromLocation: string;
      toLocation: string;
      carrier: string;
      shipmentDate: Date;
      receivedDate: Date;
      condition: string; // 接收状态
      storageConditions: string; // 存储条件
      handlingHistory: string[]; // 处理历史
    }[];
    
    // 库存追溯
    inventoryTraceability: {
      warehouseLocation: string;
      storageDate: Date;
      storageConditions: string;
      inventoryStatus: string;
      lastInventoryCheck: Date;
      movementHistory: {
        movementType: string;
        movementDate: Date;
        fromLocation: string;
        toLocation: string;
        reason: string;
        authorizedBy: string;
      }[];
    };
  };
  
  // 应用追溯
  applicationTraceability: {
    // 项目应用
    projectApplications: {
      projectId: string;
      projectName: string;
      applicationDate: Date;
      applicationQuantity: number;
      applicationLocation: string;
      responsibleEngineer: string;
      applicationStatus: 'planned' | 'in_use' | 'completed' | 'retired';
    }[];
    
    // 系统集成
    systemIntegration: {
      systemId: string;
      systemName: string;
      integrationDate: Date;
      systemFunction: string;
      operatingConditions: string;
      performanceData: {
        parameter: string;
        value: string;
        measurementDate: Date;
      }[];
    }[];
    
    // 维护历史
    maintenanceHistory: {
      maintenanceId: string;
      maintenanceType: string;
      maintenanceDate: Date;
      maintenanceDescription: string;
      maintenanceResults: string;
      nextMaintenanceDate: Date;
      maintenanceBy: string;
    }[];
  };
  
  // 追溯结果分析
  traceabilityAnalysis: {
    // 完整性评估
    completenessAssessment: {
      overallCompleteness: number; // 总体完整性 (0-100%)
      missingInformation: string[]; // 缺失信息
      dataQualityIssues: string[]; // 数据质量问题
      recommendedActions: string[]; // 建议措施
    };
    
    // 风险识别
    riskIdentification: {
      identifiedRisks: {
        riskType: string;
        riskDescription: string;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
        mitigation: string;
      }[];
      overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    };
    
    // 合规性检查
    complianceCheck: {
      regulatoryRequirements: string[];
      complianceStatus: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
      nonComplianceIssues: string[];
      correctionActions: string[];
    };
  };
  
  // 查询配置
  queryConfiguration: {
    traceabilityDepth: number; // 追溯深度
    timeRange: {
      startDate: Date;
      endDate: Date;
    };
    includeSuppliers: boolean;
    includeQualityData: boolean;
    includeTestData: boolean;
    includeApplicationData: boolean;
    customFilters: {
      filterType: string;
      filterValue: string;
    }[];
  };
  
  // 查询结果
  queryResults: {
    resultSummary: string;
    totalRecordsFound: number;
    dataSourcesAccessed: string[];
    queryExecutionTime: number; // 毫秒
    resultCompleteness: number; // 结果完整性 (0-100%)
    resultConfidence: number; // 结果可信度 (0-100%)
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// 设计变更Schema
const DesignChangeSchema = new Schema({
  changeVersion: { type: String, required: true },
  changeDate: { type: Date, required: true },
  changeReason: { type: String, required: true },
  changedBy: { type: String, required: true },
  impactAssessment: { type: String, required: true }
}, { _id: false });

// 工艺参数Schema
const ProcessParameterSchema = new Schema({
  parameter: { type: String, required: true },
  value: { type: String, required: true },
  unit: { type: String, required: true },
  tolerance: { type: String, required: true }
}, { _id: false });

// 测试参数Schema
const TestParameterSchema = new Schema({
  parameter: { type: String, required: true },
  specification: { type: String, required: true },
  actualValue: { type: String, required: true },
  result: { 
    type: String, 
    required: true,
    enum: ['pass', 'fail']
  }
}, { _id: false });

// 质量问题Schema
const QualityIssueSchema = new Schema({
  issueId: { type: String, required: true },
  issueType: { type: String, required: true },
  issueDescription: { type: String, required: true },
  discoveryDate: { type: Date, required: true },
  reportedBy: { type: String, required: true },
  severity: { type: String, required: true },
  status: { type: String, required: true },
  resolution: { type: String },
  closureDate: { type: Date }
}, { _id: false });

// 供应商层级Schema
const SupplierTierSchema = new Schema({
  tier: { type: Number, required: true },
  supplierName: { type: String, required: true },
  supplierCode: { type: String, required: true },
  supplierType: { type: String, required: true },
  location: { type: String, required: true },
  certificationLevel: { type: String, required: true },
  relationshipStart: { type: Date, required: true },
  relationshipStatus: { 
    type: String, 
    required: true,
    enum: ['active', 'inactive', 'suspended']
  }
}, { _id: false });

// 移动历史Schema
const MovementHistorySchema = new Schema({
  movementType: { type: String, required: true },
  movementDate: { type: Date, required: true },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  reason: { type: String, required: true },
  authorizedBy: { type: String, required: true }
}, { _id: false });

// 风险识别Schema
const RiskSchema = new Schema({
  riskType: { type: String, required: true },
  riskDescription: { type: String, required: true },
  riskLevel: { 
    type: String, 
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  mitigation: { type: String, required: true }
}, { _id: false });

// 追溯查询Schema
const TraceabilityQuerySchema = new Schema<ITraceabilityQuery>({
  traceabilityId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  queryDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  queryBy: {
    type: String,
    required: true,
    index: true
  },
  
  // 查询目标
  queryTarget: {
    targetType: { 
      type: String, 
      required: true,
      enum: ['component', 'batch', 'lot', 'serial_number', 'project'],
      index: true
    },
    targetValue: { type: String, required: true, index: true },
    targetDescription: { type: String, required: true }
  },
  
  // 器件族谱
  componentGenealogy: {
    basicInfo: {
      partNumber: { type: String, required: true, index: true },
      manufacturer: { type: String, required: true, index: true },
      category: { type: String, required: true },
      description: { type: String, required: true }
    },
    designGenealogy: {
      originalDesigner: { type: String, required: true },
      designVersion: { type: String, required: true },
      designDate: { type: Date, required: true },
      designChanges: [DesignChangeSchema],
      relatedComponents: [{ type: String }]
    },
    manufacturingGenealogy: {
      manufacturingSite: { type: String, required: true },
      productionLine: { type: String, required: true },
      manufacturingProcess: { type: String, required: true },
      processVersion: { type: String, required: true },
      qualityLevel: { type: String, required: true },
      manufacturingPeriod: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true }
      }
    }
  },
  
  // 批次追溯
  batchTraceability: {
    batchInfo: {
      batchNumber: { type: String, required: true, index: true },
      lotCode: { type: String, required: true },
      waferLot: { type: String },
      assemblyLot: { type: String },
      testLot: { type: String },
      quantity: { type: Number, required: true },
      productionDate: { type: Date, required: true }
    },
    materialTraceability: [{
      materialType: { type: String, required: true },
      materialGrade: { type: String, required: true },
      supplierName: { type: String, required: true },
      supplierLot: { type: String, required: true },
      receivedDate: { type: Date, required: true },
      inspectionResults: { type: String, required: true },
      certificateNumber: { type: String, required: true }
    }],
    productionTraceability: [{
      processStep: { type: String, required: true },
      processParameters: [ProcessParameterSchema],
      equipment: { type: String, required: true },
      operator: { type: String, required: true },
      processDate: { type: Date, required: true },
      processResult: { type: String, required: true },
      qualityCheckResults: [{ type: String }]
    }],
    testTraceability: [{
      testType: { type: String, required: true },
      testStandard: { type: String, required: true },
      testParameters: [TestParameterSchema],
      testEquipment: { type: String, required: true },
      testOperator: { type: String, required: true },
      testDate: { type: Date, required: true },
      testReport: { type: String, required: true }
    }]
  },
  
  // 质量历史
  qualityHistory: {
    qualityIssues: [QualityIssueSchema],
    qualityImprovements: [{
      improvementId: { type: String, required: true },
      improvementType: { type: String, required: true },
      improvementDescription: { type: String, required: true },
      implementationDate: { type: Date, required: true },
      implementedBy: { type: String, required: true },
      effectivenessAssessment: { type: String, required: true }
    }],
    certificationHistory: [{
      certificationType: { type: String, required: true },
      certificationBody: { type: String, required: true },
      certificateNumber: { type: String, required: true },
      issueDate: { type: Date, required: true },
      expiryDate: { type: Date, required: true },
      status: { 
        type: String, 
        required: true,
        enum: ['valid', 'expired', 'suspended', 'withdrawn']
      }
    }]
  },
  
  // 供应链追溯
  supplyChainTraceability: {
    supplierTiers: [SupplierTierSchema],
    logisticsTraceability: [{
      shipmentId: { type: String, required: true },
      fromLocation: { type: String, required: true },
      toLocation: { type: String, required: true },
      carrier: { type: String, required: true },
      shipmentDate: { type: Date, required: true },
      receivedDate: { type: Date, required: true },
      condition: { type: String, required: true },
      storageConditions: { type: String, required: true },
      handlingHistory: [{ type: String }]
    }],
    inventoryTraceability: {
      warehouseLocation: { type: String, required: true },
      storageDate: { type: Date, required: true },
      storageConditions: { type: String, required: true },
      inventoryStatus: { type: String, required: true },
      lastInventoryCheck: { type: Date, required: true },
      movementHistory: [MovementHistorySchema]
    }
  },
  
  // 应用追溯
  applicationTraceability: {
    projectApplications: [{
      projectId: { type: String, required: true },
      projectName: { type: String, required: true },
      applicationDate: { type: Date, required: true },
      applicationQuantity: { type: Number, required: true },
      applicationLocation: { type: String, required: true },
      responsibleEngineer: { type: String, required: true },
      applicationStatus: { 
        type: String, 
        required: true,
        enum: ['planned', 'in_use', 'completed', 'retired']
      }
    }],
    systemIntegration: [{
      systemId: { type: String, required: true },
      systemName: { type: String, required: true },
      integrationDate: { type: Date, required: true },
      systemFunction: { type: String, required: true },
      operatingConditions: { type: String, required: true },
      performanceData: [{
        parameter: { type: String, required: true },
        value: { type: String, required: true },
        measurementDate: { type: Date, required: true }
      }]
    }],
    maintenanceHistory: [{
      maintenanceId: { type: String, required: true },
      maintenanceType: { type: String, required: true },
      maintenanceDate: { type: Date, required: true },
      maintenanceDescription: { type: String, required: true },
      maintenanceResults: { type: String, required: true },
      nextMaintenanceDate: { type: Date, required: true },
      maintenanceBy: { type: String, required: true }
    }]
  },
  
  // 追溯分析
  traceabilityAnalysis: {
    completenessAssessment: {
      overallCompleteness: { type: Number, required: true, min: 0, max: 100 },
      missingInformation: [{ type: String }],
      dataQualityIssues: [{ type: String }],
      recommendedActions: [{ type: String }]
    },
    riskIdentification: {
      identifiedRisks: [RiskSchema],
      overallRiskLevel: { 
        type: String, 
        required: true,
        enum: ['low', 'medium', 'high', 'critical']
      }
    },
    complianceCheck: {
      regulatoryRequirements: [{ type: String }],
      complianceStatus: { 
        type: String, 
        required: true,
        enum: ['compliant', 'non_compliant', 'partial', 'unknown']
      },
      nonComplianceIssues: [{ type: String }],
      correctionActions: [{ type: String }]
    }
  },
  
  // 查询配置
  queryConfiguration: {
    traceabilityDepth: { type: Number, required: true, min: 1, max: 10 },
    timeRange: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true }
    },
    includeSuppliers: { type: Boolean, default: true },
    includeQualityData: { type: Boolean, default: true },
    includeTestData: { type: Boolean, default: true },
    includeApplicationData: { type: Boolean, default: true },
    customFilters: [{
      filterType: { type: String, required: true },
      filterValue: { type: String, required: true }
    }]
  },
  
  // 查询结果
  queryResults: {
    resultSummary: { type: String, required: true },
    totalRecordsFound: { type: Number, required: true },
    dataSourcesAccessed: [{ type: String }],
    queryExecutionTime: { type: Number, required: true },
    resultCompleteness: { type: Number, required: true, min: 0, max: 100 },
    resultConfidence: { type: Number, required: true, min: 0, max: 100 }
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
TraceabilityQuerySchema.index({ 
  'queryTarget.targetValue': 1, 
  'queryTarget.targetType': 1 
});
TraceabilityQuerySchema.index({ 
  'componentGenealogy.basicInfo.partNumber': 1, 
  'batchTraceability.batchInfo.batchNumber': 1 
});
TraceabilityQuerySchema.index({ 
  queryBy: 1, 
  queryDate: -1 
});

export const TraceabilityQuery = mongoose.model<ITraceabilityQuery>('TraceabilityQuery', TraceabilityQuerySchema);
