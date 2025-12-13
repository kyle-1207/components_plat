import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Row,
  Col,
  Modal,
  Descriptions,
  Typography,
  Tabs,
  Tree,
  Timeline,
} from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  DownloadOutlined,
  HistoryOutlined,
  BookOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { Text, Title } = Typography;
// TabPane 已废弃，使用 items 属性

// 标准数据类型定义
interface Standard {
  id: string;
  standardCode: string;
  standardType: string;
  title: string;
  version: string;
  status: string;
  publishDate: string;
  effectiveDate: string;
  organization: string;
  scope: string;
  description: string;
  relatedStandards: string[];
  replacedBy?: string;
  historyVersions: Array<{
    version: string;
    date: string;
    changes: string;
  }>;
  downloadUrl?: string;
  viewCount: number;
}

const StandardQuery: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  const mockStandards: Standard[] = [
    {
      id: '1',
      standardCode: 'MIL-STD-883K',
      standardType: 'MIL',
      title: '微电子器件试验方法和程序',
      version: 'K',
      status: '现行',
      publishDate: '2019-06-28',
      effectiveDate: '2019-09-28',
      organization: 'US Department of Defense',
      scope: '微电子器件',
      description: '本标准规定了微电子器件的试验方法和程序，包括环境试验、电性能试验、机械试验等。',
      relatedStandards: ['MIL-STD-750', 'MIL-STD-202'],
      historyVersions: [
        { version: 'J', date: '2014-05-02', changes: '更新试验方法，增加新的测试程序' },
        { version: 'K', date: '2019-06-28', changes: '修订环境试验条件，更新质量保证要求' },
      ],
      downloadUrl: '/standards/MIL-STD-883K.pdf',
      viewCount: 15420,
    },
    {
      id: '2',
      standardCode: 'ESCC-9000',
      standardType: 'ESCC',
      title: '欧洲航天元器件协调标准',
      version: '2020',
      status: '现行',
      publishDate: '2020-03-15',
      effectiveDate: '2020-06-15',
      organization: 'European Space Agency',
      scope: '航天元器件',
      description: '欧洲航天局制定的航天用电子元器件质量保证和可靠性标准。',
      relatedStandards: ['ESCC-2000', 'ESCC-3000'],
      historyVersions: [
        { version: '2018', date: '2018-01-10', changes: '初版发布' },
        { version: '2020', date: '2020-03-15', changes: '增加新器件类型，更新试验要求' },
      ],
      downloadUrl: '/standards/ESCC-9000-2020.pdf',
      viewCount: 8760,
    },
    {
      id: '3',
      standardCode: 'GJB-548C',
      standardType: 'GJB',
      title: '微电子器件试验方法和程序',
      version: 'C',
      status: '现行',
      publishDate: '2018-12-01',
      effectiveDate: '2019-06-01',
      organization: '国防科工局',
      scope: '微电子器件',
      description: '国军标微电子器件试验方法和程序，参考MIL-STD-883标准制定。',
      relatedStandards: ['GJB-128A', 'GJB-360B'],
      historyVersions: [
        { version: 'A', date: '1996-03-01', changes: '初版发布' },
        { version: 'B', date: '2005-08-15', changes: '增加新的试验方法' },
        { version: 'C', date: '2018-12-01', changes: '全面修订，与国际标准接轨' },
      ],
      downloadUrl: '/standards/GJB-548C.pdf',
      viewCount: 12340,
    },
  ];

  const handleSearch = async () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setStandards(mockStandards);
      setLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    form.resetFields();
    setStandards([]);
  };

  const showDetail = (standard: Standard) => {
    setSelectedStandard(standard);
    setDetailModalVisible(true);
  };

  const handleDownload = (standard: Standard) => {
    // 模拟下载
    console.log('下载标准:', standard.standardCode);
  };

  const columns = [
    {
      title: '标准编号',
      dataIndex: 'standardCode',
      key: 'standardCode',
      width: 150,
      render: (text: string, record: Standard) => (
        <Button type="link" onClick={() => showDetail(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: '标准类型',
      dataIndex: 'standardType',
      key: 'standardType',
      width: 100,
      render: (type: string) => {
        const colorMap: { [key: string]: string } = {
          'MIL': 'red',
          'ESCC': 'blue',
          'ISO': 'green',
          'IEC': 'orange',
          'GJB': 'purple',
          'GB': 'cyan',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      ellipsis: true,
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const color = status === '现行' ? 'green' : status === '废止' ? 'red' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: '发布日期',
      dataIndex: 'publishDate',
      key: 'publishDate',
      width: 120,
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 120,
    },
    {
      title: '查看次数',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Standard) => (
        <Space size="small">
          <Button
            type="text"
            icon={<FileTextOutlined />}
            onClick={() => showDetail(record)}
          >
            详情
          </Button>
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            下载
          </Button>
        </Space>
      ),
    },
  ];

  // 标准分类树
  const standardTreeData = [
    {
      title: '美军标准 (MIL)',
      key: 'mil',
      icon: <GlobalOutlined />,
      children: [
        { title: 'MIL-STD-883 (微电子器件)', key: 'mil-883' },
        { title: 'MIL-STD-750 (半导体器件)', key: 'mil-750' },
        { title: 'MIL-STD-202 (电子器件)', key: 'mil-202' },
      ],
    },
    {
      title: '欧洲标准 (ESCC)',
      key: 'escc',
      icon: <GlobalOutlined />,
      children: [
        { title: 'ESCC-9000 (基础标准)', key: 'escc-9000' },
        { title: 'ESCC-2000 (元器件)', key: 'escc-2000' },
        { title: 'ESCC-3000 (试验方法)', key: 'escc-3000' },
      ],
    },
    {
      title: '国际标准 (ISO/IEC)',
      key: 'iso',
      icon: <GlobalOutlined />,
      children: [
        { title: 'ISO-9000 (质量管理)', key: 'iso-9000' },
        { title: 'IEC-60749 (半导体器件)', key: 'iec-60749' },
      ],
    },
    {
      title: '国军标 (GJB)',
      key: 'gjb',
      icon: <GlobalOutlined />,
      children: [
        { title: 'GJB-548 (微电子器件)', key: 'gjb-548' },
        { title: 'GJB-128 (半导体器件)', key: 'gjb-128' },
        { title: 'GJB-360 (电子器件)', key: 'gjb-360' },
      ],
    },
  ];

  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card title="标准分类" size="small">
            <Tree
              showIcon
              treeData={standardTreeData}
              defaultExpandAll
              onSelect={(selectedKeys) => {
                console.log('选择标准分类:', selectedKeys);
              }}
            />
          </Card>
        </Col>
        <Col span={18}>
          <Card title="标准查询" extra={<BookOutlined />}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSearch}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="标准编号" name="standardCode">
                    <Input placeholder="输入标准编号" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="标准类型" name="standardType">
                    <Select placeholder="选择标准类型" allowClear>
                      <Option value="MIL">美军标准 (MIL)</Option>
                      <Option value="ESCC">欧洲标准 (ESCC)</Option>
                      <Option value="ISO">国际标准 (ISO)</Option>
                      <Option value="IEC">国际标准 (IEC)</Option>
                      <Option value="GJB">国军标 (GJB)</Option>
                      <Option value="GB">国标 (GB)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="状态" name="status">
                    <Select placeholder="选择状态" allowClear>
                      <Option value="现行">现行</Option>
                      <Option value="即将生效">即将生效</Option>
                      <Option value="废止">废止</Option>
                      <Option value="替代">已替代</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="标题关键词" name="title">
                    <Input placeholder="输入标题关键词" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="发布年份" name="publishYear">
                    <Select placeholder="选择年份" allowClear>
                      <Option value="2023">2023</Option>
                      <Option value="2022">2022</Option>
                      <Option value="2021">2021</Option>
                      <Option value="2020">2020</Option>
                      <Option value="2019">2019</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="适用范围" name="scope">
                    <Select placeholder="选择范围" allowClear>
                      <Option value="微电子器件">微电子器件</Option>
                      <Option value="半导体器件">半导体器件</Option>
                      <Option value="航天元器件">航天元器件</Option>
                      <Option value="无源器件">无源器件</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                    搜索
                  </Button>
                  <Button onClick={handleReset}>重置</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          {standards.length > 0 && (
            <Card title={`搜索结果 (${standards.length})`} style={{ marginTop: 16 }}>
              <Table
                columns={columns}
                dataSource={standards}
                rowKey="id"
                loading={loading}
                scroll={{ x: 1200 }}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
              />
            </Card>
          )}
        </Col>
      </Row>

      {/* 标准详情模态框 */}
      <Modal
        title="标准详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            下载标准文档
          </Button>,
        ]}
        width={900}
      >
        {selectedStandard && (
          <Tabs 
            defaultActiveKey="basic"
            items={[
              {
                key: "basic",
                label: "基本信息",
                children: (
              <Descriptions column={2} bordered>
                <Descriptions.Item label="标准编号">{selectedStandard.standardCode}</Descriptions.Item>
                <Descriptions.Item label="标准类型">
                  <Tag color="blue">{selectedStandard.standardType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="版本">{selectedStandard.version}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color="green">{selectedStandard.status}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="发布日期">{selectedStandard.publishDate}</Descriptions.Item>
                <Descriptions.Item label="生效日期">{selectedStandard.effectiveDate}</Descriptions.Item>
                <Descriptions.Item label="发布组织">{selectedStandard.organization}</Descriptions.Item>
                <Descriptions.Item label="适用范围">{selectedStandard.scope}</Descriptions.Item>
                <Descriptions.Item label="标题" span={2}>
                  <Title level={5}>{selectedStandard.title}</Title>
                </Descriptions.Item>
                <Descriptions.Item label="描述" span={2}>
                  <Text>{selectedStandard.description}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="相关标准" span={2}>
                  {selectedStandard.relatedStandards.map(standard => (
                    <Tag key={standard} color="geekblue">{standard}</Tag>
                  ))}
                </Descriptions.Item>
              </Descriptions>
                )
              },
              {
                key: "history",
                label: "版本历史",
                children: (
              <Timeline>
                {selectedStandard.historyVersions.map((version, index) => (
                  <Timeline.Item key={index} dot={<HistoryOutlined />}>
                    <div>
                      <Text strong>版本 {version.version}</Text>
                      <Text type="secondary" style={{ marginLeft: 16 }}>{version.date}</Text>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Text>{version.changes}</Text>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
                )
              },
              {
                key: "stats",
                label: "统计信息",
                children: (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="查看次数">{selectedStandard.viewCount.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="下载链接">
                  {selectedStandard.downloadUrl ? (
                    <Button type="link" icon={<DownloadOutlined />}>
                      {selectedStandard.downloadUrl}
                    </Button>
                  ) : (
                    <Text type="secondary">暂无下载链接</Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
                )
              }
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default StandardQuery;
