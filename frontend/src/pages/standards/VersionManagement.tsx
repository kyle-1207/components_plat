import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Button, 
  Space, 
  Select, 
  DatePicker, 
  Tag, 
  Modal,
  Form,
  message,
  Row,
  Col,
  Descriptions,
  Timeline
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  HistoryOutlined,
  FileTextOutlined,
  SwapOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface VersionRecord {
  id: string;
  standardNumber: string;
  standardName: string;
  currentVersion: string;
  previousVersion: string;
  updateDate: string;
  status: 'active' | 'deprecated' | 'draft';
  changeType: 'major' | 'minor' | 'patch';
  description: string;
  publisher: string;
  downloadCount: number;
}

interface VersionHistory {
  version: string;
  date: string;
  changes: string;
  type: 'major' | 'minor' | 'patch';
}

const VersionManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VersionRecord[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedChangeType, setSelectedChangeType] = useState<string>('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [compareVisible, setCompareVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VersionRecord | null>(null);
  const [versionHistory, setVersionHistory] = useState<VersionHistory[]>([]);
  const [form] = Form.useForm();

  // 模拟数据
  const mockData: VersionRecord[] = [
    {
      id: '1',
      standardNumber: 'GB/T 4937-2020',
      standardName: '半导体器件机械和气候试验方法',
      currentVersion: '2020',
      previousVersion: '2010',
      updateDate: '2020-12-01',
      status: 'active',
      changeType: 'major',
      description: '增加了新的试验方法和环境条件要求',
      publisher: '国家标准化管理委员会',
      downloadCount: 1250
    },
    {
      id: '2',
      standardNumber: 'GJB 548C-2018',
      standardName: '微电子器件试验方法和程序',
      currentVersion: '2018',
      previousVersion: '2005',
      updateDate: '2018-06-15',
      status: 'active',
      changeType: 'major',
      description: '更新了试验程序和质量等级要求',
      publisher: '中央军委装备发展部',
      downloadCount: 2100
    },
    {
      id: '3',
      standardNumber: 'QJ 3068-2019',
      standardName: '航天用集成电路通用规范',
      currentVersion: '2019',
      previousVersion: '2014',
      updateDate: '2019-03-20',
      status: 'active',
      changeType: 'minor',
      description: '修订了可靠性要求和测试条件',
      publisher: '国防科工局',
      downloadCount: 890
    },
    {
      id: '4',
      standardNumber: 'IEC 60749-2021',
      standardName: '半导体器件环境和耐久性试验方法',
      currentVersion: '2021',
      previousVersion: '2017',
      updateDate: '2021-09-10',
      status: 'draft',
      changeType: 'major',
      description: '新增辐射试验方法和标准',
      publisher: '国际电工委员会',
      downloadCount: 650
    }
  ];

  const mockHistory: VersionHistory[] = [
    {
      version: '2020',
      date: '2020-12-01',
      changes: '增加了新的试验方法和环境条件要求，更新了质量控制标准',
      type: 'major'
    },
    {
      version: '2010',
      date: '2010-08-15',
      changes: '修订了测试程序，增加了可靠性评估方法',
      type: 'major'
    },
    {
      version: '2005',
      date: '2005-03-20',
      changes: '首次发布，建立了基本的试验框架',
      type: 'major'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData(mockData);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'deprecated': return 'red';
      case 'draft': return 'orange';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '有效';
      case 'deprecated': return '已废止';
      case 'draft': return '草案';
      default: return status;
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'red';
      case 'minor': return 'orange';
      case 'patch': return 'blue';
      default: return 'default';
    }
  };

  const getChangeTypeText = (type: string) => {
    switch (type) {
      case 'major': return '主要更新';
      case 'minor': return '次要更新';
      case 'patch': return '补丁更新';
      default: return type;
    }
  };

  const handleViewDetail = (record: VersionRecord) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const handleViewHistory = (record: VersionRecord) => {
    setSelectedRecord(record);
    setVersionHistory(mockHistory);
    setHistoryVisible(true);
  };

  const handleCompareVersions = (record: VersionRecord) => {
    setSelectedRecord(record);
    setCompareVisible(true);
  };

  const handleDownload = (record: VersionRecord) => {
    message.success(`开始下载 ${record.standardName} (${record.currentVersion})`);
  };

  const columns: ColumnsType<VersionRecord> = [
    {
      title: '标准编号',
      dataIndex: 'standardNumber',
      key: 'standardNumber',
      width: 150,
      render: (text) => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{text}</span>
    },
    {
      title: '标准名称',
      dataIndex: 'standardName',
      key: 'standardName',
      ellipsis: true,
    },
    {
      title: '当前版本',
      dataIndex: 'currentVersion',
      key: 'currentVersion',
      width: 100,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '上一版本',
      dataIndex: 'previousVersion',
      key: 'previousVersion',
      width: 100,
      render: (text) => <Tag color="default">{text}</Tag>
    },
    {
      title: '更新日期',
      dataIndex: 'updateDate',
      key: 'updateDate',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '变更类型',
      dataIndex: 'changeType',
      key: 'changeType',
      width: 120,
      render: (type) => (
        <Tag color={getChangeTypeColor(type)}>
          {getChangeTypeText(type)}
        </Tag>
      )
    },
    {
      title: '下载次数',
      dataIndex: 'downloadCount',
      key: 'downloadCount',
      width: 100,
      sorter: (a, b) => a.downloadCount - b.downloadCount,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            详情
          </Button>
          <Button 
            type="link" 
            icon={<HistoryOutlined />} 
            onClick={() => handleViewHistory(record)}
            size="small"
          >
            历史
          </Button>
          <Button 
            type="link" 
            icon={<SwapOutlined />} 
            onClick={() => handleCompareVersions(record)}
            size="small"
          >
            对比
          </Button>
          <Button 
            type="link" 
            icon={<DownloadOutlined />} 
            onClick={() => handleDownload(record)}
            size="small"
          >
            下载
          </Button>
        </Space>
      ),
    },
  ];

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.standardNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      item.standardName.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesChangeType = selectedChangeType === 'all' || item.changeType === selectedChangeType;
    
    return matchesSearch && matchesStatus && matchesChangeType;
  });

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Input
                placeholder="搜索标准编号或名称"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="状态"
                style={{ width: '100%' }}
                value={selectedStatus}
                onChange={setSelectedStatus}
              >
                <Option value="all">全部状态</Option>
                <Option value="active">有效</Option>
                <Option value="deprecated">已废止</Option>
                <Option value="draft">草案</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="变更类型"
                style={{ width: '100%' }}
                value={selectedChangeType}
                onChange={setSelectedChangeType}
              >
                <Option value="all">全部类型</Option>
                <Option value="major">主要更新</Option>
                <Option value="minor">次要更新</Option>
                <Option value="patch">补丁更新</Option>
              </Select>
            </Col>
            <Col span={6}>
              <RangePicker placeholder={['开始日期', '结束日期']} />
            </Col>
            <Col span={2}>
              <Button type="primary" onClick={fetchData}>
                刷新
              </Button>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="标准版本详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            下载标准
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="标准编号">{selectedRecord.standardNumber}</Descriptions.Item>
            <Descriptions.Item label="标准名称">{selectedRecord.standardName}</Descriptions.Item>
            <Descriptions.Item label="当前版本">{selectedRecord.currentVersion}</Descriptions.Item>
            <Descriptions.Item label="上一版本">{selectedRecord.previousVersion}</Descriptions.Item>
            <Descriptions.Item label="更新日期">{selectedRecord.updateDate}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(selectedRecord.status)}>
                {getStatusText(selectedRecord.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="变更类型">
              <Tag color={getChangeTypeColor(selectedRecord.changeType)}>
                {getChangeTypeText(selectedRecord.changeType)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="发布机构">{selectedRecord.publisher}</Descriptions.Item>
            <Descriptions.Item label="下载次数">{selectedRecord.downloadCount}</Descriptions.Item>
            <Descriptions.Item label="变更说明" span={2}>
              {selectedRecord.description}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 版本历史模态框 */}
      <Modal
        title="版本历史"
        open={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {selectedRecord && (
          <>
            <h4>{selectedRecord.standardName} ({selectedRecord.standardNumber})</h4>
            <Timeline>
              {versionHistory.map((version, index) => (
                <Timeline.Item
                  key={index}
                  color={getChangeTypeColor(version.type)}
                  dot={<FileTextOutlined />}
                >
                  <div>
                    <strong>版本 {version.version}</strong>
                    <Tag color={getChangeTypeColor(version.type)} style={{ marginLeft: 8 }}>
                      {getChangeTypeText(version.type)}
                    </Tag>
                  </div>
                  <div style={{ color: '#666', fontSize: '12px', marginTop: 4 }}>
                    {version.date}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {version.changes}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </>
        )}
      </Modal>

      {/* 版本对比模态框 */}
      <Modal
        title="版本对比"
        open={compareVisible}
        onCancel={() => setCompareVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCompareVisible(false)}>
            关闭
          </Button>
        ]}
        width={1000}
      >
        {selectedRecord && (
          <div>
            <h4>{selectedRecord.standardName} 版本对比</h4>
            <Row gutter={16}>
              <Col span={12}>
                <Card title={`当前版本 (${selectedRecord.currentVersion})`} size="small">
                  <p><strong>发布日期:</strong> {selectedRecord.updateDate}</p>
                  <p><strong>主要变更:</strong></p>
                  <ul>
                    <li>增加了新的试验方法</li>
                    <li>更新了环境条件要求</li>
                    <li>修订了质量控制标准</li>
                    <li>完善了可靠性评估方法</li>
                  </ul>
                </Card>
              </Col>
              <Col span={12}>
                <Card title={`上一版本 (${selectedRecord.previousVersion})`} size="small">
                  <p><strong>发布日期:</strong> 2010-08-15</p>
                  <p><strong>主要内容:</strong></p>
                  <ul>
                    <li>基础试验方法</li>
                    <li>标准环境条件</li>
                    <li>基本质量要求</li>
                    <li>初步可靠性标准</li>
                  </ul>
                </Card>
              </Col>
            </Row>
            <Card title="详细变更对比" style={{ marginTop: 16 }} size="small">
              <Table
                size="small"
                columns={[
                  { title: '变更项目', dataIndex: 'item', key: 'item' },
                  { title: '上一版本', dataIndex: 'old', key: 'old' },
                  { title: '当前版本', dataIndex: 'new', key: 'new' },
                  { title: '变更类型', dataIndex: 'type', key: 'type', 
                    render: (type) => <Tag color={type === '新增' ? 'green' : type === '修改' ? 'orange' : 'red'}>{type}</Tag> }
                ]}
                dataSource={[
                  { key: '1', item: '试验温度范围', old: '-55°C ~ +125°C', new: '-65°C ~ +150°C', type: '修改' },
                  { key: '2', item: '辐射试验方法', old: '无', new: '增加总剂量和单粒子效应试验', type: '新增' },
                  { key: '3', item: '可靠性评估', old: '基本要求', new: '详细的统计分析方法', type: '修改' }
                ]}
                pagination={false}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VersionManagement;
