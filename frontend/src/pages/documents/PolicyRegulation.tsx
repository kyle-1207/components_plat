import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Descriptions,
  Typography,
  DatePicker,
  Statistic,
  Timeline,
  Divider,
  message,
  Tooltip,
  Breadcrumb,
  Tabs
} from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TagOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  BookOutlined,
  GlobalOutlined,
  BankOutlined,
  RocketOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { Text, Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// 政策法规数据接口
interface PolicyRegulation {
  id: string;
  title: string;
  category: 'national' | 'ministry' | 'local' | 'industry';
  type: 'law' | 'regulation' | 'policy' | 'standard' | 'notice';
  field: 'commercial_space' | 'components' | 'technology' | 'trade' | 'safety' | 'quality';
  issuer: string;
  publishDate: string;
  effectiveDate: string;
  status: 'effective' | 'draft' | 'abolished' | 'revised';
  level: 'high' | 'medium' | 'low';
  summary: string;
  content: string;
  attachments: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  relatedPolicies: string[];
  tags: string[];
  viewCount: number;
  downloadCount: number;
}

// 模拟数据
const mockPolicyData: PolicyRegulation[] = [
  {
    id: '1',
    title: '关于促进商业航天发展的指导意见',
    category: 'national',
    type: 'policy',
    field: 'commercial_space',
    issuer: '国家发展改革委',
    publishDate: '2024-01-15',
    effectiveDate: '2024-02-01',
    status: 'effective',
    level: 'high',
    summary: '为贯彻落实国家航天强国战略，促进商业航天产业健康有序发展，制定本指导意见。',
    content: '详细政策内容...',
    attachments: [
      { name: '政策全文.pdf', url: '/files/policy1.pdf', size: 2048000, type: 'pdf' }
    ],
    relatedPolicies: ['2', '3'],
    tags: ['商业航天', '产业发展', '指导意见'],
    viewCount: 1250,
    downloadCount: 350
  },
  {
    id: '2',
    title: '航天器元器件质量管理办法',
    category: 'ministry',
    type: 'regulation',
    field: 'components',
    issuer: '国家航天局',
    publishDate: '2023-12-10',
    effectiveDate: '2024-01-01',
    status: 'effective',
    level: 'high',
    summary: '规范航天器元器件的质量管理要求，确保航天器安全可靠运行。',
    content: '详细管理办法...',
    attachments: [
      { name: '管理办法.pdf', url: '/files/regulation2.pdf', size: 1536000, type: 'pdf' }
    ],
    relatedPolicies: ['1', '4'],
    tags: ['元器件', '质量管理', '航天器'],
    viewCount: 890,
    downloadCount: 240
  },
  {
    id: '3',
    title: '电子元器件行业标准化发展规划',
    category: 'ministry',
    type: 'standard',
    field: 'components',
    issuer: '工业和信息化部',
    publishDate: '2023-11-20',
    effectiveDate: '2023-12-01',
    status: 'effective',
    level: 'medium',
    summary: '明确电子元器件行业标准化发展目标、重点任务和保障措施。',
    content: '详细规划内容...',
    attachments: [
      { name: '发展规划.pdf', url: '/files/standard3.pdf', size: 3072000, type: 'pdf' }
    ],
    relatedPolicies: ['2', '5'],
    tags: ['电子元器件', '标准化', '发展规划'],
    viewCount: 650,
    downloadCount: 180
  }
];

const PolicyRegulation: React.FC = () => {
  const [policies, setPolicies] = useState<PolicyRegulation[]>(mockPolicyData);
  const [filteredPolicies, setFilteredPolicies] = useState<PolicyRegulation[]>(mockPolicyData);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRegulation | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  // 分类选项
  const categoryOptions = [
    { value: 'national', label: '国家级' },
    { value: 'ministry', label: '部委级' },
    { value: 'local', label: '地方级' },
    { value: 'industry', label: '行业级' }
  ];

  const typeOptions = [
    { value: 'law', label: '法律' },
    { value: 'regulation', label: '法规' },
    { value: 'policy', label: '政策' },
    { value: 'standard', label: '标准' },
    { value: 'notice', label: '通知' }
  ];

  const fieldOptions = [
    { value: 'commercial_space', label: '商业航天' },
    { value: 'components', label: '元器件' },
    { value: 'technology', label: '技术创新' },
    { value: 'trade', label: '贸易管理' },
    { value: 'safety', label: '安全管理' },
    { value: 'quality', label: '质量管理' }
  ];

  const statusOptions = [
    { value: 'effective', label: '有效' },
    { value: 'draft', label: '草案' },
    { value: 'abolished', label: '废止' },
    { value: 'revised', label: '修订中' }
  ];

  // 搜索和过滤逻辑
  useEffect(() => {
    let filtered = [...policies];

    // 文本搜索
    if (searchText) {
      filtered = filtered.filter(policy =>
        policy.title.toLowerCase().includes(searchText.toLowerCase()) ||
        policy.issuer.toLowerCase().includes(searchText.toLowerCase()) ||
        policy.summary.toLowerCase().includes(searchText.toLowerCase()) ||
        policy.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // 分类过滤
    if (selectedCategory) {
      filtered = filtered.filter(policy => policy.category === selectedCategory);
    }

    if (selectedType) {
      filtered = filtered.filter(policy => policy.type === selectedType);
    }

    if (selectedField) {
      filtered = filtered.filter(policy => policy.field === selectedField);
    }

    if (selectedStatus) {
      filtered = filtered.filter(policy => policy.status === selectedStatus);
    }

    // 日期范围过滤
    if (dateRange) {
      filtered = filtered.filter(policy => {
        const publishDate = dayjs(policy.publishDate);
        return publishDate.isAfter(dateRange[0].subtract(1, 'day')) &&
               publishDate.isBefore(dateRange[1].add(1, 'day'));
      });
    }

    setFilteredPolicies(filtered);
  }, [policies, searchText, selectedCategory, selectedType, selectedField, selectedStatus, dateRange]);

  // 获取分类标签颜色
  const getCategoryColor = (category: string) => {
    const colors = {
      national: 'red',
      ministry: 'blue',
      local: 'green',
      industry: 'purple'
    };
    return colors[category as keyof typeof colors] || 'default';
  };

  // 获取类型标签颜色
  const getTypeColor = (type: string) => {
    const colors = {
      law: 'red',
      regulation: 'orange',
      policy: 'blue',
      standard: 'green',
      notice: 'cyan'
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    const colors = {
      effective: 'green',
      draft: 'orange',
      abolished: 'red',
      revised: 'blue'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  // 获取级别标签颜色
  const getLevelColor = (level: string) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      low: 'blue'
    };
    return colors[level as keyof typeof colors] || 'default';
  };

  // 表格列定义
  const columns: ColumnsType<PolicyRegulation> = [
    {
      title: '政策标题',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text: string, record: PolicyRegulation) => (
        <div>
          <Button
            type="link"
            onClick={() => {
              setSelectedPolicy(record);
              setDetailModalVisible(true);
            }}
            style={{ padding: 0, height: 'auto', fontWeight: 500 }}
          >
            {text}
          </Button>
          <div style={{ marginTop: 4 }}>
            <Space size={4}>
              <Tag color={getCategoryColor(record.category)}>
                {categoryOptions.find(opt => opt.value === record.category)?.label}
              </Tag>
              <Tag color={getTypeColor(record.type)}>
                {typeOptions.find(opt => opt.value === record.type)?.label}
              </Tag>
              <Tag color={getLevelColor(record.level)}>
                {record.level === 'high' ? '高' : record.level === 'medium' ? '中' : '低'}
              </Tag>
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: '发布机构',
      dataIndex: 'issuer',
      key: 'issuer',
      width: 150,
    },
    {
      title: '领域',
      dataIndex: 'field',
      key: 'field',
      width: 120,
      render: (field: string) => (
        <Tag color="blue">
          {fieldOptions.find(opt => opt.value === field)?.label}
        </Tag>
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'publishDate',
      key: 'publishDate',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '生效时间',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {statusOptions.find(opt => opt.value === status)?.label}
        </Tag>
      ),
    },
    {
      title: '统计',
      key: 'stats',
      width: 120,
      render: (_, record: PolicyRegulation) => (
        <div>
          <div><EyeOutlined /> {record.viewCount}</div>
          <div><DownloadOutlined /> {record.downloadCount}</div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: PolicyRegulation) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedPolicy(record);
                setDetailModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="下载文件">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => {
                message.success('开始下载政策文件');
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 清空筛选条件
  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedField('');
    setSelectedStatus('');
    setDateRange(null);
  };

  // 刷新数据
  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('数据刷新成功');
    }, 1000);
  };

  // 统计信息
  const getStatistics = () => {
    const total = policies.length;
    const effective = policies.filter(p => p.status === 'effective').length;
    const commercial_space = policies.filter(p => p.field === 'commercial_space').length;
    const components = policies.filter(p => p.field === 'components').length;

    return { total, effective, commercial_space, components };
  };

  const stats = getStatistics();

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 面包屑导航 */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>资料及培训</Breadcrumb.Item>
        <Breadcrumb.Item>政策法规</Breadcrumb.Item>
      </Breadcrumb>

      {/* 页面标题和统计 */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="政策总数" 
              value={stats.total} 
              prefix={<BookOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="有效政策" 
              value={stats.effective} 
              prefix={<GlobalOutlined />} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="商业航天" 
              value={stats.commercial_space} 
              prefix={<RocketOutlined />} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="元器件" 
              value={stats.components} 
              prefix={<BankOutlined />} 
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="政策列表" key="list">
            {/* 搜索和筛选区域 */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Search
                  placeholder="搜索政策标题、发布机构或关键词"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={(value) => setSearchText(value)}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={3}>
                <Select
                  placeholder="分类"
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  allowClear
                  style={{ width: '100%' }}
                >
                  {categoryOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={3}>
                <Select
                  placeholder="类型"
                  value={selectedType}
                  onChange={setSelectedType}
                  allowClear
                  style={{ width: '100%' }}
                >
                  {typeOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={3}>
                <Select
                  placeholder="领域"
                  value={selectedField}
                  onChange={setSelectedField}
                  allowClear
                  style={{ width: '100%' }}
                >
                  {fieldOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={3}>
                <Select
                  placeholder="状态"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  allowClear
                  style={{ width: '100%' }}
                >
                  {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={6}>
                <Space>
                  <RangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    placeholder={['开始日期', '结束日期']}
                  />
                  <Button icon={<FilterOutlined />} onClick={clearFilters}>
                    清空
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={refreshData}>
                    刷新
                  </Button>
                </Space>
              </Col>
            </Row>

            {/* 政策列表表格 */}
            <Table
              columns={columns}
              dataSource={filteredPolicies}
              loading={loading}
              rowKey="id"
              pagination={{
                total: filteredPolicies.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>

          <TabPane tab="政策时间线" key="timeline">
            <Timeline mode="left">
              {policies
                .sort((a, b) => dayjs(b.publishDate).valueOf() - dayjs(a.publishDate).valueOf())
                .map(policy => (
                  <Timeline.Item
                    key={policy.id}
                    label={dayjs(policy.publishDate).format('YYYY-MM-DD')}
                    color={policy.level === 'high' ? 'red' : policy.level === 'medium' ? 'blue' : 'green'}
                  >
                    <Card size="small" style={{ marginBottom: 8 }}>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <Text strong>{policy.title}</Text>
                          <div style={{ marginTop: 4 }}>
                            <Space size={4}>
                              <Tag color={getCategoryColor(policy.category)} size="small">
                                {categoryOptions.find(opt => opt.value === policy.category)?.label}
                              </Tag>
                              <Tag color={getTypeColor(policy.type)} size="small">
                                {typeOptions.find(opt => opt.value === policy.type)?.label}
                              </Tag>
                            </Space>
                          </div>
                        </div>
                        <Text type="secondary">{policy.issuer}</Text>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                          {policy.summary}
                        </Paragraph>
                      </Space>
                    </Card>
                  </Timeline.Item>
                ))}
            </Timeline>
          </TabPane>
        </Tabs>
      </Card>

      {/* 政策详情弹窗 */}
      <Modal
        title="政策法规详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            下载文件
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedPolicy && (
          <div>
            <Title level={4}>{selectedPolicy.title}</Title>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="发布机构">{selectedPolicy.issuer}</Descriptions.Item>
              <Descriptions.Item label="政策分类">
                <Tag color={getCategoryColor(selectedPolicy.category)}>
                  {categoryOptions.find(opt => opt.value === selectedPolicy.category)?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="政策类型">
                <Tag color={getTypeColor(selectedPolicy.type)}>
                  {typeOptions.find(opt => opt.value === selectedPolicy.type)?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="适用领域">
                <Tag color="blue">
                  {fieldOptions.find(opt => opt.value === selectedPolicy.field)?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="发布时间">
                {dayjs(selectedPolicy.publishDate).format('YYYY年MM月DD日')}
              </Descriptions.Item>
              <Descriptions.Item label="生效时间">
                {dayjs(selectedPolicy.effectiveDate).format('YYYY年MM月DD日')}
              </Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={getStatusColor(selectedPolicy.status)}>
                  {statusOptions.find(opt => opt.value === selectedPolicy.status)?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="重要程度">
                <Tag color={getLevelColor(selectedPolicy.level)}>
                  {selectedPolicy.level === 'high' ? '高' : selectedPolicy.level === 'medium' ? '中' : '低'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>政策摘要</Title>
            <Paragraph>{selectedPolicy.summary}</Paragraph>

            <Title level={5}>关键词</Title>
            <Space size={[8, 8]} wrap>
              {selectedPolicy.tags.map(tag => (
                <Tag key={tag} icon={<TagOutlined />}>{tag}</Tag>
              ))}
            </Space>

            {selectedPolicy.attachments.length > 0 && (
              <>
                <Divider />
                <Title level={5}>附件下载</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {selectedPolicy.attachments.map((attachment, index) => (
                    <Card key={index} size="small">
                      <Space>
                        <FileTextOutlined />
                        <span>{attachment.name}</span>
                        <span style={{ color: '#999' }}>
                          ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <Button type="link" icon={<DownloadOutlined />}>
                          下载
                        </Button>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PolicyRegulation;
