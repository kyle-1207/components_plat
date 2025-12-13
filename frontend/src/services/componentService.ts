import axios from 'axios';

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除本地存储并重定向到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 元器件数据类型定义
export interface Component {
  _id?: string;
  partNumber: string;
  manufacturer: string;
  primaryCategory: string;
  secondaryCategory: string;
  package: string;
  qualityLevel: string;
  lifecycle: string;
  standards: string[];
  description: string;
  functionalPerformance: string;
  referencePrice: number;
  priceUnit?: string;
  parameters: { [key: string]: string };
  inventory?: {
    totalStock: number;
    availableStock: number;
    reservedStock: number;
    minStockLevel: number;
  };
  suppliers?: Array<{
    name: string;
    partNumber?: string;
    leadTime?: number;
    minOrderQty?: number;
    price?: number;
    currency?: string;
    lastUpdated?: Date;
  }>;
  documents?: Array<{
    name: string;
    type: string;
    url?: string;
    fileId?: string;
    uploadDate?: Date;
  }>;
  alternatives?: Array<{
    partNumber: string;
    manufacturer: string;
    compatibility: string;
    notes?: string;
  }>;
  applications?: string[];
  certifications?: Array<{
    name: string;
    number?: string;
    authority?: string;
    validUntil?: Date;
  }>;
  environmental?: {
    rohsCompliant?: boolean;
    leadFree?: boolean;
    msl?: string;
    reachCompliant?: boolean;
  };
  tags?: string[];
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  stockStatus?: string;
  isLowStock?: boolean;
}

// 搜索过滤器接口
export interface ComponentFilters {
  search?: string;
  primaryCategory?: string;
  secondaryCategory?: string;
  manufacturer?: string;
  qualityLevel?: string;
  lifecycle?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API响应接口
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  message?: string;
}

export interface PaginatedResponse<T> {
  components: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 分类统计接口
export interface CategoryStats {
  _id: string;
  totalCount: number;
  totalValue: number;
  avgPrice: number;
  totalStock: number;
  lowStockCount: number;
  subcategories: Array<{
    name: string;
    count: number;
    totalValue: number;
    avgPrice: number;
    totalStock: number;
    lowStockCount: number;
  }>;
}

// 元器件服务类
class ComponentService {
  
  // 获取元器件列表
  async getComponents(filters: ComponentFilters = {}): Promise<PaginatedResponse<Component>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Component>>>('/components', {
        params: filters
      });
      
