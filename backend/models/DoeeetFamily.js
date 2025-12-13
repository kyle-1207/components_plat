/**
 * DoEEEt分类(Family)模型
 * 对应MongoDB中的families集合
 */

const mongoose = require('mongoose');

const doeeetFamilySchema = new mongoose.Schema({
  family_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  family_path: {
    type: [String],  // 在families集合中是数组
    required: true,
    index: true
  },
  
  meta: [{
    key: String,
    name: String,
    shortName: String
  }],
  
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'families',
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
doeeetFamilySchema.index({ family_path: 1 });

// 虚拟字段 - 获取分类路径字符串
doeeetFamilySchema.virtual('pathString').get(function() {
  return this.family_path.join(' > ');
});

// 虚拟字段 - 获取顶级分类
doeeetFamilySchema.virtual('topCategory').get(function() {
  return this.family_path[0] || '';
});

// 虚拟字段 - 获取分类层级
doeeetFamilySchema.virtual('level').get(function() {
  return this.family_path.length;
});

// 静态方法 - 获取所有顶级分类
doeeetFamilySchema.statics.getTopCategories = async function() {
  const families = await this.aggregate([
    {
      $project: {
        topCategory: { $arrayElemAt: ['$family_path', 0] }
      }
    },
    {
      $group: {
        _id: '$topCategory',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  return families.map(f => ({
    name: f._id,
    count: f.count
  }));
};

// 静态方法 - 获取分类树
doeeetFamilySchema.statics.getCategoryTree = async function() {
  const families = await this.find({}).sort({ family_path: 1 });
  
  const tree = {};
  
  families.forEach(family => {
    let current = tree;
    family.family_path.forEach((category, index) => {
      if (!current[category]) {
        current[category] = {
          _name: category,
          _level: index,
          _familyId: index === family.family_path.length - 1 ? family.family_id : null,
          _meta: index === family.family_path.length - 1 ? family.meta : null
        };
      }
      current = current[category];
    });
  });
  
  return tree;
};

// 静态方法 - 根据路径查找分类
doeeetFamilySchema.statics.findByPath = function(pathArray) {
  return this.findOne({ family_path: pathArray });
};

module.exports = mongoose.model('DoeeetFamily', doeeetFamilySchema);

