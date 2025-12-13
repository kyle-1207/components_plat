import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Modal,
  Form,
  InputNumber,
  message,
  Tooltip,
  Badge,
  Popconfirm,
  Tabs,
  Progress,
  Statistic,
  Divider
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DollarCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
// TabPane 已废弃，使用 items 属性

// 选型清单相关接口定义
interface SelectionItem {
  id: string;
  componentId: string;
  componentName: string;
  componentType: string;
  specification: string;
  quantity: number;
  unit: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'selected' | 'approved' | 'rejected';
  estimatedCost: number;
  actualCost?: number;
  leadTime: number;
  supplierId?: string;
  supplierName?: string;
  technicalRequirements: string[];
  qualityRequirements: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SelectionList {
  id: string;
  name: string;
  description: string;
  projectId: string;
  projectName: string;
  status: 'draft' | 'in_review' | 'approved' | 'completed' | 'cancelled';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  items: SelectionItem[];
  totalEstimatedCost: number;
  totalActualCost: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  deadline?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

interface SelectionAnalysis {
  listId: string;
  totalItems: number;
  completedItems: number;
  pendingItems: number;
  totalCost: number;
  averageLeadTime: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  costBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  supplierDistribution: Array<{
    supplierId: string;
    supplierName: string;
    itemCount: number;
    totalValue: number;
  }>;
}

const SelectionManagement: React.FC = () => {
  const [selectionLists, setSelectionLists] = useState<SelectionList[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedList, setSelectedList] = useState<SelectionList | null>(null);
  const [analysis, setAnalysis] = useState<SelectionAnalysis | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAnalysisModalVisible, setIsAnalysisModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  // 获取选型清单列表
  const fetchSelectionLists = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/selections');
      const result = await response.json();
      if (result.success) {
        setSelectionLists(result.data.lists);
      }
    } catch (error) {
      message.error('获取选型清单列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取选型清单详情
  const fetchSelectionDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/selections/${id}`);
      const result = await response.json();
      if (result.success) {
        setSelectedList(result.data);
        setIsDetailModalVisible(true);
      }
    } catch (error) {
      message.error('获取选型清单详情失败');
    }
  };

  // 获取选型清单分析
  const fetchSelectionAnalysis = async (id: string) => {
    try {
      const response = await fetch(`/api/selections/${id}/analysis`);
      const result = await response.json();
      if (result.success) {
        setAnalysis(result.data);
        setIsAnalysisModalVisible(true);
      }
    } catch (error) {
      message.error('获取选型清单分析失败');
    }
  };

  // 创建选型清单
  const handleCreateList = async (values: any) => {
    try {
      const response = await fetch('/api/selections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          deadline: values.deadline ? values.deadline.toISOString() : null,
          tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()) : []
        }),
      });
      const result = await response.json();
      if (result.success) {
        message.success('选型清单创建成功');
        setIsCreateModalVisible(false);
        form.resetFields();
        fetchSelectionLists();
      } else {
        message.error(result.message || '创建失败');
      }
    } catch (error) {
      message.error('创建选型清单失败');
    }
  };

  // 删除选型清单
  const handleDeleteList = async (id: string) => {
    try {
      const response = await fetch(`/api/selections/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        message.success('选型清单删除成功');
        fetchSelectionLists();
      } else {
        message.error(result.message || '删除失败');
      }
    } catch (error) {
      message.error('删除选型清单失败');
    }
  };

  // 编辑选型清单
  const handleEditList = (record: SelectionList) => {
    setSelectedList(record);
    editForm.setFieldsValue({
      name: record.name,
      description: record.description,
      projectName: record.projectName,
      projectId: record.projectId,
      priority: record.priority,
      deadline: record.deadline ? dayjs(record.deadline) : undefined,
    });
    setIsEditModalVisible(true);
  };

