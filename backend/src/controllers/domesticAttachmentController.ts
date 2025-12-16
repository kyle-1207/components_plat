import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { domesticAttachmentService } from '../services';

/**
 * 重新索引附件（扫描目录 -> 写入 DB）
 */
export const reindexDomesticAttachments = async (_req: Request, res: Response) => {
  const result = await domesticAttachmentService.reindex();
  res.json({ success: true, data: result });
};

/**
 * 获取附件列表（当前一一对应，返回单条或空）
 */
export const getDomesticAttachments = async (req: Request, res: Response) => {
  const materialCode = String(req.params.materialCode || '').trim();
  if (!materialCode) {
    return res.status(400).json({ success: false, message: 'materialCode is required' });
  }

  const attachment = await domesticAttachmentService.findByMaterialCode(materialCode);
  const items = attachment
    ? [
        {
          material_code: attachment.material_code,
          file_name: attachment.file_name,
          file_size: attachment.file_size,
          last_modified: attachment.last_modified,
          downloadUrl: `/api/domestic/attachments/${encodeURIComponent(
            attachment.material_code
          )}/download`,
        },
      ]
    : [];

  res.json({ success: true, data: { items } });
};

/**
 * 下载附件
 */
export const downloadDomesticAttachment = async (req: Request, res: Response) => {
  const materialCode = String(req.params.materialCode || '').trim();
  if (!materialCode) {
    return res.status(400).json({ success: false, message: 'materialCode is required' });
  }

  const attachment = await domesticAttachmentService.findByMaterialCode(materialCode);
  if (!attachment) {
    return res.status(404).json({ success: false, message: 'Attachment not found' });
  }

  const filePath = attachment.file_path;
  try {
    await fs.access(filePath);
  } catch {
    return res.status(404).json({ success: false, message: 'File not found on disk' });
  }

  return res.download(filePath, path.basename(filePath));
};

