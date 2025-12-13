// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'tenant' | 'staff';
  created_at: string;
  updated_at: string;
}

// 租户相关类型
export interface Tenant {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// 办公空间相关类型
export interface Office {
  id: number;
  name: string;
  description: string;
  area: number;
  capacity: number;
  price_per_month: number;
  status: 'available' | 'occupied' | 'maintenance';
  amenities: string[];
  images: string[];
  floor: number;
  created_at: string;
  updated_at: string;
}

// 租赁合同相关类型
export interface Contract {
  id: number;
  tenant_id: number;
  office_id: number;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit: number;
  status: 'active' | 'expired' | 'terminated';
  terms: string;
  created_at: string;
  updated_at: string;
  tenant?: Tenant;
  office?: Office;
}

// 财务记录相关类型
export interface FinancialRecord {
  id: number;
  contract_id: number;
  type: 'rent' | 'deposit' | 'utility' | 'service';
  amount: number;
  description: string;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  created_at: string;
  updated_at: string;
  contract?: Contract;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[] | {
    items: T[];
    total: number;
    page: number;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  message?: string;
  timestamp?: string;
}

// 登录请求类型
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应类型
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// 器件相关类型
export interface Component {
  id: string;
  partNumber: string;
  manufacturer: string;
  mainCategory?: string; // 主分类（如：航空电子、处理器、集成电路）
  category: string;
  subcategory?: string;
  // 三级分类系统
  category1?: string;
  category2?: string;
  description: string;
  specifications: Record<string, any>;
  qualityLevel: 'commercial' | 'industrial' | 'military' | 'aerospace';
  packageType: string;
  operatingTemp: {
    min: number;
    max: number;
  };
  voltage: {
    min: number;
    max: number;
  };
  pricing?: {
    price: number;
    currency: string;
    supplier: string;
    quantity: number;
  }[];
  availability?: {
    supplier: string;
    stockQuantity: number;
    leadTime: number;
    minimumOrder: number;
  }[];
  certifications: string[];
  datasheet?: string;
  lifecycle: 'active' | 'discontinued' | 'not_recommended';
  inStock?: boolean;
  stock?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// 器件搜索参数
export interface ComponentSearchParams {
  partNumber?: string;
  manufacturer?: string;
  category?: string;
  specifications?: Record<string, any>;
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: boolean;
  certifications?: string[];
  packageType?: string;
  operatingTemp?: {
    min: number;
    max: number;
  };
  page?: number;
  pageSize?: number;
  sortBy?: 'price' | 'availability' | 'rating' | 'partNumber';
  sortOrder?: 'asc' | 'desc';
}

// 器件对比结果
export interface ComponentComparisonResult {
  components: Component[];
  comparisonMatrix: {
    [componentId: string]: {
      [attribute: string]: any;
    };
  };
  recommendations: {
    componentId: string;
    reason: string;
    score: number;
  }[];
}

// 辐照数据相关类型
export interface RadiationDataRecord {
  _id?: string;
  source_index?: number | string;
  category: string;
  subcategory?: string;
  product_name: string;
  model?: string;
  model_spec?: string;
  package?: string;
  total_dose?: string;
  total_dose_numeric?: number;
  single_event?: string;
  single_event_numeric?: number;
  displacement?: string;
  displacement_numeric?: number;
  esd_rating?: string;
  quality_grade?: string;
  general_spec?: string;
  detail_spec?: string;
  supplier?: string;
  remark?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// 优质产品类型
export interface PremiumProduct {
  _id: string;
  premiumCode?: string;
  category: string;
  productName: string;
  modelSpec: string;
  keyFunctions: Array<{
    name: string;
    value: string;
    unit?: string;
    remark?: string;
  }>;
  temperatureRange?: {
    min?: number;
    max?: number;
    unit?: string;
  };
  radiationMetrics?: {
    tid?: string;
    sel?: string;
    see?: string;
    remark?: string;
  };
  packageType?: string;
  qualityLevel?: string;
  priceRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  leadTimeRange?: {
    minWeeks?: number;
    maxWeeks?: number;
  };
  flightHistory?: {
    hasFlightHistory?: boolean;
    description?: string;
  };
  isPromoted?: boolean;
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
    remark?: string;
  };
  datasheetPath?: string;
  status?: string;
  tags?: string[];
  dataSource?: string;
  createdAt: string;
  updatedAt: string;
}


export interface RadiationFilterOptions {
  categories: string[];
  subcategories: string[];
  qualityGrades: string[];
  suppliers: string[];
}

export interface RadiationDataListResponse {
  items: RadiationDataRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface RadiationDataQueryParams {
  page?: string | number;
  limit?: string | number;
  keyword?: string;
  category?: string;
  subcategory?: string;
  supplier?: string;
  qualityGrade?: string;
  totalDoseMin?: string | number;
  totalDoseMax?: string | number;
  singleEventMin?: string | number;
  singleEventMax?: string | number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc' | string;
}