  // 提交编辑
  const handleEditSubmit = async (values: any) => {
    if (!selectedList) return;
    
    try {
      const response = await fetch(`/api/selections/${selectedList.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          deadline: values.deadline ? values.deadline.toISOString() : null,
        }),
      });
      const result = await response.json();
      if (result.success) {
        message.success('选型清单更新成功');
        setIsEditModalVisible(false);
        editForm.resetFields();
        setSelectedList(null);
        fetchSelectionLists();
      } else {
        message.error(result.message || '更新失败');
      }
    } catch (error) {
      message.error('更新选型清单失败');
    }
  };

  useEffect(() => {
    fetchSelectionLists();
  }, []);

  // 状态标签配置
  const getStatusTag = (status: string) => {
    const statusConfig = {
      draft: { color: 'default', text: '草稿' },
      in_review: { color: 'processing', text: '审核中' },
      approved: { color: 'success', text: '已批准' },
      completed: { color: 'success', text: '已完成' },
      cancelled: { color: 'error', text: '已取消' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 优先级标签配置
  const getPriorityTag = (priority: string) => {
    const priorityConfig = {
      urgent: { color: 'red', text: '紧急' },
      high: { color: 'orange', text: '高' },
      medium: { color: 'blue', text: '中' },
      low: { color: 'default', text: '低' }
    };
    const config = priorityConfig[priority as keyof typeof priorityConfig] || { color: 'default', text: priority };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义
  const columns: ColumnsType<SelectionList> = [
    {
      title: '清单名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.description}</Text>
        </div>
      ),
    },
    {
      title: '项目信息',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>ID: {record.projectId}</Text>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: '草稿', value: 'draft' },
        { text: '审核中', value: 'in_review' },
        { text: '已批准', value: 'approved' },
        { text: '已完成', value: 'completed' },
        { text: '已取消', value: 'cancelled' }
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => getPriorityTag(priority),
      filters: [
        { text: '紧急', value: 'urgent' },
        { text: '高', value: 'high' },
        { text: '中', value: 'medium' },
        { text: '低', value: 'low' }
      ],
      onFilter: (value, record) => record.priority === value,
    },
    {
      title: '项目进度',
      key: 'progress',
      render: (_, record) => {
        const total = record.items.length;
        const completed = record.items.filter(item => item.status === 'approved').length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return (
          <div>
            <Progress percent={percentage} size="small" />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {completed}/{total} 项完成
            </Text>
          </div>
        );
      },
    },
    {
      title: '预估成本',
      dataIndex: 'totalEstimatedCost',
      key: 'totalEstimatedCost',
      render: (cost) => (
        <Statistic
          value={cost}
          precision={0}
          prefix="¥"
          valueStyle={{ fontSize: '14px' }}
        />
      ),
      sorter: (a, b) => a.totalEstimatedCost - b.totalEstimatedCost,
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline) => {
        if (!deadline) return '-';
        const date = dayjs(deadline);
        const isOverdue = date.isBefore(dayjs(), 'day');
        return (
          <Text type={isOverdue ? 'danger' : undefined}>
            {date.format('YYYY-MM-DD')}
            {isOverdue && <ExclamationCircleOutlined style={{ marginLeft: 4, color: '#ff4d4f' }} />}
          </Text>
        );
      },
      sorter: (a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<FileTextOutlined />}
              onClick={() => fetchSelectionDetail(record.id)}
            />
          </Tooltip>
          <Tooltip title="分析报告">
            <Button
              type="text"
              icon={<BarChartOutlined />}
              onClick={() => fetchSelectionAnalysis(record.id)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditList(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个选型清单吗？"
            onConfirm={() => handleDeleteList(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 选型项目表格列定义
  const itemColumns: ColumnsType<SelectionItem> = [
    {
      title: '器件名称',
      dataIndex: 'componentName',
      key: 'componentName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.componentType}</Text>
        </div>
      ),
    },
    {
      title: '规格要求',
      dataIndex: 'specification',
      key: 'specification',
      ellipsis: true,
    },
    {
      title: '数量',
      key: 'quantity',
      render: (_, record) => `${record.quantity} ${record.unit}`,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => getPriorityTag(priority),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          pending: { color: 'default', text: '待选型', icon: <ClockCircleOutlined /> },
          selected: { color: 'processing', text: '已选型', icon: <CheckCircleOutlined /> },
          approved: { color: 'success', text: '已批准', icon: <CheckCircleOutlined /> },
          rejected: { color: 'error', text: '已拒绝', icon: <ExclamationCircleOutlined /> }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status, icon: null };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '预估成本',
      dataIndex: 'estimatedCost',
      key: 'estimatedCost',
      render: (cost, record) => (
        <div>
          <div>¥{(cost * record.quantity).toLocaleString()}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            单价: ¥{cost.toLocaleString()}
          </Text>
        </div>
      ),
    },
    {
      title: '交付周期',
      dataIndex: 'leadTime',
      key: 'leadTime',
      render: (leadTime) => `${leadTime} 天`,
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (name) => name || '-',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>选型清单管理</Title>
        
        {/* 操作栏 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Input
              placeholder="搜索清单名称、描述或项目名称..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="draft">草稿</Option>
              <Option value="in_review">审核中</Option>
              <Option value="approved">已批准</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="优先级筛选"
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="urgent">紧急</Option>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
              style={{ width: '100%' }}
            >
              新建清单
            </Button>
          </Col>
        </Row>
      </div>

      {/* 选型清单表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={selectionLists}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Card>

      {/* 创建选型清单模态框 */}
      <Modal
        title="创建选型清单"
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateList}
        >
          <Form.Item
            name="name"
            label="清单名称"
            rules={[{ required: true, message: '请输入清单名称' }]}
          >
            <Input placeholder="请输入清单名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="项目ID"
                rules={[{ required: true, message: '请输入项目ID' }]}
              >
                <Input placeholder="请输入项目ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="projectName"
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value="urgent">紧急</Option>
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deadline"
                label="截止日期"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="tags"
            label="标签"
          >
            <Input placeholder="请输入标签，多个标签用逗号分隔" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => {
                setIsCreateModalVisible(false);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑选型清单模态框 */}
      <Modal
        title="编辑选型清单"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
          setSelectedList(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="name"
            label="清单名称"
            rules={[{ required: true, message: '请输入清单名称' }]}
          >
            <Input placeholder="请输入清单名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="清单描述"
            rules={[{ required: true, message: '请输入清单描述' }]}
          >
            <TextArea rows={3} placeholder="请输入清单描述" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectName"
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="项目ID"
                rules={[{ required: true, message: '请输入项目ID' }]}
              >
                <Input placeholder="请输入项目ID" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value="urgent">紧急</Option>
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deadline"
                label="截止日期"
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择截止日期" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setIsEditModalVisible(false);
                editForm.resetFields();
                setSelectedList(null);
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                更新
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 选型清单详情模态框 */}
      <Modal
        title={selectedList ? `选型清单详情 - ${selectedList.name}` : '选型清单详情'}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={1200}
      >
        {selectedList && (
          <Tabs 
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: "基本信息",
                children: (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Card title="清单信息" size="small">
                          <p><strong>名称：</strong>{selectedList.name}</p>
                          <p><strong>描述：</strong>{selectedList.description}</p>
                          <p><strong>状态：</strong>{getStatusTag(selectedList.status)}</p>
                          <p><strong>优先级：</strong>{getPriorityTag(selectedList.priority)}</p>
                          <p><strong>截止日期：</strong>{selectedList.deadline ? dayjs(selectedList.deadline).format('YYYY-MM-DD') : '-'}</p>
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card title="项目信息" size="small">
                          <p><strong>项目名称：</strong>{selectedList.projectName}</p>
                          <p><strong>项目ID：</strong>{selectedList.projectId}</p>
                          <p><strong>创建者：</strong>{selectedList.createdBy}</p>
                          <p><strong>创建时间：</strong>{dayjs(selectedList.createdAt).format('YYYY-MM-DD HH:mm')}</p>
                          <p><strong>最后修改：</strong>{dayjs(selectedList.updatedAt).format('YYYY-MM-DD HH:mm')}</p>
                        </Card>
                      </Col>
                    </Row>
                    
                    <Card title="成本统计" size="small" style={{ marginTop: 16 }}>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Statistic
                            title="预估总成本"
                            value={selectedList.totalEstimatedCost}
                            precision={0}
                            prefix="¥"
                          />
                        </Col>
                        <Col span={8}>
                          <Statistic
                            title="实际总成本"
                            value={selectedList.totalActualCost}
                            precision={0}
                            prefix="¥"
                          />
                        </Col>
                        <Col span={8}>
                          <Statistic
                            title="成本节约"
                            value={selectedList.totalEstimatedCost - selectedList.totalActualCost}
                            precision={0}
                            prefix="¥"
                            valueStyle={{ 
                              color: selectedList.totalEstimatedCost > selectedList.totalActualCost ? '#3f8600' : '#cf1322' 
                            }}
                          />
                        </Col>
                      </Row>
                    </Card>
                  </>
                )
              },
              {
                key: "2",
                label: "选型项目",
                children: (
                  <Table
                    columns={itemColumns}
                    dataSource={selectedList.items}
                    rowKey="id"
                    size="small"
                    pagination={false}
                  />
                )
              }
            ]}
          />
        )}
      </Modal>

      {/* 分析报告模态框 */}
      <Modal
        title="选型清单分析报告"
        open={isAnalysisModalVisible}
        onCancel={() => setIsAnalysisModalVisible(false)}
        footer={null}
        width={800}
      >
        {analysis && (
          <div>
            {/* 基础统计 */}
            <Card title="基础统计" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic title="总项目数" value={analysis.totalItems} />
                </Col>
                <Col span={6}>
                  <Statistic title="已完成" value={analysis.completedItems} />
                </Col>
                <Col span={6}>
                  <Statistic title="待处理" value={analysis.pendingItems} />
                </Col>
                <Col span={6}>
                  <Statistic 
                    title="完成率" 
                    value={analysis.totalItems > 0 ? Math.round((analysis.completedItems / analysis.totalItems) * 100) : 0}
                    suffix="%" 
                  />
                </Col>
              </Row>
            </Card>

            {/* 风险评估 */}
            <Card title="风险评估" size="small" style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <Badge 
                  status={analysis.riskLevel === 'high' ? 'error' : analysis.riskLevel === 'medium' ? 'warning' : 'success'} 
                  text={`风险等级：${analysis.riskLevel === 'high' ? '高' : analysis.riskLevel === 'medium' ? '中' : '低'}`}
                />
              </div>
              <div>
                <Text strong>风险因素：</Text>
                <ul style={{ marginTop: 8 }}>
                  {analysis.riskFactors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
              <div style={{ marginTop: 16 }}>
                <Text strong>平均交付周期：</Text> {analysis.averageLeadTime} 天
              </div>
            </Card>

            {/* 成本分析 */}
            <Card title="成本分析" size="small" style={{ marginBottom: 16 }}>
              <Statistic 
                title="总成本" 
                value={analysis.totalCost} 
                precision={0}
                prefix="¥"
                style={{ marginBottom: 16 }}
              />
              <div>
                <Text strong>成本构成：</Text>
                {analysis.costBreakdown.map((item, index) => (
                  <div key={index} style={{ marginTop: 8 }}>
                    <Row justify="space-between">
                      <Col>{item.category}</Col>
                      <Col>
                        <Text>¥{item.amount.toLocaleString()} ({item.percentage}%)</Text>
                      </Col>
                    </Row>
                    <Progress 
                      percent={item.percentage} 
                      size="small" 
                      showInfo={false}
                      style={{ marginTop: 4 }}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* 供应商分布 */}
            <Card title="供应商分布" size="small">
              {analysis.supplierDistribution.map((supplier, index) => (
                <div key={index} style={{ marginBottom: 12 }}>
                  <Row justify="space-between" style={{ marginBottom: 4 }}>
                    <Col>
                      <Text strong>{supplier.supplierName}</Text>
                    </Col>
                    <Col>
                      <Text>¥{supplier.totalValue.toLocaleString()}</Text>
                    </Col>
                  </Row>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {supplier.itemCount} 个项目
                  </Text>
                </div>
              ))}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SelectionManagement;