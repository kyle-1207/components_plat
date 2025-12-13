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
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { contractAPI, tenantAPI, officeAPI } from '@/services/api';
import type { Contract, PaginatedResponse, Tenant, Office } from '@/types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;


const ContractList: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchForm] = Form.useForm();
  const [contractForm] = Form.useForm();

  // 获取合同列表
  const fetchContracts = async (params?: any) => {
    setLoading(true);
    try {
      const response: PaginatedResponse<Contract> = await contractAPI.getContracts({
        page: pagination.current,
        per_page: pagination.pageSize,
        ...params,
      });
      if (response.success) {
        const data = Array.isArray(response.data) ? response.data : response.data.items;
        const total = Array.isArray(response.data) ? response.data.length : response.data.total;
        const page = Array.isArray(response.data) ? 1 : response.data.page;
        setContracts(data);
        setPagination(prev => ({
          ...prev,
          total,
          current: page,
        }));
      }
    } catch (error) {
      message.error('获取合同列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取租户和办公空间列表
  const fetchSelectOptions = async () => {
    try {
      const [tenantsRes, officesRes] = await Promise.all([
        tenantAPI.getTenants({ per_page: 1000 }),
        officeAPI.getOffices({ per_page: 1000 }),
      ]);
      
      if (tenantsRes.success) {
        const tenantsData = Array.isArray(tenantsRes.data) ? tenantsRes.data : tenantsRes.data.items;
        setTenants(tenantsData);
      }
      if (officesRes.success) {
        const officesData = Array.isArray(officesRes.data) ? officesRes.data : officesRes.data.items;
        setOffices(officesData);
      }
    } catch (error) {
      message.error('获取选项数据失败');
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchSelectOptions();
  }, [pagination.current, pagination.pageSize]);

  // 搜索合同
  const handleSearch = (values: any) => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchContracts(values);
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchContracts();
  };

  // 打开新增/编辑模态框
  const showModal = (contract?: Contract) => {
    setEditingContract(contract || null);
    setModalVisible(true);
    if (contract) {
      contractForm.setFieldsValue({
        ...contract,
        start_date: contract.start_date ? dayjs(contract.start_date) : null,
        end_date: contract.end_date ? dayjs(contract.end_date) : null,
      });
    } else {
      contractForm.resetFields();
    }
  };

  // 保存合同
  const handleSave = async (values: any) => {
    try {
      const submitData = {
        ...values,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
      };
      
      if (editingContract) {
        await contractAPI.updateContract(editingContract.id, submitData);
        message.success('更新合同成功');
      } else {
        await contractAPI.createContract(submitData);
        message.success('创建合同成功');
      }
      setModalVisible(false);
      fetchContracts();
    } catch (error) {
      message.error(editingContract ? '更新合同失败' : '创建合同失败');
    }
  };

  // 删除合同
  const handleDelete = async (id: number) => {
    try {
      await contractAPI.deleteContract(id);
      message.success('删除合同成功');
      fetchContracts();
    } catch (error) {
      message.error('删除合同失败');
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
      title: '租户',
      dataIndex: 'tenant',
      key: 'tenant',
      render: (tenant: Tenant) => tenant?.name || '-',
    },
    {
      title: '办公空间',
      dataIndex: 'office',
      key: 'office',
      render: (office: Office) => office?.name || '-',
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: '结束日期',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: '月租金',
      dataIndex: 'monthly_rent',
      key: 'monthly_rent',
      render: (price: number) => `¥${price.toLocaleString()}`,
    },
    {
      title: '押金',
      dataIndex: 'deposit',
      key: 'deposit',
      render: (price: number) => `¥${price.toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          active: 'green',
          expired: 'red',
          terminated: 'orange',
        };
        const labels = {
          active: '生效中',
          expired: '已过期',
          terminated: '已终止',
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
      render: (_: any, record: Contract) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个合同吗？"
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
        <Title level={2}>租赁合同管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          新增合同
        </Button>
      </div>

      {/* 搜索表单 */}
      <Card className="search-form" style={{ marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
        >
          <Row gutter={16} style={{ width: '100%' }}>
            <Col xs={24} sm={8} md={6}>
              <Form.Item name="tenant_id" label="租户">
                <Select placeholder="请选择租户" allowClear>
                  {tenants.map(tenant => (
                    <Option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Form.Item name="office_id" label="办公空间">
                <Select placeholder="请选择办公空间" allowClear>
                  {offices.map(office => (
                    <Option key={office.id} value={office.id}>
                      {office.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" allowClear>
                  <Option value="active">生效中</Option>
                  <Option value="expired">已过期</Option>
                  <Option value="terminated">已终止</Option>
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

      {/* 合同表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={contracts}
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
        title={editingContract ? '编辑合同' : '新增合同'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={contractForm}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tenant_id"
                label="租户"
                rules={[{ required: true, message: '请选择租户' }]}
              >
                <Select placeholder="请选择租户">
                  {tenants.map(tenant => (
                    <Option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="office_id"
                label="办公空间"
                rules={[{ required: true, message: '请选择办公空间' }]}
              >
                <Select placeholder="请选择办公空间">
                  {offices.filter(office => office.status === 'available').map(office => (
                    <Option key={office.id} value={office.id}>
                      {office.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="开始日期"
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="结束日期"
                rules={[{ required: true, message: '请选择结束日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="monthly_rent"
                label="月租金(元)"
                rules={[{ required: true, message: '请输入月租金' }]}
              >
                <InputNumber placeholder="请输入月租金" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deposit"
                label="押金(元)"
                rules={[{ required: true, message: '请输入押金' }]}
              >
                <InputNumber placeholder="请输入押金" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="terms"
            label="合同条款"
          >
            <TextArea rows={4} placeholder="请输入合同条款" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">生效中</Option>
              <Option value="expired">已过期</Option>
              <Option value="terminated">已终止</Option>
            </Select>
          </Form.Item>

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

export default ContractList;
