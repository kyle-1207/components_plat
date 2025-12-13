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

// 通用与特种元件数据类型定义
interface GeneralComponent {
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
    capacitance?: string;
    voltage?: string;
    tolerance?: string;
    resistance?: string;
    power?: string;
    inductance?: string;
    frequency?: string;
    temperature?: string;
  };
}

// 通用与特种元件测试数据
const mockGeneralData: GeneralComponent[] = [
  {
    id: 'GC001',
    partNumber: 'CAP-100uF-25V',
    manufacturer: '风华高科',
    primaryCategory: '电容器',
    secondaryCategory: '铝电解电容',
    package: '径向引线',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60384', 'JIS-C5101'],
    description: '100μF/25V铝电解电容器',
    functionalPerformance: '低ESR，高纹波电流，长寿命',
    referencePrice: 0.35,
    parameters: {
      capacitance: '100μF',
      voltage: '25V',
      tolerance: '±20%',
      resistance: '无',
      power: '无',
      inductance: '无',
      frequency: '120Hz',
      temperature: '-40°C~+105°C'
    }
  },
  {
    id: 'GC002',
    partNumber: 'RES-1K-1/4W',
    manufacturer: '厚声电子',
    primaryCategory: '电阻器',
    secondaryCategory: '碳膜电阻',
    package: '轴向引线',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60115', 'JIS-C5201'],
    description: '1kΩ/1/4W碳膜电阻器',
    functionalPerformance: '低噪声，稳定性好，成本低',
    referencePrice: 0.02,
    parameters: {
      capacitance: '无',
      voltage: '250V',
      tolerance: '±5%',
      resistance: '1kΩ',
      power: '1/4W',
      inductance: '无',
      frequency: '无',
      temperature: '-55°C~+155°C'
    }
  },
  {
    id: 'GC003',
    partNumber: 'IND-10uH-1A',
    manufacturer: '顺络电子',
    primaryCategory: '电感器',
    secondaryCategory: '功率电感',
    package: 'SMD-1210',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60938'],
    description: '10μH功率电感，1A饱和电流',
    functionalPerformance: '低DCR，高饱和电流，屏蔽结构',
    referencePrice: 0.25,
    parameters: {
      capacitance: '无',
      voltage: '无',
      tolerance: '±20%',
      resistance: '0.15Ω',
      power: '无',
      inductance: '10μH',
      frequency: '1MHz',
      temperature: '-40°C~+125°C'
    }
  },
  {
    id: 'GC004',
    partNumber: 'XTAL-32.768K',
    manufacturer: '泰晶科技',
    primaryCategory: '晶振',
    secondaryCategory: '石英晶振',
    package: '圆柱形',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60444'],
    description: '32.768kHz石英晶振',
    functionalPerformance: '高精度，低功耗，RTC专用',
    referencePrice: 0.45,
    parameters: {
      capacitance: '12.5pF',
      voltage: '无',
      tolerance: '±20ppm',
      resistance: '70kΩ',
      power: '1μW',
      inductance: '无',
      frequency: '32.768kHz',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'GC005',
    partNumber: 'FILT-LC-1mH',
    manufacturer: '麦捷科技',
    primaryCategory: '滤波器',
    secondaryCategory: 'LC滤波器',
    package: 'SMD封装',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60938'],
    description: '1mH LC低通滤波器',
    functionalPerformance: '截止频率1MHz，插损<1dB',
    referencePrice: 1.20,
    parameters: {
      capacitance: '100pF',
      voltage: '50V',
      tolerance: '±10%',
      resistance: '1Ω',
      power: '1W',
      inductance: '1mH',
      frequency: '1MHz',
      temperature: '-40°C~+85°C'
    }
  },
  {
    id: 'GC006',
    partNumber: 'TERM-Screw-5mm',
    manufacturer: '韦德万能',
    primaryCategory: '接线端子',
    secondaryCategory: '螺钉式端子',
    package: '5mm间距',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60947'],
    description: '5mm间距螺钉式接线端子',
    functionalPerformance: '10A/300V，镀锡铜材质',
    referencePrice: 0.80,
    parameters: {
      capacitance: '无',
      voltage: '300V',
      tolerance: '无',
      resistance: '<1mΩ',
      power: '3kW',
      inductance: '无',
      frequency: '无',
      temperature: '-40°C~+105°C'
    }
  },
  {
    id: 'GC007',
    partNumber: 'HEAT-TO220-Alu',
    manufacturer: '信越化学',
    primaryCategory: '散热器',
    secondaryCategory: 'TO-220散热器',
    package: '铝合金',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60747'],
    description: 'TO-220封装铝合金散热器',
    functionalPerformance: '热阻3°C/W，自然对流',
    referencePrice: 2.50,
    parameters: {
      capacitance: '无',
      voltage: '无',
      tolerance: '无',
      resistance: '3°C/W',
      power: '10W',
      inductance: '无',
      frequency: '无',
      temperature: '-55°C~+150°C'
    }
  },
  {
    id: 'GC008',
    partNumber: 'TEMP-NTC-10K',
    manufacturer: '华工科技',
    primaryCategory: '传感器',
    secondaryCategory: '温度传感器',
    package: '玻璃封装',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60539'],
    description: '10kΩ@25°C NTC热敏电阻',
    functionalPerformance: 'B值3950K，精度±1%',
    referencePrice: 1.50,
    parameters: {
      capacitance: '无',
      voltage: '无',
      tolerance: '±1%',
      resistance: '10kΩ@25°C',
      power: '250mW',
      inductance: '无',
      frequency: '无',
      temperature: '-40°C~+125°C'
    }
  },
  {
    id: 'GC009',
    partNumber: 'POT-10K-Linear',
    manufacturer: '松下电器',
    primaryCategory: '可变电阻',
    secondaryCategory: '电位器',
    package: '旋转式',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60393'],
    description: '10kΩ线性电位器',
    functionalPerformance: '旋转寿命10万次，线性度±5%',
    referencePrice: 3.20,
    parameters: {
      capacitance: '无',
      voltage: '无',
      tolerance: '±20%',
      resistance: '10kΩ',
      power: '0.5W',
      inductance: '无',
      frequency: '无',
      temperature: '-25°C~+85°C'
    }
  },
  {
    id: 'GC010',
    partNumber: 'VARISTOR-14V',
    manufacturer: '硕凯电子',
    primaryCategory: '压敏电阻',
    secondaryCategory: 'MOV压敏电阻',
    package: '径向引线',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60738'],
    description: '14V氧化锌压敏电阻',
    functionalPerformance: '浪涌保护，响应时间<25ns',
    referencePrice: 0.65,
    parameters: {
      capacitance: '无',
      voltage: '14V',
      tolerance: '±10%',
      resistance: '>1GΩ',
      power: '0.6W',
      inductance: '无',
      frequency: '无',
      temperature: '-40°C~+85°C'
    }
  }
];

const GeneralSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<GeneralComponent[]>(mockGeneralData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<GeneralComponent | null>(null);

  // 搜索处理
  const handleSearch = (values: any) => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = mockGeneralData;
      
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
    setFilteredData(mockGeneralData);
  };

  // 查看详情
  const handleViewDetail = (record: GeneralComponent) => {
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
      width: 100,
      render: (text: string) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: '二级分类',
      dataIndex: 'secondaryCategory',
      key: 'secondaryCategory',
      width: 120,
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
      sorter: (a: GeneralComponent, b: GeneralComponent) => a.referencePrice - b.referencePrice,
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
      render: (_: any, record: GeneralComponent) => (
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
            通用与特种元件
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0', fontSize: '14px' }}>
            General & Special Components - 电阻、电容、电感、晶振、传感器等
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
                  <Option value="风华高科">风华高科</Option>
                  <Option value="厚声电子">厚声电子</Option>
                  <Option value="顺络电子">顺络电子</Option>
                  <Option value="泰晶科技">泰晶科技</Option>
                  <Option value="麦捷科技">麦捷科技</Option>
                  <Option value="韦德万能">韦德万能</Option>
                  <Option value="信越化学">信越化学</Option>
                  <Option value="华工科技">华工科技</Option>
                  <Option value="松下电器">松下电器</Option>
                  <Option value="硕凯电子">硕凯电子</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="一级分类" name="primaryCategory">
                <Select placeholder="选择一级分类" allowClear>
                  <Option value="电容器">电容器</Option>
                  <Option value="电阻器">电阻器</Option>
                  <Option value="电感器">电感器</Option>
                  <Option value="晶振">晶振</Option>
                  <Option value="滤波器">滤波器</Option>
                  <Option value="接线端子">接线端子</Option>
                  <Option value="散热器">散热器</Option>
                  <Option value="传感器">传感器</Option>
                  <Option value="可变电阻">可变电阻</Option>
                  <Option value="压敏电阻">压敏电阻</Option>
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
            <Descriptions.Item label="容值">{selectedComponent.parameters.capacitance}</Descriptions.Item>
            <Descriptions.Item label="额定电压">{selectedComponent.parameters.voltage}</Descriptions.Item>
            <Descriptions.Item label="精度">{selectedComponent.parameters.tolerance}</Descriptions.Item>
            <Descriptions.Item label="阻值">{selectedComponent.parameters.resistance}</Descriptions.Item>
            <Descriptions.Item label="额定功率">{selectedComponent.parameters.power}</Descriptions.Item>
            <Descriptions.Item label="电感值">{selectedComponent.parameters.inductance}</Descriptions.Item>
            <Descriptions.Item label="工作频率">{selectedComponent.parameters.frequency}</Descriptions.Item>
            <Descriptions.Item label="工作温度">{selectedComponent.parameters.temperature}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default GeneralSearch;
