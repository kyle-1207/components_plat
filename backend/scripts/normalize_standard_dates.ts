import mongoose from 'mongoose';
import { Standard } from '../src/models';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/business_plat';

const normalizeDate = (value: any): Date | null => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  // 仅保留日期部分，统一为 UTC 00:00:00
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const run = async () => {
  await mongoose.connect(uri);
  const cursor = Standard.find({}, { publishDate: 1, effectiveDate: 1 }).cursor();

  const bulk: any[] = [];
  for await (const doc of cursor) {
    const publishDate = normalizeDate(doc.publishDate);
    const effectiveDate = normalizeDate(doc.effectiveDate);
    bulk.push({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { publishDate, effectiveDate } },
      },
    });
    if (bulk.length >= 500) {
      await Standard.bulkWrite(bulk);
      bulk.length = 0;
    }
  }
  if (bulk.length) {
    await Standard.bulkWrite(bulk);
  }

  console.log('✅ 标准日期规范化完成');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

