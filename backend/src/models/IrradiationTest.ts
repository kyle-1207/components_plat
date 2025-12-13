import mongoose, { Schema, Document, Model } from 'mongoose';

export interface SourceMetadata {
  row_number?: number;
  workbook?: string;
}

export interface IIrradiationTest extends Document {
  source_index?: number | string;
  category: string;
  subcategory?: string;
  product_name: string;
  model?: string;
  model_spec?: string;
  package?: string;
  total_dose?: string;
  total_dose_numeric?: number;
  single_event?: string;
  single_event_numeric?: number;
  displacement?: string;
  displacement_numeric?: number;
  esd_rating?: string;
  quality_grade?: string;
  general_spec?: string;
  detail_spec?: string;
  supplier?: string;
  remark?: string;
  created_at?: Date;
  updated_at?: Date;
  _source?: SourceMetadata;
}

const IrradiationTestSchema = new Schema<IIrradiationTest>(
  {
    source_index: { type: Schema.Types.Mixed },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, trim: true },
    product_name: { type: String, required: true, trim: true },
    model: { type: String, trim: true, index: true },
    model_spec: { type: String, trim: true },
    package: { type: String, trim: true },
    total_dose: { type: String, trim: true },
    total_dose_numeric: { type: Number },
    single_event: { type: String, trim: true },
    single_event_numeric: { type: Number },
    displacement: { type: String, trim: true },
    displacement_numeric: { type: Number },
    esd_rating: { type: String, trim: true },
    quality_grade: { type: String, trim: true, index: true },
    general_spec: { type: String, trim: true },
    detail_spec: { type: String, trim: true },
    supplier: { type: String, trim: true, index: true },
    remark: { type: String, trim: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date },
    _source: {
      row_number: { type: Number },
      workbook: { type: String, trim: true },
    },
  },
  {
    collection: 'irradiation_tests',
    versionKey: false,
  }
);

IrradiationTestSchema.index({ category: 1, subcategory: 1 });
IrradiationTestSchema.index({ product_name: 1 });
IrradiationTestSchema.index({ model: 1, supplier: 1 });
IrradiationTestSchema.index({ quality_grade: 1, supplier: 1 });
IrradiationTestSchema.index(
  {
    product_name: 'text',
    model: 'text',
    model_spec: 'text',
    supplier: 'text',
    remark: 'text',
  },
  { name: 'irradiation_text_idx', weights: { model: 5, supplier: 4 } }
);

export const IrradiationTest: Model<IIrradiationTest> = mongoose.model<IIrradiationTest>(
  'IrradiationTest',
  IrradiationTestSchema
);


