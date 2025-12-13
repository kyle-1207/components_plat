import React, { useState } from 'react';
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
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  SwapOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';

const { Option } = Select;

// 电能源数据类型定义
interface PowerComponent {
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
    inputVoltage?: string;
    outputVoltage?: string;
    outputCurrent?: string;
    power?: string;
    efficiency?: string;
    ripple?: string;
    regulation?: string;
    temperature?: string;
  };
}

// 电能源测试数据
const mockPowerData: PowerComponent[] = [
  {
    id: 'PS001',
    partNumber: 'PSU-24V-100W',
    manufacturer: '英飞凌',
    primaryCategory: '开关电源',
    secondaryCategory: 'AC-DC电源模块',
    package: '金属外壳',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60950', 'UL1950'],
    description: '24V/100W开关电源模块',
    functionalPerformance: '85-264VAC输入，24VDC/4.2A输出',
    referencePrice: 180.00,
    parameters: {
      inputVoltage: '85-264VAC',
      outputVoltage: '24VDC',
      outputCurrent: '4.2A',
      power: '100W',
      efficiency: '85%',
      ripple: '<100mVpp',
      regulation: '±1%',
      temperature: '-20°C~+70°C'
    }
  },
  {
    id: 'PS002',
    partNumber: 'DCDC-12V-50W',
    manufacturer: '中航光电',
    primaryCategory: 'DC-DC转换器',
    secondaryCategory: '隔离DC-DC模块',
    package: 'DIP-24',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB151B', 'MIL-STD-461'],
    description: '28V转12V隔离DC-DC转换器',
    functionalPerformance: '18-36VDC输入，12VDC/4.2A输出，隔离3kV',
    referencePrice: 320.00,
    parameters: {
      inputVoltage: '18-36VDC',
      outputVoltage: '12VDC',
      outputCurrent: '4.2A',
      power: '50W',
      efficiency: '88%',
      ripple: '<50mVpp',
      regulation: '±0.5%',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'PS003',
    partNumber: 'LDO-3V3-1A',
    manufacturer: '圣邦微电子',
    primaryCategory: '线性稳压器',
    secondaryCategory: 'LDO稳压器',
    package: 'SOT-223',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '3.3V/1A低压差线性稳压器',
    functionalPerformance: '4.5-20V输入，3.3V/1A输出，压差0.3V',
    referencePrice: 2.50,
    parameters: {
      inputVoltage: '4.5-20VDC',
      outputVoltage: '3.3VDC',
      outputCurrent: '1A',
      power: '3.3W',
      efficiency: '65%',
      ripple: '<20mVpp',
      regulation: '±2%',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'PS004',
    partNumber: 'UPS-500VA-Online',
    manufacturer: '山特电子',
    primaryCategory: 'UPS电源',
    secondaryCategory: '在线式UPS',
    package: '机架式',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-62040'],
    description: '500VA在线式UPS不间断电源',
    functionalPerformance: '220VAC输入，220VAC输出，后备时间15分钟',
    referencePrice: 1200.00,
    parameters: {
      inputVoltage: '220VAC',
      outputVoltage: '220VAC',
      outputCurrent: '2.3A',
      power: '500VA',
      efficiency: '90%',
      ripple: '<3%',
      regulation: '±1%',
      temperature: '0°C~+40°C'
    }
  },
  {
    id: 'PS005',
    partNumber: 'INV-12V-300W',
    manufacturer: '正弦电气',
    primaryCategory: '逆变器',
    secondaryCategory: '正弦波逆变器',
    package: '铝合金外壳',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-61683'],
    description: '12V转220V纯正弦波逆变器',
    functionalPerformance: '12VDC输入，220VAC输出，THD<3%',
    referencePrice: 280.00,
    parameters: {
      inputVoltage: '12VDC',
      outputVoltage: '220VAC',
      outputCurrent: '1.4A',
      power: '300W',
      efficiency: '90%',
      ripple: '<3%',
      regulation: '±5%',
      temperature: '-10°C~+50°C'
    }
  },
  {
    id: 'PS006',
    partNumber: 'CHG-LiPo-4S',
    manufacturer: '欣旺达',
    primaryCategory: '电池充电器',
    secondaryCategory: '锂电池充电器',
    package: 'PCB模块',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-62133'],
    description: '4S锂电池平衡充电器',
    functionalPerformance: '12-24V输入，16.8V/2A输出，带平衡功能',
    referencePrice: 85.00,
    parameters: {
      inputVoltage: '12-24VDC',
      outputVoltage: '16.8VDC',
      outputCurrent: '2A',
      power: '33.6W',
      efficiency: '85%',
      ripple: '<50mVpp',
      regulation: '±1%',
      temperature: '0°C~+45°C'
    }
  },
  {
    id: 'PS007',
    partNumber: 'SOLAR-100W-MPPT',
    manufacturer: '晶澳太阳能',
    primaryCategory: '太阳能控制器',
    secondaryCategory: 'MPPT控制器',
    package: '防水外壳',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-61215'],
    description: '100W MPPT太阳能充电控制器',
    functionalPerformance: '12/24V系统，最大功率点跟踪，效率>97%',
    referencePrice: 450.00,
    parameters: {
      inputVoltage: '12-50VDC',
      outputVoltage: '12/24VDC',
      outputCurrent: '8A',
      power: '100W',
      efficiency: '97%',
      ripple: '<100mVpp',
      regulation: '±2%',
      temperature: '-35°C~+60°C'
    }
  },
  {
    id: 'PS008',
    partNumber: 'EMI-Filter-10A',
    manufacturer: '德力西',
    primaryCategory: 'EMI滤波器',
    secondaryCategory: '电源线滤波器',
    package: '金属外壳',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60939'],
    description: '10A单相电源线EMI滤波器',
    functionalPerformance: '250VAC/10A，插损>40dB@150kHz-30MHz',
    referencePrice: 65.00,
    parameters: {
      inputVoltage: '250VAC',
      outputVoltage: '250VAC',
      outputCurrent: '10A',
      power: '2500W',
      efficiency: '99%',
      ripple: '无',
      regulation: '无',
      temperature: '-25°C~+85°C'
    }
  }
];

const PowerSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PowerComponent[]>(mockPowerData);
  const [filteredData, setFilteredData] = useState<PowerComponent[]>(mockPowerData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<PowerComponent | null>(null);

  // 搜索处理
  const handleSearch = (values: any) => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = mockPowerData;
      
      if (values.partNumber) {
        filtered = filtered.filter(item => 
          item.partNumber.toLowerCase().includes(values.partNumber.toLowerCase())
        );
      }
      
      if (values.manufacturer) {
        filtered = filtered.filter(item => item.manufacturer === values.manufacturer);
      }
      
      if (values.primaryCategory) {
        filtered = filtered.filter(item => item.primaryCategory === values.primaryCategory);
      }
      
      if (values.secondaryCategory) {
        filtered = filtered.filter(item => item.secondaryCategory === values.secondaryCategory);
      }
      
      setFilteredData(filtered);
      setLoading(false);
    }, 1000);
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setFilteredData(mockPowerData);
  };

  // 查看详情
  const handleViewDetail = (record: PowerComponent) => {
    setSelectedComponent(record);
    setDetailModalVisible(true);
  };

  // 表格列定义
  const columns = [
    {
      title: '器件型号',
      dataIndex: 'partNumber',
      key: 'partNumber',
      width: 150,
      render: (text: string) => <strong style={{ color: '#1890ff' }}>{text}</strong>,
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 120,
    },
    {
      title: '一级分类',
      dataIndex: 'primaryCategory',
      key: 'primaryCategory',
      width: 120,
      render: (text: string) => <Tag color="gold">{text}</Tag>,
    },
    {
      title: '二级分类',
      dataIndex: 'secondaryCategory',
      key: 'secondaryCategory',
      width: 140,
      render: (text: string) => <Tag color="orange">{text}</Tag>,
    },
    {
      title: '输出功率',
      dataIndex: ['parameters', 'power'],
      key: 'power',
      width: 100,
      render: (text: string) => <Tag color="green">{text}</Tag>,
    },
    {
      title: '功能性能',
      dataIndex: 'functionalPerformance',
      key: 'functionalPerformance',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: '参考价格',
      dataIndex: 'referencePrice',
      key: 'referencePrice',
      width: 120,
      sorter: (a: PowerComponent, b: PowerComponent) => a.referencePrice - b.referencePrice,
      render: (price: number) => {
        if (price === 0) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return <span style={{ color: '#1890ff', fontWeight: 'bold' }}>¥{price.toFixed(2)}</span>;
      },
    },
    {
      title: '质量等级',
      dataIndex: 'qualityLevel',
      key: 'qualityLevel',
      width: 100,
      render: (level: string) => {
        const colorMap: { [key: string]: string } = {
          '宇航级': 'red',
          '军用级': 'orange',
          '工业级': 'blue',
          '商用级': 'green'
        };
        return <Tag color={colorMap[level] || 'default'}>{level}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: PowerComponent) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="对比">
            <Button
              type="link"
              icon={<SwapOutlined />}
            />
          </Tooltip>
          <Tooltip title="加入选型">
            <Button
              type="link"
              icon={<ShoppingCartOutlined />}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const query = searchParams.get('q');
  const category = searchParams.get('category');

  return (
    <div>
      {/* 主分类标题 */}
      <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)' }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
            电能源
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0', fontSize: '14px' }}>
            Power Sources - 开关电源、DC-DC转换器、UPS、逆变器等
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
      
      <Card title="器件查询" extra={<FilterOutlined />}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="器件型号" name="partNumber">
                <Input placeholder="输入器件型号" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="制造商" name="manufacturer">
                <Select placeholder="选择制造商" allowClear>
                  <Option value="英飞凌">英飞凌</Option>
                  <Option value="中航光电">中航光电</Option>
                  <Option value="圣邦微电子">圣邦微电子</Option>
                  <Option value="山特电子">山特电子</Option>
                  <Option value="正弦电气">正弦电气</Option>
                  <Option value="欣旺达">欣旺达</Option>
                  <Option value="晶澳太阳能">晶澳太阳能</Option>
                  <Option value="德力西">德力西</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="一级分类" name="primaryCategory">
                <Select placeholder="选择一级分类" allowClear>
                  <Option value="开关电源">开关电源</Option>
                  <Option value="DC-DC转换器">DC-DC转换器</Option>
                  <Option value="线性稳压器">线性稳压器</Option>
                  <Option value="UPS电源">UPS电源</Option>
                  <Option value="逆变器">逆变器</Option>
                  <Option value="电池充电器">电池充电器</Option>
                  <Option value="太阳能控制器">太阳能控制器</Option>
                  <Option value="EMI滤波器">EMI滤波器</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="质量等级" name="qualityLevel">
                <Select placeholder="选择质量等级" allowClear>
                  <Option value="宇航级">宇航级</Option>
                  <Option value="军用级">军用级</Option>
                  <Option value="工业级">工业级</Option>
                  <Option value="商用级">商用级</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="生命周期" name="lifecycle">
                <Select placeholder="选择生命周期" allowClear>
                  <Option value="生产中">生产中</Option>
                  <Option value="工程样片">工程样片</Option>
                  <Option value="停产">停产</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row>
            <Col span={24}>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                  搜索
                </Button>
                <Button onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title={`搜索结果 (${filteredData.length})`}
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <span>已选择 {selectedRowKeys.length} 项</span>
            <Button type="primary" disabled={selectedRowKeys.length === 0}>
              批量对比
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            preserveSelectedRowKeys: true,
          }}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="器件详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedComponent && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="器件型号" span={2}>
              <strong style={{ fontSize: '16px', color: '#1890ff' }}>
                {selectedComponent.partNumber}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="制造商">{selectedComponent.manufacturer}</Descriptions.Item>
            <Descriptions.Item label="参考价格">
              {selectedComponent.referencePrice === 0 ? (
                <span style={{ color: '#999' }}>暂无报价</span>
              ) : (
                <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                  ¥{selectedComponent.referencePrice.toFixed(2)}
                </span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="一级分类">{selectedComponent.primaryCategory}</Descriptions.Item>
            <Descriptions.Item label="二级分类">{selectedComponent.secondaryCategory}</Descriptions.Item>
            <Descriptions.Item label="封装形式">{selectedComponent.package}</Descriptions.Item>
            <Descriptions.Item label="质量等级">{selectedComponent.qualityLevel}</Descriptions.Item>
            <Descriptions.Item label="生命周期">{selectedComponent.lifecycle}</Descriptions.Item>
            <Descriptions.Item label="适用标准">
              <Space wrap>
                {selectedComponent.standards.map(std => (
                  <Tag key={std} color="volcano">{std}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="器件描述" span={2}>
              {selectedComponent.description}
            </Descriptions.Item>
            <Descriptions.Item label="功能性能" span={2}>
              {selectedComponent.functionalPerformance}
            </Descriptions.Item>
            <Descriptions.Item label="输入电压">{selectedComponent.parameters.inputVoltage}</Descriptions.Item>
            <Descriptions.Item label="输出电压">{selectedComponent.parameters.outputVoltage}</Descriptions.Item>
            <Descriptions.Item label="输出电流">{selectedComponent.parameters.outputCurrent}</Descriptions.Item>
            <Descriptions.Item label="输出功率">{selectedComponent.parameters.power}</Descriptions.Item>
            <Descriptions.Item label="转换效率">{selectedComponent.parameters.efficiency}</Descriptions.Item>
            <Descriptions.Item label="纹波噪声">{selectedComponent.parameters.ripple}</Descriptions.Item>
            <Descriptions.Item label="负载调整率">{selectedComponent.parameters.regulation}</Descriptions.Item>
            <Descriptions.Item label="工作温度">{selectedComponent.parameters.temperature}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default PowerSearch;
