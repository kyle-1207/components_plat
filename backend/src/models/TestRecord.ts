import mongoose, { Schema, Document } from 'mongoose';

export interface ITestRecord extends Document {
  _id: mongoose.Types.ObjectId;
  testId: string;
  componentId: mongoose.Types.ObjectId;
  testType: 'electrical' | 'environmental' | 'radiation' | 'mechanical' | 'reliability' | 'emc';
  testStandard: string;
  testConditions: {
    temperature?: {
      min: number;
      max: number;
      unit: string;
    };
    humidity?: {
      value: number;
      unit: string;
    };
    radiation?: {
      type: 'TID' | 'SEE' | 'DD' | 'neutron' | 'proton';
      dose: number;
      unit: string;
      energy?: number;
    };
    voltage?: {
      value: number;
      unit: string;
    };
    frequency?: {
      value: number;
      unit: string;
    };
    duration?: {
      value: number;
      unit: string;
    };
    other?: Record<string, any>;
  };
  testResults: {
    status: 'pass' | 'fail' | 'conditional_pass' | 'in_progress' | 'cancelled';
    parameters: Record<string, {
      measured: number | string;
      expected: number | string;
      unit?: string;
      tolerance?: number;
      result: 'pass' | 'fail' | 'na';
    }>;
    summary?: string;
    observations?: string;
    recommendations?: string;
  };
  testLaboratory: {
    name: string;
    certification?: string;
    address?: string;
    contact?: string;
  };
  testDate: {
    start: Date;
    end?: Date;
  };
  reportFile?: {
    url: string;
    fileName: string;
    fileSize: number;
  };
  certificateFile?: {
    url: string;
    fileName: string;
    fileSize: number;
  };
  cost?: {
    amount: number;
    currency: string;
  };
  requestedBy: string;
  approvedBy?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  tags: string[];
}

const TestRecordSchema = new Schema({
  testId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  componentId: {
    type: Schema.Types.ObjectId,
    ref: 'Component',
    required: true,
    index: true
  },
  testType: {
    type: String,
    required: true,
    enum: ['electrical', 'environmental', 'radiation', 'mechanical', 'reliability', 'emc'],
    index: true
  },
  testStandard: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  testConditions: {
    temperature: {
      min: { type: Number },
      max: { type: Number },
      unit: { type: String, default: '°C' }
    },
    humidity: {
      value: { type: Number },
      unit: { type: String, default: '%RH' }
    },
    radiation: {
      type: {
        type: String,
        enum: ['TID', 'SEE', 'DD', 'neutron', 'proton']
      },
      dose: { type: Number },
      unit: { type: String },
      energy: { type: Number }
    },
    voltage: {
      value: { type: Number },
      unit: { type: String, default: 'V' }
    },
    frequency: {
      value: { type: Number },
      unit: { type: String, default: 'Hz' }
    },
    duration: {
      value: { type: Number },
      unit: { type: String, default: 'hours' }
    },
    other: { type: Schema.Types.Mixed }
  },
  testResults: {
    status: {
      type: String,
      required: true,
      enum: ['pass', 'fail', 'conditional_pass', 'in_progress', 'cancelled'],
      index: true
    },
    parameters: {
      type: Schema.Types.Mixed,
      default: {}
    },
    summary: { type: String },
    observations: { type: String },
    recommendations: { type: String }
  },
  testLaboratory: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    certification: { type: String },
    address: { type: String },
    contact: { type: String }
  },
  testDate: {
    start: {
      type: Date,
      required: true,
      index: true
    },
    end: { type: Date }
  },
  reportFile: {
    url: { type: String },
    fileName: { type: String },
    fileSize: { type: Number }
  },
  certificateFile: {
    url: { type: String },
    fileName: { type: String },
    fileSize: { type: Number }
  },
  cost: {
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'CNY'
    }
  },
  requestedBy: {
    type: String,
    required: true,
    trim: true
  },
  approvedBy: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['planned', 'in_progress', 'completed', 'cancelled', 'failed'],
    default: 'planned',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    index: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
TestRecordSchema.index({ testType: 1, status: 1 });
TestRecordSchema.index({ 'testDate.start': -1 });
TestRecordSchema.index({ testStandard: 1 });
TestRecordSchema.index({ 'testLaboratory.name': 1 });

// 虚拟字段
TestRecordSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

TestRecordSchema.virtual('duration').get(function() {
  if (this.testDate?.start && this.testDate?.end) {
    return Math.ceil((this.testDate.end.getTime() - this.testDate.start.getTime()) / (1000 * 60 * 60 * 24));
  }
  return null;
});

export const TestRecord = mongoose.model<ITestRecord>('TestRecord', TestRecordSchema);
