import { Request, Response } from 'express';
import { memoryStorage, Component } from '../config/memoryStorage';
import { ApiResponse, SearchFilters, SearchResult, PaginationInfo } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// 基础搜索
export const searchComponents = async (req: Request, res: Response) => {
  try {
    const {
      q: query,
      page = 1,
      limit = 20,
      category,
      manufacturer,
      supplier,
      inStock
    } = req.query;

    if (!query) {
      throw new CustomError('搜索关键词不能为空', 400, 'SEARCH_QUERY_REQUIRED');
    }

    // 使用内存存储搜索
    let components = memoryStorage.searchComponents(query as string);

    // 应用筛选条件
    if (category) {
      components = components.filter((comp: Component) => 
        comp.category.toLowerCase().includes((category as string).toLowerCase())
      );
    }
    
    if (manufacturer) {
      components = components.filter((comp: Component) => 
        comp.manufacturer.toLowerCase().includes((manufacturer as string).toLowerCase())
      );
    }
    
    if (supplier) {
      components = components.filter((comp: Component) => 
        comp.suppliers.some((supplierId: string) => {
          const supplierData = memoryStorage.getSupplierById(supplierId);
          return supplierData?.name.toLowerCase().includes((supplier as string).toLowerCase());
        })
      );
    }
    
    if (inStock === 'true') {
      components = components.filter((comp: Component) => comp.stock && comp.stock > 0);
    }

    // 分页
    const totalItems = components.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedComponents = components.slice(skip, skip + Number(limit));

    // 计算分页信息
    const totalPages = Math.ceil(totalItems / Number(limit));
    const pagination: PaginationInfo = {
      currentPage: Number(page),
      totalPages,
      totalItems,
      itemsPerPage: Number(limit),
      hasNextPage: Number(page) < totalPages,
      hasPrevPage: Number(page) > 1
    };

    const response: ApiResponse = {
      success: true,
      data: {
        query,
        components: paginatedComponents,
        pagination
      },
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('搜索失败:', error);
    throw new CustomError('搜索失败', 500);
  }
};

// 获取搜索建议
export const getSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || (query as string).length < 2) {
      const response: ApiResponse = {
        success: true,
        data: { suggestions: [] },
        timestamp: new Date().toISOString()
      };
      return res.status(200).json(response);
    }

    const allComponents = memoryStorage.getAllComponents();
    const searchTerm = (query as string).toLowerCase();
    
    // 搜索匹配的器件
    const matchingComponents = allComponents.filter((comp: Component) => 
      comp.name.toLowerCase().includes(searchTerm) ||
      comp.model.toLowerCase().includes(searchTerm) ||
      comp.category.toLowerCase().includes(searchTerm) ||
      comp.manufacturer.toLowerCase().includes(searchTerm)
    ).slice(0, Math.floor(Number(limit) * 0.6));
    
    // 获取独特的分类和制造商
    const categories = [...new Set(allComponents.map((c: Component) => c.category))] 
      .filter((cat: string) => cat.toLowerCase().includes(searchTerm))
      .slice(0, Math.floor(Number(limit) * 0.2));
      
    const manufacturers = [...new Set(allComponents.map((c: Component) => c.manufacturer))]
      .filter((mfg: string) => mfg.toLowerCase().includes(searchTerm))
      .slice(0, Math.floor(Number(limit) * 0.2));

    const suggestions = [
      ...matchingComponents.map((c: Component) => ({
        type: 'component',
        value: c.model,
        label: `${c.model} - ${c.name}`,
        id: c.id
      })),
      ...categories.map(cat => ({
        type: 'category',
        value: cat,
        label: cat
      })),
      ...manufacturers.map(mfg => ({
        type: 'manufacturer',
        value: mfg,
        label: mfg
      }))
    ].slice(0, Number(limit));

    const response: ApiResponse = {
      success: true,
      data: { suggestions },
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);
  } catch (error) {
    logger.error('获取搜索建议失败:', error);
    throw new CustomError('获取搜索建议失败', 500);
  }
};

