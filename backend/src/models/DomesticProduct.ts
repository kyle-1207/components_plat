import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDomesticProduct extends Document {
  seq: number;
  level1: string;
  level2: string;
  level3: string;
  name: string;
  manufacturer: string;
  model: string;
  key_specs?: string;
  temperature_range?: string;
  radiation?: string | number;
  package?: string;
  quality?: string;
  price_range?: string;
  lead_time?: string;
  space_supply?: string;
  is_promoted?: string;
  contact?: string;
  material_code?: string;
}

const DomesticProductSchema = new Schema<IDomesticProduct>(
  {
    seq: { type: Number, default: 0 },
    level1: { type: String, index: true },
    level2: { type: String, index: true },
    level3: { type: String, index: true },
    name: { type: String, index: true },
    manufacturer: { type: String, index: true },
    model: { type: String, index: true },
    key_specs: { type: String },
    temperature_range: { type: String },
    radiation: { type: Schema.Types.Mixed },
    package: { type: String },
    quality: { type: String },
    price_range: { type: String },
    lead_time: { type: String },
    space_supply: { type: String },
    is_promoted: { type: String },
    contact: { type: String },
    material_code: { type: String },
  },
  { collection: 'domestic_products', timestamps: false }
);

DomesticProductSchema.index({ manufacturer: 1, model: 1 });

export const DomesticProduct: Model<IDomesticProduct> =
  mongoose.models.DomesticProduct || mongoose.model<IDomesticProduct>('DomesticProduct', DomesticProductSchema);


