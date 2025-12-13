/**
 * 内存数据存储 - 用于开发测试，支持数据持久化
 */

export interface Component {
  id: string;
  name: string;
  model: string;
  category: string;
  subcategory?: string;
  manufacturer: string;
  specifications: Record<string, any>;
  description?: string;
  imageUrl?: string;
  suppliers: string[];
  price?: number;
  stock?: number;
  // 新增比对相关字段
  qualityLevel: 'commercial' | 'industrial' | 'military' | 'space';
  package?: string;
  operatingTemp?: {
    min: number;
    max: number;
  };
  voltage?: {
    min: number;
    max: number;
  };
  availability?: 'in_stock' | 'limited' | 'out_of_stock';
  datasheet?: string;
  leadTime?: number; // 交货时间（天）
  moq?: number; // 最小起订量
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  qualificationLevel: 'A' | 'B' | 'C' | 'unqualified';
  contactInfo: any;
  isActive: boolean;
  lastAuditDate?: Date;
  certifications: string[];
  businessInfo?: any;
  capabilities?: any;
  performance?: any;
  riskAssessment?: any;
  contractInfo?: any;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Identification {
  id: string;
  identificationId: string;
  componentPartNumber: string;
  manufacturer: string;
  componentName?: string;
  description?: string;
  sampleInfo?: {
    quantity: number;
    batchNumber?: string;
    sampleDate?: Date;
    sourceSupplier?: string;
  };
  testItems?: Array<{
    testType: string;
    testMethod: string;
    parameters: Record<string, any>;
    status: 'pass' | 'fail' | 'conditional';
    result?: any;
    notes?: string;
  }>;
  testResults?: {
    totalItems: number;
    passedItems: number;
    failedItems: number;
    conditionalItems: number;
    overallStatus: 'qualified' | 'unqualified' | 'conditional';
  };
  qualityAssessment?: {
    qualityLevel: 'commercial' | 'industrial' | 'military' | 'space';
    riskLevel: 'low' | 'medium' | 'high';
    recommendation: string;
    notes?: string;
  };
  reportInfo?: {
    reportNumber: string;
    reportDate: Date;
    reviewer: string;
    approver?: string;
    organization: string;
  };
  validity?: {
    isValid: boolean;
    expiryDate: Date;
    renewalRequired: boolean;
  };
  attachments?: Array<{
    fileName: string;
    fileType: string;
    filePath: string;
    uploadDate: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DigitalModel {
  id: string;
  modelId: string;
  componentCategory: string;
  componentName: string;
  modelSpecification: string;
  manufacturer: string;
  modelCategory: string;
  modelPurpose: string;
  fileInfo: {
    fileName: string;
    fileSize: number;
    fileUrl?: string;
    fileFormat: string;
    checksum?: string;
    uploadDate?: Date;
  };
  validation?: {
    isValidated: boolean;
    validationDate?: Date;
    validatedBy?: string;
    validationMethod?: string;
    validationResults?: {
      accuracy: number;
      frequencyRange: string;
      temperatureRange: string;
      notes: string;
    };
  };
  modelInfo?: {
    modelName: string;
    modelType: string;
    modelVersion: string;
    description: string;
    keywords: string[];
  };
  versionControl?: {
    version: string;
    isLatest: boolean;
  };
  sharing?: {
    isPublic: boolean;
    accessLevel: string;
    downloadCount: number;
    rating: {
      averageRating: number;
      ratingCount: number;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

export class MemoryStorage {
  private static instance: MemoryStorage;
  private components: Map<string, Component> = new Map();
  private suppliers: Map<string, Supplier> = new Map();
  private identifications: Map<string, Identification> = new Map();
  public digitalModels: DigitalModel[] = [];
  private isDataLoaded: boolean = false;

  private constructor() {
    this.initializeData();
  }

  public static getInstance(): MemoryStorage {
    if (!MemoryStorage.instance) {
      MemoryStorage.instance = new MemoryStorage();
    }
    return MemoryStorage.instance;
  }

  // 组件相关方法
  getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }

  getComponentById(id: string): Component | null {
    return this.components.get(id) || null;
  }

  createComponent(data: Omit<Component, 'id' | 'createdAt' | 'updatedAt'>): Component {
    const component: Component = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.components.set(component.id, component);
    return component;
  }

  updateComponent(id: string, data: Partial<Component>): Component | null {
    const component = this.components.get(id);
    if (!component) return null;

    const updated = {
      ...component,
      ...data,
      id,
      updatedAt: new Date()
    };
    this.components.set(id, updated);
    return updated;
  }

  deleteComponent(id: string): boolean {
    return this.components.delete(id);
  }

  searchComponents(query: string): Component[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.components.values()).filter(component =>
      component.name.toLowerCase().includes(searchTerm) ||
      component.model.toLowerCase().includes(searchTerm) ||
      component.category.toLowerCase().includes(searchTerm) ||
      component.manufacturer.toLowerCase().includes(searchTerm)
    );
  }

  // 供应商相关方法
  getAllSuppliers(): Supplier[] {
    return Array.from(this.suppliers.values());
  }

  getSuppliers(): Supplier[] {
    return Array.from(this.suppliers.values());
  }

  getSupplierById(id: string): Supplier | null {
    return this.suppliers.get(id) || null;
  }

  createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Supplier {
    const supplier: Supplier = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.suppliers.set(supplier.id, supplier);
    return supplier;
  }

  updateSupplier(id: string, data: Partial<Supplier>): Supplier | null {
    const supplier = this.suppliers.get(id);
    if (!supplier) return null;

    const updated = {
      ...supplier,
      ...data,
      id,
      updatedAt: new Date()
    };
    this.suppliers.set(id, updated);
    return updated;
  }

  deleteSupplier(id: string): boolean {
    return this.suppliers.delete(id);
  }

  // 鉴定记录相关方法
  getAllIdentifications(): Identification[] {
    return Array.from(this.identifications.values());
  }

  getIdentificationById(id: string): Identification | null {
    return this.identifications.get(id) || null;
  }

  searchIdentifications(query: any): Identification[] {
    const identifications = Array.from(this.identifications.values());
    
    return identifications.filter(identification => {
      // 器件型号查询
      if (query.componentPartNumber) {
        const regex = new RegExp(query.componentPartNumber, 'i');
        if (!regex.test(identification.componentPartNumber)) return false;
      }

      // 制造商查询
      if (query.manufacturer) {
        const regex = new RegExp(query.manufacturer, 'i');
        if (!regex.test(identification.manufacturer)) return false;
      }

      // 整体状态查询
      if (query.overallStatus) {
        if (identification.testResults?.overallStatus !== query.overallStatus) return false;
      }

      // 质量等级查询
      if (query.qualityLevel) {
        if (identification.qualityAssessment?.qualityLevel !== query.qualityLevel) return false;
      }

      // 有效性查询
      if (query.isValid !== undefined) {
        if (identification.validity?.isValid !== query.isValid) return false;
      }

      return true;
    });
  }

  getIdentificationsByPartNumber(partNumber: string, includeExpired: boolean = false): Identification[] {
    const identifications = Array.from(this.identifications.values())
      .filter(identification => identification.componentPartNumber === partNumber);

    if (!includeExpired) {
      const now = new Date();
      return identifications.filter(identification => 
        identification.validity?.isValid && 
        identification.validity?.expiryDate && 
        identification.validity.expiryDate >= now
      );
    }

    return identifications.sort((a, b) => {
      const dateA = a.reportInfo?.reportDate || a.createdAt;
      const dateB = b.reportInfo?.reportDate || b.createdAt;
      
      // 使用辅助方法确保日期是Date对象
      const dateObjA = this.ensureDateField(dateA);
      const dateObjB = this.ensureDateField(dateB);
      
      return dateObjB.getTime() - dateObjA.getTime();
    });
  }

  createIdentification(data: Omit<Identification, 'id' | 'createdAt' | 'updatedAt'>): Identification {
    const identification: Identification = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.identifications.set(identification.id, identification);
    return identification;
  }

  updateIdentification(id: string, data: Partial<Identification>): Identification | null {
    const identification = this.identifications.get(id);
    if (!identification) return null;

    const updated = {
      ...identification,
      ...data,
      id,
      updatedAt: new Date()
    };
    this.identifications.set(id, updated);
    return updated;
  }

  deleteIdentification(id: string): boolean {
    return this.identifications.delete(id);
  }

  getIdentificationStats(): any {
    const identifications = Array.from(this.identifications.values());
    const totalRecords = identifications.length;
    
    const qualifiedRecords = identifications.filter(i => i.testResults?.overallStatus === 'qualified').length;
    const unqualifiedRecords = identifications.filter(i => i.testResults?.overallStatus === 'unqualified').length;
    const conditionalRecords = identifications.filter(i => i.testResults?.overallStatus === 'conditional').length;

    const now = new Date();
    const validRecords = identifications.filter(i => 
      i.validity?.isValid && 
      i.validity?.expiryDate && 
      i.validity.expiryDate >= now
    ).length;

    const expiredRecords = identifications.filter(i => 
      !i.validity?.isValid || 
      !i.validity?.expiryDate || 
      i.validity.expiryDate < now
    ).length;

    // 按质量等级统计
    const qualityLevelStats = identifications.reduce((acc, identification) => {
      const level = identification.qualityAssessment?.qualityLevel || 'unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 按制造商统计（前10）
    const manufacturerStats = identifications.reduce((acc, identification) => {
      const manufacturer = identification.manufacturer || 'unknown';
      acc[manufacturer] = (acc[manufacturer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topManufacturers = Object.entries(manufacturerStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([_id, count]) => ({ _id, count }));

    const qualityLevelDistribution = Object.entries(qualityLevelStats)
      .map(([_id, count]) => ({ _id, count }));

    return {
      overview: {
        totalRecords,
        qualifiedRecords,
        unqualifiedRecords,
        conditionalRecords,
        validRecords,
        expiredRecords
      },
      qualityLevelDistribution,
      topManufacturers
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 确保日期字段是Date对象
   */
  private ensureDateField(dateValue: any): Date {
    if (dateValue instanceof Date) {
      return dateValue;
    }
    if (typeof dateValue === 'string') {
      return new Date(dateValue);
    }
    if (typeof dateValue === 'number') {
      return new Date(dateValue);
    }
    // 如果无法转换，返回当前日期
    return new Date();
  }

  private initializeData(): void {
    // 如果数据已加载，则跳过初始化
    if (this.isDataLoaded) {
      return;
    }

    // 尝试加载持久化数据
    try {
      const { persistentStorage } = require('./persistentStorage');
      const persistedData = persistentStorage.loadData();
      
      if (persistedData) {
        // 加载持久化数据
        this.loadPersistedData(persistedData);
        this.isDataLoaded = true;
        return;
      }
    } catch (error) {
      console.log('持久化存储未可用，使用默认数据');
    }

    // 如果没有持久化数据，则初始化默认测试数据
    this.initializeDefaultData();
    this.isDataLoaded = true;
  }

  private initializeDefaultData(): void {
    // 基础供应商数据将通过 initializeDetailedSuppliers 方法初始化

    // 添加更多详细的供应商数据
    this.initializeDetailedSuppliers();

    // 初始化示例组件数据
    const components = [
      {
        name: "航空电子控制单元",
        model: "ACU-2024-PRO",
        category: "航电系统",
        subcategory: "控制单元",
        manufacturer: "航电科技",
        specifications: {
          inputVoltage: "28V DC",
          power: 150,
          temperature: "-55°C to +85°C",
          weight: "2.5kg",
          dimensions: "200x150x80mm",
          interface: "ARINC 429",
          clockSpeed: 200,
          cores: 1
        },
        description: "高性能航空电子控制单元，适用于商用和军用飞机",
        imageUrl: "/images/acu-2024-pro.jpg",
        suppliers: Array.from(this.suppliers.keys()).slice(0, 1),
        price: 25000,
        stock: 15,
        qualityLevel: "space" as const,
        package: "LQFP-176",
        operatingTemp: { min: -55, max: 85 },
        voltage: { min: 24, max: 32 },
        availability: "in_stock" as const,
        leadTime: 14,
        moq: 1
      },
      {
        name: "导航传感器模块",
        model: "NAV-SEN-X1",
        category: "导航系统",
        subcategory: "传感器",
        manufacturer: "导航科技",
        specifications: {
          accuracy: "±0.1°",
          updateRate: "100Hz",
          interface: "CAN Bus",
          inputVoltage: "12V-28V DC",
          weight: "0.8kg",
          power: 3.5,
          frequency: 100
        },
        description: "高精度导航传感器，提供实时位置和姿态信息",
        suppliers: Array.from(this.suppliers.keys()),
        price: 8500,
        stock: 25,
        qualityLevel: "military" as const,
        package: "BGA-256",
        operatingTemp: { min: -40, max: 85 },
        voltage: { min: 12, max: 28 },
        availability: "in_stock" as const,
        leadTime: 7,
        moq: 5
      },
      {
        name: "通信无线电模块",
        model: "COMM-VHF-200",
        category: "通信系统",
        subcategory: "无线电",
        manufacturer: "通信设备公司",
        specifications: {
          frequency: "118-137 MHz",
          power: 25,
          channels: "2280",
          modulation: "AM",
          antenna: "50Ω"
        },
        description: "VHF航空通信无线电模块，符合国际航空标准",
        suppliers: Array.from(this.suppliers.keys()).slice(1, 2),
        price: 12000,
        stock: 8,
        qualityLevel: "space" as const,
        package: "Module",
        operatingTemp: { min: -55, max: 71 },
        voltage: { min: 11, max: 33 },
        availability: "limited" as const,
        leadTime: 21,
        moq: 2
      },
      {
        name: "液压执行器",
        model: "HYD-ACT-500",
        category: "液压系统",
        subcategory: "执行器",
        manufacturer: "液压动力",
        specifications: {
          pressure: "3000 PSI",
          flow: "15 GPM",
          temperature: "-40°C to +120°C",
          stroke: "100mm",
          force: "5000N",
          power: 2000
        },
        description: "高压液压执行器，用于飞行控制面操作",
        suppliers: Array.from(this.suppliers.keys()),
        price: 18000,
        stock: 12,
        qualityLevel: "military" as const,
        package: "Housing",
        operatingTemp: { min: -40, max: 120 },
        voltage: { min: 115, max: 230 },
        availability: "in_stock" as const,
        leadTime: 28,
        moq: 1
      },
      {
        name: "燃油流量传感器",
        model: "FUEL-FLOW-300",
        category: "燃油系统",
        subcategory: "传感器",
        manufacturer: "燃油技术",
        specifications: {
          flowRange: "0-500 L/min",
          accuracy: "±0.5%",
          pressure: "up to 100 bar",
          temperature: "-20°C to +80°C",
          output: "4-20mA",
          power: 12
        },
        description: "高精度燃油流量传感器，实时监测燃油消耗",
        suppliers: Array.from(this.suppliers.keys()).slice(0, 1),
        price: 6500,
        stock: 20,
        qualityLevel: "industrial" as const,
        package: "Threaded",
        operatingTemp: { min: -20, max: 80 },
        voltage: { min: 12, max: 24 },
        availability: "in_stock" as const,
        leadTime: 10,
        moq: 3
      },
      // 添加更多微控制器用于比对测试
      {
        name: "TI DSP控制器",
        model: "TMS320F28377D",
        category: "微控制器",
        subcategory: "DSP控制器",
        manufacturer: "Texas Instruments",
        specifications: {
          cores: 2,
          clockSpeed: 200,
          flash: 1024,
          ram: 204,
          adc: 16,
          power: 1.2,
          frequency: 200,
          accuracy: 0.1
        },
        description: "32位双核实时控制单元",
        suppliers: Array.from(this.suppliers.keys()),
        price: 28.50,
        stock: 100,
        qualityLevel: "space" as const,
        package: "LQFP-176",
        operatingTemp: { min: -40, max: 125 },
        voltage: { min: 3.0, max: 3.6 },
        availability: "in_stock" as const,
        leadTime: 7,
        moq: 100
      },
      {
        name: "ST ARM控制器",
        model: "STM32F767ZI",
        category: "微控制器",
        subcategory: "ARM Cortex-M7",
        manufacturer: "STMicroelectronics",
        specifications: {
          cores: 1,
          clockSpeed: 216,
          flash: 2048,
          ram: 512,
          adc: 24,
          power: 2.1,
          frequency: 216,
          accuracy: 0.15
        },
        description: "高性能ARM Cortex-M7 MCU",
        suppliers: Array.from(this.suppliers.keys()),
        price: 15.20,
        stock: 50,
        qualityLevel: "industrial" as const,
        package: "LQFP-144",
        operatingTemp: { min: -40, max: 85 },
        voltage: { min: 1.7, max: 3.6 },
        availability: "limited" as const,
        leadTime: 14,
        moq: 50
      },
      {
        name: "ADI DSP处理器",
        model: "ADSP-BF607",
        category: "微控制器",
        subcategory: "Blackfin DSP",
        manufacturer: "Analog Devices",
        specifications: {
          cores: 2,
          clockSpeed: 500,
          flash: 0,
          ram: 512,
          adc: 0,
          power: 3.5,
          frequency: 500,
          accuracy: 0.05
        },
        description: "双核Blackfin DSP处理器",
        suppliers: Array.from(this.suppliers.keys()),
        price: 45.80,
        stock: 25,
        qualityLevel: "military" as const,
        package: "LQFP-176",
        operatingTemp: { min: -55, max: 125 },
        voltage: { min: 1.2, max: 1.32 },
        availability: "in_stock" as const,
        leadTime: 21,
        moq: 25
      }
    ];

    components.forEach(component => {
      this.createComponent(component);
    });
  }

  private initializeDetailedSuppliers() {
    const detailedSuppliers = [
      {
        id: "SUP-AERO-001",
        name: "航宇电子有限公司",
        code: "AEROELEC",
        qualificationLevel: "A" as const,
        contactInfo: {
          primaryContact: {
            name: "张工程师",
            title: "技术总监",
            email: "zhang.engineer@aeroelec.com",
            phone: "+86-010-12345678",
            mobile: "+86-138-0001-0001"
          },
          technicalContact: {
            name: "李工程师",
            title: "质量经理",
            email: "li.tech@aeroelec.com",
            phone: "+86-010-12345679"
          },
          address: {
            street: "中关村大街1号",
            city: "北京",
            state: "北京市",
            country: "中国",
            postalCode: "100080",
            coordinates: {
              latitude: 39.9042,
              longitude: 116.4074
            }
          },
          website: "https://www.aeroelec.com",
          socialMedia: {
            linkedin: "https://linkedin.com/company/aeroelec"
          }
        },
        isActive: true,
        lastAuditDate: new Date('2024-06-15'),
        certifications: ["AS9100", "ISO9001", "ISO14001", "OHSAS18001", "GJB9001"],
        businessInfo: {
          registrationNumber: "91110000123456789A",
          taxId: "91110000123456789A",
          duns: "123456789",
          cageCode: "6ABC1",
          establishedYear: 2008,
          employeeCount: "201-1000",
          annualRevenue: "100M-1B"
        },
        capabilities: {
          productCategories: [
            "航空电子", "导航系统", "通信设备", "雷达系统", "飞控系统"
          ],
          services: [
            "系统集成", "定制开发", "测试验证", "技术支持", "维修服务"
          ],
          qualityStandards: [
            {
              standard: "AS9100D",
              certificationNumber: "AS9100-2024-001",
              validUntil: new Date('2027-06-15'),
              issuedBy: "CQC"
            },
            {
              standard: "GJB9001C",
              certificationNumber: "GJB-2024-002",
              validUntil: new Date('2027-05-20'),
              issuedBy: "军方质量监督部门"
            }
          ],
          radiationTesting: {
            hasCapability: true,
            testTypes: ["tid", "see", "dd"],
            accreditation: "CNAS-L5678"
          },
          spaceQualification: {
            hasExperience: true,
            programs: ["嫦娥工程", "天问一号", "载人航天"],
            certificationLevel: "宇航级"
          }
        },
        performance: {
          qualityRating: 4.8,
          deliveryRating: 4.6,
          serviceRating: 4.7,
          overallRating: 4.7,
          qualityScore: 96,
          defectRate: 0.02,
          onTimeDeliveryRate: 98.5,
          responseTime: 2,
          costCompetitiveness: 4.2
        },
        riskAssessment: {
          financialRisk: "low",
          operationalRisk: "low",
          complianceRisk: "low",
          supplyChainRisk: "medium",
          overallRisk: "low",
          lastRiskReview: new Date('2024-07-01')
        },
        contractInfo: {
          preferredTerms: {
            paymentTerms: "NET30",
            leadTime: 12,
            minimumOrder: 10,
            volume: "中批量"
          },
          activeContracts: [
            {
              contractNumber: "CT-2024-001",
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-12-31'),
              value: 50000000,
              currency: "CNY",
              status: "active"
            }
          ],
          totalContractValue: 150000000
        },
        metadata: {
          tags: ["航天", "军工", "A级"],
          notes: "长期合作伙伴，产品质量稳定，技术实力强",
          lastContactDate: new Date('2024-08-10'),
          nextReviewDate: new Date('2025-06-15'),
          createdBy: "system",
          lastModifiedBy: "admin"
        }
      },
      {
        id: "SUP-SPACE-002",
        name: "星际器件科技",
        code: "SPACETECH",
        qualificationLevel: "A" as const,
        contactInfo: {
          primaryContact: {
            name: "王总工",
            title: "首席技术官",
            email: "wang.cto@spacetech.com",
            phone: "+86-021-88888888",
            mobile: "+86-139-0002-0002"
          },
          address: {
            street: "浦东新区张江高科技园区",
            city: "上海",
            state: "上海市",
            country: "中国",
            postalCode: "201203"
          },
          website: "https://www.spacetech.com"
        },
        isActive: true,
        lastAuditDate: new Date('2024-05-20'),
        certifications: ["AS9100", "ISO9001", "ESCC", "NASA-STD"],
        businessInfo: {
          registrationNumber: "91310000987654321B",
          taxId: "91310000987654321B",
          duns: "987654321",
          cageCode: "7DEF2",
          establishedYear: 2012,
          employeeCount: "51-200",
          annualRevenue: "10M-100M"
        },
        capabilities: {
          productCategories: [
            "宇航器件", "辐射硬化器件", "功率器件", "传感器"
          ],
          services: [
            "辐射测试", "可靠性分析", "失效分析", "筛选试验"
          ],
          qualityStandards: [
            {
              standard: "ESCC Generic Specification",
              certificationNumber: "ESCC-2024-003",
              validUntil: new Date('2027-05-20'),
              issuedBy: "ESA"
            }
          ],
          radiationTesting: {
            hasCapability: true,
            testTypes: ["tid", "see", "dd", "neutron", "proton"],
            accreditation: "CNAS-L9999"
          },
          spaceQualification: {
            hasExperience: true,
            programs: ["北斗导航", "高分卫星", "通信卫星"],
            certificationLevel: "宇航级"
          }
        },
        performance: {
          qualityRating: 4.9,
          deliveryRating: 4.5,
          serviceRating: 4.8,
          overallRating: 4.7,
          qualityScore: 98,
          defectRate: 0.01,
          onTimeDeliveryRate: 95.2,
          responseTime: 1.5,
          costCompetitiveness: 3.8
        },
        riskAssessment: {
          financialRisk: "low",
          operationalRisk: "low",
          complianceRisk: "low",
          supplyChainRisk: "low",
          overallRisk: "low",
          lastRiskReview: new Date('2024-06-01')
        },
        contractInfo: {
          preferredTerms: {
            paymentTerms: "NET45",
            leadTime: 16,
            minimumOrder: 5,
            volume: "小批量专业"
          },
          activeContracts: [
            {
              contractNumber: "CT-2024-002",
              startDate: new Date('2024-03-01'),
              endDate: new Date('2025-02-28'),
              value: 25000000,
              currency: "CNY",
              status: "active"
            }
          ],
          totalContractValue: 80000000
        },
        metadata: {
          tags: ["宇航", "辐射硬化", "专业"],
          notes: "专业宇航器件供应商，辐射测试能力强",
          lastContactDate: new Date('2024-08-05'),
          nextReviewDate: new Date('2025-05-20'),
          createdBy: "system",
          lastModifiedBy: "admin"
        }
      },
      {
        id: "SUP-COMM-003",
        name: "工业电子集团",
        code: "INDUELEC",
        qualificationLevel: "B" as const,
        contactInfo: {
          primaryContact: {
            name: "陈经理",
            title: "销售总监",
            email: "chen.sales@induelec.com",
            phone: "+86-0755-33333333",
            mobile: "+86-135-0003-0003"
          },
          address: {
            street: "科技园南区",
            city: "深圳",
            state: "广东省",
            country: "中国",
            postalCode: "518057"
          },
          website: "https://www.induelec.com"
        },
        isActive: true,
        lastAuditDate: new Date('2024-03-15'),
        certifications: ["ISO9001", "ISO14001", "TS16949"],
        businessInfo: {
          registrationNumber: "91440000567890123C",
          taxId: "91440000567890123C",
          duns: "567890123",
          cageCode: "8GHI3",
          establishedYear: 2005,
          employeeCount: "1000+",
          annualRevenue: "1B+"
        },
        capabilities: {
          productCategories: [
            "工业控制", "通信器件", "功率器件", "连接器"
          ],
          services: [
            "批量生产", "定制服务", "供应链管理", "物流配送"
          ],
          qualityStandards: [
            {
              standard: "ISO9001:2015",
              certificationNumber: "ISO-2024-004",
              validUntil: new Date('2027-03-15'),
              issuedBy: "SGS"
            }
          ],
          radiationTesting: {
            hasCapability: false,
            testTypes: [],
            accreditation: ""
          },
          spaceQualification: {
            hasExperience: false,
            programs: [],
            certificationLevel: "工业级"
          }
        },
        performance: {
          qualityRating: 4.2,
          deliveryRating: 4.4,
          serviceRating: 4.3,
          overallRating: 4.3,
          qualityScore: 84,
          defectRate: 0.05,
          onTimeDeliveryRate: 92.8,
          responseTime: 4,
          costCompetitiveness: 4.6
        },
        riskAssessment: {
          financialRisk: "low",
          operationalRisk: "medium",
          complianceRisk: "low",
          supplyChainRisk: "medium",
          overallRisk: "medium",
          lastRiskReview: new Date('2024-04-01')
        },
        contractInfo: {
          preferredTerms: {
            paymentTerms: "NET60",
            leadTime: 8,
            minimumOrder: 100,
            volume: "大批量"
          },
          activeContracts: [
            {
              contractNumber: "CT-2024-003",
              startDate: new Date('2024-01-15'),
              endDate: new Date('2024-12-15'),
              value: 120000000,
              currency: "CNY",
              status: "active"
            }
          ],
          totalContractValue: 500000000
        },
        metadata: {
          tags: ["工业", "大批量", "成本优势"],
          notes: "大型工业电子供应商，批量优势明显",
          lastContactDate: new Date('2024-08-01'),
          nextReviewDate: new Date('2025-03-15'),
          createdBy: "system",
          lastModifiedBy: "admin"
        }
      },
      {
        id: "SUP-TEST-004",
        name: "可靠性测试中心",
        code: "RELITEST",
        qualificationLevel: "B" as const,
        contactInfo: {
          primaryContact: {
            name: "刘博士",
            title: "技术总监",
            email: "liu.dr@relitest.com",
            phone: "+86-029-66666666",
            mobile: "+86-136-0004-0004"
          },
          address: {
            street: "高新技术开发区",
            city: "西安",
            state: "陕西省",
            country: "中国",
            postalCode: "710075"
          },
          website: "https://www.relitest.com"
        },
        isActive: true,
        lastAuditDate: new Date('2024-04-10'),
        certifications: ["CNAS", "CMA", "ISO17025"],
        businessInfo: {
          registrationNumber: "91610000345678901D",
          taxId: "91610000345678901D",
          duns: "345678901",
          cageCode: "9JKL4",
          establishedYear: 2015,
          employeeCount: "11-50",
          annualRevenue: "1M-10M"
        },
        capabilities: {
          productCategories: [
            "测试服务", "认证服务", "技术咨询"
          ],
          services: [
            "辐射测试", "环境试验", "可靠性测试", "EMC测试", "安全测试"
          ],
          qualityStandards: [
            {
              standard: "ISO17025:2017",
              certificationNumber: "CNAS-L1234",
              validUntil: new Date('2027-04-10'),
              issuedBy: "CNAS"
            }
          ],
          radiationTesting: {
            hasCapability: true,
            testTypes: ["tid", "see", "dd", "neutron"],
            accreditation: "CNAS-L1234"
          },
          spaceQualification: {
            hasExperience: true,
            programs: ["载人航天测试", "卫星器件认证"],
            certificationLevel: "测试认证"
          }
        },
        performance: {
          qualityRating: 4.6,
          deliveryRating: 4.1,
          serviceRating: 4.5,
          overallRating: 4.4,
          qualityScore: 92,
          defectRate: 0.01,
          onTimeDeliveryRate: 88.5,
          responseTime: 3,
          costCompetitiveness: 3.5
        },
        riskAssessment: {
          financialRisk: "medium",
          operationalRisk: "low",
          complianceRisk: "low",
          supplyChainRisk: "low",
          overallRisk: "low",
          lastRiskReview: new Date('2024-05-01')
        },
        contractInfo: {
          preferredTerms: {
            paymentTerms: "NET30",
            leadTime: 4,
            minimumOrder: 1,
            volume: "按项目"
          },
          activeContracts: [
            {
              contractNumber: "CT-2024-004",
              startDate: new Date('2024-02-01'),
              endDate: new Date('2025-01-31'),
              value: 5000000,
              currency: "CNY",
              status: "active"
            }
          ],
          totalContractValue: 15000000
        },
        metadata: {
          tags: ["测试", "认证", "专业服务"],
          notes: "专业测试认证机构，技术能力强",
          lastContactDate: new Date('2024-07-20'),
          nextReviewDate: new Date('2025-04-10'),
          createdBy: "system",
          lastModifiedBy: "admin"
        }
      },
      {
        id: "SUP-NEW-005",
        name: "创新科技有限公司",
        code: "INNOVTECH",
        qualificationLevel: "C" as const,
        contactInfo: {
          primaryContact: {
            name: "孙工程师",
            title: "项目经理",
            email: "sun.pm@innovtech.com",
            phone: "+86-028-77777777",
            mobile: "+86-137-0005-0005"
          },
          address: {
            street: "天府新区创新大道",
            city: "成都",
            state: "四川省",
            country: "中国",
            postalCode: "610213"
          },
          website: "https://www.innovtech.com"
        },
        isActive: true,
        lastAuditDate: new Date('2024-02-01'),
        certifications: ["ISO9001"],
        businessInfo: {
          registrationNumber: "91510000234567890E",
          taxId: "91510000234567890E",
          duns: "234567890",
          cageCode: "1MNO5",
          establishedYear: 2020,
          employeeCount: "11-50",
          annualRevenue: "<1M"
        },
        capabilities: {
          productCategories: [
            "新兴技术", "原型开发", "小批量定制"
          ],
          services: [
            "原型开发", "快速迭代", "技术创新", "小批量生产"
          ],
          qualityStandards: [
            {
              standard: "ISO9001:2015",
              certificationNumber: "ISO-2024-005",
              validUntil: new Date('2027-02-01'),
              issuedBy: "CQC"
            }
          ],
          radiationTesting: {
            hasCapability: false,
            testTypes: [],
            accreditation: ""
          },
          spaceQualification: {
            hasExperience: false,
            programs: [],
            certificationLevel: "商业级"
          }
        },
        performance: {
          qualityRating: 3.8,
          deliveryRating: 3.5,
          serviceRating: 4.0,
          overallRating: 3.8,
          qualityScore: 76,
          defectRate: 0.08,
          onTimeDeliveryRate: 85.2,
          responseTime: 1,
          costCompetitiveness: 4.2
        },
        riskAssessment: {
          financialRisk: "high",
          operationalRisk: "medium",
          complianceRisk: "medium",
          supplyChainRisk: "high",
          overallRisk: "high",
          lastRiskReview: new Date('2024-03-01')
        },
        contractInfo: {
          preferredTerms: {
            paymentTerms: "预付50%",
            leadTime: 6,
            minimumOrder: 1,
            volume: "小批量"
          },
          activeContracts: [
            {
              contractNumber: "CT-2024-005",
              startDate: new Date('2024-05-01'),
              endDate: new Date('2024-11-30'),
              value: 800000,
              currency: "CNY",
              status: "active"
            }
          ],
          totalContractValue: 2000000
        },
        metadata: {
          tags: ["创新", "快速响应", "高风险"],
          notes: "新兴技术公司，创新能力强但风险较高",
          lastContactDate: new Date('2024-07-15'),
          nextReviewDate: new Date('2025-02-01'),
          createdBy: "system",
          lastModifiedBy: "admin"
        }
      }
    ];

    detailedSuppliers.forEach(supplier => {
      this.suppliers.set(supplier.id, {
        ...supplier,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // 初始化示例鉴定数据
    this.initializeIdentificationData();
    
    // 初始化数字模型数据
    this.initializeDigitalModels();
  }

  /**
   * 加载持久化数据
   */
  private loadPersistedData(data: any): void {
    try {
      // 加载数字模型数据
      if (data.digitalModels && Array.isArray(data.digitalModels)) {
        this.digitalModels = data.digitalModels;
      }

      // 加载组件数据
      if (data.components && Array.isArray(data.components)) {
        this.components.clear();
        data.components.forEach((component: Component) => {
          this.components.set(component.id, component);
        });
      }

      // 加载供应商数据
      if (data.suppliers && Array.isArray(data.suppliers)) {
        this.suppliers.clear();
        data.suppliers.forEach((supplier: Supplier) => {
          this.suppliers.set(supplier.id, supplier);
        });
      }

      // 加载鉴定数据
      if (data.identifications && Array.isArray(data.identifications)) {
        this.identifications.clear();
        data.identifications.forEach((identification: Identification) => {
          this.identifications.set(identification.id, identification);
        });
      }

      console.log('✅ 成功加载持久化数据', {
        digitalModels: this.digitalModels.length,
        components: this.components.size,
        suppliers: this.suppliers.size,
        identifications: this.identifications.size
      });
    } catch (error) {
      console.error('❌ 加载持久化数据失败:', error);
      // 如果加载失败，回退到默认数据
      this.initializeDefaultData();
    }
  }

  /**
   * 手动触发数据保存
   */
  public saveToStorage(): void {
    try {
      const { persistentStorage } = require('./persistentStorage');
      persistentStorage.manualSave();
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  }

  private initializeIdentificationData(): void {
    const sampleIdentifications = [
      {
        identificationId: "ID-2024-001",
        componentPartNumber: "TMS320F28377D",
        manufacturer: "Texas Instruments",
        componentName: "TI DSP控制器",
        description: "32位双核实时控制单元",
        sampleInfo: {
          quantity: 10,
          batchNumber: "LOT-2024-A001",
          sampleDate: new Date('2024-07-01'),
          sourceSupplier: "航宇电子有限公司"
        },
        testItems: [
          {
            testType: "功能测试",
            testMethod: "MIL-STD-883",
            parameters: { testVoltage: "3.3V", temperature: "25°C" },
            status: "pass" as const,
            result: { performance: "符合规格" },
            notes: "所有功能测试均通过"
          },
          {
            testType: "环境测试",
            testMethod: "MIL-STD-810",
            parameters: { tempRange: "-40°C to +125°C" },
            status: "pass" as const,
            result: { stability: "优秀" },
            notes: "温度循环测试通过"
          }
        ],
        testResults: {
          totalItems: 2,
          passedItems: 2,
          failedItems: 0,
          conditionalItems: 0,
          overallStatus: "qualified" as const
        },
        qualityAssessment: {
          qualityLevel: "space" as const,
          riskLevel: "low" as const,
          recommendation: "推荐用于航天应用",
          notes: "器件质量稳定，性能优异"
        },
        reportInfo: {
          reportNumber: "RPT-2024-001",
          reportDate: new Date('2024-07-15'),
          reviewer: "张工程师",
          approver: "李总工",
          organization: "航天器件鉴定中心"
        },
        validity: {
          isValid: true,
          expiryDate: new Date('2026-07-15'),
          renewalRequired: false
        }
      },
      {
        identificationId: "ID-2024-002",
        componentPartNumber: "STM32F767ZI",
        manufacturer: "STMicroelectronics",
        componentName: "ST ARM控制器",
        description: "高性能ARM Cortex-M7 MCU",
        sampleInfo: {
          quantity: 5,
          batchNumber: "LOT-2024-B002",
          sampleDate: new Date('2024-06-15'),
          sourceSupplier: "星际器件科技"
        },
        testItems: [
          {
            testType: "功能测试",
            testMethod: "IEC-60747",
            parameters: { testVoltage: "3.3V", frequency: "216MHz" },
            status: "pass" as const,
            result: { performance: "优秀" },
            notes: "功能完全符合规格"
          },
          {
            testType: "EMI测试",
            testMethod: "MIL-STD-461",
            parameters: { frequency: "10kHz-18GHz" },
            status: "conditional" as const,
            result: { compliance: "部分通过" },
            notes: "某些频段需要额外屏蔽"
          }
        ],
        testResults: {
          totalItems: 2,
          passedItems: 1,
          failedItems: 0,
          conditionalItems: 1,
          overallStatus: "conditional" as const
        },
        qualityAssessment: {
          qualityLevel: "industrial" as const,
          riskLevel: "medium" as const,
          recommendation: "有条件使用，需要额外EMI防护",
          notes: "基本性能良好，EMI需要改善"
        },
        reportInfo: {
          reportNumber: "RPT-2024-002",
          reportDate: new Date('2024-06-30'),
          reviewer: "王工程师",
          approver: "刘总工",
          organization: "航天器件鉴定中心"
        },
        validity: {
          isValid: true,
          expiryDate: new Date('2026-06-30'),
          renewalRequired: true
        }
      }
    ];

    sampleIdentifications.forEach(identification => {
      this.createIdentification(identification);
    });
  }

  private initializeDigitalModels(): void {
    this.digitalModels = [
      {
        id: '1',
        modelId: 'MDL-2024-001',
        componentCategory: '模拟器件',
        componentName: '双运算放大器',
        modelSpecification: 'LM358',
        manufacturer: 'Texas Instruments',
        modelCategory: 'SPICE',
        modelPurpose: '低功耗运算放大器仿真',
        fileInfo: {
          fileName: 'LM358.lib',
          fileSize: 15360,
          fileFormat: 'SPICE',
          uploadDate: new Date('2024-01-15')
        },
        validation: {
          isValidated: true,
          validationResults: {
            accuracy: 95.5,
            frequencyRange: 'DC-1MHz',
            temperatureRange: '-40°C to +85°C',
            notes: '在典型工作条件下验证通过'
          }
        },
        modelInfo: {
          modelName: 'LM358 SPICE Model',
          modelType: 'SPICE',
          modelVersion: '1.2',
          description: 'LM358双运算放大器SPICE模型，适用于低功耗应用',
          keywords: ['运算放大器', '低功耗', '双通道']
        },
        versionControl: {
          version: '1.2',
          isLatest: true
        },
        sharing: {
          isPublic: true,
          accessLevel: 'public',
          downloadCount: 1250,
          rating: {
            averageRating: 4.5,
            ratingCount: 23
          }
        },
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        modelId: 'MDL-2024-002',
        componentCategory: '模拟器件',
        componentName: '高速运算放大器',
        modelSpecification: 'AD8066',
        manufacturer: 'Analog Devices',
        modelCategory: 'IBIS',
        modelPurpose: '高速信号完整性分析',
        fileInfo: {
          fileName: 'AD8066.ibs',
          fileSize: 8192,
          fileFormat: 'IBIS',
          uploadDate: new Date('2024-01-20')
        },
        validation: {
          isValidated: false,
          validationResults: {
            accuracy: 0,
            frequencyRange: '',
            temperatureRange: '',
            notes: ''
          }
        },
        modelInfo: {
          modelName: 'AD8066 IBIS Model',
          modelType: 'IBIS',
          modelVersion: '2.0',
          description: 'AD8066高速运算放大器IBIS模型',
          keywords: ['高速', '运算放大器', 'IBIS']
        },
        versionControl: {
          version: '2.0',
          isLatest: true
        },
        sharing: {
          isPublic: false,
          accessLevel: 'authorized',
          downloadCount: 45,
          rating: {
            averageRating: 0,
            ratingCount: 0
          }
        },
        createdAt: '2024-01-20'
      },
      {
        id: '3',
        modelId: 'MDL-2024-003',
        componentCategory: '数字器件',
        componentName: '微控制器',
        modelSpecification: 'STM32F103',
        manufacturer: 'STMicroelectronics',
        modelCategory: 'IBIS',
        modelPurpose: 'IO时序和信号完整性分析',
        fileInfo: {
          fileName: 'STM32F103.ibs',
          fileSize: 25600,
          fileFormat: 'IBIS',
          uploadDate: new Date('2024-01-25')
        },
        validation: {
          isValidated: true,
          validationResults: {
            accuracy: 92.8,
            frequencyRange: 'DC-100MHz',
            temperatureRange: '-40°C to +105°C',
            notes: '在工业级温度范围内验证通过'
          }
        },
        modelInfo: {
          modelName: 'STM32F103 IBIS Model',
          modelType: 'IBIS',
          modelVersion: '1.5',
          description: 'STM32F103微控制器IBIS模型',
          keywords: ['微控制器', 'ARM', '数字器件']
        },
        versionControl: {
          version: '1.5',
          isLatest: true
        },
        sharing: {
          isPublic: true,
          accessLevel: 'public',
          downloadCount: 890,
          rating: {
            averageRating: 4.2,
            ratingCount: 15
          }
        },
        createdAt: '2024-01-25'
      },
      {
        id: '4',
        modelId: 'MDL-2024-004',
        componentCategory: '功率器件',
        componentName: 'MOSFET',
        modelSpecification: 'IRF540N',
        manufacturer: 'Infineon',
        modelCategory: 'SPICE',
        modelPurpose: '功率开关电路仿真',
        fileInfo: {
          fileName: 'IRF540N.lib',
          fileSize: 12800,
          fileFormat: 'SPICE',
          uploadDate: new Date('2024-02-01')
        },
        validation: {
          isValidated: true,
          validationResults: {
            accuracy: 98.2,
            frequencyRange: 'DC-10MHz',
            temperatureRange: '-55°C to +175°C',
            notes: '在扩展温度范围内验证通过'
          }
        },
        modelInfo: {
          modelName: 'IRF540N SPICE Model',
          modelType: 'SPICE',
          modelVersion: '2.1',
          description: 'IRF540N N沟道功率MOSFET SPICE模型',
          keywords: ['MOSFET', '功率器件', '开关']
        },
        versionControl: {
          version: '2.1',
          isLatest: true
        },
        sharing: {
          isPublic: true,
          accessLevel: 'registered',
          downloadCount: 567,
          rating: {
            averageRating: 4.7,
            ratingCount: 8
          }
        },
        createdAt: '2024-02-01'
      }
    ];
  }
}

// 创建并导出实例
export const memoryStorage = MemoryStorage.getInstance();