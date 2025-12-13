import React, { useState, useEffect } from 'react';
import {
  Card, 
  Table, 
  Button, 
  Select, 
  Space, 
  Tooltip,
  Tag,
  Divider,
  Row,
  Col,
  Statistic,
  Alert,
  Empty,
  message,
  Modal,
  Input,
  Typography,
  Progress
} from 'antd';
import {
  DeleteOutlined,
  ExportOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Text, Title } = Typography;
const { Search } = Input;

// 器件数据接口
interface Component {
  id: string;
  partNumber: string;
  manufacturer: string;
  category: string;
  subcategory: string;
  description: string;
  specifications: Record<string, any>;
  qualityLevel: 'commercial' | 'industrial' | 'military' | 'aerospace';
  package: string;
  operatingTemp: {
    min: number;
    max: number;
  };
  voltage: {
    min: number;
    max: number;
  };
  price: number;
  availability: 'in_stock' | 'limited' | 'out_of_stock';
  datasheet?: string;
  supplier: string;
  leadTime: number; // 交货时间（天）
  moq: number; // 最小起订量
}

// 比对结果评分
interface ComparisonScore {
  overall: number;
  performance: number;
  reliability: number;
  cost: number;
  availability: number;
}

// 关键参数配置
const CRITICAL_PARAMETERS = [
  { key: 'voltage.min', label: '最小工作电压', unit: 'V', type: 'numeric' },
  { key: 'voltage.max', label: '最大工作电压', unit: 'V', type: 'numeric' },
  { key: 'operatingTemp.min', label: '最低工作温度', unit: '°C', type: 'numeric' },
  { key: 'operatingTemp.max', label: '最高工作温度', unit: '°C', type: 'numeric' },
  { key: 'specifications.power', label: '功耗', unit: 'W', type: 'numeric' },
  { key: 'specifications.frequency', label: '工作频率', unit: 'MHz', type: 'numeric' },
  { key: 'specifications.accuracy', label: '精度', unit: '%', type: 'numeric' },
  { key: 'price', label: '单价', unit: '¥', type: 'currency' }
];

