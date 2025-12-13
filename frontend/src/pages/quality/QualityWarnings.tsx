import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Alert, Progress, Timeline, message } from 'antd';
import { EyeOutlined, BellOutlined, ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { qualityAlertAPI } from '@/services/api';

interface QualityWarning {
  id: string;
  title: string;
  level: 'critical' | 'warning' | 'info';
  category: string;
  component: string;
  supplier: string;
  riskScore: number;
  triggerDate: string;
  status: string;
  description: string;
  riskFactors: string[];
  recommendations: string[];
  timeline: Array<{
    time: string;
    content: string;
    status: 'process' | 'finish' | 'error' | 'wait';
  }>;
}

const QualityWarnings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState<QualityWarning | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 模拟数据
  const mockData: QualityWarning[] = [
    {
      id: '1',
      title: '高温环境下器件失效率预警',
      level: 'critical',
      category: '环境适应性',
      component: '功率MOSFET',
      supplier: 'Infineon公司',
      riskScore: 85,
      triggerDate: '2024-01-18',
      status: '激活',
      description: '根据历史数据分析，该型号功率MOSFET在高温环境下失效率呈上升趋势。',
      riskFactors: ['温度超过额定值', '电流密度过高', '散热设计不足'],
      recommendations: ['加强散热设计', '降额使用', '增加温度监测'],
      timeline: [
        { time: '2024-01-18 09:00', content: '系统检测到异常趋势', status: 'finish' },
        { time: '2024-01-18 10:30', content: '触发预警机制', status: 'finish' },
        { time: '2024-01-18 11:00', content: '通知相关人员', status: 'finish' },
        { time: '2024-01-18 14:00', content: '制定应对措施', status: 'process' },
      ]
    },
    {
      id: '2',
      title: '供应商质量体系风险预警',
      level: 'warning',
      category: '供应链风险',
      component: '石英晶振',
      supplier: 'KDS公司',
      riskScore: 65,
      triggerDate: '2024-01-16',
      status: '监控中',
      description: '供应商质量管理体系评估得分下降，存在潜在质量风险。',
      riskFactors: ['质量管理体系评分下降', '交付延迟增加', '客户投诉上升'],
      recommendations: ['加强供应商审核', '建立备选供应商', '增加来料检验'],
      timeline: [
        { time: '2024-01-16 08:00', content: '质量评估完成', status: 'finish' },
        { time: '2024-01-16 09:00', content: '发现风险指标', status: 'finish' },
        { time: '2024-01-16 10:00', content: '启动预警流程', status: 'finish' },
        { time: '2024-01-16 15:00', content: '制定监控计划', status: 'process' },
      ]
    },
    {
      id: '3',
      title: '批次一致性异常预警',
      level: 'info',
      category: '工艺质量',
      component: '运算放大器',
      supplier: 'TI公司',
      riskScore: 45,
      triggerDate: '2024-01-14',
      status: '已处理',
      description: '近期批次产品参数一致性出现轻微波动，需要关注。',
      riskFactors: ['参数离散度增大', '工艺参数变化', '原材料批次差异'],
      recommendations: ['加强工艺控制', '优化检测方法', '建立参数趋势分析'],
      timeline: [
        { time: '2024-01-14 10:00', content: '检测到参数异常', status: 'finish' },
        { time: '2024-01-14 11:00', content: '分析异常原因', status: 'finish' },
        { time: '2024-01-14 14:00', content: '联系供应商确认', status: 'finish' },
        { time: '2024-01-14 16:00', content: '问题得到解决', status: 'finish' },
      ]
    }
  ];

  const [data, setData] = useState<QualityWarning[]>(mockData);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'red';
      case 'warning': return 'orange';
      case 'info': return 'blue';
      default: return 'default';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'critical': return '严重';
      case 'warning': return '警告';
      case 'info': return '提示';
      default: return level;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '激活': return 'error';
      case '监控中': return 'processing';
      case '已处理': return 'success';
      default: return 'default';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return '#ff4d4f';
    if (score >= 60) return '#faad14';
    return '#52c41a';
  };

  const columns = [
    {
      title: '预警标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: QualityWarning) => (
        <Space>
          {record.level === 'critical' && <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
          {record.level === 'warning' && <BellOutlined style={{ color: '#faad14' }} />}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '预警级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => (
        <Tag color={getLevelColor(level)}>{getLevelText(level)}</Tag>
      ),
    },
    {
      title: '风险评分',
      dataIndex: 'riskScore',
      key: 'riskScore',
      width: 120,
      render: (score: number) => (
        <Progress 
          percent={score} 
          size="small" 
          strokeColor={getRiskColor(score)}
          format={() => `${score}分`}
        />
      ),
    },
    {
      title: '预警类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '涉及器件',
      dataIndex: 'component',
      key: 'component',
      width: 120,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
    },
    {
      title: '触发时间',
      dataIndex: 'triggerDate',
      key: 'triggerDate',
      width: 120,
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
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record: QualityWarning) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedWarning(record);
            setModalVisible(true);
          }}
        >
          查看详情
        </Button>
      ),
    },
  ];

  const handleScanFromZeroing = async () => {
    setScanLoading(true);
    try {
      await qualityAlertAPI.scanFromZeroing({ limit: 50 });
      message.success('已触发质量归零数据扫描，稍候刷新列表查看结果');
    } catch (error: any) {
      message.error(error?.response?.data?.error?.message || '扫描失败，请稍后重试');
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Alert
            message="当前有 1 个严重预警，2 个一般预警需要处理"
            type="warning"
            showIcon
            closable
          />
        </Space>
      </div>

      <Card
        title="质量预警管理"
        extra={
          <Space>
            <Button icon={<SyncOutlined />} loading={scanLoading} onClick={handleScanFromZeroing}>
              扫描质量归零数据
            </Button>
            <Button type="primary">
              预警设置
            </Button>
          </Space>
        }
      >
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
            showTotal: (total) => `共 ${total} 条预警`,
          }}
        />
      </Card>

      <Modal
        title="质量预警详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="handle" type="primary">
            处理预警
          </Button>,
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={900}
      >
        {selectedWarning && (
          <div>
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <strong>预警标题：</strong>{selectedWarning.title}
                </div>
                <div>
                  <strong>预警级别：</strong>
                  <Tag color={getLevelColor(selectedWarning.level)}>
                    {getLevelText(selectedWarning.level)}
                  </Tag>
                </div>
                <div>
                  <strong>风险评分：</strong>
                  <Progress 
                    percent={selectedWarning.riskScore} 
                    strokeColor={getRiskColor(selectedWarning.riskScore)}
                    style={{ width: 200 }}
                  />
                </div>
                <div>
                  <strong>问题描述：</strong>{selectedWarning.description}
                </div>
              </Space>
            </Card>

            <Card title="风险因素" size="small" style={{ marginBottom: 16 }}>
              <ul>
                {selectedWarning.riskFactors.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
            </Card>

            <Card title="建议措施" size="small" style={{ marginBottom: 16 }}>
              <ul>
                {selectedWarning.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </Card>

            <Card title="处理时间线" size="small">
              <Timeline
                items={selectedWarning.timeline.map(item => ({
                  color: item.status === 'finish' ? 'green' : 
                         item.status === 'process' ? 'blue' : 
                         item.status === 'error' ? 'red' : 'gray',
                  children: (
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.time}</div>
                      <div>{item.content}</div>
                    </div>
                  ),
                }))}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QualityWarnings;
