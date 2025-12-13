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
  message,
  Popconfirm,
  Tag,
  Typography,
  Row,
  Col,
  Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { officeAPI } from '@/services/api';
import type { Office, PaginatedResponse } from '@/types';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const OfficeList: React.FC = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchForm] = Form.useForm();
  const [officeForm] = Form.useForm();

  // 获取办公空间列表
  const fetchOffices = async (params?: any) => {
    setLoading(true);
    try {
      const response: PaginatedResponse<Office> = await officeAPI.getOffices({
        page: pagination.current,
        per_page: pagination.pageSize,
        ...params,
      });
      if (response.success) {
        const data = Array.isArray(response.data) ? response.data : response.data.items;
        const total = Array.isArray(response.data) ? response.data.length : response.data.total;
        const page = Array.isArray(response.data) ? 1 : response.data.page;
        setOffices(data);
        setPagination(prev => ({
          ...prev,
          total,
          current: page,
        }));
      }
    } catch (error) {
      message.error('获取办公空间列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, [pagination.current, pagination.pageSize]);

  // 搜索办公空间
  const handleSearch = (values: any) => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchOffices(values);
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchOffices();
  };

  // 打开新增/编辑模态框
  const showModal = (office?: Office) => {
    setEditingOffice(office || null);
    setModalVisible(true);
    if (office) {
      officeForm.setFieldsValue({
        ...office,
        amenities: office.amenities?.join(', '),
      });
    } else {
      officeForm.resetFields();
    }
  };

  // 保存办公空间
  const handleSave = async (values: any) => {
    try {
      const submitData = {
        ...values,
        amenities: values.amenities ? values.amenities.split(',').map((item: string) => item.trim()) : [],
      };
      
      if (editingOffice) {
        await officeAPI.updateOffice(editingOffice.id, submitData);
        message.success('更新办公空间成功');
      } else {
        await officeAPI.createOffice(submitData);
        message.success('创建办公空间成功');
      }
      setModalVisible(false);
      fetchOffices();
    } catch (error) {
      message.error(editingOffice ? '更新办公空间失败' : '创建办公空间失败');
    }
  };

  // 删除办公空间
  const handleDelete = async (id: number) => {
    try {
      await officeAPI.deleteOffice(id);
      message.success('删除办公空间成功');
      fetchOffices();
    } catch (error) {
      message.error('删除办公空间失败');
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
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '面积(㎡)',
      dataIndex: 'area',
      key: 'area',
      render: (area: number) => `${area}㎡`,
    },
    {
      title: '容量(人)',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number) => `${capacity}人`,
    },
    {
      title: '月租金',
      dataIndex: 'price_per_month',
      key: 'price_per_month',
      render: (price: number) => `¥${price.toLocaleString()}`,
    },
    {
      title: '楼层',
      dataIndex: 'floor',
      key: 'floor',
      render: (floor: number) => `${floor}楼`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          available: 'green',
          occupied: 'blue',
          maintenance: 'orange',
        };
        const labels = {
          available: '可用',
          occupied: '已出租',
          maintenance: '维护中',
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
      render: (_: any, record: Office) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个办公空间吗？"
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
        <Title level={2}>办公空间管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          新增办公空间
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
              <Form.Item name="name" label="办公空间名称">
                <Input placeholder="请输入办公空间名称" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Form.Item name="floor" label="楼层">
                <InputNumber placeholder="请输入楼层" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" allowClear>
                  <Option value="available">可用</Option>
                  <Option value="occupied">已出租</Option>
                  <Option value="maintenance">维护中</Option>
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

      {/* 办公空间表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={offices}
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
        title={editingOffice ? '编辑办公空间' : '新增办公空间'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={officeForm}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="办公空间名称"
                rules={[{ required: true, message: '请输入办公空间名称' }]}
              >
                <Input placeholder="请输入办公空间名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="floor"
                label="楼层"
                rules={[{ required: true, message: '请输入楼层' }]}
              >
                <InputNumber placeholder="请输入楼层" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="area"
                label="面积(㎡)"
                rules={[{ required: true, message: '请输入面积' }]}
              >
                <InputNumber placeholder="请输入面积" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="capacity"
                label="容量(人)"
                rules={[{ required: true, message: '请输入容量' }]}
              >
                <InputNumber placeholder="请输入容量" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price_per_month"
                label="月租金(元)"
                rules={[{ required: true, message: '请输入月租金' }]}
              >
                <InputNumber placeholder="请输入月租金" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="请输入办公空间描述" />
          </Form.Item>

          <Form.Item
            name="amenities"
            label="设施配套"
            extra="多个设施请用逗号分隔，例如：空调,WiFi,投影仪"
          >
            <Input placeholder="请输入设施配套" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="available">可用</Option>
              <Option value="occupied">已出租</Option>
              <Option value="maintenance">维护中</Option>
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

export default OfficeList;
