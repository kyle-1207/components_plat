import axios from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  LoginRequest,
  LoginResponse,
  User,
  Tenant,
  Office,
  Contract,
  FinancialRecord,
  Component,
  ComponentSearchParams,
  ComponentComparisonResult,
  PremiumProduct,
} from '@/types';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
    api.post('/auth/login', data).then(res => res.data),
  
  logout: (): Promise<ApiResponse<null>> =>
    api.post('/auth/logout').then(res => res.data),
  
  getCurrentUser: (): Promise<ApiResponse<User>> =>
    api.get('/auth/me').then(res => res.data),
};

// 用户相关API
export const userAPI = {
  getUsers: (params?: { page?: number; per_page?: number; role?: string }): Promise<PaginatedResponse<User>> =>
    api.get('/users', { params }).then(res => res.data),
  
  getUser: (id: number): Promise<ApiResponse<User>> =>
    api.get(`/users/${id}`).then(res => res.data),
  
  createUser: (data: Partial<User>): Promise<ApiResponse<User>> =>
    api.post('/users', data).then(res => res.data),
  
  updateUser: (id: number, data: Partial<User>): Promise<ApiResponse<User>> =>
    api.put(`/users/${id}`, data).then(res => res.data),
  
  deleteUser: (id: number): Promise<ApiResponse<null>> =>
    api.delete(`/users/${id}`).then(res => res.data),
};

// 租户相关API
export const tenantAPI = {
  getTenants: (params?: { page?: number; per_page?: number; status?: string }): Promise<PaginatedResponse<Tenant>> =>
    api.get('/tenants', { params }).then(res => res.data),
  
  getTenant: (id: number): Promise<ApiResponse<Tenant>> =>
    api.get(`/tenants/${id}`).then(res => res.data),
  
  createTenant: (data: Partial<Tenant>): Promise<ApiResponse<Tenant>> =>
    api.post('/tenants', data).then(res => res.data),
  
  updateTenant: (id: number, data: Partial<Tenant>): Promise<ApiResponse<Tenant>> =>
    api.put(`/tenants/${id}`, data).then(res => res.data),
  
  deleteTenant: (id: number): Promise<ApiResponse<null>> =>
    api.delete(`/tenants/${id}`).then(res => res.data),
};

// 办公空间相关API
export const officeAPI = {
  getOffices: (params?: { page?: number; per_page?: number; status?: string }): Promise<PaginatedResponse<Office>> =>
    api.get('/offices', { params }).then(res => res.data),
  
  getOffice: (id: number): Promise<ApiResponse<Office>> =>
    api.get(`/offices/${id}`).then(res => res.data),
  
  createOffice: (data: Partial<Office>): Promise<ApiResponse<Office>> =>
    api.post('/offices', data).then(res => res.data),
  
  updateOffice: (id: number, data: Partial<Office>): Promise<ApiResponse<Office>> =>
    api.put(`/offices/${id}`, data).then(res => res.data),
  
  deleteOffice: (id: number): Promise<ApiResponse<null>> =>
    api.delete(`/offices/${id}`).then(res => res.data),
};

// 合同相关API
export const contractAPI = {
  getContracts: (params?: { page?: number; per_page?: number; status?: string }): Promise<PaginatedResponse<Contract>> =>
    api.get('/contracts', { params }).then(res => res.data),
  
  getContract: (id: number): Promise<ApiResponse<Contract>> =>
    api.get(`/contracts/${id}`).then(res => res.data),
  
  createContract: (data: Partial<Contract>): Promise<ApiResponse<Contract>> =>
    api.post('/contracts', data).then(res => res.data),
  
  updateContract: (id: number, data: Partial<Contract>): Promise<ApiResponse<Contract>> =>
    api.put(`/contracts/${id}`, data).then(res => res.data),
  
  deleteContract: (id: number): Promise<ApiResponse<null>> =>
    api.delete(`/contracts/${id}`).then(res => res.data),
};

// 财务记录相关API
export const financialAPI = {
  getFinancialRecords: (params?: { page?: number; per_page?: number; type?: string; status?: string }): Promise<PaginatedResponse<FinancialRecord>> =>
    api.get('/financial-records', { params }).then(res => res.data),
  
  getFinancialRecord: (id: number): Promise<ApiResponse<FinancialRecord>> =>
    api.get(`/financial-records/${id}`).then(res => res.data),
  
  createFinancialRecord: (data: Partial<FinancialRecord>): Promise<ApiResponse<FinancialRecord>> =>
    api.post('/financial-records', data).then(res => res.data),
  
  updateFinancialRecord: (id: number, data: Partial<FinancialRecord>): Promise<ApiResponse<FinancialRecord>> =>
    api.put(`/financial-records/${id}`, data).then(res => res.data),
  
  deleteFinancialRecord: (id: number): Promise<ApiResponse<null>> =>
    api.delete(`/financial-records/${id}`).then(res => res.data),
};

