import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Row,
  Col,
  Tooltip,
  Modal,
  Descriptions,
  Alert,
  message,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  SwapOutlined,
  ShoppingCartOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
// import { componentAPI } from '@/services/api';
import type { Component } from '@/types';
import ParameterRangeFilter from '@/components/ParameterRangeFilter';
import ComponentCompareModal from '@/components/ComponentCompareModal';
import CategoryFilter from '@/components/CategoryFilter';
import {
  exportParametersToCSV,
  downloadCSV,
  generateDynamicParameterColumns,
} from '@/utils/parameterUtils';
import type { ParameterDefinition } from '@/utils/parameterUtils';
import type { ColumnsType } from 'antd/es/table';
import httpClient from '@/utils/httpClient';

const { Option } = Select;

// 分类名称到 familyPath 的映射（基于首页的分类定义）
const categoryToFamilyPathMap: Record<string, string[]> = {
  '电阻器': ['Resistors'],
  '电容器': ['Capacitors'],
  '连接器': ['Connectors'],
  '晶振与振荡器': ['Crystals and Oscillators'],
  '开关': ['Switches'],
  '分立器件': ['Discretes'],
  '热敏电阻': ['Thermistors'],
  '微电路': ['Microcircuits'],
  '电缆组件': ['Cable Assemblies'],
  '电感器': ['Inductors'],
  '继电器': ['Relays'],
  '变压器': ['Transformers'],
  '滤波器': ['Filters'],
  '电线电缆': ['Wires and Cables'],
  '射频无源器件': ['RF Passive Components'],
  // 英文名称映射
  'Resistors': ['Resistors'],
  'Capacitors': ['Capacitors'],
  'Connectors': ['Connectors'],
  'Crystals and Oscillators': ['Crystals and Oscillators'],
  'Switches': ['Switches'],
  'Discretes': ['Discretes'],
  'Thermistors': ['Thermistors'],
  'Microcircuits': ['Microcircuits'],
  'Cable Assemblies': ['Cable Assemblies'],
  'Inductors': ['Inductors'],
  'Relays': ['Relays'],
  'Transformers': ['Transformers'],
  'Filters': ['Filters'],
  'Wires and Cables': ['Wires and Cables'],
  'RF Passive Components': ['RF Passive Components'],
};


// 主分类映射逻辑 - 对应11个主要分类 (暂时未使用)
/*
const getMainCategory = (component: any): string => {
  const category1 = component.category_1 || component.category || '';
  const categoryLower = category1.toLowerCase();

  // 1. 模拟单片集成电路
  if (categoryLower.includes('运算放大器') || categoryLower.includes('比较器') || 
      categoryLower.includes('模拟开关') || categoryLower.includes('电压基准') ||
      categoryLower.includes('analog') || categoryLower.includes('amplifier') ||
      categoryLower.includes('模拟')) {
    return '模拟单片集成电路';
  }

  // 2. 数字单片集成电路
  if (categoryLower.includes('微处理器') || categoryLower.includes('微控制器') || 
      categoryLower.includes('逻辑器件') || categoryLower.includes('存储器') ||
      categoryLower.includes('digital') || categoryLower.includes('processor') ||
      categoryLower.includes('microcontroller') || categoryLower.includes('memory') ||
      categoryLower.includes('数字') || categoryLower.includes('dsp')) {
    return '数字单片集成电路';
  }

  // 3. 混合集成电路
  if (categoryLower.includes('混合') || categoryLower.includes('hybrid')) {
    return '混合集成电路';
  }

  // 4. 半导体分立器件
  if (categoryLower.includes('二极管') || categoryLower.includes('三极管') || 
      categoryLower.includes('晶体管') || categoryLower.includes('场效应管') ||
      categoryLower.includes('diode') || categoryLower.includes('transistor') ||
      categoryLower.includes('分立')) {
    return '半导体分立器件';
  }

  // 5. 固态微波器件与电路
  if (categoryLower.includes('微波') || categoryLower.includes('射频') || 
      categoryLower.includes('rf') || categoryLower.includes('microwave')) {
    return '固态微波器件与电路';
  }

  // 6. 真空电子器件
  if (categoryLower.includes('真空管') || categoryLower.includes('电子管') || 
      categoryLower.includes('vacuum') || categoryLower.includes('tube')) {
    return '真空电子器件';
  }

  // 7. 光电子器件
  if (categoryLower.includes('光电') || categoryLower.includes('激光') || 
      categoryLower.includes('led') || categoryLower.includes('photodiode') ||
      categoryLower.includes('optical') || categoryLower.includes('laser')) {
    return '光电子器件';
  }

  // 8. 机电组件
  if (categoryLower.includes('继电器') || categoryLower.includes('开关') || 
      categoryLower.includes('连接器') || categoryLower.includes('relay') ||
      categoryLower.includes('connector') || categoryLower.includes('switch') ||
      categoryLower.includes('机电')) {
    return '机电组件';
  }

  // 9. 电能源
  if (categoryLower.includes('电源') || categoryLower.includes('电池') || 
      categoryLower.includes('power') || categoryLower.includes('battery') ||
      categoryLower.includes('供电') || categoryLower.includes('充电')) {
    return '电能源';
  }

  // 10. 通用与特种元件
  if (categoryLower.includes('传感器') || categoryLower.includes('晶振') || 
      categoryLower.includes('电阻') || categoryLower.includes('电容') ||
      categoryLower.includes('sensor') || categoryLower.includes('crystal') ||
      categoryLower.includes('resistor') || categoryLower.includes('capacitor') ||
      categoryLower.includes('通用') || categoryLower.includes('特种')) {
    return '通用与特种元件';
  }

  // 11. 微系统
  if (categoryLower.includes('mems') || categoryLower.includes('微系统') || 
      categoryLower.includes('微机电') || categoryLower.includes('microsystem')) {
    return '微系统';
  }

  // 默认分类 - 根据数据来源推测
  return '模拟单片集成电路';
};
*/

interface RadiationSensitivityItem {
  key: string;
  parameterKey?: string;
  name: string;
  shortName?: string;
  value: string;
}

