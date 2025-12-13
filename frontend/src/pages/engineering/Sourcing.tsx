import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, Steps, Progress } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface SourcingProject {
  id: string;
  projectName: string;
  component: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
  progress: number;
  startDate: string;
  expectedDate: string;
  currentSuppliers: string[];
  targetSuppliers: string[];
  manager: string;
  budget: number;
  description: string;
}

const Sourcing: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<SourcingProject | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  const mockData: SourcingProject[] = [
    {
      id: '1',
      projectName: '高可靠性功率器件货源开发',
      component: 'SiC MOSFET',
      priority: 'high',
      status: '进行中',
      progress: 65,
      startDate: '2024-01-01',
      expectedDate: '2024-06-30',
      currentSuppliers: ['Wolfspeed', 'STMicroelectronics'],
      targetSuppliers: ['Rohm', 'Infineon', 'On Semiconductor'],
      manager: '张工',
      budget: 500000,
      description: '为新一代电源系统开发高可靠性SiC功率器件供应链'
    },
    {
      id: '2',
      projectName: '航天级存储器供应商拓展',
      component: 'FRAM存储器',
      priority: 'medium',
      status: '评估中',
      progress: 30,
      startDate: '2024-02-01',
      expectedDate: '2024-08-31',
      currentSuppliers: ['Cypress'],
      targetSuppliers: ['Fujitsu', 'Ramtron', 'TI'],
      manager: '李工',
      budget: 300000,
      description: '扩大航天级FRAM存储器供应商范围，降低供应风险'
    },
    {
      id: '3',
      projectName: '高频连接器国产化替代',
      component: '高频连接器',
      priority: 'high',
      status: '已完成',
      progress: 100,
      startDate: '2023-09-01',
      expectedDate: '2024-03-31',
      currentSuppliers: ['Amphenol', 'TE Connectivity'],
      targetSuppliers: ['华为海思', '中航光电', '航天电器'],
      manager: '王工',
      budget: 800000,
      description: '实现高频连接器的国产化替代，提升供应链安全性'
    }
  ];

  const [data, setData] = useState<SourcingProject[]>(mockData);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '进行中': return 'processing';
      case '评估中': return 'warning';
      case '已完成': return 'success';
      case '已暂停': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true,
    },
    {
      title: '目标器件',
      dataIndex: 'component',
      key: 'component',
      width: 120,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>{getPriorityText(priority)}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: '项目经理',
      dataIndex: 'manager',
      key: 'manager',
      width: 100,
    },
    {
      title: '预算（元）',
      dataIndex: 'budget',
      key: 'budget',
      width: 120,
      render: (budget: number) => budget.toLocaleString(),
    },
    {
      title: '预期完成',
      dataIndex: 'expectedDate',
      key: 'expectedDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: SourcingProject) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedProject(record);
              setDetailModalVisible(true);
            }}
          >
            详情
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedProject(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const handleSubmit = (values: any) => {
    setLoading(true);
    // 模拟提交
    setTimeout(() => {
      if (selectedProject) {
        // 更新
        setData(data.map(item => 
          item.id === selectedProject.id ? { ...item, ...values } : item
        ));
      } else {
        // 新增
        const newProject: SourcingProject = {
          id: Date.now().toString(),
          ...values,
          progress: 0,
          currentSuppliers: [],
          targetSuppliers: values.targetSuppliers || [],
        };
        setData([...data, newProject]);
      }
      setModalVisible(false);
      setSelectedProject(null);
      form.resetFields();
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      <Card title="货源开发项目管理" extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedProject(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          新建项目
        </Button>
      }>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            total: data.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个项目`,
          }}
        />
      </Card>

      {/* 新建/编辑项目模态框 */}
      <Modal
        title={selectedProject ? '编辑项目' : '新建项目'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedProject(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="projectName"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item
            name="component"
            label="目标器件"
            rules={[{ required: true, message: '请输入目标器件' }]}
          >
            <Input placeholder="请输入目标器件" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="priority"
              label="优先级"
              rules={[{ required: true, message: '请选择优先级' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择优先级">
                <Option value="high">高</Option>
                <Option value="medium">中</Option>
                <Option value="low">低</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="项目状态"
              rules={[{ required: true, message: '请选择项目状态' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择项目状态">
                <Option value="进行中">进行中</Option>
                <Option value="评估中">评估中</Option>
                <Option value="已完成">已完成</Option>
                <Option value="已暂停">已暂停</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="manager"
              label="项目经理"
              rules={[{ required: true, message: '请输入项目经理' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入项目经理" />
            </Form.Item>

            <Form.Item
              name="budget"
              label="预算（元）"
              rules={[{ required: true, message: '请输入预算' }]}
              style={{ flex: 1 }}
            >
              <Input type="number" placeholder="请输入预算" />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="startDate"
              label="开始日期"
              rules={[{ required: true, message: '请选择开始日期' }]}
              style={{ flex: 1 }}
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item
              name="expectedDate"
              label="预期完成日期"
              rules={[{ required: true, message: '请选择预期完成日期' }]}
              style={{ flex: 1 }}
            >
              <Input type="date" />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="项目描述"
            rules={[{ required: true, message: '请输入项目描述' }]}
          >
            <TextArea rows={4} placeholder="请输入项目描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 项目详情模态框 */}
      <Modal
        title="项目详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={900}
      >
        {selectedProject && (
          <div>
            <Card title="项目信息" size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><strong>项目名称：</strong>{selectedProject.projectName}</div>
                <div><strong>目标器件：</strong>{selectedProject.component}</div>
                <div>
                  <strong>优先级：</strong>
                  <Tag color={getPriorityColor(selectedProject.priority)}>
                    {getPriorityText(selectedProject.priority)}
                  </Tag>
                </div>
                <div>
                  <strong>状态：</strong>
                  <Tag color={getStatusColor(selectedProject.status)}>
                    {selectedProject.status}
                  </Tag>
                </div>
                <div><strong>项目经理：</strong>{selectedProject.manager}</div>
                <div><strong>预算：</strong>{selectedProject.budget.toLocaleString()} 元</div>
                <div><strong>开始日期：</strong>{selectedProject.startDate}</div>
                <div><strong>预期完成：</strong>{selectedProject.expectedDate}</div>
              </div>
              <div style={{ marginTop: 16 }}>
                <strong>项目进度：</strong>
                <Progress percent={selectedProject.progress} style={{ marginLeft: 16 }} />
              </div>
            </Card>

            <Card title="供应商情况" size="small" style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <strong>当前供应商：</strong>
                <div style={{ marginTop: 8 }}>
                  {selectedProject.currentSuppliers.map((supplier, index) => (
                    <Tag key={index} color="blue">{supplier}</Tag>
                  ))}
                </div>
              </div>
              <div>
                <strong>目标供应商：</strong>
                <div style={{ marginTop: 8 }}>
                  {selectedProject.targetSuppliers.map((supplier, index) => (
                    <Tag key={index} color="green">{supplier}</Tag>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="项目进展" size="small">
              <Steps
                direction="vertical"
                size="small"
                current={selectedProject.progress > 75 ? 3 : selectedProject.progress > 50 ? 2 : selectedProject.progress > 25 ? 1 : 0}
                items={[
                  {
                    title: '需求分析',
                    description: '分析器件需求和技术规格',
                  },
                  {
                    title: '供应商调研',
                    description: '调研潜在供应商和产品方案',
                  },
                  {
                    title: '样品测试',
                    description: '获取样品并进行技术验证',
                  },
                  {
                    title: '供应商认证',
                    description: '完成供应商资质认证和合同签署',
                  },
                ]}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sourcing;
