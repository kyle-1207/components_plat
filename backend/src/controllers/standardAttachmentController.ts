import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { standardAttachmentService } from '../services';

export const reindexStandardAttachments = async (_req: Request, res: Response) => {
  const result = await standardAttachmentService.reindex();
  res.json({ success: true, data: result });
};

export const getStandardAttachment = async (req: Request, res: Response) => {
  const code = String(req.params.standardCode || '').trim();
  if (!code) {
    return res.status(400).json({ success: false, message: 'standardCode is required' });
  }
  console.log('[StandardAttachment] getStandardAttachment, code:', code);
  const att = await standardAttachmentService.findByStandardCode(code);
  console.log('[StandardAttachment] findByStandardCode result:', att ? { standard_code: att.standard_code, file_name: att.file_name } : null);
  const items = att
    ? [
        {
          standardCode: att.standard_code,
          fileName: att.file_name,
          fileSize: att.file_size,
          lastModified: att.last_modified,
          downloadUrl: `/api/standards/${encodeURIComponent(att.standard_code)}/download`,
        },
      ]
    : [];
  res.json({ success: true, data: { items } });
};

export const downloadStandardAttachment = async (req: Request, res: Response) => {
  const code = String(req.params.standardCode || '').trim();
  if (!code) {
    return res.status(400).json({ success: false, message: 'standardCode is required' });
  }
  const att = await standardAttachmentService.findByStandardCode(code);
  if (!att) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }
  const filePath = att.file_path;
  try {
    await fs.access(filePath);
  } catch {
    return res.status(404).json({ success: false, message: 'File not found on disk' });
  }
  res.download(filePath, path.basename(filePath));
};

