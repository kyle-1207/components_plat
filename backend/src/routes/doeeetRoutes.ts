import { Router } from 'express';
import { 
  searchComponents,
  getComponentById,
  getComponentsByCategory,
  fullTextSearch,
  getSearchSuggestions,
  getManufacturers,
  getFamilyPaths,
  getCategoryMeta,
  getParameterDefinitions,
  getStatistics,
  compareComponents,
  getCategoryTree,
  getCategoryTreeByManufacturer,
  debugCategoryDiagnostics
} from '../controllers/doeeetComponentController';
import { asyncHandler } from '../middleware/errorHandler';
import { validateSearchQuery, validateComponentId, validateCompareBody } from '../middleware/validation';

const router = Router();

// ========== 搜索相关 API ==========

/**
 * GET /api/doeeet/search
 * 复合搜索 - 支持关键词、型号、制造商、分类、参数等多维度搜索
 * 
 * Query参数:
 * - keyword: string (关键词搜索)
 * - partNumber: string (型号搜索)
 * - manufacturer: string (制造商搜索)
 * - partType: string (产品类型)
 * - familyPath: string (分类路径)
 * - hasStock: string (Yes|No 或 布尔)
 * - obsolescenceType: string[] (淘汰状态: Active, Obsolete, Risk, Last Time Buy)
 * - qualityName: string (质量等级)
 * - parameters: JSON string (参数筛选)
 * - page: number (页码，默认1)
 * - limit: number (每页数量，默认20，最大100)
 * - sortBy: string (排序字段)
 * - sortOrder: 'asc'|'desc' (排序方向)
 */
router.get('/search', validateSearchQuery, asyncHandler(searchComponents));

/**
 * GET /api/doeeet/fulltext
 * 全文搜索 - 快速关键词搜索
 * 
 * Query参数:
 * - q: string (必需，搜索关键词)
 * - limit: number (结果数量，默认20，最大100)
 * - hasStock: string (Yes|No 或 布尔)
 */
router.get('/fulltext', validateSearchQuery, asyncHandler(fullTextSearch));

/**
 * GET /api/doeeet/suggestions
 * 搜索建议 - 自动补全
 * 
 * Query参数:
 * - q: string (必需，搜索关键词，至少2个字符)
 * - limit: number (建议数量，默认10，最大20)
 */
router.get('/suggestions', asyncHandler(getSearchSuggestions));

/**
 * GET /api/doeeet/category/:category
 * 按分类浏览组件
 * 
 * Path参数:
 * - category: string (分类名称或路径，URL编码)
 * 
 * Query参数:
 * - page: number (页码)
 * - limit: number (每页数量，默认50，最大100)
 * - hasStock: string (Yes|No 或 布尔)
 */
router.get('/category/:category', validateSearchQuery, asyncHandler(getComponentsByCategory));

// ========== 组件详情 API ==========

/**
 * GET /api/doeeet/components/:id
 * 获取组件详细信息（包含参数）
 * 
 * Path参数:
 * - id: string (组件component_id)
 */
router.get('/components/:id', validateComponentId, asyncHandler(getComponentById));

/**
 * POST /api/doeeet/components/compare
 * 对比多个组件的参数
 * 
 * Body参数:
 * - componentIds: string[] (2-5个组件ID数组)
 */
router.post('/components/compare', validateCompareBody, asyncHandler(compareComponents));

// ========== 元数据 API ==========

/**
 * GET /api/doeeet/manufacturers
 * 获取所有制造商列表
 */
router.get('/manufacturers', asyncHandler(getManufacturers));

/**
 * GET /api/doeeet/categories
 * 获取所有分类路径列表
 */
router.get('/categories', asyncHandler(getFamilyPaths));

/**
 * GET /api/doeeet/categories/tree
 * 获取分类树结构（用于前端分类筛选）
 * 
 * 返回:
 * - tree: 完整的分类层级树（用于级联选择器）
 * - subCategories: 按顶层分类组织的子分类映射（用于Tab+侧边栏展示）
 */
router.get('/categories/tree', asyncHandler(getCategoryTree));

/**
 * GET /api/doeeet/manufacturers/:manufacturerName/categories/tree
 * 获取指定制造商的分类树结构（用于前端分类筛选）
 * 
 * Path参数:
 * - manufacturerName: string (制造商名称，支持部分匹配)
 * 
 * 返回:
 * - tree: 该制造商的分类层级树（用于级联选择器）
 * - subCategories: 按顶层分类组织的子分类映射（用于Tab+侧边栏展示）
 */
router.get('/manufacturers/:manufacturerName/categories/tree', asyncHandler(getCategoryTreeByManufacturer));

/**
 * GET /api/doeeet/category-meta/:familyPath
 * 获取分类元数据（参数配置）
 * 
 * Path参数:
 * - familyPath: string (JSON数组格式的分类路径，URL编码)
 */
router.get('/category-meta/:familyPath', asyncHandler(getCategoryMeta));

/**
 * GET /api/doeeet/parameter-definitions
 * 获取参数定义
 * 
 * Query参数:
 * - keys: string (逗号分隔的参数键列表，可选)
 */
router.get('/parameter-definitions', asyncHandler(getParameterDefinitions));

/**
 * GET /api/doeeet/statistics
 * 获取统计信息
 * 
 * 返回:
 * - totalComponents: 组件总数
 * - activeComponents: 活跃组件数
 * - obsoleteComponents: 停产组件数
 * - componentsInStock: 有库存组件数
 * - manufacturerCount: 制造商数量
 * - categoryCount: 分类数量
 */
router.get('/statistics', asyncHandler(getStatistics));

/**
 * GET /api/doeeet/debug/category-diagnostics
 * 分类诊断：对给定 familyPath 运行多种匹配统计
 * 
 * Query参数:
 * - familyPath: string | JSON数组（需URL编码）
 */
router.get('/debug/category-diagnostics', asyncHandler(debugCategoryDiagnostics));

export default router;