// 获取搜索筛选器
export const getSearchFilters = async (req: Request, res: Response): Promise<void> => {
  try {
    const allComponents = memoryStorage.getAllComponents();
    const allSuppliers = memoryStorage.getAllSuppliers();
    
    // 获取所有可用的筛选选项
    const categories = [...new Set(allComponents.map((c: Component) => c.category))].sort();
    const manufacturers = [...new Set(allComponents.map((c: Component) => c.manufacturer))].sort();
    const suppliers = allSuppliers.map((s: any) => s.name).sort();
    
    // 计算价格范围
    const prices = allComponents.filter((c: Component) => c.price).map((c: Component) => c.price!);
    const priceRange = prices.length > 0 ? {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    } : { min: 0, max: 100000 };

    const filters = {
      categories,
      manufacturers,
      suppliers,
      priceRange
    };

    const response: ApiResponse = {
      success: true,
      data: { filters },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('获取搜索筛选器失败:', error);
    throw new CustomError('获取搜索筛选器失败', 500);
  }
};

// 高级搜索
export const advancedSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      query = '',
      filters = {},
      page = 1,
      limit = 20,
      sortBy = 'relevance'
    } = req.body;

    const searchFilters = filters as SearchFilters;
    
    // 获取所有组件并应用搜索和筛选
    let components = query.trim() 
      ? memoryStorage.searchComponents(query)
      : memoryStorage.getAllComponents();
    
    // 分类筛选
    if (searchFilters.category && searchFilters.category.length > 0) {
      components = components.filter((comp: Component) => 
        searchFilters.category!.includes(comp.category)
      );
    }
    
    // 制造商筛选
    if (searchFilters.manufacturer && searchFilters.manufacturer.length > 0) {
      components = components.filter((comp: Component) => 
        searchFilters.manufacturer!.includes(comp.manufacturer)
      );
    }
    
    // 供应商筛选
    if (searchFilters.supplier && searchFilters.supplier.length > 0) {
      components = components.filter((comp: Component) =>
        comp.suppliers.some((supplierId: string) => {
          const supplier = memoryStorage.getSupplierById(supplierId);
          return supplier && searchFilters.supplier!.includes(supplier.name);
        })
      );
    }
    
    // 价格范围筛选
    if (searchFilters.priceRange && searchFilters.priceRange.min !== undefined && searchFilters.priceRange.max !== undefined) {
            components = components.filter((comp: Component) =>
        comp.price &&
        comp.price >= searchFilters.priceRange!.min &&
        comp.price <= searchFilters.priceRange!.max
      );
    }
    
    // 库存筛选
    if (searchFilters.inStock) {
      components = components.filter((comp: Component) => comp.stock && comp.stock > 0);
    }

    // 排序
    components.sort((a: Component, b: Component) => {
      switch (sortBy) {
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return (b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || Date.now())).getTime() - 
                 (a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || Date.now())).getTime();
        case 'relevance':
        default:
          return (b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || Date.now())).getTime() - 
                 (a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || Date.now())).getTime();
      }
    });

    // 分页
    const totalItems = components.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedComponents = components.slice(skip, skip + Number(limit));

    // 计算分页信息
    const totalPages = Math.ceil(totalItems / Number(limit));
    const pagination: PaginationInfo = {
      currentPage: Number(page),
      totalPages,
      totalItems,
      itemsPerPage: Number(limit),
      hasNextPage: Number(page) < totalPages,
      hasPrevPage: Number(page) > 1
    };

    // 获取当前结果中的筛选选项
    const resultCategories: string[] = [...new Set(components.map((c: Component) => c.category))];
    const resultManufacturers: string[] = [...new Set(components.map((c: Component) => c.manufacturer))];

    const searchResult: SearchResult = {
      components: paginatedComponents,
      filters: {
        categories: resultCategories,
        manufacturers: resultManufacturers,
        suppliers: searchFilters.supplier || [],
        priceRange: searchFilters.priceRange || { min: 0, max: 100000 }
      },
      pagination
    };

    const response: ApiResponse = {
      success: true,
      data: searchResult,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('高级搜索失败:', error);
    throw new CustomError('高级搜索失败', 500);
  }
};