// 器件相关API
export const componentAPI = {
  // 获取器件列表
  getComponents: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    manufacturer?: string;
    inStock?: boolean;
  }): Promise<PaginatedResponse<Component>> =>
    api.get('/components', { params }).then(res => res.data),

  // 根据ID获取器件详情
  getComponent: (id: string): Promise<ApiResponse<Component>> =>
    api.get(`/components/${id}`).then(res => res.data),

  // 获取器件详细信息（包含供应商、价格历史等）
  getComponentDetails: (id: string): Promise<ApiResponse<{
    component: Component;
    specifications: Record<string, any>;
    suppliers: any[];
    priceHistory: any[];
    alternatives: Component[];
    certifications: any[];
  }>> =>
    api.get(`/components/${id}/detailed`).then(res => res.data),

  // 高级搜索
  advancedSearch: (params: ComponentSearchParams): Promise<ApiResponse<{
    components: Component[];
    total: number;
    page: number;
    pageSize: number;
    filters: any;
  }>> =>
    api.post('/components/search/advanced', params).then(res => res.data),

  // 器件对比
  compareComponents: (componentIds: string[]): Promise<ApiResponse<ComponentComparisonResult>> =>
    api.post('/components/compare', { componentIds }).then(res => res.data),

  // 获取智能推荐
  getRecommendations: (requirements: {
    specifications: Record<string, any>;
    priceThreshold: number;
    availabilityRequired: boolean;
    certificationRequired: string[];
    temperatureRange: { min: number; max: number };
  }, userHistory?: string[]): Promise<ApiResponse<Component[]>> =>
    api.post('/components/recommendations/intelligent', { requirements, userHistory }).then(res => res.data),

  // 检查器件库存
  checkInventory: (id: string): Promise<ApiResponse<{
    totalStock: number;
    suppliers: {
      supplierId: string;
      supplierName: string;
      stock: number;
      price: number;
      leadTime: number;
      minimumOrder: number;
    }[];
    lastUpdated: Date;
  }>> =>
    api.get(`/components/${id}/inventory`).then(res => res.data),

  // 根据分类获取器件
  getComponentsByCategory: (category: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Component>> =>
    api.get(`/components/category/${category}`, { params }).then(res => res.data),

  // 获取器件推荐（基于单个器件）
  getComponentRecommendations: (id: string): Promise<ApiResponse<Component[]>> =>
    api.get(`/components/${id}/recommendations`).then(res => res.data),
};

// 优质产品 API
interface PremiumProductListResponse {
  success: boolean;
  data: PremiumProduct[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export const premiumProductAPI = {
  list: (params?: {
    page?: number;
    limit?: number;
    category?: string | string[];
    qualityLevel?: string | string[];
    keyword?: string;
    isPromoted?: boolean;
    hasFlightHistory?: boolean;
    priceMin?: number;
    priceMax?: number;
    leadTimeMaxWeeks?: number;
  }): Promise<PremiumProductListResponse> =>
    api.get('/premium-products', { params }).then((res) => res.data),

  detail: (id: string): Promise<ApiResponse<PremiumProduct>> =>
    api.get(`/premium-products/${id}`).then((res) => res.data),
};

// 辐照数据相关API
import type { 
  RadiationDataListResponse, 
  RadiationFilterOptions,
  RadiationDataQueryParams 
} from '@/types';

export const radiationDataAPI = {
  // 获取辐照数据列表
  list: (params?: RadiationDataQueryParams): Promise<ApiResponse<RadiationDataListResponse>> =>
    api.get('/radiation-data', { params }).then(res => res.data),

  // 获取筛选选项
  getFilters: (): Promise<ApiResponse<RadiationFilterOptions>> =>
    api.get('/radiation-data/options').then(res => res.data),
};

export const qualityAlertAPI = {
  scanWithContexts: (contexts: any[]): Promise<ApiResponse<any>> =>
    api.post('/quality/alerts/scan', { contexts }).then(res => res.data),
  scanFromZeroing: (params?: { since?: string; limit?: number }): Promise<ApiResponse<any>> =>
    api.get('/quality/alerts/scan/zeroing', { params }).then(res => res.data),
};

export default api;
