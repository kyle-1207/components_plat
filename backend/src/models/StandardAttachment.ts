import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStandardAttachment extends Document {
  standard_code: string; // 对应 standards.standardCode（大写，一一对应）
  file_path: string;
  file_name: string;
  file_size?: number;
  last_modified?: Date;
  created_at: Date;
  updated_at: Date;
}

const StandardAttachmentSchema = new Schema<IStandardAttachment>(
  {
    standard_code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    file_path: { type: String, required: true },
    file_name: { type: String, required: true },
    file_size: { type: Number },
    last_modified: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: 'standard_attachments', timestamps: false }
);

StandardAttachmentSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

export const StandardAttachment: Model<IStandardAttachment> =
  mongoose.models.StandardAttachment ||
  mongoose.model<IStandardAttachment>('StandardAttachment', StandardAttachmentSchema);

