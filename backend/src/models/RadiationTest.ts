import mongoose, { Schema, Document } from 'mongoose';
import { 
  RadiationTestData, 
  RadiationTestType, 
  RadiationTestCondition,
  RadiationTestResult
} from '../types';

export interface IRadiationTest extends Omit<RadiationTestData, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// 测试条件Schema
const RadiationTestConditionSchema = new Schema({
  // TID 测试条件
  totalDose: { type: Number }, // 总剂量 (rad)
  doseRate: { type: Number },  // 剂量率 (rad/s)
  biasCondition: { type: String }, // 偏置条件
  
  // SEE 测试条件
  particleType: { type: String }, // 粒子类型
  particleEnergy: { type: Number }, // 粒子能量 (MeV)
  fluence: { type: Number }, // 注量 (particles/cm²)
  
  // 环境条件
  temperature: { type: Number }, // 测试温度 (°C)
  humidity: { type: Number },    // 湿度 (%)
  duration: { type: Number }     // 测试时长 (hours)
}, { _id: false });

// 参数漂移Schema
const ParametricShiftSchema = new Schema({
  parameter: { type: String, required: true },
  beforeValue: { type: Number, required: true },
  afterValue: { type: Number, required: true },
  shiftPercent: { type: Number, required: true }
}, { _id: false });

// 测试结果Schema
const RadiationTestResultSchema = new Schema({
  // TID 结果
  tidLevel: { type: Number }, // TID等级 (rad)
  parametricShift: [ParametricShiftSchema], // 参数漂移
  
  // SEE 结果
  seeThreshold: { type: Number }, // SEE阈值 (MeV·cm²/mg)
  crossSection: { type: Number }, // 截面 (cm²)
  errorRate: { type: Number },    // 错误率
  
  // 通用结果
  functionalStatus: { 
    type: String, 
    required: true,
    enum: ['pass', 'fail', 'degraded']
  },
  notes: { type: String },
  rawData: { type: Schema.Types.Mixed } // 原始数据
}, { _id: false });

