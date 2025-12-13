const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

/**
 * 获取产品列表（分页）
 * GET /api/products?page=1&limit=20&search=keyword&category=path
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      manufacturer = '',
      hasStock = ''
    } = req.query;

    const offset = (page - 1) * limit;
    const searchTerm = `%${search}%`;

    // 构建WHERE条件
    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push(`(
        p.comp_partnumber LIKE ? OR 
        p.comp_manufacturer_name LIKE ? OR
        p.comp_parttype LIKE ?
      )`);
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      whereConditions.push('p.comp_familypath LIKE ?');
      queryParams.push(`%${category}%`);
    }

    if (manufacturer) {
      whereConditions.push('p.comp_manufacturer_name LIKE ?');
      queryParams.push(`%${manufacturer}%`);
    }

    if (hasStock !== '') {
      whereConditions.push('p.has_stock = ?');
      queryParams.push(hasStock === 'true' ? 1 : 0);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products p 
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, queryParams);
    const total = countResult[0].total;

    // 查询数据
    const dataQuery = `
      SELECT 
        p.id,
        p.comp_familypath,
        p.comp_partnumber,
        p.comp_parttype,
        p.comp_manufacturer_name,
        p.comp_obsolescence_type_value,
        p.has_stock,
        p.comp_quality_name,
        p.comp_qualified,
        p.created_at
      FROM products p
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(parseInt(limit), parseInt(offset));
    const products = await executeQuery(dataQuery, queryParams);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取产品列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取产品列表失败',
      error: error.message
    });
  }
});

/**
 * 获取产品详情（包含参数）
 * GET /api/products/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 获取产品基本信息
    const productQuery = `
      SELECT * FROM products WHERE id = ?
    `;
    const products = await executeQuery(productQuery, [id]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      });
    }

    const product = products[0];

    // 获取产品参数
    const parametersQuery = `
      SELECT 
        pp.parameter_value,
        pk.name as parameter_name,
        pk.short_name,
        pk.category,
        pk.example
      FROM product_parameters pp
      JOIN parameter_keys pk ON pp.parameter_key = pk.key_id
      WHERE pp.product_id = ?
      ORDER BY pk.category, pk.name
    `;
    const parameters = await executeQuery(parametersQuery, [id]);

    // 按分类组织参数
    const parametersByCategory = {};
    parameters.forEach(param => {
      if (!parametersByCategory[param.category]) {
        parametersByCategory[param.category] = [];
      }
      parametersByCategory[param.category].push({
        name: param.parameter_name,
        shortName: param.short_name,
        value: param.parameter_value,
        example: param.example
      });
    });

    res.json({
      success: true,
      data: {
        product,
        parameters: parametersByCategory
      }
    });

  } catch (error) {
    console.error('获取产品详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取产品详情失败',
      error: error.message
    });
  }
});

/**
 * 获取产品分类列表
 * GET /api/products/categories
 */
router.get('/meta/categories', async (req, res) => {
  try {
    const query = `
      SELECT 
        family_id,
        family_path,
        family_path_str,
        COUNT(p.id) as product_count
      FROM product_families pf
      LEFT JOIN products p ON p.comp_familypath LIKE CONCAT('%', pf.family_path_str, '%')
      GROUP BY pf.family_id, pf.family_path, pf.family_path_str
      ORDER BY pf.family_path_str
    `;

    const categories = await executeQuery(query);

    // 解析JSON字段
    const categoriesWithParsedPath = categories.map(cat => ({
      ...cat,
      family_path: JSON.parse(cat.family_path),
      product_count: parseInt(cat.product_count)
    }));

    res.json({
      success: true,
      data: categoriesWithParsedPath
    });

  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败',
      error: error.message
    });
  }
});

/**
 * 获取制造商列表
 * GET /api/products/meta/manufacturers
 */
router.get('/meta/manufacturers', async (req, res) => {
  try {
    const query = `
      SELECT 
        comp_manufacturer_name as name,
        COUNT(*) as product_count
      FROM products 
      WHERE comp_manufacturer_name IS NOT NULL 
        AND comp_manufacturer_name != ''
      GROUP BY comp_manufacturer_name
      ORDER BY product_count DESC, comp_manufacturer_name
      LIMIT 100
    `;

    const manufacturers = await executeQuery(query);

    res.json({
      success: true,
      data: manufacturers
    });

  } catch (error) {
    console.error('获取制造商列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取制造商列表失败',
      error: error.message
    });
  }
});

