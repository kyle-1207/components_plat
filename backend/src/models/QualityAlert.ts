import mongoose, { Document, Schema } from 'mongoose';

export type AlertCategory =
  | 'environmental'
  | 'supply_chain'
  | 'process'
  | 'reliability'
  | 'compliance';

export type AlertLevel = 'critical' | 'warning' | 'info';

export type AlertStatus =
  | 'pending_analysis'
  | 'pending_action'
  | 'in_progress'
  | 'verifying'
  | 'closed'
  | 'false_alarm';

export interface IQualityAlert extends Document {
  alertId: string;
  ruleId: string;
  title: string;
  description?: string;
  category: AlertCategory;
  level: AlertLevel;
  riskScore: number;
  matchingAttributes: {
    manufacturer?: string;
    processTags: string[];
    materialTags: string[];
    structureTags: string[];
    functionTags: string[];
    similarity: number;
  };
  relatedObjects: {
    components: string[];
    batches: string[];
    suppliers: string[];
    projects: string[];
  };
  triggerSnapshot: {
    sourceIssueId: string;
    issueSummary?: string;
    metrics?: Record<string, number>;
    triggeredAt: Date;
  };
  recommendations: {
    action: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact?: string;
  }[];
  currentStatus: AlertStatus;
  statusFlow: {
    status: AlertStatus;
    actor: string;
    note?: string;
    updatedAt: Date;
  }[];
  assignments: {
    actionId: string;
    description: string;
    responsible: string;
    deadline?: Date;
    status: 'planned' | 'in_progress' | 'completed' | 'overdue';
    completionDate?: Date;
  }[];
  statistics: {
    responseTimeHours?: number;
    resolutionTimeHours?: number;
    effectivenessScore?: number;
  };
  notifications: {
    channel: 'system' | 'email' | 'sms';
    recipients: string[];
    sentAt: Date;
    status: 'sent' | 'failed';
  }[];
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

const MatchingAttributesSchema = new Schema(
  {
    manufacturer: { type: String },
    processTags: [{ type: String }],
    materialTags: [{ type: String }],
    structureTags: [{ type: String }],
    functionTags: [{ type: String }],
    similarity: { type: Number, default: 0 },
  },
  { _id: false },
);

const RelatedObjectsSchema = new Schema(
  {
    components: [{ type: String }],
    batches: [{ type: String }],
    suppliers: [{ type: String }],
    projects: [{ type: String }],
  },
  { _id: false },
);

const TriggerSnapshotSchema = new Schema(
  {
    sourceIssueId: { type: String, required: true, index: true },
    issueSummary: { type: String },
    metrics: { type: Map, of: Number },
    triggeredAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const RecommendationSchema = new Schema(
  {
    action: { type: String, required: true },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    estimatedImpact: { type: String },
  },
  { _id: false },
);

const StatusFlowSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['pending_analysis', 'pending_action', 'in_progress', 'verifying', 'closed', 'false_alarm'],
      required: true,
    },
    actor: { type: String, required: true },
    note: { type: String },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const AssignmentSchema = new Schema(
  {
    actionId: { type: String, required: true },
    description: { type: String, required: true },
    responsible: { type: String, required: true },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'completed', 'overdue'],
      default: 'planned',
    },
    completionDate: { type: Date },
  },
  { _id: false },
);

const NotificationSchema = new Schema(
  {
    channel: { type: String, enum: ['system', 'email', 'sms'], required: true },
    recipients: [{ type: String, required: true }],
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  },
  { _id: false },
);

const QualityAlertSchema = new Schema<IQualityAlert>(
  {
    alertId: { type: String, required: true, unique: true, index: true },
    ruleId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['environmental', 'supply_chain', 'process', 'reliability', 'compliance'],
      required: true,
      index: true,
    },
    level: { type: String, enum: ['critical', 'warning', 'info'], required: true, index: true },
    riskScore: { type: Number, required: true },
    matchingAttributes: { type: MatchingAttributesSchema, required: true },
    relatedObjects: { type: RelatedObjectsSchema, default: {} },
    triggerSnapshot: { type: TriggerSnapshotSchema, required: true },
    recommendations: { type: [RecommendationSchema], default: [] },
    currentStatus: {
      type: String,
      enum: ['pending_analysis', 'pending_action', 'in_progress', 'verifying', 'closed', 'false_alarm'],
      default: 'pending_analysis',
      index: true,
    },
    statusFlow: { type: [StatusFlowSchema], default: [] },
    assignments: { type: [AssignmentSchema], default: [] },
    statistics: {
      responseTimeHours: { type: Number },
      resolutionTimeHours: { type: Number },
      effectivenessScore: { type: Number },
    },
    notifications: { type: [NotificationSchema], default: [] },
    closedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

QualityAlertSchema.index({ level: 1, createdAt: -1 });
QualityAlertSchema.index({ currentStatus: 1, updatedAt: -1 });
QualityAlertSchema.index({ 'matchingAttributes.manufacturer': 1, createdAt: -1 });

export const QualityAlert = mongoose.model<IQualityAlert>('QualityAlert', QualityAlertSchema);

