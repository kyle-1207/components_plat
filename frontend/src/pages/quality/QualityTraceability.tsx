import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Button, 
  Space, 
  Select, 
  Tag, 
  Modal,
  Form,
  message,
  Row,
  Col,
  Descriptions,
  Timeline,
  Tree,
  Divider,
  Steps,
  Alert,
  Statistic
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  ApartmentOutlined,
  HistoryOutlined,
  QrcodeOutlined,
  LinkOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  BarcodeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';

const { Option } = Select;
const { Step } = Steps;

interface TraceabilityRecord {
  id: string;
  partNumber: string;
  serialNumber: string;
  batchNumber: string;
  manufacturer: string;
  productionDate: string;
  supplier: string;
  currentLocation: string;
  status: 'active' | 'used' | 'returned' | 'scrapped';
  traceabilityLevel: 'full' | 'partial' | 'limited';
  qualityLevel: string;
  applications: string[];
}

interface TraceabilityChain {
  stage: string;
  date: string;
  location: string;
  operator: string;
  operation: string;
  documents: string[];
  nextStage?: string;
}

const QualityTraceability: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TraceabilityRecord[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState<string>('partNumber');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [chainVisible, setChainVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TraceabilityRecord | null>(null);
  const [traceabilityChain, setTraceabilityChain] = useState<TraceabilityChain[]>([]);
  const [treeData, setTreeData] = useState<DataNode[]>([]);

  // 模拟数据
  const mockData: TraceabilityRecord[] = [
    {
      id: '1',
      partNumber: 'LM324AN',
      serialNumber: 'SN202311001',
      batchNumber: 'B2023001',
      manufacturer: '德州仪器',
      productionDate: '2023-01-15',
      supplier: '北京航天电子',
      currentLocation: '仓库A-01-05',
      status: 'active',
      traceabilityLevel: 'full',
      qualityLevel: 'QPL-1',
      applications: ['卫星通信', '导航系统']
    },
    {
      id: '2',
      partNumber: 'MAX232CPE',
      serialNumber: 'SN202311002',
      batchNumber: 'B2023M10',
      manufacturer: '美信',
      productionDate: '2023-03-20',
      supplier: '上海宇航器件',
      currentLocation: '生产线B',
      status: 'used',
      traceabilityLevel: 'full',
      qualityLevel: 'QPL-2',
      applications: ['数据传输']
    },
    {
      id: '3',
      partNumber: 'AD8066ARZ',
      serialNumber: 'SN202311003',
      batchNumber: 'B2023AD08',
      manufacturer: '亚德诺',
      productionDate: '2023-02-10',
      supplier: '深圳航天科技',
      currentLocation: '测试中心',
      status: 'returned',
      traceabilityLevel: 'partial',
      qualityLevel: 'QPL-1',
      applications: ['信号处理']
    }
  ];

  const mockChain: TraceabilityChain[] = [
    {
      stage: '原材料采购',
      date: '2023-01-10',
      location: '供应商工厂',
      operator: '采购部张三',
      operation: '原材料质量检验和采购',
      documents: ['采购合同', '质量证书', '检验报告']
    },
    {
      stage: '生产制造',
      date: '2023-01-15',
      location: '德州仪器工厂',
      operator: '生产线A组',
      operation: '芯片制造和封装',
      documents: ['生产工艺记录', '质量检测报告', '封装记录']
    },
    {
      stage: '出厂检验',
      date: '2023-01-18',
      location: '德州仪器质检中心',
      operator: '质检员李四',
      operation: '最终产品检验',
      documents: ['出厂检验报告', '合格证书']
    },
    {
      stage: '供应商入库',
      date: '2023-02-01',
      location: '北京航天电子仓库',
      operator: '仓管员王五',
      operation: '供应商质量验收',
      documents: ['入库检验单', '存储记录']
    },
    {
      stage: '客户采购',
      date: '2023-03-15',
      location: '航天某院',
      operator: '采购工程师赵六',
      operation: '器件选型和采购',
      documents: ['采购申请', '技术规格书']
    },
    {
      stage: '入库存储',
      date: '2023-03-18',
      location: '仓库A-01-05',
      operator: '仓管员钱七',
      operation: '入库验收和存储',
      documents: ['入库单', '存储环境记录']
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
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
      case 'used': return 'blue';
      case 'returned': return 'orange';
      case 'scrapped': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '在库';
      case 'used': return '已使用';
      case 'returned': return '已退回';
      case 'scrapped': return '已报废';
      default: return status;
    }
  };

  const getTraceabilityLevelColor = (level: string) => {
    switch (level) {
      case 'full': return 'green';
      case 'partial': return 'orange';
      case 'limited': return 'red';
      default: return 'default';
    }
  };

  const getTraceabilityLevelText = (level: string) => {
    switch (level) {
      case 'full': return '完整';
      case 'partial': return '部分';
      case 'limited': return '有限';
      default: return level;
    }
  };

  const handleViewDetail = (record: TraceabilityRecord) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const handleViewChain = (record: TraceabilityRecord) => {
    setSelectedRecord(record);
    setTraceabilityChain(mockChain);
    buildTreeData(mockChain);
    setChainVisible(true);
  };

  const buildTreeData = (chain: TraceabilityChain[]) => {
    const treeData: DataNode[] = chain.map((item, index) => ({
      title: (
        <div>
          <strong>{item.stage}</strong>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {item.date} - {item.location}
          </div>
        </div>
      ),
      key: index.toString(),
      icon: <EnvironmentOutlined />,
      children: item.documents.map((doc, docIndex) => ({
        title: doc,
        key: `${index}-${docIndex}`,
        icon: <LinkOutlined />,
        isLeaf: true
      }))
    }));
    setTreeData(treeData);
  };

  const handleSearch = () => {
    if (!searchText.trim()) {
      message.warning('请输入搜索内容');
      return;
    }
    
    message.success(`正在搜索${searchType === 'partNumber' ? '器件型号' : 
                    searchType === 'serialNumber' ? '序列号' : 
                    searchType === 'batchNumber' ? '批次号' : 'QR码'}: ${searchText}`);
    fetchData();
  };

  const columns: ColumnsType<TraceabilityRecord> = [
    {
      title: '器件型号',
      dataIndex: 'partNumber',
      key: 'partNumber',
      width: 150,
      render: (text) => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{text}</span>
    },
    {
      title: '序列号',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 150,
    },
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120,
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 120,
    },
    {
      title: '生产日期',
      dataIndex: 'productionDate',
      key: 'productionDate',
      width: 120,
    },
    {
      title: '当前位置',
      dataIndex: 'currentLocation',
      key: 'currentLocation',
      width: 150,
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
      title: '追溯等级',
      dataIndex: 'traceabilityLevel',
      key: 'traceabilityLevel',
      width: 100,
      render: (level) => (
        <Tag color={getTraceabilityLevelColor(level)}>
          {getTraceabilityLevelText(level)}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
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
            icon={<ApartmentOutlined />} 
            onClick={() => handleViewChain(record)}
            size="small"
          >
            追溯链
          </Button>
        </Space>
      ),
    },
  ];

  const filteredData = data.filter(item => {
    const matchesSearch = searchText === '' || 
      (searchType === 'partNumber' && item.partNumber.toLowerCase().includes(searchText.toLowerCase())) ||
      (searchType === 'serialNumber' && item.serialNumber.toLowerCase().includes(searchText.toLowerCase())) ||
      (searchType === 'batchNumber' && item.batchNumber.toLowerCase().includes(searchText.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // 统计数据
  const stats = {
    total: data.length,
    fullTraceability: data.filter(item => item.traceabilityLevel === 'full').length,
    active: data.filter(item => item.status === 'active').length,
    used: data.filter(item => item.status === 'used').length,
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 说明卡片 */}
      <Alert
        message="质量追溯查询"
        description="通过器件型号、序列号、批次号或二维码快速查询器件的完整生命周期信息，确保质量可追溯。"
        type="info"
        icon={<HistoryOutlined />}
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总记录数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="完整追溯" value={stats.fullTraceability} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="在库器件" value={stats.active} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已使用" value={stats.used} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
      </Row>

      {/* 搜索区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={4}>
            <Select
              value={searchType}
              onChange={setSearchType}
              style={{ width: '100%' }}
            >
              <Option value="partNumber">器件型号</Option>
              <Option value="serialNumber">序列号</Option>
              <Option value="batchNumber">批次号</Option>
              <Option value="qrCode">二维码</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Input
              placeholder={`请输入${searchType === 'partNumber' ? '器件型号' : 
                          searchType === 'serialNumber' ? '序列号' : 
                          searchType === 'batchNumber' ? '批次号' : '二维码'}`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              suffix={
                searchType === 'qrCode' ? <QrcodeOutlined /> : 
                searchType === 'serialNumber' ? <BarcodeOutlined /> : 
                <SearchOutlined />
              }
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
              <Option value="active">在库</Option>
              <Option value="used">已使用</Option>
              <Option value="returned">已退回</Option>
              <Option value="scrapped">已报废</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                查询追溯
              </Button>
              <Button onClick={fetchData}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
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
        title="器件详细信息"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
          <Button key="chain" type="primary" onClick={() => {
            setDetailVisible(false);
            handleViewChain(selectedRecord!);
          }}>
            查看追溯链
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="器件型号">{selectedRecord.partNumber}</Descriptions.Item>
              <Descriptions.Item label="序列号">{selectedRecord.serialNumber}</Descriptions.Item>
              <Descriptions.Item label="批次号">{selectedRecord.batchNumber}</Descriptions.Item>
              <Descriptions.Item label="制造商">{selectedRecord.manufacturer}</Descriptions.Item>
              <Descriptions.Item label="生产日期">{selectedRecord.productionDate}</Descriptions.Item>
              <Descriptions.Item label="供应商">{selectedRecord.supplier}</Descriptions.Item>
              <Descriptions.Item label="当前位置">{selectedRecord.currentLocation}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedRecord.status)}>
                  {getStatusText(selectedRecord.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="追溯等级">
                <Tag color={getTraceabilityLevelColor(selectedRecord.traceabilityLevel)}>
                  {getTraceabilityLevelText(selectedRecord.traceabilityLevel)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="质量等级">{selectedRecord.qualityLevel}</Descriptions.Item>
              <Descriptions.Item label="应用领域" span={2}>
                {selectedRecord.applications.map(app => (
                  <Tag key={app} color="blue">{app}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>

            <Divider>关键节点</Divider>
            <Steps direction="vertical" size="small">
              <Step 
                title="生产制造" 
                description={`${selectedRecord.productionDate} - ${selectedRecord.manufacturer}`}
                status="finish"
                icon={<CalendarOutlined />}
              />
              <Step 
                title="供应商验收" 
                description={`供应商: ${selectedRecord.supplier}`}
                status="finish"
                icon={<UserOutlined />}
              />
              <Step 
                title="当前状态" 
                description={`${selectedRecord.currentLocation} - ${getStatusText(selectedRecord.status)}`}
                status={selectedRecord.status === 'active' ? 'process' : 'finish'}
                icon={<EnvironmentOutlined />}
              />
            </Steps>
          </>
        )}
      </Modal>

      {/* 追溯链模态框 */}
      <Modal
        title={`追溯链 - ${selectedRecord?.partNumber} (${selectedRecord?.serialNumber})`}
        open={chainVisible}
        onCancel={() => setChainVisible(false)}
        footer={[
          <Button key="close" onClick={() => setChainVisible(false)}>
            关闭
          </Button>
        ]}
        width={1000}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Card title="追溯流程" size="small">
              <Timeline>
                {traceabilityChain.map((item, index) => (
                  <Timeline.Item
                    key={index}
                    dot={<EnvironmentOutlined />}
                    color={index === traceabilityChain.length - 1 ? 'green' : 'blue'}
                  >
                    <div>
                      <strong>{item.stage}</strong>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                        <CalendarOutlined /> {item.date} | <EnvironmentOutlined /> {item.location}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        <UserOutlined /> {item.operator}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        {item.operation}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        {item.documents.map(doc => (
                          <Tag key={doc} size="small" color="blue">{doc}</Tag>
                        ))}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="文档树" size="small">
              <Tree
                showIcon
                treeData={treeData}
                defaultExpandAll
                selectable={false}
              />
            </Card>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default QualityTraceability;
