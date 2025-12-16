import path from 'path';
import fs from 'fs/promises';
import { Stats } from 'fs';
import { StandardAttachment, IStandardAttachment } from '../models/StandardAttachment';

/**
 * 标准附件服务：
 * - 扫描标准目录，按 standardCode（文件名去扩展名）建立映射
 * - 单个标准仅支持一个 pdf 文件（同名覆盖）
 * - 提供查询与下载所需的元数据
 */
class StandardAttachmentService {
  private readonly baseDir =
    process.env.STANDARD_BASE_DIR || 'F:\\Business_plat\\MIL标准数据';

  private normalize(code: string): string {
    // 去掉 .pdf 后缀（不区分大小写）
    let normalized = code.trim().replace(/\.pdf$/i, '');
    // 转大写
    normalized = normalized.toUpperCase();
    // 统一处理多个连续空格为单个空格（保持版本信息中的空格）
    normalized = normalized.replace(/\s+/g, ' ');
    return normalized;
  }

  private async scanPdfFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const sub = await this.scanPdfFiles(fullPath);
        files.push(...sub);
      } else if (entry.isFile() && /\.pdf$/i.test(entry.name)) {
        files.push(fullPath);
      }
    }
    return files;
  }

  private async buildRecord(filePath: string) {
    const fileName = path.basename(filePath);
    const standard_code = this.normalize(fileName);
    let stats: Stats | undefined;
    try {
      stats = await fs.stat(filePath);
    } catch {
      // ignore
    }
    return {
      standard_code,
      file_path: filePath,
      file_name: fileName,
      file_size: stats?.size,
      last_modified: stats?.mtime,
    };
  }

  /**
   * 重建索引（全量扫描 + upsert）
   */
  async reindex(): Promise<{ indexed: number; baseDir: string }> {
    const files = await this.scanPdfFiles(this.baseDir);
    let indexed = 0;
    const sampleRecords: Array<{ fileName: string; standard_code: string }> = [];
    for (const file of files) {
      const record = await this.buildRecord(file);
      if (!record.standard_code) continue;
      // 记录前10个样本用于调试
      if (sampleRecords.length < 10) {
        sampleRecords.push({ fileName: record.file_name, standard_code: record.standard_code });
      }
      await StandardAttachment.updateOne(
        { standard_code: record.standard_code },
        {
          $set: {
            file_path: record.file_path,
            file_name: record.file_name,
            file_size: record.file_size,
            last_modified: record.last_modified,
            updated_at: new Date(),
          },
          $setOnInsert: { created_at: new Date() },
        },
        { upsert: true }
      );
      indexed += 1;
    }
    console.log('[StandardAttachmentService] reindex completed:', {
      indexed,
      baseDir: this.baseDir,
      sampleRecords: sampleRecords.slice(0, 5), // 只输出前5个样本
    });
    return { indexed, baseDir: this.baseDir };
  }

  async findByStandardCode(code: string): Promise<IStandardAttachment | null> {
    const normalized = this.normalize(code);
    console.log('[StandardAttachmentService] findByStandardCode:', { original: code, normalized });
    const result = await StandardAttachment.findOne({ standard_code: normalized }).lean();
    console.log('[StandardAttachmentService] findByStandardCode result:', result ? { standard_code: result.standard_code, file_name: result.file_name } : null);
    return result;
  }
}

export const standardAttachmentService = new StandardAttachmentService();

