import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { doeeetSearchService, DoeeetSearchQuery } from '../services/DoeeetSearchService';
import { logger } from '../utils/logger';
import { DoeeetComponent } from '../models/DoeeetComponent';
import { ok } from '../utils/response';
import { formatComponentForApi, formatListForApi } from '../utils/response';

/**
 * 搜索组件 - 复合搜索
 */
export const searchComponents = async (req: Request, res: Response): Promise<any> => {
  try {
    const query: DoeeetSearchQuery = {
      keyword: req.query.keyword as string,
      partNumber: req.query.partNumber as string,
      manufacturer: req.query.manufacturer as string,
      partType: req.query.partType as string,
      hasStock: (req as any).validatedHasStock,
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 20, 100),
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
    };

    // 处理分类路径 (familyPath) - 可以是JSON数组或字符串
    if (req.query.familyPath && typeof req.query.familyPath === 'string') {
      try {
        // 优先尝试解析为JSON数组（支持前端传入的 '["Film","Resistors"]' 形式）
        const raw = req.query.familyPath;
        const decoded = decodeURIComponent(raw);
        const maybeJson = decoded.trim();
        let parsed: any;
        if ((maybeJson.startsWith('[') && maybeJson.endsWith(']')) || (maybeJson.startsWith('"') && maybeJson.endsWith('"'))) {
          parsed = JSON.parse(maybeJson);
        }
        if (Array.isArray(parsed)) {
          query.familyPath = parsed;
        } else if (typeof parsed === 'string') {
          query.familyPath = parsed;
        } else {
          // 非JSON字符串，按纯文本分类名处理
          query.familyPath = decoded;
        }
        logger.info(`接收到前端 familyPath: type=${Array.isArray(query.familyPath) ? 'array' : typeof query.familyPath}, value=${JSON.stringify(query.familyPath)}`);
      } catch (error) {
        // 如果不是JSON，就作为普通字符串处理
        query.familyPath = decodeURIComponent(req.query.familyPath);
        logger.warn(`familyPath 解析失败，使用原始字符串: ${query.familyPath}`);
      }
    }

    // 处理淘汰状态筛选
    if (req.query.obsolescenceType) {
      const types = typeof req.query.obsolescenceType === 'string' 
        ? [req.query.obsolescenceType]
        : req.query.obsolescenceType as string[];
      query.obsolescenceType = types;
    }

    // 处理参数过滤
    if (req.query.parameters && typeof req.query.parameters === 'string') {
      try {
        query.parameters = JSON.parse(req.query.parameters);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PARAMETERS', message: '参数格式错误，请使用JSON格式' }
        });
      }
    }

    logger.info(`最终查询参数: ${JSON.stringify(query, null, 2)}`);

    const result = await doeeetSearchService.advancedSearch(query);

    // 统一输出字段（has_stock -> "Yes"/"No"）
    const formatted = {
      ...result,
      components: formatListForApi(result.components)
    };

    return ok(res, formatted);
  } catch (error) {
    logger.error('搜索组件失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SEARCH_FAILED', message: '搜索组件失败' }
    });
  }
};

/**
 * 获取组件详情（包含参数）
 */
export const getComponentById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: '组件ID不能为空' }
      });
    }

    const component = await doeeetSearchService.getComponentWithParameters(id);
    
    if (!component) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '组件不存在' }
      });
    }

    return ok(res, {
      ...formatComponentForApi(component),
      parameters: component.parameters
    });
  } catch (error) {
    logger.error('获取组件详情失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DETAIL_FAILED', message: '获取组件详情失败' }
    });
  }
};

/**
 * 获取分类树（用于前端分类筛选）
 */
export const getCategoryTree = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = await doeeetSearchService.buildCategoryTree();
    
    return ok(res, result);
  } catch (error) {
    logger.error('获取分类树失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'CATEGORY_TREE_FAILED', message: '获取分类树失败' }
    });
  }
};

/**
 * 获取指定制造商的分类树（用于前端分类筛选）
 */
