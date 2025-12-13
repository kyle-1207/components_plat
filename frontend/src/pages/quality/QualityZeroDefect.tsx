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
  Steps,
  Timeline,
  Progress,
  Statistic,
  Alert,
  Tabs,
  Upload
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  PlusOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
  AuditOutlined,
  BugOutlined,
  ToolOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;

interface ZeroDefectCase {
  id: string;
  caseNumber: string;
  productName: string;
  partNumber: string;
  failureDate: string;
  reportDate: string;
  reporter: string;
  failureMode: string;
  severity: 'critical' | 'major' | 'minor';
  status: 'reported' | 'analyzing' | 'implementing' | 'verifying' | 'completed' | 'closed';
  currentStep: number;
  rootCause: string;
  correctiveActions: string[];
  preventiveActions: string[];
  responsible: string;
  dueDate: string;
  progress: number;
}

interface ActionItem {
  id: string;
  description: string;
  responsible: string;
  dueDate: string;
  status: 'pending' | 'inProgress' | 'completed';
  evidence: string[];
}

const QualityZeroDefect: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ZeroDefectCase[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ZeroDefectCase | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [form] = Form.useForm();

  // 模拟数据
  const mockData: ZeroDefectCase[] = [
    {
      id: '1',
      caseNumber: 'ZD2023001',
      productName: '四运算放大器',
      partNumber: 'LM324AN',
      failureDate: '2023-11-10',
      reportDate: '2023-11-12',
      reporter: '测试工程师张三',
      failureMode: '输出电压异常',
      severity: 'critical',
      status: 'implementing',
      currentStep: 2,
      rootCause: '生产过程中焊接温度控制不当，导致内部连接不良',
      correctiveActions: [
        '重新校准焊接设备温度',
        '增加焊接质量检查点',
        '对相关批次产品进行重新检测'
      ],
      preventiveActions: [
        '建立焊接温度监控系统',
        '制定详细的焊接工艺规范',
        '增加工艺培训频次'
      ],
      responsible: '生产部李经理',
      dueDate: '2023-12-15',
      progress: 65
    },
    {
      id: '2',
      caseNumber: 'ZD2023002',
      productName: 'RS232驱动器',
      partNumber: 'MAX232CPE',
      failureDate: '2023-10-25',
      reportDate: '2023-10-26',
      reporter: '质检员王五',
      failureMode: '通信错误率高',
      severity: 'major',
      status: 'completed',
      currentStep: 5,
      rootCause: '电路板设计中信号线布局不当，存在串扰',
      correctiveActions: [
        '重新设计电路板布局',
        '更换受影响的产品',
        '验证新设计的性能'
      ],
      preventiveActions: [
        '完善PCB设计评审流程',
        '增加信号完整性仿真',
        '建立设计规范检查清单'
      ],
      responsible: '设计部陈工',
      dueDate: '2023-11-30',
      progress: 100
    },
    {
      id: '3',
      caseNumber: 'ZD2023003',
      productName: '开关稳压器',
      partNumber: 'LM2596S-5.0',
      failureDate: '2023-09-15',
      reportDate: '2023-09-16',
      reporter: '现场工程师赵六',
      failureMode: '输出纹波过大',
      severity: 'minor',
      status: 'analyzing',
      currentStep: 1,
      rootCause: '待分析',
      correctiveActions: [],
      preventiveActions: [],
      responsible: '技术部刘工',
      dueDate: '2023-12-01',
      progress: 25
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'major': return 'orange';
      case 'minor': return 'blue';
      default: return 'default';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return '严重';
      case 'major': return '重要';
      case 'minor': return '一般';
      default: return severity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'default';
      case 'analyzing': return 'processing';
      case 'implementing': return 'warning';
      case 'verifying': return 'processing';
      case 'completed': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'reported': return '已报告';
      case 'analyzing': return '分析中';
      case 'implementing': return '实施中';
      case 'verifying': return '验证中';
      case 'completed': return '已完成';
      case 'closed': return '已关闭';
      default: return status;
    }
  };

  const handleViewDetail = (record: ZeroDefectCase) => {
    setSelectedRecord(record);
    setActiveTab('info');
    setDetailVisible(true);
  };

  const handleCreate = () => {
    form.resetFields();
    setCreateVisible(true);
  };

  const handleSubmitCreate = async (values: any) => {
    try {
      console.log('创建质量归零案例:', values);
      message.success('案例创建成功');
      setCreateVisible(false);
      fetchData();
    } catch (error) {
      message.error('创建失败');
    }
  };

  const columns: ColumnsType<ZeroDefectCase> = [
    {
      title: '案例编号',
      dataIndex: 'caseNumber',
      key: 'caseNumber',
      width: 120,
      render: (text) => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{text}</span>
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: '器件型号',
      dataIndex: 'partNumber',
      key: 'partNumber',
      width: 120,
    },
    {
      title: '故障模式',
      dataIndex: 'failureMode',
      key: 'failureMode',
      ellipsis: true,
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {getSeverityText(severity)}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 100,
      render: (progress) => (
        <Progress percent={progress} size="small" />
      )
    },
    {
      title: '负责人',
      dataIndex: 'responsible',
      key: 'responsible',
      width: 120,
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
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
        </Space>
      ),
    },
  ];

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.partNumber.toLowerCase().includes(searchText.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || item.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // 统计数据
  const stats = {
    total: data.length,
    critical: data.filter(item => item.severity === 'critical').length,
    inProgress: data.filter(item => ['analyzing', 'implementing', 'verifying'].includes(item.status)).length,
    completed: data.filter(item => item.status === 'completed').length,
    overdue: data.filter(item => new Date(item.dueDate) < new Date() && item.status !== 'completed').length,
  };

  // 质量归零步骤
  const zeroDefectSteps = [
    { title: '问题报告', description: '发现问题并报告' },
    { title: '原因分析', description: '深入分析根本原因' },
    { title: '措施实施', description: '实施纠正和预防措施' },
    { title: '效果验证', description: '验证措施有效性' },
    { title: '案例关闭', description: '完成归零并关闭案例' }
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 说明卡片 */}
      <Alert
        message="质量归零管理"
        description="质量归零是指对发生的质量问题进行彻底的原因分析，制定并实施有效的纠正和预防措施，确保同类问题不再发生。"
        type="info"
        icon={<BugOutlined />}
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总案例数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="严重问题" value={stats.critical} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="处理中" value={stats.inProgress} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已完成" value={stats.completed} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Input
                placeholder="搜索案例编号、产品名称或型号"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="严重程度"
                style={{ width: '100%' }}
                value={selectedSeverity}
                onChange={setSelectedSeverity}
              >
                <Option value="all">全部程度</Option>
                <Option value="critical">严重</Option>
                <Option value="major">重要</Option>
                <Option value="minor">一般</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="状态"
                style={{ width: '100%' }}
                value={selectedStatus}
                onChange={setSelectedStatus}
              >
                <Option value="all">全部状态</Option>
                <Option value="reported">已报告</Option>
                <Option value="analyzing">分析中</Option>
                <Option value="implementing">实施中</Option>
                <Option value="verifying">验证中</Option>
                <Option value="completed">已完成</Option>
              </Select>
            </Col>
            <Col span={8}>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                  新建案例
                </Button>
                <Button icon={<DownloadOutlined />}>
                  导出报告
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
        title={`质量归零案例详情 - ${selectedRecord?.caseNumber}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
          <Button key="report" type="primary" icon={<FileTextOutlined />}>
            生成报告
          </Button>
        ]}
        width={1000}
      >
        {selectedRecord && (
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="基本信息" key="info">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="案例编号">{selectedRecord.caseNumber}</Descriptions.Item>
                <Descriptions.Item label="产品名称">{selectedRecord.productName}</Descriptions.Item>
                <Descriptions.Item label="器件型号">{selectedRecord.partNumber}</Descriptions.Item>
                <Descriptions.Item label="故障日期">{selectedRecord.failureDate}</Descriptions.Item>
                <Descriptions.Item label="报告日期">{selectedRecord.reportDate}</Descriptions.Item>
                <Descriptions.Item label="报告人">{selectedRecord.reporter}</Descriptions.Item>
                <Descriptions.Item label="严重程度">
                  <Tag color={getSeverityColor(selectedRecord.severity)}>
                    {getSeverityText(selectedRecord.severity)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="当前状态">
                  <Tag color={getStatusColor(selectedRecord.status)}>
                    {getStatusText(selectedRecord.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="负责人">{selectedRecord.responsible}</Descriptions.Item>
                <Descriptions.Item label="截止日期">{selectedRecord.dueDate}</Descriptions.Item>
                <Descriptions.Item label="故障模式" span={2}>{selectedRecord.failureMode}</Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="处理流程" key="process">
              <Steps current={selectedRecord.currentStep} style={{ marginBottom: 24 }}>
                {zeroDefectSteps.map((step, index) => (
                  <Step
                    key={index}
                    title={step.title}
                    description={step.description}
                    status={index < selectedRecord.currentStep ? 'finish' : 
                           index === selectedRecord.currentStep ? 'process' : 'wait'}
                  />
                ))}
              </Steps>

              <Progress 
                percent={selectedRecord.progress} 
                status={selectedRecord.status === 'completed' ? 'success' : 'active'}
                style={{ marginBottom: 24 }}
              />

              <Timeline>
                <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                  <strong>2023-11-12</strong> - 问题已报告，开始分析
                  <br />
                  <span style={{ color: '#666' }}>报告人：{selectedRecord.reporter}</span>
                </Timeline.Item>
                <Timeline.Item color="blue" dot={<AuditOutlined />}>
                  <strong>2023-11-15</strong> - 完成初步分析，确定根本原因
                  <br />
                  <span style={{ color: '#666' }}>根本原因：{selectedRecord.rootCause}</span>
                </Timeline.Item>
                {selectedRecord.currentStep >= 2 && (
                  <Timeline.Item color="orange" dot={<ToolOutlined />}>
                    <strong>2023-11-20</strong> - 开始实施纠正措施
                    <br />
                    <span style={{ color: '#666' }}>负责人：{selectedRecord.responsible}</span>
                  </Timeline.Item>
                )}
                {selectedRecord.currentStep >= 3 && (
                  <Timeline.Item color="blue">
                    <strong>预计 2023-12-10</strong> - 措施实施完成，开始验证
                  </Timeline.Item>
                )}
              </Timeline>
            </TabPane>

            <TabPane tab="根本原因" key="analysis">
              <Card title="根本原因分析" style={{ marginBottom: 16 }}>
                <p>{selectedRecord.rootCause || '根本原因分析进行中...'}</p>
              </Card>

              <Row gutter={16}>
                <Col span={12}>
                  <Card title="纠正措施" size="small">
                    {selectedRecord.correctiveActions.length > 0 ? (
                      <ul>
                        {selectedRecord.correctiveActions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#999' }}>纠正措施制定中...</p>
                    )}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="预防措施" size="small">
                    {selectedRecord.preventiveActions.length > 0 ? (
                      <ul>
                        {selectedRecord.preventiveActions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#999' }}>预防措施制定中...</p>
                    )}
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="相关文档" key="documents">
              <Card title="相关文档" style={{ marginBottom: 16 }}>
                <Table
                  size="small"
                  columns={[
                    { title: '文档名称', dataIndex: 'name', key: 'name' },
                    { title: '类型', dataIndex: 'type', key: 'type' },
                    { title: '上传时间', dataIndex: 'uploadTime', key: 'uploadTime' },
                    { title: '操作', key: 'action', 
                      render: () => (
                        <Button type="link" icon={<DownloadOutlined />} size="small">
                          下载
                        </Button>
                      )
                    }
                  ]}
                  dataSource={[
                    { key: '1', name: '故障分析报告.pdf', type: '分析报告', uploadTime: '2023-11-15' },
                    { key: '2', name: '测试数据.xlsx', type: '测试数据', uploadTime: '2023-11-12' },
                    { key: '3', name: '现场照片.zip', type: '图片资料', uploadTime: '2023-11-12' }
                  ]}
                  pagination={false}
                />
              </Card>

              <Upload.Dragger
                multiple
                beforeUpload={() => false}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint">
                  支持上传相关的分析报告、测试数据、图片等文档
                </p>
              </Upload.Dragger>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 创建案例模态框 */}
      <Modal
        title="新建质量归零案例"
        open={createVisible}
        onCancel={() => setCreateVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitCreate}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productName"
                label="产品名称"
                rules={[{ required: true, message: '请输入产品名称' }]}
              >
                <Input placeholder="请输入产品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="partNumber"
                label="器件型号"
                rules={[{ required: true, message: '请输入器件型号' }]}
              >
                <Input placeholder="请输入器件型号" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="failureDate"
                label="故障发生日期"
                rules={[{ required: true, message: '请选择故障发生日期' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="severity"
                label="严重程度"
                rules={[{ required: true, message: '请选择严重程度' }]}
              >
                <Select placeholder="请选择严重程度">
                  <Option value="critical">严重</Option>
                  <Option value="major">重要</Option>
                  <Option value="minor">一般</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="failureMode"
            label="故障模式"
            rules={[{ required: true, message: '请输入故障模式' }]}
          >
            <Input placeholder="请输入故障模式" />
          </Form.Item>

          <Form.Item
            name="description"
            label="问题描述"
            rules={[{ required: true, message: '请描述问题详情' }]}
          >
            <TextArea rows={4} placeholder="请详细描述发现的问题" />
          </Form.Item>

          <Form.Item
            name="responsible"
            label="负责人"
            rules={[{ required: true, message: '请指定负责人' }]}
          >
            <Input placeholder="请输入负责人姓名" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QualityZeroDefect;
