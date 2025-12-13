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

// 半导体分立器件数据类型定义
interface DiscreteComponent {
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
    resistance?: string;
    capacitance?: string;
    inductance?: string;
  };
}

// 半导体分立器件测试数据
const mockDiscreteData: DiscreteComponent[] = [
  {
    id: 'DS001',
    partNumber: '1N4148W',
    manufacturer: '长电科技',
    primaryCategory: '二极管',
    secondaryCategory: '开关二极管',
    package: 'SOD-123',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'MIL-STD-750'],
    description: '高速开关二极管，低正向压降',
    functionalPerformance: '快速恢复时间4ns，低漏电流',
    referencePrice: 0.80,
    parameters: {
      voltage: '100V',
      current: '300mA',
      power: '500mW',
      temperature: '-55°C~+150°C',
      frequency: '无',
      resistance: '25Ω@100mA',
      capacitance: '4pF@0V',
      inductance: '无'
    }
  },
  {
    id: 'DS002',
    partNumber: 'MMBT2222A',
    manufacturer: '华润微电子',
    primaryCategory: '三极管',
    secondaryCategory: 'NPN三极管',
    package: 'SOT-23',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'MIL-STD-750'],
    description: 'NPN通用放大三极管',
    functionalPerformance: '高增益，低噪声，快速开关',
    referencePrice: 1.20,
    parameters: {
      voltage: '40V',
      current: '600mA',
      power: '1W',
      temperature: '-55°C~+150°C',
      frequency: '300MHz',
      resistance: '无',
      capacitance: '8pF',
      inductance: '无'
    }
  },
  {
    id: 'DS003',
    partNumber: 'IRFZ44N',
    manufacturer: '士兰微',
    primaryCategory: '场效应管',
    secondaryCategory: 'N沟道MOSFET',
    package: 'TO-220',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: 'N沟道功率MOSFET，低导通阻抗',
    functionalPerformance: '55V/49A，低Rds(on)=17.5mΩ',
    referencePrice: 8.50,
    parameters: {
      voltage: '55V',
      current: '49A',
      power: '94W',
      temperature: '-55°C~+175°C',
      frequency: '无',
      resistance: '17.5mΩ',
      capacitance: '1700pF',
      inductance: '无'
    }
  },
  {
    id: 'DS004',
    partNumber: 'BZX84C5V1',
    manufacturer: '韦尔股份',
    primaryCategory: '二极管',
    secondaryCategory: '稳压二极管',
    package: 'SOT-23',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '5.1V稳压二极管，低动态阻抗',
    functionalPerformance: '精密稳压，温度系数低',
    referencePrice: 0.45,
    parameters: {
      voltage: '5.1V',
      current: '300mA',
      power: '1.3W',
      temperature: '-65°C~+150°C',
      frequency: '无',
      resistance: '2Ω@5mA',
      capacitance: '无',
      inductance: '无'
    }
  },
  {
    id: 'DS005',
    partNumber: 'SS34',
    manufacturer: '捷捷微电',
    primaryCategory: '二极管',
    secondaryCategory: '肖特基二极管',
    package: 'SMA',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '肖特基整流二极管，低正向压降',
    functionalPerformance: '快速恢复，低功耗',
    referencePrice: 0.25,
    parameters: {
      voltage: '40V',
      current: '3A',
      power: '无',
      temperature: '-65°C~+150°C',
      frequency: '无',
      resistance: '无',
      capacitance: '无',
      inductance: '无'
    }
  },
  {
    id: 'DS006',
    partNumber: 'AO3401A',
    manufacturer: '新洁能',
    primaryCategory: '场效应管',
    secondaryCategory: 'P沟道MOSFET',
    package: 'SOT-23',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: 'P沟道小信号MOSFET',
    functionalPerformance: '-30V/-4A，低Rds(on)=44mΩ',
    referencePrice: 0.95,
    parameters: {
      voltage: '-30V',
      current: '-4A',
      power: '1.4W',
      temperature: '-55°C~+150°C',
      frequency: '无',
      resistance: '44mΩ',
      capacitance: '1050pF',
      inductance: '无'
    }
  },
  {
    id: 'DS007',
    partNumber: 'MMBT5551',
    manufacturer: '华微电子',
    primaryCategory: '三极管',
    secondaryCategory: 'NPN三极管',
    package: 'SOT-23',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'MIL-STD-750'],
    description: 'NPN高压三极管',
    functionalPerformance: '160V耐压，高增益hFE',
    referencePrice: 1.80,
    parameters: {
      voltage: '160V',
      current: '600mA',
      power: '625mW',
      temperature: '-55°C~+150°C',
      frequency: '100MHz',
      resistance: '无',
      capacitance: '4pF',
      inductance: '无'
    }
  },
  {
    id: 'DS008',
    partNumber: '1N5819',
    manufacturer: '扬杰科技',
    primaryCategory: '二极管',
    secondaryCategory: '肖特基二极管',
    package: 'DO-41',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '肖特基功率二极管',
    functionalPerformance: '40V/1A，低压降0.45V',
    referencePrice: 0.15,
    parameters: {
      voltage: '40V',
      current: '1A',
      power: '无',
      temperature: '-65°C~+125°C',
      frequency: '无',
      resistance: '无',
      capacitance: '无',
      inductance: '无'
    }
  },
  {
    id: 'DS009',
    partNumber: 'BC847C',
    manufacturer: '中芯国际',
    primaryCategory: '三极管',
    secondaryCategory: 'NPN三极管',
    package: 'SOT-23',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: 'NPN小信号三极管，高增益',
    functionalPerformance: '45V/100mA，hFE=420-800',
    referencePrice: 0.35,
    parameters: {
      voltage: '45V',
      current: '100mA',
      power: '250mW',
      temperature: '-55°C~+150°C',
      frequency: '300MHz',
      resistance: '无',
      capacitance: '6pF',
      inductance: '无'
    }
  },
  {
    id: 'DS010',
    partNumber: 'IRF540N',
    manufacturer: '华虹半导体',
    primaryCategory: '场效应管',
    secondaryCategory: 'N沟道MOSFET',
    package: 'TO-220',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: 'N沟道功率MOSFET',
    functionalPerformance: '100V/33A，Rds(on)=44mΩ',
    referencePrice: 12.50,
    parameters: {
      voltage: '100V',
      current: '33A',
      power: '130W',
      temperature: '-55°C~+175°C',
      frequency: '无',
      resistance: '44mΩ',
      capacitance: '1900pF',
      inductance: '无'
    }
  }
];

const DiscreteSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<DiscreteComponent[]>(mockDiscreteData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<DiscreteComponent | null>(null);

  // 搜索处理
  const handleSearch = (values: any) => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = mockDiscreteData;
      
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
    setFilteredData(mockDiscreteData);
  };

  // 查看详情
  const handleViewDetail = (record: DiscreteComponent) => {
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
      render: (text: string) => <Tag color="volcano">{text}</Tag>,
    },
    {
      title: '二级分类',
      dataIndex: 'secondaryCategory',
      key: 'secondaryCategory',
      width: 130,
      render: (text: string) => <Tag color="magenta">{text}</Tag>,
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
      sorter: (a: DiscreteComponent, b: DiscreteComponent) => a.referencePrice - b.referencePrice,
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
      render: (_: any, record: DiscreteComponent) => (
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
      <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #f5222d 0%, #cf1322 100%)' }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
            半导体分立器件
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0', fontSize: '14px' }}>
            Semiconductor Discrete Devices - 二极管、三极管、场效应管、晶闸管等
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
                  <Option value="长电科技">长电科技</Option>
                  <Option value="华润微电子">华润微电子</Option>
                  <Option value="士兰微">士兰微</Option>
                  <Option value="韦尔股份">韦尔股份</Option>
                  <Option value="捷捷微电">捷捷微电</Option>
                  <Option value="新洁能">新洁能</Option>
                  <Option value="华微电子">华微电子</Option>
                  <Option value="扬杰科技">扬杰科技</Option>
                  <Option value="中芯国际">中芯国际</Option>
                  <Option value="华虹半导体">华虹半导体</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="一级分类" name="primaryCategory">
                <Select placeholder="选择一级分类" allowClear>
                  <Option value="二极管">二极管</Option>
                  <Option value="三极管">三极管</Option>
                  <Option value="场效应管">场效应管</Option>
                  <Option value="晶闸管">晶闸管</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="二级分类" name="secondaryCategory">
                <Select placeholder="选择二级分类" allowClear>
                  <Option value="开关二极管">开关二极管</Option>
                  <Option value="稳压二极管">稳压二极管</Option>
                  <Option value="肖特基二极管">肖特基二极管</Option>
                  <Option value="整流二极管">整流二极管</Option>
                  <Option value="NPN三极管">NPN三极管</Option>
                  <Option value="PNP三极管">PNP三极管</Option>
                  <Option value="达林顿管">达林顿管</Option>
                  <Option value="N沟道MOSFET">N沟道MOSFET</Option>
                  <Option value="P沟道MOSFET">P沟道MOSFET</Option>
                  <Option value="N沟道JFET">N沟道JFET</Option>
                  <Option value="P沟道JFET">P沟道JFET</Option>
                  <Option value="单向晶闸管">单向晶闸管</Option>
                  <Option value="双向晶闸管">双向晶闸管</Option>
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
            <Descriptions.Item label="工作温度">{selectedComponent.parameters.temperature}</Descriptions.Item>
            <Descriptions.Item label="工作频率">{selectedComponent.parameters.frequency}</Descriptions.Item>
            <Descriptions.Item label="电阻">{selectedComponent.parameters.resistance}</Descriptions.Item>
            <Descriptions.Item label="电容">{selectedComponent.parameters.capacitance}</Descriptions.Item>
            <Descriptions.Item label="功率">{selectedComponent.parameters.power}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default DiscreteSearch;
