import React, { useState } from 'react';
import { Card, Table, Button, Input, Select, Space, Tag, Modal, Form, InputNumber, Progress, Descriptions, Alert, Tabs, Row, Col, Statistic } from 'antd';
import { SearchOutlined, ExperimentOutlined, EyeOutlined, PlusOutlined, RadarChartOutlined, FileTextOutlined, WarningOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface RadiationAssessment {
  id: string;
  componentName: string;
  componentType: string;
  manufacturer: string;
  model: string;
  assessmentType: 'TID' | 'SEE' | 'DD' | 'ELDRS';
  radiationLevel: string;
  testStandard: string;
  status: 'planning' | 'testing' | 'completed' | 'failed';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  tidThreshold: number;
  seeThreshold: number;
  ddThreshold: number;
  testResult?: {
    tidResult: number;
    seeResult: number;
    ddResult: number;
    overallRating: 'pass' | 'conditional' | 'fail';
  };
  testDate?: string;
  completionDate?: string;
  engineer: string;
  cost: number;
  notes?: string;
}

const RadiationAssessment: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RadiationAssessment | null>(null);
  const [form] = Form.useForm();

  const mockData: RadiationAssessment[] = [
    {
      id: '1',
      componentName: 'LM358运算放大器',
      componentType: '模拟IC',
      manufacturer: 'Texas Instruments',
      model: 'LM358',
      assessmentType: 'TID',
      radiationLevel: '100 krad(Si)',
      testStandard: 'MIL-STD-883 Method 1019',
      status: 'completed',
      riskLevel: 'low',
      tidThreshold: 100,
      seeThreshold: 0,
      ddThreshold: 0,
      testResult: {
        tidResult: 150,
        seeResult: 0,
        ddResult: 0,
        overallRating: 'pass'
      },
      testDate: '2024-01-10',
      completionDate: '2024-01-25',
      engineer: '张辐照',
      cost: 50000,
      notes: '通过TID测试，可用于航天环境'
    },
    {
      id: '2',
      componentName: 'Xilinx FPGA',
      componentType: '数字IC',
      manufacturer: 'Xilinx',
      model: 'XC7A35T',
      assessmentType: 'SEE',
      radiationLevel: '10^7 ions/cm²',
      testStandard: 'ESCC 25100',
      status: 'testing',
      riskLevel: 'medium',
      tidThreshold: 50,
      seeThreshold: 1e7,
      ddThreshold: 1e13,
      testDate: '2024-01-15',
      engineer: '李测试',
      cost: 120000,
      notes: '正在进行SEE测试'
    },
    {
      id: '3',
      componentName: 'SiC功率MOSFET',
      componentType: '功率器件',
      manufacturer: 'Wolfspeed',
      model: 'C3M0075120K',
      assessmentType: 'TID',
      radiationLevel: '300 krad(Si)',
      testStandard: 'ASTM F1892',
      status: 'planning',
      riskLevel: 'high',
      tidThreshold: 300,
      seeThreshold: 0,
      ddThreshold: 1e14,
      engineer: '王评估',
      cost: 200000,
      notes: '高功率器件，需要特殊测试条件'
    }
  ];

  const columns: ColumnsType<RadiationAssessment> = [
    {
      title: '器件信息',
      key: 'component',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.componentName}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>{record.manufacturer}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>型号: {record.model}</div>
        </div>
      ),
    },
    {
      title: '器件类型',
      dataIndex: 'componentType',
      key: 'componentType',
      width: 100,
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    {
      title: '评估类型',
      dataIndex: 'assessmentType',
      key: 'assessmentType',
      width: 100,
      render: (type: string) => {
        const typeMap = {
          TID: { color: 'green', text: 'TID' },
          SEE: { color: 'orange', text: 'SEE' },
          DD: { color: 'purple', text: 'DD' },
          ELDRS: { color: 'red', text: 'ELDRS' }
        };
        const config = typeMap[type as keyof typeof typeMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '辐射水平',
      dataIndex: 'radiationLevel',
      key: 'radiationLevel',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          planning: { color: 'default', text: '规划中' },
          testing: { color: 'processing', text: '测试中' },
          completed: { color: 'success', text: '已完成' },
          failed: { color: 'error', text: '测试失败' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 100,
      render: (risk: string) => {
        const riskMap = {
          low: { color: 'green', text: '低风险' },
          medium: { color: 'orange', text: '中风险' },
          high: { color: 'red', text: '高风险' },
          critical: { color: 'red', text: '严重' }
        };
        const config = riskMap[risk as keyof typeof riskMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '测试结果',
      key: 'result',
      width: 120,
      render: (_, record) => {
        if (!record.testResult) {
          return <span style={{ color: '#999' }}>待测试</span>;
        }
        const { overallRating } = record.testResult;
        const ratingMap = {
          pass: { color: 'green', text: '通过' },
          conditional: { color: 'orange', text: '有条件通过' },
          fail: { color: 'red', text: '失败' }
        };
        const config = ratingMap[overallRating];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '负责工程师',
      dataIndex: 'engineer',
      key: 'engineer',
      width: 120,
    },
    {
      title: '预算(元)',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (cost: number) => cost.toLocaleString(),
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
              setSelectedRecord(record);
              setDetailModalVisible(true);
            }}
          >
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
    console.log('新建辐照评估:', values);
    setModalVisible(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总评估项目"
              value={mockData.length}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={mockData.filter(item => item.status === 'testing').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<RadarChartOutlined />}
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
              title="高风险项目"
              value={mockData.filter(item => item.riskLevel === 'high' || item.riskLevel === 'critical').length}
              valueStyle={{ color: '#cf1322' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="辐照评估管理" extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          新建评估项目
        </Button>
      }>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索器件名称或型号"
            onSearch={(value) => console.log('搜索:', value)}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          <Select placeholder="评估类型" style={{ width: 120 }}>
            <Option value="TID">TID</Option>
            <Option value="SEE">SEE</Option>
            <Option value="DD">DD</Option>
            <Option value="ELDRS">ELDRS</Option>
          </Select>
          <Select placeholder="状态" style={{ width: 120 }}>
            <Option value="planning">规划中</Option>
            <Option value="testing">测试中</Option>
            <Option value="completed">已完成</Option>
          </Select>
          <Select placeholder="风险等级" style={{ width: 120 }}>
            <Option value="low">低风险</Option>
            <Option value="medium">中风险</Option>
            <Option value="high">高风险</Option>
          </Select>
        </Space>

        <Alert
          message="辐照评估提醒"
          description="当前有 1 个高风险器件正在规划评估，建议优先安排测试。"
          type="warning"
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

      {/* 新建评估项目模态框 */}
      <Modal
        title="新建辐照评估项目"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="componentName" label="器件名称" rules={[{ required: true }]}>
            <Input placeholder="请输入器件名称" />
          </Form.Item>
          
          <Form.Item name="manufacturer" label="制造商" rules={[{ required: true }]}>
            <Input placeholder="请输入制造商" />
          </Form.Item>

          <Form.Item name="model" label="器件型号" rules={[{ required: true }]}>
            <Input placeholder="请输入器件型号" />
          </Form.Item>

          <Form.Item name="componentType" label="器件类型" rules={[{ required: true }]}>
            <Select placeholder="选择器件类型">
              <Option value="模拟IC">模拟IC</Option>
              <Option value="数字IC">数字IC</Option>
              <Option value="功率器件">功率器件</Option>
              <Option value="存储器">存储器</Option>
              <Option value="传感器">传感器</Option>
            </Select>
          </Form.Item>

          <Form.Item name="assessmentType" label="评估类型" rules={[{ required: true }]}>
            <Select placeholder="选择评估类型">
              <Option value="TID">总剂量效应(TID)</Option>
              <Option value="SEE">单粒子效应(SEE)</Option>
              <Option value="DD">位移损伤(DD)</Option>
              <Option value="ELDRS">增强型低剂量率敏感性(ELDRS)</Option>
            </Select>
          </Form.Item>

          <Form.Item name="radiationLevel" label="辐射水平" rules={[{ required: true }]}>
            <Input placeholder="如：100 krad(Si)" />
          </Form.Item>

          <Form.Item name="testStandard" label="测试标准" rules={[{ required: true }]}>
            <Select placeholder="选择测试标准">
              <Option value="MIL-STD-883 Method 1019">MIL-STD-883 Method 1019</Option>
              <Option value="ESCC 25100">ESCC 25100</Option>
              <Option value="ASTM F1892">ASTM F1892</Option>
              <Option value="IEC 62396">IEC 62396</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="tidThreshold" label="TID阈值(krad)">
                <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="seeThreshold" label="SEE阈值(ions/cm²)">
                <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="ddThreshold" label="DD阈值(neutrons/cm²)">
                <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="engineer" label="负责工程师" rules={[{ required: true }]}>
            <Input placeholder="请输入负责工程师" />
          </Form.Item>

          <Form.Item name="cost" label="预算(元)" rules={[{ required: true }]}>
            <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="评估项目备注" />
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
        title="辐照评估详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="器件名称" span={2}>
                  {selectedRecord.componentName}
                </Descriptions.Item>
                <Descriptions.Item label="制造商">
                  {selectedRecord.manufacturer}
                </Descriptions.Item>
                <Descriptions.Item label="器件型号">
                  {selectedRecord.model}
                </Descriptions.Item>
                <Descriptions.Item label="器件类型">
                  <Tag color="blue">{selectedRecord.componentType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="评估类型">
                  <Tag color="green">{selectedRecord.assessmentType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="辐射水平">
                  {selectedRecord.radiationLevel}
                </Descriptions.Item>
                <Descriptions.Item label="测试标准">
                  {selectedRecord.testStandard}
                </Descriptions.Item>
                <Descriptions.Item label="当前状态">
                  <Tag color="success">已完成</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="风险等级">
                  <Tag color="green">低风险</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="负责工程师">
                  {selectedRecord.engineer}
                </Descriptions.Item>
                <Descriptions.Item label="项目预算">
                  {selectedRecord.cost.toLocaleString()} 元
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="测试结果" key="results">
              {selectedRecord.testResult ? (
                <div>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="TID测试结果"
                          value={selectedRecord.testResult.tidResult}
                          suffix="krad"
                          valueStyle={{ color: '#3f8600' }}
                        />
                        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                          阈值: {selectedRecord.tidThreshold} krad
                        </div>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="SEE测试结果"
                          value={selectedRecord.testResult.seeResult}
                          suffix="ions/cm²"
                        />
                        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                          阈值: {selectedRecord.seeThreshold} ions/cm²
                        </div>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="DD测试结果"
                          value={selectedRecord.testResult.ddResult}
                          suffix="neutrons/cm²"
                        />
                        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                          阈值: {selectedRecord.ddThreshold} neutrons/cm²
                        </div>
                      </Card>
                    </Col>
                  </Row>
                  
                  <Alert
                    message="测试结论"
                    description={`器件在指定辐射水平下表现良好，${selectedRecord.testResult.overallRating === 'pass' ? '通过' : '未通过'}辐照评估要求。`}
                    type={selectedRecord.testResult.overallRating === 'pass' ? 'success' : 'warning'}
                    showIcon
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <ExperimentOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                  <p style={{ marginTop: '16px', color: '#999' }}>测试尚未开始</p>
                </div>
              )}
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default RadiationAssessment;
