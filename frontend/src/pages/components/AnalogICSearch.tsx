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

// 模拟单片集成电路数据类型定义
interface AnalogComponent {
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
    temperature?: string;
    frequency?: string;
    gain?: string;
    bandwidth?: string;
    accuracy?: string;
  };
}

// 国产模拟单片集成电路测试数据
const mockAnalogData: AnalogComponent[] = [
  {
    id: 'A001',
    partNumber: 'CA3140E',
    manufacturer: '华润微电子',
    primaryCategory: '放大器类',
    secondaryCategory: '运算放大器',
    package: 'DIP-8',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'MIL-STD-883'],
    description: '高输入阻抗运算放大器，CMOS输入级',
    functionalPerformance: '4.5MHz增益带宽积，低失调电压',
    referencePrice: 8.50,
    parameters: {
      voltage: '±4V~±22V',
      current: '2mA@±15V',
      temperature: '-55°C~+125°C',
      frequency: '4.5MHz',
      gain: '100dB',
      bandwidth: '4.5MHz',
      accuracy: '±2mV'
    }
  },
  {
    id: 'A002',
    partNumber: 'LM358N',
    manufacturer: '士兰微',
    primaryCategory: '放大器类',
    secondaryCategory: '运算放大器',
    package: 'DIP-8',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747', 'JESD30'],
    description: '双路低功耗运算放大器',
    functionalPerformance: '单电源供电，宽共模输入范围',
    referencePrice: 3.20,
    parameters: {
      voltage: '3V~32V',
      current: '0.7mA@30V',
      temperature: '-40°C~+85°C',
      frequency: '1MHz',
      gain: '100dB',
      bandwidth: '1MHz',
      accuracy: '±3mV'
    }
  },
  {
    id: 'A003',
    partNumber: 'ADC0804',
    manufacturer: '中芯国际',
    primaryCategory: '数据转换器',
    secondaryCategory: '模数转换器(ADC)',
    package: 'DIP-20',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60748', 'JESD22'],
    description: '8位逐次逼近型ADC，内置时钟',
    functionalPerformance: '100μs转换时间，±1/2LSB线性度',
    referencePrice: 12.80,
    parameters: {
      voltage: '5V±5%',
      current: '3mA@5V',
      temperature: '-40°C~+85°C',
      frequency: '640kHz',
      gain: '无',
      bandwidth: '无',
      accuracy: '±1/2LSB'
    }
  },
  {
    id: 'A004',
    partNumber: 'DAC0832',
    manufacturer: '华大半导体',
    primaryCategory: '数据转换器',
    secondaryCategory: '数模转换器(DAC)',
    package: 'DIP-20',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'MIL-STD-883'],
    description: '8位乘法型DAC，快速建立时间',
    functionalPerformance: '1μs建立时间，±1/2LSB线性度',
    referencePrice: 18.60,
    parameters: {
      voltage: '5V~15V',
      current: '2.3mA@15V',
      temperature: '-55°C~+125°C',
      frequency: '无',
      gain: '无',
      bandwidth: '无',
      accuracy: '±1/2LSB'
    }
  },
  {
    id: 'A005',
    partNumber: 'NE555P',
    manufacturer: '韦尔股份',
    primaryCategory: '时序电路',
    secondaryCategory: '定时器',
    package: 'DIP-8',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '精密定时器，多种工作模式',
    functionalPerformance: '单稳态、双稳态、无稳态工作模式',
    referencePrice: 2.50,
    parameters: {
      voltage: '4.5V~16V',
      current: '3mA@5V',
      temperature: '-40°C~+85°C',
      frequency: '500kHz',
      gain: '无',
      bandwidth: '无',
      accuracy: '±50ppm/°C'
    }
  },
  {
    id: 'A006',
    partNumber: 'LM317T',
    manufacturer: '圣邦微电子',
    primaryCategory: '电源管理',
    secondaryCategory: '线性稳压器',
    package: 'TO-220',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '可调正电压稳压器',
    functionalPerformance: '1.25V~37V输出，1.5A输出电流',
    referencePrice: 4.80,
    parameters: {
      voltage: '3V~40V',
      current: '1.5A',
      temperature: '-55°C~+150°C',
      frequency: '无',
      gain: '无',
      bandwidth: '无',
      accuracy: '±1%'
    }
  },
  {
    id: 'A007',
    partNumber: 'CD4017BE',
    manufacturer: '中科银河芯',
    primaryCategory: '时序电路',
    secondaryCategory: '计数器',
    package: 'DIP-16',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '十进制计数器/分频器',
    functionalPerformance: 'CMOS工艺，低功耗设计',
    referencePrice: 1.80,
    parameters: {
      voltage: '3V~18V',
      current: '0.01mA@5V',
      temperature: '-55°C~+125°C',
      frequency: '5MHz',
      gain: '无',
      bandwidth: '无',
      accuracy: '±1计数'
    }
  },
  {
    id: 'A008',
    partNumber: 'TL072CP',
    manufacturer: '芯海科技',
    primaryCategory: '放大器类',
    secondaryCategory: '运算放大器',
    package: 'DIP-8',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '双路JFET输入运算放大器',
    functionalPerformance: '低噪声，高输入阻抗',
    referencePrice: 6.20,
    parameters: {
      voltage: '±6V~±18V',
      current: '2.5mA@±15V',
      temperature: '-40°C~+85°C',
      frequency: '3MHz',
      gain: '106dB',
      bandwidth: '3MHz',
      accuracy: '±6mV'
    }
  },
  {
    id: 'A009',
    partNumber: 'LM324N',
    manufacturer: '新洁能',
    primaryCategory: '放大器类',
    secondaryCategory: '运算放大器',
    package: 'DIP-14',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '四路运算放大器，单电源供电',
    functionalPerformance: '低功耗，宽电源电压范围',
    referencePrice: 2.80,
    parameters: {
      voltage: '3V~32V',
      current: '0.8mA@30V',
      temperature: '-40°C~+85°C',
      frequency: '1MHz',
      gain: '100dB',
      bandwidth: '1MHz',
      accuracy: '±7mV'
    }
  },
  {
    id: 'A010',
    partNumber: 'MC1458P',
    manufacturer: '长电科技',
    primaryCategory: '放大器类',
    secondaryCategory: '运算放大器',
    package: 'DIP-8',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'MIL-STD-883'],
    description: '双路运算放大器，高可靠性',
    functionalPerformance: '内部频率补偿，短路保护',
    referencePrice: 15.50,
    parameters: {
      voltage: '±3V~±18V',
      current: '2.8mA@±15V',
      temperature: '-55°C~+125°C',
      frequency: '1MHz',
      gain: '94dB',
      bandwidth: '1MHz',
      accuracy: '±5mV'
    }
  }
];

const AnalogICSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<AnalogComponent[]>(mockAnalogData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<AnalogComponent | null>(null);

  // 搜索处理
  const handleSearch = (values: any) => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = mockAnalogData;
      
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
    setFilteredData(mockAnalogData);
  };

  // 查看详情
  const handleViewDetail = (record: AnalogComponent) => {
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
      render: (text: string) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: '二级分类',
      dataIndex: 'secondaryCategory',
      key: 'secondaryCategory',
      width: 130,
      render: (text: string) => <Tag color="orange">{text}</Tag>,
    },
    {
      title: '封装',
      dataIndex: 'package',
      key: 'package',
      width: 100,
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
      width: 100,
      sorter: (a: AnalogComponent, b: AnalogComponent) => a.referencePrice - b.referencePrice,
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
      title: '生命周期',
      dataIndex: 'lifecycle',
      key: 'lifecycle',
      width: 100,
      render: (lifecycle: string) => {
        const colorMap: { [key: string]: string } = {
          '生产中': 'green',
          '工程样片': 'orange',
          '停产': 'red'
        };
        return <Tag color={colorMap[lifecycle] || 'default'}>{lifecycle}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: AnalogComponent) => (
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
      <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)' }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
            模拟单片集成电路
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0', fontSize: '14px' }}>
            Analog Integrated Circuits - 运算放大器、数据转换器、电源管理、时序电路等
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
                  <Option value="华润微电子">华润微电子</Option>
                  <Option value="士兰微">士兰微</Option>
                  <Option value="中芯国际">中芯国际</Option>
                  <Option value="华大半导体">华大半导体</Option>
                  <Option value="韦尔股份">韦尔股份</Option>
                  <Option value="圣邦微电子">圣邦微电子</Option>
                  <Option value="中科银河芯">中科银河芯</Option>
                  <Option value="芯海科技">芯海科技</Option>
                  <Option value="新洁能">新洁能</Option>
                  <Option value="长电科技">长电科技</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="一级分类" name="primaryCategory">
                <Select placeholder="选择一级分类" allowClear>
                  <Option value="放大器类">放大器类</Option>
                  <Option value="数据转换器">数据转换器</Option>
                  <Option value="时序电路">时序电路</Option>
                  <Option value="电源管理">电源管理</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="二级分类" name="secondaryCategory">
                <Select placeholder="选择二级分类" allowClear>
                  <Option value="运算放大器">运算放大器</Option>
                  <Option value="仪表放大器">仪表放大器</Option>
                  <Option value="比较器">比较器</Option>
                  <Option value="模数转换器(ADC)">模数转换器(ADC)</Option>
                  <Option value="数模转换器(DAC)">数模转换器(DAC)</Option>
                  <Option value="定时器">定时器</Option>
                  <Option value="计数器">计数器</Option>
                  <Option value="振荡器">振荡器</Option>
                  <Option value="线性稳压器">线性稳压器</Option>
                  <Option value="开关稳压器">开关稳压器</Option>
                  <Option value="电压基准">电压基准</Option>
                  <Option value="电源监控">电源监控</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
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
          scroll={{ x: 1200 }}
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
                  <Tag key={std} color="purple">{std}</Tag>
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
            <Descriptions.Item label="工作温度">{selectedComponent.parameters.temperature}</Descriptions.Item>
            <Descriptions.Item label="工作频率">{selectedComponent.parameters.frequency}</Descriptions.Item>
            <Descriptions.Item label="增益">{selectedComponent.parameters.gain}</Descriptions.Item>
            <Descriptions.Item label="带宽">{selectedComponent.parameters.bandwidth}</Descriptions.Item>
            <Descriptions.Item label="精度">{selectedComponent.parameters.accuracy}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AnalogICSearch;
