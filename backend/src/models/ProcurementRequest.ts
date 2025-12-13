import mongoose, { Schema, Document } from 'mongoose';

export interface IProcurementRequest extends Document {
  _id: mongoose.Types.ObjectId;
  requestId: string;
  title: string;
  description?: string;
  requestType: 'standard' | 'urgent' | 'bulk' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'submitted' | 'approved' | 'in_procurement' | 'completed' | 'cancelled';
  
  // 需求信息
  requirements: {
    componentId?: mongoose.Types.ObjectId;
    partNumber?: string;
    manufacturer?: string;
    quantity: number;
    targetPrice?: {
      amount: number;
      currency: string;
    };
    requiredDate: Date;
    specifications?: Record<string, any>;
    qualityLevel?: 'space' | 'military' | 'industrial' | 'commercial';
    certificationRequired?: boolean;
    testingRequired?: boolean;
  };

  // 供应商信息
  suppliers: {
    supplierId: mongoose.Types.ObjectId;
    contactPerson?: string;
    quotation?: {
      unitPrice: number;
      totalPrice: number;
      currency: string;
      leadTime: number; // 交期（天）
      minimumOrderQuantity: number;
      validUntil: Date;
      terms?: string;
    };
    status: 'invited' | 'quoted' | 'selected' | 'rejected';
    evaluation?: {
      priceScore: number;
      qualityScore: number;
      deliveryScore: number;
      serviceScore: number;
      totalScore: number;
      notes?: string;
    };
  }[];

  // 采购决策
  selectedSupplier?: {
    supplierId: mongoose.Types.ObjectId;
    reason?: string;
    selectedAt: Date;
    approvedBy: string;
  };

  // 预算信息
  budget: {
    allocated: number;
    currency: string;
    costCenter?: string;
    projectCode?: string;
  };

  // 审批流程
  approvalFlow: {
    level: number;
    approver: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    processedAt?: Date;
  }[];

  // 合同和订单
  contract?: {
    contractNumber: string;
    signedDate: Date;
    terms: string;
    deliveryTerms: string;
    paymentTerms: string;
  };

  // 交付跟踪
  delivery?: {
    expectedDate: Date;
    actualDate?: Date;
    trackingNumber?: string;
    status: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'delayed';
    notes?: string;
  };

  // 验收信息
  acceptance?: {
    receivedQuantity: number;
    qualityStatus: 'passed' | 'failed' | 'conditional';
    inspector: string;
    inspectionDate: Date;
    notes?: string;
    defects?: string[];
  };

  requestedBy: string;
  department: string;
  project?: string;
  tags: string[];
  attachments: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: Date;
  }[];
}

const ProcurementRequestSchema = new Schema({
  requestId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  requestType: {
    type: String,
    required: true,
    enum: ['standard', 'urgent', 'bulk', 'custom'],
    index: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'submitted', 'approved', 'in_procurement', 'completed', 'cancelled'],
    default: 'draft',
    index: true
  },
  requirements: {
    componentId: {
      type: Schema.Types.ObjectId,
      ref: 'Component'
    },
    partNumber: {
      type: String,
      trim: true
    },
    manufacturer: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    targetPrice: {
      amount: { type: Number, min: 0 },
      currency: { type: String, default: 'CNY' }
    },
    requiredDate: {
      type: Date,
      required: true,
      index: true
    },
    specifications: {
      type: Schema.Types.Mixed
    },
    qualityLevel: {
      type: String,
      enum: ['space', 'military', 'industrial', 'commercial']
    },
    certificationRequired: {
      type: Boolean,
      default: false
    },
    testingRequired: {
      type: Boolean,
      default: false
    }
  },
  suppliers: [{
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true
    },
    contactPerson: { type: String },
    quotation: {
      unitPrice: { type: Number, min: 0 },
      totalPrice: { type: Number, min: 0 },
      currency: { type: String, default: 'CNY' },
      leadTime: { type: Number, min: 0 },
      minimumOrderQuantity: { type: Number, min: 1 },
      validUntil: { type: Date },
      terms: { type: String }
    },
    status: {
      type: String,
      enum: ['invited', 'quoted', 'selected', 'rejected'],
      default: 'invited'
    },
    evaluation: {
      priceScore: { type: Number, min: 0, max: 100 },
      qualityScore: { type: Number, min: 0, max: 100 },
      deliveryScore: { type: Number, min: 0, max: 100 },
      serviceScore: { type: Number, min: 0, max: 100 },
      totalScore: { type: Number, min: 0, max: 100 },
      notes: { type: String }
    }
  }],
  selectedSupplier: {
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    reason: { type: String },
    selectedAt: { type: Date },
    approvedBy: { type: String }
  },
  budget: {
    allocated: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      required: true,
      default: 'CNY'
    },
    costCenter: { type: String },
    projectCode: { type: String }
  },
  approvalFlow: [{
    level: {
      type: Number,
      required: true,
      min: 1
    },
    approver: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    comments: { type: String },
    processedAt: { type: Date }
  }],
  contract: {
    contractNumber: { type: String },
    signedDate: { type: Date },
    terms: { type: String },
    deliveryTerms: { type: String },
    paymentTerms: { type: String }
  },
  delivery: {
    expectedDate: { type: Date },
    actualDate: { type: Date },
    trackingNumber: { type: String },
    status: {
      type: String,
      enum: ['pending', 'shipped', 'in_transit', 'delivered', 'delayed'],
      default: 'pending'
    },
    notes: { type: String }
  },
  acceptance: {
    receivedQuantity: { type: Number, min: 0 },
    qualityStatus: {
      type: String,
      enum: ['passed', 'failed', 'conditional']
    },
    inspector: { type: String },
    inspectionDate: { type: Date },
    notes: { type: String },
    defects: [{ type: String }]
  },
  requestedBy: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  project: {
    type: String,
    trim: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    index: true
  }],
  attachments: [{
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
ProcurementRequestSchema.index({ status: 1, priority: 1 });
ProcurementRequestSchema.index({ 'requirements.requiredDate': 1 });
ProcurementRequestSchema.index({ requestedBy: 1 });
ProcurementRequestSchema.index({ department: 1 });
ProcurementRequestSchema.index({ createdAt: -1 });

// 虚拟字段
ProcurementRequestSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export const ProcurementRequest = mongoose.model<IProcurementRequest>('ProcurementRequest', ProcurementRequestSchema);