const RadiationTestSchema = new Schema<IRadiationTest>({
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
  testType: {
    type: String,
    required: true,
    enum: ['tid', 'see', 'dd', 'neutron', 'proton'],
    index: true
  },
  testCondition: {
    type: RadiationTestConditionSchema,
    required: true
  },
  testResult: {
    type: RadiationTestResultSchema,
    required: true
  },
  testDate: {
    type: Date,
    required: true,
    index: true
  },
  testLab: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  testOperator: {
    type: String,
    required: true,
    trim: true
  },
  
  // 认证信息
  certificationLevel: {
    type: String,
    required: true,
    trim: true
  },
  passFailStatus: {
    type: String,
    required: true,
    enum: ['pass', 'fail', 'conditional'],
    index: true
  },
  
  // 文档
  reportFile: {
    type: String,
    trim: true
  },
  certificateFile: {
    type: String,
    trim: true
  },
  dataFiles: [{
    type: String,
    trim: true
  }],
  
  // 批次信息
  batchNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  sampleCount: {
    type: Number,
    required: true,
    min: 1
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
RadiationTestSchema.index({ componentId: 1, testType: 1 });
RadiationTestSchema.index({ testType: 1, passFailStatus: 1 });
RadiationTestSchema.index({ testLab: 1, testDate: -1 });
RadiationTestSchema.index({ batchNumber: 1, testType: 1 });
RadiationTestSchema.index({ testDate: -1, passFailStatus: 1 });

// 实例方法
RadiationTestSchema.methods.isPassed = function(): boolean {
  return this.passFailStatus === 'pass';
};

RadiationTestSchema.methods.getTestSummary = function(): string {
  const type = this.testType.toUpperCase();
  const status = this.passFailStatus;
  const level = this.certificationLevel;
  
  return `${type} Test - ${status.toUpperCase()} (${level})`;
};

RadiationTestSchema.methods.getSignificantParametricShifts = function(threshold: number = 10): any[] {
  if (!this.testResult.parametricShift) return [];
  
  return this.testResult.parametricShift.filter((shift: any) => 
    Math.abs(shift.shiftPercent) >= threshold
  );
};

RadiationTestSchema.methods.getDoseLevel = function(): number | null {
  switch (this.testType) {
    case 'tid':
      return this.testResult.tidLevel || this.testCondition.totalDose || null;
    case 'dd':
      return this.testCondition.fluence || null;
    default:
      return null;
  }
};

RadiationTestSchema.methods.isValidForLevel = function(requiredLevel: string): boolean {
  if (!this.isPassed()) return false;
  
  // 根据测试类型和等级判断有效性
  const levelHierarchy = {
    'tid': {
      'commercial': 0,
      'industrial': 1,
      'automotive': 2,
      'military': 3,
      'space': 4
    }
  };
  
  const hierarchy = (levelHierarchy as any)[this.testType];
  if (!hierarchy) return true; // 对于没有定义层级的测试类型，认为有效
  
  const certLevel = hierarchy[this.certificationLevel.toLowerCase()];
  const reqLevel = hierarchy[requiredLevel.toLowerCase()];
  
  return certLevel !== undefined && reqLevel !== undefined && certLevel >= reqLevel;
};

// 静态方法
RadiationTestSchema.statics.findByComponent = function(componentId: string) {
  return this.find({ componentId }).sort({ testDate: -1 });
};

RadiationTestSchema.statics.findByTestType = function(testType: string) {
  return this.find({ testType }).sort({ testDate: -1 });
};

RadiationTestSchema.statics.findByLab = function(testLab: string) {
  return this.find({ testLab }).sort({ testDate: -1 });
};

RadiationTestSchema.statics.findPassed = function() {
  return this.find({ passFailStatus: 'pass' }).sort({ testDate: -1 });
};

RadiationTestSchema.statics.findFailed = function() {
  return this.find({ passFailStatus: 'fail' }).sort({ testDate: -1 });
};

RadiationTestSchema.statics.findRecentTests = function(days: number = 30) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.find({ testDate: { $gte: cutoffDate } })
             .sort({ testDate: -1 });
};

RadiationTestSchema.statics.findByBatch = function(batchNumber: string) {
  return this.find({ batchNumber }).sort({ testDate: -1 });
};

RadiationTestSchema.statics.getTestStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byType: {
          $push: {
            type: '$testType',
            status: '$passFailStatus'
          }
        },
        byStatus: {
          $push: {
            status: '$passFailStatus'
          }
        },
        byLab: {
          $push: {
            lab: '$testLab',
            status: '$passFailStatus'
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
            input: ['tid', 'see', 'dd', 'neutron', 'proton'],
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $let: {
                    vars: {
                      typeTests: {
                        $filter: {
                          input: '$byType',
                          cond: { $eq: ['$$this.type', '$$this'] }
                        }
                      }
                    },
                    in: {
                      $arrayToObject: [{
                        k: '$$this',
                        v: {
                          total: { $size: '$$typeTests' },
                          passed: {
                            $size: {
                              $filter: {
                                input: '$$typeTests',
                                cond: { $eq: ['$$this.status', 'pass'] }
                              }
                            }
                          },
                          failed: {
                            $size: {
                              $filter: {
                                input: '$$typeTests',
                                cond: { $eq: ['$$this.status', 'fail'] }
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
        statusStats: {
          $reduce: {
            input: ['pass', 'fail', 'conditional'],
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
        }
      }
    }
  ]);
};

RadiationTestSchema.statics.findComponentTestHistory = function(componentId: string, testType?: string) {
  const query: any = { componentId };
  if (testType) {
    query.testType = testType;
  }
  
  return this.find(query)
             .sort({ testDate: -1 })
             .populate('componentId', 'partNumber name manufacturer');
};

RadiationTestSchema.statics.findHighDoseTests = function(minimumDose: number = 100000) {
  return this.find({
    $or: [
      { 'testCondition.totalDose': { $gte: minimumDose } },
      { 'testResult.tidLevel': { $gte: minimumDose } }
    ]
  }).sort({ 'testCondition.totalDose': -1, 'testResult.tidLevel': -1 });
};

RadiationTestSchema.statics.searchTests = function(criteria: any) {
  const query: any = {};
  
  if (criteria.componentId) {
    query.componentId = criteria.componentId;
  }
  
  if (criteria.testType) {
    query.testType = criteria.testType;
  }
  
  if (criteria.testLab) {
    query.testLab = new RegExp(criteria.testLab, 'i');
  }
  
  if (criteria.passFailStatus) {
    query.passFailStatus = criteria.passFailStatus;
  }
  
  if (criteria.dateFrom || criteria.dateTo) {
    query.testDate = {};
    if (criteria.dateFrom) {
      query.testDate.$gte = new Date(criteria.dateFrom);
    }
    if (criteria.dateTo) {
      query.testDate.$lte = new Date(criteria.dateTo);
    }
  }
  
  if (criteria.batchNumber) {
    query.batchNumber = new RegExp(criteria.batchNumber, 'i');
  }
  
  if (criteria.certificationLevel) {
    query.certificationLevel = new RegExp(criteria.certificationLevel, 'i');
  }
  
  return this.find(query).sort({ testDate: -1 });
};

export const RadiationTest = mongoose.model<IRadiationTest>('RadiationTest', RadiationTestSchema);