const normalizeRadiationKeySegment = (value?: string): string => {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const deriveRadiationParameterKey = (radiationEntry: any): string | undefined => {
  if (!radiationEntry) return undefined;
  const explicitKey = radiationEntry?.key || radiationEntry?.parameter_key;
  if (explicitKey && typeof explicitKey === 'string' && explicitKey.trim()) {
    return explicitKey.trim();
  }
  const candidateName =
    radiationEntry?.name ||
    radiationEntry?.parameter_name ||
    radiationEntry?.shortName ||
    radiationEntry?.short_name;
  const normalized = normalizeRadiationKeySegment(candidateName);
  return normalized ? `radiation_${normalized}` : undefined;
};

// 器件数据类型定义 - 使用导入的类型，但添加一些额外字段用于向后兼容
interface ComponentWithUI extends Omit<Component, 'qualityLevel' | 'lifecycle'> {
  mainCategory?: string; // 主分类（如：航空电子、处理器、集成电路）
  primaryCategory?: string;  // 一级分类（如：运算放大器类、电源管理类）
  secondaryCategory?: string; // 二级分类（如：精密运算放大器、线性稳压器(LDO)）
  package?: string;
  top?: string;
  qualityLevel?: string; // 覆盖为string类型以支持中文
  lifecycle?: string; // 覆盖为string类型以支持中文
  standards?: string[];
  functionalPerformance?: string; // 功能性能
  referencePrice?: number; // 参考价格
  parameters?: {
    voltage?: string;
    current?: string;
    power?: string;
    temperature?: string;
    frequency?: string;
    [key: string]: any; // 允许其他参数
  };
  parameterDefinitions?: Array<{
    parameter_key: string;
    name: string;
    short_name: string;
    category: string;
    example: string;
    value?: any; // 参数值
  }>;
  suppliers?: Array<{
    name: string;
    price: number;
    stock: number;
    leadTime: string;
  }>;
  component_id?: string; // DoEEEt组件ID
  radiationSensitivity?: RadiationSensitivityItem[];
}

interface DetailParameter {
  key: string;
  name: string;
  category?: string;
  displayValue: string;
}

const ComponentSearch: React.FC = () => {
  // 轻量HTML清理函数已不再使用（详情参数改为横向表展示，标题处理交由 parameterUtils 完成）

  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  /**
   * 推断 source 参数
   * 1. 优先从 URL 的 searchParams 读取 source
   * 2. 若缺失，尝试从其他线索推断：
   *    - 检查 referrer 是否来自国产供应商搜索页面
   *    - 检查 URL 中是否有其他标识（如 category 是国产分类）
   *    - 如果 URL 中有 manufacturer 参数但没有 source，可能是从供应商搜索进入
   *    - 如果无法确定，默认使用 'import'
   */
  const source = useMemo((): 'import' | 'domestic' => {
    // 1. 优先从 URL 参数读取
    const urlSource = searchParams.get('source') as 'import' | 'domestic' | null;
    if (urlSource === 'import' || urlSource === 'domestic') {
      return urlSource;
    }
    
    // 2. 如果 URL 没有 source，尝试从其他线索推断
    const manufacturer = searchParams.get('manufacturer');
    const category = searchParams.get('category');
    
    // 检查 referrer 是否来自国产供应商搜索页面
    // 注意：referrer 可能为空（直接访问、隐私模式等）
    if (typeof document !== 'undefined' && document.referrer) {
      const referrer = document.referrer.toLowerCase();
      // 如果 referrer 包含国产供应商搜索相关的路径，推断为 domestic
      if (referrer.includes('domestic') || referrer.includes('国产')) {
        return 'domestic';
      }
    }
    
    // 3. 如果 URL 中有 manufacturer 参数但没有 source，可能是从供应商搜索进入
    // 注意：这里无法直接判断是国产还是进口供应商，需要通过搜索结果来判断
    // 但为了确保分类树正确显示，如果明确是从"国产供应商搜索"进入，
    // 应该在进入时设置 source='domestic'
    // 如果 URL 中没有 source，且无法明确判断，默认使用 'import'
    
    // 默认返回 'import'
    return 'import';
  }, [searchParams]);
  
  // 用于存储推断出的 source（基于搜索结果）
  const [inferredSourceFromResults, setInferredSourceFromResults] = useState<'import' | 'domestic' | null>(null);
  
  // 最终的 source：优先使用 URL 中的 source，但如果搜索结果明确显示是另一种类型，则使用推断的 source
  const finalSource = useMemo((): 'import' | 'domestic' => {
    const urlSource = searchParams.get('source') as 'import' | 'domestic' | null;
    
    // 如果已经从搜索结果推断出 source，优先使用推断的结果（因为搜索结果更准确）
    if (inferredSourceFromResults) {
      console.log('[ComponentSearch] Using inferred source from results:', inferredSourceFromResults);
      // 如果 URL 中的 source 与推断的不一致，更新 URL
      if (urlSource !== inferredSourceFromResults) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('source', inferredSourceFromResults);
        setSearchParams(newParams, { replace: true });
      }
      return inferredSourceFromResults;
    }
    
    // 如果 URL 中有 source，使用 URL 中的值
    if (urlSource === 'import' || urlSource === 'domestic') {
      console.log('[ComponentSearch] Using source from URL:', urlSource);
      return urlSource;
    }
    
    // 默认使用推断的 source
    console.log('[ComponentSearch] Using default source:', source);
    return source;
  }, [searchParams, inferredSourceFromResults, source, setSearchParams]);
  
  // 当 finalSource 变化时，确保 URL 中的 source 参数与 finalSource 一致
  useEffect(() => {
    const urlSource = searchParams.get('source') as 'import' | 'domestic' | null;
    if (urlSource !== finalSource) {
      // 如果 URL 中的 source 与 finalSource 不一致，更新 URL
      const newParams = new URLSearchParams(searchParams);
      if (finalSource === 'domestic') {
        newParams.set('source', 'domestic');
      } else {
        newParams.set('source', 'import');
      }
      setSearchParams(newParams, { replace: true });
      console.log('[ComponentSearch] Updated URL source parameter to:', finalSource);
    }
  }, [finalSource, searchParams, setSearchParams]);
  
  const isDomestic = finalSource === 'domestic';
  
  /**
   * 将分类名称转换为 familyPath
   * @param categoryName 分类名称（中文或英文）
   * @returns familyPath 数组，如果找不到则返回空数组
   */
  const getFamilyPathFromCategory = (categoryName: string): string[] => {
    if (isDomestic) {
      return categoryName ? [categoryName] : [];
    }
    if (!categoryName) return [];
    // 直接查找映射
    if (categoryToFamilyPathMap[categoryName]) {
      return categoryToFamilyPathMap[categoryName];
    }
    // 如果找不到，返回空数组（表示不过滤）
    return [];
  };
  
  const [components, setComponents] = useState<ComponentWithUI[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentWithUI | null>(null);
  const [detailParameters, setDetailParameters] = useState<DetailParameter[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const parameterGroups = useMemo(() => {
    if (!detailParameters || detailParameters.length === 0) {
      return [];
    }

    const groups = detailParameters.reduce<Map<string, DetailParameter[]>>((acc, param) => {
      const category = (param.category && param.category.trim()) || '通用参数';
      if (!acc.has(category)) {
        acc.set(category, []);
      }
      acc.get(category)!.push(param);
      return acc;
    }, new Map());

    return Array.from(groups.entries()).map(([category, params]) => ({
      category,
      params: [...params].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')),
    }));
  }, [detailParameters]);
  const hasSuppliers = useMemo(
    () => (selectedComponent?.suppliers?.length ?? 0) > 0,
    [selectedComponent]
  );
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 修改为每页10个，参考DoEEEt网站
  const [form] = Form.useForm();
  const [parameterFilters, setParameterFilters] = useState<{ [key: string]: { min?: number; max?: number } }>({});
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [compareComponentIds, setCompareComponentIds] = useState<string[]>([]);
  // 统一受控的分页对象，确保分页UI（蓝色选中页）与状态强一致
  const [paginationState, setPaginationState] = useState<{ current: number; pageSize: number; total: number }>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // 新增：分类筛选和动态参数相关状态
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [parameterDefinitions, setParameterDefinitions] = useState<any[]>([]);
  const [dynamicColumns, setDynamicColumns] = useState<ColumnsType<ComponentWithUI>>([]);
  // 防抖与中断控制，避免重复请求导致后端抖动
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const renderRadiationSensitivityCell = (
    items?: RadiationSensitivityItem[],
    options?: { dense?: boolean }
  ) => {
    if (!items || items.length === 0) {
      return <span style={{ color: '#999' }}>-</span>;
    }
    const gap = options?.dense ? 4 : 6;
    const fontSize = options?.dense ? 12 : 13;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap }}>
        {items.map((item: RadiationSensitivityItem) => (
          <div
            key={item.key || item.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize,
              lineHeight: 1.3,
            }}
          >
            <span style={{ color: '#888' }}>{item.name}</span>
            <span style={{ fontWeight: 500, marginLeft: 12 }}>{item.value || '-'}</span>
          </div>
        ))}
      </div>
    );
  };

  // 获取页面标题和描述
  const getPageTitle = () => {
    const category = searchParams.get('category');
    
    // 如果有特定类别，显示类别名称
    if (category) {
      const categoryMap: Record<string, { title: string; desc: string }> = {
        'analog': { title: '模拟单片集成电路', desc: 'Analog Integrated Circuits - 运算放大器、电源管理、信号处理、数据转换等' },
        'digital': { title: '数字单片集成电路', desc: 'Digital Integrated Circuits - 微处理器、DSP、FPGA、存储器等' },
        'hybrid': { title: '混合集成电路', desc: 'Hybrid Integrated Circuits - 模拟数字混合、功率集成等' },
        'semiconductor': { title: '半导体分立器件', desc: 'Semiconductor Discrete Devices - 二极管、三极管、MOSFET等' },
        'microwave': { title: '固态微波器件与电路', desc: 'Solid-State Microwave Devices - 微波放大器、振荡器、混频器等' },
        'vacuum': { title: '真空电子器件', desc: 'Vacuum Electronic Devices - 电子管、显示器件等' },
        // 顶层类别（中文）
        '电阻器': { title: '电阻器', desc: 'Resistors - 固定电阻、可变电阻、网络电阵列等' },
        '电容器': { title: '电容器', desc: 'Capacitors - 陶瓷电容、钽电容、薄膜电容等' },
        '连接器': { title: '连接器', desc: 'Connectors - PCB连接器、D型连接器、射频连接器等' },
        '晶振与振荡器': { title: '晶振与振荡器', desc: 'Crystals and Oscillators - 晶体振荡器、石英晶体等' },
        '开关': { title: '开关', desc: 'Switches - 拨动开关、按键开关、旋转开关等' },
        '分立器件': { title: '分立器件', desc: 'Discretes - 二极管、三极管、场效应管、功率器件等' },
        '热敏电阻': { title: '热敏电阻', desc: 'Thermistors - NTC、RTD、热电阻等' },
        '微电路': { title: '微电路', desc: 'Microcircuits - 数字微电路、模拟微电路、外围控制器等' },
        '电缆组件': { title: '电缆组件', desc: 'Cable Assemblies - 射频电缆、微波电缆、连接线等' },
        '电感器': { title: '电感器', desc: 'Inductors - 功率电感、定制电感、RF电感等' },
        '继电器': { title: '继电器', desc: 'Relays - 混合继电器、电磁继电器、固态继电器等' },
        '变压器': { title: '变压器', desc: 'Transformers - 电源变压器、隔离变压器、脉冲变压器等' },
        '滤波器': { title: '滤波器', desc: 'Filters - 共模扼流圈、EMI滤波器、信号滤波器等' },
        '电线电缆': { title: '电线电缆', desc: 'Wires and Cables - 导线、电缆、屏蔽线等' },
        '射频无源器件': { title: '射频无源器件', desc: 'RF Passive Components - 同轴衰减器、负载、耦合器等' },
        // 顶层类别（英文）
        'Resistors': { title: '电阻器', desc: 'Resistors - 固定电阻、可变电阻、网络电阵列等' },
        'Capacitors': { title: '电容器', desc: 'Capacitors - 陶瓷电容、钽电容、薄膜电容等' },
        'Connectors': { title: '连接器', desc: 'Connectors - PCB连接器、D型连接器、射频连接器等' },
        'Crystals and Oscillators': { title: '晶振与振荡器', desc: 'Crystals and Oscillators - 晶体振荡器、石英晶体等' },
        'Switches': { title: '开关', desc: 'Switches - 拨动开关、按键开关、旋转开关等' },
        'Discretes': { title: '分立器件', desc: 'Discretes - 二极管、三极管、场效应管、功率器件等' },
        'Thermistors': { title: '热敏电阻', desc: 'Thermistors - NTC、RTD、热电阻等' },
        'Microcircuits': { title: '微电路', desc: 'Microcircuits - 数字微电路、模拟微电路、外围控制器等' },
        'Cable Assemblies': { title: '电缆组件', desc: 'Cable Assemblies - 射频电缆、微波电缆、连接线等' },
        'Inductors': { title: '电感器', desc: 'Inductors - 功率电感、定制电感、RF电感等' },
        'Relays': { title: '继电器', desc: 'Relays - 混合继电器、电磁继电器、固态继电器等' },
        'Transformers': { title: '变压器', desc: 'Transformers - 电源变压器、隔离变压器、脉冲变压器等' },
        'Filters': { title: '滤波器', desc: 'Filters - 共模扼流圈、EMI滤波器、信号滤波器等' },
        'Wires and Cables': { title: '电线电缆', desc: 'Wires and Cables - 导线、电缆、屏蔽线等' },
        'RF Passive Components': { title: '射频无源器件', desc: 'RF Passive Components - 同轴衰减器、负载、耦合器等' },
      };
      return categoryMap[category] || { title: '器件搜索', desc: 'Component Search - 全类别器件搜索' };
    }
    
    // 如果是从主页搜索或没有特定类别，显示全类别搜索
    return { title: '器件搜索', desc: 'Component Search - 全类别器件搜索，涵盖集成电路、航空电子、处理器等' };
  };

  const { title: pageTitle, desc: pageDesc } = getPageTitle();
  
  // 核心搜索函数（可被防抖包装），带请求中断，避免重复请求抖动
  const performSearch = useCallback(async (overridePage?: number, familyPathOverride?: string[]) => {
    // 中断上一次请求
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const formValues = form.getFieldsValue();
      
      // 构建DoEEEt API搜索参数
      const params = new URLSearchParams();
      
      // 关键词搜索（型号）
      if (formValues.partNumber) {
        params.append('partNumber', formValues.partNumber);
      }
      
      // 制造商筛选
      if (formValues.manufacturer) {
        params.append('manufacturer', formValues.manufacturer);
      }
      
      // 质量等级筛选
      if (formValues.qualityLevel) {
        params.append('qualityName', formValues.qualityLevel);
      }
      
      // 淘汰状态筛选
      if (formValues.obsolescenceType) {
        params.append('obsolescenceType', formValues.obsolescenceType);
      }
      
      // 参数范围筛选
      if (Object.keys(parameterFilters).length > 0) {
        params.append('parameters', JSON.stringify(parameterFilters));
      }
      
      // 分类路径筛选（新增）- 优先使用调用方传入的 familyPathOverride
      // 注意：数据库 family_path 存储为 叶子->父级，这里在提交前反转为叶子在前的顺序
      const rawFamilyPath = Array.isArray(familyPathOverride) ? familyPathOverride : selectedCategory;
      const familyPathToUse = Array.isArray(rawFamilyPath) ? rawFamilyPath : [];
      if (familyPathToUse.length > 0) {
        const dbFamilyPath = [...familyPathToUse].reverse(); // 叶子->父级
        params.append('familyPath', JSON.stringify(dbFamilyPath));
        console.log('搜索时使用的分类路径:', dbFamilyPath);
      }
      
      // 分页参数 - 优先使用传入的 overridePage，否则使用 currentPage 状态
      const pageToUse = overridePage !== undefined ? overridePage : currentPage;
      params.append('page', pageToUse.toString());
      params.append('limit', pageSize.toString());
      
      let finalUrl = `/api/doeeet/search?${params.toString()}`;

      // 国产数据走国产接口，字段映射简化
      if (isDomestic) {
        // 将分类转换为 level1/level2/level3（selectedCategory 为叶子->父级）
        const level1 = familyPathToUse[familyPathToUse.length - 1];
        const level2 = familyPathToUse.length > 1 ? familyPathToUse[familyPathToUse.length - 2] : undefined;
        const level3 = familyPathToUse.length > 2 ? familyPathToUse[0] : familyPathToUse[0] || undefined;
        params.delete('familyPath');
        if (level1) params.append('level1', level1);
        if (level2) params.append('level2', level2);
        if (level3) params.append('level3', level3);
        if (formValues.partNumber) {
          params.set('model', formValues.partNumber);
          params.set('keyword', formValues.partNumber);
        }
        finalUrl = `/api/domestic/search?${params.toString()}`;
      }

      console.log('搜索请求URL:', finalUrl);
      const data = await httpClient.get<any>(finalUrl, { timeoutMs: 60000, retries: 1, retryDelayMs: 800, signal: controller.signal });
      console.log('搜索响应结果(data):', data);
      
      if (data) {
        // 尝试从搜索结果推断 source（无论 URL 中是否有 source 参数）
        // 检查返回的数据结构：国产数据通常有 level1/level2/level3 字段
        const rawList = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.items)
              ? data.data.items
              : Array.isArray(data?.components)
                ? data.components
                : [];
        
        // 如果数据中有 level1/level2/level3 字段，推断为国产
        if (rawList.length > 0) {
          const firstItem = rawList[0];
          console.log('[ComponentSearch] First item from search results:', firstItem);
          if (firstItem && (firstItem.level1 || firstItem.level2 || firstItem.level3)) {
            // 推断为国产数据
            console.log('[ComponentSearch] Inferred as domestic from search results (has level1/level2/level3)');
            if (inferredSourceFromResults !== 'domestic') {
              setInferredSourceFromResults('domestic');
            }
          } else if (firstItem && (firstItem.family_path || firstItem.part_number)) {
            // 推断为进口数据（DoEEEt 数据通常有 family_path 或 part_number）
            console.log('[ComponentSearch] Inferred as import from search results (has family_path/part_number)');
            if (inferredSourceFromResults !== 'import') {
              setInferredSourceFromResults('import');
            }
          }
        }
        
        // 国产结果映射
        if (isDomestic) {
          const rawList = Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data?.data?.items)
                ? data.data.items
                : [];
          const paginationResp = data?.pagination || data?.data?.pagination;

          const adapted = rawList.map((item: any) => ({
            id: item._id || `${item.manufacturer || ''}-${item.model || item.name || ''}`,
            component_id: item._id,
            partNumber: item.model || item.name || '-',
            manufacturer: item.manufacturer || '国产厂商',
            mainCategory: item.level1 || '',
            primaryCategory: item.level2 || '',
            secondaryCategory: item.level3 || '',
            package: item.package || '-',
            top: item.temperature_range || '',
            qualityLevel: item.quality || '',
            lifecycle: item.space_supply || '',
            standards: [],
            description: item.key_specs || '',
            functionalPerformance: `${item.level1 || ''} / ${item.level2 || ''}`.trim(),
            referencePrice: 0,
            parameters: {},
            radiationSensitivity: undefined,
            suppliers: [],
          }));
          setComponents(adapted);
          setParameterDefinitions([]);
          setDynamicColumns([]);
          const totalCount = typeof paginationResp?.total === 'number'
            ? paginationResp.total
            : (typeof data?.total === 'number' ? data.total : adapted.length);
          const nextPage = typeof paginationResp?.page === 'number' ? paginationResp.page : pageToUse;
          setTotal(totalCount);
          setPaginationState(prev => ({ ...prev, total: totalCount, current: nextPage, pageSize }));
          setCurrentPage(nextPage);
          return;
        }

        const rawComponents = Array.isArray(data.components) ? data.components : [];

        // 保存候选参数定义，并生成横向动态列（Beta）
        let defs = Array.isArray(data.parameterDefinitions) ? data.parameterDefinitions : [];

        // 优先根据响应中的动态参数推导字段定义
        if (!defs || defs.length === 0) {
          const derivedDefsMap = new Map<string, any>();
          rawComponents.forEach((entry: any) => {
            const dynamicParams = Array.isArray(entry?.dynamic) ? entry.dynamic : [];
            dynamicParams.forEach((param: any) => {
              const key = param?.key || param?.parameter_key;
              if (!key || derivedDefsMap.has(key)) return;
              derivedDefsMap.set(key, {
                parameter_key: key,
                name: param?.name || param?.parameter_name || key,
                short_name: param?.shortName || param?.short_name,
                category: param?.category,
                example: param?.example,
              });
            });
          });
          if (derivedDefsMap.size > 0) {
            defs = Array.from(derivedDefsMap.values());
          }
        }

        // 兜底：若仍未获取 parameterDefinitions，则基于 familyPath 再拉取一次定义
        if ((!defs || defs.length === 0) && familyPathToUse.length > 0) {
          try {
            // 先根据 familyPath 获取分类元数据（包含参数 key 列表）
            const encodedPath = encodeURIComponent(JSON.stringify(familyPathToUse));
            const meta = await httpClient.get<any>(`/api/doeeet/category-meta/${encodedPath}`, { timeoutMs: 20000 });
            const metaKeys: string[] = Array.isArray(meta?.meta) ? meta.meta.map((m: any) => m.key).filter(Boolean) : [];

            if (metaKeys.length > 0) {
              const keysParam = metaKeys.join(',');
              const defsResp = await httpClient.get<any>(`/api/doeeet/parameter-definitions?keys=${encodeURIComponent(keysParam)}`, { timeoutMs: 20000 });
              if (Array.isArray(defsResp)) {
                defs = defsResp;
              }
            }
          } catch (e) {
            // 忽略兜底异常，继续使用静态列渲染
            console.warn('基于 familyPath 拉取参数定义失败，已回退为静态列: ', e);
          }
        }

        const baseDefinitions: ParameterDefinition[] = Array.isArray(defs) ? [...defs] : [];
        const definitionKeySet = new Set(
          baseDefinitions
            .map(def => def?.parameter_key)
            .filter((key): key is string => Boolean(key))
        );

        const radiationDefinitions: ParameterDefinition[] = [];
        rawComponents.forEach((entry: any) => {
          const radiationList = Array.isArray(entry?.radiation_sensitivity) ? entry.radiation_sensitivity : [];
          radiationList.forEach((rad: any) => {
            const parameterKey = deriveRadiationParameterKey(rad);
            if (!parameterKey || definitionKeySet.has(parameterKey)) {
              return;
            }
            if (radiationDefinitions.some(def => def.parameter_key === parameterKey)) {
              return;
            }
            const name =
              rad?.name ||
              rad?.parameter_name ||
              rad?.shortName ||
              rad?.short_name ||
              parameterKey;
            const shortName = rad?.shortName || rad?.short_name;
            const exampleSource = rad?.example ?? rad?.value ?? rad?.displayValue ?? rad?.text;
            radiationDefinitions.push({
              parameter_key: parameterKey,
              name,
              short_name: shortName,
              category: 'Radiation Sensitivity',
              example: typeof exampleSource === 'string' ? exampleSource : undefined,
            });
            definitionKeySet.add(parameterKey);
          });
        });

        const mergedDefinitions =
          radiationDefinitions.length > 0 ? [...baseDefinitions, ...radiationDefinitions] : baseDefinitions;

        setParameterDefinitions(mergedDefinitions);
        if (mergedDefinitions.length > 0) {
          setDynamicColumns(
            generateDynamicParameterColumns<ComponentWithUI>(mergedDefinitions, {
              columnWidth: 140,
              minColumnWidth: 90,
              ellipsis: true,
              sortable: true,
            })
          );
        } else {
          setDynamicColumns([]);
        }

        // 转换DoEEEt数据格式以兼容现有UI（支持新老结构）
        const adaptedComponents: ComponentWithUI[] = rawComponents.map((entry: any) => {
          const comp = entry?.static ? entry.static : entry;
          const fixedExtras = entry?.fixedExtras || [];
          const dynamic = Array.isArray(entry?.dynamic) ? entry.dynamic : [];
          const radiationSource = Array.isArray(entry?.radiation_sensitivity) ? entry.radiation_sensitivity : [];

          const normalizeForMatch = (value: string) =>
            value.toLowerCase().replace(/[\s_\-\/]+/g, '');

          const normalizeValue = (raw: any): string | undefined => {
            if (raw === null || raw === undefined) return undefined;
            if (typeof raw === 'string') {
              const trimmed = raw.trim();
              if (!trimmed || trimmed === '-' || trimmed === '--' || trimmed.toLowerCase() === 'n/a') {
                return undefined;
              }
              return trimmed;
            }
            if (typeof raw === 'number' || typeof raw === 'boolean') {
              return String(raw);
            }
            if (Array.isArray(raw)) {
              const joined = raw
                .map(item => normalizeValue(item))
                .filter((item): item is string => Boolean(item))
                .join(', ');
              return joined || undefined;
            }
            return String(raw);
          };

          const radiationSensitivity: RadiationSensitivityItem[] = radiationSource
            .map((rad: any, index: number) => {
              const normalized =
                normalizeValue(rad?.value ?? rad?.displayValue ?? rad?.text ?? rad?.example) ?? '-';
              const name =
                rad?.name ||
                rad?.shortName ||
                rad?.short_name ||
                rad?.parameter_name ||
                rad?.key ||
                'Radiation';
              const parameterKey = deriveRadiationParameterKey(rad);
              const listKey =
                parameterKey || `${comp?.component_id || comp?.part_number || 'component'}-rad-${index}`;
              return {
                key: listKey,
                parameterKey,
                name,
                shortName: rad?.shortName || rad?.short_name,
                value: normalized,
              };
            })
            .filter((item: RadiationSensitivityItem) => item.value !== '-');

          const findExtraValue = (keywords: string | string[]) => {
            const keywordList = Array.isArray(keywords) ? keywords : [keywords];
            const normalizedKeywords = keywordList
              .map(keyword => (typeof keyword === 'string' ? normalizeForMatch(keyword) : ''))
              .filter(Boolean);

            if (normalizedKeywords.length === 0) {
              return undefined;
            }

            for (const extra of fixedExtras) {
              const name = typeof extra?.name === 'string' ? extra.name : '';
              if (!name) continue;
              const normalizedName = normalizeForMatch(name);
              const hasMatch = normalizedKeywords.some(keyword => normalizedName.includes(keyword));
              if (!hasMatch) continue;

              const rawValue = extra?.value ?? extra?.displayValue ?? extra?.text ?? extra?.example ?? '';
              const stringValue = normalizeValue(rawValue);
              if (stringValue !== undefined) {
                return stringValue;
              }
            }
            return undefined;
          };

          // 解析 family_path
          let familyPathArray: string[] = [];
          const familyRaw = comp.family_path;
          if (Array.isArray(familyRaw)) {
            familyPathArray = familyRaw as string[];
          } else if (typeof familyRaw === 'string') {
            try {
              const normalized = familyRaw.replace(/'/g, '"');
              const parsed = JSON.parse(normalized);
              familyPathArray = Array.isArray(parsed) ? parsed : [familyRaw];
            } catch {
              familyPathArray = [familyRaw];
            }
          }

          // 分类（叶子->父级）
          const mainCategory = familyPathArray[familyPathArray.length - 1] || '未分类';
          const primaryCategory = familyPathArray.length >= 2 ? familyPathArray[familyPathArray.length - 2] : mainCategory;
          const secondaryCategory = familyPathArray.length >= 3 ? familyPathArray[familyPathArray.length - 3] : primaryCategory;

          // 动态参数映射为 parameters 字典（key → value）
          const parametersMap: Record<string, any> = {};
          dynamic.forEach((p: any) => {
            const key = p?.key || p?.parameter_key;
            if (key) {
              const value = p?.value ?? p?.displayValue ?? p?.text ?? null;
              parametersMap[key] = value;
            }
          });
          radiationSensitivity.forEach(item => {
            if (item.parameterKey && item.value) {
              parametersMap[item.parameterKey] = item.value;
            }
          });

          const findDynamicValue = (keywords: string[]) => {
            const normalizedKeywords = keywords
              .map(keyword => (typeof keyword === 'string' ? normalizeForMatch(keyword) : ''))
              .filter(Boolean);

            if (normalizedKeywords.length === 0) {
              return undefined;
            }

            for (const param of dynamic) {
              const candidateFields = [
                param?.key,
                param?.parameter_key,
                param?.name,
                param?.parameter_name,
                param?.shortName,
                param?.short_name,
              ].filter((field): field is string => typeof field === 'string' && field.length > 0);

              const hasMatch = candidateFields
                .map(field => normalizeForMatch(field))
                .some(normalizedField => normalizedKeywords.some(keyword => normalizedField.includes(keyword)));

              if (hasMatch) {
                const normalizedValue = normalizeValue(param?.value ?? param?.displayValue ?? param?.text ?? param?.example);
                if (normalizedValue !== undefined) {
                  return normalizedValue;
                }
              }
            }

            for (const [mapKey, mapValue] of Object.entries(parametersMap)) {
              const normalizedKey = normalizeForMatch(mapKey);
              if (normalizedKeywords.some(keyword => normalizedKey.includes(keyword))) {
                const normalizedValue = normalizeValue(mapValue);
                if (normalizedValue !== undefined) {
                  return normalizedValue;
                }
              }
            }

            return undefined;
          };

          // 固定扩展：Package 与 TOP
          const packageValue =
            findExtraValue('package') ??
            normalizeValue(comp.package) ??
            normalizeValue(comp.part_type) ??
            '-';

          const topValue =
            findExtraValue(['top', 'operating temperature range', 'operating temperature', 'operating temp', 'temperature range']) ??
            findDynamicValue(['operating temperature range', 'operating temperature', 'operating temp', 'temperature range', 'top']) ??
            normalizeValue(comp.top_marking) ??
            normalizeValue(comp.top) ??
            '';

          return {
            id: comp.component_id,
            component_id: comp.component_id,
            partNumber: comp.part_number,
            manufacturer: comp.manufacturer_name || '未知制造商',
            mainCategory,
            primaryCategory,
            secondaryCategory,
            package: packageValue,
            top: topValue,
            qualityLevel: comp.quality_name || '-',
            lifecycle: comp.obsolescence_type || 'Active',
            standards: comp.qpl_name ? [comp.qpl_name] : [],
            description: `${comp.part_type || ''} ${comp.qpl_name ? `- ${comp.qpl_name}` : ''}`.trim(),
            functionalPerformance: `${mainCategory} / ${primaryCategory}`,
            referencePrice: 0,
            parameters: parametersMap,
            radiationSensitivity,
            suppliers: []
          };
        });

        setComponents(adaptedComponents);
        const totalCount = typeof data.total === 'number'
          ? data.total
          : data.pagination?.total || (data.components ? data.components.length : 0);
        setTotal(totalCount);
        // 同步到受控分页对象
        setPaginationState(prev => ({ ...prev, total: totalCount }));
        
        // 更新页码：优先使用后端返回的 page（最准确），否则使用请求时使用的 pageToUse
        const finalPage = typeof data.page === 'number' 
          ? data.page 
          : pageToUse;
        setCurrentPage(finalPage);
        setPaginationState(prev => ({ ...prev, current: finalPage }));
        
        // 更新每页数量：优先使用后端返回的 limit，否则使用当前的 pageSize
        const finalLimit = typeof data.limit === 'number'
          ? data.limit
          : pageSize;
        setPageSize(finalLimit);
        setPaginationState(prev => ({ ...prev, pageSize: finalLimit }));
      } else {
        const msg = '未找到符合条件的组件';
        message.warning(msg);
        setComponents([]);
        setTotal(0);
        setPaginationState(prev => ({ ...prev, total: 0 }));
      }
    } catch (error: any) {
      // 若是主动取消/超时（Abort）则静默处理，避免噪音
      if (error?.code === 'TIMEOUT' || error?.name === 'AbortError') {
        // 仅在开发模式下记录调试信息
        if (process.env.NODE_ENV === 'development') {
          console.debug('搜索请求被取消（防抖优化）：', error?.message || error);
        }
        return;
      }
      console.error('搜索失败:', error);
      message.error(error?.message || '网络异常或服务器不可用，请稍后重试');
      // 失败时不再使用本地模拟数据，保持为空以避免误导
      setComponents([]);
      setTotal(0);
      setPaginationState(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, currentPage, pageSize, parameterFilters, form]);

  // 对外暴露的搜索函数：防抖 + 可选覆盖参数
  const handleSearch = useCallback(
    (overridePage?: number, familyPathOverride?: string[]) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => {
        performSearch(overridePage, familyPathOverride);
      }, 400);
    },
    [performSearch]
  );
  
  // 处理来自首页的搜索参数和分类过滤
  useEffect(() => {
    const query = searchParams.get('q');
    const manufacturer = searchParams.get('manufacturer');
    const category = searchParams.get('category');

    // 预先计算并保存将要设置的分类路径，避免异步 setState 导致闭包取旧值
    let initialFamilyPath: string[] = [];

    // 如果有分类参数，转换为 familyPath 并设置到 selectedCategory
    if (category) {
      if (isDomestic) {
        initialFamilyPath = [category];
        setSelectedCategory(initialFamilyPath);
      } else {
        initialFamilyPath = getFamilyPathFromCategory(category);
        if (initialFamilyPath.length > 0) {
          setSelectedCategory(initialFamilyPath);
        } else {
          // 如果找不到对应的 familyPath，清空 selectedCategory
          setSelectedCategory([]);
        }
      }
    } else {
      // 如果没有分类参数，清空 selectedCategory（不显示全局数据）
      setSelectedCategory([]);
    }

    // 设置表单值：根据不同的参数类型设置到对应的字段
    if (manufacturer) {
      // 供应商搜索：设置到 manufacturer 字段
      form.setFieldsValue({ manufacturer: manufacturer });
    } else if (query) {
      // 型号规格搜索：设置到 partNumber 字段
      form.setFieldsValue({ partNumber: query });
    }
    if (category) {
      form.setFieldsValue({ category: category });
    }

    // 如果有查询参数，需要手动触发搜索（因为可能没有分类，不会触发 selectedCategory 的 useEffect）
    if (query || manufacturer) {
      // 直接使用同步计算得到的 initialFamilyPath，避免使用可能尚未更新的 selectedCategory
      performSearch(undefined, initialFamilyPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, form]);

  // 监听分类筛选变化（仅处理分页与清空，不在此发起搜索，避免重复请求）
  useEffect(() => {
    // 只有当 selectedCategory 有值时，才自动触发搜索
    // 如果没有分类，不显示数据（符合用户要求：分类点进去后应该只显示对应的分类数据）
    if (selectedCategory.length > 0) {
      // 重置到第一页
      setCurrentPage(1);
    } else {
      // 如果没有分类，清空数据列表
      setComponents([]);
      setTotal(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  //（已移除本地模拟数据，避免误导实际检索效果）

  const handleReset = () => {
    // 重置表单字段
    form.resetFields();
    // 清空分类选择
    setSelectedCategory([]);
    // 清空参数筛选
    setParameterFilters({});
    // 重置分页状态
    setCurrentPage(1);
    setPageSize(10);
    setPaginationState({ current: 1, pageSize: 10, total: 0 });
    // 清空搜索结果
    setComponents([]);
    setTotal(0);
    // 清空动态列
    setDynamicColumns([]);
    setParameterDefinitions([]);
    // 清除 URL 参数，避免重置后重新触发搜索
    setSearchParams({});
  };

  const normalizeParameterValue = (rawValue: any): string => {
    if (rawValue === null || rawValue === undefined) {
      return '-';
    }

    if (Array.isArray(rawValue)) {
      return rawValue.length > 0 ? rawValue.join(', ') : '-';
    }

    if (typeof rawValue === 'number' || typeof rawValue === 'boolean') {
      return String(rawValue);
    }

    if (typeof rawValue === 'object') {
      const values = Object.values(rawValue);
      return values.length > 0 ? values.join(', ') : '-';
    }

    if (typeof rawValue === 'string') {
      const trimmed = rawValue.trim();
      if (!trimmed) {
        return '-';
      }
      try {
        const parsed = JSON.parse(trimmed.replace(/'/g, '"'));
        if (Array.isArray(parsed)) {
          return parsed.length > 0 ? parsed.join(', ') : '-';
        }
        if (typeof parsed === 'object' && parsed !== null) {
          const values = Object.values(parsed as Record<string, any>);
          return values.length > 0 ? values.join(', ') : trimmed;
        }
      } catch (err) {
        // 非 JSON 结构，直接返回原始字符串
      }
      return trimmed;
    }

    return '-';
  };

  const showDetail = async (component: ComponentWithUI) => {
    setSelectedComponent(component);
    setDetailParameters([]);
    setDetailLoading(true);
    setDetailModalVisible(true);

    if (isDomestic) {
      // 国产数据：使用已加载的基本信息展示
      const basicParams: DetailParameter[] = [];
      if (component.key_specs) {
        basicParams.push({ key: 'key_specs', name: '关键性能', displayValue: component.key_specs });
      }
      if (component.top) {
        basicParams.push({ key: 'temperature_range', name: '工作温度范围', displayValue: component.top });
      }
      if (component.package) {
        basicParams.push({ key: 'package', name: '封装形式', displayValue: component.package });
      }
      if (component.radiation) {
        basicParams.push({ key: 'radiation', name: '抗辐照指标', displayValue: component.radiation });
      }
      if (component.qualityLevel) {
        basicParams.push({ key: 'quality', name: '质量等级', displayValue: component.qualityLevel });
      }
      setDetailParameters(basicParams);
      setDetailLoading(false);
      return;
    }

    if (!component.component_id) {
      message.warning('当前器件缺少组件ID，无法获取详细参数');
      setDetailLoading(false);
      return;
    }

    // 获取组件的详细参数信息
    try {
      const data = await httpClient.get<any>(`/api/doeeet/components/${component.component_id}`, { timeoutMs: 15000 });

      if (data) {
        const rawParameters = Array.isArray(data.parameters) ? data.parameters : [];

        const normalizedParameters: DetailParameter[] = rawParameters
          .filter((param: any) => {
            const name = param?.name || param?.shortName;
            return name && String(name).trim().toLowerCase() !== 'unknown';
          })
          .map((param: any) => {
            const name = param.name || param.shortName || param.key || '-';
            const key = param.key || name;
            const displayValue = normalizeParameterValue(param.value ?? param.numericValue);
            return {
              key,
              name,
              category: param.category,
              displayValue,
            };
          })
          .sort((a: DetailParameter, b: DetailParameter) => {
            const categoryA = a.category || '其他';
            const categoryB = b.category || '其他';
            if (categoryA !== categoryB) {
              return categoryA.localeCompare(categoryB, 'zh-CN');
            }
            return a.name.localeCompare(b.name, 'zh-CN');
          });

        // 转换为前端需要的格式
        const parameterDefinitions = rawParameters.map((param: any) => ({
          parameter_key: param.key,
          name: param.name,
          short_name: param.shortName,
          category: param.category,
          example: '',
          value: param.value,
        }));

        setDetailParameters(normalizedParameters);

        // 更新选中组件的参数
        setSelectedComponent(prev =>
          prev ? { ...prev, parameterDefinitions } : { ...component, parameterDefinitions }
        );
      } else {
        const msg = '未获取到组件详情';
        message.warning(msg);
      }
    } catch (error: any) {
      console.error('获取组件详情失败:', error);
      message.error(error?.message || '网络异常或服务器不可用，无法获取组件详情');
    } finally {
      setDetailLoading(false);
    }
  };

  const addToSelection = (componentId: string) => {
    if (!selectedComponents.includes(componentId)) {
      setSelectedComponents([...selectedComponents, componentId]);
    }
  };

  const handleCompare = () => {
    if (selectedComponents.length < 2) {
      message.warning('请至少选择2个组件进行对比');
      return;
    }
    if (selectedComponents.length > 5) {
      message.warning('最多只能对比5个组件');
      return;
    }
    
    // 获取选中组件的component_id
    const selectedIds = components
      .filter(comp => selectedComponents.includes(comp.id))
      .map(comp => comp.component_id)
      .filter((id): id is string => id !== undefined);
    
    if (selectedIds.length < 2) {
      message.error('选中的组件信息不完整');
      return;
    }
    
    setCompareComponentIds(selectedIds);
    setCompareModalVisible(true);
  };

  // 静态列配置
  const staticColumns: ColumnsType<ComponentWithUI> = [
    {
      title: '器件型号',
      dataIndex: 'partNumber',
      key: 'partNumber',
      width: 120,
      fixed: 'left',
      render: (text: string, record: ComponentWithUI) => (
        <Button type="link" onClick={() => showDetail(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 100,
    },
    {
      title: '主分类',
      dataIndex: 'mainCategory',
      key: 'mainCategory',
      width: 100,
      render: (text: string) => {
        const colorMap: Record<string, string> = {
          '模拟单片集成电路': 'blue',
          '数字单片集成电路': 'green',
          '混合集成电路': 'cyan',
          '半导体分立器件': 'orange',
          '固态微波器件与电路': 'purple',
          '真空电子器件': 'magenta',
          '光电子器件': 'gold',
          '机电组件': 'red',
          '电能源': 'volcano',
          '通用与特种元件': 'geekblue',
          '微系统': 'lime',
        };
        return <Tag color={colorMap[text] || 'blue'}>{text}</Tag>;
      },
    },
    {
      title: '一级分类',
      dataIndex: 'primaryCategory',
      key: 'primaryCategory',
      width: 140,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '二级分类',
      dataIndex: 'secondaryCategory',
      key: 'secondaryCategory',
      width: 120,
      render: (text: string) => <Tag color="green">{text}</Tag>,
    },
    {
      title: '封装',
      dataIndex: 'package',
      key: 'package',
      width: 80,
    },
    {
      title: 'TOP',
      dataIndex: 'top',
      key: 'top',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '功能性能',
      dataIndex: 'functionalPerformance',
      key: 'functionalPerformance',
      width: 150,
      ellipsis: true,
    },
    {
      title: '参考价格',
      dataIndex: 'referencePrice',
      key: 'referencePrice',
      width: 90,
      render: (price: number) => (
        price > 0 ? (
          <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
            ¥{price.toFixed(2)}
          </span>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        )
      ),
      sorter: (a: ComponentWithUI, b: ComponentWithUI) => (a.referencePrice || 0) - (b.referencePrice || 0),
    },
    {
      title: '质量等级',
      dataIndex: 'qualityLevel',
      key: 'qualityLevel',
      width: 90,
      render: (level: string) => {
        const color = level === '宇航级' ? 'red' : level === '军用级' ? 'orange' : 'blue';
        return <Tag color={color}>{level}</Tag>;
      },
    },
    {
      title: '生命周期',
      dataIndex: 'lifecycle',
      key: 'lifecycle',
      width: 90,
      render: (lifecycle: string) => {
        const color = lifecycle === '生产中' ? 'green' : lifecycle === '停产' ? 'red' : 'orange';
        return <Tag color={color}>{lifecycle}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: ComponentWithUI) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showDetail(record)}
            />
          </Tooltip>
          <Tooltip title="添加到对比">
            <Button
              type="text"
              icon={<SwapOutlined />}
              onClick={() => addToSelection(record.id)}
            />
          </Tooltip>
          <Tooltip title="添加到选型清单">
            <Button
              type="text"
              icon={<ShoppingCartOutlined />}
              onClick={() => addToSelection(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  // 合并静态列和动态参数列，确保顺序为：静态列（不含操作列）-> 动态列 -> 操作列
  const actionColumn = staticColumns.find(col => col.key === 'action');
  const staticWithoutAction = staticColumns.filter(col => col.key !== 'action');
  const columns = actionColumn
    ? [...staticWithoutAction, ...dynamicColumns, actionColumn]
    : [...staticWithoutAction, ...dynamicColumns];

  const query = searchParams.get('q');
  const category = searchParams.get('category');

  return (
    <div>
      {/* 主分类标题 */}
      <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
            {pageTitle}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0', fontSize: '14px' }}>
            {pageDesc}
          </p>
        </div>
      </Card>
      
      {(query || category) && (
        <Alert
          message="搜索条件"
          description={
            <div>
              {query && <span>关键词: <strong>{query}</strong></span>}
              {query && category && <span> | </span>}
              {category && <span>分类: <strong>{category}</strong></span>}
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* 左右布局：左侧筛选面板，右侧结果展示 */}
      <Row gutter={16}>
        {/* 左侧筛选面板 */}
        <Col span={6}>
          <div style={{ position: 'sticky', top: 16 }}>
            {/* 分类筛选器 */}
            <Card 
              title="分类浏览" 
              size="small"
              style={{ marginBottom: 16 }}
              styles={{ body: { padding: '12px' } }}
            >
              <CategoryFilter
                key={`category-filter-${finalSource}`}
                selectedCategory={selectedCategory}
                source={finalSource as 'import' | 'domestic'}
                lockTopCategory={
                  // 将当前已选分类的顶层（父级）作为锁定大类
                  selectedCategory.length > 0 ? selectedCategory[selectedCategory.length - 1] : undefined
                }
                onCategoryChange={(path) => {
                  // 更新选中的分类并立即以完整路径触发搜索（父->子顺序由 handleSearch 内部统一处理）
                  setSelectedCategory(path);
                  setCurrentPage(1);
                  setPaginationState(prev => ({ ...prev, current: 1 }));
                  handleSearch(1, path);
                  console.log('选中的分类路径:', path);
                }}
              />
            </Card>

            {/* 快速搜索 */}
            <Card 
              title="快速搜索" 
              size="small"
              style={{ marginBottom: 16 }}
              styles={{ body: { padding: '12px' } }}
            >
        <Form
          form={form}
          layout="vertical"
          onFinish={() => handleSearch(undefined, selectedCategory)}
                size="small"
        >
              <Form.Item label="器件型号" name="partNumber">
                <Input placeholder="输入器件型号" />
              </Form.Item>
              <Form.Item label="制造商" name="manufacturer">
                <Input placeholder="输入制造商名称（支持部分匹配）" />
              </Form.Item>
              <Form.Item label="质量等级" name="qualityLevel">
                <Select placeholder="选择质量等级" allowClear>
                    <Option value="883">883</Option>
                    <Option value="QML Q">QML Q</Option>
                    <Option value="EP">EP</Option>
                  <Option value="宇航级">宇航级</Option>
                  <Option value="军用级">军用级</Option>
                  <Option value="工业级">工业级</Option>
                </Select>
              </Form.Item>
                <Form.Item label="淘汰状态" name="obsolescenceType">
                  <Select placeholder="选择淘汰状态" allowClear>
                    <Option value="Active">Active (在产)</Option>
                    <Option value="Last Time Buy">Last Time Buy (最后购买)</Option>
                    <Option value="Obsolete">Obsolete (已淘汰)</Option>
                    <Option value="Risk">Risk (风险)</Option>
                </Select>
              </Form.Item>
          <Form.Item>
                  <Space style={{ width: '100%' }} direction="vertical">
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading} block>
                搜索
              </Button>
                    <Button onClick={handleReset} block>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

            {/* 参数范围筛选 */}
            <Card 
              title="参数筛选" 
              size="small"
              styles={{ body: { padding: '12px' } }}
            >
              <ParameterRangeFilter 
                onFilterChange={(filters) => {
                  setParameterFilters(filters);
                }}
              />
            </Card>
          </div>
        </Col>

        {/* 右侧结果展示区域 */}
        <Col span={18}>
          {components.length > 0 ? (
        <Card 
              title={`搜索结果 (${total} 个结果)`}
          extra={
              <Space>
                  {selectedComponents.length > 0 && (
                    <>
                <span>已选择 {selectedComponents.length} 个器件</span>
                      <Button 
                        type="primary" 
                        icon={<SwapOutlined />}
                        onClick={handleCompare}
                        disabled={selectedComponents.length < 2 || selectedComponents.length > 5}
                      >
                        批量对比
                      </Button>
                      <Button icon={<ShoppingCartOutlined />}>添加到清单</Button>
                    </>
                  )}
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      if (parameterDefinitions.length > 0) {
                        const csvContent = exportParametersToCSV(components, parameterDefinitions);
                        downloadCSV(csvContent, `components_export_${new Date().getTime()}.csv`);
                        message.success('导出成功！');
                      } else {
                        message.warning('暂无参数数据可导出');
                      }
                    }}
                  >
                    导出CSV
                  </Button>
              </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={components}
            rowKey="id"
            loading={loading}
            rowSelection={{
              selectedRowKeys: selectedComponents,
              onChange: (selectedRowKeys: React.Key[]) => setSelectedComponents(selectedRowKeys as string[]),
            }}
            scroll={{ x: 'max-content' }}
            pagination={{
              current: paginationState.current,
              pageSize: paginationState.pageSize,
              total: paginationState.total,
              showSizeChanger: true,
              showQuickJumper: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              onChange: (page, size) => {
                    // 先更新状态，然后触发搜索
                    // 注意：这里先更新状态，确保UI立即响应
                    const newPageSize = size || 10;
                setCurrentPage(page);
                    setPageSize(newPageSize);
                    setPaginationState({ current: page, pageSize: newPageSize, total });
                    // 分页改变时重新搜索，直接传递新的页码避免时序问题
                    handleSearch(page, selectedCategory);
              },
              onShowSizeChange: (_current, size) => {
                    // 当每页数量改变时，重置到第一页
                    setCurrentPage(1);
                    setPageSize(size);
                    setPaginationState({ current: 1, pageSize: size, total });
                    handleSearch(1, selectedCategory);
              },
            }}
          />
        </Card>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ color: '#999', fontSize: '16px' }}>
                  {loading ? '搜索中...' : '暂无搜索结果，请调整筛选条件后重试'}
                </p>
              </div>
        </Card>
      )}
        </Col>
      </Row>

      {/* 器件详情模态框 */}
      <Modal
        title="器件详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="compare" icon={<SwapOutlined />}>
            添加到对比
          </Button>,
          <Button key="select" type="primary" icon={<ShoppingCartOutlined />}>
            添加到选型清单
          </Button>,
        ]}
        width={800}
      >
        {selectedComponent && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card
              size="small"
              title="基础信息"
              styles={{ header: { fontSize: 16, fontWeight: 600 }, body: { padding: '12px 16px' } }}
            >
              <Descriptions
                size="small"
                column={3}
                styles={{ label: { color: '#6b7280', fontWeight: 500, width: 120 }, content: { color: '#111827' } }}
              >
                <Descriptions.Item label="器件型号" span={1}>
                  <span style={{ fontWeight: 600, fontSize: '16px' }}>{selectedComponent.partNumber || '-'}</span>
                </Descriptions.Item>
                <Descriptions.Item label="制造商">{selectedComponent.manufacturer || '-'}</Descriptions.Item>
                <Descriptions.Item label="封装">{selectedComponent.package || '-'}</Descriptions.Item>
            <Descriptions.Item label="一级分类">
                  {selectedComponent.primaryCategory ? (
              <Tag color="blue">{selectedComponent.primaryCategory}</Tag>
                  ) : (
                    '-'
                  )}
            </Descriptions.Item>
            <Descriptions.Item label="二级分类">
                  {selectedComponent.secondaryCategory ? (
              <Tag color="green">{selectedComponent.secondaryCategory}</Tag>
                  ) : (
                    '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="质量等级">
                  {selectedComponent.qualityLevel ? (
              <Tag color={selectedComponent.qualityLevel === '宇航级' ? 'red' : 'orange'}>
                {selectedComponent.qualityLevel}
              </Tag>
                  ) : (
                    '-'
                  )}
            </Descriptions.Item>
            <Descriptions.Item label="生命周期" span={1}>
                  {selectedComponent.lifecycle ? <Tag color="green">{selectedComponent.lifecycle}</Tag> : '-'}
            </Descriptions.Item>
                <Descriptions.Item label="Radiation: Potential Sensitivity" span={2}>
                  {renderRadiationSensitivityCell(selectedComponent.radiationSensitivity, { dense: true })}
                </Descriptions.Item>
                <Descriptions.Item label="参考价格" span={2}>
                  {(selectedComponent.referencePrice ?? 0) > 0 ? (
                    <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '16px' }}>
                      ¥{selectedComponent.referencePrice!.toFixed(2)}
                    </span>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>暂无报价</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="相关标准" span={3}>
                  {selectedComponent.standards && selectedComponent.standards.length > 0 ? (
                    <Space size={[8, 8]} wrap>
              {selectedComponent.standards.map(standard => (
                        <Tag key={standard} color="blue">
                          {standard}
                        </Tag>
              ))}
                    </Space>
                  ) : (
                    '-'
                  )}
            </Descriptions.Item>
              </Descriptions>
            </Card>

            {(selectedComponent.functionalPerformance || selectedComponent.description) && (
              <Card
                size="small"
                title="功能与描述"
                styles={{ header: { fontSize: 16, fontWeight: 600 }, body: { padding: '12px 16px' } }}
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {selectedComponent.functionalPerformance && (
              <div>
                      <div style={{ color: '#6b7280', marginBottom: 4 }}>功能性能</div>
                      <div style={{ color: '#111827', whiteSpace: 'pre-wrap' }}>
                        {selectedComponent.functionalPerformance}
                  </div>
              </div>
                  )}
                  {selectedComponent.description && (
                    <div>
                      <div style={{ color: '#6b7280', marginBottom: 4 }}>器件描述</div>
                      <div style={{ color: '#111827', whiteSpace: 'pre-wrap' }}>{selectedComponent.description}</div>
                    </div>
                  )}
                </Space>
              </Card>
            )}

            <Row gutter={16}>
              <Col span={hasSuppliers ? 16 : 24}>
                <Card
                  size="small"
                  title="参数详情"
                  styles={{ header: { fontSize: 16, fontWeight: 600 }, body: { padding: '12px 16px' } }}
                >
                  {detailLoading ? (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                      <Spin size="small" />
                      <div style={{ marginTop: 8, color: '#666' }}>加载参数中...</div>
                    </div>
                  ) : parameterGroups.length > 0 ? (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {parameterGroups.map(({ category, params }) => (
                        <div
                          key={category}
                          style={{
                            border: '1px solid #e0e7ff',
                            borderRadius: 8,
                            padding: '12px 16px',
                            background: '#f8fafc',
                          }}
                        >
                          <div style={{ fontWeight: 600, color: '#3451d6', marginBottom: 10 }}>{category}</div>
                          <div>
                            {params.map((param, index) => {
                              const isLast = index === params.length - 1;
                              return (
                                <div
                                  key={`${category}-${param.key}-${index}`}
                                  style={{
                                    display: 'flex',
                                    gap: 16,
                                    padding: '6px 0',
                                    borderBottom: isLast ? 'none' : '1px solid #e5e7eb',
                                    alignItems: 'flex-start',
                                  }}
                                >
                                  <span
                                    style={{
                                      flex: '0 0 220px',
                                      color: '#374151',
                                      fontWeight: 500,
                                      wordBreak: 'break-word',
                                    }}
                                  >
                                    {param.name}
                                  </span>
                                  <span
                                    style={{
                                      flex: 1,
                                      color: '#111827',
                                      wordBreak: 'break-word',
                                    }}
                                  >
                                    {param.displayValue}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </Space>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>暂无参数数据</span>
                  )}
                </Card>
              </Col>
              {hasSuppliers && (
                <Col span={8}>
                  <Card
                    size="small"
                    title="供应商信息"
                    styles={{ header: { fontSize: 16, fontWeight: 600 }, body: { padding: '12px 16px' } }}
                  >
              <Table
                size="small"
                columns={[
                        { title: '供应商', dataIndex: 'name', key: 'name', ellipsis: true },
                        {
                          title: '价格',
                          dataIndex: 'price',
                          key: 'price',
                          render: (price: number | undefined) =>
                            typeof price === 'number' && price > 0 ? `¥${price}` : '-',
                        },
                  { title: '库存', dataIndex: 'stock', key: 'stock' },
                  { title: '交货期', dataIndex: 'leadTime', key: 'leadTime' },
                ]}
                dataSource={selectedComponent.suppliers}
                pagination={false}
                      rowKey={record => `${record.name}-${record.leadTime}-${record.price}`}
                    />
                  </Card>
                </Col>
              )}
            </Row>
          </Space>
        )}
      </Modal>

      {/* 组件对比模态框 */}
      <ComponentCompareModal
        visible={compareModalVisible}
        componentIds={compareComponentIds}
        onClose={() => setCompareModalVisible(false)}
      />
    </div>
  );
};

export default ComponentSearch;
