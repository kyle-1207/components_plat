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

// 机电组件数据类型定义
interface ElectromechanicalComponent {
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
    torque?: string;
    speed?: string;
    force?: string;
    temperature?: string;
  };
}

// 机电组件测试数据
const mockElectromechanicalData: ElectromechanicalComponent[] = [
  {
    id: 'EM001',
    partNumber: 'RLY-24V-DPDT',
    manufacturer: '宏发继电器',
    primaryCategory: '继电器',
    secondaryCategory: '电磁继电器',
    package: 'PCB插件',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['GJB597A', 'MIL-PRF-39016'],
    description: '24V双刀双掷电磁继电器',
    functionalPerformance: '24VDC线圈，触点容量10A/250VAC',
    referencePrice: 35.00,
    parameters: {
      voltage: '24VDC',
      current: '10A',
      power: '2.4W',
      frequency: '50/60Hz',
      torque: '无',
      speed: '10ms',
      force: '无',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'EM002',
    partNumber: 'SW-Toggle-MS',
    manufacturer: '得捷电子',
    primaryCategory: '开关',
    secondaryCategory: '拨动开关',
    package: '面板安装',
    qualityLevel: '军用级',
    lifecycle: '生产中',
    standards: ['MIL-PRF-8805'],
    description: '军标拨动开关，单刀双掷',
    functionalPerformance: 'SPDT，5A/125VAC，寿命100万次',
    referencePrice: 28.00,
    parameters: {
      voltage: '125VAC',
      current: '5A',
      power: '625W',
      frequency: '无',
      torque: '无',
      speed: '无',
      force: '3N',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'EM003',
    partNumber: 'CONN-D25-M',
    manufacturer: '航天电器',
    primaryCategory: '连接器',
    secondaryCategory: 'D-SUB连接器',
    package: '金属壳体',
    qualityLevel: '宇航级',
    lifecycle: '生产中',
    standards: ['Q/BA9001', 'GJB101A'],
    description: '25针D-SUB公头连接器',
    functionalPerformance: '25针，镀金触点，插拔寿命>5000次',
    referencePrice: 85.00,
    parameters: {
      voltage: '500VDC',
      current: '5A',
      power: '无',
      frequency: '1GHz',
      torque: '无',
      speed: '无',
      force: '20N',
      temperature: '-65°C~+175°C'
    }
  },
  {
    id: 'EM004',
    partNumber: 'FAN-12V-40mm',
    manufacturer: '台达电子',
    primaryCategory: '风扇',
    secondaryCategory: '轴流风扇',
    package: '塑料外壳',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['UL507'],
    description: '12V直流轴流风扇，40mm',
    functionalPerformance: '12VDC，转速7000RPM，风量12CFM',
    referencePrice: 15.00,
    parameters: {
      voltage: '12VDC',
      current: '150mA',
      power: '1.8W',
      frequency: '无',
      torque: '无',
      speed: '7000RPM',
      force: '无',
      temperature: '-10°C~+70°C'
    }
  },
  {
    id: 'EM005',
    partNumber: 'BUZZ-5V-Piezo',
    manufacturer: '福星晓程',
    primaryCategory: '蜂鸣器',
    secondaryCategory: '压电蜂鸣器',
    package: 'PCB安装',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60065'],
    description: '5V压电蜂鸣器，2700Hz',
    functionalPerformance: '5VDC，声压级85dB@10cm',
    referencePrice: 3.50,
    parameters: {
      voltage: '5VDC',
      current: '30mA',
      power: '150mW',
      frequency: '2700Hz',
      torque: '无',
      speed: '无',
      force: '无',
      temperature: '-20°C~+70°C'
    }
  },
  {
    id: 'EM006',
    partNumber: 'FUSE-5A-Fast',
    manufacturer: '力特奥维斯',
    primaryCategory: '熔断器',
    secondaryCategory: '快熔保险丝',
    package: '5×20mm',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-60127'],
    description: '5A快熔保险丝，250V',
    functionalPerformance: '5A/250V，分断能力35A',
    referencePrice: 0.80,
    parameters: {
      voltage: '250VAC',
      current: '5A',
      power: '1250W',
      frequency: '50/60Hz',
      torque: '无',
      speed: '<1ms',
      force: '无',
      temperature: '-55°C~+85°C'
    }
  },
  {
    id: 'EM007',
    partNumber: 'XFMR-230/12V',
    manufacturer: '顺络电子',
    primaryCategory: '变压器',
    secondaryCategory: '电源变压器',
    package: 'EI型铁芯',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['IEC-61558'],
    description: '230V转12V电源变压器，10VA',
    functionalPerformance: '230VAC输入，12VAC输出，10VA',
    referencePrice: 25.00,
    parameters: {
      voltage: '230/12VAC',
      current: '833mA',
      power: '10VA',
      frequency: '50/60Hz',
      torque: '无',
      speed: '无',
      force: '无',
      temperature: '-25°C~+85°C'
    }
  },
  {
    id: 'EM008',
    partNumber: 'MOTOR-12V-Gear',
    manufacturer: '兆威机电',
    primaryCategory: '电机',
    secondaryCategory: '直流减速电机',
    package: '金属齿轮箱',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['GB/T14711'],
    description: '12V直流减速电机，1:100减速比',
    functionalPerformance: '12VDC，转速30RPM，扭矩2Nm',
    referencePrice: 120.00,
    parameters: {
      voltage: '12VDC',
      current: '500mA',
      power: '6W',
      frequency: '无',
      torque: '2Nm',
      speed: '30RPM',
      force: '无',
      temperature: '-20°C~+80°C'
    }
  },
  {
    id: 'EM009',
    partNumber: 'SERVO-180deg',
    manufacturer: '汇川技术',
    primaryCategory: '伺服电机',
    secondaryCategory: '舵机',
    package: '塑料外壳',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['GB/T14711'],
    description: '180度舵机，PWM控制',
    functionalPerformance: '6V供电，扭矩1.8kg·cm，180°转角',
    referencePrice: 45.00,
    parameters: {
      voltage: '6VDC',
      current: '200mA',
      power: '1.2W',
      frequency: '50Hz',
      torque: '1.8kg·cm',
      speed: '0.16s/60°',
      force: '无',
      temperature: '-10°C~+60°C'
    }
  },
  {
    id: 'EM010',
    partNumber: 'STEP-200-Bipolar',
    manufacturer: '雷赛智能',
    primaryCategory: '步进电机',
    secondaryCategory: '双极步进电机',
    package: 'NEMA17',
    qualityLevel: '工业级',
    lifecycle: '生产中',
    standards: ['GB/T14711'],
    description: 'NEMA17双极步进电机，200步/转',
    functionalPerformance: '12V，1.8°步距角，保持扭矩4kg·cm',
    referencePrice: 85.00,
    parameters: {
      voltage: '12VDC',
      current: '1.2A',
      power: '14.4W',
      frequency: '无',
      torque: '4kg·cm',
      speed: '1000RPM',
      force: '无',
      temperature: '-20°C~+80°C'
    }
  }
];

const ElectromechanicalSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<ElectromechanicalComponent[]>(mockElectromechanicalData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ElectromechanicalComponent | null>(null);

  // 搜索处理
  const handleSearch = (values: any) => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = mockElectromechanicalData;
      
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
    setFilteredData(mockElectromechanicalData);
  };

  // 查看详情
  const handleViewDetail = (record: ElectromechanicalComponent) => {
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
      render: (text: string) => <Tag color="processing">{text}</Tag>,
    },
    {
      title: '二级分类',
      dataIndex: 'secondaryCategory',
      key: 'secondaryCategory',
      width: 120,
      render: (text: string) => <Tag color="default">{text}</Tag>,
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
      width: 100,
      sorter: (a: ElectromechanicalComponent, b: ElectromechanicalComponent) => a.referencePrice - b.referencePrice,
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
      render: (_: any, record: ElectromechanicalComponent) => (
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
      <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
            机电组件
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0', fontSize: '14px' }}>
            Electromechanical Components - 继电器、开关、连接器、电机等
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
                  <Option value="宏发继电器">宏发继电器</Option>
                  <Option value="得捷电子">得捷电子</Option>
                  <Option value="航天电器">航天电器</Option>
                  <Option value="台达电子">台达电子</Option>
                  <Option value="福星晓程">福星晓程</Option>
                  <Option value="力特奥维斯">力特奥维斯</Option>
                  <Option value="顺络电子">顺络电子</Option>
                  <Option value="兆威机电">兆威机电</Option>
                  <Option value="汇川技术">汇川技术</Option>
                  <Option value="雷赛智能">雷赛智能</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="一级分类" name="primaryCategory">
                <Select placeholder="选择一级分类" allowClear>
                  <Option value="继电器">继电器</Option>
                  <Option value="开关">开关</Option>
                  <Option value="连接器">连接器</Option>
                  <Option value="风扇">风扇</Option>
                  <Option value="蜂鸣器">蜂鸣器</Option>
                  <Option value="熔断器">熔断器</Option>
                  <Option value="变压器">变压器</Option>
                  <Option value="电机">电机</Option>
                  <Option value="伺服电机">伺服电机</Option>
                  <Option value="步进电机">步进电机</Option>
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
            <Descriptions.Item label="工作电压">{selectedComponent.parameters.voltage}</Descriptions.Item>
            <Descriptions.Item label="工作电流">{selectedComponent.parameters.current}</Descriptions.Item>
            <Descriptions.Item label="功率">{selectedComponent.parameters.power}</Descriptions.Item>
            <Descriptions.Item label="频率">{selectedComponent.parameters.frequency}</Descriptions.Item>
            <Descriptions.Item label="扭矩">{selectedComponent.parameters.torque}</Descriptions.Item>
            <Descriptions.Item label="转速">{selectedComponent.parameters.speed}</Descriptions.Item>
            <Descriptions.Item label="作用力">{selectedComponent.parameters.force}</Descriptions.Item>
            <Descriptions.Item label="工作温度">{selectedComponent.parameters.temperature}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ElectromechanicalSearch;