export const getCategoryTreeByManufacturer = async (req: Request, res: Response): Promise<any> => {
  try {
    const { manufacturerName } = req.params;
    
    if (!manufacturerName || manufacturerName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_MANUFACTURER', message: '制造商名称不能为空' }
      });
    }
    
    const result = await doeeetSearchService.buildCategoryTreeByManufacturer(manufacturerName.trim());
    
    return ok(res, result);
  } catch (error) {
    logger.error('获取制造商分类树失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'MANUFACTURER_CATEGORY_TREE_FAILED', message: '获取制造商分类树失败' }
    });
  }
};

/**
 * 按分类获取组件
 */
export const getComponentsByCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const hasStock = (req as any).validatedHasStock;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CATEGORY', message: '分类不能为空' }
      });
    }

    const result = await doeeetSearchService.searchByCategory(
      decodeURIComponent(category),
      { page, limit, hasStock }
    );

    return ok(res, {
      ...result,
      components: formatListForApi(result.components)
    });
  } catch (error) {
    logger.error('获取分类组件失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'CATEGORY_FAILED', message: '获取分类组件失败' }
    });
  }
};

/**
 * 获取制造商列表
 */
export const getManufacturers = async (req: Request, res: Response): Promise<any> => {
  try {
    const manufacturers = await doeeetSearchService.getManufacturers();
    
    return ok(res, manufacturers);
  } catch (error) {
    logger.error('获取制造商列表失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'MANUFACTURERS_FAILED', message: '获取制造商列表失败' }
    });
  }
};

/**
 * 获取分类列表
 */
export const getFamilyPaths = async (req: Request, res: Response): Promise<any> => {
  try {
    const familyPaths = await doeeetSearchService.getFamilyPaths();
    
    return ok(res, familyPaths);
  } catch (error) {
    logger.error('获取分类列表失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'FAMILIES_FAILED', message: '获取分类列表失败' }
    });
  }
};

/**
 * 获取分类元数据
 */
export const getCategoryMeta = async (req: Request, res: Response): Promise<any> => {
  try {
    const { familyPath } = req.params;
    
    if (!familyPath) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_FAMILY_PATH', message: '分类路径不能为空' }
      });
    }

    const pathArray = JSON.parse(decodeURIComponent(familyPath));
    const meta = await doeeetSearchService.getCategoryMeta(pathArray);

    return ok(res, meta);
  } catch (error) {
    logger.error('获取分类元数据失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'CATEGORY_META_FAILED', message: '获取分类元数据失败' }
    });
  }
};

/**
 * 获取参数定义
 */
export const getParameterDefinitions = async (req: Request, res: Response): Promise<any> => {
  try {
    const keys = req.query.keys as string;
    const keyArray = keys ? keys.split(',') : undefined;
    
    const definitions = await doeeetSearchService.getParameterDefinitions(keyArray);

    return ok(res, definitions);
  } catch (error) {
    logger.error('获取参数定义失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'PARAM_DEFS_FAILED', message: '获取参数定义失败' }
    });
  }
};

/**
 * 获取统计信息
 */
export const getStatistics = async (req: Request, res: Response): Promise<any> => {
  try {
    const stats = await doeeetSearchService.getStatistics();

    return ok(res, stats);
  } catch (error) {
    logger.error('获取统计信息失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'STATS_FAILED', message: '获取统计信息失败' }
    });
  }
};

/**
 * 获取热门过滤条件
 */
export const getPopularFilters = async (req: Request, res: Response): Promise<any> => {
  try {
    const filters = {
      manufacturers: await doeeetSearchService.getManufacturers(),
      categories: await doeeetSearchService.getFamilyPaths()
    };

    return ok(res, filters);
  } catch (error) {
    logger.error('获取热门过滤条件失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'POPULAR_FILTERS_FAILED', message: '获取热门过滤条件失败' }
    });
  }
};

/**
 * 获取相似组件
 */
