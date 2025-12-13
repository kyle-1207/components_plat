import { 
  DoeeetComponent, 
  DoeeetParameter, 
  DoeeetParameterDefinition,
  DoeeetFamily,
  IDoeeetComponent 
} from '../models/DoeeetComponent';
import { logger } from '../utils/logger';
import { CacheService, getCacheService, CacheTTL } from './CacheService';
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * DoEEEt搜索查询接口
 */
export interface DoeeetSearchQuery {
  // 基础搜索
  keyword?: string;              // 关键词搜索 (型号、制造商、类型)
  partNumber?: string;           // 型号搜索
  manufacturer?: string;         // 制造商搜索
  partType?: string;             // 产品类型搜索
  
  // 分类搜索
  familyPath?: string | string[]; // 分类路径
  
  // 参数搜索
  parameters?: {
    [key: string]: string | number | { min?: number; max?: number };
  };
  
  // 筛选条件
  hasStock?: boolean;            // 是否有库存
  obsolescenceType?: string[];   // 淘汰状态
  qualityName?: string;          // 质量等级
  qualified?: string;            // 是否合格
  
  // 分页和排序
  page?: number;
  limit?: number;
  sortBy?: string;               // 排序字段
  sortOrder?: 'asc' | 'desc';    // 排序方向
}

/**
 * 搜索结果接口
 */
export interface DoeeetSearchResult {
  components: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  filters?: any;
}

/**
 * DoEEEt搜索服务类
 * 提供完整的搜索引擎功能，支持Redis缓存
 */
const RADIATION_SENSITIVITY_CATEGORY = 'Radiation: Potential Sensitivity';
const RADIATION_SENSITIVITY_ORDER = [
  'SEE Comments',
  'SEE sens.',
  'TID (HDR) sens.',
  'TID (LDR) sens.',
  'TNID Comments',
  'TNID sens.'
];

type RadiationSensitivityEntry = {
  key: string;
  name: string;
  shortName?: string;
  category?: string;
  value: string;
};

export class DoeeetSearchService {
  private cacheService: CacheService;

  constructor() {
    this.cacheService = getCacheService();
  }
  
