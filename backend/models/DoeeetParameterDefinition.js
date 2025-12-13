/**
 * DoEEEt参数定义模型
 * 对应MongoDB中的parameter_definitions集合
 * 
 * 根据数据说明，parameter_final.csv 包含:
 * - key: 参数键
 * - name: 参数名
 * - shortName: 参数名的缩写
 * - category: 参数分类
 * - example: 参数示例（不需要读取使用）
 */

const mongoose = require('mongoose');

const doeeetParameterDefinitionSchema = new mongoose.Schema({
  parameter_key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  category: {
    type: String,
    required: true,
    index: true
  },
  
  name: {
    type: String,
    required: true
  },
  
  short_name: {
    type: String,
    trim: true
  },
  
  // example 字段存在于数据库但不在业务逻辑中使用
  example: {
    type: String,
    trim: true,
    select: false  // 默认查询时不返回此字段
  },
  
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'parameter_definitions',
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
doeeetParameterDefinitionSchema.index({ category: 1, name: 1 });

// 静态方法 - 根据分类获取参数定义
doeeetParameterDefinitionSchema.statics.getByCategory = function(category) {
  return this.find({ category }).sort({ name: 1 });
};

// 静态方法 - 获取所有分类
doeeetParameterDefinitionSchema.statics.getAllCategories = async function() {
  return this.distinct('category');
};

// 静态方法 - 搜索参数定义
doeeetParameterDefinitionSchema.statics.searchDefinitions = function(searchTerm) {
  return this.find({
    $or: [
      { name: new RegExp(searchTerm, 'i') },
      { short_name: new RegExp(searchTerm, 'i') },
      { category: new RegExp(searchTerm, 'i') }
    ]
  });
};

module.exports = mongoose.model('DoeeetParameterDefinition', doeeetParameterDefinitionSchema);

