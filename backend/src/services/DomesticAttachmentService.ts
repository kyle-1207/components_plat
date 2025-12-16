import path from 'path';
import fs from 'fs/promises';
import { Stats } from 'fs';
import { DomesticAttachment, IDomesticAttachment } from '../models/DomesticAttachment';

/**
 * 处理国产附件索引与下载的服务
 * - 扫描指定目录，按 material_code（文件名不含扩展名）建立映射
 * - 存储到 MongoDB 集合 domestic_attachments
 * - 提供查询与下载所需的元数据
 */
class DomesticAttachmentService {
  // 默认附件根目录，可通过环境变量覆盖
  private readonly baseDir =
    process.env.DOMESTIC_ATTACHMENT_DIR ||
    'F:\\Business_plat\\产品数据\\产品数据合集';

  /**
   * 归一化料号/文件名，去除扩展名并转大写，便于匹配
   */
  private normalize(code: string): string {
    return code.trim().replace(/\.pdf$/i, '').toUpperCase();
  }

  /**
   * 递归扫描目录，返回所有 PDF 文件的绝对路径
   */
  private async scanPdfFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await this.scanPdfFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && /\.pdf$/i.test(entry.name)) {
        files.push(fullPath);
      }
    }
    return files;
  }

  /**
   * 为单个文件构建索引记录
   */
  private async buildRecord(filePath: string): Promise<{
    material_code: string;
    file_path: string;
    file_name: string;
    file_size?: number;
    last_modified?: Date;
  }> {
    const fileName = path.basename(filePath);
    const material_code = this.normalize(fileName);

    let stats: Stats | undefined;
    try {
      stats = await fs.stat(filePath);
    } catch {
      // ignore stat errors
    }

    return {
      material_code,
      file_path: filePath,
      file_name: fileName,
      file_size: stats?.size,
      last_modified: stats?.mtime,
    };
  }

  /**
   * 重建全量索引：扫描 baseDir，按 material_code upsert
   */
  async reindex(): Promise<{ indexed: number; baseDir: string }> {
    const files = await this.scanPdfFiles(this.baseDir);
    let indexed = 0;

    for (const file of files) {
      const record = await this.buildRecord(file);
      if (!record.material_code) continue;

      await DomesticAttachment.updateOne(
        { material_code: record.material_code },
        {
          $set: {
            file_path: record.file_path,
            file_name: record.file_name,
            file_size: record.file_size,
            last_modified: record.last_modified,
            updated_at: new Date(),
          },
          $setOnInsert: {
            created_at: new Date(),
          },
        },
        { upsert: true }
      );
      indexed += 1;
    }

    return { indexed, baseDir: this.baseDir };
  }

  /**
   * 查询附件元数据（单条，material_code 一一对应）
   */
  async findByMaterialCode(materialCode: string): Promise<IDomesticAttachment | null> {
    const normalized = this.normalize(materialCode);
    return DomesticAttachment.findOne({ material_code: normalized }).lean();
  }
}

export const domesticAttachmentService = new DomesticAttachmentService();

