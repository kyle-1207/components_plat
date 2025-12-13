import React, { useState, useEffect } from 'react';
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
  Divider,
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

// 真空电子器件数据类型定义
interface VacuumComponent {
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
    gain?: string;
    cathode?: string;
    filament?: string;
    temperature?: string;
  };
}

// 真空电子器件测试数据
const mockVacuumData: VacuumComponent[] = [
  {
    id: 'VT001',
    partNumber: 'TWT-X2000',
    manufacturer: '中电科12所',
    primaryCategory: '行波管',
    secondaryCategory: 'X波段行波管',
    package: '金属陶瓷封装',
    qualityLevel: '宇航级',
    lifecycle: '生产中',
    standards: ['Q/BA9001', 'GJB548B'],
    description: 'X波段脉冲行波管，高功率输出',
    functionalPerformance: '8-12GHz，峰值功率5kW',
    referencePrice: 180000.00,
    parameters: {
      voltage: '12kV',
      current: '800mA',
      power: '5kW',
      frequency: '8-12GHz',
      gain: '40dB',
      cathode: '钨丝阴极',
      filament: '6.3V/2A',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'VT002',
    partNumber: 'MAG-S500',
    manufacturer: '中电科16所',
    primaryCategory: '磁控管',
    secondaryCategory: 'S波段磁控管',
    package: '金属封装',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B', 'MIL-STD-202'],
    description: 'S波段脉冲磁控管，大功率',
    functionalPerformance: '2.8-3.2GHz，峰值功率500kW',
    referencePrice: 85000.00,
    parameters: {
      voltage: '25kV',
      current: '30A',
      power: '500kW',
      frequency: '2.8-3.2GHz',
      gain: '无',
      cathode: '热阴极',
      filament: '6.3V/10A',
      temperature: '-40°C~+70°C'
    }
  },
  {
    id: 'VT003',
    partNumber: 'KLY-L1200',
    manufacturer: '中电科8所',
    primaryCategory: '速调管',
    secondaryCategory: 'L波段速调管',
    package: '金属陶瓷封装',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B'],
    description: 'L波段多腔速调管放大器',
    functionalPerformance: '1-2GHz，连续功率1.2kW',
    referencePrice: 120000.00,
    parameters: {
      voltage: '8kV',
      current: '200mA',
      power: '1.2kW',
      frequency: '1-2GHz',
      gain: '45dB',
      cathode: '氧化物阴极',
      filament: '6.3V/1.5A',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'VT004',
    partNumber: 'GYR-C100',
    manufacturer: '航天504所',
    primaryCategory: '回转管',
    secondaryCategory: '陀螺管',
    package: '金属封装',
    qualityLevel: '宇航级',
    lifecycle: '生产中',
    standards: ['Q/BA9001'],
    description: 'C波段陀螺管，高功率毫米波',
    functionalPerformance: '4-8GHz，连续功率100kW',
    referencePrice: 350000.00,
    parameters: {
      voltage: '80kV',
      current: '3A',
      power: '100kW',
      frequency: '4-8GHz',
      gain: '50dB',
      cathode: '热阴极',
      filament: '6.3V/15A',
      temperature: '-40°C~+70°C'
    }
  },
  {
    id: 'VT005',
    partNumber: 'IOT-UHF800',
    manufacturer: '中电科7所',
    primaryCategory: '感应输出管',
    secondaryCategory: 'UHF感应输出管',
    package: '陶瓷金属封装',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60130'],
    description: 'UHF感应输出管，广播发射',
    functionalPerformance: '470-860MHz，连续功率800W',
    referencePrice: 25000.00,
    parameters: {
      voltage: '3kV',
      current: '350mA',
      power: '800W',
      frequency: '470-860MHz',
      gain: '18dB',
      cathode: '氧化物阴极',
      filament: '12.6V/0.8A',
      temperature: '-20°C~+70°C'
    }
  },
  {
    id: 'VT006',
    partNumber: 'CRT-14B',
    manufacturer: '彩虹集团',
    primaryCategory: '显像管',
    secondaryCategory: '14寸黑白显像管',
    package: '玻璃封装',
    qualityLevel: '工业级',
    lifecycle: '停产',
    standards: ['GB/T5313'],
    description: '14寸黑白显像管，监视器用',
    functionalPerformance: '分辨率800×600，亮度300cd/m²',
    referencePrice: 0.00,
    parameters: {
      voltage: '12kV',
      current: '100μA',
      power: '45W',
      frequency: '无',
      gain: '无',
      cathode: '氧化物阴极',
      filament: '6.3V/0.3A',
      temperature: '0°C~+40°C'
    }
  },
  {
    id: 'VT007',
    partNumber: 'PMT-R928',
    manufacturer: '北方夜视',
    primaryCategory: '光电倍增管',
    secondaryCategory: '侧窗型光电倍增管',
    package: '玻璃封装',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B'],
    description: '9级倍增侧窗型光电倍增管',
    functionalPerformance: '光谱响应300-650nm，增益10⁶',
    referencePrice: 3200.00,
    parameters: {
      voltage: '1250V',
      current: '100μA',
      power: '2.5W',
      frequency: '无',
      gain: '10⁶',
      cathode: 'S-20光阴极',
      filament: '无',
      temperature: '-30°C~+50°C'
    }
  },
  {
    id: 'VT008',
    partNumber: 'XRT-Cu100',
    manufacturer: '东软医疗',
    primaryCategory: 'X射线管',
    secondaryCategory: '旋转阳极X射线管',
    package: '金属玻璃封装',
    qualityLevel: '医用级',
    lifecycle: '生产中',
    standards: ['IEC-60601'],
    description: '医用旋转阳极X射线管',
    functionalPerformance: '管电压150kV，管电流1000mA',
    referencePrice: 45000.00,
    parameters: {
      voltage: '150kV',
      current: '1000mA',
      power: '100kW',
      frequency: '无',
      gain: '无',
      cathode: '钨丝阴极',
      filament: '11V/7A',
      temperature: '-10°C~+40°C'
    }
  }
];

const VacuumSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VacuumComponent[]>(mockVacuumData);
  const [filteredData, setFilteredData] = useState<VacuumComponent[]>(mockVacuumData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<VacuumComponent | null>(null);

  // 搜索处理
  const handleSearch = (values: any) => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = mockVacuumData;
      
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
    setFilteredData(mockVacuumData);
  };

  // 查看详情
  const handleViewDetail = (record: VacuumComponent) => {
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
      width: 160,
      render: (text: string) => <Tag color="orange">{text}</Tag>,
    },
    {
      title: '封装',
      dataIndex: 'package',
      key: 'package',
      width: 140,
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
      sorter: (a: VacuumComponent, b: VacuumComponent) => a.referencePrice - b.referencePrice,
      render: (price: number) => {
        if (price === 0) {
          return <span style={{ color: '#999' }}>停产</span>;
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
          '医用级': 'purple',
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
      render: (_: any, record: VacuumComponent) => (
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
      <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)' }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
            真空电子器件
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0', fontSize: '14px' }}>
            Vacuum Electronic Devices - 电子管、显像管、X射线管、光电倍增管等
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
                  <Option value="中电科12所">中电科12所</Option>
                  <Option value="中电科16所">中电科16所</Option>
                  <Option value="中电科8所">中电科8所</Option>
                  <Option value="航天504所">航天504所</Option>
                  <Option value="中电科7所">中电科7所</Option>
                  <Option value="彩虹集团">彩虹集团</Option>
                  <Option value="北方夜视">北方夜视</Option>
                  <Option value="东软医疗">东软医疗</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="一级分类" name="primaryCategory">
                <Select placeholder="选择一级分类" allowClear>
                  <Option value="行波管">行波管</Option>
                  <Option value="磁控管">磁控管</Option>
                  <Option value="速调管">速调管</Option>
                  <Option value="回转管">回转管</Option>
                  <Option value="感应输出管">感应输出管</Option>
                  <Option value="显像管">显像管</Option>
                  <Option value="光电倍增管">光电倍增管</Option>
                  <Option value="X射线管">X射线管</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="质量等级" name="qualityLevel">
                <Select placeholder="选择质量等级" allowClear>
                  <Option value="宇航级">宇航级</Option>
                  <Option value="军用级">军用级</Option>
                  <Option value="工业级">工业级</Option>
                  <Option value="医用级">医用级</Option>
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
                <span style={{ color: '#999' }}>停产</span>
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
            <Descriptions.Item label="输出功率">{selectedComponent.parameters.power}</Descriptions.Item>
            <Descriptions.Item label="工作频率">{selectedComponent.parameters.frequency}</Descriptions.Item>
            <Descriptions.Item label="增益">{selectedComponent.parameters.gain}</Descriptions.Item>
            <Descriptions.Item label="阴极类型">{selectedComponent.parameters.cathode}</Descriptions.Item>
            <Descriptions.Item label="灯丝规格">{selectedComponent.parameters.filament}</Descriptions.Item>
            <Descriptions.Item label="工作温度">{selectedComponent.parameters.temperature}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default VacuumSearch;
