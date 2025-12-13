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
  Steps,
  Row,
  Col,
  Typography,
  Progress,
  Tabs,
  Descriptions,
  Alert,
  Divider,
  message,
  Tree,
  Timeline
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CompareOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
// TabPane 已废弃，使用 items 属性
const { Step } = Steps;

interface StandardComparison {
  id: string;
  comparisonId: string;
  comparisonName: string;
  standards: {
    standardId: string;
    standardCode: string;
    standardTitle: string;
    version: string;
    type: string;
  }[];
  analysisReport: {
    overallSimilarity: number;
    equivalenceAssessment: 'equivalent' | 'partially_equivalent' | 'not_equivalent';
    majorDifferences: string[];
    recommendations: string[];
  };
  metadata: {
    createdBy: string;
    status: 'draft' | 'reviewing' | 'approved' | 'rejected';
    purpose: string;
  };
  createdAt: string;
}

interface ComparisonResult {
  dimensionName: string;
  standardResults: {
    standardCode: string;
    content: string;
    status: 'identical' | 'similar' | 'different' | 'missing';
  }[];
  summary: string;
  differences: string[];
}

const StandardComparison: React.FC = () => {
  const [comparisons, setComparisons] = useState<StandardComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    comparisonName: '',
    status: '',
    equivalenceAssessment: ''
  });
  const [selectedComparison, setSelectedComparison] = useState<StandardComparison | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [selectedStandards, setSelectedStandards] = useState<any[]>([]);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);

  // 表格列定义
  const columns: ColumnsType<StandardComparison> = [
    {
      title: '比对编号',
      dataIndex: 'comparisonId',
      key: 'comparisonId',
      width: 150,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '比对名称',
      dataIndex: 'comparisonName',
      key: 'comparisonName',
      width: 250,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '比对标准',
      dataIndex: 'standards',
      key: 'standards',
      width: 300,
      render: (standards) => (
        <div>
          {standards.map((std: any, index: number) => (
            <Tag key={index} color="blue" style={{ marginBottom: '4px' }}>
              {std.standardCode}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '相似度',
      dataIndex: ['analysisReport', 'overallSimilarity'],
      key: 'similarity',
      width: 120,
      render: (similarity) => (
        <Progress
          percent={similarity}
          size="small"
          status={similarity >= 80 ? 'success' : similarity >= 60 ? 'normal' : 'exception'}
        />
      )
    },
    {
      title: '等效性评估',
      dataIndex: ['analysisReport', 'equivalenceAssessment'],
      key: 'equivalenceAssessment',
      width: 120,
      render: (assessment) => {
        const config = {
          equivalent: { color: 'success', text: '等效' },
          partially_equivalent: { color: 'warning', text: '部分等效' },
          not_equivalent: { color: 'error', text: '不等效' }
        };
        const { color, text } = config[assessment as keyof typeof config];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: ['metadata', 'status'],
      key: 'status',
      width: 100,
      render: (status) => {
        const config = {
          draft: { color: 'default', text: '草稿' },
          reviewing: { color: 'processing', text: '审核中' },
          approved: { color: 'success', text: '已批准' },
          rejected: { color: 'error', text: '已拒绝' }
        };
        const { color, text } = config[status as keyof typeof config];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '创建人',
      dataIndex: ['metadata', 'createdBy'],
      key: 'createdBy',
      width: 100
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => dayjs(date).format('YYYY-MM-DD')
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
            disabled={record.metadata.status === 'approved'}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => handleGenerateReport(record)}
          >
            报告
          </Button>
        </Space>
      )
    }
  ];

  // 获取比对记录列表
  const fetchComparisons = async () => {
    setLoading(true);
    try {
      // 模拟数据
      const mockData: StandardComparison[] = [
        {
          id: '1',
          comparisonId: 'CMP-2024-001',
          comparisonName: 'MIL-STD-883 vs ESCC 9000系列比对',
          standards: [
            { standardId: '1', standardCode: 'MIL-STD-883K', standardTitle: '微电路试验方法和程序', version: 'K', type: 'MIL' },
            { standardId: '2', standardCode: 'ESCC 9000', standardTitle: '欧洲空间器件通用规范', version: '1.0', type: 'ESCC' }
          ],
          analysisReport: {
            overallSimilarity: 75,
            equivalenceAssessment: 'partially_equivalent',
            majorDifferences: ['测试条件差异', '合格判据不同', '样本数量要求不一致'],
            recommendations: ['建议采用更严格的测试条件', '统一合格判据', '增加样本数量']
          },
          metadata: {
            createdBy: '张工程师',
            status: 'approved',
            purpose: '为项目选择合适的测试标准'
          },
          createdAt: '2024-01-15'
        }
      ];
      setComparisons(mockData);
    } catch (error) {
      message.error('获取比对记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisons();
  }, [searchParams]);

  // 查看详情
  const handleViewDetail = (record: StandardComparison) => {
    setSelectedComparison(record);
    // 模拟比对结果数据
    const mockResults: ComparisonResult[] = [
      {
        dimensionName: '测试条件',
        standardResults: [
          { standardCode: 'MIL-STD-883K', content: '温度范围: -55°C to +125°C', status: 'similar' },
          { standardCode: 'ESCC 9000', content: '温度范围: -55°C to +125°C', status: 'similar' }
        ],
        summary: '两个标准的温度范围基本一致',
        differences: ['测试时间要求略有不同']
      },
      {
        dimensionName: '合格判据',
        standardResults: [
          { standardCode: 'MIL-STD-883K', content: '失效率 < 0.1%', status: 'different' },
          { standardCode: 'ESCC 9000', content: '失效率 < 0.05%', status: 'different' }
        ],
        summary: 'ESCC标准要求更严格',
        differences: ['失效率阈值不同', '统计方法有差异']
      }
    ];
    setComparisonResults(mockResults);
    setDetailModalVisible(true);
  };

  // 生成报告
  const handleGenerateReport = (record: StandardComparison) => {
    message.info(`生成比对报告: ${record.comparisonId}`);
  };

  // 创建新比对
  const handleCreateComparison = () => {
    setCurrentStep(0);
    setSelectedStandards([]);
    form.resetFields();
    setCreateModalVisible(true);
  };

  // 下一步
  const handleNext = () => {
    if (currentStep === 0) {
      form.validateFields(['comparisonName', 'purpose']).then(() => {
        setCurrentStep(1);
      });
    } else if (currentStep === 1) {
      if (selectedStandards.length < 2) {
        message.error('请至少选择2个标准进行比对');
        return;
      }
      setCurrentStep(2);
    }
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // 搜索处理
  const handleSearch = (key: string, value: string) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>标准比对分析</Title>
      
      {/* 搜索区域 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input
              placeholder="比对名称"
              prefix={<SearchOutlined />}
              value={searchParams.comparisonName}
              onChange={(e) => handleSearch('comparisonName', e.target.value)}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="状态"
              style={{ width: '100%' }}
              value={searchParams.status}
              onChange={(value) => handleSearch('status', value)}
              allowClear
            >
              <Option value="draft">草稿</Option>
              <Option value="reviewing">审核中</Option>
              <Option value="approved">已批准</Option>
              <Option value="rejected">已拒绝</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="等效性评估"
              style={{ width: '100%' }}
              value={searchParams.equivalenceAssessment}
              onChange={(value) => handleSearch('equivalenceAssessment', value)}
              allowClear
            >
              <Option value="equivalent">等效</Option>
              <Option value="partially_equivalent">部分等效</Option>
              <Option value="not_equivalent">不等效</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 表格 */}
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateComparison}
          >
            新建比对
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={comparisons}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="标准比对详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={1200}
      >
        {selectedComparison && (
          <Tabs 
            defaultActiveKey="basic"
            items={[
              {
                key: "basic",
                label: "基本信息",
                children: (
                  <>
                    <Descriptions bordered column={2}>
                <Descriptions.Item label="比对编号">
                  {selectedComparison.comparisonId}
                </Descriptions.Item>
                <Descriptions.Item label="比对名称">
                  {selectedComparison.comparisonName}
                </Descriptions.Item>
                <Descriptions.Item label="比对目的">
                  {selectedComparison.metadata.purpose}
                </Descriptions.Item>
                <Descriptions.Item label="创建人">
                  {selectedComparison.metadata.createdBy}
                </Descriptions.Item>
                <Descriptions.Item label="相似度">
                  <Progress percent={selectedComparison.analysisReport.overallSimilarity} />
                </Descriptions.Item>
                <Descriptions.Item label="等效性评估">
                  <Tag color={
                    selectedComparison.analysisReport.equivalenceAssessment === 'equivalent' ? 'success' :
                    selectedComparison.analysisReport.equivalenceAssessment === 'partially_equivalent' ? 'warning' : 'error'
                  }>
                    {selectedComparison.analysisReport.equivalenceAssessment === 'equivalent' ? '等效' :
                     selectedComparison.analysisReport.equivalenceAssessment === 'partially_equivalent' ? '部分等效' : '不等效'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
              
              <Divider />
              
              <Title level={4}>比对标准</Title>
              {selectedComparison.standards.map((std, index) => (
                <Card key={index} size="small" style={{ marginBottom: '8px' }}>
                  <Row>
                    <Col span={6}>
                      <Text strong>{std.standardCode}</Text>
                    </Col>
                    <Col span={12}>
                      <Text>{std.standardTitle}</Text>
                    </Col>
                    <Col span={3}>
                      <Tag>{std.type}</Tag>
                    </Col>
                    <Col span={3}>
                      <Text type="secondary">v{std.version}</Text>
                    </Col>
                  </Row>
                </Card>
              ))}
                  </>
                )
              },
              {
                key: "results",
                label: "比对结果",
                children: (
                  <>
                    {comparisonResults.map((result, index) => (
                <Card key={index} title={result.dimensionName} style={{ marginBottom: '16px' }}>
                  <Row gutter={16}>
                    {result.standardResults.map((stdResult, stdIndex) => (
                      <Col span={12} key={stdIndex}>
                        <Card size="small">
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <Text strong>{stdResult.standardCode}</Text>
                            <Tag 
                              color={
                                stdResult.status === 'identical' ? 'success' :
                                stdResult.status === 'similar' ? 'processing' :
                                stdResult.status === 'different' ? 'warning' : 'error'
                              }
                              style={{ marginLeft: '8px' }}
                            >
                              {stdResult.status === 'identical' ? '一致' :
                               stdResult.status === 'similar' ? '相似' :
                               stdResult.status === 'different' ? '不同' : '缺失'}
                            </Tag>
                          </div>
                          <Paragraph>{stdResult.content}</Paragraph>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  
                  <Divider />
                  
                  <div>
                    <Text strong>总结：</Text>
                    <Paragraph>{result.summary}</Paragraph>
                  </div>
                  
                  {result.differences.length > 0 && (
                    <div>
                      <Text strong>主要差异：</Text>
                      <ul>
                        {result.differences.map((diff, diffIndex) => (
                          <li key={diffIndex}>{diff}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
                  </>
                )
              },
              {
                key: "analysis",
                label: "分析报告",
                children: (
                  <>
                    <Card title="主要差异">
                <ul>
                  {selectedComparison.analysisReport.majorDifferences.map((diff, index) => (
                    <li key={index}>{diff}</li>
                  ))}
                </ul>
              </Card>
              
              <Card title="建议措施" style={{ marginTop: '16px' }}>
                <ul>
                  {selectedComparison.analysisReport.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </Card>
                  </>
                )
              }
            ]}
          />
        )}
      </Modal>

      {/* 创建比对模态框 */}
      <Modal
        title="创建标准比对"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
      >
        <Steps current={currentStep} style={{ marginBottom: '24px' }}>
          <Step title="基本信息" />
          <Step title="选择标准" />
          <Step title="配置比对" />
        </Steps>
        
        <Form form={form} layout="vertical">
          {currentStep === 0 && (
            <>
              <Form.Item
                label="比对名称"
                name="comparisonName"
                rules={[{ required: true, message: '请输入比对名称' }]}
              >
                <Input placeholder="请输入比对名称" />
              </Form.Item>
              
              <Form.Item
                label="比对目的"
                name="purpose"
                rules={[{ required: true, message: '请输入比对目的' }]}
              >
                <TextArea rows={3} placeholder="请输入比对目的" />
              </Form.Item>
              
              <Form.Item label="比对范围" name="scope">
                <TextArea rows={2} placeholder="请输入比对范围" />
              </Form.Item>
            </>
          )}
          
          {currentStep === 1 && (
            <div>
              <Alert
                message="请选择要比对的标准（至少2个）"
                type="info"
                style={{ marginBottom: '16px' }}
              />
              {/* 这里可以添加标准选择组件 */}
              <div style={{ border: '1px dashed #d9d9d9', padding: '16px', textAlign: 'center' }}>
                <Text type="secondary">标准选择组件（待实现）</Text>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div>
              <Alert
                message="配置比对维度和参数"
                type="info"
                style={{ marginBottom: '16px' }}
              />
              {/* 这里可以添加比对配置组件 */}
              <div style={{ border: '1px dashed #d9d9d9', padding: '16px', textAlign: 'center' }}>
                <Text type="secondary">比对配置组件（待实现）</Text>
              </div>
            </div>
          )}
        </Form>
        
        <div style={{ textAlign: 'right', marginTop: '24px' }}>
          <Space>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>上一步</Button>
            )}
            {currentStep < 2 && (
              <Button type="primary" onClick={handleNext}>下一步</Button>
            )}
            {currentStep === 2 && (
              <Button type="primary" onClick={() => {
                message.success('比对创建成功');
                setCreateModalVisible(false);
                fetchComparisons();
              }}>
                创建比对
              </Button>
            )}
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default StandardComparison;
