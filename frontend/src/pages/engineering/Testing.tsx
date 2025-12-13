import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Progress, Descriptions } from 'antd';
import { EyeOutlined, ExperimentOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface TestingProject {
  id: string;
  projectName: string;
  component: string;
  testType: string;
  status: string;
  progress: number;
  startDate: string;
  expectedDate: string;
  testItems: string[];
  testStandard: string;
  laboratory: string;
  engineer: string;
  cost: number;
}

const Testing: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<TestingProject | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 模拟数据
  const mockData: TestingProject[] = [
    {
      id: '1',
      projectName: 'SiC功率器件可靠性评价',
      component: 'SiC MOSFET',
      testType: '可靠性测试',
      status: '进行中',
      progress: 75,
      startDate: '2024-01-01',
      expectedDate: '2024-04-30',
      testItems: ['温度循环', '功率循环', '高温反偏', '湿热试验'],
      testStandard: 'GJB 548C-2005',
      laboratory: '可靠性实验室',
      engineer: '张测试',
      cost: 120000
    },
    {
      id: '2',
      projectName: 'FPGA辐射效应评估',
      component: 'Xilinx FPGA',
      testType: '辐射测试',
      status: '已完成',
      progress: 100,
      startDate: '2023-11-01',
      expectedDate: '2024-02-28',
      testItems: ['总剂量效应', '单粒子效应', '位移损伤'],
      testStandard: 'GJB 548C-2005',
      laboratory: '辐照实验室',
      engineer: '李测试',
      cost: 180000
    },
    {
      id: '3',
      projectName: '连接器环境适应性测试',
      component: '航空插头',
      testType: '环境测试',
      status: '待开始',
      progress: 0,
      startDate: '2024-02-01',
      expectedDate: '2024-05-31',
      testItems: ['振动试验', '冲击试验', '温湿度试验', '盐雾试验'],
      testStandard: 'GJB 367A-2001',
      laboratory: '环境实验室',
      engineer: '王测试',
      cost: 85000
    }
  ];

  const [data, setData] = useState<TestingProject[]>(mockData);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '进行中': return 'processing';
      case '已完成': return 'success';
      case '待开始': return 'default';
      case '已暂停': return 'warning';
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
      title: '测试器件',
      dataIndex: 'component',
      key: 'component',
      width: 120,
    },
    {
      title: '测试类型',
      dataIndex: 'testType',
      key: 'testType',
      width: 120,
      render: (type: string) => (
        <Tag color="blue">{type}</Tag>
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
      title: '测试工程师',
      dataIndex: 'engineer',
      key: 'engineer',
      width: 120,
    },
    {
      title: '费用（元）',
      dataIndex: 'cost',
      key: 'cost',
      width: 120,
      render: (cost: number) => cost.toLocaleString(),
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
      width: 100,
      render: (_, record: TestingProject) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedProject(record);
            setModalVisible(true);
          }}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card title="检测评价项目管理" extra={
        <Button type="primary" icon={<ExperimentOutlined />}>
          新建测试项目
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

      <Modal
        title="测试项目详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="report" type="primary" icon={<CheckCircleOutlined />}>
            查看报告
          </Button>,
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedProject && (
          <div>
            <Descriptions column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="项目名称" span={2}>
                {selectedProject.projectName}
              </Descriptions.Item>
              <Descriptions.Item label="测试器件">
                {selectedProject.component}
              </Descriptions.Item>
              <Descriptions.Item label="测试类型">
                <Tag color="blue">{selectedProject.testType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="项目状态">
                <Tag color={getStatusColor(selectedProject.status)}>
                  {selectedProject.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="项目进度">
                <Progress percent={selectedProject.progress} />
              </Descriptions.Item>
              <Descriptions.Item label="开始日期">
                {selectedProject.startDate}
              </Descriptions.Item>
              <Descriptions.Item label="预期完成">
                {selectedProject.expectedDate}
              </Descriptions.Item>
              <Descriptions.Item label="测试标准">
                {selectedProject.testStandard}
              </Descriptions.Item>
              <Descriptions.Item label="实验室">
                {selectedProject.laboratory}
              </Descriptions.Item>
              <Descriptions.Item label="测试工程师">
                {selectedProject.engineer}
              </Descriptions.Item>
              <Descriptions.Item label="项目费用">
                {selectedProject.cost.toLocaleString()} 元
              </Descriptions.Item>
            </Descriptions>

            <Card title="测试项目" size="small">
              <Space wrap>
                {selectedProject.testItems.map((item, index) => (
                  <Tag key={index} color="green">{item}</Tag>
                ))}
              </Space>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Testing;
