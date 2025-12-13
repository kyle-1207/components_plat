import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Timeline,
  Alert,
  Select,
  DatePicker,
  Button,
  Space,
  Tooltip,
  Badge,
  Descriptions,
} from 'antd';
import {
  TruckOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 供应链数据类型
interface SupplyChainItem {
  id: string;
  partNumber: string;
  supplier: string;
  orderQuantity: number;
  deliveredQuantity: number;
  expectedDate: string;
  actualDate?: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'risk';
  riskLevel: 'low' | 'medium' | 'high';
  location: string;
  trackingNumber?: string;
}

interface RiskEvent {
  id: string;
  type: 'delay' | 'quality' | 'supplier' | 'logistics';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  status: 'active' | 'resolved' | 'monitoring';
  affectedOrders: string[];
}

const SupplyChainMonitoring: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [supplyData, setSupplyData] = useState<SupplyChainItem[]>([]);
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');

  // 模拟数据
  const mockSupplyData: SupplyChainItem[] = [
    {
      id: '1',
      partNumber: 'AD8099ARZ',
      supplier: '航天供应商A',
      orderQuantity: 1000,
      deliveredQuantity: 800,
      expectedDate: '2024-02-15',
      actualDate: '2024-02-18',
      status: 'delayed',
      riskLevel: 'medium',
      location: '北京仓库',
      trackingNumber: 'TRK001234567'
    },
    {
      id: '2',
      partNumber: 'LM7805CT',
      supplier: '军工供应商B',
      orderQuantity: 2000,
      deliveredQuantity: 2000,
      expectedDate: '2024-01-30',
      actualDate: '2024-01-28',
      status: 'delivered',
      riskLevel: 'low',
      location: '上海仓库',
      trackingNumber: 'TRK001234568'
    },
    {
      id: '3',
      partNumber: 'XC7K325T',
      supplier: '代理商C',
      orderQuantity: 500,
      deliveredQuantity: 0,
      expectedDate: '2024-03-01',
      status: 'in_transit',
      riskLevel: 'high',
      location: '运输途中',
      trackingNumber: 'TRK001234569'
    },
  ];

  const mockRiskEvents: RiskEvent[] = [
    {
      id: '1',
      type: 'delay',
      title: '供应商A交付延迟',
      description: '由于生产设备维护，预计延迟3-5天交付',
      severity: 'medium',
      date: '2024-01-20',
      status: 'active',
      affectedOrders: ['1', '4', '7']
    },
    {
      id: '2',
      type: 'quality',
      title: '批次质量问题',
      description: '发现某批次器件存在参数偏差，需要重新检测',
      severity: 'high',
      date: '2024-01-18',
      status: 'monitoring',
      affectedOrders: ['3', '5']
    },
    {
      id: '3',
      type: 'logistics',
      title: '运输路线调整',
      description: '受天气影响，运输路线需要调整，可能影响交付时间',
      severity: 'low',
      date: '2024-01-22',
      status: 'resolved',
      affectedOrders: ['2']
    },
  ];

  useEffect(() => {
    setSupplyData(mockSupplyData);
    setRiskEvents(mockRiskEvents);
  }, []);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setSupplyData([...mockSupplyData]);
      setRiskEvents([...mockRiskEvents]);
      setLoading(false);
    }, 1000);
  };

  // 统计数据
  const totalOrders = supplyData.length;
  const deliveredOrders = supplyData.filter(item => item.status === 'delivered').length;
  const delayedOrders = supplyData.filter(item => item.status === 'delayed').length;
  const riskOrders = supplyData.filter(item => item.riskLevel === 'high').length;
  const onTimeRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : '0';

  const getStatusTag = (status: string) => {
    const statusMap = {
      pending: { color: 'default', text: '待发货' },
      in_transit: { color: 'processing', text: '运输中' },
      delivered: { color: 'success', text: '已交付' },
      delayed: { color: 'warning', text: '延迟' },
      risk: { color: 'error', text: '风险' },
    };
    const config = statusMap[status as keyof typeof statusMap];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getRiskTag = (level: string) => {
    const riskMap = {
      low: { color: 'green', text: '低风险' },
      medium: { color: 'orange', text: '中风险' },
      high: { color: 'red', text: '高风险' },
    };
    const config = riskMap[level as keyof typeof riskMap];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getSeverityColor = (severity: string) => {
    const colorMap = {
      low: '#52c41a',
      medium: '#fa8c16',
      high: '#ff4d4f',
      critical: '#a0d911'
    };
    return colorMap[severity as keyof typeof colorMap];
  };

  const columns: ColumnsType<SupplyChainItem> = [
    {
      title: '器件型号',
      dataIndex: 'partNumber',
      key: 'partNumber',
      width: 120,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
    },
    {
      title: '订单数量',
      dataIndex: 'orderQuantity',
      key: 'orderQuantity',
      width: 100,
      render: (quantity: number) => quantity.toLocaleString(),
    },
    {
      title: '交付进度',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        const percent = (record.deliveredQuantity / record.orderQuantity) * 100;
        return (
          <div>
            <Progress 
              percent={Math.round(percent)} 
              size="small" 
              status={record.status === 'delayed' ? 'exception' : 'active'}
            />
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.deliveredQuantity.toLocaleString()} / {record.orderQuantity.toLocaleString()}
            </div>
          </div>
        );
      },
    },
    {
      title: '预期交付',
      dataIndex: 'expectedDate',
      key: 'expectedDate',
      width: 100,
    },
    {
      title: '实际交付',
      dataIndex: 'actualDate',
      key: 'actualDate',
      width: 100,
      render: (date: string) => date || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: getStatusTag,
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 80,
      render: getRiskTag,
    },
    {
      title: '当前位置',
      dataIndex: 'location',
      key: 'location',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button type="text" size="small" icon={<TruckOutlined />} />
          </Tooltip>
          {record.trackingNumber && (
            <Tooltip title="物流跟踪">
              <Button type="text" size="small">跟踪</Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 概览统计 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={totalOrders}
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="按时交付率"
              value={onTimeRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="延迟订单"
              value={delayedOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="高风险订单"
              value={riskOrders}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 供应链监控表格 */}
        <Col span={16}>
          <Card 
            title="供应链跟踪"
            extra={
              <Space>
                <Select
                  value={selectedSupplier}
                  onChange={setSelectedSupplier}
                  style={{ width: 150 }}
                >
                  <Option value="all">全部供应商</Option>
                  <Option value="航天供应商A">航天供应商A</Option>
                  <Option value="军工供应商B">军工供应商B</Option>
                  <Option value="代理商C">代理商C</Option>
                </Select>
                <Button icon={<ReloadOutlined />} onClick={refreshData} loading={loading}>
                  刷新
                </Button>
                <Button icon={<DownloadOutlined />}>导出</Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={supplyData.filter(item => 
                selectedSupplier === 'all' || item.supplier === selectedSupplier
              )}
              rowKey="id"
              loading={loading}
              size="small"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </Card>
        </Col>

        {/* 风险事件 */}
        <Col span={8}>
          <Card title="风险事件" style={{ marginBottom: 16 }}>
            <Timeline
              items={riskEvents.map(event => ({
                color: getSeverityColor(event.severity),
                dot: event.status === 'active' ? <ExclamationCircleOutlined /> : 
                     event.status === 'resolved' ? <CheckCircleOutlined /> : 
                     <ClockCircleOutlined />,
                children: (
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                      {event.title}
                      <Badge 
                        status={
                          event.status === 'active' ? 'processing' :
                          event.status === 'resolved' ? 'success' : 'default'
                        }
                        style={{ marginLeft: 8 }}
                      />
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                      {event.description}
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ color: '#999' }}>{event.date}</span>
                      <span style={{ marginLeft: 16, color: getSeverityColor(event.severity) }}>
                        {event.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>

          {/* 预警信息 */}
          <Card title="预警信息">
            <Alert
              message="供应商风险提醒"
              description="供应商A近期交付表现下降，建议加强沟通和监控"
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
            />
            <Alert
              message="库存预警"
              description="XC7K325T器件库存不足，建议提前下单补充"
              type="info"
              showIcon
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SupplyChainMonitoring;
