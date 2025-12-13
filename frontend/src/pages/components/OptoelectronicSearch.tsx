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

// 光电子器件数据类型定义
interface OptoelectronicComponent {
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
    wavelength?: string;
    power?: string;
    current?: string;
    voltage?: string;
    efficiency?: string;
    response?: string;
    bandwidth?: string;
    temperature?: string;
  };
}

// 光电子器件测试数据
const mockOptoData: OptoelectronicComponent[] = [
  {
    id: 'OE001',
    partNumber: 'LD-1550-100',
    manufacturer: '光迅科技',
    primaryCategory: '激光器',
    secondaryCategory: 'DFB激光器',
    package: 'TO-56',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['ITU-T G.692', 'Telcordia GR-468'],
    description: '1550nm DFB激光器，单模光纤通信',
    functionalPerformance: '1550nm，输出功率100mW，边模抑制比>40dB',
    referencePrice: 850.00,
    parameters: {
      wavelength: '1550nm',
      power: '100mW',
      current: '150mA',
      voltage: '1.8V',
      efficiency: '35%',
      response: '10GHz',
      bandwidth: '40nm',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'OE002',
    partNumber: 'PD-InGaAs-10G',
    manufacturer: '海光芯创',
    primaryCategory: '光电探测器',
    secondaryCategory: 'InGaAs光电二极管',
    package: 'TO-46',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['ITU-T G.957'],
    description: 'InGaAs PIN光电二极管，高速响应',
    functionalPerformance: '800-1700nm，响应度0.9A/W@1550nm',
    referencePrice: 320.00,
    parameters: {
      wavelength: '800-1700nm',
      power: '10mW',
      current: '10μA',
      voltage: '5V',
      efficiency: '90%',
      response: '10GHz',
      bandwidth: '900nm',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'OE003',
    partNumber: 'LED-850-SM',
    manufacturer: '三安光电',
    primaryCategory: '发光二极管',
    secondaryCategory: '850nm LED',
    package: 'TO-18',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: '850nm LED，多模光纤通信',
    functionalPerformance: '850nm，输出功率-3dBm，数值孔径0.2',
    referencePrice: 45.00,
    parameters: {
      wavelength: '850nm',
      power: '1mW',
      current: '100mA',
      voltage: '1.8V',
      efficiency: '15%',
      response: '100MHz',
      bandwidth: '50nm',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'OE004',
    partNumber: 'VCSEL-940-Array',
    manufacturer: '纵慧芯光',
    primaryCategory: '垂直腔面发射激光器',
    secondaryCategory: '940nm VCSEL阵列',
    package: 'TO-39',
    qualityLevel: '汽车级',
    lifecycle: '生产中',
    standards: ['AEC-Q102'],
    description: '940nm VCSEL阵列，激光雷达应用',
    functionalPerformance: '940nm，16×16阵列，总功率40W',
    referencePrice: 1200.00,
    parameters: {
      wavelength: '940nm',
      power: '40W',
      current: '20A',
      voltage: '32V',
      efficiency: '45%',
      response: '1GHz',
      bandwidth: '2nm',
      temperature: '-40°C~+105°C'
    }
  },
  {
    id: 'OE005',
    partNumber: 'APD-Si-100M',
    manufacturer: '奥普拓激光',
    primaryCategory: '雪崩光电二极管',
    secondaryCategory: '硅APD',
    package: 'TO-5',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB548B'],
    description: '硅雪崩光电二极管，高灵敏度',
    functionalPerformance: '400-1000nm，增益100，暗电流<1nA',
    referencePrice: 680.00,
    parameters: {
      wavelength: '400-1000nm',
      power: '1μW',
      current: '1nA',
      voltage: '150V',
      efficiency: '80%',
      response: '100MHz',
      bandwidth: '600nm',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'OE006',
    partNumber: 'SOA-1550-30',
    manufacturer: '华为海思',
    primaryCategory: '光放大器',
    secondaryCategory: '半导体光放大器',
    package: '蝶形封装',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['ITU-T G.662'],
    description: '1550nm半导体光放大器',
    functionalPerformance: '1530-1570nm，增益30dB，噪声系数<6dB',
    referencePrice: 2800.00,
    parameters: {
      wavelength: '1530-1570nm',
      power: '20dBm',
      current: '400mA',
      voltage: '2.5V',
      efficiency: '25%',
      response: '40GHz',
      bandwidth: '40nm',
      temperature: '0°C~+70°C'
    }
  },
  {
    id: 'OE007',
    partNumber: 'MOD-LN-10G',
    manufacturer: '青岛海信',
    primaryCategory: '光调制器',
    secondaryCategory: '铌酸锂调制器',
    package: '金属封装',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['ITU-T G.959.1'],
    description: '10Gbps铌酸锂马赫曾德尔调制器',
    functionalPerformance: '1550nm，消光比>20dB，插损<4dB',
    referencePrice: 5600.00,
    parameters: {
      wavelength: '1550nm',
      power: '20dBm',
      current: '无',
      voltage: '6V',
      efficiency: '无',
      response: '10GHz',
      bandwidth: '40nm',
      temperature: '0°C~+70°C'
    }
  },
  {
    id: 'OE008',
    partNumber: 'WDM-CWDM-8CH',
    manufacturer: '亿源通',
    primaryCategory: '波分复用器',
    secondaryCategory: 'CWDM复用器',
    package: 'ABS封装',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['ITU-T G.694.2'],
    description: '8通道CWDM波分复用器',
    functionalPerformance: '1470-1610nm，插损<0.8dB，隔离度>30dB',
    referencePrice: 380.00,
    parameters: {
      wavelength: '1470-1610nm',
      power: '500mW',
      current: '无',
      voltage: '无',
      efficiency: '无',
      response: '无',
      bandwidth: '140nm',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'OE009',
    partNumber: 'ISO-1550-30',
    manufacturer: '凯普林光电',
    primaryCategory: '光隔离器',
    secondaryCategory: '1550nm光隔离器',
    package: 'FC/PC',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['Telcordia GR-910'],
    description: '1550nm光隔离器，高隔离度',
    functionalPerformance: '1550nm，隔离度>30dB，插损<0.8dB',
    referencePrice: 120.00,
    parameters: {
      wavelength: '1550nm',
      power: '500mW',
      current: '无',
      voltage: '无',
      efficiency: '无',
      response: '无',
      bandwidth: '40nm',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'OE010',
    partNumber: 'CIR-1550-3P',
    manufacturer: '欧普特',
    primaryCategory: '光环形器',
    secondaryCategory: '三端口光环形器',
    package: 'FC/PC',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['Telcordia GR-1221'],
    description: '1550nm三端口光环形器',
    functionalPerformance: '1530-1570nm，隔离度>40dB，插损<0.8dB',
    referencePrice: 280.00,
    parameters: {
      wavelength: '1530-1570nm',
      power: '300mW',
      current: '无',
      voltage: '无',
      efficiency: '无',
      response: '无',
      bandwidth: '40nm',
      temperature: '-40°C~+85°C'
    }
  }
];

const OptoelectronicSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<OptoelectronicComponent[]>(mockOptoData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<OptoelectronicComponent | null>(null);

  // 搜索处理
  const handleSearch = (values: any) => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = mockOptoData;
      
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
      
      if (values.wavelength) {
        filtered = filtered.filter(item => 
          item.parameters.wavelength?.includes(values.wavelength)
        );
      }
      
      setFilteredData(filtered);
      setLoading(false);
    }, 1000);
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setFilteredData(mockOptoData);
  };

  // 查看详情
  const handleViewDetail = (record: OptoelectronicComponent) => {
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
      width: 130,
      render: (text: string) => <Tag color="red">{text}</Tag>,
    },
    {
      title: '二级分类',
      dataIndex: 'secondaryCategory',
      key: 'secondaryCategory',
      width: 140,
      render: (text: string) => <Tag color="pink">{text}</Tag>,
    },
    {
      title: '波长',
      dataIndex: ['parameters', 'wavelength'],
      key: 'wavelength',
      width: 120,
      render: (text: string) => <Tag color="lime">{text}</Tag>,
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
      sorter: (a: OptoelectronicComponent, b: OptoelectronicComponent) => a.referencePrice - b.referencePrice,
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
          '商用级': 'green'
        };
        return <Tag color={colorMap[level] || 'default'}>{level}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: OptoelectronicComponent) => (
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
      <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)' }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
            光电子器件
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0', fontSize: '14px' }}>
            Optoelectronic Devices - 激光器、LED、光电探测器、光调制器等
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
                  <Option value="光迅科技">光迅科技</Option>
                  <Option value="海光芯创">海光芯创</Option>
                  <Option value="三安光电">三安光电</Option>
                  <Option value="纵慧芯光">纵慧芯光</Option>
                  <Option value="奥普拓激光">奥普拓激光</Option>
                  <Option value="华为海思">华为海思</Option>
                  <Option value="青岛海信">青岛海信</Option>
                  <Option value="亿源通">亿源通</Option>
                  <Option value="凯普林光电">凯普林光电</Option>
                  <Option value="欧普特">欧普特</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="一级分类" name="primaryCategory">
                <Select placeholder="选择一级分类" allowClear>
                  <Option value="激光器">激光器</Option>
                  <Option value="光电探测器">光电探测器</Option>
                  <Option value="发光二极管">发光二极管</Option>
                  <Option value="垂直腔面发射激光器">垂直腔面发射激光器</Option>
                  <Option value="雪崩光电二极管">雪崩光电二极管</Option>
                  <Option value="光放大器">光放大器</Option>
                  <Option value="光调制器">光调制器</Option>
                  <Option value="波分复用器">波分复用器</Option>
                  <Option value="光隔离器">光隔离器</Option>
                  <Option value="光环形器">光环形器</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="波长范围" name="wavelength">
                <Select placeholder="选择波长范围" allowClear>
                  <Option value="850">850nm</Option>
                  <Option value="940">940nm</Option>
                  <Option value="1310">1310nm</Option>
                  <Option value="1550">1550nm</Option>
                  <Option value="可见光">可见光(400-700nm)</Option>
                  <Option value="近红外">近红外(700-1700nm)</Option>
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
                  <Option value="汽车级">汽车级</Option>
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
            <Descriptions.Item label="工作波长">{selectedComponent.parameters.wavelength}</Descriptions.Item>
            <Descriptions.Item label="输出功率">{selectedComponent.parameters.power}</Descriptions.Item>
            <Descriptions.Item label="工作电流">{selectedComponent.parameters.current}</Descriptions.Item>
            <Descriptions.Item label="工作电压">{selectedComponent.parameters.voltage}</Descriptions.Item>
            <Descriptions.Item label="转换效率">{selectedComponent.parameters.efficiency}</Descriptions.Item>
            <Descriptions.Item label="响应速度">{selectedComponent.parameters.response}</Descriptions.Item>
            <Descriptions.Item label="光谱带宽">{selectedComponent.parameters.bandwidth}</Descriptions.Item>
            <Descriptions.Item label="工作温度">{selectedComponent.parameters.temperature}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OptoelectronicSearch;
