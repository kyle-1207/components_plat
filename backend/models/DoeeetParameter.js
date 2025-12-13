/**
 * DoEEEt参数模型
 * 对应MongoDB中的parameters集合
 */

const mongoose = require('mongoose');

// 固定参数的 key
const FIXED_PARAM_KEYS = {
  OPERATING_TEMPERATURE: '2f2e7f5a-7cd0-47da-8feb-a29336285a3e',
  PACKAGE: '5df8d422-39bd-431f-9095-582a3f6f8fc1'
};

const doeeetParameterSchema = new mongoose.Schema({
  component_id: {
    type: String,
    required: true,
    index: true
  },
  
  parameter_key: {
    type: String,
    required: true,
    index: true
  },
  
  // 根据数据说明，parameter.csv 只有 id, key, value 三个字段
  value: {
    type: String,
    trim: true
  },
  
  // 以下字段是MongoDB导入后额外添加的，保留以兼容现有数据
  parameter_value: {
    type: String,
    trim: true
  },
  
  parameter_type: {
    type: String,
    trim: true
  },
  
  parameter_unit: {
    type: String,
    trim: true
  },
  
  created_at: {
    type: Date,
    default: Date.now
  },
  
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'parameters',
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
doeeetParameterSchema.index({ component_id: 1, parameter_key: 1 });
doeeetParameterSchema.index({ parameter_key: 1, parameter_value: 1 });

// 虚拟字段 - 获取清理后的值
doeeetParameterSchema.virtual('cleanValue').get(function() {
  const val = this.parameter_value || this.value || '';
  // 移除可能的数组字符串格式 "['0.00000']" -> "0.00000"
  return val.replace(/^\['?|'?\]$/g, '').replace(/'/g, '');
});

// 虚拟字段 - 判断是否为固定参数
doeeetParameterSchema.virtual('isFixedParameter').get(function() {
  return this.parameter_key === FIXED_PARAM_KEYS.OPERATING_TEMPERATURE ||
         this.parameter_key === FIXED_PARAM_KEYS.PACKAGE;
});

// 静态方法 - 根据组件ID获取所有参数
doeeetParameterSchema.statics.getByComponentId = function(componentId) {
  return this.find({ component_id: componentId });
};

// 静态方法 - 获取参数统计
doeeetParameterSchema.statics.getParameterStats = async function(parameterKey) {
  return this.aggregate([
    {
      $match: {
        parameter_key: parameterKey,
        parameter_value: { $ne: '', $exists: true }
      }
    },
    {
      $group: {
        _id: '$parameter_value',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 20
    }
  ]);
};

const DoeeetParameter = mongoose.model('DoeeetParameter', doeeetParameterSchema);

// 导出模型和常量
module.exports = DoeeetParameter;
module.exports.FIXED_PARAM_KEYS = FIXED_PARAM_KEYS;

