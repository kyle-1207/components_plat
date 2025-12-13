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

// 数字单片集成电路数据类型定义
interface DigitalComponent {
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
    memory?: string;
    speed?: string;
  };
}

// 国产数字单片集成电路测试数据
const mockDigitalData: DigitalComponent[] = [
  {
    id: 'D001',
    partNumber: 'GD32F407VET6',
    manufacturer: '兆易创新',
    primaryCategory: '处理器类',
    secondaryCategory: '微控制器(MCU)',
    package: 'LQFP-100',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60749', 'AEC-Q100'],
    description: '32位ARM Cortex-M4内核微控制器',
    functionalPerformance: '168MHz主频，512KB Flash，192KB SRAM',
    referencePrice: 15.80,
    parameters: {
      voltage: '2.6V~3.6V',
      current: '50mA@168MHz',
      temperature: '-40°C~+85°C',
      frequency: '168MHz',
      memory: '512KB Flash + 192KB SRAM'
    }
  },
  {
    id: 'D002',
    partNumber: 'AC7015',
    manufacturer: '复旦微电子',
    primaryCategory: '处理器类',
    secondaryCategory: '现场可编程门阵列(FPGA)',
    package: 'FBGA-484',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'MIL-STD-883'],
    description: '低功耗FPGA芯片，适用于航天应用',
    functionalPerformance: '15K逻辑单元，36个DSP模块，抗辐照设计',
    referencePrice: 850.00,
    parameters: {
      voltage: '1.0V~1.05V',
      current: '150mA@1.0V',
      temperature: '-55°C~+125°C',
      frequency: '300MHz',
      memory: '540Kb块RAM'
    }
  },
  {
    id: 'D003',
    partNumber: 'EM636165TS',
    manufacturer: '上海华虹',
    primaryCategory: '存储器类',
    secondaryCategory: '静态随机存储器(SRAM)',
    package: 'TSOP-44',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['JESD21-C', 'JESD79'],
    description: '16Mb高速SRAM，低功耗设计',
    functionalPerformance: '2M×8位组织，存取时间10ns',
    referencePrice: 28.50,
    parameters: {
      voltage: '3.0V~3.6V',
      current: '90mA@3.3V',
      temperature: '-40°C~+85°C',
      frequency: '100MHz',
      memory: '16Mb'
    }
  },
  {
    id: 'D004',
    partNumber: 'BF533SBBC600',
    manufacturer: '中科昊芯',
    primaryCategory: '处理器类',
    secondaryCategory: '数字信号处理器(DSP)',
    package: 'PBGA-88',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'QJ3234'],
    description: '高性能16位定点DSP处理器',
    functionalPerformance: '600MHz主频，单周期MAC运算',
    referencePrice: 320.00,
    parameters: {
      voltage: '1.2V~1.32V',
      current: '300mA@600MHz',
      temperature: '-55°C~+125°C',
      frequency: '600MHz',
      memory: '148KB内置存储器'
    }
  },
  {
    id: 'D005',
    partNumber: 'HC574A',
    manufacturer: '华润微电子',
    primaryCategory: '逻辑器件类',
    secondaryCategory: '计数器/定时器',
    package: 'SOP-20',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'MIL-STD-883'],
    description: '8位D型触发器，三态输出',
    functionalPerformance: '高速CMOS工艺，低功耗设计',
    referencePrice: 3.20,
    parameters: {
      voltage: '2.0V~6.0V',
      current: '8mA@6V',
      temperature: '-55°C~+125°C',
      frequency: '125MHz',
      memory: '8位寄存器'
    }
  },
  {
    id: 'D006',
    partNumber: 'CSM610A',
    manufacturer: '晶晨半导体',
    primaryCategory: '时钟管理类',
    secondaryCategory: '时钟发生器',
    package: 'QFN-20',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '多路输出时钟发生器，低抖动',
    functionalPerformance: '4路输出，频率范围1MHz~200MHz',
    referencePrice: 12.50,
    parameters: {
      voltage: '2.5V~3.3V',
      current: '45mA@3.3V',
      temperature: '-40°C~+85°C',
      frequency: '1MHz~200MHz',
      memory: '内置配置寄存器'
    }
  },
  {
    id: 'D007',
    partNumber: 'FM25V02A',
    manufacturer: '富满电子',
    primaryCategory: '存储器类',
    secondaryCategory: '闪存(Flash)',
    package: 'SOP-8',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['JESD216', 'IEC-60749'],
    description: '2Mb串行Flash存储器，SPI接口',
    functionalPerformance: '高速读写，100K次擦写循环',
    referencePrice: 4.80,
    parameters: {
      voltage: '2.7V~3.6V',
      current: '15mA@3.3V',
      temperature: '-40°C~+85°C',
      frequency: '104MHz SPI',
      memory: '2Mb'
    }
  },
  {
    id: 'D008',
    partNumber: 'AiP8548',
    manufacturer: '爱普特微电子',
    primaryCategory: '逻辑器件类',
    secondaryCategory: '编解码器',
    package: 'TSSOP-14',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '8位二进制译码器，低功耗CMOS',
    functionalPerformance: '3线到8线译码，使能控制功能',
    referencePrice: 1.50,
    parameters: {
      voltage: '2.0V~6.0V',
      current: '2mA@6V',
      temperature: '-40°C~+85°C',
      frequency: '100MHz',
      memory: '无'
    }
  },
  {
    id: 'D009',
    partNumber: 'PT2262',
    manufacturer: '普冉半导体',
    primaryCategory: '逻辑器件类',
    secondaryCategory: '多路复用器',
    package: 'DIP-18',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '遥控编码专用电路',
    functionalPerformance: 'CMOS工艺，12位三态地址/数据编码',
    referencePrice: 2.80,
    parameters: {
      voltage: '4V~15V',
      current: '5mA@12V',
      temperature: '-40°C~+85°C',
      frequency: '10kHz',
      memory: '12位编码'
    }
  },
  {
    id: 'D010',
    partNumber: 'SW3518S',
    manufacturer: '矽力杰',
    primaryCategory: '时钟管理类',
    secondaryCategory: '锁相环(PLL)',
    package: 'QFN-24',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '高性能时钟发生器PLL芯片',
    functionalPerformance: '低抖动，多种输出频率可选',
    referencePrice: 18.20,
    parameters: {
      voltage: '3.0V~3.6V',
      current: '35mA@3.3V',
      temperature: '-40°C~+85°C',
      frequency: '25MHz~800MHz',
      memory: '内置锁相环'
    }
  }
];

const DigitalICSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<DigitalComponent[]>(mockDigitalData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<DigitalComponent | null>(null);

  // 搜索处理
  const handleSearch = (values: any) => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = mockDigitalData;
      
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
    setFilteredData(mockDigitalData);
  };

  // 查看详情
  const handleViewDetail = (record: DigitalComponent) => {
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
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '二级分类',
      dataIndex: 'secondaryCategory',
      key: 'secondaryCategory',
      width: 130,
      render: (text: string) => <Tag color="green">{text}</Tag>,
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
      sorter: (a: DigitalComponent, b: DigitalComponent) => a.referencePrice - b.referencePrice,
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
          '量产': 'green',
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
      render: (_: any, record: DigitalComponent) => (
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
            数字单片集成电路
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0', fontSize: '14px' }}>
            Digital Integrated Circuits - 微处理器、存储器、逻辑器件、信号处理等
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
                  <Option value="兆易创新">兆易创新</Option>
                  <Option value="复旦微电子">复旦微电子</Option>
                  <Option value="上海华虹">上海华虹</Option>
                  <Option value="中科昊芯">中科昊芯</Option>
                  <Option value="华润微电子">华润微电子</Option>
                  <Option value="晶晨半导体">晶晨半导体</Option>
                  <Option value="富满电子">富满电子</Option>
                  <Option value="爱普特微电子">爱普特微电子</Option>
                  <Option value="普冉半导体">普冉半导体</Option>
                  <Option value="矽力杰">矽力杰</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="一级分类" name="primaryCategory">
                <Select placeholder="选择一级分类" allowClear>
                  <Option value="处理器类">处理器类</Option>
                  <Option value="存储器类">存储器类</Option>
                  <Option value="逻辑器件类">逻辑器件类</Option>
                  <Option value="时钟管理类">时钟管理类</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="二级分类" name="secondaryCategory">
                <Select placeholder="选择二级分类" allowClear>
                  <Option value="微处理器(CPU)">微处理器(CPU)</Option>
                  <Option value="微控制器(MCU)">微控制器(MCU)</Option>
                  <Option value="数字信号处理器(DSP)">数字信号处理器(DSP)</Option>
                  <Option value="现场可编程门阵列(FPGA)">现场可编程门阵列(FPGA)</Option>
                  <Option value="静态随机存储器(SRAM)">静态随机存储器(SRAM)</Option>
                  <Option value="动态随机存储器(DRAM)">动态随机存储器(DRAM)</Option>
                  <Option value="闪存(Flash)">闪存(Flash)</Option>
                  <Option value="只读存储器(ROM)">只读存储器(ROM)</Option>
                  <Option value="门电路">门电路</Option>
                  <Option value="计数器/定时器">计数器/定时器</Option>
                  <Option value="编解码器">编解码器</Option>
                  <Option value="多路复用器">多路复用器</Option>
                  <Option value="晶振">晶振</Option>
                  <Option value="时钟发生器">时钟发生器</Option>
                  <Option value="锁相环(PLL)">锁相环(PLL)</Option>
                  <Option value="时钟分配器">时钟分配器</Option>
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
                  <Option value="量产">量产</Option>
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
                  <Tag key={std} color="blue">{std}</Tag>
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
            <Descriptions.Item label="存储容量">{selectedComponent.parameters.memory}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default DigitalICSearch;
