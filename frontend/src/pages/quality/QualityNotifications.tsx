import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Descriptions, Badge, Alert } from 'antd';
import { EyeOutlined, ExclamationCircleOutlined, WarningOutlined } from '@ant-design/icons';

interface QualityNotification {
  id: string;
  title: string;
  level: 'high' | 'medium' | 'low';
  type: string;
  productName: string;
  modelSpec: string;
  supplier: string;
  batchNo: string;
  issueDate: string;
  status: string;
  summary: string;
  problemLocation: string;
  failureMode: string;
  problemCategory: '工艺问题' | '材料问题' | '结构问题' | '功能性能问题' | string;
  causeAnalysis: string;
  counterMeasures: string[];
  zeroingReport?: string;
  discoveryDate: string;
  lastUpdate: string;
  isOngoing: boolean;
  affectedProducts: string[];
}

const QualityNotifications: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<QualityNotification | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 模拟数据
  const mockData: QualityNotification[] = [
    {
      id: '1',
      title: '某型号电容器批次质量问题通报',
      level: 'high',
      type: '质量缺陷',
      productName: '钽电容器',
      modelSpec: 'TCN12345-10uF/50V',
      supplier: 'AVX公司',
      batchNo: 'BATCH-2024-01',
      issueDate: '2024-01-15',
      status: '处理中',
      summary: '在 125℃ 老化试验中容量衰减 8%，超出控制限，影响卫星电源模块稳定性。',
      problemLocation: '电源管理板 DC-DC 模块',
      failureMode: '容量衰减 / ESR 升高',
      problemCategory: '材料问题',
      causeAnalysis: '供应商阳极粉批次杂质含量偏高导致氧化膜不均匀，是高温失效的主要因素。',
      counterMeasures: [
        '隔离受影响批次并停止使用',
        '追加 168 小时高温筛选',
        '要求供应商提供阳极粉成分分析及整改计划'
      ],
      zeroingReport: 'https://example.com/zeroing-report-001.pdf',
      discoveryDate: '2024-01-05',
      lastUpdate: '2024-01-18',
      isOngoing: true,
      affectedProducts: ['卫星电源模块', '通信设备']
    },
    {
      id: '2',
      title: '集成电路封装开裂质量预警',
      level: 'medium',
      type: '工艺缺陷',
      productName: 'FPGA芯片',
      modelSpec: 'XQRK7J-2GB',
      supplier: 'Xilinx公司',
      batchNo: 'LOT-778-02',
      issueDate: '2024-01-10',
      status: '已处理',
      summary: '温度循环 -55℃~125℃ 100 次后封装边缘出现微裂纹。',
      problemLocation: '控制计算机信号处理板',
      failureMode: '封装裂纹 / 焊点失效',
      problemCategory: '结构问题',
      causeAnalysis: '封装应力释放不足且回流曲线偏离供应商建议，导致低温冲击后裂纹。',
      counterMeasures: [
        '调整回流工艺，每批次抽检 X-Ray',
        '与供应商联合分析裂纹机理',
        '对在途批次开展加严筛选'
      ],
      zeroingReport: undefined,
      discoveryDate: '2023-12-28',
      lastUpdate: '2024-01-12',
      isOngoing: false,
      affectedProducts: ['控制计算机', '数据处理单元']
    },
    {
      id: '3',
      title: '连接器接触不良问题通报',
      level: 'low',
      type: '可靠性问题',
      productName: '航空插头',
      modelSpec: 'AX-32P',
      supplier: '某航空连接器厂',
      batchNo: '2023Q4-AX',
      issueDate: '2024-01-05',
      status: '已关闭',
      summary: '振动试验后插拔力下降并出现间歇性接触不良。',
      problemLocation: '线缆组件',
      failureMode: '镀层磨损 / 接触电阻增大',
      problemCategory: '工艺问题',
      causeAnalysis: '电镀厚度不达标导致耐磨性不足，供应商过程管控薄弱。',
      counterMeasures: [
        '返工重新电镀并 100% 测试接触电阻',
        '对供应商开展过程审核',
        '上线来料抽检方案'
      ],
      zeroingReport: 'https://example.com/zeroing-report-002.pdf',
      discoveryDate: '2023-12-20',
      lastUpdate: '2024-01-06',
      isOngoing: false,
      affectedProducts: ['线缆组件']
    }
  ];

  const [data, setData] = useState<QualityNotification[]>(mockData);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return level;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '处理中': return 'processing';
      case '已处理': return 'success';
      case '已关闭': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: '通报标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: QualityNotification) => (
        <Space>
          {record.level === 'high' && <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
          {record.level === 'medium' && <WarningOutlined style={{ color: '#faad14' }} />}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '严重程度',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => (
        <Tag color={getLevelColor(level)}>{getLevelText(level)}</Tag>
      ),
    },
    {
      title: '问题类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: '型号规格',
      dataIndex: 'modelSpec',
      key: 'modelSpec',
      width: 180,
    },
    {
      title: '批次',
      dataIndex: 'batchNo',
      key: 'batchNo',
      width: 140,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
    },
    {
      title: '发布日期',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 120,
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge status={getStatusColor(status)} text={status} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record: QualityNotification) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedNotification(record);
            setModalVisible(true);
          }}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card title="质量通报管理" extra={
        <Button type="primary">
          发布通报
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
            showTotal: (total) => `共 ${total} 条通报`,
          }}
        />
      </Card>

      <Modal
        title="质量通报详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedNotification && (
          <div>
            <Descriptions column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="通报标题" span={2}>
                {selectedNotification.title}
              </Descriptions.Item>
              <Descriptions.Item label="严重程度">
                <Tag color={getLevelColor(selectedNotification.level)}>
                  {getLevelText(selectedNotification.level)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="问题类型">
                {selectedNotification.type}
              </Descriptions.Item>
              <Descriptions.Item label="产品名称">
                {selectedNotification.productName}
              </Descriptions.Item>
              <Descriptions.Item label="型号规格">
                {selectedNotification.modelSpec}
              </Descriptions.Item>
              <Descriptions.Item label="供应商">
                {selectedNotification.supplier}
              </Descriptions.Item>
              <Descriptions.Item label="批次">
                {selectedNotification.batchNo}
              </Descriptions.Item>
              <Descriptions.Item label="发现日期">
                {selectedNotification.discoveryDate}
              </Descriptions.Item>
              <Descriptions.Item label="发布日期">
                {selectedNotification.issueDate}
              </Descriptions.Item>
              <Descriptions.Item label="最近更新时间">
                {selectedNotification.lastUpdate}
              </Descriptions.Item>
              <Descriptions.Item label="处理状态">
                <Badge status={getStatusColor(selectedNotification.status)} text={selectedNotification.status} />
              </Descriptions.Item>
              <Descriptions.Item label="是否仍在发生">
                <Tag color={selectedNotification.isOngoing ? 'red' : 'green'}>
                  {selectedNotification.isOngoing ? '是' : '否'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Card title="问题概述" size="small" style={{ marginBottom: 16 }}>
              <p>{selectedNotification.summary}</p>
              <Descriptions column={2} bordered size="small" style={{ marginTop: 12 }}>
                <Descriptions.Item label="问题部位">
                  {selectedNotification.problemLocation}
                </Descriptions.Item>
                <Descriptions.Item label="故障模式">
                  {selectedNotification.failureMode}
                </Descriptions.Item>
                <Descriptions.Item label="问题分类" span={2}>
                  {selectedNotification.problemCategory}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="原因分析" size="small" style={{ marginBottom: 16 }}>
              <p>{selectedNotification.causeAnalysis}</p>
            </Card>

            <Card title="影响产品" size="small" style={{ marginBottom: 16 }}>
              <Space wrap>
                {selectedNotification.affectedProducts.map((product, index) => (
                  <Tag key={index} color="blue">{product}</Tag>
                ))}
              </Space>
            </Card>

            <Card title="处理措施" size="small">
              <ul>
                {selectedNotification.counterMeasures.map((measure, index) => (
                  <li key={index}>{measure}</li>
                ))}
              </ul>
            </Card>

            {selectedNotification.zeroingReport && (
              <Card title="归零报告" size="small" style={{ marginTop: 16 }}>
                <Alert
                  message={<a href={selectedNotification.zeroingReport} target="_blank" rel="noreferrer">查看归零报告</a>}
                  type="info"
                  showIcon
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QualityNotifications;
