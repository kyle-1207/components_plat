import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Standard } from '../src/models';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/business_plat';

const run = async () => {
  await mongoose.connect(uri);

  // 统计 category 分布（包含为空/缺失）
  const pipeline = [
    {
      $project: {
        cat: {
          $cond: [
            { $gt: [{ $size: { $ifNull: ['$category', []] } }, 0] },
            { $map: { input: '$category', as: 'c', in: { $toUpper: { $trim: { input: '$$c' } } } } },
            ['<EMPTY>'],
          ],
        },
      },
    },
    { $unwind: '$cat' },
    { $group: { _id: '$cat', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ];

  const result = await Standard.aggregate(pipeline);

  console.log('Category counts:');
  result.forEach((r) => {
    console.log(`${r._id}: ${r.count}`);
  });

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

