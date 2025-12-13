import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  message,
  Popconfirm,
  Tag,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DollarOutlined } from '@ant-design/icons';
import { financialAPI, contractAPI } from '@/services/api';
import type { FinancialRecord, PaginatedResponse, Contract } from '@/types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const FinancialList: React.FC = () => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [stats, setStats] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  });
  const [searchForm] = Form.useForm();
  const [recordForm] = Form.useForm();

  // 获取财务记录列表
  const fetchRecords = async (params?: any) => {
    setLoading(true);
    try {
      const response: PaginatedResponse<FinancialRecord> = await financialAPI.getFinancialRecords({
        page: pagination.current,
        per_page: pagination.pageSize,
        ...params,
      });
      if (response.success) {
        const data = Array.isArray(response.data) ? response.data : response.data.items;
        const total = Array.isArray(response.data) ? response.data.length : response.data.total;
        const page = Array.isArray(response.data) ? 1 : response.data.page;
        setRecords(data);
        setPagination(prev => ({
          ...prev,
          total,
          current: page,
        }));
        
        // 计算统计数据
        const totalAmount = data.reduce((sum: number, record: FinancialRecord) => sum + record.amount, 0);
        const paidAmount = data
          .filter((record: FinancialRecord) => record.status === 'paid')
          .reduce((sum: number, record: FinancialRecord) => sum + record.amount, 0);
        const pendingAmount = data
          .filter((record: FinancialRecord) => record.status === 'pending')
          .reduce((sum: number, record: FinancialRecord) => sum + record.amount, 0);
        const overdueAmount = data
          .filter((record: FinancialRecord) => record.status === 'overdue')
          .reduce((sum: number, record: FinancialRecord) => sum + record.amount, 0);
        
        setStats({ totalAmount, paidAmount, pendingAmount, overdueAmount });
      }
    } catch (error) {
      message.error('获取财务记录列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取合同列表
  const fetchContracts = async () => {
    try {
      const response: PaginatedResponse<Contract> = await contractAPI.getContracts({ per_page: 1000 });
      if (response.success) {
        const data = Array.isArray(response.data) ? response.data : response.data.items;
        setContracts(data);
      }
    } catch (error) {
      message.error('获取合同列表失败');
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchContracts();
  }, [pagination.current, pagination.pageSize]);

  // 搜索财务记录
  const handleSearch = (values: any) => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchRecords(values);
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchRecords();
  };

  // 打开新增/编辑模态框
  const showModal = (record?: FinancialRecord) => {
    setEditingRecord(record || null);
    setModalVisible(true);
    if (record) {
      recordForm.setFieldsValue({
        ...record,
        date: record.date ? dayjs(record.date) : null,
      });
    } else {
      recordForm.resetFields();
    }
  };

  // 保存财务记录
  const handleSave = async (values: any) => {
    try {
      const submitData = {
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : null,
      };
      
      if (editingRecord) {
        await financialAPI.updateFinancialRecord(editingRecord.id, submitData);
        message.success('更新财务记录成功');
      } else {
        await financialAPI.createFinancialRecord(submitData);
        message.success('创建财务记录成功');
      }
      setModalVisible(false);
      fetchRecords();
    } catch (error) {
      message.error(editingRecord ? '更新财务记录失败' : '创建财务记录失败');
    }
  };

  // 删除财务记录
  const handleDelete = async (id: number) => {
    try {
      await financialAPI.deleteFinancialRecord(id);
      message.success('删除财务记录成功');
      fetchRecords();
    } catch (error) {
      message.error('删除财务记录失败');
    }
  };

  // 表格列配置
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '合同',
      dataIndex: 'contract',
      key: 'contract',
      render: (contract: Contract) => {
        if (!contract) return '-';
        return `${contract.tenant?.name} - ${contract.office?.name}`;
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const labels = {
          rent: '租金',
          deposit: '押金',
          utility: '水电费',
          service: '服务费',
        };
        return labels[type as keyof typeof labels] || type;
      },
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          paid: 'green',
          pending: 'orange',
          overdue: 'red',
        };
        const labels = {
          paid: '已支付',
          pending: '待支付',
          overdue: '逾期',
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>
            {labels[status as keyof typeof labels]}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: FinancialRecord) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条财务记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2}>财务管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          新增财务记录
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总金额"
              value={stats.totalAmount}
              prefix={<DollarOutlined />}
              suffix="元"
              precision={0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已支付"
              value={stats.paidAmount}
              prefix={<DollarOutlined />}
              suffix="元"
              precision={0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待支付"
              value={stats.pendingAmount}
              prefix={<DollarOutlined />}
              suffix="元"
              precision={0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="逾期金额"
              value={stats.overdueAmount}
              prefix={<DollarOutlined />}
              suffix="元"
              precision={0}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索表单 */}
      <Card className="search-form" style={{ marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
        >
          <Row gutter={16} style={{ width: '100%' }}>
            <Col xs={24} sm={8} md={6}>
              <Form.Item name="contract_id" label="合同">
                <Select placeholder="请选择合同" allowClear>
                  {contracts.map(contract => (
                    <Option key={contract.id} value={contract.id}>
                      {contract.tenant?.name} - {contract.office?.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Form.Item name="type" label="类型">
                <Select placeholder="请选择类型" allowClear>
                  <Option value="rent">租金</Option>
                  <Option value="deposit">押金</Option>
                  <Option value="utility">水电费</Option>
                  <Option value="service">服务费</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" allowClear>
                  <Option value="paid">已支付</Option>
                  <Option value="pending">待支付</Option>
                  <Option value="overdue">逾期</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={6}>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    搜索
                  </Button>
                  <Button onClick={handleReset}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 财务记录表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize }));
            },
          }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingRecord ? '编辑财务记录' : '新增财务记录'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={recordForm}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="contract_id"
            label="合同"
            rules={[{ required: true, message: '请选择合同' }]}
          >
            <Select placeholder="请选择合同">
              {contracts.map(contract => (
                <Option key={contract.id} value={contract.id}>
                  {contract.tenant?.name} - {contract.office?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="类型"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select placeholder="请选择类型">
                  <Option value="rent">租金</Option>
                  <Option value="deposit">押金</Option>
                  <Option value="utility">水电费</Option>
                  <Option value="service">服务费</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="金额(元)"
                rules={[{ required: true, message: '请输入金额' }]}
              >
                <InputNumber placeholder="请输入金额" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

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
                name="date"
                label="日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="paid">已支付</Option>
                  <Option value="pending">待支付</Option>
                  <Option value="overdue">逾期</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FinancialList;
