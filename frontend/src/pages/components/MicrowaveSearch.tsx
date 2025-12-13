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

// 固态微波器件数据类型定义
interface MicrowaveComponent {
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
    frequency?: string;
    power?: string;
    gain?: string;
    noiseLevel?: string;
    vswr?: string;
    insertion?: string;
    isolation?: string;
    temperature?: string;
  };
}

// 固态微波器件测试数据
const mockMicrowaveData: MicrowaveComponent[] = [
  {
    id: 'MW001',
    partNumber: 'HMC-ALH382',
    manufacturer: '海特高新',
    primaryCategory: '功率放大器',
    secondaryCategory: 'GaN功率放大器',
    package: 'QFN-24',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'MIL-STD-202'],
    description: 'Ku波段GaN功率放大器，高效率',
    functionalPerformance: '14-18GHz，输出功率10W，效率>45%',
    referencePrice: 2800.00,
    parameters: {
      frequency: '14-18GHz',
      power: '10W',
      gain: '35dB',
      noiseLevel: '无',
      vswr: '<2.0:1',
      insertion: '无',
      isolation: '无',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'MW002',
    partNumber: 'LNA-X2015',
    manufacturer: '中电科13所',
    primaryCategory: '低噪声放大器',
    secondaryCategory: 'X波段LNA',
    package: 'SMT-8',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'MIL-STD-202'],
    description: 'X波段低噪声放大器，超低噪声',
    functionalPerformance: '8-12GHz，噪声系数<1.2dB',
    referencePrice: 1500.00,
    parameters: {
      frequency: '8-12GHz',
      power: '20dBm',
      gain: '28dB',
      noiseLevel: '<1.2dB',
      vswr: '<1.8:1',
      insertion: '无',
      isolation: '无',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'MW003',
    partNumber: 'MIX-KU301',
    manufacturer: '中科微至',
    primaryCategory: '混频器',
    secondaryCategory: '上变频器',
    package: 'QFN-16',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B'],
    description: 'Ku波段上变频器，低变频损耗',
    functionalPerformance: 'RF:12-18GHz，LO:10-16GHz',
    referencePrice: 980.00,
    parameters: {
      frequency: '12-18GHz',
      power: '15dBm',
      gain: '8dB',
      noiseLevel: '无',
      vswr: '<2.2:1',
      insertion: '<8dB',
      isolation: '>20dB',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'MW004',
    partNumber: 'OSC-C1000',
    manufacturer: '航天772所',
    primaryCategory: '振荡器',
    secondaryCategory: '压控振荡器',
    package: 'SMT-6',
    qualityLevel: '宇航级',
    lifecycle: '生产中',
    standards: ['Q/BA9001', 'GJB548B'],
    description: 'C波段压控振荡器，低相噪',
    functionalPerformance: '4-8GHz，相噪<-110dBc/Hz@10kHz',
    referencePrice: 3200.00,
    parameters: {
      frequency: '4-8GHz',
      power: '10dBm',
      gain: '无',
      noiseLevel: '<-110dBc/Hz',
      vswr: '<1.5:1',
      insertion: '无',
      isolation: '无',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'MW005',
    partNumber: 'SW-SPDT24',
    manufacturer: '中电科29所',
    primaryCategory: '开关',
    secondaryCategory: 'SPDT开关',
    package: 'QFN-12',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B'],
    description: '单刀双掷微波开关，快速切换',
    functionalPerformance: 'DC-24GHz，切换时间<50ns',
    referencePrice: 680.00,
    parameters: {
      frequency: 'DC-24GHz',
      power: '30dBm',
      gain: '无',
      noiseLevel: '无',
      vswr: '<1.8:1',
      insertion: '<1.5dB',
      isolation: '>60dB',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'MW006',
    partNumber: 'ATT-K015',
    manufacturer: '中电科55所',
    primaryCategory: '衰减器',
    secondaryCategory: '数字衰减器',
    package: 'QFN-20',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B'],
    description: 'K波段数字衰减器，6位控制',
    functionalPerformance: '18-26GHz，衰减范围0-31.5dB',
    referencePrice: 1200.00,
    parameters: {
      frequency: '18-26GHz',
      power: '20dBm',
      gain: '无',
      noiseLevel: '无',
      vswr: '<2.0:1',
      insertion: '<3dB',
      isolation: '无',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'MW007',
    partNumber: 'DET-S2000',
    manufacturer: '安徽博微',
    primaryCategory: '检波器',
    secondaryCategory: '对数检波器',
    package: 'SMT-10',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B'],
    description: 'S波段对数检波器，宽动态范围',
    functionalPerformance: '2-4GHz，动态范围>60dB',
    referencePrice: 850.00,
    parameters: {
      frequency: '2-4GHz',
      power: '20dBm',
      gain: '无',
      noiseLevel: '无',
      vswr: '<2.0:1',
      insertion: '无',
      isolation: '无',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'MW008',
    partNumber: 'DIV-X204',
    manufacturer: '中电科38所',
    primaryCategory: '功分器',
    secondaryCategory: '四路功分器',
    package: 'SMT-12',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B'],
    description: 'X波段四路功分器，低插损',
    functionalPerformance: '8-12GHz，插损<1.5dB',
    referencePrice: 420.00,
    parameters: {
      frequency: '8-12GHz',
      power: '30dBm',
      gain: '无',
      noiseLevel: '无',
      vswr: '<1.6:1',
      insertion: '<1.5dB',
      isolation: '>18dB',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'MW009',
    partNumber: 'CIR-KA180',
    manufacturer: '中电科14所',
    primaryCategory: '环行器',
    secondaryCategory: '三端口环行器',
    package: '金属封装',
    qualityLevel: '宇航级',
    lifecycle: '生产中',
    standards: ['Q/BA9001', 'GJB548B'],
    description: 'Ka波段环行器，高隔离度',
    functionalPerformance: '26-40GHz，隔离度>20dB',
    referencePrice: 1800.00,
    parameters: {
      frequency: '26-40GHz',
      power: '10W',
      gain: '无',
      noiseLevel: '无',
      vswr: '<1.5:1',
      insertion: '<0.8dB',
      isolation: '>20dB',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'MW010',
    partNumber: 'FIL-L1500',
    manufacturer: '成都亚光',
    primaryCategory: '滤波器',
    secondaryCategory: '带通滤波器',
    package: '陶瓷封装',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B'],
    description: 'L波段带通滤波器，陡峭截止',
    functionalPerformance: '1-2GHz，带外抑制>60dB',
    referencePrice: 650.00,
    parameters: {
      frequency: '1-2GHz',
      power: '50W',
      gain: '无',
      noiseLevel: '无',
      vswr: '<1.8:1',
      insertion: '<2dB',
      isolation: '无',
      temperature: '-55°C~+85°C'
    }
  }
];

const MicrowaveSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<MicrowaveComponent[]>(mockMicrowaveData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<MicrowaveComponent | null>(null);

  // 搜索处理
  const handleSearch = (values: any) => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = mockMicrowaveData;
      
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
      
      if (values.frequency) {
        filtered = filtered.filter(item => 
          item.parameters.frequency?.includes(values.frequency)
        );
      }
      
      setFilteredData(filtered);
      setLoading(false);
    }, 1000);
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setFilteredData(mockMicrowaveData);
  };

  // 查看详情
  const handleViewDetail = (record: MicrowaveComponent) => {
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
      width: 140,
      render: (text: string) => <Tag color="geekblue">{text}</Tag>,
    },
    {
      title: '频率范围',
      dataIndex: ['parameters', 'frequency'],
      key: 'frequency',
      width: 120,
      render: (text: string) => <Tag color="cyan">{text}</Tag>,
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
      sorter: (a: MicrowaveComponent, b: MicrowaveComponent) => a.referencePrice - b.referencePrice,
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
      render: (_: any, record: MicrowaveComponent) => (
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
            固态微波器件与电路
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0', fontSize: '14px' }}>
            Solid-State Microwave Devices & Circuits - 放大器、混频器、振荡器、开关等
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
                  <Option value="海特高新">海特高新</Option>
                  <Option value="中电科13所">中电科13所</Option>
                  <Option value="中科微至">中科微至</Option>
                  <Option value="航天772所">航天772所</Option>
                  <Option value="中电科29所">中电科29所</Option>
                  <Option value="中电科55所">中电科55所</Option>
                  <Option value="安徽博微">安徽博微</Option>
                  <Option value="中电科38所">中电科38所</Option>
                  <Option value="中电科14所">中电科14所</Option>
                  <Option value="成都亚光">成都亚光</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="一级分类" name="primaryCategory">
                <Select placeholder="选择一级分类" allowClear>
                  <Option value="功率放大器">功率放大器</Option>
                  <Option value="低噪声放大器">低噪声放大器</Option>
                  <Option value="混频器">混频器</Option>
                  <Option value="振荡器">振荡器</Option>
                  <Option value="开关">开关</Option>
                  <Option value="衰减器">衰减器</Option>
                  <Option value="检波器">检波器</Option>
                  <Option value="功分器">功分器</Option>
                  <Option value="环行器">环行器</Option>
                  <Option value="滤波器">滤波器</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="频率范围" name="frequency">
                <Select placeholder="选择频率范围" allowClear>
                  <Option value="L">L波段(1-2GHz)</Option>
                  <Option value="S">S波段(2-4GHz)</Option>
                  <Option value="C">C波段(4-8GHz)</Option>
                  <Option value="X">X波段(8-12GHz)</Option>
                  <Option value="Ku">Ku波段(12-18GHz)</Option>
                  <Option value="K">K波段(18-26GHz)</Option>
                  <Option value="Ka">Ka波段(26-40GHz)</Option>
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
            <Descriptions.Item label="频率范围">{selectedComponent.parameters.frequency}</Descriptions.Item>
            <Descriptions.Item label="输出功率">{selectedComponent.parameters.power}</Descriptions.Item>
            <Descriptions.Item label="增益">{selectedComponent.parameters.gain}</Descriptions.Item>
            <Descriptions.Item label="噪声系数">{selectedComponent.parameters.noiseLevel}</Descriptions.Item>
            <Descriptions.Item label="驻波比">{selectedComponent.parameters.vswr}</Descriptions.Item>
            <Descriptions.Item label="插入损耗">{selectedComponent.parameters.insertion}</Descriptions.Item>
            <Descriptions.Item label="隔离度">{selectedComponent.parameters.isolation}</Descriptions.Item>
            <Descriptions.Item label="工作温度">{selectedComponent.parameters.temperature}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MicrowaveSearch;
