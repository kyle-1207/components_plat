// 统一的器件数据类型定义
export interface Component {
  id: string;
  partNumber: string;
  manufacturer: string;
  primaryCategory: string;  // 一级分类
  secondaryCategory: string; // 二级分类
  package: string;
  qualityLevel: string;
  lifecycle: string;
  standards: string[];
  description: string;
  functionalPerformance: string;
  referencePrice: number;
  parameters: {
    [key: string]: string;
  };
}

// 数字单片集成电路数据
export const digitalICData: Component[] = [
  {
    id: 'DIC001',
    partNumber: 'STM32F103C8T6',
    manufacturer: '意法半导体',
    primaryCategory: '数字单片集成电路',
    secondaryCategory: '微控制器',
    package: 'LQFP-48',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IPC/JEDEC J-STD-020'],
    description: '基于ARM Cortex-M3内核的32位微控制器',
    functionalPerformance: '72MHz主频，64KB Flash，20KB SRAM',
    referencePrice: 8.50,
    parameters: {
      architecture: 'ARM Cortex-M3',
      frequency: '72MHz',
      flash: '64KB',
      ram: '20KB',
      voltage: '2.0V-3.6V',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'DIC002',
    partNumber: 'STM32F103',
    manufacturer: '意法半导体',
    primaryCategory: '数字单片集成电路',
    secondaryCategory: '微控制器',
    package: 'LQFP-64',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IPC/JEDEC J-STD-020'],
    description: 'STM32F103系列32位微控制器',
    functionalPerformance: '72MHz主频，ARM Cortex-M3内核',
    referencePrice: 12.50,
    parameters: {
      architecture: 'ARM Cortex-M3',
      frequency: '72MHz',
      flash: '128KB-512KB',
      ram: '20KB-64KB',
      voltage: '2.0V-3.6V',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'DIC003',
    partNumber: 'FPGA-XC7A35T',
    manufacturer: '赛灵思',
    primaryCategory: '数字单片集成电路',
    secondaryCategory: 'FPGA',
    package: 'BGA-324',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['JESD22-A108'],
    description: 'Artix-7系列FPGA，33,280逻辑单元',
    functionalPerformance: '33K逻辑单元，1.8Mb Block RAM，90个DSP片',
    referencePrice: 285.00,
    parameters: {
      logicCells: '33,280',
      blockRAM: '1.8Mb',
      dspSlices: '90',
      voltage: '0.95V-1.05V',
      temperature: '-40°C~+100°C'
    }
  },
  {
    id: 'DIC004',
    partNumber: 'AT89C51',
    manufacturer: 'Microchip',
    primaryCategory: '数字单片集成电路',
    secondaryCategory: '8位微控制器',
    package: 'DIP-40',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60748'],
    description: '8位51内核微控制器',
    functionalPerformance: '12MHz主频，4KB Flash，128B RAM',
    referencePrice: 5.80,
    parameters: {
      architecture: '8051',
      frequency: '12MHz',
      flash: '4KB',
      ram: '128B',
      voltage: '4.0V-5.5V',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'DIC005',
    partNumber: 'PIC16F877A',
    manufacturer: 'Microchip',
    primaryCategory: '数字单片集成电路',
    secondaryCategory: '8位微控制器',
    package: 'DIP-40',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60748'],
    description: 'PIC 8位微控制器',
    functionalPerformance: '20MHz主频，14KB Flash，368B RAM',
    referencePrice: 7.20,
    parameters: {
      architecture: 'PIC',
      frequency: '20MHz',
      flash: '14KB',
      ram: '368B',
      voltage: '2.0V-5.5V',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'DIC006',
    partNumber: 'ESP32-WROOM-32',
    manufacturer: '乐鑫科技',
    primaryCategory: '数字单片集成电路',
    secondaryCategory: 'WiFi微控制器',
    package: 'SMD-38',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['FCC Part 15'],
    description: 'WiFi+蓝牙双模微控制器模块',
    functionalPerformance: '240MHz双核，WiFi 802.11n，蓝牙4.2',
    referencePrice: 15.50,
    parameters: {
      architecture: 'Xtensa LX6',
      frequency: '240MHz',
      flash: '4MB',
      ram: '520KB',
      voltage: '3.0V-3.6V',
      temperature: '-40°C~+85°C'
    }
  }
];

// 模拟单片集成电路数据
export const analogICData: Component[] = [
  {
    id: 'AIC001',
    partNumber: 'CA3140E',
    manufacturer: 'RCA/Intersil',
    primaryCategory: '模拟单片集成电路',
    secondaryCategory: 'BiMOS运算放大器',
    package: 'DIP-8',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['MIL-STD-883'],
    description: 'BiMOS工艺运算放大器，MOSFET输入，双极输出',
    functionalPerformance: '高输入阻抗1.5TΩ，低偏置电流50pA',
    referencePrice: 2.50,
    parameters: {
      inputBias: '50pA',
      inputOffset: '5mV',
      gainBandwidth: '4.5MHz',
      slewRate: '9V/μs',
      voltage: '±4V~±22V',
      temperature: '-55°C~+125°C'
    }
  },
  {
    id: 'AIC002',
    partNumber: 'LM358',
    manufacturer: '德州仪器',
    primaryCategory: '模拟单片集成电路',
    secondaryCategory: '双运算放大器',
    package: 'DIP-8',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60748'],
    description: '双路低功耗运算放大器',
    functionalPerformance: '单电源供电，低功耗，增益带宽1MHz',
    referencePrice: 0.85,
    parameters: {
      inputBias: '45nA',
      inputOffset: '3mV',
      gainBandwidth: '1MHz',
      slewRate: '0.3V/μs',
      voltage: '3V~32V',
      temperature: '0°C~+70°C'
    }
  },
  {
    id: 'AIC003',
    partNumber: 'OP07',
    manufacturer: 'Analog Devices',
    primaryCategory: '模拟单片集成电路',
    secondaryCategory: '精密运算放大器',
    package: 'DIP-8',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['MIL-STD-883'],
    description: '超低失调精密运算放大器',
    functionalPerformance: '失调电压10μV，温漂0.1μV/°C',
    referencePrice: 3.20,
    parameters: {
      inputBias: '1.8nA',
      inputOffset: '10μV',
      gainBandwidth: '0.6MHz',
      slewRate: '0.3V/μs',
      voltage: '±3V~±22V',
      temperature: '-55°C~+125°C'
    }
  },
  {
    id: 'AIC004',
    partNumber: 'LM311',
    manufacturer: '德州仪器',
    primaryCategory: '模拟单片集成电路',
    secondaryCategory: '电压比较器',
    package: 'DIP-8',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60748'],
    description: '高速单路电压比较器',
    functionalPerformance: '响应时间200ns，开集输出',
    referencePrice: 1.15,
    parameters: {
      responseTime: '200ns',
      inputOffset: '2mV',
      inputBias: '100nA',
      outputSaturation: '0.75V',
      voltage: '±15V',
      temperature: '0°C~+70°C'
    }
  },
  {
    id: 'AIC005',
    partNumber: 'LM317T',
    manufacturer: '德州仪器',
    primaryCategory: '模拟单片集成电路',
    secondaryCategory: '可调稳压器',
    package: 'TO-220',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '三端可调正电压稳压器',
    functionalPerformance: '输出1.25V-37V，最大1.5A',
    referencePrice: 1.85,
    parameters: {
      outputVoltage: '1.25V-37V',
      outputCurrent: '1.5A',
      lineRegulation: '0.01%',
      loadRegulation: '0.1%',
      voltage: '3V-40V',
      temperature: '0°C~+125°C'
    }
  },
  {
    id: 'AIC006',
    partNumber: 'AD620',
    manufacturer: 'Analog Devices',
    primaryCategory: '模拟单片集成电路',
    secondaryCategory: '仪表放大器',
    package: 'DIP-8',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['MIL-STD-883'],
    description: '低功耗精密仪表放大器',
    functionalPerformance: '增益1-10000，CMRR 100dB',
    referencePrice: 8.50,
    parameters: {
      gain: '1-10000',
      cmrr: '100dB',
      inputBias: '1.0nA',
      inputOffset: '50μV',
      voltage: '±2.3V~±18V',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'AIC007',
    partNumber: 'MAX232',
    manufacturer: 'Maxim Integrated',
    primaryCategory: '模拟单片集成电路',
    secondaryCategory: 'RS232收发器',
    package: 'DIP-16',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['TIA/EIA-232'],
    description: 'RS232电平转换芯片',
    functionalPerformance: '双路收发器，内置电荷泵',
    referencePrice: 2.80,
    parameters: {
      channels: '2',
      dataRate: '120kbps',
      voltage: '4.5V-5.5V',
      outputVoltage: '±7.5V',
      temperature: '0°C~+70°C'
    }
  },
  {
    id: 'AIC008',
    partNumber: 'NE555',
    manufacturer: '德州仪器',
    primaryCategory: '模拟单片集成电路',
    secondaryCategory: '定时器',
    package: 'DIP-8',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60748'],
    description: '通用定时器/振荡器',
    functionalPerformance: '频率0.1Hz-500kHz，占空比可调',
    referencePrice: 0.65,
    parameters: {
      frequency: '0.1Hz-500kHz',
      dutyCycle: '1%-99%',
      outputCurrent: '200mA',
      voltage: '4.5V-16V',
      temperature: '0°C~+70°C'
    }
  },
  {
    id: 'AIC009',
    partNumber: 'AD8232',
    manufacturer: 'Analog Devices',
    primaryCategory: '模拟单片集成电路',
    secondaryCategory: 'ECG前端芯片',
    package: 'LFCSP-20',
    qualityLevel: '医用级',
    lifecycle: '生产中',
    standards: ['IEC-60601'],
    description: '单导联心电图(ECG)前端芯片',
    functionalPerformance: '集成仪表放大器、RLD驱动器、导联脱落检测',
    referencePrice: 12.50,
    parameters: {
      channels: '1',
      bandwidth: '0.5Hz-40Hz',
      gain: '100V/V',
      inputBias: '2nA',
      voltage: '2.0V-3.6V',
      temperature: '-40°C~+85°C'
    }
  }
];

// 混合集成电路数据
export const hybridICData: Component[] = [
  {
    id: 'HIC001',
    partNumber: 'HYB-PWR-100W',
    manufacturer: '中电科55所',
    primaryCategory: '混合集成电路',
    secondaryCategory: '厚膜功率模块',
    package: '金属封装',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B'],
    description: '100W厚膜功率混合集成电路',
    functionalPerformance: '效率>90%，输出纹波<50mV',
    referencePrice: 450.00,
    parameters: {
      power: '100W',
      efficiency: '>90%',
      ripple: '<50mV',
      voltage: '28V±10%',
      temperature: '-55°C~+125°C'
    }
  }
];

// 半导体分立器件数据
export const discreteData: Component[] = [
  {
    id: 'DSC001',
    partNumber: '2N3904',
    manufacturer: '安森美',
    primaryCategory: '半导体分立器件',
    secondaryCategory: 'NPN双极晶体管',
    package: 'TO-92',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['JEDEC'],
    description: '通用NPN小信号双极晶体管',
    functionalPerformance: 'Ic=200mA，Vceo=40V，hfe=100-300',
    referencePrice: 0.12,
    parameters: {
      collectorCurrent: '200mA',
      collectorVoltage: '40V',
      hfe: '100-300',
      power: '625mW',
      temperature: '-55°C~+150°C'
    }
  }
];

// 固态微波器件与电路数据
export const microwaveData: Component[] = [
  {
    id: 'MW001',
    partNumber: 'GaN-PA-10W-X',
    manufacturer: '中电科13所',
    primaryCategory: '固态微波器件与电路',
    secondaryCategory: 'GaN功率放大器',
    package: '法兰封装',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B'],
    description: 'X波段GaN功率放大器MMIC',
    functionalPerformance: '8-12GHz，输出功率10W，增益30dB',
    referencePrice: 2800.00,
    parameters: {
      frequency: '8-12GHz',
      power: '10W',
      gain: '30dB',
      efficiency: '40%',
      temperature: '-55°C~+85°C'
    }
  }
];

// 真空电子器件数据
export const vacuumData: Component[] = [
  {
    id: 'VAC001',
    partNumber: 'TWT-20W-Ku',
    manufacturer: '中电科12所',
    primaryCategory: '真空电子器件',
    secondaryCategory: '行波管',
    package: '波导输出',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B'],
    description: 'Ku波段行波管放大器',
    functionalPerformance: '12-18GHz，输出功率20W，增益40dB',
    referencePrice: 25000.00,
    parameters: {
      frequency: '12-18GHz',
      power: '20W',
      gain: '40dB',
      efficiency: '35%',
      temperature: '-54°C~+71°C'
    }
  }
];

// 光电子器件数据
export const optoelectronicData: Component[] = [
  {
    id: 'OPT001',
    partNumber: 'LD-1550-100mW',
    manufacturer: '海光电子',
    primaryCategory: '光电子器件',
    secondaryCategory: '激光二极管',
    package: 'TO-56',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60825'],
    description: '1550nm分布反馈激光二极管',
    functionalPerformance: '中心波长1550nm，输出功率100mW',
    referencePrice: 850.00,
    parameters: {
      wavelength: '1550nm',
      power: '100mW',
      threshold: '20mA',
      efficiency: '0.3W/A',
      temperature: '-40°C~+85°C'
    }
  }
];

// 机电组件数据
export const electromechanicalData: Component[] = [
  {
    id: 'EMC001',
    partNumber: 'RELAY-5V-10A',
    manufacturer: '宏发继电器',
    primaryCategory: '机电组件',
    secondaryCategory: '电磁继电器',
    package: 'PCB安装',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-61810'],
    description: '5V单刀双掷电磁继电器',
    functionalPerformance: '线圈电压5V，触点容量10A/250VAC',
    referencePrice: 3.50,
    parameters: {
      coilVoltage: '5V',
      contactCurrent: '10A',
      contactVoltage: '250VAC',
      operateTime: '10ms',
      temperature: '-40°C~+85°C'
    }
  }
];

// 电能源数据
export const powerData: Component[] = [
  {
    id: 'PWR001',
    partNumber: 'DCDC-12V-5V-10W',
    manufacturer: '金升阳',
    primaryCategory: '电能源',
    secondaryCategory: 'DC-DC转换器',
    package: 'SIP-7',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-62368'],
    description: '12V转5V隔离DC-DC电源模块',
    functionalPerformance: '输入9-18V，输出5V/2A，效率85%',
    referencePrice: 25.00,
    parameters: {
      inputVoltage: '9-18V',
      outputVoltage: '5V',
      outputCurrent: '2A',
      efficiency: '85%',
      temperature: '-40°C~+85°C'
    }
  }
];

// 通用与特种元件数据
export const generalData: Component[] = [
  {
    id: 'GEN001',
    partNumber: 'CAP-100uF-25V',
    manufacturer: '风华高科',
    primaryCategory: '通用与特种元件',
    secondaryCategory: '铝电解电容',
    package: '径向引线',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60384'],
    description: '100μF/25V铝电解电容器',
    functionalPerformance: '低ESR，高纹波电流，长寿命',
    referencePrice: 0.35,
    parameters: {
      capacitance: '100μF',
      voltage: '25V',
      tolerance: '±20%',
      esr: '0.15Ω',
      temperature: '-40°C~+105°C'
    }
  }
];

// 微系统数据
export const microsystemsData: Component[] = [
  {
    id: 'MEMS001',
    partNumber: 'MEMS-ACC-3Axis',
    manufacturer: '敏芯股份',
    primaryCategory: '微系统',
    secondaryCategory: '三轴加速度计',
    package: 'LGA-14',
    qualityLevel: '汽车级',
    lifecycle: '生产中',
    standards: ['AEC-Q100'],
    description: '三轴MEMS加速度传感器',
    functionalPerformance: '±16g量程，16位ADC，低功耗',
    referencePrice: 8.50,
    parameters: {
      range: '±2/±4/±8/±16g',
      resolution: '16-bit',
      sensitivity: '2048LSB/g',
      current: '12μA',
      temperature: '-40°C~+85°C'
    }
  }
];

// 汇总所有器件数据
export const allComponentsData: Component[] = [
  ...digitalICData,
  ...analogICData,
  ...hybridICData,
  ...discreteData,
  ...microwaveData,
  ...vacuumData,
  ...optoelectronicData,
  ...electromechanicalData,
  ...powerData,
  ...generalData,
  ...microsystemsData,
];

// 按分类获取数据的工具函数
export const getComponentsByCategory = (category: string): Component[] => {
  switch (category) {
    case '数字单片集成电路':
      return digitalICData;
    case '模拟单片集成电路':
      return analogICData;
    case '混合集成电路':
      return hybridICData;
    case '半导体分立器件':
      return discreteData;
    case '固态微波器件与电路':
      return microwaveData;
    case '真空电子器件':
      return vacuumData;
    case '光电子器件':
      return optoelectronicData;
    case '机电组件':
      return electromechanicalData;
    case '电能源':
      return powerData;
    case '通用与特种元件':
      return generalData;
    case '微系统':
      return microsystemsData;
    default:
      return allComponentsData;
  }
};

// 全局搜索函数
export const searchComponents = (
  query: string, 
  filters?: {
    category?: string;
    manufacturer?: string;
    qualityLevel?: string;
    lifecycle?: string;
  }
): Component[] => {
  let data = filters?.category ? getComponentsByCategory(filters.category) : allComponentsData;
  
  if (query.trim()) {
    const searchQuery = query.toLowerCase();
    data = data.filter(component => 
      component.partNumber.toLowerCase().includes(searchQuery) ||
      component.manufacturer.toLowerCase().includes(searchQuery) ||
      component.description.toLowerCase().includes(searchQuery) ||
      component.functionalPerformance.toLowerCase().includes(searchQuery) ||
      component.primaryCategory.toLowerCase().includes(searchQuery) ||
      component.secondaryCategory.toLowerCase().includes(searchQuery)
    );
  }
  
  if (filters?.manufacturer) {
    data = data.filter(component => component.manufacturer === filters.manufacturer);
  }
  
  if (filters?.qualityLevel) {
    data = data.filter(component => component.qualityLevel === filters.qualityLevel);
  }
  
  if (filters?.lifecycle) {
    data = data.filter(component => component.lifecycle === filters.lifecycle);
  }
  
  return data;
};

// 获取所有制造商列表
export const getAllManufacturers = (): string[] => {
  const manufacturers = new Set<string>();
  allComponentsData.forEach(component => manufacturers.add(component.manufacturer));
  return Array.from(manufacturers).sort();
};

// 获取所有分类列表
export const getAllCategories = (): string[] => {
  const categories = new Set<string>();
  allComponentsData.forEach(component => categories.add(component.primaryCategory));
  return Array.from(categories).sort();
};
