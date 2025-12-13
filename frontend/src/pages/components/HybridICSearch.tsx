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

// 混合集成电路数据类型定义
interface HybridComponent {
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
    isolation?: string;
  };
}

// 混合集成电路测试数据
const mockHybridData: HybridComponent[] = [
  {
    id: 'H001',
    partNumber: 'HMC1023LC4',
    manufacturer: '海光信息',
    primaryCategory: '射频混合电路',
    secondaryCategory: '低噪声放大器',
    package: 'QFN-16',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'MIL-STD-883'],
    description: '宽带低噪声放大器，0.1-20GHz',
    functionalPerformance: '低噪声系数，高增益，宽频带',
    referencePrice: 280.00,
    parameters: {
      voltage: '5V±5%',
      current: '85mA',
      power: '425mW',
      temperature: '-55°C~+85°C',
      frequency: '0.1GHz~20GHz',
      gain: '18dB',
      bandwidth: '19.9GHz',
      isolation: '25dB'
    }
  },
  {
    id: 'H002',
    partNumber: 'HMC544LC4',
    manufacturer: '中电科技',
    primaryCategory: '射频混合电路',
    secondaryCategory: '功率放大器',
    package: 'QFN-24',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'MIL-STD-883'],
    description: '高功率射频放大器，2-18GHz',
    functionalPerformance: '高输出功率，宽频带响应',
    referencePrice: 450.00,
    parameters: {
      voltage: '8V±5%',
      current: '200mA',
      power: '1.6W',
      temperature: '-55°C~+85°C',
      frequency: '2GHz~18GHz',
      gain: '15dB',
      bandwidth: '16GHz',
      isolation: '20dB'
    }
  },
  {
    id: 'H003',
    partNumber: 'HMC213MS8',
    manufacturer: '航天科工',
    primaryCategory: '射频混合电路',
    secondaryCategory: '混频器',
    package: 'MSOP-8',
    qualityLevel: '宇航级',
    lifecycle: '生产中',
    standards: ['QML-V', 'MIL-PRF-38534'],
    description: '双平衡混频器，DC-8GHz',
    functionalPerformance: '低转换损耗，高隔离度',
    referencePrice: 520.00,
    parameters: {
      voltage: '5V±10%',
      current: '25mA',
      power: '125mW',
      temperature: '-55°C~+125°C',
      frequency: 'DC~8GHz',
      gain: '8dB转换增益',
      bandwidth: '8GHz',
      isolation: '35dB'
    }
  },
  {
    id: 'H004',
    partNumber: 'HMC987LC5',
    manufacturer: '中科微至',
    primaryCategory: '射频混合电路',
    secondaryCategory: '衰减器',
    package: 'QFN-20',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'MIL-STD-883'],
    description: '数字可控衰减器，DC-18GHz',
    functionalPerformance: '6位数字控制，0.5dB步进',
    referencePrice: 320.00,
    parameters: {
      voltage: '3.3V±5%',
      current: '45mA',
      power: '150mW',
      temperature: '-55°C~+85°C',
      frequency: 'DC~18GHz',
      gain: '0~31.5dB衰减',
      bandwidth: '18GHz',
      isolation: '30dB'
    }
  },
  {
    id: 'H005',
    partNumber: 'HMC641LC4',
    manufacturer: '华进半导体',
    primaryCategory: '模拟混合电路',
    secondaryCategory: '运算放大器',
    package: 'QFN-16',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '高速运算放大器，精密级',
    functionalPerformance: '低失调，高转换率',
    referencePrice: 85.00,
    parameters: {
      voltage: '±15V',
      current: '8mA',
      power: '240mW',
      temperature: '-40°C~+85°C',
      frequency: '100MHz',
      gain: '120dB',
      bandwidth: '100MHz',
      isolation: '无'
    }
  },
  {
    id: 'H006',
    partNumber: 'HMC832LC3',
    manufacturer: '紫光同创',
    primaryCategory: '时钟混合电路',
    secondaryCategory: '锁相环',
    package: 'QFN-32',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '整数N分频PLL，25MHz-3GHz',
    functionalPerformance: '低相位噪声，快速锁定',
    referencePrice: 180.00,
    parameters: {
      voltage: '3.3V±5%',
      current: '95mA',
      power: '315mW',
      temperature: '-40°C~+85°C',
      frequency: '25MHz~3GHz',
      gain: '无',
      bandwidth: '2.975GHz',
      isolation: '无'
    }
  },
  {
    id: 'H007',
    partNumber: 'HMC754LC3',
    manufacturer: '安路科技',
    primaryCategory: '功率混合电路',
    secondaryCategory: '功率控制器',
    package: 'QFN-20',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'MIL-STD-883'],
    description: '射频功率检测器，DC-40GHz',
    functionalPerformance: '宽动态范围，线性响应',
    referencePrice: 220.00,
    parameters: {
      voltage: '5V±5%',
      current: '12mA',
      power: '60mW',
      temperature: '-55°C~+85°C',
      frequency: 'DC~40GHz',
      gain: '无',
      bandwidth: '40GHz',
      isolation: '无'
    }
  },
  {
    id: 'H008',
    partNumber: 'HMC892LC4',
    manufacturer: '全志科技',
    primaryCategory: '开关混合电路',
    secondaryCategory: '射频开关',
    package: 'QFN-16',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: 'SPDT射频开关，DC-26.5GHz',
    functionalPerformance: '低插入损耗，高隔离度',
    referencePrice: 120.00,
    parameters: {
      voltage: '3.3V/5V',
      current: '15mA',
      power: '75mW',
      temperature: '-40°C~+85°C',
      frequency: 'DC~26.5GHz',
      gain: '无',
      bandwidth: '26.5GHz',
      isolation: '50dB'
    }
  }
];

const HybridICSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<HybridComponent[]>(mockHybridData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<HybridComponent | null>(null);

  // 搜索处理
  const handleSearch = (values: any) => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = mockHybridData;
      
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
    setFilteredData(mockHybridData);
  };

  // 查看详情
  const handleViewDetail = (record: HybridComponent) => {
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
      width: 130,
      render: (text: string) => <Tag color="geekblue">{text}</Tag>,
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
      sorter: (a: HybridComponent, b: HybridComponent) => a.referencePrice - b.referencePrice,
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
      render: (_: any, record: HybridComponent) => (
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
            混合集成电路
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0', fontSize: '14px' }}>
            Hybrid Integrated Circuits - 射频电路、模拟电路、功率电路、时钟电路等
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
                  <Option value="海光信息">海光信息</Option>
                  <Option value="中电科技">中电科技</Option>
                  <Option value="航天科工">航天科工</Option>
                  <Option value="中科微至">中科微至</Option>
                  <Option value="华进半导体">华进半导体</Option>
                  <Option value="紫光同创">紫光同创</Option>
                  <Option value="安路科技">安路科技</Option>
                  <Option value="全志科技">全志科技</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="一级分类" name="primaryCategory">
                <Select placeholder="选择一级分类" allowClear>
                  <Option value="射频混合电路">射频混合电路</Option>
                  <Option value="模拟混合电路">模拟混合电路</Option>
                  <Option value="时钟混合电路">时钟混合电路</Option>
                  <Option value="功率混合电路">功率混合电路</Option>
                  <Option value="开关混合电路">开关混合电路</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="二级分类" name="secondaryCategory">
                <Select placeholder="选择二级分类" allowClear>
                  <Option value="低噪声放大器">低噪声放大器</Option>
                  <Option value="功率放大器">功率放大器</Option>
                  <Option value="混频器">混频器</Option>
                  <Option value="衰减器">衰减器</Option>
                  <Option value="运算放大器">运算放大器</Option>
                  <Option value="锁相环">锁相环</Option>
                  <Option value="功率控制器">功率控制器</Option>
                  <Option value="射频开关">射频开关</Option>
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
                  <Tag key={std} color="cyan">{std}</Tag>
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
            <Descriptions.Item label="隔离度">{selectedComponent.parameters.isolation}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default HybridICSearch;