      if (response.data.success) {
        return response.data.data!;
      } else {
        throw new Error(response.data.error || '获取元器件列表失败');
      }
    } catch (error: any) {
      console.error('Error fetching components:', error);
      throw new Error(error.response?.data?.error || error.message || '网络错误');
    }
  }

  // 根据ID获取单个元器件
  async getComponentById(id: string): Promise<Component> {
    try {
      const response = await apiClient.get<ApiResponse<Component>>(`/components/${id}`);
      
      if (response.data.success) {
        return response.data.data!;
      } else {
        throw new Error(response.data.error || '获取元器件详情失败');
      }
    } catch (error: any) {
      console.error('Error fetching component by ID:', error);
      throw new Error(error.response?.data?.error || error.message || '网络错误');
    }
  }

  // 根据型号获取元器件
  async getComponentByPartNumber(partNumber: string): Promise<Component> {
    try {
      const response = await apiClient.get<ApiResponse<Component>>(`/components/part/${partNumber}`);
      
      if (response.data.success) {
        return response.data.data!;
      } else {
        throw new Error(response.data.error || '获取元器件失败');
      }
    } catch (error: any) {
      console.error('Error fetching component by part number:', error);
      throw new Error(error.response?.data?.error || error.message || '网络错误');
    }
  }

  // 创建新元器件
  async createComponent(componentData: Omit<Component, '_id' | 'createdAt' | 'updatedAt'>): Promise<Component> {
    try {
      const response = await apiClient.post<ApiResponse<Component>>('/components', componentData);
      
      if (response.data.success) {
        return response.data.data!;
      } else {
        throw new Error(response.data.error || '创建元器件失败');
      }
    } catch (error: any) {
      console.error('Error creating component:', error);
      throw new Error(error.response?.data?.error || error.message || '网络错误');
    }
  }

  // 更新元器件
  async updateComponent(id: string, componentData: Partial<Component>): Promise<Component> {
    try {
      const response = await apiClient.put<ApiResponse<Component>>(`/components/${id}`, componentData);
      
      if (response.data.success) {
        return response.data.data!;
      } else {
        throw new Error(response.data.error || '更新元器件失败');
      }
    } catch (error: any) {
      console.error('Error updating component:', error);
      throw new Error(error.response?.data?.error || error.message || '网络错误');
    }
  }

  // 删除元器件
  async deleteComponent(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/components/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || '删除元器件失败');
      }
    } catch (error: any) {
      console.error('Error deleting component:', error);
      throw new Error(error.response?.data?.error || error.message || '网络错误');
    }
  }

  // 批量导入元器件
  async bulkImportComponents(components: Omit<Component, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<{
    success: Array<{ index: number; partNumber: string; id: string }>;
    failed: Array<{ index: number; partNumber: string; error: string }>;
    total: number;
  }> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/components/bulk-import', { components });
      
      if (response.data.success) {
        return response.data.data!;
      } else {
        throw new Error(response.data.error || '批量导入失败');
      }
    } catch (error: any) {
      console.error('Error bulk importing components:', error);
      throw new Error(error.response?.data?.error || error.message || '网络错误');
    }
  }

  // 更新库存
  async updateStock(id: string, quantity: number, operation: 'set' | 'add' | 'subtract' | 'reserve' | 'release' = 'set'): Promise<Component> {
    try {
      const response = await apiClient.patch<ApiResponse<Component>>(`/components/${id}/stock`, {
        quantity,
        operation
      });
      
      if (response.data.success) {
        return response.data.data!;
      } else {
        throw new Error(response.data.error || '更新库存失败');
      }
    } catch (error: any) {
      console.error('Error updating stock:', error);
      throw new Error(error.response?.data?.error || error.message || '网络错误');
    }
  }

  // 获取分类统计
  async getCategoryStats(): Promise<CategoryStats[]> {
    try {
      const response = await apiClient.get<ApiResponse<CategoryStats[]>>('/components/stats/categories');
      
      if (response.data.success) {
        return response.data.data!;
      } else {
        throw new Error(response.data.error || '获取分类统计失败');
      }
    } catch (error: any) {
      console.error('Error fetching category stats:', error);
      throw new Error(error.response?.data?.error || error.message || '网络错误');
    }
  }

  // 获取低库存元器件
  async getLowStockComponents(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Component>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Component>>>('/components/management/low-stock', {
        params: { page, limit }
      });
      
      if (response.data.success) {
        return response.data.data!;
      } else {
        throw new Error(response.data.error || '获取低库存元器件失败');
      }
    } catch (error: any) {
      console.error('Error fetching low stock components:', error);
      throw new Error(error.response?.data?.error || error.message || '网络错误');
    }
  }

  // 搜索元器件（全文搜索）
  async searchComponents(searchTerm: string, filters: Omit<ComponentFilters, 'search'> = {}): Promise<PaginatedResponse<Component>> {
    const searchFilters: ComponentFilters = {
      ...filters,
      search: searchTerm
    };
    
    return this.getComponents(searchFilters);
  }

  // 获取制造商列表
  async getManufacturers(): Promise<string[]> {
    try {
      // 这个可以通过aggregation获取所有唯一的制造商
      const response = await this.getComponents({ limit: 1000 });
      const manufacturers = [...new Set(response.components.map(c => c.manufacturer))];
      return manufacturers.sort();
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
      return [];
    }
  }

  // 获取分类列表
  async getCategories(): Promise<{ primary: string[]; secondary: { [key: string]: string[] } }> {
    try {
      const response = await this.getComponents({ limit: 1000 });
      const primaryCategories = [...new Set(response.components.map(c => c.primaryCategory))];
      const secondaryCategories: { [key: string]: string[] } = {};
      
      response.components.forEach(component => {
        if (!secondaryCategories[component.primaryCategory]) {
          secondaryCategories[component.primaryCategory] = [];
        }
        if (!secondaryCategories[component.primaryCategory].includes(component.secondaryCategory)) {
          secondaryCategories[component.primaryCategory].push(component.secondaryCategory);
        }
      });
      
      // 排序
      Object.keys(secondaryCategories).forEach(key => {
        secondaryCategories[key].sort();
      });
      
      return {
        primary: primaryCategories.sort(),
        secondary: secondaryCategories
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { primary: [], secondary: {} };
    }
  }
}

// 导出单例实例
export const componentService = new ComponentService();
export default componentService;
