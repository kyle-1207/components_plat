/**
 * 导入 MIL 系列标准（MIL-HDBK / MIL-PRF / MIL-SPECS / MIL-STD）到 standards 集合
 *
 * 使用方式（PowerShell 示例）：
 *   cd backend
 *   node -r ts-node/register scripts/import_mil_standards.ts "E:\标准数据目录"
 *
 * 说明：
 * - 需要在参数中提供存放 4 个 xlsx 的目录路径（文件名包含 MIL-HDBK / MIL-PRF / MIL-SPECS / MIL-STD）
 * - 每个 xlsx 的表头应为：标准编号、标准名称、标准发布时间、状态
 * - 会在文档中增加 category 字段区分来源文件（如 MIL-HDBK）
 * - standardType 统一写入 'MIL'
 * - status 若无法识别则默认 active
 * - publishDate 解析失败则跳过该行
 */

import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import xlsx from 'xlsx';
import { Standard, IStandard } from '../src/models/Standard';
import { StandardStatus } from '../src/types';

const CATEGORY_FILES = [
  'MIL-HDBK',
  'MIL-PRF',
  'MIL-SPECS',
  'MIL-STD',
];

const excelDateToJSDate = (excelDate: number) => {
  // Excel 序列号转换
  const jsDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
  return jsDate;
};

const parseDate = (value: any): Date | null => {
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  if (typeof value === 'number') {
    const d = excelDateToJSDate(value);
    if (!isNaN(d.getTime())) return d;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

const mapStatus = (value: any): StandardStatus => {
  const str = String(value || '').trim();
  if (/废止|撤销|withdrawn/i.test(str)) return StandardStatus.WITHDRAWN;
  if (/被替代|替代|superseded/i.test(str)) return StandardStatus.SUPERSEDED;
  if (/草案|draft/i.test(str)) return StandardStatus.DRAFT;
  return StandardStatus.ACTIVE;
};

const main = async () => {
  const baseDir = process.argv[2];
  if (!baseDir) {
    console.error('请提供存放 4 个 xlsx 的目录路径，例如：node -r ts-node/register scripts/import_mil_standards.ts "E:\\标准数据目录"');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/business_plat';
  await mongoose.connect(mongoUri);
  console.log(`✅ MongoDB connected: ${mongoUri}`);

  let totalImported = 0;
  for (const category of CATEGORY_FILES) {
    const file = path.join(baseDir, `${category}.xlsx`);
    if (!fs.existsSync(file)) {
      console.warn(`⚠️ 未找到文件: ${file}，跳过`);
      continue;
    }
    console.log(`📥 处理文件: ${file}`);
    const wb = xlsx.readFile(file);
    const sheetName = wb.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json<any>(wb.Sheets[sheetName], { defval: '' });

    const ops = [];
    for (const row of rows) {
      const code = String(row['标准编号'] || '').trim();
      const title = String(row['标准名称'] || '').trim();
      let publish = parseDate(row['标准发布时间']);
      const status = mapStatus(row['状态']);

      if (!code || !title) continue;
      if (!publish) {
        // 发布日期缺失或无法解析，使用占位日期并标记
        publish = new Date('1900-01-01');
        console.warn(`⚠️ 发布日期无法解析，使用占位值(详见标准文本): ${code} - ${row['标准发布时间']}`);
      }

      // 标准模型必填：standardCode, standardType, title, version, status, publishDate, effectiveDate, scope
      const doc: Partial<IStandard> = {
        standardCode: code.toUpperCase(),
        standardType: 'MIL',
        title,
        version: code, // 暂用编号作为版本标识
        status,
        publishDate: publish,
        effectiveDate: publish,
        scope: title,
        category: [category],
      };

      ops.push({
        updateOne: {
          filter: { standardCode: doc.standardCode },
          update: { $set: doc },
          upsert: true,
        },
      });
    }

    if (ops.length) {
      const res = await Standard.bulkWrite(ops, { ordered: false });
      const imported = (res.upsertedCount || 0) + (res.modifiedCount || 0) + (res.nUpserted || 0) + (res.nModified || 0);
      totalImported += imported;
      console.log(`✅ ${category} 导入/更新完成，处理 ${ops.length} 行，写入 ${imported} 条`);
    } else {
      console.log(`ℹ️ ${category} 未找到可导入的数据行`);
    }
  }

  console.log(`🎉 全部完成，总计处理 ${totalImported} 条`);
  await mongoose.disconnect();
  process.exit(0);
};

main().catch(async (err) => {
  console.error('❌ 导入失败:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});

