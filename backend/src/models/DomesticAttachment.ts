import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDomesticAttachment extends Document {
  material_code: string; // 物料编码，唯一索引
  file_path: string; // 文件完整路径
  file_name: string; // 文件名（不含路径）
  file_size?: number; // 文件大小（字节）
  last_modified?: Date; // 文件最后修改时间
  created_at: Date; // 索引创建时间
  updated_at: Date; // 索引更新时间
}

const DomesticAttachmentSchema = new Schema<IDomesticAttachment>(
  {
    material_code: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    file_path: { 
      type: String, 
      required: true 
    },
    file_name: { 
      type: String, 
      required: true 
    },
    file_size: { 
      type: Number 
    },
    last_modified: { 
      type: Date 
    },
    created_at: { 
      type: Date, 
      default: Date.now 
    },
    updated_at: { 
      type: Date, 
      default: Date.now 
    },
  },
  { collection: 'domestic_attachments', timestamps: false }
);

// 更新时间戳中间件
DomesticAttachmentSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export const DomesticAttachment: Model<IDomesticAttachment> =
  mongoose.models.DomesticAttachment || 
  mongoose.model<IDomesticAttachment>('DomesticAttachment', DomesticAttachmentSchema);

