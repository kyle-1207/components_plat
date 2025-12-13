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
  Image,
  Alert,
  Statistic,
  Progress,
  Timeline
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  WarningOutlined,
  CameraOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileImageOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { TextArea } = Input;

interface CounterfeitRecord {
  id: string;
  partNumber: string;
  manufacturer: string;
  reportDate: string;
  reportedBy: string;
  riskLevel: 'high' | 'medium' | 'low';
  status: 'confirmed' | 'investigating' | 'resolved';
  category: string;
  description: string;
  identificationMethod: string;
  affectedBatches: string[];
  images: string[];
  countermeasures: string;
}

interface DetectionResult {
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
}

const CounterfeitDetection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CounterfeitRecord[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [detectVisible, setDetectVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CounterfeitRecord | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [form] = Form.useForm();
  const [detectForm] = Form.useForm();

  // 模拟数据
  const mockData: CounterfeitRecord[] = [
    {
      id: '1',
      partNumber: 'LM358N',
      manufacturer: '德州仪器',
      reportDate: '2023-11-15',
      reportedBy: '航天某院',
      riskLevel: 'high',
      status: 'confirmed',
      category: '模拟集成电路',
      description: '发现批次标识异常，芯片表面处理不一致，电气特性偏差较大',
      identificationMethod: '外观检查 + 电气测试 + X射线检查',
      affectedBatches: ['2023001', '2023002', '2023005'],
      images: ['/images/counterfeit1.jpg', '/images/counterfeit1_xray.jpg'],
      countermeasures: '已通知相关单位停止使用，联系正规渠道重新采购'
    },
    {
      id: '2',
      partNumber: 'MAX232CPE',
      manufacturer: '美信',
      reportDate: '2023-10-28',
      reportedBy: '质检中心',
      riskLevel: 'medium',
      status: 'investigating',
      category: '接口电路',
      description: '包装标识字体异常，但电气性能暂未发现明显问题',
      identificationMethod: '包装分析 + 标识对比',
      affectedBatches: ['2023M10'],
      images: ['/images/counterfeit2.jpg'],
      countermeasures: '正在进行详细检测，暂时隔离相关批次'
    },
    {
      id: '3',
      partNumber: 'AD8066ARZ',
      manufacturer: '亚德诺',
      reportDate: '2023-09-20',
      reportedBy: '供应商',
      riskLevel: 'low',
      status: 'resolved',
      category: '模拟集成电路',
      description: '供应商主动上报疑似假冒产品，经检测确认为正品',
      identificationMethod: '全面检测',
      affectedBatches: ['2023AD08'],
      images: ['/images/counterfeit3.jpg'],
      countermeasures: '确认为正品，已解除隔离'
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

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'high': return '高风险';
      case 'medium': return '中风险';
      case 'low': return '低风险';
      default: return level;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'red';
      case 'investigating': return 'orange';
      case 'resolved': return 'green';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return '已确认';
      case 'investigating': return '调查中';
      case 'resolved': return '已解决';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CloseCircleOutlined />;
      case 'investigating': return <ExclamationCircleOutlined />;
      case 'resolved': return <CheckCircleOutlined />;
      default: return null;
    }
  };

  const handleViewDetail = (record: CounterfeitRecord) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const handleReport = () => {
    form.resetFields();
    setReportVisible(true);
  };

  const handleDetect = () => {
    detectForm.resetFields();
    setDetectionResult(null);
    setDetectVisible(true);
  };

  const handleSubmitReport = async (values: any) => {
    try {
      console.log('提交举报:', values);
      message.success('举报提交成功，我们将尽快处理');
      setReportVisible(false);
      fetchData();
    } catch (error) {
      message.error('提交失败');
    }
  };

  const handleAIDetection = async () => {
    try {
      setLoading(true);
      // 模拟AI检测
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult: DetectionResult = {
        confidence: 85,
        riskFactors: [
          '包装字体与正品存在差异',
          '芯片表面处理工艺不一致',
          '引脚镀层颜色异常',
          '标识位置偏移'
        ],
        recommendations: [
          '建议进行X射线检查',
          '进行电气性能详细测试',
          '对比正品样本',
          '联系制造商验证'
        ]
      };
      
      setDetectionResult(mockResult);
      message.success('AI检测完成');
    } catch (error) {
      message.error('检测失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<CounterfeitRecord> = [
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
      title: '报告日期',
      dataIndex: 'reportDate',
      key: 'reportDate',
      width: 120,
    },
    {
      title: '报告单位',
      dataIndex: 'reportedBy',
      key: 'reportedBy',
      width: 120,
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 100,
      render: (level) => (
        <Tag color={getRiskLevelColor(level)} icon={<WarningOutlined />}>
          {getRiskLevelText(level)}
        </Tag>
      )
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
      title: '识别方法',
      dataIndex: 'identificationMethod',
      key: 'identificationMethod',
      ellipsis: true,
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
        </Space>
      ),
    },
  ];

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.partNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchText.toLowerCase());
    const matchesRiskLevel = selectedRiskLevel === 'all' || item.riskLevel === selectedRiskLevel;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesRiskLevel && matchesStatus;
  });

  // 统计数据
  const stats = {
    total: data.length,
    confirmed: data.filter(item => item.status === 'confirmed').length,
    investigating: data.filter(item => item.status === 'investigating').length,
    resolved: data.filter(item => item.status === 'resolved').length,
    highRisk: data.filter(item => item.riskLevel === 'high').length,
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 警告提示 */}
      <Alert
        message="假冒伪劣器件预警"
        description="发现疑似假冒伪劣器件时，请立即停止使用并及时举报。使用假冒器件可能导致系统故障和安全隐患。"
        type="warning"
        icon={<SafetyOutlined />}
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总记录数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已确认假冒" value={stats.confirmed} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="调查中" value={stats.investigating} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="高风险" value={stats.highRisk} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Input
                placeholder="搜索型号或制造商"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="风险等级"
                style={{ width: '100%' }}
                value={selectedRiskLevel}
                onChange={setSelectedRiskLevel}
              >
                <Option value="all">全部等级</Option>
                <Option value="high">高风险</Option>
                <Option value="medium">中风险</Option>
                <Option value="low">低风险</Option>
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
                <Option value="confirmed">已确认</Option>
                <Option value="investigating">调查中</Option>
                <Option value="resolved">已解决</Option>
              </Select>
            </Col>
            <Col span={8}>
              <Space>
                <Button type="primary" danger icon={<FileTextOutlined />} onClick={handleReport}>
                  举报假冒
                </Button>
                <Button type="primary" icon={<CameraOutlined />} onClick={handleDetect}>
                  AI检测
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
        title="假冒伪劣记录详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        {selectedRecord && (
          <>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="器件型号">{selectedRecord.partNumber}</Descriptions.Item>
              <Descriptions.Item label="制造商">{selectedRecord.manufacturer}</Descriptions.Item>
              <Descriptions.Item label="报告日期">{selectedRecord.reportDate}</Descriptions.Item>
              <Descriptions.Item label="报告单位">{selectedRecord.reportedBy}</Descriptions.Item>
              <Descriptions.Item label="风险等级">
                <Tag color={getRiskLevelColor(selectedRecord.riskLevel)} icon={<WarningOutlined />}>
                  {getRiskLevelText(selectedRecord.riskLevel)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="处理状态">
                <Tag color={getStatusColor(selectedRecord.status)} icon={getStatusIcon(selectedRecord.status)}>
                  {getStatusText(selectedRecord.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="产品类别">{selectedRecord.category}</Descriptions.Item>
              <Descriptions.Item label="识别方法">{selectedRecord.identificationMethod}</Descriptions.Item>
              <Descriptions.Item label="涉及批次" span={2}>
                {selectedRecord.affectedBatches.map(batch => (
                  <Tag key={batch} color="red">{batch}</Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="问题描述" span={2}>
                {selectedRecord.description}
              </Descriptions.Item>
              <Descriptions.Item label="应对措施" span={2}>
                {selectedRecord.countermeasures}
              </Descriptions.Item>
            </Descriptions>

            {selectedRecord.images.length > 0 && (
              <>
                <h4 style={{ marginTop: 24, marginBottom: 16 }}>相关图片</h4>
                <Image.PreviewGroup>
                  <Row gutter={16}>
                    {selectedRecord.images.map((img, index) => (
                      <Col span={8} key={index}>
                        <Image
                          width="100%"
                          height={200}
                          src={img}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                        />
                      </Col>
                    ))}
                  </Row>
                </Image.PreviewGroup>
              </>
            )}
          </>
        )}
      </Modal>

      {/* 举报模态框 */}
      <Modal
        title="举报假冒伪劣器件"
        open={reportVisible}
        onCancel={() => setReportVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitReport}
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
                label="标称制造商"
                rules={[{ required: true, message: '请输入制造商' }]}
              >
                <Input placeholder="请输入制造商" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="riskLevel"
                label="风险等级评估"
                rules={[{ required: true, message: '请选择风险等级' }]}
              >
                <Select placeholder="请选择风险等级">
                  <Option value="high">高风险</Option>
                  <Option value="medium">中风险</Option>
                  <Option value="low">低风险</Option>
                </Select>
              </Form.Item>
            </Col>
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
                  <Option value="分立器件">分立器件</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="identificationMethod"
            label="识别方法"
            rules={[{ required: true, message: '请输入识别方法' }]}
          >
            <Input placeholder="如：外观检查、电气测试、X射线检查等" />
          </Form.Item>

          <Form.Item
            name="description"
            label="问题描述"
            rules={[{ required: true, message: '请描述发现的问题' }]}
          >
            <TextArea rows={4} placeholder="请详细描述发现的异常情况" />
          </Form.Item>

          <Form.Item
            name="images"
            label="相关图片"
          >
            <Upload
              listType="picture-card"
              multiple
              beforeUpload={() => false}
            >
              <div>
                <FileImageOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* AI检测模态框 */}
      <Modal
        title="AI智能检测"
        open={detectVisible}
        onCancel={() => setDetectVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetectVisible(false)}>
            关闭
          </Button>,
          <Button key="detect" type="primary" loading={loading} onClick={handleAIDetection}>
            开始检测
          </Button>
        ]}
        width={700}
      >
        <Form
          form={detectForm}
          layout="vertical"
        >
          <Form.Item
            name="images"
            label="上传器件图片"
            extra="请上传清晰的器件正面、背面及包装图片，支持多张图片同时上传"
          >
            <Upload.Dragger
              multiple
              listType="picture"
              beforeUpload={() => false}
              accept="image/*"
            >
              <p className="ant-upload-drag-icon">
                <CameraOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
              <p className="ant-upload-hint">
                支持 JPG、PNG 格式，建议图片清晰度不低于 1024x768
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form>

        {detectionResult && (
          <div style={{ marginTop: 24 }}>
            <h4>检测结果</h4>
            <Card>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="可信度评分"
                    value={detectionResult.confidence}
                    suffix="%"
                    valueStyle={{ 
                      color: detectionResult.confidence > 80 ? '#cf1322' : 
                             detectionResult.confidence > 60 ? '#fa8c16' : '#3f8600' 
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Progress
                    type="circle"
                    percent={detectionResult.confidence}
                    status={detectionResult.confidence > 80 ? 'exception' : 'normal'}
                    width={80}
                  />
                </Col>
              </Row>
              
              <div style={{ marginTop: 16 }}>
                <h5>风险因素：</h5>
                <Timeline>
                  {detectionResult.riskFactors.map((factor, index) => (
                    <Timeline.Item key={index} color="red">
                      {factor}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>

              <div style={{ marginTop: 16 }}>
                <h5>建议措施：</h5>
                <Timeline>
                  {detectionResult.recommendations.map((rec, index) => (
                    <Timeline.Item key={index} color="blue">
                      {rec}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CounterfeitDetection;
