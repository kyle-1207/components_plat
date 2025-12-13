import React, { useState } from 'react';
import { Card, Table, Button, Input, Select, Space, Tag, Modal, Form, Progress, Row, Col, Statistic, Tabs, Alert, Upload, message } from 'antd';
import { SearchOutlined, ExperimentOutlined, EyeOutlined, PlusOutlined, PlayCircleOutlined, FileTextOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface SimulationProject {
  id: string;
  projectName: string;
  simulationType: 'circuit' | 'thermal' | 'mechanical' | 'electromagnetic';
  components: string[];
  applicationArea: string;
  status: 'designing' | 'simulating' | 'completed' | 'failed';
  progress: number;
  startDate: string;
  expectedDate: string;
  completionDate?: string;
  engineer: string;
  simulationTool: string;
  accuracy: number;
  iterationCount: number;
  results?: {
    efficiency: number;
    reliability: number;
    performance: number;
    overallRating: 'excellent' | 'good' | 'fair' | 'poor';
  };
  cost: number;
  notes?: string;
}

const DesignSimulation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<SimulationProject | null>(null);
  const [form] = Form.useForm();

  const mockData: SimulationProject[] = [
    {
      id: '1',
      projectName: 'SiC功率模块热仿真设计',
      simulationType: 'thermal',
      components: ['SiC MOSFET', '散热器', '导热垫'],
      applicationArea: '电源管理',
      status: 'completed',
      progress: 100,
      startDate: '2024-01-01',
      expectedDate: '2024-02-15',
      completionDate: '2024-02-12',
      engineer: '张仿真',
      simulationTool: 'ANSYS Icepak',
      accuracy: 95.8,
      iterationCount: 15,
      results: {
        efficiency: 96.5,
        reliability: 98.2,
        performance: 94.8,
        overallRating: 'excellent'
      },
      cost: 80000,
      notes: '热仿真结果优异，满足航天应用要求'
    },
    {
      id: '2',
      projectName: 'FPGA高速电路仿真',
      simulationType: 'circuit',
      components: ['Xilinx FPGA', 'DDR4内存', '时钟芯片'],
      applicationArea: '数据处理',
      status: 'simulating',
      progress: 65,
      startDate: '2024-01-10',
      expectedDate: '2024-03-20',
      engineer: '李设计',
      simulationTool: 'Cadence Allegro',
      accuracy: 92.3,
      iterationCount: 8,
      cost: 120000,
      notes: '正在进行信号完整性仿真'
    },
    {
      id: '3',
      projectName: '航天连接器振动仿真',
      simulationType: 'mechanical',
      components: ['航空插头', '连接线缆', '固定支架'],
      applicationArea: '结构设计',
      status: 'designing',
      progress: 30,
      startDate: '2024-01-15',
      expectedDate: '2024-04-30',
      engineer: '王力学',
      simulationTool: 'ANSYS Mechanical',
      accuracy: 0,
      iterationCount: 0,
      cost: 150000,
      notes: '正在建立3D模型'
    }
  ];

  const columns: ColumnsType<SimulationProject> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '仿真类型',
      dataIndex: 'simulationType',
      key: 'simulationType',
      width: 120,
      render: (type: string) => {
        const typeMap = {
          circuit: { color: 'blue', text: '电路仿真' },
          thermal: { color: 'red', text: '热仿真' },
          mechanical: { color: 'green', text: '力学仿真' },
          electromagnetic: { color: 'purple', text: '电磁仿真' }
        };
        const config = typeMap[type as keyof typeof typeMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '应用领域',
      dataIndex: 'applicationArea',
      key: 'applicationArea',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          designing: { color: 'default', text: '设计中' },
          simulating: { color: 'processing', text: '仿真中' },
          completed: { color: 'success', text: '已完成' },
          failed: { color: 'error', text: '仿真失败' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
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
      title: '仿真工具',
      dataIndex: 'simulationTool',
      key: 'simulationTool',
      width: 150,
    },
    {
      title: '精度',
      dataIndex: 'accuracy',
      key: 'accuracy',
      width: 100,
      render: (accuracy: number) => accuracy > 0 ? `${accuracy}%` : '-'
    },
    {
      title: '负责工程师',
      dataIndex: 'engineer',
      key: 'engineer',
      width: 120,
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
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedProject(record);
              setDetailModalVisible(true);
            }}
          >
            详情
          </Button>
          {record.status === 'designing' && (
            <Button type="link" size="small" icon={<PlayCircleOutlined />}>
              启动
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleSubmit = (values: any) => {
    console.log('新建仿真项目:', values);
    setModalVisible(false);
    form.resetFields();
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    onChange(info: any) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总仿真项目"
              value={mockData.length}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={mockData.filter(item => item.status === 'simulating' || item.status === 'designing').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={mockData.filter(item => item.status === 'completed').length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均精度"
              value={94.2}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="应用设计仿真管理" extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          新建仿真项目
        </Button>
      }>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索项目名称"
            onSearch={(value) => console.log('搜索:', value)}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          <Select placeholder="仿真类型" style={{ width: 150 }}>
            <Option value="circuit">电路仿真</Option>
            <Option value="thermal">热仿真</Option>
            <Option value="mechanical">力学仿真</Option>
            <Option value="electromagnetic">电磁仿真</Option>
          </Select>
          <Select placeholder="状态" style={{ width: 120 }}>
            <Option value="designing">设计中</Option>
            <Option value="simulating">仿真中</Option>
            <Option value="completed">已完成</Option>
          </Select>
          <Select placeholder="应用领域" style={{ width: 150 }}>
            <Option value="电源管理">电源管理</Option>
            <Option value="数据处理">数据处理</Option>
            <Option value="结构设计">结构设计</Option>
            <Option value="通信系统">通信系统</Option>
          </Select>
        </Space>

        <Alert
          message="仿真资源提醒"
          description="当前仿真服务器负载较高，新项目可能需要排队等待。建议合理安排仿真计划。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

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

      {/* 新建仿真项目模态框 */}
      <Modal
        title="新建应用设计仿真项目"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="projectName" label="项目名称" rules={[{ required: true }]}>
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="simulationType" label="仿真类型" rules={[{ required: true }]}>
                <Select placeholder="选择仿真类型">
                  <Option value="circuit">电路仿真</Option>
                  <Option value="thermal">热仿真</Option>
                  <Option value="mechanical">力学仿真</Option>
                  <Option value="electromagnetic">电磁仿真</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="applicationArea" label="应用领域" rules={[{ required: true }]}>
                <Select placeholder="选择应用领域">
                  <Option value="电源管理">电源管理</Option>
                  <Option value="数据处理">数据处理</Option>
                  <Option value="结构设计">结构设计</Option>
                  <Option value="通信系统">通信系统</Option>
                  <Option value="导航控制">导航控制</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="components" label="涉及器件" rules={[{ required: true }]}>
            <Select mode="tags" placeholder="请输入或选择器件">
              <Option value="SiC MOSFET">SiC MOSFET</Option>
              <Option value="FPGA">FPGA</Option>
              <Option value="DDR4内存">DDR4内存</Option>
              <Option value="航空插头">航空插头</Option>
              <Option value="散热器">散热器</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="simulationTool" label="仿真工具" rules={[{ required: true }]}>
                <Select placeholder="选择仿真工具">
                  <Option value="ANSYS Icepak">ANSYS Icepak</Option>
                  <Option value="ANSYS Mechanical">ANSYS Mechanical</Option>
                  <Option value="Cadence Allegro">Cadence Allegro</Option>
                  <Option value="HFSS">HFSS</Option>
                  <Option value="COMSOL">COMSOL</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="engineer" label="负责工程师" rules={[{ required: true }]}>
                <Input placeholder="请输入负责工程师" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="expectedDate" label="预期完成日期" rules={[{ required: true }]}>
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item name="designFiles" label="设计文件">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传设计文件</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="notes" label="项目描述">
            <Input.TextArea rows={3} placeholder="仿真项目描述和要求" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<ExperimentOutlined />}>
                创建项目
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情查看模态框 */}
      <Modal
        title="仿真项目详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="report" type="primary" icon={<FileTextOutlined />}>
            查看报告
          </Button>,
          <Button key="download" icon={<DownloadOutlined />}>
            下载结果
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        {selectedProject && (
          <Tabs defaultActiveKey="basic">
            <TabPane tab="项目信息" key="basic">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="基本信息" size="small">
                    <p><strong>项目名称：</strong>{selectedProject.projectName}</p>
                    <p><strong>仿真类型：</strong>
                      <Tag color="red">热仿真</Tag>
                    </p>
                    <p><strong>应用领域：</strong>{selectedProject.applicationArea}</p>
                    <p><strong>仿真工具：</strong>{selectedProject.simulationTool}</p>
                    <p><strong>负责工程师：</strong>{selectedProject.engineer}</p>
                    <p><strong>项目状态：</strong>
                      <Tag color="success">已完成</Tag>
                    </p>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="进度信息" size="small">
                    <p><strong>开始日期：</strong>{selectedProject.startDate}</p>
                    <p><strong>预期完成：</strong>{selectedProject.expectedDate}</p>
                    <p><strong>实际完成：</strong>{selectedProject.completionDate || '-'}</p>
                    <p><strong>项目进度：</strong></p>
                    <Progress percent={selectedProject.progress} />
                    <p><strong>迭代次数：</strong>{selectedProject.iterationCount}</p>
                    <p><strong>仿真精度：</strong>{selectedProject.accuracy}%</p>
                  </Card>
                </Col>
              </Row>

              <Card title="涉及器件" size="small" style={{ marginTop: 16 }}>
                <Space wrap>
                  {selectedProject.components.map((component, index) => (
                    <Tag key={index} color="blue">{component}</Tag>
                  ))}
                </Space>
              </Card>
            </TabPane>

            <TabPane tab="仿真结果" key="results">
              {selectedProject.results ? (
                <div>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="效率"
                          value={selectedProject.results.efficiency}
                          suffix="%"
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="可靠性"
                          value={selectedProject.results.reliability}
                          suffix="%"
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="性能"
                          value={selectedProject.results.performance}
                          suffix="%"
                          valueStyle={{ color: '#722ed1' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="综合评级"
                          value={selectedProject.results.overallRating === 'excellent' ? '优秀' : '良好'}
                          valueStyle={{ color: '#f5222d' }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  <Card title="仿真结论" size="small">
                    <Alert
                      message="仿真结果分析"
                      description="热仿真结果显示，在最大功率工作条件下，器件温度控制在安全范围内，散热设计合理，满足航天应用的高可靠性要求。建议在实际应用中采用此设计方案。"
                      type="success"
                      showIcon
                    />
                  </Card>

                  <Card title="仿真图表" size="small" style={{ marginTop: 16 }}>
                    <div style={{ 
                      height: 200, 
                      backgroundColor: '#f5f5f5', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px dashed #d9d9d9'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                        <p style={{ marginTop: 16, color: '#999' }}>仿真结果图表预览</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <ExperimentOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                  <p style={{ marginTop: '16px', color: '#999' }}>仿真尚未开始</p>
                </div>
              )}
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default DesignSimulation;
