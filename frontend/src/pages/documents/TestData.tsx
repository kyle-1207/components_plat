import React, { useState } from 'react';
import { Card, Table, Button, Input, Select, Space, Tag, Modal, Row, Col, Statistic, Progress, Descriptions, Tabs } from 'antd';
import { SearchOutlined, EyeOutlined, DownloadOutlined, FileTextOutlined, ExperimentOutlined, BarChartOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface TestDataRecord {
  id: string;
  testName: string;
  componentName: string;
  componentType: string;
  testType: 'reliability' | 'radiation' | 'environmental' | 'electrical' | 'mechanical';
  testStandard: string;
  testDate: string;
  laboratory: string;
  engineer: string;
  status: 'completed' | 'processing' | 'reviewing';
  dataSize: string;
  fileFormat: string;
  testResult: 'pass' | 'fail' | 'conditional';
  parameters: {
    temperature: string;
    humidity: string;
    voltage: string;
    current: string;
    duration: string;
  };
  summary: string;
}

const TestData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TestDataRecord | null>(null);

  const mockData: TestDataRecord[] = [
    {
      id: '1',
      testName: 'LM358运放可靠性测试',
      componentName: 'LM358',
      componentType: '运算放大器',
      testType: 'reliability',
      testStandard: 'GJB 548C-2005',
      testDate: '2024-01-15',
      laboratory: '可靠性实验室',
      engineer: '张测试',
      status: 'completed',
      dataSize: '25.6MB',
      fileFormat: 'CSV, PDF',
      testResult: 'pass',
      parameters: {
        temperature: '-55°C ~ +125°C',
        humidity: '85% RH',
        voltage: '±15V',
        current: '10mA',
        duration: '1000h'
      },
      summary: '器件在各种环境条件下表现稳定，满足航天级可靠性要求'
    },
    {
      id: '2',
      testName: 'SiC MOSFET辐照测试',
      componentName: 'C3M0075120K',
      componentType: 'SiC功率器件',
      testType: 'radiation',
      testStandard: 'MIL-STD-883 Method 1019',
      testDate: '2024-01-20',
      laboratory: '辐照实验室',
      engineer: '李辐照',
      status: 'completed',
      dataSize: '18.3MB',
      fileFormat: 'XLSX, PDF',
      testResult: 'pass',
      parameters: {
        temperature: '25°C',
        humidity: '常规',
        voltage: '1200V',
        current: '75A',
        duration: '72h'
      },
      summary: 'TID测试通过，器件在100krad剂量下性能保持稳定'
    },
    {
      id: '3',
      testName: 'FPGA环境适应性测试',
      componentName: 'XC7A35T',
      componentType: 'FPGA',
      testType: 'environmental',
      testStandard: 'GJB 367A-2001',
      testDate: '2024-01-25',
      laboratory: '环境实验室',
      engineer: '王环境',
      status: 'processing',
      dataSize: '32.1MB',
      fileFormat: 'CSV, PDF',
      testResult: 'conditional',
      parameters: {
        temperature: '-40°C ~ +85°C',
        humidity: '95% RH',
        voltage: '1.0V',
        current: '2A',
        duration: '168h'
      },
      summary: '温度循环测试中发现轻微性能波动，需进一步分析'
    },
    {
      id: '4',
      testName: '航空插头机械性能测试',
      componentName: 'D38999/26WH35PN',
      componentType: '航空插头',
      testType: 'mechanical',
      testStandard: 'GJB 101A-97',
      testDate: '2024-02-01',
      laboratory: '机械测试实验室',
      engineer: '赵机械',
      status: 'completed',
      dataSize: '15.7MB',
      fileFormat: 'CSV, PDF',
      testResult: 'pass',
      parameters: {
        temperature: '常温',
        humidity: '常规',
        voltage: '600V',
        current: '10A',
        duration: '500次'
      },
      summary: '插拔寿命测试通过，接触电阻稳定，满足使用要求'
    }
  ];

  const columns: ColumnsType<TestDataRecord> = [
    {
      title: '测试信息',
      key: 'testInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.testName}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>器件: {record.componentName}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>日期: {record.testDate}</div>
        </div>
      ),
    },
    {
      title: '器件类型',
      dataIndex: 'componentType',
      key: 'componentType',
      width: 120,
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    {
      title: '测试类型',
      dataIndex: 'testType',
      key: 'testType',
      width: 120,
      render: (type: string) => {
        const typeMap = {
          reliability: { color: 'green', text: '可靠性' },
          radiation: { color: 'orange', text: '辐照' },
          environmental: { color: 'purple', text: '环境' },
          electrical: { color: 'blue', text: '电性能' },
          mechanical: { color: 'red', text: '机械' }
        };
        const config = typeMap[type as keyof typeof typeMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '测试标准',
      dataIndex: 'testStandard',
      key: 'testStandard',
      width: 150,
    },
    {
      title: '实验室',
      dataIndex: 'laboratory',
      key: 'laboratory',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          completed: { color: 'success', text: '已完成' },
          processing: { color: 'processing', text: '处理中' },
          reviewing: { color: 'warning', text: '审核中' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '测试结果',
      dataIndex: 'testResult',
      key: 'testResult',
      width: 100,
      render: (result: string) => {
        const resultMap = {
          pass: { color: 'success', text: '通过' },
          fail: { color: 'error', text: '失败' },
          conditional: { color: 'warning', text: '有条件通过' }
        };
        const config = resultMap[result as keyof typeof resultMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '数据大小',
      dataIndex: 'dataSize',
      key: 'dataSize',
      width: 100,
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
          <Button type="link" size="small" icon={<DownloadOutlined />}>
            下载
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="测试数据总数"
              value={mockData.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成测试"
              value={mockData.filter(item => item.status === 'completed').length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="通过率"
              value={75}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="数据总量"
              value={91.7}
              suffix="MB"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="测试数据管理">
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索测试名称或器件名称"
            onSearch={(value) => console.log('搜索:', value)}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          <Select placeholder="测试类型" style={{ width: 120 }}>
            <Option value="reliability">可靠性</Option>
            <Option value="radiation">辐照</Option>
            <Option value="environmental">环境</Option>
            <Option value="electrical">电性能</Option>
            <Option value="mechanical">机械</Option>
          </Select>
          <Select placeholder="测试结果" style={{ width: 120 }}>
            <Option value="pass">通过</Option>
            <Option value="fail">失败</Option>
            <Option value="conditional">有条件通过</Option>
          </Select>
          <Select placeholder="状态" style={{ width: 120 }}>
            <Option value="completed">已完成</Option>
            <Option value="processing">处理中</Option>
            <Option value="reviewing">审核中</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={mockData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: 1,
            pageSize: 10,
            total: 100,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 详情查看模态框 */}
      <Modal
        title="测试数据详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            下载数据
          </Button>,
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
                <Descriptions.Item label="测试名称" span={2}>
                  {selectedRecord.testName}
                </Descriptions.Item>
                <Descriptions.Item label="器件名称">
                  {selectedRecord.componentName}
                </Descriptions.Item>
                <Descriptions.Item label="器件类型">
                  <Tag color="blue">{selectedRecord.componentType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="测试类型">
                  <Tag color="green">可靠性测试</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="测试标准">
                  {selectedRecord.testStandard}
                </Descriptions.Item>
                <Descriptions.Item label="测试日期">
                  {selectedRecord.testDate}
                </Descriptions.Item>
                <Descriptions.Item label="测试实验室">
                  {selectedRecord.laboratory}
                </Descriptions.Item>
                <Descriptions.Item label="负责工程师">
                  {selectedRecord.engineer}
                </Descriptions.Item>
                <Descriptions.Item label="测试状态">
                  <Tag color="success">已完成</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="测试结果">
                  <Tag color="success">通过</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="数据大小">
                  {selectedRecord.dataSize}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="测试参数" key="parameters">
              <Card title="测试条件" size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <p><strong>温度范围：</strong>{selectedRecord.parameters.temperature}</p>
                    <p><strong>湿度条件：</strong>{selectedRecord.parameters.humidity}</p>
                    <p><strong>测试电压：</strong>{selectedRecord.parameters.voltage}</p>
                  </Col>
                  <Col span={12}>
                    <p><strong>测试电流：</strong>{selectedRecord.parameters.current}</p>
                    <p><strong>测试时长：</strong>{selectedRecord.parameters.duration}</p>
                  </Col>
                </Row>
              </Card>

              <Card title="数据文件" size="small" style={{ marginTop: 16 }}>
                <p><strong>文件格式：</strong>{selectedRecord.fileFormat}</p>
                <p><strong>数据大小：</strong>{selectedRecord.dataSize}</p>
                <div style={{ marginTop: 16 }}>
                  <Space>
                    <Button icon={<DownloadOutlined />}>原始数据.csv</Button>
                    <Button icon={<FileTextOutlined />}>测试报告.pdf</Button>
                  </Space>
                </div>
              </Card>
            </TabPane>

            <TabPane tab="测试结果" key="results">
              <Card title="测试结论" size="small">
                <div style={{ marginBottom: 16 }}>
                  <h4>总体评价</h4>
                  <Progress 
                    percent={95} 
                    status="success"
                    format={(percent) => `${percent}% 通过`}
                  />
                </div>
                <p><strong>结果摘要：</strong></p>
                <p>{selectedRecord.summary}</p>
              </Card>

              <Card title="数据图表" size="small" style={{ marginTop: 16 }}>
                <div style={{ 
                  height: 200, 
                  backgroundColor: '#f5f5f5', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px dashed #d9d9d9'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <BarChartOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                    <p style={{ marginTop: 16, color: '#999' }}>测试数据图表预览</p>
                  </div>
                </div>
              </Card>

              <Card title="关键指标" size="small" style={{ marginTop: 16 }}>
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="可靠性"
                      value={98.5}
                      suffix="%"
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="稳定性"
                      value={96.2}
                      suffix="%"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="一致性"
                      value={94.8}
                      suffix="%"
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="MTBF"
                      value={10000}
                      suffix="h"
                      valueStyle={{ color: '#f5222d' }}
                    />
                  </Col>
                </Row>
              </Card>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default TestData;
