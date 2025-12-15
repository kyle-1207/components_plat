import React, { useEffect, useMemo, useState } from 'react';
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
import httpClient from '@/utils/httpClient';

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
  category?: string[];
}

const formatDate = (value?: string) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  // 仅展示年月日
  return d.toISOString().slice(0, 10);
};

const StandardQuery: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);
  const [form] = Form.useForm();
  const [milCategories, setMilCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const handleSearch = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    categoryOverride?: string,
  ) => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      const effectiveCategory = categoryOverride ?? selectedCategory;
      const usp = new URLSearchParams();
      usp.set('standardType', 'MIL');
      usp.set('page', String(page));
      usp.set('limit', String(pageSize));
      if (values.keyword) usp.set('keyword', values.keyword);
      if (values.standardCode) usp.set('standardCode', values.standardCode);
      if (values.status) usp.set('status', values.status);
      if (values.year) usp.set('year', values.year);
      if (effectiveCategory) usp.set('category', effectiveCategory);

      const url = `/api/standards/search?${usp.toString()}`;

      // 调试：打印请求参数
      // eslint-disable-next-line no-console
      console.log('[StandardQuery] handleSearch url:', url);

      const dataBlock = await httpClient.get<any>(url);
      // 兼容多层 data 包装（httpClient 已返回 data 字段，这里再兜底一次）
      const items =
        dataBlock?.items ??
        dataBlock?.standards ??
        [];
      const pag = dataBlock?.pagination ?? {};
      const current =
        pag.page ??
        pag.current ??
        pag.pageIndex ??
        pagination.current ??
        page;
      const derivedPageSize =
        pag.limit ??
        pag.pageSize ??
        pag.size ??
        pagination.pageSize ??
        pageSize;
      const total =
        pag.total ??
        pag.count ??
        pag.totalItems ??
        pag.totalCount ??
        items.length;

      // 调试：打印返回分页信息
      // eslint-disable-next-line no-console
      console.log(
        '[StandardQuery] handleSearch result:',
        {
          effectiveCategory,
          page: current,
          pageSize: derivedPageSize,
          total,
          itemsLength: items.length,
        },
      );

      setStandards(items);
      setPagination({
        current,
        pageSize: derivedPageSize,
        total,
      });
    } catch (error) {
      console.error('标准搜索失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setStandards([]);
    setSelectedCategory(undefined);
    setPagination({ current: 1, pageSize: 10, total: 0 });
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
      width: 200,
      ellipsis: false,
      render: (text: string, record: Standard) => (
        <Button
          type="link"
          style={{ padding: 0, whiteSpace: 'normal', textAlign: 'left' }}
          onClick={() => showDetail(record)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: '标准名称',
      dataIndex: 'title',
      key: 'title',
      width: 320,
      ellipsis: true,
      render: (text: string) => (
        <span style={{ whiteSpace: 'normal' }}>
          {text}
        </span>
      ),
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
      render: (val: string) => formatDate(val),
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 120,
      render: (val: string) => formatDate(val),
    },
    {
      title: '查看次数',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      render: (count: number | undefined) =>
        typeof count === 'number' ? count.toLocaleString() : count ?? '-',
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

  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get<any>('/api/standards/categories', { params: { standardType: 'MIL' } });
        const list = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
        setMilCategories(list);
      } catch (err) {
        console.error('获取标准类别失败', err);
      }
    })();
  }, []);

  // 标准分类树
  const standardTreeData = useMemo(() => {
    const milChildren = milCategories.map((c) => ({
      title: c,
      key: c,
      selectable: true,
    }));
    return [
      {
        title: '美军标准 (MIL)',
        key: 'MIL',
        icon: <GlobalOutlined />,
        selectable: false,
        children: milChildren,
      },
      {
        title: '欧洲标准 (ESCC)',
        key: 'ESCC',
        icon: <GlobalOutlined />,
        selectable: false,
        disabled: true,
      },
      {
        title: '国际标准 (ISO/IEC)',
        key: 'ISO/IEC',
        icon: <GlobalOutlined />,
        selectable: false,
        disabled: true,
      },
      {
        title: '国军标 (GJB)',
        key: 'GJB',
        icon: <GlobalOutlined />,
        selectable: false,
        disabled: true,
      },
    ];
  }, [milCategories]);

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
                const key = selectedKeys[0] as string | undefined;
                if (!key) return;
                const cat = String(key);
                // 调试：打印树选择
                // eslint-disable-next-line no-console
                console.log('[StandardQuery] Tree select:', cat);
                setSelectedCategory(cat);
                handleSearch(1, pagination.pageSize, cat);
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
                  <Form.Item label="标准类型" name="standardType" initialValue="MIL">
                    <Select disabled>
                      <Option value="MIL">美军标准 (MIL)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="状态" name="status">
                    <Select placeholder="选择状态" allowClear>
                      <Option value="active">现行</Option>
                      <Option value="withdrawn">废止</Option>
                      <Option value="superseded">被替代</Option>
                      <Option value="draft">草案</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="标准名称关键词" name="keyword">
                    <Input placeholder="输入标准名称关键词" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="发布年份" name="year">
                    <Select placeholder="选择年份" allowClear>
                      <Option value="2023">2023</Option>
                      <Option value="2022">2022</Option>
                      <Option value="2021">2021</Option>
                      <Option value="2020">2020</Option>
                      <Option value="2019">2019</Option>
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
            <Card title={`搜索结果 (${pagination.total || standards.length})`} style={{ marginTop: 16 }}>
              <Table
                columns={columns}
                dataSource={standards}
                rowKey={(record: any) => record.id || record._id || record.standardCode}
                loading={loading}
                scroll={{ x: 900 }}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  onChange: (page, pageSize) => handleSearch(page, pageSize),
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
