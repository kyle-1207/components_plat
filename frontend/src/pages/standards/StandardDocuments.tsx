import React, { useState } from 'react';
import { Card, Table, Input, Button, Space, Tag, Modal, Descriptions } from 'antd';
import { SearchOutlined, EyeOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';

const { Search } = Input;

interface StandardDocument {
  id: string;
  code: string;
  title: string;
  category: string;
  status: string;
  publishDate: string;
  effectiveDate: string;
  organization: string;
  pages: number;
  downloadCount: number;
}

const StandardDocuments: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<StandardDocument | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 模拟数据
  const mockData: StandardDocument[] = [
    {
      id: '1',
      code: 'GJB 548C-2005',
      title: '微电子器件试验方法和程序',
      category: '可靠性标准',
      status: '现行有效',
      publishDate: '2005-12-01',
      effectiveDate: '2006-06-01',
      organization: '国防科工委',
      pages: 856,
      downloadCount: 2341
    },
    {
      id: '2',
      code: 'GJB 362A-1997',
      title: '电子设备可靠性预计手册',
      category: '可靠性标准',
      status: '现行有效',
      publishDate: '1997-08-01',
      effectiveDate: '1998-01-01',
      organization: '国防科工委',
      pages: 432,
      downloadCount: 1876
    },
    {
      id: '3',
      code: 'QJ 2438-1992',
      title: '航天用电子元器件选用控制要求',
      category: '选用标准',
      status: '现行有效',
      publishDate: '1992-05-01',
      effectiveDate: '1992-10-01',
      organization: '航天部',
      pages: 124,
      downloadCount: 3456
    }
  ];

  const [data, setData] = useState<StandardDocument[]>(mockData);

  const columns = [
    {
      title: '标准编号',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text: string) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{text}</span>
      ),
    },
    {
      title: '标准名称',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === '现行有效' ? 'green' : 'orange'}>{status}</Tag>
      ),
    },
    {
      title: '发布日期',
      dataIndex: 'publishDate',
      key: 'publishDate',
      width: 120,
    },
    {
      title: '页数',
      dataIndex: 'pages',
      key: 'pages',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '下载次数',
      dataIndex: 'downloadCount',
      key: 'downloadCount',
      width: 100,
      align: 'center' as const,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: StandardDocument) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedDocument(record);
              setModalVisible(true);
            }}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            下载
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setLoading(true);
    // 模拟搜索
    setTimeout(() => {
      if (value) {
        const filtered = mockData.filter(item =>
          item.code.toLowerCase().includes(value.toLowerCase()) ||
          item.title.toLowerCase().includes(value.toLowerCase())
        );
        setData(filtered);
      } else {
        setData(mockData);
      }
      setLoading(false);
    }, 500);
  };

  const handleDownload = (document: StandardDocument) => {
    // 模拟下载
    Modal.success({
      title: '下载成功',
      content: `标准文档 ${document.code} 已开始下载`,
    });
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Search
              placeholder="输入标准编号或名称搜索"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              style={{ width: 400 }}
            />
            <Button type="primary" icon={<FileTextOutlined />}>
              标准申请
            </Button>
          </Space>
        </div>

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
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="标准文档详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            下载文档
          </Button>,
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedDocument && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="标准编号">
              {selectedDocument.code}
            </Descriptions.Item>
            <Descriptions.Item label="标准名称">
              {selectedDocument.title}
            </Descriptions.Item>
            <Descriptions.Item label="类别">
              <Tag color="blue">{selectedDocument.category}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedDocument.status === '现行有效' ? 'green' : 'orange'}>
                {selectedDocument.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="发布日期">
              {selectedDocument.publishDate}
            </Descriptions.Item>
            <Descriptions.Item label="生效日期">
              {selectedDocument.effectiveDate}
            </Descriptions.Item>
            <Descriptions.Item label="发布机构">
              {selectedDocument.organization}
            </Descriptions.Item>
            <Descriptions.Item label="页数">
              {selectedDocument.pages} 页
            </Descriptions.Item>
            <Descriptions.Item label="下载次数" span={2}>
              {selectedDocument.downloadCount} 次
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default StandardDocuments;
