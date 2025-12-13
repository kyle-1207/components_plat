import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Button, 
  Space, 
  Select, 
  Tag, 
  Modal,
  Form,
  message,
  Row,
  Col,
  Descriptions,
  Upload,
  Progress,
  Divider,
  Statistic
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileExcelOutlined,
  PlusOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { TextArea } = Input;

interface QPLProduct {
  id: string;
  partNumber: string;
  manufacturer: string;
  productName: string;
  category: string;
  qplLevel: 'QPL-1' | 'QPL-2' | 'QPL-3';
  certificationDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'suspended';
  testingOrg: string;
  applications: string[];
  reliability: string;
  description: string;
}

const QPLManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<QPLProduct[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<QPLProduct | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  const mockData: QPLProduct[] = [
    {
      id: '1',
      partNumber: 'LM324AN',
      manufacturer: '德州仪器',
      productName: '四运算放大器',
      category: '模拟集成电路',
      qplLevel: 'QPL-1',
      certificationDate: '2023-01-15',
      expiryDate: '2026-01-15',
      status: 'active',
      testingOrg: '航天771所',
      applications: ['卫星通信', '导航系统', '控制电路'],
      reliability: '99.95%',
      description: '低功耗、高精度四运算放大器，适用于航天环境'
    },
    {
      id: '2',
      partNumber: 'AD8066ARZ',
      manufacturer: '亚德诺',
      productName: '双运算放大器',
      category: '模拟集成电路',
      qplLevel: 'QPL-2',
      certificationDate: '2022-08-20',
      expiryDate: '2025-08-20',
      status: 'active',
      testingOrg: '航天772所',
      applications: ['信号处理', '数据采集'],
      reliability: '99.90%',
      description: '高速、低噪声双运算放大器'
    },
    {
      id: '3',
      partNumber: 'MAX232CPE',
      manufacturer: '美信',
      productName: 'RS232驱动器',
      category: '接口电路',
      qplLevel: 'QPL-1',
      certificationDate: '2021-12-10',
      expiryDate: '2024-12-10',
      status: 'expired',
      testingOrg: '航天773所',
      applications: ['串行通信', '数据传输'],
      reliability: '99.85%',
      description: 'RS232接口驱动器，用于串行数据通信'
    },
    {
      id: '4',
      partNumber: 'LM2596S-5.0',
      manufacturer: '德州仪器',
      productName: '开关稳压器',
      category: '电源管理',
      qplLevel: 'QPL-3',
      certificationDate: '2023-06-01',
      expiryDate: '2026-06-01',
      status: 'suspended',
      testingOrg: '航天774所',
      applications: ['电源转换', '电压调节'],
      reliability: '99.80%',
      description: '高效率开关稳压器，输出5V'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData(mockData);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'expired': return 'red';
      case 'suspended': return 'orange';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '有效';
      case 'expired': return '已过期';
      case 'suspended': return '暂停';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleOutlined />;
      case 'expired': return <CloseCircleOutlined />;
      case 'suspended': return <ExclamationCircleOutlined />;
      default: return null;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'QPL-1': return 'gold';
      case 'QPL-2': return 'blue';
      case 'QPL-3': return 'purple';
      default: return 'default';
    }
  };

  const handleViewDetail = (record: QPLProduct) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const handleAddProduct = () => {
    form.resetFields();
    setAddVisible(true);
  };

  const handleSubmitAdd = async (values: any) => {
    try {
      console.log('添加产品:', values);
      message.success('产品添加成功');
      setAddVisible(false);
      fetchData();
    } catch (error) {
      message.error('添加失败');
    }
  };

  const handleExport = () => {
    message.success('正在导出QPL清单...');
  };

  const handleImport = () => {
    message.info('请选择要导入的Excel文件');
  };

  const columns: ColumnsType<QPLProduct> = [
    {
      title: '器件型号',
      dataIndex: 'partNumber',
      key: 'partNumber',
      width: 150,
      render: (text) => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{text}</span>
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 120,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: 'QPL等级',
      dataIndex: 'qplLevel',
      key: 'qplLevel',
      width: 100,
      render: (level) => (
        <Tag color={getLevelColor(level)}>
          {level}
        </Tag>
      )
    },
    {
      title: '认证日期',
      dataIndex: 'certificationDate',
      key: 'certificationDate',
      width: 120,
    },
    {
      title: '有效期至',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '可靠性',
      dataIndex: 'reliability',
      key: 'reliability',
      width: 100,
      render: (reliability) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{reliability}</span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            详情
          </Button>
          <Button 
            type="link" 
            icon={<DownloadOutlined />} 
            size="small"
          >
            证书
          </Button>
        </Space>
      ),
    },
  ];

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.partNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchText.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || item.qplLevel === selectedLevel;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });

  // 统计数据
  const stats = {
    total: data.length,
    active: data.filter(item => item.status === 'active').length,
    expired: data.filter(item => item.status === 'expired').length,
    suspended: data.filter(item => item.status === 'suspended').length,
    qpl1: data.filter(item => item.qplLevel === 'QPL-1').length,
    qpl2: data.filter(item => item.qplLevel === 'QPL-2').length,
    qpl3: data.filter(item => item.qplLevel === 'QPL-3').length,
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="有效产品" value={stats.active} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="QPL-1等级" value={stats.qpl1} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="即将过期" value={2} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Input
                placeholder="搜索型号、制造商或产品名称"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="产品类别"
                style={{ width: '100%' }}
                value={selectedCategory}
                onChange={setSelectedCategory}
              >
                <Option value="all">全部类别</Option>
                <Option value="模拟集成电路">模拟集成电路</Option>
                <Option value="数字集成电路">数字集成电路</Option>
                <Option value="接口电路">接口电路</Option>
                <Option value="电源管理">电源管理</Option>
                <Option value="存储器">存储器</Option>
              </Select>
            </Col>
            <Col span={3}>
              <Select
                placeholder="QPL等级"
                style={{ width: '100%' }}
                value={selectedLevel}
                onChange={setSelectedLevel}
              >
                <Option value="all">全部等级</Option>
                <Option value="QPL-1">QPL-1</Option>
                <Option value="QPL-2">QPL-2</Option>
                <Option value="QPL-3">QPL-3</Option>
              </Select>
            </Col>
            <Col span={3}>
              <Select
                placeholder="状态"
                style={{ width: '100%' }}
                value={selectedStatus}
                onChange={setSelectedStatus}
              >
                <Option value="all">全部状态</Option>
                <Option value="active">有效</Option>
                <Option value="expired">已过期</Option>
                <Option value="suspended">暂停</Option>
              </Select>
            </Col>
            <Col span={8}>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProduct}>
                  添加产品
                </Button>
                <Button icon={<FileExcelOutlined />} onClick={handleExport}>
                  导出清单
                </Button>
                <Button icon={<UploadOutlined />} onClick={handleImport}>
                  批量导入
                </Button>
                <Button onClick={fetchData}>
                  刷新
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="QPL产品详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
          <Button key="certificate" type="primary" icon={<DownloadOutlined />}>
            下载认证证书
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="器件型号">{selectedRecord.partNumber}</Descriptions.Item>
              <Descriptions.Item label="制造商">{selectedRecord.manufacturer}</Descriptions.Item>
              <Descriptions.Item label="产品名称">{selectedRecord.productName}</Descriptions.Item>
              <Descriptions.Item label="产品类别">{selectedRecord.category}</Descriptions.Item>
              <Descriptions.Item label="QPL等级">
                <Tag color={getLevelColor(selectedRecord.qplLevel)}>
                  {selectedRecord.qplLevel}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="认证状态">
                <Tag color={getStatusColor(selectedRecord.status)} icon={getStatusIcon(selectedRecord.status)}>
                  {getStatusText(selectedRecord.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="认证日期">{selectedRecord.certificationDate}</Descriptions.Item>
              <Descriptions.Item label="有效期至">{selectedRecord.expiryDate}</Descriptions.Item>
              <Descriptions.Item label="认证机构">{selectedRecord.testingOrg}</Descriptions.Item>
              <Descriptions.Item label="可靠性指标">
                <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  {selectedRecord.reliability}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="适用领域" span={2}>
                {selectedRecord.applications.map(app => (
                  <Tag key={app} color="blue">{app}</Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="产品描述" span={2}>
                {selectedRecord.description}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider>可靠性数据</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="MTBF" value={50000} suffix="小时" />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="失效率" value={0.05} suffix="%" />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="测试样本" value={1000} suffix="件" />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Modal>

      {/* 添加产品模态框 */}
      <Modal
        title="添加QPL产品"
        open={addVisible}
        onCancel={() => setAddVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitAdd}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="partNumber"
                label="器件型号"
                rules={[{ required: true, message: '请输入器件型号' }]}
              >
                <Input placeholder="请输入器件型号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="manufacturer"
                label="制造商"
                rules={[{ required: true, message: '请输入制造商' }]}
              >
                <Input placeholder="请输入制造商" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="productName"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="产品类别"
                rules={[{ required: true, message: '请选择产品类别' }]}
              >
                <Select placeholder="请选择产品类别">
                  <Option value="模拟集成电路">模拟集成电路</Option>
                  <Option value="数字集成电路">数字集成电路</Option>
                  <Option value="接口电路">接口电路</Option>
                  <Option value="电源管理">电源管理</Option>
                  <Option value="存储器">存储器</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="qplLevel"
                label="QPL等级"
                rules={[{ required: true, message: '请选择QPL等级' }]}
              >
                <Select placeholder="请选择QPL等级">
                  <Option value="QPL-1">QPL-1</Option>
                  <Option value="QPL-2">QPL-2</Option>
                  <Option value="QPL-3">QPL-3</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="testingOrg"
            label="认证机构"
            rules={[{ required: true, message: '请输入认证机构' }]}
          >
            <Input placeholder="请输入认证机构" />
          </Form.Item>

          <Form.Item
            name="description"
            label="产品描述"
          >
            <TextArea rows={3} placeholder="请输入产品描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QPLManagement;
