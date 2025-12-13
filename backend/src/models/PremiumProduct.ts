import mongoose, { Document, Schema } from 'mongoose';

export interface IKeyFunctionEntry {
  name: string;
  value: string;
  unit?: string;
  remark?: string;
}

export interface ITemperatureRange {
  min?: number;
  max?: number;
  unit?: string;
}

export interface IRadiationMetrics {
  tid?: string;
  sel?: string;
  see?: string;
  remark?: string;
}

export interface IPriceRange {
  min?: number;
  max?: number;
  currency?: string;
}

export interface ILeadTimeRange {
  minWeeks?: number;
  maxWeeks?: number;
}

export interface IFlightHistory {
  hasFlightHistory: boolean;
  description?: string;
}

export interface IContactInfo {
  name?: string;
  phone?: string;
  email?: string;
  remark?: string;
}

export interface IPremiumProduct extends Document {
  premiumCode?: string;
  category: string;
  productName: string;
  modelSpec: string;
  keyFunctions: IKeyFunctionEntry[];
  temperatureRange?: ITemperatureRange;
  radiationMetrics?: IRadiationMetrics;
  packageType?: string;
  qualityLevel?: string;
  priceRange?: IPriceRange;
  leadTimeRange?: ILeadTimeRange;
  flightHistory?: IFlightHistory;
  isPromoted?: boolean;
  contact?: IContactInfo;
  datasheetPath?: string;
  status?: string;
  tags?: string[];
  dataSource?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const KeyFunctionSchema = new Schema<IKeyFunctionEntry>(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
    unit: { type: String },
    remark: { type: String },
  },
  { _id: false },
);

const TemperatureRangeSchema = new Schema<ITemperatureRange>(
  {
    min: { type: Number },
    max: { type: Number },
    unit: { type: String, default: '°C' },
  },
  { _id: false },
);

const RadiationMetricsSchema = new Schema<IRadiationMetrics>(
  {
    tid: { type: String },
    sel: { type: String },
    see: { type: String },
    remark: { type: String },
  },
  { _id: false },
);

const PriceRangeSchema = new Schema<IPriceRange>(
  {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'CNY' },
  },
  { _id: false },
);

const LeadTimeRangeSchema = new Schema<ILeadTimeRange>(
  {
    minWeeks: { type: Number },
    maxWeeks: { type: Number },
  },
  { _id: false },
);

const FlightHistorySchema = new Schema<IFlightHistory>(
  {
    hasFlightHistory: { type: Boolean, default: false },
    description: { type: String },
  },
  { _id: false },
);

const ContactInfoSchema = new Schema<IContactInfo>(
  {
    name: { type: String },
    phone: { type: String },
    email: { type: String },
    remark: { type: String },
  },
  { _id: false },
);

const PremiumProductSchema = new Schema<IPremiumProduct>(
  {
    premiumCode: { type: String, index: true },
    category: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    modelSpec: { type: String, required: true, unique: true, index: true },
    keyFunctions: { type: [KeyFunctionSchema], default: [] },
    temperatureRange: { type: TemperatureRangeSchema },
    radiationMetrics: { type: RadiationMetricsSchema },
    packageType: { type: String },
    qualityLevel: { type: String, index: true },
    priceRange: { type: PriceRangeSchema },
    leadTimeRange: { type: LeadTimeRangeSchema },
    flightHistory: { type: FlightHistorySchema },
    isPromoted: { type: Boolean, default: false, index: true },
    contact: { type: ContactInfoSchema },
    datasheetPath: { type: String },
    status: { type: String, default: 'in_service' },
    tags: [{ type: String }],
    dataSource: { type: String },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  },
);

PremiumProductSchema.index({ category: 1, qualityLevel: 1 });
PremiumProductSchema.index({ isPromoted: 1, 'flightHistory.hasFlightHistory': 1 });

export const PremiumProduct =
  mongoose.models.PremiumProduct || mongoose.model<IPremiumProduct>('PremiumProduct', PremiumProductSchema);


