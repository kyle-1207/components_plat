// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: PaginationInfo;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    stack?: string;
  };
  timestamp: string;
  path: string;
}

// 分页信息
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// 查询参数
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  category?: string;
  manufacturer?: string;
  supplier?: string;
  inStock?: boolean;
}

// 器件相关类型
export interface ComponentData {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  // 三级分类系统
  mainCategory: string;
  category1?: string;
  category2?: string;
  manufacturer: string;
  datasheet?: string;
  image?: string;
  
  // 航天器件专用字段
  package: string;
  lifecycle: LifecycleStatus;
  qualityLevel: QualityLevel;
  radiationLevel?: RadiationLevel;
  radiationHardness?: RadiationHardness;
  temperatureGrade?: TemperatureGrade;
  packageType?: PackageType;
  lifecycleStatus?: LifecycleStatus;
  
  // 参数信息
  specifications: ComponentSpecifications;
  parameters: ComponentParameters;
  
  // 标准合规
  standards: string[]; // 相关标准编号 (MIL/ESCC/ISO等)
  
  // 关联数据
  alternativeParts: string[]; // 替代料号
  documents: DocumentReference[];
  radiationData: RadiationTestReference[];

  radiationTests?: RadiationTestReference[];
  
  // 认证信息
  certifications?: Array<{
    type: string;
    number: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate?: Date;
    status: 'valid' | 'expired' | 'suspended' | 'revoked';
  }>;
  
  // 质量等级详细信息
  qualityGrade?: {
    screening?: string;
    testing?: string;
    reliability?: string;
  };
  
  // 标准符合性
  standardCompliance?: Array<{
    standardCode: string;
    standardType: StandardType;
    complianceLevel: string;
    verificationDate?: Date;
    notes?: string;
  }>;
  
  // 供应链信息
  supplyChain?: {
    primarySupplier?: string;
    alternativeSuppliers?: string[];
    leadTimeWeeks?: number;
    minimumOrderQuantity?: number;
    availability?: 'in_stock' | 'limited' | 'long_lead' | 'obsolete' | 'unknown';
  };
  
  // 技术特性
  technicalSpecs?: {
    operatingTemp?: {
      min?: number;
      max?: number;
      unit?: string;
    };
    storageTemp?: {
      min?: number;
      max?: number;
      unit?: string;
    };
    powerConsumption?: {
      typical?: number;
      maximum?: number;
      unit?: string;
    };
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      unit?: string;
    };
    weight?: {
      value?: number;
      unit?: string;
    };
  };
  
  // 可靠性数据
  reliability?: {
    mtbf?: number;
    failureRate?: number;
    confidenceLevel?: number;
    testHours?: number;
    lastUpdated?: Date;
  };
  
  // 元数据
  metadata?: {
    isObsolete?: boolean;
    isRestricted?: boolean;
    isPreferred?: boolean;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    tags?: string[];
    notes?: string;
    lastReviewed?: Date;
    reviewedBy?: string;
  };
  
  // 商业信息
  pricing: ComponentPricing[];
  availability: ComponentAvailability[];
  suppliers: SupplierInfo[];
  
  createdAt: Date;
  updatedAt: Date;
}

// 质量等级枚举
export enum QualityLevel {
  SPACE = 'space',        // 宇航级
  MILITARY = 'military',  // 军用级
  INDUSTRIAL = 'industrial', // 工业级
  COMMERCIAL = 'commercial'  // 商业级
}

// 生命周期状态
export enum LifecycleStatus {
  ACTIVE = 'active',         // 量产
  NRND = 'nrnd',            // 不建议新设计使用
  OBSOLETE = 'obsolete',     // 停产
  EOL = 'eol',              // 生命周期结束
  PREVIEW = 'preview'        // 预览版
}

// 辐照等级
export enum RadiationLevel {
  LOW = 'low',              // 低辐照
  MEDIUM = 'medium',        // 中辐照  
  HIGH = 'high',            // 高辐照
  EXTREME = 'extreme'       // 极端辐照
}

// 辐射抗性
export enum RadiationHardness {
  NONE = 'NONE',           // 无抗辐射
  LOW = 'LOW',             // 低抗辐射
  MEDIUM = 'MEDIUM',       // 中等抗辐射
  HIGH = 'HIGH',           // 高抗辐射
  ULTRA_HIGH = 'ULTRA_HIGH' // 超高抗辐射
}

// 温度等级
export enum TemperatureGrade {
  COMMERCIAL = 'COMMERCIAL', // 商业级 (0°C to +70°C)
  INDUSTRIAL = 'INDUSTRIAL', // 工业级 (-40°C to +85°C)
  AUTOMOTIVE = 'AUTOMOTIVE', // 汽车级 (-40°C to +125°C)
  MILITARY = 'MILITARY',     // 军用级 (-55°C to +125°C)
  SPACE = 'SPACE'           // 航天级 (-55°C to +150°C)
}

