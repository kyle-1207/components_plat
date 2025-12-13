import React, { useState } from 'react';
import { Card, Table, Button, Input, Select, Space, Tag, Modal, Form, DatePicker, InputNumber } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;

interface RadiationTest {
  id: string;
  sampleName: string;
  testType: string;
  radiationType: string;
  dose: string;
  status: 'pending' | 'testing' | 'completed' | 'failed';
  startDate: string;
  endDate?: string;
  result?: string;
  tester: string;
}

const RadiationTesting: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const mockData: RadiationTest[] = [
    {
      id: '1',
      sampleName: 'LM358运放样品',
      testType: 'TID测试',
      radiationType: 'γ射线',
      dose: '100 krad',
      status: 'completed',
      startDate: '2024-01-10',
      endDate: '2024-01-15',
      result: '通过',
      tester: '辐照实验室'
    },
    {
      id: '2',
      sampleName: '74HC00逻辑门',
      testType: 'SEE测试',
      radiationType: '重离子',
      dose: '10^7 ions/cm²',
      status: 'testing',
      startDate: '2024-01-12',
      tester: '辐照实验室'
    }
  ];

  const columns: ColumnsType<RadiationTest> = [
    {
      title: '样品名称',
      dataIndex: 'sampleName',
      key: 'sampleName',
      width: 150,
    },
    {
      title: '测试类型',
      dataIndex: 'testType',
      key: 'testType',
      width: 120,
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    {
      title: '辐射类型',
      dataIndex: 'radiationType',
      key: 'radiationType',
      width: 100,
    },
    {
      title: '剂量/注量',
      dataIndex: 'dose',
      key: 'dose',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          pending: { color: 'default', text: '待测试' },
          testing: { color: 'processing', text: '测试中' },
          completed: { color: 'success', text: '已完成' },
          failed: { color: 'error', text: '测试失败' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date: string) => date || '-'
    },
    {
      title: '测试结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result: string) => result || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>
            详情
          </Button>
          <Button type="link" size="small" icon={<FileTextOutlined />}>
            报告
          </Button>
        </Space>
      ),
    },
  ];

  const handleSubmit = (values: any) => {
    console.log('新建测试:', values);
    setModalVisible(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="辐照试验管理">
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索样品名称"
            onSearch={(value) => console.log('搜索:', value)}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          <Select placeholder="测试类型" style={{ width: 150 }}>
            <Option value="TID">TID测试</Option>
            <Option value="SEE">SEE测试</Option>
            <Option value="ELDRS">ELDRS测试</Option>
          </Select>
          <Select placeholder="状态" style={{ width: 120 }}>
            <Option value="pending">待测试</Option>
            <Option value="testing">测试中</Option>
            <Option value="completed">已完成</Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            新建测试
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={mockData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: 1,
            pageSize: 10,
            total: 50,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title="新建辐照测试"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="sampleName" label="样品名称" rules={[{ required: true }]}>
            <Input placeholder="请输入样品名称" />
          </Form.Item>
          
          <Form.Item name="testType" label="测试类型" rules={[{ required: true }]}>
            <Select placeholder="选择测试类型">
              <Option value="TID">TID测试</Option>
              <Option value="SEE">SEE测试</Option>
              <Option value="ELDRS">ELDRS测试</Option>
            </Select>
          </Form.Item>

          <Form.Item name="radiationType" label="辐射类型" rules={[{ required: true }]}>
            <Select placeholder="选择辐射类型">
              <Option value="gamma">γ射线</Option>
              <Option value="electron">电子束</Option>
              <Option value="proton">质子</Option>
              <Option value="heavy_ion">重离子</Option>
            </Select>
          </Form.Item>

          <Form.Item name="dose" label="剂量/注量" rules={[{ required: true }]}>
            <Input placeholder="如：100 krad" />
          </Form.Item>

          <Form.Item name="startDate" label="预计开始日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="测试要求或注意事项" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                创建测试
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

export default RadiationTesting;