export const getSimilarComponents = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: '组件ID不能为空' }
      });
    }

    // 获取组件详情
    const component = await doeeetSearchService.getComponentWithParameters(id);
    if (!component) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '组件不存在' }
      });
    }

    // 基于同一分类搜索相似组件
    const similarResults = await doeeetSearchService.searchByCategory(
      component.family_path.join('/'),
      { page: 1, limit: limit + 1 }
    );

    // 过滤掉当前组件本身
    const similarComponents = similarResults.components.filter(
      (c: any) => c.component_id !== id
    ).slice(0, limit);

    return ok(res, formatListForApi(similarComponents));
  } catch (error) {
    logger.error('获取相似组件失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SIMILAR_FAILED', message: '获取相似组件失败' }
    });
  }
};

/**
 * 对比多个组件
 */
export const compareComponents = async (req: Request, res: Response): Promise<any> => {
  try {
    const componentIds = req.body.componentIds as string[];
    
    if (!componentIds || componentIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_COMPONENT_IDS', message: '至少需要选择2个组件进行对比' }
      });
    }
    
    if (componentIds.length > 5) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_COMPONENT_IDS', message: '最多只能对比5个组件' }
      });
    }

    // 获取所有组件的详细信息（含参数）
    const componentsPromises = componentIds.map(id => 
      doeeetSearchService.getComponentWithParameters(id)
    );
    
    const components = await Promise.all(componentsPromises);
    
    // 过滤掉不存在的组件
    const validComponents = components.filter(c => c !== null) as any[];
    
    if (validComponents.length < 2) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_ENOUGH_VALID_COMPONENTS', message: '找不到足够的有效组件进行对比' }
      });
    }
    
    // 收集所有参数的并集
    const allParameterKeys = new Set<string>();
    validComponents.forEach(comp => {
      if (comp.parameters) {
        comp.parameters.forEach((param: any) => {
          allParameterKeys.add(param.key);
        });
      }
    });
    
    // 构建对比矩阵
    const comparisonMatrix = {
      components: validComponents.map(comp => ({
        component_id: comp.component_id,
        part_number: comp.part_number,
        manufacturer_name: comp.manufacturer_name,
        part_type: comp.part_type,
        quality_name: comp.quality_name,
        obsolescence_type: comp.obsolescence_type,
        has_stock: formatComponentForApi(comp).has_stock,
        family_path: comp.family_path
      })),
      parameters: Array.from(allParameterKeys).map(key => {
        const parameterRow: any = { key };
        
        validComponents.forEach((comp, index) => {
          const param = comp.parameters?.find((p: any) => p.key === key);
          parameterRow[`component_${index}`] = {
            name: param?.name || 'N/A',
            value: param?.value || '-',
            numericValue: param?.numericValue
          };
        });
        
        return parameterRow;
      })
    };

    return ok(res, comparisonMatrix);
  } catch (error) {
    logger.error('对比组件失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'COMPARE_FAILED', message: '对比组件失败' }
    });
  }
};

/**
 * 全文搜索
 */
export const fullTextSearch = async (req: Request, res: Response): Promise<any> => {
  try {
    const { q } = req.query;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const hasStock = (req as any).validatedHasStock;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'QUERY_REQUIRED', message: '搜索关键词不能为空' }
      });
    }

    const results = await doeeetSearchService.fullTextSearch(q, { limit, hasStock });

    return ok(res, {
      query: q,
      results: formatListForApi(results),
      total: results.length
    });
  } catch (error) {
    logger.error('全文搜索失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'FULLTEXT_FAILED', message: '全文搜索失败' }
    });
  }
};

/**
 * 获取搜索建议
 */
export const getSearchSuggestions = async (req: Request, res: Response): Promise<any> => {
  try {
    const { q } = req.query;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 20);
    
    if (!q || typeof q !== 'string' || q.length < 2) {
      return ok(res, {
        components: [],
        manufacturers: [],
        categories: []
      });
    }

    const suggestions = await doeeetSearchService.getSearchSuggestions(q, limit);

    return ok(res, suggestions);
  } catch (error) {
    logger.error('获取搜索建议失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SUGGESTIONS_FAILED', message: '获取搜索建议失败' }
    });
  }
};

