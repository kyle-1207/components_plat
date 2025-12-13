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

// 微系统数据类型定义
interface MicrosystemComponent {
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
    voltage?: string;
    current?: string;
    power?: string;
    frequency?: string;
    sensitivity?: string;
    range?: string;
    accuracy?: string;
    temperature?: string;
  };
}

// 微系统测试数据
const mockMicrosystemsData: MicrosystemComponent[] = [
  {
    id: 'MS001',
    partNumber: 'MEMS-ACC-3Axis',
    manufacturer: '敏芯股份',
    primaryCategory: 'MEMS传感器',
    secondaryCategory: '三轴加速度计',
    package: 'LGA-14',
    qualityLevel: '汽车级',
    lifecycle: '生产中',
    standards: ['AEC-Q100', 'ISO-26262'],
    description: '三轴MEMS加速度传感器',
    functionalPerformance: '±16g量程，16位ADC，低功耗',
    referencePrice: 8.50,
    parameters: {
      voltage: '1.8-3.6V',
      current: '12μA',
      power: '36μW',
      frequency: '1.6kHz',
      sensitivity: '2048LSB/g',
      range: '±2/±4/±8/±16g',
      accuracy: '±40mg',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'MS002',
    partNumber: 'GYRO-3Axis-2000dps',
    manufacturer: '瑞声科技',
    primaryCategory: 'MEMS传感器',
    secondaryCategory: '三轴陀螺仪',
    package: 'QFN-24',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60068'],
    description: '三轴MEMS陀螺仪传感器',
    functionalPerformance: '±2000dps量程，16位分辨率',
    referencePrice: 12.00,
    parameters: {
      voltage: '2.4-3.6V',
      current: '3.6mA',
      power: '10.8mW',
      frequency: '8kHz',
      sensitivity: '16.4LSB/(dps)',
      range: '±250/±500/±1000/±2000dps',
      accuracy: '±1%',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'MS003',
    partNumber: 'PRESS-1000mbar',
    manufacturer: '森思泰克',
    primaryCategory: 'MEMS传感器',
    secondaryCategory: '压力传感器',
    package: 'LGA-8',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60068'],
    description: 'MEMS绝对压力传感器',
    functionalPerformance: '300-1100mbar，24位ADC',
    referencePrice: 15.00,
    parameters: {
      voltage: '1.8-3.6V',
      current: '3μA',
      power: '5.4μW',
      frequency: '157Hz',
      sensitivity: '4096Pa/LSB',
      range: '300-1100mbar',
      accuracy: '±0.12mbar',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'MS004',
    partNumber: 'MIC-MEMS-Omni',
    manufacturer: '歌尔股份',
    primaryCategory: 'MEMS传感器',
    secondaryCategory: 'MEMS麦克风',
    package: 'SMD-3.76×2.95',
    qualityLevel: '消费级',
    lifecycle: '生产中',
    standards: ['IEC-61672'],
    description: '全向MEMS数字麦克风',
    functionalPerformance: '-26dBFS灵敏度，130dB SPL',
    referencePrice: 1.20,
    parameters: {
      voltage: '1.8-3.6V',
      current: '650μA',
      power: '2.3mW',
      frequency: '20Hz-20kHz',
      sensitivity: '-26dBFS',
      range: '130dB SPL',
      accuracy: '±1dB',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'MS005',
    partNumber: 'RF-MEMS-SW-6GHz',
    manufacturer: '中电科55所',
    primaryCategory: 'RF MEMS',
    secondaryCategory: 'RF MEMS开关',
    package: 'QFN-16',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B'],
    description: '6GHz RF MEMS开关',
    functionalPerformance: 'DC-6GHz，插损<0.3dB，隔离>30dB',
    referencePrice: 280.00,
    parameters: {
      voltage: '0-80V',
      current: '1μA',
      power: '80μW',
      frequency: 'DC-6GHz',
      sensitivity: '无',
      range: '80V',
      accuracy: '无',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'MS006',
    partNumber: 'BIO-MEMS-Glucose',
    manufacturer: '奥普拓',
    primaryCategory: '生物MEMS',
    secondaryCategory: '葡萄糖传感器',
    package: '芯片级封装',
    qualityLevel: '医用级',
    lifecycle: '生产中',
    standards: ['ISO-13485', 'FDA-510K'],
    description: 'MEMS葡萄糖生物传感器',
    functionalPerformance: '0.5-30mmol/L检测范围，电化学检测',
    referencePrice: 45.00,
    parameters: {
      voltage: '3.0V',
      current: '10μA',
      power: '30μW',
      frequency: '1Hz',
      sensitivity: '20nA/(mmol/L)',
      range: '0.5-30mmol/L',
      accuracy: '±5%',
      temperature: '20°C~+40°C'
    }
  },
  {
    id: 'MS007',
    partNumber: 'OPTICAL-MEMS-DMD',
    manufacturer: '奥普光电',
    primaryCategory: '光学MEMS',
    secondaryCategory: '数字微镜器件',
    package: 'BGA封装',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-62471'],
    description: '1024×768数字微镜阵列',
    functionalPerformance: '1024×768分辨率，20μs切换时间',
    referencePrice: 1200.00,
    parameters: {
      voltage: '12V',
      current: '500mA',
      power: '6W',
      frequency: '50kHz',
      sensitivity: '无',
      range: '±12°',
      accuracy: '±0.1°',
      temperature: '0°C~+70°C'
    }
  },
  {
    id: 'MS008',
    partNumber: 'FLOW-MEMS-Thermal',
    manufacturer: '奥松电子',
    primaryCategory: 'MEMS传感器',
    secondaryCategory: '热式流量传感器',
    package: 'TO-39',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60068'],
    description: 'MEMS热式气体流量传感器',
    functionalPerformance: '0-200SLPM，热式检测原理',
    referencePrice: 85.00,
    parameters: {
      voltage: '5V',
      current: '20mA',
      power: '100mW',
      frequency: '10Hz',
      sensitivity: '50mV/(m/s)',
      range: '0-200SLPM',
      accuracy: '±3%',
      temperature: '-20°C~+80°C'
    }
  },
  {
    id: 'MS009',
    partNumber: 'MEMS-OSC-100MHz',
    manufacturer: '泰晶科技',
    primaryCategory: 'MEMS振荡器',
    secondaryCategory: 'MEMS时钟发生器',
    package: 'SMD-3.2×2.5',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60444'],
    description: '100MHz MEMS振荡器',
    functionalPerformance: '100MHz±25ppm，LVDS输出',
    referencePrice: 6.50,
    parameters: {
      voltage: '3.3V',
      current: '45mA',
      power: '148.5mW',
      frequency: '100MHz',
      sensitivity: '无',
      range: '±25ppm',
      accuracy: '±25ppm',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'MS010',
    partNumber: 'MEMS-MIRROR-2Axis',
    manufacturer: '中科院光电院',
    primaryCategory: '光学MEMS',
    secondaryCategory: '二维扫描镜',
    package: '陶瓷封装',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B'],
    description: '二维MEMS扫描微镜',
    functionalPerformance: '±15°扫描角，1kHz扫描频率',
    referencePrice: 2800.00,
    parameters: {
      voltage: '±150V',
      current: '1mA',
      power: '300mW',
      frequency: '1kHz',
      sensitivity: '0.1°/V',
      range: '±15°',
      accuracy: '±0.1°',
      temperature: '-40°C~+70°C'
    }
  }
];

const MicrosystemsSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<MicrosystemComponent[]>(mockMicrosystemsData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<MicrosystemComponent | null>(null);

  // 搜索处理
  const handleSearch = (values: any) => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = mockMicrosystemsData;
      
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
    setFilteredData(mockMicrosystemsData);
  };

  // 查看详情
  const handleViewDetail = (record: MicrosystemComponent) => {
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
      render: (text: string) => <Tag color="cyan">{text}</Tag>,
    },
    {
      title: '二级分类',
      dataIndex: 'secondaryCategory',
      key: 'secondaryCategory',
      width: 140,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '封装',
      dataIndex: 'package',
      key: 'package',
      width: 120,
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
      sorter: (a: MicrosystemComponent, b: MicrosystemComponent) => a.referencePrice - b.referencePrice,
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
          '汽车级': 'purple',
          '医用级': 'magenta',
          '消费级': 'green'
        };
        return <Tag color={colorMap[level] || 'default'}>{level}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: MicrosystemComponent) => (
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
      <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #13c2c2 0%, #08979c 100%)' }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
            微系统
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0', fontSize: '14px' }}>
            Microsystems - MEMS传感器、RF MEMS、生物MEMS、光学MEMS等
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
                  <Option value="敏芯股份">敏芯股份</Option>
                  <Option value="瑞声科技">瑞声科技</Option>
                  <Option value="森思泰克">森思泰克</Option>
                  <Option value="歌尔股份">歌尔股份</Option>
                  <Option value="中电科55所">中电科55所</Option>
                  <Option value="奥普拓">奥普拓</Option>
                  <Option value="奥普光电">奥普光电</Option>
                  <Option value="奥松电子">奥松电子</Option>
                  <Option value="泰晶科技">泰晶科技</Option>
                  <Option value="中科院光电院">中科院光电院</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="一级分类" name="primaryCategory">
                <Select placeholder="选择一级分类" allowClear>
                  <Option value="MEMS传感器">MEMS传感器</Option>
                  <Option value="RF MEMS">RF MEMS</Option>
                  <Option value="生物MEMS">生物MEMS</Option>
                  <Option value="光学MEMS">光学MEMS</Option>
                  <Option value="MEMS振荡器">MEMS振荡器</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="质量等级" name="qualityLevel">
                <Select placeholder="选择质量等级" allowClear>
                  <Option value="宇航级">宇航级</Option>
                  <Option value="军用级">军用级</Option>
                  <Option value="工业级">工业级</Option>
                  <Option value="汽车级">汽车级</Option>
                  <Option value="医用级">医用级</Option>
                  <Option value="消费级">消费级</Option>
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
            <Descriptions.Item label="工作电压">{selectedComponent.parameters.voltage}</Descriptions.Item>
            <Descriptions.Item label="工作电流">{selectedComponent.parameters.current}</Descriptions.Item>
            <Descriptions.Item label="功耗">{selectedComponent.parameters.power}</Descriptions.Item>
            <Descriptions.Item label="工作频率">{selectedComponent.parameters.frequency}</Descriptions.Item>
            <Descriptions.Item label="灵敏度">{selectedComponent.parameters.sensitivity}</Descriptions.Item>
            <Descriptions.Item label="测量范围">{selectedComponent.parameters.range}</Descriptions.Item>
            <Descriptions.Item label="精度">{selectedComponent.parameters.accuracy}</Descriptions.Item>
            <Descriptions.Item label="工作温度">{selectedComponent.parameters.temperature}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MicrosystemsSearch;
