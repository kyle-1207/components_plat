const Component = require('../models/Component');
const { validationResult } = require('express-validator');

// 获取所有元器件（支持分页和过滤）
exports.getComponents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      primaryCategory,
      secondaryCategory,
      manufacturer,
      qualityLevel,
      lifecycle,
      minPrice,
      maxPrice,
      inStock,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {};
    
    // 构建过滤条件
    if (primaryCategory) filters.primaryCategory = primaryCategory;
    if (secondaryCategory) filters.secondaryCategory = secondaryCategory;
    if (manufacturer) filters.manufacturer = manufacturer;
    if (qualityLevel) filters.qualityLevel = qualityLevel;
    if (lifecycle) filters.lifecycle = lifecycle;
    if (minPrice || maxPrice) {
      filters.priceRange = {};
      if (minPrice) filters.priceRange.min = parseFloat(minPrice);
      if (maxPrice) filters.priceRange.max = parseFloat(maxPrice);
    }
    if (inStock === 'true') filters.inStock = true;

    let query;
    
    if (search) {
      // 使用搜索方法
      const components = await Component.searchComponents(search, filters);
      const total = components.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedComponents = components.slice(startIndex, endIndex);
      
      return res.json({
        success: true,
        data: {
          components: paginatedComponents,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            hasNext: endIndex < total,
            hasPrev: page > 1
          }
        }
      });
    } else {
      // 普通查询
      const matchConditions = { status: 'active' };
      Object.assign(matchConditions, filters);
      
      query = Component.find(matchConditions);
    }

    // 排序
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    query = query.sort(sortOptions);

    // 分页
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(parseInt(limit));

    const [components, total] = await Promise.all([
      query.exec(),
      Component.countDocuments({ status: 'active', ...filters })
    ]);

    res.json({
      success: true,
      data: {
        components,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCount: total,
          hasNext: skip + components.length < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取元器件列表失败',
      details: error.message
    });
  }
};

// 根据ID获取单个元器件
exports.getComponentById = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!component) {
      return res.status(404).json({
        success: false,
        error: '元器件不存在'
      });
    }

    res.json({
      success: true,
      data: component
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取元器件详情失败',
      details: error.message
    });
  }
};

// 根据型号获取元器件
exports.getComponentByPartNumber = async (req, res) => {
  try {
    const component = await Component.findOne({
      partNumber: req.params.partNumber,
      status: 'active'
    });
    
    if (!component) {
      return res.status(404).json({
        success: false,
        error: '元器件不存在'
      });
    }

    res.json({
      success: true,
      data: component
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取元器件失败',
      details: error.message
    });
  }
};

// 创建新元器件
exports.createComponent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '输入数据验证失败',
        details: errors.array()
      });
    }

    const componentData = {
      ...req.body,
      createdBy: req.user.id
    };

    const component = new Component(componentData);
    await component.save();

    res.status(201).json({
      success: true,
      data: component,
      message: '元器件创建成功'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: '元器件型号已存在'
      });
    }
    
    res.status(500).json({
      success: false,
      error: '创建元器件失败',
      details: error.message
    });
  }
};

// 更新元器件
exports.updateComponent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '输入数据验证失败',
        details: errors.array()
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const component = await Component.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!component) {
      return res.status(404).json({
        success: false,
        error: '元器件不存在'
      });
    }

    res.json({
      success: true,
      data: component,
      message: '元器件更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '更新元器件失败',
      details: error.message
    });
  }
};

// 删除元器件（软删除）
exports.deleteComponent = async (req, res) => {
  try {
    const component = await Component.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'inactive',
        updatedBy: req.user.id
      },
      { new: true }
    );

    if (!component) {
      return res.status(404).json({
        success: false,
        error: '元器件不存在'
      });
    }

    res.json({
      success: true,
      message: '元器件删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '删除元器件失败',
      details: error.message
    });
  }
};

// 批量导入元器件
exports.bulkImportComponents = async (req, res) => {
  try {
    const { components } = req.body;
    
    if (!Array.isArray(components) || components.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的元器件数据数组'
      });
    }

    const results = {
      success: [],
      failed: [],
      total: components.length
    };

    for (let i = 0; i < components.length; i++) {
      try {
        const componentData = {
          ...components[i],
          createdBy: req.user.id
        };
        
        const component = new Component(componentData);
        await component.save();
        
        results.success.push({
          index: i,
          partNumber: component.partNumber,
          id: component._id
        });
      } catch (error) {
        results.failed.push({
          index: i,
          partNumber: components[i].partNumber || '未知',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: results,
      message: `批量导入完成，成功: ${results.success.length}, 失败: ${results.failed.length}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '批量导入失败',
      details: error.message
    });
  }
};

// 更新库存
exports.updateStock = async (req, res) => {
  try {
    const { quantity, operation = 'set' } = req.body;
    
    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({
        success: false,
        error: '元器件不存在'
      });
    }

    await component.updateStock(quantity, operation);

    res.json({
      success: true,
      data: component,
      message: '库存更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '更新库存失败',
      details: error.message
    });
  }
};

// 获取分类统计
exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Component.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: {
            primary: '$primaryCategory',
            secondary: '$secondaryCategory'
          },
          count: { $sum: 1 },
          totalValue: { $sum: '$referencePrice' },
          avgPrice: { $avg: '$referencePrice' },
          totalStock: { $sum: '$inventory.totalStock' },
          lowStockCount: {
            $sum: {
              $cond: [
                { $lte: ['$inventory.availableStock', '$inventory.minStockLevel'] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id.primary',
          totalCount: { $sum: '$count' },
          totalValue: { $sum: '$totalValue' },
          avgPrice: { $avg: '$avgPrice' },
          totalStock: { $sum: '$totalStock' },
          lowStockCount: { $sum: '$lowStockCount' },
          subcategories: {
            $push: {
              name: '$_id.secondary',
              count: '$count',
              totalValue: '$totalValue',
              avgPrice: '$avgPrice',
              totalStock: '$totalStock',
              lowStockCount: '$lowStockCount'
            }
          }
        }
      },
      { $sort: { totalCount: -1 } }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取分类统计失败',
      details: error.message
    });
  }
};

// 获取低库存元器件
exports.getLowStockComponents = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const components = await Component.find({
      status: 'active',
      $expr: { $lte: ['$inventory.availableStock', '$inventory.minStockLevel'] }
    })
    .sort({ 'inventory.availableStock': 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

    const total = await Component.countDocuments({
      status: 'active',
      $expr: { $lte: ['$inventory.availableStock', '$inventory.minStockLevel'] }
    });

    res.json({
      success: true,
      data: {
        components,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCount: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取低库存元器件失败',
      details: error.message
    });
  }
};
