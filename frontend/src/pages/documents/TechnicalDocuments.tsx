import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Input, Select, Upload, message } from 'antd';
import { SearchOutlined, EyeOutlined, DownloadOutlined, UploadOutlined, FileTextOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

interface TechnicalDocument {
  id: string;
  title: string;
  category: string;
  type: string;
  component: string;
  version: string;
  author: string;
  publishDate: string;
  status: string;
  downloadCount: number;
  fileSize: string;
  description: string;
}

const TechnicalDocuments: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<TechnicalDocument | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  // 模拟数据
  const mockData: TechnicalDocument[] = [
    {
      id: '1',
      title: 'SiC MOSFET应用设计指南',
      category: '设计指南',
      type: 'PDF',
      component: 'SiC MOSFET',
      version: 'v2.1',
      author: '张工程师',
      publishDate: '2024-01-15',
      status: '最新版本',
      downloadCount: 1245,
      fileSize: '8.5MB',
      description: '详细介绍了SiC MOSFET的设计要点、应用电路和热管理方案'
    },
    {
      id: '2',
      title: 'FPGA器件选型手册',
      category: '选型手册',
      type: 'PDF',
      component: 'FPGA',
      version: 'v1.3',
      author: '李工程师',
      publishDate: '2024-01-10',
      status: '最新版本',
      downloadCount: 892,
      fileSize: '12.3MB',
      description: '涵盖主流FPGA厂商产品对比和选型建议'
    },
    {
      id: '3',
      title: '航天级连接器测试报告',
      category: '测试报告',
      type: 'PDF',
      component: '航空插头',
      version: 'v1.0',
      author: '王工程师',
      publishDate: '2024-01-08',
      status: '最新版本',
      downloadCount: 567,
      fileSize: '15.2MB',
      description: '某型号航天级连接器的环境适应性测试完整报告'
    },
    {
      id: '4',
      title: '功率器件热设计规范',
      category: '设计规范',
      type: 'DOCX',
      component: '功率器件',
      version: 'v3.0',
      author: '赵工程师',
      publishDate: '2023-12-20',
      status: '历史版本',
      downloadCount: 2134,
      fileSize: '4.7MB',
      description: '功率器件散热设计的标准化流程和计算方法'
    }
  ];

  const [data, setData] = useState<TechnicalDocument[]>(mockData);
  const [filteredData, setFilteredData] = useState<TechnicalDocument[]>(mockData);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '最新版本': return 'green';
      case '历史版本': return 'orange';
      case '已废止': return 'red';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: '文档标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{text}</span>
      ),
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
      title: '相关器件',
      dataIndex: 'component',
      key: 'component',
      width: 120,
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
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 100,
    },
    {
      title: '发布日期',
      dataIndex: 'publishDate',
      key: 'publishDate',
      width: 120,
    },
    {
      title: '下载量',
      dataIndex: 'downloadCount',
      key: 'downloadCount',
      width: 100,
      align: 'center' as const,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: TechnicalDocument) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedDoc(record);
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
    if (value) {
      const filtered = data.filter(item =>
        item.title.toLowerCase().includes(value.toLowerCase()) ||
        item.component.toLowerCase().includes(value.toLowerCase()) ||
        item.author.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const handleCategoryFilter = (category: string) => {
    if (category) {
      const filtered = data.filter(item => item.category === category);
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const handleDownload = (document: TechnicalDocument) => {
    message.success(`开始下载文档: ${document.title}`);
    // 模拟更新下载次数
    setData(data.map(item => 
      item.id === document.id 
        ? { ...item, downloadCount: item.downloadCount + 1 }
        : item
    ));
    setFilteredData(filteredData.map(item => 
      item.id === document.id 
        ? { ...item, downloadCount: item.downloadCount + 1 }
        : item
    ));
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: '/api/documents/upload',
    onChange(info: any) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Search
              placeholder="搜索文档标题、器件或作者"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Select
              placeholder="选择文档类别"
              allowClear
              style={{ width: 150 }}
              onChange={handleCategoryFilter}
            >
              <Option value="设计指南">设计指南</Option>
              <Option value="选型手册">选型手册</Option>
              <Option value="测试报告">测试报告</Option>
              <Option value="设计规范">设计规范</Option>
              <Option value="应用笔记">应用笔记</Option>
            </Select>
            <Button 
              type="primary" 
              icon={<UploadOutlined />}
              onClick={() => setUploadModalVisible(true)}
            >
              上传文档
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个文档`,
          }}
        />
      </Card>

      {/* 文档详情模态框 */}
      <Modal
        title="文档详情"
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
        {selectedDoc && (
          <div>
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><strong>文档标题：</strong>{selectedDoc.title}</div>
                <div><strong>文档类别：</strong><Tag color="blue">{selectedDoc.category}</Tag></div>
                <div><strong>相关器件：</strong>{selectedDoc.component}</div>
                <div><strong>文档版本：</strong>{selectedDoc.version}</div>
                <div><strong>作者：</strong>{selectedDoc.author}</div>
                <div><strong>发布日期：</strong>{selectedDoc.publishDate}</div>
                <div><strong>文件大小：</strong>{selectedDoc.fileSize}</div>
                <div><strong>下载次数：</strong>{selectedDoc.downloadCount}</div>
              </div>
              <div style={{ marginTop: 16 }}>
                <strong>状态：</strong>
                <Tag color={getStatusColor(selectedDoc.status)}>{selectedDoc.status}</Tag>
              </div>
            </Card>

            <Card title="文档描述" size="small">
              <p>{selectedDoc.description}</p>
            </Card>
          </div>
        )}
      </Modal>

      {/* 上传文档模态框 */}
      <Modal
        title="上传技术文档"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <FileTextOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持单个或批量上传。支持PDF、DOC、DOCX等格式，单个文件不超过50MB
            </p>
          </Upload.Dragger>
        </div>
      </Modal>
    </div>
  );
};

export default TechnicalDocuments;
