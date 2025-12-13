import React, { useState } from 'react';
import { Card, Table, Button, Input, Select, Space, Tag, Modal, Form, DatePicker, Progress, Descriptions, Timeline, Alert } from 'antd';
import { SearchOutlined, SafetyCertificateOutlined, EyeOutlined, PlusOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;

interface SecurityCertification {
  id: string;
  supplierName: string;
  supplierCode: string;
  certificationType: string;
  certificationLevel: 'A' | 'B' | 'C';
  status: 'applying' | 'reviewing' | 'certified' | 'expired' | 'rejected';
  applicationDate: string;
  certificationDate?: string;
  expiryDate?: string;
  auditor: string;
  riskLevel: 'low' | 'medium' | 'high';
  securityScore: number;
  documents: string[];
  notes?: string;
}

const SecurityCertification: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SecurityCertification | null>(null);
  const [form] = Form.useForm();

  const mockData: SecurityCertification[] = [
    {
      id: '1',
      supplierName: '航天电子供应商A',
      supplierCode: 'SUP001',
      certificationType: '供应链安全认证',
      certificationLevel: 'A',
      status: 'certified',
      applicationDate: '2023-10-01',
      certificationDate: '2023-12-15',
      expiryDate: '2024-12-15',
      auditor: '安全审计组',
      riskLevel: 'low',
      securityScore: 95,
      documents: ['营业执照', '质量体系认证', '安全管理制度', '人员背景调查'],
      notes: '通过全面安全审计，符合所有安全要求'
    },
    {
      id: '2',
      supplierName: '军工器件制造商B',
      supplierCode: 'SUP002',
      certificationType: '保密资质认证',
      certificationLevel: 'A',
      status: 'reviewing',
      applicationDate: '2024-01-10',
      auditor: '保密委员会',
      riskLevel: 'medium',
      securityScore: 88,
      documents: ['保密资质证书', '涉密人员清单', '安全设施检查报告'],
      notes: '正在进行现场审核'
    },
    {
      id: '3',
      supplierName: '电子元件供应商C',
      supplierCode: 'SUP003',
      certificationType: '供应链安全认证',
      certificationLevel: 'B',
      status: 'applying',
      applicationDate: '2024-01-15',
      auditor: '待分配',
      riskLevel: 'medium',
      securityScore: 0,
      documents: ['营业执照', '质量体系认证'],
      notes: '初次申请，材料审核中'
    }
  ];

  const columns: ColumnsType<SecurityCertification> = [
    {
      title: '供应商信息',
      key: 'supplier',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.supplierName}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>编号: {record.supplierCode}</div>
        </div>
      ),
    },
    {
      title: '认证类型',
      dataIndex: 'certificationType',
      key: 'certificationType',
      width: 150,
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    {
      title: '认证等级',
      dataIndex: 'certificationLevel',
      key: 'certificationLevel',
      width: 100,
      render: (level: string) => {
        const colorMap = { A: 'gold', B: 'blue', C: 'default' };
        return <Tag color={colorMap[level as keyof typeof colorMap]}>{level}级</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusMap = {
          applying: { color: 'processing', text: '申请中' },
          reviewing: { color: 'warning', text: '审核中' },
          certified: { color: 'success', text: '已认证' },
          expired: { color: 'error', text: '已过期' },
          rejected: { color: 'error', text: '已拒绝' }
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
          high: { color: 'red', text: '高风险' }
        };
        const config = riskMap[risk as keyof typeof riskMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '安全评分',
      dataIndex: 'securityScore',
      key: 'securityScore',
      width: 120,
      render: (score: number) => (
        <div>
          <Progress 
            percent={score} 
            size="small" 
            status={score >= 90 ? 'success' : score >= 70 ? 'normal' : 'exception'}
            showInfo={false}
          />
          <span style={{ fontSize: '12px', marginLeft: 8 }}>{score}分</span>
        </div>
      )
    },
    {
      title: '申请日期',
      dataIndex: 'applicationDate',
      key: 'applicationDate',
      width: 120,
    },
    {
      title: '有效期至',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date: string) => date || '-'
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
          {record.status === 'applying' && (
            <Button type="link" size="small" danger>
              审核
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleSubmit = (values: any) => {
    console.log('新建认证申请:', values);
    setModalVisible(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="供应安全认证管理" extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          新建认证申请
        </Button>
      }>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索供应商名称或编号"
            onSearch={(value) => console.log('搜索:', value)}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          <Select placeholder="认证类型" style={{ width: 150 }}>
            <Option value="supply_chain">供应链安全认证</Option>
            <Option value="confidentiality">保密资质认证</Option>
            <Option value="quality">质量安全认证</Option>
          </Select>
          <Select placeholder="状态" style={{ width: 120 }}>
            <Option value="applying">申请中</Option>
            <Option value="reviewing">审核中</Option>
            <Option value="certified">已认证</Option>
            <Option value="expired">已过期</Option>
          </Select>
          <Select placeholder="风险等级" style={{ width: 120 }}>
            <Option value="low">低风险</Option>
            <Option value="medium">中风险</Option>
            <Option value="high">高风险</Option>
          </Select>
        </Space>

        <Alert
          message="安全认证提醒"
          description="共有 2 个供应商的安全认证将在 30 天内到期，请及时安排续期审核。"
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

      {/* 新建认证申请模态框 */}
      <Modal
        title="新建安全认证申请"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="supplierName" label="供应商名称" rules={[{ required: true }]}>
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          
          <Form.Item name="supplierCode" label="供应商编号" rules={[{ required: true }]}>
            <Input placeholder="请输入供应商编号" />
          </Form.Item>

          <Form.Item name="certificationType" label="认证类型" rules={[{ required: true }]}>
            <Select placeholder="选择认证类型">
              <Option value="supply_chain">供应链安全认证</Option>
              <Option value="confidentiality">保密资质认证</Option>
              <Option value="quality">质量安全认证</Option>
            </Select>
          </Form.Item>

          <Form.Item name="certificationLevel" label="申请等级" rules={[{ required: true }]}>
            <Select placeholder="选择认证等级">
              <Option value="A">A级</Option>
              <Option value="B">B级</Option>
              <Option value="C">C级</Option>
            </Select>
          </Form.Item>

          <Form.Item name="applicationDate" label="申请日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="认证申请备注" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SafetyCertificateOutlined />}>
                提交申请
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
        title="安全认证详情"
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
          <div>
            <Descriptions column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="供应商名称" span={2}>
                {selectedRecord.supplierName}
              </Descriptions.Item>
              <Descriptions.Item label="供应商编号">
                {selectedRecord.supplierCode}
              </Descriptions.Item>
              <Descriptions.Item label="认证类型">
                <Tag color="blue">{selectedRecord.certificationType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="认证等级">
                <Tag color="gold">{selectedRecord.certificationLevel}级</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color="success">已认证</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="风险等级">
                <Tag color="green">低风险</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="安全评分">
                <Progress percent={selectedRecord.securityScore} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="申请日期">
                {selectedRecord.applicationDate}
              </Descriptions.Item>
              <Descriptions.Item label="认证日期">
                {selectedRecord.certificationDate || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="有效期至">
                {selectedRecord.expiryDate || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="审核人员">
                {selectedRecord.auditor}
              </Descriptions.Item>
            </Descriptions>

            <Card title="认证文档" size="small" style={{ marginBottom: 16 }}>
              <Space wrap>
                {selectedRecord.documents.map((doc, index) => (
                  <Tag key={index} icon={<CheckCircleOutlined />} color="green">
                    {doc}
                  </Tag>
                ))}
              </Space>
            </Card>

            <Card title="认证流程" size="small">
              <Timeline>
                <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                  <div>
                    <strong>申请提交</strong>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      {selectedRecord.applicationDate} - 供应商提交认证申请
                    </div>
                  </div>
                </Timeline.Item>
                <Timeline.Item color="blue" dot={<ExclamationCircleOutlined />}>
                  <div>
                    <strong>材料审核</strong>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      审核认证材料的完整性和有效性
                    </div>
                  </div>
                </Timeline.Item>
                <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                  <div>
                    <strong>现场审核</strong>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      实地检查供应商安全管理体系
                    </div>
                  </div>
                </Timeline.Item>
                <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                  <div>
                    <strong>认证通过</strong>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      {selectedRecord.certificationDate} - 颁发安全认证证书
                    </div>
                  </div>
                </Timeline.Item>
              </Timeline>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SecurityCertification;