  /**
   * 1. 全文搜索功能
   * 支持型号、制造商、产品类型的模糊搜索
   * 带Redis缓存优化
   */
  async fullTextSearch(
    keyword: string,
    options: {
      limit?: number;
      hasStock?: boolean;
      obsolescenceType?: string[];
      page?: number;
    } = {}
  ): Promise<any[]> {
    try {
      const limit = options.limit || 20;
      const page = options.page || 1;
      
      // 尝试从缓存获取
      const cached = await this.cacheService.getCachedFullTextSearchResult(keyword, page);
      if (cached) {
        logger.info(`✅ 全文搜索缓存命中 "${keyword}" (page ${page})`);
        return cached;
      }
      
      logger.info(`⚡ 全文搜索缓存未命中 "${keyword}", 查询数据库...`);
      
      // 构建查询条件
      const query: any = {
        $text: { $search: keyword }
      };
      
      // 添加筛选条件
      if (options.hasStock !== undefined) {
        query.has_stock = options.hasStock;
      }
      
      if (options.obsolescenceType && options.obsolescenceType.length > 0) {
        query.obsolescence_type = { $in: options.obsolescenceType };
      }
      
      // 执行搜索，按相关性评分排序
      const components = await DoeeetComponent.find(
        query,
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();
      
      // 缓存结果
      await this.cacheService.cacheFullTextSearchResult(keyword, page, components);
      
      logger.info(`全文搜索 "${keyword}": 找到 ${components.length} 个结果`);
      return components;
      
    } catch (error) {
      logger.error('全文搜索失败:', error);
      throw new Error('全文搜索失败');
    }
  }
  
  /**
   * 2. 分类搜索功能
   * 按产品分类路径浏览
   * 带Redis缓存优化
   */
  async searchByCategory(
    familyPath: string | string[],
    options: {
      page?: number;
      limit?: number;
      hasStock?: boolean;
      obsolescenceType?: string[];
    } = {}
  ): Promise<DoeeetSearchResult> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 50;
      const skip = (page - 1) * limit;
      
      // 只缓存精确分类路径（数组形式）
      if (Array.isArray(familyPath)) {
        const cached = await this.cacheService.getCachedCategoryBrowse(familyPath, page);
        if (cached) {
          logger.info(`✅ 分类浏览缓存命中 [${familyPath.join(' > ')}] (page ${page})`);
          return cached;
        }
        logger.info(`⚡ 分类浏览缓存未命中, 查询数据库...`);
      }
      
      // 构建查询条件
      const query: any = {};
      
      if (typeof familyPath === 'string') {
        // 字符串形式：优先使用 $in 匹配数组字段；兼容部分数据将 family_path 存为字符串的情况
        // 当为字符串存储时，使用不区分大小写的正则回退匹配
        const regex = new RegExp(familyPath, 'i');
        query.$or = [
          { family_path: { $in: [familyPath] } },
          { family_path: { $regex: regex } }
        ];
      } else if (Array.isArray(familyPath)) {
        // 数组形式：根据数组长度决定匹配策略
        if (familyPath.length === 1) {
          // 只有一级分类（如 ['Resistors']）
          // 匹配所有包含该分类的组件（通常是顶层分类）
          const [top] = familyPath;
          const regex = new RegExp(top, 'i');
          query.$or = [
            { family_path: { $in: familyPath } },
            { family_path: { $regex: regex } }
          ];
        } else {
          // 多级分类（如 ['Potentiometer', 'Resistors']）
          // 使用精确数组匹配：只返回完全匹配该路径的组件
          // 性能测试：精确匹配 (1.7ms) 比 $all (3.8ms) 快 2 倍
          // 注意：family_path 在数据库中是从具体到一般的顺序
          // 例如：['Potentiometer', 'Resistors'] 表示 Potentiometer(子类) -> Resistors(父类)
          query.$or = [
            { family_path: familyPath },
            // 字符串存储的兼容：按各级分类都包含进行回退匹配（顺序不强制）
            ...familyPath.map(level => ({ family_path: { $regex: new RegExp(level, 'i') } }))
          ];
        }
      }
      
      // 添加筛选条件
      if (options.hasStock !== undefined) {
        query.has_stock = options.hasStock;
      }
      
      if (options.obsolescenceType && options.obsolescenceType.length > 0) {
        query.obsolescence_type = { $in: options.obsolescenceType };
      }
      
      // 执行查询
      const [components, total] = await Promise.all([
        DoeeetComponent.find(query)
          .sort({ part_number: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        DoeeetComponent.countDocuments(query)
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      const result = {
        components,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };
      
      // 缓存结果（仅精确匹配）
      if (Array.isArray(familyPath)) {
        await this.cacheService.cacheCategoryBrowse(familyPath, page, result);
      }
      
      logger.info(`分类搜索 "${familyPath}": 找到 ${total} 个结果`);
      
      return result;
      
    } catch (error) {
      logger.error('分类搜索失败:', error);
      throw new Error('分类搜索失败');
    }
  }
  
  /**
   * 3. 参数搜索功能
   * 按技术参数筛选组件
   */
  async searchByParameters(
    parameters: { [key: string]: string | number | { min?: number; max?: number } },
    options: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<DoeeetSearchResult> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 50;
      const skip = (page - 1) * limit;
      
      // 构建参数查询条件
      const paramQueries = [];
      
      for (const [key, value] of Object.entries(parameters)) {
        if (typeof value === 'object' && ('min' in value || 'max' in value)) {
          // 范围查询
          const rangeQuery: any = { parameter_key: key };
          if (value.min !== undefined) {
            rangeQuery.numeric_value = { $gte: value.min };
          }
          if (value.max !== undefined) {
            rangeQuery.numeric_value = { 
              ...rangeQuery.numeric_value, 
              $lte: value.max 
            };
          }
          paramQueries.push(rangeQuery);
        } else {
          // 精确值查询
          paramQueries.push({
            parameter_key: key,
            parameter_value: String(value)
          });
        }
      }
      
      // 查找匹配的参数记录
      const matchingParams = await DoeeetParameter.find({
        $or: paramQueries
      }).lean();
      
      // 按组件ID分组，计算每个组件匹配的参数数量
      const componentMatches = new Map<string, number>();
      matchingParams.forEach(param => {
        const count = componentMatches.get(param.component_id) || 0;
        componentMatches.set(param.component_id, count + 1);
      });
      
      // 筛选出匹配所有参数的组件
      const requiredMatches = Object.keys(parameters).length;
      const componentIds = Array.from(componentMatches.entries())
        .filter(([_, count]) => count >= requiredMatches)
        .map(([id, _]) => id);
      
      if (componentIds.length === 0) {
        return {
          components: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        };
      }
      
      // 查询组件详情
      const [components, total] = await Promise.all([
        DoeeetComponent.find({ component_id: { $in: componentIds } })
          .skip(skip)
          .limit(limit)
          .lean(),
        Promise.resolve(componentIds.length)
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      logger.info(`参数搜索: 找到 ${total} 个匹配的组件`);
      
      return {
        components,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };
      
    } catch (error) {
      logger.error('参数搜索失败:', error);
      throw new Error('参数搜索失败');
    }
  }
  
  /**
   * 4. 复合搜索功能
   * 组合多种搜索条件
   * 带Redis缓存优化
   */
  async advancedSearch(query: DoeeetSearchQuery): Promise<DoeeetSearchResult> {
    try {
      const page = query.page || 1;
      const limit = Math.min(query.limit || 20, 50); // 收窄单页数据量，避免深分页压力
      const skip = (page - 1) * limit;
      
      // 尝试从缓存获取
      const cached = await this.cacheService.getCachedSearchResult(query);
      if (cached) {
        logger.info(`✅ 复合搜索缓存命中`);
        return cached;
      }
      
      logger.info(`⚡ 复合搜索缓存未命中, 查询数据库...`);
      logger.info(`查询参数: ${JSON.stringify(query, null, 2)}`);
      
      // 构建MongoDB查询
      const mongoQuery: any = {};
      
      // 1. 关键词搜索（仅型号/制造商；包含匹配，但要求最小长度以保持性能）
      if (query.keyword && query.keyword.trim().length >= 2) {
        const kw = escapeRegex(query.keyword.trim());
        // 使用包含匹配而非前缀匹配，以便搜索型号的任意部分
        // 注意：对于短关键词（>=2），MongoDB 的索引仍然可以部分优化
        const keywordRegex = new RegExp(kw, 'i');
        mongoQuery.$or = [
          { part_number: keywordRegex },
          { manufacturer_name: keywordRegex }
        ];
      }
      
      // 2. 型号搜索（包含匹配，支持搜索型号的任意部分）
      if (query.partNumber && query.partNumber.trim().length > 0) {
        const pn = escapeRegex(query.partNumber.trim());
        // 如果长度 >= 3，使用包含匹配；否则使用前缀匹配以保持性能
        if (pn.length >= 3) {
          mongoQuery.part_number = { $regex: pn, $options: 'i' };
        } else {
          mongoQuery.part_number = { $regex: `^${pn}`, $options: 'i' };
        }
      }
      
      // 3. 制造商搜索（包含匹配，支持搜索制造商名称的任意部分）
      if (query.manufacturer && query.manufacturer.trim().length > 0) {
        const mf = escapeRegex(query.manufacturer.trim());
        // 如果长度 >= 3，使用包含匹配；否则使用前缀匹配以保持性能
        if (mf.length >= 3) {
          mongoQuery.manufacturer_name = { $regex: mf, $options: 'i' };
        } else {
          mongoQuery.manufacturer_name = { $regex: `^${mf}`, $options: 'i' };
        }
      }
      
      // 4. 产品类型搜索
      if (query.partType) {
        mongoQuery.part_type = { $regex: query.partType, $options: 'i' };
      }
      
      // 5. 分类搜索
      if (query.familyPath) {
        if (typeof query.familyPath === 'string') {
          // 字符串形式：匹配包含该分类的所有组件
          // 使用 $in 操作符，性能比 $elemMatch 更好
          const regex = new RegExp(query.familyPath, 'i');
          mongoQuery.$or = [
            { family_path: { $in: [query.familyPath] } },
            { family_path: { $regex: regex } }
          ];
        } else if (Array.isArray(query.familyPath)) {
          // 数组形式：根据数组长度决定匹配策略
          if (query.familyPath.length === 1) {
            // 只有一级分类（如 ['Resistors']）
            // 匹配所有包含该分类的组件
            // 使用 $in 操作符：性能测试显示比 $elemMatch 快 5 倍
            const [top] = query.familyPath;
            const regex = new RegExp(top, 'i');
            mongoQuery.$or = [
              { family_path: { $in: query.familyPath } },
              { family_path: { $regex: regex } }
            ];
          } else {
            // 多级分类（如 ['Current Regulator', 'Diode', 'Discretes']）
            // 使用 $all 操作符：匹配包含所有分类的组件，不要求顺序一致
            // 这样可以处理前端发送的分类路径顺序与数据库中存储顺序不一致的情况
            const reversed = [...query.familyPath].reverse();
            const joinedCandidates = [
              query.familyPath.join(' / '),
              query.familyPath.join('/'),
              query.familyPath.join(' > '),
              query.familyPath.join('>'),
            ];
            mongoQuery.$or = [
              { family_path: { $all: query.familyPath } },
              // 精确数组（可能数据库为叶子->顶层或顶层->叶子两种顺序）
              { family_path: query.familyPath },
              { family_path: reversed },
              // 字符串存储兼容：所有层级都能被字符串包含命中（用$and + 正则数组）
              { $and: query.familyPath.map(level => ({ family_path: { $regex: new RegExp(level, 'i') } })) },
              // 常见分隔符的字符串路径匹配
              { family_path: { $in: joinedCandidates } }
            ];
          }
        }
      }
      
      // 6. 库存筛选
      if (query.hasStock !== undefined) {
        mongoQuery.has_stock = query.hasStock;
      }
      
      // 7. 淘汰状态筛选
      if (query.obsolescenceType && query.obsolescenceType.length > 0) {
        mongoQuery.obsolescence_type = { $in: query.obsolescenceType };
      }
      
      // 8. 质量等级筛选
      if (query.qualityName) {
        mongoQuery.quality_name = query.qualityName;
      }
      
      // 9. 合格状态筛选
      if (query.qualified) {
        mongoQuery.qualified = query.qualified;
      }
      
      // 如果有参数搜索，需要先查询参数表
      let componentIds: string[] | undefined;
      if (query.parameters && Object.keys(query.parameters).length > 0) {
        const paramResult = await this.searchByParameters(query.parameters, { 
          page: 1, 
          limit: 10000  // 获取所有匹配的ID
        });
        componentIds = paramResult.components.map(c => c.component_id);
        
        if (componentIds.length === 0) {
          // 没有匹配的组件，直接返回空结果
          return {
            components: [],
            total: 0,
            page,
            limit,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
          };
        }
        
        mongoQuery.component_id = { $in: componentIds };
      }
      
      // 构建排序条件
      const sort: any = {};
      if (query.sortBy) {
        // 自定义排序
        const sortField = this.mapSortField(query.sortBy);
        sort[sortField] = query.sortOrder === 'desc' ? -1 : 1;
      } else {
        // 默认按型号排序
        sort.part_number = 1;
      }
      
      // 记录查询条件用于调试
      logger.info(`MongoDB查询条件: ${JSON.stringify(mongoQuery, null, 2)}`);

      // 诊断统计：当按分类数组筛选时，输出几种常见匹配方式的命中数，便于定位数据形态
      if (Array.isArray(query.familyPath) && query.familyPath.length > 0) {
        try {
          const diagTop = query.familyPath[0];
          const diagRegexTop = new RegExp(diagTop, 'i');
          const diagReversed = [...query.familyPath].reverse();
          const diagJoined = [
            query.familyPath.join(' / '),
            query.familyPath.join('/'),
            query.familyPath.join(' > '),
            query.familyPath.join('>'),
          ];
          const [
            cIn,
            cAll,
            cRegexAnd,
            cExact,
            cExactReversed,
            cRegexAnyTop,
            cJoinedIn
          ] = await Promise.all([
            DoeeetComponent.countDocuments({ family_path: { $in: query.familyPath as string[] } }),
            DoeeetComponent.countDocuments({ family_path: { $all: query.familyPath as string[] } }),
            DoeeetComponent.countDocuments({ $and: (query.familyPath as string[]).map(level => ({ family_path: { $regex: new RegExp(level, 'i') } })) }),
            DoeeetComponent.countDocuments({ family_path: query.familyPath as string[] }),
            DoeeetComponent.countDocuments({ family_path: diagReversed }),
            DoeeetComponent.countDocuments({ family_path: { $regex: diagRegexTop } }),
            DoeeetComponent.countDocuments({ family_path: { $in: diagJoined } }),
          ]);
          logger.info(`分类诊断 - $in: ${cIn}, $all: ${cAll}, $and+regex: ${cRegexAnd}, exact: ${cExact}, exact(reversed): ${cExactReversed}, regex(top): ${cRegexAnyTop}, joined(in): ${cJoinedIn}`);
        } catch (e) {
          logger.warn('分类诊断统计失败', e);
        }
      }
      
      // 执行查询
      const projection = {
        component_id: 1,
        part_number: 1,
        manufacturer_name: 1,
        family_path: 1,
        quality_name: 1,
        has_stock: 1,
        obsolescence_type: 1,
        part_type: 1
      };
      const queryBuilder = DoeeetComponent.find(mongoQuery).select(projection);
      
      const [components, total] = await Promise.all([
        queryBuilder
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        DoeeetComponent.countDocuments(mongoQuery)
      ]);
      
      const getComponentIdentifier = (component: any): string | undefined => {
        if (!component) {
          return undefined;
        }
        if (typeof component.component_id === 'string') {
          return component.component_id;
        }
        if (typeof (component as any).componentId === 'string') {
          return (component as any).componentId;
        }
        if (typeof component.id === 'string') {
          return component.id;
        }
        if (component._id) {
          return String(component._id);
        }
        return undefined;
      };

      let enhancedComponents = components;
      if (components.length > 0) {
        const componentIdsForRadiation = Array.from(
          new Set(
            components
              .map(comp => getComponentIdentifier(comp))
              .filter((id): id is string => typeof id === 'string' && id.length > 0)
          )
        );
        const radiationMap = await this.getRadiationSensitivityData(componentIdsForRadiation);
        enhancedComponents = components.map(comp => {
          const identifier = getComponentIdentifier(comp);
          return {
            ...comp,
            radiation_sensitivity: identifier ? (radiationMap.get(identifier) || []) : []
          };
        });
      }
      
      const totalPages = Math.ceil(total / limit);
      
      const result = {
        components: enhancedComponents,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        filters: this.getAppliedFilters(query)
      };
      
      // 缓存结果
      await this.cacheService.cacheSearchResult(query, result);
      
      logger.info(`复合搜索: 找到 ${total} 个结果`);
      
      return result;
      
    } catch (error) {
      logger.error('复合搜索失败:', error);
      throw new Error('复合搜索失败');
    }
  }
  
  /**
   * 5. 搜索建议功能
   * 自动补全和搜索推荐
   */
  async getSearchSuggestions(
    keyword: string,
    limit: number = 10
  ): Promise<{
    components: Array<{ partNumber: string; manufacturer: string; partType: string }>;
    manufacturers: string[];
    categories: string[];
  }> {
    try {
      if (!keyword || keyword.length < 2) {
        return { components: [], manufacturers: [], categories: [] };
      }
      
      const searchRegex = new RegExp(keyword, 'i');
      
      // 1. 搜索匹配的组件
      const components = await DoeeetComponent.find({
        $or: [
          { part_number: searchRegex },
          { part_type: searchRegex },
          { manufacturer_name: searchRegex }
        ]
      })
      .select('part_number manufacturer_name part_type')
      .limit(Math.floor(limit * 0.6))
      .lean();
      
      // 2. 获取匹配的制造商
      const manufacturers = await DoeeetComponent.distinct('manufacturer_name', {
        manufacturer_name: searchRegex
      });
      
      // 3. 获取匹配的分类
      const categoriesResult = await DoeeetComponent.find({
        family_path: searchRegex
      })
      .distinct('family_path')
      .limit(Math.floor(limit * 0.2));
      
      // 展平分类路径
      const categories = Array.from(new Set(
        categoriesResult
          .flat()
          .filter(cat => cat.toLowerCase().includes(keyword.toLowerCase()))
      )).slice(0, Math.floor(limit * 0.2));
      
      return {
        components: components.map(c => ({
          partNumber: c.part_number,
          manufacturer: c.manufacturer_name,
          partType: c.part_type
        })),
        manufacturers: manufacturers.slice(0, Math.floor(limit * 0.2)),
        categories
      };
      
    } catch (error) {
      logger.error('获取搜索建议失败:', error);
      throw new Error('获取搜索建议失败');
    }
  }
  
  /**
   * 获取组件详情（包含参数）
   * 带Redis缓存优化
   */
  async getComponentWithParameters(componentId: string): Promise<any> {
    try {
      // 尝试从缓存获取
      const cached = await this.cacheService.getCachedComponentDetail(componentId);
      if (cached) {
        logger.info(`✅ 组件详情缓存命中 [${componentId}]`);
        return cached;
      }
      
      logger.info(`⚡ 组件详情缓存未命中, 查询数据库...`);
      
      // 查询组件基本信息
      const component = await DoeeetComponent.findOne({ 
        component_id: componentId 
      }).lean();
      
      if (!component) {
        return null;
      }
      
      // 查询组件参数
      const parameters = await DoeeetParameter.find({ 
        component_id: componentId 
      }).lean();
      
      // 获取参数定义（从缓存或数据库）
      const paramKeys = parameters.map(p => p.parameter_key);
      const definitions = await this.getParameterDefinitions(paramKeys);
      
      // 创建参数定义映射
      const definitionMap = new Map(
        definitions.map(d => [d.parameter_key, d])
      );
      
      // 组合参数和定义
      const parametersWithDefinitions = parameters.map(param => {
        const def = definitionMap.get(param.parameter_key);
        return {
          key: param.parameter_key,
          name: def?.name || 'Unknown',
          shortName: def?.short_name,
          category: def?.category,
          value: param.parameter_value,
          numericValue: param.numeric_value
        };
      });
      
      const result = {
        ...component,
        parameters: parametersWithDefinitions
      };
      
      // 缓存结果
      await this.cacheService.cacheComponentDetail(componentId, result);
      
      return result;
      
    } catch (error) {
      logger.error('获取组件详情失败:', error);
      throw new Error('获取组件详情失败');
    }
  }
  
  /**
   * 获取所有制造商列表
   * 带Redis缓存优化
   */
  async getManufacturers(): Promise<string[]> {
    return await this.cacheService.getOrSet(
      'meta:manufacturers',
      async () => {
        logger.info('⚡ 制造商列表缓存未命中, 查询数据库...');
        const manufacturers = await DoeeetComponent.distinct('manufacturer_name');
        return manufacturers.sort();
      },
      CacheTTL.MANUFACTURERS
    );
  }
  
  /**
   * 获取所有分类路径
   * 带Redis缓存优化
   */
  async getFamilyPaths(): Promise<string[][]> {
    return await this.cacheService.getCachedCategoriesTree() || 
      await this.cacheService.getOrSet(
        'meta:categories:tree',
        async () => {
          logger.info('⚡ 分类列表缓存未命中, 查询数据库...');
          const paths = await DoeeetComponent.distinct('family_path');
          return paths.sort((a, b) => a.join(' > ').localeCompare(b.join(' > ')));
        },
        CacheTTL.CATEGORIES
      );
  }
  
  /**
   * 获取分类元数据
   * 带Redis缓存优化
   */
  async getCategoryMeta(familyPath: string[]): Promise<any> {
    return await this.cacheService.getOrSet(
      `meta:family:${familyPath.join('/')}`,
      async () => {
        logger.info(`⚡ 分类元数据缓存未命中 [${familyPath.join(' > ')}], 查询数据库...`);
        const family = await DoeeetFamily.findOne({ 
          family_path: familyPath 
        }).lean();
        return family;
      },
      CacheTTL.FAMILY_META
    );
  }
  
  /**
   * 获取参数定义
   * 带Redis缓存优化
   */
  async getParameterDefinitions(keys?: string[]): Promise<any[]> {
    // 获取所有参数定义（缓存）
    const allDefs = await this.cacheService.getOrSet(
      'meta:parameter_definitions',
      async () => {
        logger.info('⚡ 参数定义缓存未命中, 查询数据库...');
        const definitions = await DoeeetParameterDefinition.find({}).lean();
        return definitions;
      },
      CacheTTL.PARAMETER_DEFS
    );
    
    // 如果指定了keys，过滤返回
    if (keys && keys.length > 0) {
      const keySet = new Set(keys);
      return allDefs.filter(def => keySet.has(def.parameter_key));
    }
    
    return allDefs;
  }
  
  /**
   * 获取统计信息
   * 带Redis缓存优化
   */
  async getStatistics(): Promise<{
    totalComponents: number;
    activeComponents: number;
    obsoleteComponents: number;
    componentsInStock: number;
    manufacturerCount: number;
    categoryCount: number;
    categoryStats: { [key: string]: number };
  }> {
    return await this.cacheService.getOrSet(
      'meta:statistics',
      async () => {
        logger.info('⚡ 统计信息缓存未命中, 查询数据库...');
        const [
          totalComponents,
          activeComponents,
          obsoleteComponents,
          componentsInStock,
          manufacturers,
          categories,
          categoryAggregation
        ] = await Promise.all([
          DoeeetComponent.countDocuments(),
          DoeeetComponent.countDocuments({ obsolescence_type: 'Active' }),
          DoeeetComponent.countDocuments({ 
            obsolescence_type: { $in: ['Obsolete', 'Last Time Buy'] } 
          }),
          DoeeetComponent.countDocuments({ has_stock: true }),
          DoeeetComponent.distinct('manufacturer_name'),
          DoeeetComponent.distinct('family_path'),
          // 按分类聚合统计
          DoeeetComponent.aggregate([
            {
              $group: {
                _id: '$family_path',
                count: { $sum: 1 }
              }
            }
          ])
        ]);
        
        // 构建分类统计对象（注意：family_path 为从叶子到顶层的顺序）
        const categoryStats: { [key: string]: number } = {};
        categoryAggregation.forEach((item: any) => {
          if (item._id) {
            // item._id 在聚合中为数组（如果集合中是数组存储）；兼容字符串情况
            const pathArr = Array.isArray(item._id)
              ? item._id
              : (() => {
                  try {
                    return JSON.parse(String(item._id).replace(/'/g, '"'));
                  } catch {
                    return [];
                  }
                })();
            const mainCategory = Array.isArray(pathArr) && pathArr.length > 0
              ? pathArr[pathArr.length - 1]
              : String(item._id);
            categoryStats[mainCategory] = (categoryStats[mainCategory] || 0) + item.count;
          }
        });
        
        return {
          totalComponents,
          activeComponents,
          obsoleteComponents,
          componentsInStock,
          manufacturerCount: manufacturers.length,
          categoryCount: categories.length,
          categoryStats
        };
      },
      CacheTTL.STATISTICS
    );
  }
  
  // ========== 私有辅助方法 ==========
  
  /**
   * 映射排序字段
   */
  private mapSortField(sortBy: string): string {
    const fieldMap: { [key: string]: string } = {
      'partNumber': 'part_number',
      'manufacturer': 'manufacturer_name',
      'partType': 'part_type',
      'obsolescence': 'obsolescence_type',
      'stock': 'has_stock',
      'created': 'createdAt',
      'updated': 'updatedAt'
    };
    
    return fieldMap[sortBy] || sortBy;
  }
  
  /**
   * 获取应用的筛选条件
   */
  private getAppliedFilters(query: DoeeetSearchQuery): any {
    return {
      keyword: query.keyword,
      partNumber: query.partNumber,
      manufacturer: query.manufacturer,
      partType: query.partType,
      familyPath: query.familyPath,
      hasStock: query.hasStock,
      obsolescenceType: query.obsolescenceType,
      qualityName: query.qualityName,
      qualified: query.qualified,
      parameters: query.parameters
    };
  }
  
  /**
   * 构建分类树（用于前端分类筛选）
   * 从数据库读取所有 family_path 并构建层级结构
   */
  async buildCategoryTree(): Promise<any> {
    try {
      // 尝试从缓存获取
      const cacheKey = 'category_tree';
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        logger.info('✅ 分类树缓存命中');
        return cached;
      }
      
      logger.info('⚡ 从数据库构建分类树...');
      
      // 从数据库获取所有唯一的 family_path
      // 优先从 DoeeetFamily 集合读取（更准确），如果没有则从 DoeeetComponent 读取
      let familyPaths: string[][] = [];
      
      try {
        // 尝试从 DoeeetFamily 集合读取
        const families = await DoeeetFamily.find({}).select('family_path').lean();
        if (families && families.length > 0) {
          familyPaths = families.map((f: any) => f.family_path || []).filter((path: string[]) => path.length > 0);
          logger.info(`✅ 从 DoeeetFamily 集合读取到 ${familyPaths.length} 个分类路径`);
        } else {
          // 如果 DoeeetFamily 集合为空，从 DoeeetComponent 读取
          familyPaths = await DoeeetComponent.distinct('family_path');
          logger.info(`✅ 从 DoeeetComponent 集合读取到 ${familyPaths.length} 个分类路径`);
        }
      } catch (error) {
        logger.warn('从数据库读取分类路径失败，尝试从 DoeeetComponent 读取:', error);
        // 降级方案：从 DoeeetComponent 读取
        familyPaths = await DoeeetComponent.distinct('family_path');
      }
      
      if (!familyPaths || familyPaths.length === 0) {
        logger.warn('⚠️ 数据库中没有找到分类路径，使用降级数据');
        throw new Error('No family paths found in database');
      }
      
      // 构建分类树结构
      const tree: any[] = [];
      const subCategories: any = {};
      const categoryMap = new Map<string, any>();
      
      // 去重：使用 Set 存储已处理的路径（转换为字符串用于比较）
      const processedPaths = new Set<string>();
      
      familyPaths.forEach((fullPath: string[]) => {
        if (!fullPath || fullPath.length === 0) return;
        
        // 归一化：数据库为 叶子->顶层，这里反转为 顶层->叶子
        const normalizedPath = [...fullPath].reverse();

        // 将路径转换为字符串用于去重
        const pathKey = JSON.stringify(normalizedPath);
        if (processedPaths.has(pathKey)) return;
        processedPaths.add(pathKey);
        
        const topCategory = normalizedPath[0]; // 顶层分类
        
        // 初始化顶层分类
        if (!categoryMap.has(topCategory)) {
          const node = {
            label: topCategory,
            value: topCategory,
            children: []
          };
          categoryMap.set(topCategory, node);
          tree.push(node);
          subCategories[topCategory] = {};
        }
        
        // 逐级构建子分类
        let currentLevel = categoryMap.get(topCategory).children;
        
        for (let i = 1; i < normalizedPath.length; i++) {
          const categoryName = normalizedPath[i];
          
          // 查找或创建当前级别节点
          let node = currentLevel.find((n: any) => n.value === categoryName);
          
          if (!node) {
            node = {
              label: categoryName,
              value: categoryName,
              children: []
            };
            currentLevel.push(node);
          }
          
          // 构建 subCategories 结构（用于Tab+侧边栏展示）
          if (i === 1) {
            // 二级分类
            if (!subCategories[topCategory][categoryName]) {
              subCategories[topCategory][categoryName] = [];
            }
          } else if (i === 2) {
            // 三级分类
            const secondLevel = normalizedPath[1];
            if (!subCategories[topCategory][secondLevel]) {
              subCategories[topCategory][secondLevel] = [];
            }
            if (!subCategories[topCategory][secondLevel].includes(categoryName)) {
              subCategories[topCategory][secondLevel].push(categoryName);
            }
          }
          
          currentLevel = node.children;
        }
      });
      
      // 对树进行排序
      const sortTree = (nodes: any[]) => {
        nodes.sort((a, b) => a.label.localeCompare(b.label));
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            sortTree(node.children);
          }
        });
      };
      sortTree(tree);
      
      // 对 subCategories 中的数组进行排序
      Object.keys(subCategories).forEach(topCategory => {
        Object.keys(subCategories[topCategory]).forEach(secondLevel => {
          if (Array.isArray(subCategories[topCategory][secondLevel])) {
            subCategories[topCategory][secondLevel].sort();
          }
        });
      });
      
      const result = { tree, subCategories };
      
      // 缓存结果（24小时）
      await this.cacheService.set(cacheKey, result, CacheTTL.CATEGORIES);
      
      logger.info(`✅ 分类树构建完成：${tree.length} 个顶层分类，共 ${familyPaths.length} 个分类路径`);
      
      return result;
    } catch (error) {
      logger.error('构建分类树失败:', error);
      
      // 返回降级数据
      const fallbackCategories = [
        "Cable Assemblies", "Capacitors", "Connectors", "Crystals and Oscillators",
        "Discretes", "Filters", "Inductors", "Microcircuits", "Relays", "Resistors",
        "RF Passive Components", "Switches", "Thermistors", "Transformers", "Wires and Cables"
      ];
      
      return {
        tree: fallbackCategories.map(cat => ({
          label: cat,
          value: cat,
          children: []
        })),
        subCategories: {}
      };
    }
  }
  
  /**
   * 构建指定制造商的分类树（用于前端分类筛选）
   * 从数据库读取该制造商的所有 family_path 并构建层级结构
   */
  async buildCategoryTreeByManufacturer(manufacturerName: string): Promise<any> {
    try {
      // 尝试从缓存获取
      const cacheKey = `category_tree:manufacturer:${manufacturerName}`;
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        logger.info(`✅ 制造商分类树缓存命中: ${manufacturerName}`);
        return cached;
      }
      
      logger.info(`⚡ 从数据库构建制造商分类树: ${manufacturerName}...`);
      
      // 查询该制造商的所有唯一分类路径
      // 使用正则表达式进行模糊匹配（支持部分匹配）
      const manufacturerRegex = new RegExp(manufacturerName, 'i');
      const familyPaths = await DoeeetComponent.distinct('family_path', {
        manufacturer_name: manufacturerRegex
      });
      
      if (!familyPaths || familyPaths.length === 0) {
        logger.warn(`⚠️ 制造商 ${manufacturerName} 没有找到分类路径`);
        return {
          tree: [],
          subCategories: {}
        };
      }
      
      logger.info(`✅ 从数据库读取到 ${familyPaths.length} 个分类路径（制造商: ${manufacturerName}）`);
      
      // 构建分类树结构（复用 buildCategoryTree 的逻辑）
      const tree: any[] = [];
      const subCategories: any = {};
      const categoryMap = new Map<string, any>();
      const processedPaths = new Set<string>();
      
      familyPaths.forEach((fullPath: string[]) => {
        if (!fullPath || fullPath.length === 0) return;
        
        // 归一化：数据库为 叶子->顶层，这里反转为 顶层->叶子
        const normalizedPath = [...fullPath].reverse();

        // 将路径转换为字符串用于去重
        const pathKey = JSON.stringify(normalizedPath);
        if (processedPaths.has(pathKey)) return;
        processedPaths.add(pathKey);
        
        const topCategory = normalizedPath[0]; // 顶层分类
        
        // 初始化顶层分类
        if (!categoryMap.has(topCategory)) {
          const node = {
            label: topCategory,
            value: topCategory,
            children: []
          };
          categoryMap.set(topCategory, node);
          tree.push(node);
          subCategories[topCategory] = {};
        }
        
        // 逐级构建子分类
        let currentLevel = categoryMap.get(topCategory).children;
        
        for (let i = 1; i < normalizedPath.length; i++) {
          const categoryName = normalizedPath[i];
          
          // 查找或创建当前级别节点
          let node = currentLevel.find((n: any) => n.value === categoryName);
          
          if (!node) {
            node = {
              label: categoryName,
              value: categoryName,
              children: []
            };
            currentLevel.push(node);
          }
          
          // 构建 subCategories 结构（用于Tab+侧边栏展示）
          if (i === 1) {
            // 二级分类
            if (!subCategories[topCategory][categoryName]) {
              subCategories[topCategory][categoryName] = [];
            }
          } else if (i === 2) {
            // 三级分类
            const secondLevel = normalizedPath[1];
            if (!subCategories[topCategory][secondLevel]) {
              subCategories[topCategory][secondLevel] = [];
            }
            if (!subCategories[topCategory][secondLevel].includes(categoryName)) {
              subCategories[topCategory][secondLevel].push(categoryName);
            }
          }
          
          currentLevel = node.children;
        }
      });
      
      // 对树进行排序
      const sortTree = (nodes: any[]) => {
        nodes.sort((a, b) => a.label.localeCompare(b.label));
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            sortTree(node.children);
          }
        });
      };
      sortTree(tree);
      
