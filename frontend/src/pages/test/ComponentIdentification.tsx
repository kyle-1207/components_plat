import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Descriptions,
  Tabs,
  Progress,
  Badge,
  Typography,
  Row,
  Col,
  Statistic,
  message
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface ComponentIdentification {
  id: string;
  identificationId: string;
  componentPartNumber: string;
  manufacturer: string;
  executionStandards: {
    primaryStandard: string;
    additionalStandards: string[];
    testLevel: string;
  };
  testResults: {
    totalItems: number;
    passedItems: number;
    failedItems: number;
    conditionalItems: number;
    overallStatus: 'qualified' | 'unqualified' | 'conditional';
  };
  reportInfo: {
    reportNumber: string;
    reportDate: string;
    testLab: string;
    testOperator: string;
    reviewer: string;
    approver: string;
  };
  qualityAssessment: {
    qualityLevel: string;
    reliabilityLevel: string;
    applicationArea: string[];
  };
  validity: {
    issueDate: string;
    expiryDate: string;
    isValid: boolean;
  };
  createdAt: string;
}

const ComponentIdentification: React.FC = () => {
  const [identifications, setIdentifications] = useState<ComponentIdentification[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    componentPartNumber: '',
    manufacturer: '',
    overallStatus: '',
    qualityLevel: '',
    isValid: ''
  });
  const [selectedRecord, setSelectedRecord] = useState<ComponentIdentification | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    totalRecords: 0,
    qualifiedRecords: 0,
    unqualifiedRecords: 0,
    conditionalRecords: 0,
    validRecords: 0,
    expiredRecords: 0
  });

  // 表格列定义
  const columns: ColumnsType<ComponentIdentification> = [
    {
      title: '鉴定编号',
      dataIndex: 'identificationId',
      key: 'identificationId',
      width: 150,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '器件型号',
      dataIndex: 'componentPartNumber',
      key: 'componentPartNumber',
      width: 200,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 150
    },
    {
      title: '执行标准',
      dataIndex: ['executionStandards', 'primaryStandard'],
      key: 'primaryStandard',
      width: 120
    },
    {
      title: '测试等级',
      dataIndex: ['executionStandards', 'testLevel'],
      key: 'testLevel',
      width: 80,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '鉴定结果',
      dataIndex: ['testResults', 'overallStatus'],
      key: 'overallStatus',
      width: 100,
      render: (status) => {
        const config = {
          qualified: { color: 'success', icon: <CheckCircleOutlined />, text: '合格' },
          unqualified: { color: 'error', icon: <CloseCircleOutlined />, text: '不合格' },
          conditional: { color: 'warning', icon: <ExclamationCircleOutlined />, text: '有条件合格' }
        };
        const { color, icon, text } = config[status as keyof typeof config];
        return <Badge status={color} icon={icon} text={text} />;
      }
    },
    {
      title: '质量等级',
      dataIndex: ['qualityAssessment', 'qualityLevel'],
      key: 'qualityLevel',
      width: 100,
      render: (level) => {
        const color = level === '宇航级' ? 'gold' : level === '军用级' ? 'green' : 'blue';
        return <Tag color={color}>{level}</Tag>;
      }
    },
    {
      title: '有效期',
      dataIndex: ['validity', 'expiryDate'],
      key: 'expiryDate',
      width: 120,
      render: (date, record) => {
        const isExpired = dayjs(date).isBefore(dayjs());
        const isValid = record.validity.isValid;
        return (
          <div>
            <div>{dayjs(date).format('YYYY-MM-DD')}</div>
            <Tag color={isValid && !isExpired ? 'green' : 'red'}>
              {isValid && !isExpired ? '有效' : '已失效'}
            </Tag>
          </div>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => handleDownloadReport(record)}
          >
            报告
          </Button>
        </Space>
      )
    }
  ];

  // 获取鉴定记录列表
  const fetchIdentifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/identification?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setIdentifications(data.data.identifications);
      } else {
        message.error('获取鉴定记录失败');
      }
    } catch (error) {
      message.error('网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计信息
  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/identification/stats/summary');
      const data = await response.json();
      
      if (data.success) {
        setStatistics(data.data.overview);
      }
    } catch (error) {
      console.error('获取统计信息失败:', error);
    }
  };

  useEffect(() => {
    fetchIdentifications();
    fetchStatistics();
  }, [searchParams]);

  // 查看详情
  const handleViewDetail = (record: ComponentIdentification) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // 编辑记录
  const handleEdit = (record: ComponentIdentification) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      ...record,
      reportDate: dayjs(record.reportInfo.reportDate),
      issueDate: dayjs(record.validity.issueDate),
      expiryDate: dayjs(record.validity.expiryDate)
    });
    setEditModalVisible(true);
  };

  // 下载报告
  const handleDownloadReport = (record: ComponentIdentification) => {
    message.info(`下载鉴定报告: ${record.reportInfo.reportNumber}`);
  };

  // 搜索处理
  const handleSearch = (key: string, value: string) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      componentPartNumber: '',
      manufacturer: '',
      overallStatus: '',
      qualityLevel: '',
      isValid: ''
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>器件鉴定管理</Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="总记录数"
              value={statistics.totalRecords}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="合格记录"
              value={statistics.qualifiedRecords}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="不合格记录"
              value={statistics.unqualifiedRecords}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="有条件合格"
              value={statistics.conditionalRecords}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#d48806' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="有效记录"
              value={statistics.validRecords}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="过期记录"
              value={statistics.expiredRecords}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索区域 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="器件型号"
              prefix={<SearchOutlined />}
              value={searchParams.componentPartNumber}
              onChange={(e) => handleSearch('componentPartNumber', e.target.value)}
            />
          </Col>
          <Col span={6}>
            <Input
              placeholder="制造商"
              value={searchParams.manufacturer}
              onChange={(e) => handleSearch('manufacturer', e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="鉴定结果"
              style={{ width: '100%' }}
              value={searchParams.overallStatus}
              onChange={(value) => handleSearch('overallStatus', value)}
              allowClear
            >
              <Option value="qualified">合格</Option>
              <Option value="unqualified">不合格</Option>
              <Option value="conditional">有条件合格</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="质量等级"
              style={{ width: '100%' }}
              value={searchParams.qualityLevel}
              onChange={(value) => handleSearch('qualityLevel', value)}
              allowClear
            >
              <Option value="宇航级">宇航级</Option>
              <Option value="军用级">军用级</Option>
              <Option value="工业级">工业级</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 表格 */}
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Button type="primary" icon={<PlusOutlined />}>
            新建鉴定
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={identifications}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="鉴定记录详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={1200}
      >
        {selectedRecord && (
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="鉴定编号">
                  {selectedRecord.identificationId}
                </Descriptions.Item>
                <Descriptions.Item label="器件型号">
                  {selectedRecord.componentPartNumber}
                </Descriptions.Item>
                <Descriptions.Item label="制造商">
                  {selectedRecord.manufacturer}
                </Descriptions.Item>
                <Descriptions.Item label="执行标准">
                  {selectedRecord.executionStandards.primaryStandard}
                </Descriptions.Item>
                <Descriptions.Item label="测试等级">
                  {selectedRecord.executionStandards.testLevel}
                </Descriptions.Item>
                <Descriptions.Item label="质量等级">
                  {selectedRecord.qualityAssessment.qualityLevel}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="测试结果" key="results">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="测试统计">
                    <Descriptions column={1}>
                      <Descriptions.Item label="总测试项">
                        {selectedRecord.testResults.totalItems}
                      </Descriptions.Item>
                      <Descriptions.Item label="通过项">
                        {selectedRecord.testResults.passedItems}
                      </Descriptions.Item>
                      <Descriptions.Item label="失败项">
                        {selectedRecord.testResults.failedItems}
                      </Descriptions.Item>
                      <Descriptions.Item label="有条件通过">
                        {selectedRecord.testResults.conditionalItems}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="通过率">
                    <Progress
                      type="circle"
                      percent={Math.round((selectedRecord.testResults.passedItems / selectedRecord.testResults.totalItems) * 100)}
                      format={() => `${selectedRecord.testResults.passedItems}/${selectedRecord.testResults.totalItems}`}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane tab="报告信息" key="report">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="报告编号">
                  {selectedRecord.reportInfo.reportNumber}
                </Descriptions.Item>
                <Descriptions.Item label="报告日期">
                  {dayjs(selectedRecord.reportInfo.reportDate).format('YYYY-MM-DD')}
                </Descriptions.Item>
                <Descriptions.Item label="测试实验室">
                  {selectedRecord.reportInfo.testLab}
                </Descriptions.Item>
                <Descriptions.Item label="测试员">
                  {selectedRecord.reportInfo.testOperator}
                </Descriptions.Item>
                <Descriptions.Item label="审核员">
                  {selectedRecord.reportInfo.reviewer}
                </Descriptions.Item>
                <Descriptions.Item label="批准人">
                  {selectedRecord.reportInfo.approver}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 编辑模态框 */}
      <Modal
        title="编辑鉴定记录"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            console.log('提交数据:', values);
            message.success('更新成功');
            setEditModalVisible(false);
            fetchIdentifications();
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="器件型号"
                name="componentPartNumber"
                rules={[{ required: true, message: '请输入器件型号' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="制造商"
                name="manufacturer"
                rules={[{ required: true, message: '请输入制造商' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="执行标准"
                name={['executionStandards', 'primaryStandard']}
                rules={[{ required: true, message: '请输入执行标准' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="测试等级"
                name={['executionStandards', 'testLevel']}
                rules={[{ required: true, message: '请选择测试等级' }]}
              >
                <Select>
                  <Option value="A">A级</Option>
                  <Option value="B">B级</Option>
                  <Option value="C">C级</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="质量等级"
                name={['qualityAssessment', 'qualityLevel']}
                rules={[{ required: true, message: '请选择质量等级' }]}
              >
                <Select>
                  <Option value="宇航级">宇航级</Option>
                  <Option value="军用级">军用级</Option>
                  <Option value="工业级">工业级</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="有效期"
                name="expiryDate"
                rules={[{ required: true, message: '请选择有效期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ComponentIdentification;
