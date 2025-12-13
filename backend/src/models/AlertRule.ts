import mongoose, { Document, Schema } from 'mongoose';

export interface IAlertRule extends Document {
  ruleId: string;
  name: string;
  category: 'environmental' | 'supply_chain' | 'process' | 'reliability' | 'compliance';
  description?: string;
  matchingCriteria: {
    attribute: 'manufacturer' | 'process' | 'material' | 'structure' | 'function';
    operator: 'equals' | 'includes' | 'similarity';
    value: string | string[];
    weight: number;
  }[];
  minimumMatches: number;
  similarityThreshold: number;
  timeWindowDays: number;
  scope: {
    projects: string[];
    suppliers: string[];
    componentFamilies: string[];
  };
  riskScoring: {
    baseScore: number;
    weights: {
      impact: number;
      severity: number;
      trend: number;
    };
    falsePositivePenalty?: number;
  };
  levelMapping: {
    critical: { min: number };
    warning: { min: number };
    info: { min: number };
  };
  notification: {
    channels: ('system' | 'email' | 'sms')[];
    recipients: string[];
    escalationMinutes?: number;
  };
  enabled: boolean;
  priority: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const MatchingCriteriaSchema = new Schema(
  {
    attribute: { type: String, enum: ['manufacturer', 'process', 'material', 'structure', 'function'], required: true },
    operator: { type: String, enum: ['equals', 'includes', 'similarity'], required: true },
    value: Schema.Types.Mixed,
    weight: { type: Number, default: 1 },
  },
  { _id: false },
);

const ScopeSchema = new Schema(
  {
    projects: [{ type: String }],
    suppliers: [{ type: String }],
    componentFamilies: [{ type: String }],
  },
  { _id: false },
);

const RiskWeightSchema = new Schema(
  {
    impact: { type: Number, default: 0.4 },
    severity: { type: Number, default: 0.35 },
    trend: { type: Number, default: 0.25 },
  },
  { _id: false },
);

const LevelMappingSchema = new Schema(
  {
    critical: {
      min: { type: Number, default: 80 },
    },
    warning: {
      min: { type: Number, default: 60 },
    },
    info: {
      min: { type: Number, default: 40 },
    },
  },
  { _id: false },
);

const NotificationSchema = new Schema(
  {
    channels: [{ type: String, enum: ['system', 'email', 'sms'], default: ['system'] }],
    recipients: [{ type: String }],
    escalationMinutes: { type: Number },
  },
  { _id: false },
);

const AlertRuleSchema = new Schema<IAlertRule>(
  {
    ruleId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['environmental', 'supply_chain', 'process', 'reliability', 'compliance'],
      required: true,
    },
    description: { type: String },
    matchingCriteria: { type: [MatchingCriteriaSchema], required: true },
    minimumMatches: { type: Number, default: 2 },
    similarityThreshold: { type: Number, default: 0.6 },
    timeWindowDays: { type: Number, default: 365 },
    scope: { type: ScopeSchema, default: {} },
    riskScoring: {
      baseScore: { type: Number, default: 50 },
      weights: { type: RiskWeightSchema, default: () => ({}) },
      falsePositivePenalty: { type: Number, default: 5 },
    },
    levelMapping: { type: LevelMappingSchema, default: () => ({}) },
    notification: { type: NotificationSchema, default: () => ({ channels: ['system'], recipients: [] }) },
    enabled: { type: Boolean, default: true, index: true },
    priority: { type: Number, default: 100, index: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

AlertRuleSchema.index({ enabled: 1, priority: 1 });
AlertRuleSchema.index({ category: 1, enabled: 1 });

export const AlertRule = mongoose.model<IAlertRule>('AlertRule', AlertRuleSchema);