const ComponentCompare: React.FC = () => {
  const [selectedComponents, setSelectedComponents] = useState<Component[]>([]);
  const [availableComponents, setAvailableComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [comparisonScores, setComparisonScores] = useState<Record<string, ComparisonScore>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  // 模拟器件数据
  const mockComponents: Component[] = [
    {
      id: '1',
      partNumber: 'TMS320F28377D',
      manufacturer: 'Texas Instruments',
      category: 'Microcontrollers',
      subcategory: 'DSP Controllers',
      description: '32位双核实时控制单元',
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
      qualityLevel: 'aerospace',
      package: 'LQFP-176',
      operatingTemp: { min: -40, max: 125 },
      voltage: { min: 3.0, max: 3.6 },
      price: 28.50,
      availability: 'in_stock',
      supplier: 'TI官方',
      leadTime: 7,
      moq: 100
    },
    {
      id: '2',
      partNumber: 'STM32F767ZI',
      manufacturer: 'STMicroelectronics',
      category: 'Microcontrollers',
      subcategory: 'ARM Cortex-M7',
      description: '高性能ARM Cortex-M7 MCU',
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
      qualityLevel: 'industrial',
      package: 'LQFP-144',
      operatingTemp: { min: -40, max: 85 },
      voltage: { min: 1.7, max: 3.6 },
      price: 15.20,
      availability: 'limited',
      supplier: 'ST官方',
      leadTime: 14,
      moq: 50
    },
    {
      id: '3',
      partNumber: 'ADSP-BF607',
      manufacturer: 'Analog Devices',
      category: 'Microcontrollers',
      subcategory: 'Blackfin DSP',
      description: '双核Blackfin DSP处理器',
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
      qualityLevel: 'military',
      package: 'LQFP-176',
      operatingTemp: { min: -55, max: 125 },
      voltage: { min: 1.2, max: 1.32 },
      price: 45.80,
      availability: 'in_stock',
      supplier: 'ADI官方',
      leadTime: 21,
      moq: 25
    }
  ];

  useEffect(() => {
    setAvailableComponents(mockComponents);
  }, []);

  // 计算比对评分
  const calculateScore = (component: Component): ComparisonScore => {
    // 简化的评分算法
    const performanceScore = Math.min(100, (component.specifications.clockSpeed || 0) / 5);
    const reliabilityScore = component.qualityLevel === 'aerospace' ? 95 : 
                           component.qualityLevel === 'military' ? 85 :
                           component.qualityLevel === 'industrial' ? 75 : 65;
    const costScore = Math.max(0, 100 - component.price * 2);
    const availabilityScore = component.availability === 'in_stock' ? 90 : 
                             component.availability === 'limited' ? 60 : 30;
    
    const overallScore = (performanceScore + reliabilityScore + costScore + availabilityScore) / 4;
    
    return {
      overall: Math.round(overallScore),
      performance: Math.round(performanceScore),
      reliability: Math.round(reliabilityScore),
      cost: Math.round(costScore),
      availability: Math.round(availabilityScore)
    };
  };

  // 搜索器件
  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setSearchLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filteredComponents = mockComponents.filter(comp => 
        comp.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setAvailableComponents(filteredComponents);
    } catch (error) {
      message.error('搜索失败，请稍后重试');
    } finally {
      setSearchLoading(false);
    }
  };

  // 添加器件到比对列表
  const addToComparison = (component: Component) => {
    if (selectedComponents.length >= 5) {
      message.warning('最多只能同时比对5个器件');
      return;
    }
    
    if (selectedComponents.find(c => c.id === component.id)) {
      message.warning('该器件已在比对列表中');
      return;
    }
    
    const newComponents = [...selectedComponents, component];
    setSelectedComponents(newComponents);
    
    // 计算评分
    const scores = { ...comparisonScores };
    scores[component.id] = calculateScore(component);
    setComparisonScores(scores);
    
    message.success(`已添加 ${component.partNumber} 到比对列表`);
  };

  // 从比对列表移除器件
  const removeFromComparison = (componentId: string) => {
    setSelectedComponents(prev => prev.filter(c => c.id !== componentId));
    const newScores = { ...comparisonScores };
    delete newScores[componentId];
    setComparisonScores(newScores);
  };

  // 导出比对结果
  const exportComparison = (format: 'excel' | 'pdf' | 'csv') => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setExportModalVisible(false);
      message.success(`比对结果已导出为 ${format.toUpperCase()} 格式`);
    }, 2000);
  };

  // 获取参数值
  const getParameterValue = (component: Component, paramKey: string) => {
    const keys = paramKey.split('.');
    let value = component as any;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  };

  // 格式化参数值
  const formatValue = (value: any, type: string, unit: string) => {
    if (value === undefined || value === null) return '-';
    
    if (type === 'currency') {
      return `¥${value.toFixed(2)}`;
    }
    
    if (typeof value === 'number') {
      return `${value}${unit}`;
    }
    
    return String(value);
  };

  // 获取质量等级颜色
  const getQualityColor = (level: string) => {
    switch (level) {
      case 'aerospace': return 'gold';
      case 'military': return 'red';
      case 'industrial': return 'blue';
      case 'commercial': return 'green';
      default: return 'default';
    }
  };

  // 获取库存状态
  const getAvailabilityStatus = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return <Tag color="green" icon={<CheckCircleOutlined />}>现货</Tag>;
      case 'limited':
        return <Tag color="orange" icon={<InfoCircleOutlined />}>库存紧张</Tag>;
      case 'out_of_stock':
        return <Tag color="red" icon={<CloseCircleOutlined />}>缺货</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  // 比对表格列定义
  const compareColumns: ColumnsType<any> = [
    {
      title: '参数',
      dataIndex: 'parameter',
      key: 'parameter',
      width: 200,
      fixed: 'left',
      render: (text: string, record: any) => (
        <Space>
          <Text strong>{text}</Text>
          {record.critical && (
            <Tooltip title="关键参数">
              <InfoCircleOutlined style={{ color: '#ff7875' }} />
            </Tooltip>
          )}
        </Space>
      )
    },
    ...selectedComponents.map(component => ({
      title: (
        <div style={{ textAlign: 'center' }}>
          <div>{component.partNumber}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {component.manufacturer}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Progress
              percent={comparisonScores[component.id]?.overall || 0}
              size="small"
              format={(percent: number | undefined) => `${percent}分`}
            />
          </div>
        </div>
      ),
      dataIndex: component.id,
      key: component.id,
      width: 200,
      align: 'center' as const,
      render: (value: any, record: any) => {
        if (record.key === 'actions') {
          return (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeFromComparison(component.id)}
            >
              移除
            </Button>
          );
        }
        
        if (record.key === 'score') {
          const score = comparisonScores[component.id];
          return score ? (
            <Space direction="vertical" size={2}>
              <Text>综合: {score.overall}</Text>
              <Text type="secondary" style={{ fontSize: '10px' }}>
                性能:{score.performance} 可靠:{score.reliability}
              </Text>
              <Text type="secondary" style={{ fontSize: '10px' }}>
                成本:{score.cost} 供货:{score.availability}
              </Text>
            </Space>
          ) : '-';
        }
        
        return value || '-';
      }
    }))
  ];

  // 构建比对数据
  const buildCompareData = () => {
    const baseRows = [
      { key: 'basic', parameter: '基本信息', isGroup: true },
      { key: 'category', parameter: '器件分类' },
      { key: 'subcategory', parameter: '子分类' },
      { key: 'description', parameter: '描述' },
      { key: 'package', parameter: '封装' },
      { key: 'qualityLevel', parameter: '质量等级' },
      
      { key: 'performance', parameter: '性能参数', isGroup: true },
      ...CRITICAL_PARAMETERS.map(param => ({
        key: param.key,
        parameter: param.label,
        unit: param.unit,
        critical: true
      })),
      
      { key: 'supply', parameter: '供应信息', isGroup: true },
      { key: 'supplier', parameter: '供应商' },
      { key: 'availability', parameter: '库存状态' },
      { key: 'leadTime', parameter: '交货时间' },
      { key: 'moq', parameter: '最小起订量' },
      
      { key: 'score', parameter: '评分', isGroup: true },
      { key: 'actions', parameter: '操作' }
    ];

    return baseRows.map(row => {
      const dataRow: any = {
        key: row.key,
        parameter: row.parameter,
        isGroup: 'isGroup' in row ? row.isGroup : false
      };

      if ('isGroup' in row && row.isGroup) {
        return dataRow;
      }

      selectedComponents.forEach(component => {
        let value = getParameterValue(component, row.key);
        
        // 特殊处理
        if (row.key === 'qualityLevel') {
          value = (
            <Tag color={getQualityColor(value)}>
              {value === 'aerospace' ? '宇航级' :
               value === 'military' ? '军用级' :
               value === 'industrial' ? '工业级' : '商业级'}
            </Tag>
          );
        } else if (row.key === 'availability') {
          value = getAvailabilityStatus(value);
        } else if (row.key === 'leadTime') {
          value = `${value}天`;
        } else if (row.key === 'moq') {
          value = `${value}pcs`;
        } else if ('unit' in row && row.unit) {
          value = formatValue(value, row.key.includes('price') ? 'currency' : 'numeric', row.unit);
        }
        
        dataRow[component.id] = value;
      });

      return dataRow;
    });
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  <BarChartOutlined /> 器件参数比对
                </Title>
                <Text type="secondary">
                  多维度器件参数对比分析，支持最多5个器件同时比较
                </Text>
              </div>
              <Space>
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  onClick={() => setExportModalVisible(true)}
                  disabled={selectedComponents.length === 0}
                >
                  导出比对结果
                </Button>
                <Button
                  icon={<SwapOutlined />}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? '简化视图' : '高级视图'}
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 器件搜索区域 */}
        <Col span={8}>
          <Card title="器件搜索" style={{ height: 'fit-content' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Search
                placeholder="输入型号、厂商或描述关键词"
                allowClear
                enterButton="搜索"
                size="large"
                onSearch={handleSearch}
                loading={searchLoading}
              />
              
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {availableComponents.length > 0 ? (
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    {availableComponents.map(component => (
                      <Card
                        key={component.id}
                        size="small"
                        hoverable
                        style={{ 
                          cursor: 'pointer',
                          border: selectedComponents.find(c => c.id === component.id) 
                            ? '2px solid #1890ff' : '1px solid #d9d9d9'
                        }}
                        onClick={() => addToComparison(component)}
                      >
                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                          <Text strong>{component.partNumber}</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {component.manufacturer}
                          </Text>
                          <Text style={{ fontSize: '12px' }}>
                            {component.description}
                          </Text>
                          <Space size={4}>
                            <Tag color={getQualityColor(component.qualityLevel)}>
                              {component.qualityLevel === 'aerospace' ? '宇航级' :
                               component.qualityLevel === 'military' ? '军用级' :
                               component.qualityLevel === 'industrial' ? '工业级' : '商业级'}
                            </Tag>
                            {getAvailabilityStatus(component.availability)}
                          </Space>
                        </Space>
                      </Card>
                    ))}
                  </Space>
                ) : (
                  <Empty description="暂无匹配的器件" />
                )}
              </div>
            </Space>
          </Card>
        </Col>

        {/* 比对结果区域 */}
        <Col span={16}>
          <Card title={`器件比对 (${selectedComponents.length}/5)`}>
            {selectedComponents.length === 0 ? (
              <Empty
                description="请在左侧搜索并选择要比对的器件"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : selectedComponents.length === 1 ? (
              <Alert
                message="建议添加更多器件进行比较"
                description="至少选择2个器件才能进行有效比对分析"
                type="info"
                showIcon
              />
            ) : (
              <div>
                {/* 快速统计 */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={6}>
                    <Statistic
                      title="比对器件数"
                      value={selectedComponents.length}
                      suffix="/ 5"
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="平均评分"
                      value={Object.values(comparisonScores).reduce((acc, score) => acc + score.overall, 0) / selectedComponents.length || 0}
                      precision={1}
                      suffix="分"
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="现货器件"
                      value={selectedComponents.filter(c => c.availability === 'in_stock').length}
                      suffix={`/ ${selectedComponents.length}`}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="价格范围"
                      value={`¥${Math.min(...selectedComponents.map(c => c.price)).toFixed(2)} - ¥${Math.max(...selectedComponents.map(c => c.price)).toFixed(2)}`}
                    />
                  </Col>
                </Row>

                <Divider />

                {/* 比对表格 */}
                <Table
                  columns={compareColumns}
                  dataSource={buildCompareData()}
                  pagination={false}
                  scroll={{ x: 'max-content' }}
                  size="small"
                  rowClassName={(record) => record.isGroup ? 'group-row' : ''}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 导出对话框 */}
      <Modal
        title="导出比对结果"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Text>选择导出格式：</Text>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              block
              loading={loading}
              onClick={() => exportComparison('excel')}
            >
              Excel 格式 (.xlsx)
            </Button>
            <Button
              block
              loading={loading}
              onClick={() => exportComparison('pdf')}
            >
              PDF 格式 (.pdf)
            </Button>
            <Button
              block
              loading={loading}
              onClick={() => exportComparison('csv')}
            >
              CSV 格式 (.csv)
            </Button>
          </Space>
        </Space>
      </Modal>

      <style>{`
        .group-row {
          background: #fafafa !important;
          font-weight: 600;
        }
        .group-row td {
          border-bottom: 2px solid #e8e8e8 !important;
        }
      `}</style>
    </div>
  );
};

export default ComponentCompare;