/**
 * 高级搜索 - 根据参数筛选产品
 * POST /api/products/search
 */
router.post('/search', async (req, res) => {
  try {
    const {
      filters = {},
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.body;

    const offset = (page - 1) * limit;

    // 构建复杂查询
    let joins = [];
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 0;

    // 基础产品筛选
    if (filters.search) {
      whereConditions.push(`(
        p.comp_partnumber LIKE ? OR 
        p.comp_manufacturer_name LIKE ? OR
        p.comp_parttype LIKE ?
      )`);
      const searchTerm = `%${filters.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.category) {
      whereConditions.push('p.comp_familypath LIKE ?');
      queryParams.push(`%${filters.category}%`);
    }

    if (filters.manufacturer) {
      whereConditions.push('p.comp_manufacturer_name = ?');
      queryParams.push(filters.manufacturer);
    }

    if (filters.hasStock !== undefined) {
      whereConditions.push('p.has_stock = ?');
      queryParams.push(filters.hasStock ? 1 : 0);
    }

    // 参数筛选
    if (filters.parameters && Object.keys(filters.parameters).length > 0) {
      Object.entries(filters.parameters).forEach(([paramKey, paramValue]) => {
        paramIndex++;
        joins.push(`
          JOIN product_parameters pp${paramIndex} ON p.id = pp${paramIndex}.product_id 
            AND pp${paramIndex}.parameter_key = ?
        `);
        queryParams.push(paramKey);

        if (paramValue.type === 'exact') {
          whereConditions.push(`pp${paramIndex}.parameter_value = ?`);
          queryParams.push(paramValue.value);
        } else if (paramValue.type === 'range') {
          // 数值范围筛选（需要处理单位）
          whereConditions.push(`CAST(REGEXP_REPLACE(pp${paramIndex}.parameter_value, '[^0-9.]', '') AS DECIMAL(10,2)) BETWEEN ? AND ?`);
          queryParams.push(paramValue.min, paramValue.max);
        } else if (paramValue.type === 'contains') {
          whereConditions.push(`pp${paramIndex}.parameter_value LIKE ?`);
          queryParams.push(`%${paramValue.value}%`);
        }
      });
    }

    const joinClause = joins.join(' ');
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 查询总数
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total 
      FROM products p 
      ${joinClause}
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, queryParams.slice());
    const total = countResult[0].total;

    // 查询数据
    const validSortColumns = ['created_at', 'comp_partnumber', 'comp_manufacturer_name'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const dataQuery = `
      SELECT DISTINCT
        p.id,
        p.comp_familypath,
        p.comp_partnumber,
        p.comp_parttype,
        p.comp_manufacturer_name,
        p.comp_obsolescence_type_value,
        p.has_stock,
        p.comp_quality_name,
        p.comp_qualified,
        p.created_at
      FROM products p
      ${joinClause}
      ${whereClause}
      ORDER BY p.${sortColumn} ${sortDirection}
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(parseInt(limit), parseInt(offset));
    const products = await executeQuery(dataQuery, queryParams);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('高级搜索失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索失败',
      error: error.message
    });
  }
});

/**
 * 获取统计信息
 * GET /api/products/stats
 */
router.get('/meta/stats', async (req, res) => {
  try {
    // 获取各种统计信息
    const queries = [
      'SELECT COUNT(*) as total_products FROM products',
      'SELECT COUNT(*) as total_parameters FROM product_parameters',
      'SELECT COUNT(*) as total_manufacturers FROM (SELECT DISTINCT comp_manufacturer_name FROM products WHERE comp_manufacturer_name IS NOT NULL AND comp_manufacturer_name != "") as m',
      'SELECT COUNT(*) as products_with_stock FROM products WHERE has_stock = 1',
      'SELECT COUNT(*) as total_categories FROM product_families'
    ];

    const results = await Promise.all(
      queries.map(query => executeQuery(query))
    );

    const stats = {
      totalProducts: results[0][0].total_products,
      totalParameters: results[1][0].total_parameters,
      totalManufacturers: results[2][0].total_manufacturers,
      productsWithStock: results[3][0].products_with_stock,
      totalCategories: results[4][0].total_categories
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
      error: error.message
    });
  }
});

module.exports = router;