/**
 * 批量获取组件
 */
export const getComponentsByIds = async (req: Request, res: Response): Promise<any> => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_IDS', message: 'IDs数组不能为空' }
      });
    }

    if (ids.length > 100) {
      return res.status(400).json({
        success: false,
        error: { code: 'TOO_MANY_IDS', message: '一次最多查询100个组件' }
      });
    }

    // 批量获取组件详情
    const componentsPromises = ids.map(id => 
      doeeetSearchService.getComponentWithParameters(id)
    );
    const components = await Promise.all(componentsPromises);
    
    // 过滤掉不存在的组件
    const validComponents = components.filter(c => c !== null) as any[];

    return ok(res, validComponents.map(formatComponentForApi));
  } catch (error) {
    logger.error('批量获取组件失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'BATCH_FAILED', message: '批量获取组件失败' }
    });
  }
};

/**
 * 分类诊断：对给定 familyPath 运行多种匹配统计，返回各自命中数量
 * 用法：GET /api/components/debug/category-diagnostics?familyPath=["Film","Resistors"]
 * 或：GET /api/components/debug/category-diagnostics?familyPath=Resistors
 */
export const debugCategoryDiagnostics = async (req: Request, res: Response): Promise<any> => {
  try {
    const raw = req.query.familyPath as string;
    if (!raw) {
      return res.status(400).json({
        success: false,
        error: { code: 'FAMILY_PATH_REQUIRED', message: '缺少 familyPath 参数（可为字符串或JSON数组）' }
      });
    }

    // 解析 familyPath
    let familyPath: string | string[] = decodeURIComponent(raw);
    try {
      const trimmed = (familyPath as string).trim();
      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) familyPath = parsed;
        else if (typeof parsed === 'string') familyPath = parsed;
      }
    } catch {
      // ignore, keep as decoded string
    }

    const diagnostics: any = { input: { type: Array.isArray(familyPath) ? 'array' : typeof familyPath, value: familyPath } };

    // 探测实际字段名与存储形态：family_path 优先；否则从候选集中自动识别
    const connection = mongoose.connection;
    const totalCount = await DoeeetComponent.countDocuments({});
    const anyDoc = await DoeeetComponent.findOne({}, {}).lean();

    const candidateFields = [
      'family_path',
      'comp-familypath',
      'comp_familypath',
      'compFamilyPath',
      'category_path',
      'Category Path',
      'CategoryPath'
    ];

    const candidatesStats = await Promise.all(candidateFields.map(async (field) => {
      const exists = await DoeeetComponent.countDocuments({ [field]: { $exists: true } } as any);
      let example: any = undefined;
      let storedType: string | undefined = undefined;
      if (exists > 0) {
        const sample = await DoeeetComponent.findOne({ [field]: { $exists: true } } as any, { [field]: 1 } as any).lean();
        if (sample) {
          example = (sample as any)[field];
          storedType = Array.isArray(example) ? 'array' : typeof example;
        }
      }
      return { field, exists, storedType: storedType ?? 'unknown', example };
    }));

    // 选择字段：family_path 若存在优先；否则选择存在数量最多的候选
    let categoryField = 'family_path';
    const familyPathStat = candidatesStats.find(s => s.field === 'family_path');
    if (!familyPathStat || familyPathStat.exists === 0) {
      const best = candidatesStats
        .filter(s => s.exists > 0)
        .sort((a, b) => b.exists - a.exists)[0];
      if (best) categoryField = best.field as any;
    }

    const chosen = candidatesStats.find(s => s.field === categoryField);
    diagnostics.connection = {
      readyState: connection.readyState,
      dbName: connection.db?.databaseName,
      host: connection.host,
      port: connection.port,
      user: connection.user,
      hasPassword: Boolean(connection.pass),
      uriFromEnv: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/business_plat'
    };

    diagnostics.storage = {
      totalCount,
      topLevelKeys: anyDoc ? Object.keys(anyDoc) : [],
      candidates: candidatesStats,
      field: categoryField,
      storedType: chosen?.storedType ?? 'unknown',
      example: chosen?.example
    };

    if (typeof familyPath === 'string') {
      const regex = new RegExp(familyPath, 'i');
      const [cIn, cRegex, cExact] = await Promise.all([
        DoeeetComponent.countDocuments({ [categoryField]: { $in: [familyPath] } } as any),
        DoeeetComponent.countDocuments({ [categoryField]: { $regex: regex } } as any),
        DoeeetComponent.countDocuments({ [categoryField]: familyPath } as any)
      ]);
      // 提供样例，帮助肉眼确认命中
      const [sampleElements, samplePaths] = await Promise.all([
        // 对数组字段，distinct 返回元素（不是整条路径），但依然有参考意义
        DoeeetComponent.distinct(categoryField as any, { [categoryField]: { $regex: regex } } as any),
        DoeeetComponent.find(
          { [categoryField]: { $regex: regex } } as any,
          { [categoryField]: 1 } as any
        ).limit(10).lean()
      ]);
      diagnostics.string = {
        in: cIn,
        regex: cRegex,
        exact: cExact,
        distinctElementsPreview: sampleElements?.slice(0, 20),
        sampleDocs: samplePaths?.map(d => (d as any)[categoryField])
      };
    } else if (Array.isArray(familyPath) && familyPath.length > 0) {
      const reversed = [...familyPath].reverse();
      const top = familyPath[0];
      const regexTop = new RegExp(top, 'i');
      const joinedCandidates = [
        familyPath.join(' / '),
        familyPath.join('/'),
        familyPath.join(' > '),
        familyPath.join('>')
      ];
      const [
        cIn,
        cAll,
        cRegexAnd,
        cExact,
        cExactReversed,
        cRegexTop,
        cJoinedIn
      ] = await Promise.all([
        DoeeetComponent.countDocuments({ [categoryField]: { $in: familyPath } } as any),
        DoeeetComponent.countDocuments({ [categoryField]: { $all: familyPath } } as any),
        DoeeetComponent.countDocuments({ $and: familyPath.map(level => ({ [categoryField]: { $regex: new RegExp(level, 'i') } })) } as any),
        DoeeetComponent.countDocuments({ [categoryField]: familyPath } as any),
        DoeeetComponent.countDocuments({ [categoryField]: reversed } as any),
        DoeeetComponent.countDocuments({ [categoryField]: { $regex: regexTop } } as any),
        DoeeetComponent.countDocuments({ [categoryField]: { $in: joinedCandidates } } as any)
      ]);
      // 补充样例：包含任意一个/包含全部/拼接匹配 的文档
      const [sampleAny, sampleAll, sampleJoined] = await Promise.all([
        DoeeetComponent.find(
          { $or: familyPath.map(level => ({ [categoryField]: { $regex: new RegExp(level, 'i') } })) } as any,
          { [categoryField]: 1 } as any
        ).limit(10).lean(),
        DoeeetComponent.find(
          { $and: familyPath.map(level => ({ [categoryField]: { $regex: new RegExp(level, 'i') } })) } as any,
          { [categoryField]: 1 } as any
        ).limit(10).lean(),
        DoeeetComponent.find(
          { [categoryField]: { $in: joinedCandidates } } as any,
          { [categoryField]: 1 } as any
        ).limit(10).lean()
      ]);
      diagnostics.array = {
        in: cIn,
        all: cAll,
        and_regex: cRegexAnd,
        exact: cExact,
        exact_reversed: cExactReversed,
        regex_top: cRegexTop,
        joined_in: cJoinedIn,
        samples: {
          contains_any: sampleAny?.map(d => (d as any)[categoryField]),
          contains_all: sampleAll?.map(d => (d as any)[categoryField]),
          joined_present: sampleJoined?.map(d => (d as any)[categoryField]),
          joined_candidates: joinedCandidates
        }
      };
    }

    return ok(res, diagnostics);
  } catch (error) {
    logger.error('分类诊断失败:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DIAG_FAILED', message: '分类诊断失败' }
    });
  }
};