// 封装类型
export enum PackageType {
  DIP = 'DIP',
  SOIC = 'SOIC',
  QFP = 'QFP',
  BGA = 'BGA',
  LGA = 'LGA',
  CSP = 'CSP',
  TQFP = 'TQFP',
  LQFP = 'LQFP',
  PLCC = 'PLCC',
  PGA = 'PGA',
  SOP = 'SOP',
  SSOP = 'SSOP',
  TSSOP = 'TSSOP',
  MSOP = 'MSOP',
  QFN = 'QFN',
  DFN = 'DFN',
  WLCSP = 'WLCSP',
  FLIPCHIP = 'FLIPCHIP',
  CERAMIC = 'CERAMIC',
  METAL_CAN = 'METAL_CAN',
  BARE_DIE = 'BARE_DIE',
  CUSTOM = 'CUSTOM'
}

// 器件参数结构
export interface ComponentParameters {
  electrical: ElectricalParameters;
  mechanical: MechanicalParameters;
  thermal: ThermalParameters;
  environmental: EnvironmentalParameters;
  radiation?: RadiationParameters;
}

export interface ElectricalParameters {
  voltage?: {
    operating?: number;
    maximum?: number;
    minimum?: number;
    unit: string;
  };
  current?: {
    operating?: number;
    maximum?: number;
    unit: string;
  };
  power?: {
    maximum?: number;
    dissipation?: number;
    unit: string;
  };
  frequency?: {
    operating?: number;
    maximum?: number;
    unit: string;
  };
  resistance?: number;
  capacitance?: number;
  inductance?: number;
}

export interface MechanicalParameters {
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  pinCount?: number;
  leadPitch?: number;
}

export interface ThermalParameters {
  operatingTemp?: {
    min: number;
    max: number;
    unit: string;
  };
  storageTemp?: {
    min: number;
    max: number;
    unit: string;
  };
  thermalResistance?: number;
  junctionTemp?: number;
}

export interface EnvironmentalParameters {
  humidity?: {
    min: number;
    max: number;
    unit: string;
  };
  vibration?: {
    frequency: number;
    acceleration: number;
  };
  shock?: {
    acceleration: number;
    duration: number;
  };
  altitude?: {
    max: number;
    unit: string;
  };
}

export interface RadiationParameters {
  tid?: {
    level: number;
    unit: string;
    testCondition?: string;
  };
  see?: {
    threshold: number;
    crossSection: number;
    unit: string;
  };
  dd?: {
    threshold: number;
    sensitivity: number;
    unit: string;
  };
  neutron?: {
    fluence: number;
    energy: number;
    unit: string;
  };
}

export interface ComponentSpecifications {
  [key: string]: string | number | boolean;
}

export interface ComponentPricing {
  supplier: string;
  currency: string;
  price: number;
  quantity: number;
  leadTime?: number;
}

export interface ComponentAvailability {
  supplier: string;
  stockQuantity: number;
  location?: string;
  lastUpdated: Date;
}

// 文档引用
export interface DocumentReference {
  id: string;
  type: 'datasheet' | 'certificate' | 'report' | 'standard';
  title: string;
  url: string;
  version?: string;
  uploadedAt: Date;
}

// 辐照测试引用
export interface RadiationTestReference {
  id: string;
  testType: RadiationTestType;
  testDate: Date;
  testLab: string;
  certificationLevel: string;
  reportUrl?: string;
  summary: string;
}

export enum RadiationTestType {
  TID = 'tid',        // Total Ionizing Dose
  SEE = 'see',        // Single Event Effects
  DD = 'dd',          // Displacement Damage
  NEUTRON = 'neutron', // Neutron Effects
  PROTON = 'proton'   // Proton Effects
}



// 供应商信息
export interface SupplierInfo {
  id: string;
  name: string;
  code: string;
  qualificationLevel: SupplierQualificationLevel;
  contactInfo: SupplierContact;
  isActive: boolean;
  lastAuditDate?: Date;
  certifications: string[];
  capabilities?: {
    productCategories?: string[];
    services?: string[];
    qualityStandards?: Array<{
      standard: string;
      certificationNumber?: string;
      validUntil?: Date;
      issuedBy?: string;
    }>;
    radiationTesting?: {
      hasCapability?: boolean;
      testTypes?: string[];
      accreditation?: string;
    };
    spaceQualification?: {
      hasExperience?: boolean;
      programs?: string[];
      certificationLevel?: string;
    };
  };
  performance?: any;
  riskAssessment?: any;
  contractInfo?: any;
  metadata?: any;
}

