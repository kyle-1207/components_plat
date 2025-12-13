import React, { useState } from 'react';
import { Card, Table, Button, Input, Select, Space, Tag, Modal, Descriptions } from 'antd';
import { SearchOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;

interface FunctionalUnit {
  id: string;
  name: string;
  category: string;
  description: string;
  components: string[];
  applications: string[];
  status: 'verified' | 'testing' | 'draft';
  version: string;
  author: string;
  createDate: string;
}

const FunctionalUnits: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<FunctionalUnit | null>(null);

  const mockData: FunctionalUnit[] = [
    {
      id: '1',
      name: '电源管理单元',
      category: '电源模块',
      description: '提供多路稳定电源输出的功能单元',
      components: ['LM2596', 'LM317', '电容', '电感'],
      applications: ['卫星电源系统', '载荷电源'],
      status: 'verified',
      version: 'v1.2',
      author: '张工程师',
      createDate: '2024-01-10'
    },
    {
      id: '2',
      name: '信号调理电路',
      category: '信号处理',
      description: '对传感器信号进行放大、滤波处理',
      components: ['OP07', '滤波电容', '精密电阻'],
      applications: ['温度监测', '压力检测'],
      status: 'testing',
      version: 'v1.0',
      author: '李工程师',
      createDate: '2024-01-08'
    }
  ];

  const columns: ColumnsType<FunctionalUnit> = [
    {
      title: '功能单元名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          verified: { color: 'green', text: '已验证' },
          testing: { color: 'orange', text: '测试中' },
          draft: { color: 'default', text: '草案' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate',
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
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Button type="link" size="small" icon={<DownloadOutlined />}>
            下载
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewDetail = (unit: FunctionalUnit) => {
    setSelectedUnit(unit);
    setDetailVisible(true);
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="功能单元库">
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索功能单元名称"
            onSearch={(value) => console.log('搜索:', value)}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          <Select placeholder="选择类别" style={{ width: 150 }}>
            <Option value="power">电源模块</Option>
            <Option value="signal">信号处理</Option>
            <Option value="control">控制模块</Option>
            <Option value="communication">通信模块</Option>
          </Select>
          <Select placeholder="状态" style={{ width: 120 }}>
            <Option value="verified">已验证</Option>
            <Option value="testing">测试中</Option>
            <Option value="draft">草案</Option>
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
            total: 50,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title="功能单元详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={800}
        footer={[
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            下载设计文件
          </Button>,
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedUnit && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="单元名称" span={2}>
              {selectedUnit.name}
            </Descriptions.Item>
            <Descriptions.Item label="类别">
              {selectedUnit.category}
            </Descriptions.Item>
            <Descriptions.Item label="版本">
              {selectedUnit.version}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedUnit.status === 'verified' ? 'green' : 'orange'}>
                {selectedUnit.status === 'verified' ? '已验证' : '测试中'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建者">
              {selectedUnit.author}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {selectedUnit.description}
            </Descriptions.Item>
            <Descriptions.Item label="组成器件" span={2}>
              {selectedUnit.components.map(comp => (
                <Tag key={comp} style={{ margin: '0 4px 4px 0' }}>{comp}</Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="应用场景" span={2}>
              {selectedUnit.applications.map(app => (
                <Tag key={app} color="blue" style={{ margin: '0 4px 4px 0' }}>{app}</Tag>
              ))}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default FunctionalUnits;