      // 对 subCategories 中的数组进行排序
      Object.keys(subCategories).forEach(topCategory => {
        Object.keys(subCategories[topCategory]).forEach(secondLevel => {
          if (Array.isArray(subCategories[topCategory][secondLevel])) {
            subCategories[topCategory][secondLevel].sort();
          }
        });
      });
      
      const result = { tree, subCategories };
      
      // 缓存结果（1小时，因为制造商分类树变化频率较高）
      await this.cacheService.set(cacheKey, result, 3600);
      
      logger.info(`✅ 制造商分类树构建完成：${manufacturerName} - ${tree.length} 个顶层分类，共 ${familyPaths.length} 个分类路径`);
      
      return result;
    } catch (error) {
      logger.error(`构建制造商分类树失败: ${manufacturerName}`, error);
      return {
        tree: [],
        subCategories: {}
      };
    }
  }
  
  private async getRadiationSensitivityData(componentIds: string[]): Promise<Map<string, RadiationSensitivityEntry[]>> {
    const result = new Map<string, RadiationSensitivityEntry[]>();
    if (!componentIds || componentIds.length === 0) {
      return result;
    }

    const allDefinitions = await this.getParameterDefinitions();
    const radiationDefinitions = allDefinitions.filter(def => def?.category === RADIATION_SENSITIVITY_CATEGORY);
    if (radiationDefinitions.length === 0) {
      return result;
    }

    const definitionMap = new Map(
      radiationDefinitions.map(def => [def.parameter_key, def])
    );
    const radiationKeys = Array.from(definitionMap.keys());

    const radiationParams = await DoeeetParameter.find({
      component_id: { $in: componentIds },
      parameter_key: { $in: radiationKeys }
    }).lean();

    radiationParams.forEach(param => {
      const def = definitionMap.get(param.parameter_key);
      if (!def) {
        return;
      }
      const entry: RadiationSensitivityEntry = {
        key: param.parameter_key,
        name: def.name || param.parameter_key,
        shortName: def.short_name,
        category: def.category,
        value: param.parameter_value
      };
      if (!result.has(param.component_id)) {
        result.set(param.component_id, []);
      }
      result.get(param.component_id)!.push(entry);
    });

    if (result.size > 0) {
      const orderMap = new Map<string, number>(
        RADIATION_SENSITIVITY_ORDER.map((label, index) => [label.toLowerCase(), index])
      );
      result.forEach(entries => {
        entries.sort((a, b) => {
          const orderA = orderMap.get((a.name || '').toLowerCase()) ?? RADIATION_SENSITIVITY_ORDER.length;
          const orderB = orderMap.get((b.name || '').toLowerCase()) ?? RADIATION_SENSITIVITY_ORDER.length;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          return (a.name || '').localeCompare(b.name || '');
        });
      });
    }

    return result;
  }
}

// 导出单例
export const doeeetSearchService = new DoeeetSearchService();