export enum SupplierQualificationLevel {
  A = 'A',  // A级供应商
  B = 'B',  // B级供应商
  C = 'C',  // C级供应商
  UNQUALIFIED = 'unqualified' // 未认证
}

// 供应商联系信息
export interface SupplierContact {
  primaryContact: {
    name: string;
    title?: string;
    email: string;
    phone?: string;
    mobile?: string;
  };
  technicalContact?: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    mobile?: string;
  };
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  website?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
  };
}

// 供应商相关类型
export interface SupplierData {
  id: string;
  name: string;
  code: string;
  description?: string;
  website?: string;
  contactInfo: SupplierContact;
  address: SupplierAddress;
  rating?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierContact {
  email?: string;
  phone?: string;
  contactPerson?: string;
}

export interface SupplierAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// 搜索相关类型
export interface SearchFilters {
  category?: string[];
  manufacturer?: string[];
  supplier?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  specifications?: {
    [key: string]: string | number | boolean;
  };
  inStock?: boolean;
}

export interface SearchResult {
  components: any[];
  filters: {
    categories: string[];
    manufacturers: string[];
    suppliers: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
  pagination: PaginationInfo;
}

// 上传文件类型
export interface UploadedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: Date;
}

// ================= 业务核心数据模型 =================



// 标准文档数据模型
export interface StandardData {
  id: string;
  standardCode: string;  // 标准编号 如 MIL-STD-883K
  standardType: StandardType;
  title: string;
  version: string;
  status: StandardStatus;
  publishDate: Date;
  effectiveDate: Date;
  
  // 标准关系
  replacedBy?: string;     // 替代标准ID
  replaces?: string[];     // 被替代的标准ID
  relatedStandards: string[];
  
  // 内容信息
  abstract?: string;
  scope: string;
  fileUrl?: string;
  downloadCount: number;
  
  // 关联信息
  relatedComponents: string[];  // 关联的器件ID
  category: string[];          // 适用类别
  
  createdAt: Date;
  updatedAt: Date;
}

export enum StandardType {
  MIL = 'MIL',        // 美国军用标准
  ESCC = 'ESCC',      // 欧空局标准
  ISO = 'ISO',        // 国际标准化组织
  IEC = 'IEC',        // 国际电工委员会
  GB = 'GB',          // 国家标准
  GJB = 'GJB',        // 国军标
  JEDEC = 'JEDEC',    // JEDEC标准
  NASA = 'NASA'       // NASA标准
}

export enum StandardStatus {
  ACTIVE = 'active',       // 现行
  WITHDRAWN = 'withdrawn', // 废止
  SUPERSEDED = 'superseded', // 被替代
  DRAFT = 'draft'          // 草案
}

// 辐照测试数据模型
export interface RadiationTestData {
  id: string;
  componentId: string;
  componentPartNumber: string;
  testType: RadiationTestType;
  testCondition: RadiationTestCondition;
  testResult: RadiationTestResult;
  testDate: Date;
  testLab: string;
  testOperator: string;
  
  // 认证信息
  certificationLevel: string;
  passFailStatus: 'pass' | 'fail' | 'conditional';
  
  // 文档
  reportFile?: string;
  certificateFile?: string;
  dataFiles: string[];
  
  // 批次信息
  batchNumber: string;
  sampleCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface RadiationTestCondition {
  // TID 测试条件
  totalDose?: number;        // 总剂量 (rad)
  doseRate?: number;         // 剂量率 (rad/s)
  biasCondition?: string;    // 偏置条件
  
  // SEE 测试条件
  particleType?: string;     // 粒子类型
  particleEnergy?: number;   // 粒子能量 (MeV)
  fluence?: number;          // 注量 (particles/cm²)
  
  // 环境条件
  temperature?: number;      // 测试温度 (°C)
  humidity?: number;         // 湿度 (%)
  duration?: number;         // 测试时长 (hours)
}

export interface RadiationTestResult {
  // TID 结果
  tidLevel?: number;         // TID等级 (rad)
  parametricShift?: {        // 参数漂移
    parameter: string;
    beforeValue: number;
    afterValue: number;
    shiftPercent: number;
  }[];
  
  // SEE 结果
  seeThreshold?: number;     // SEE阈值 (MeV·cm²/mg)
  crossSection?: number;     // 截面 (cm²)
  errorRate?: number;        // 错误率
  
  // 通用结果
  functionalStatus: 'pass' | 'fail' | 'degraded';
  notes?: string;
  rawData?: any;
}
