import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { premiumProductAPI } from '@/services/api';
import type { PremiumProduct } from '@/types';

const { Search } = Input;

interface FilterState {
  keyword: string;
  categories: string[];
  qualityLevels: string[];
  priceMin?: number;
  priceMax?: number;
  isPromotedOnly: boolean;
  hasFlightHistoryOnly: boolean;
}

const defaultFilters: FilterState = {
  keyword: '',
  categories: [],
  qualityLevels: [],
  priceMin: undefined,
  priceMax: undefined,
  isPromotedOnly: false,
  hasFlightHistoryOnly: false,
};

const PremiumProducts: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PremiumProduct[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [qualityOptions, setQualityOptions] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<PremiumProduct | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const fetchProducts = async (page = pagination.page, limit = pagination.limit) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        limit,
      };
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.categories.length) params.category = filters.categories;
      if (filters.qualityLevels.length) params.qualityLevel = filters.qualityLevels;
      if (filters.priceMin !== undefined) params.priceMin = filters.priceMin;
      if (filters.priceMax !== undefined) params.priceMax = filters.priceMax;
      if (filters.isPromotedOnly) params.isPromoted = true;
      if (filters.hasFlightHistoryOnly) params.hasFlightHistory = true;

      const response = await premiumProductAPI.list(params);
      setData(response.data);
      setPagination({
        page: response.pagination?.page ?? page,
        limit: response.pagination?.limit ?? limit,
        total: response.pagination?.total ?? response.data.length,
      });

      // 动态生成筛选选项
      setCategoryOptions((prev) => {
        const merged = new Set(prev);
        response.data.forEach((item) => merged.add(item.category));
        return Array.from(merged).filter(Boolean);
      });
      setQualityOptions((prev) => {
        const merged = new Set(prev);
        response.data.forEach((item) => {
          if (item.qualityLevel) merged.add(item.qualityLevel);
        });
        return Array.from(merged).filter(Boolean);
      });
    } catch (error) {
      console.error(error);
      message.error('加载优质产品列表失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDatasheet = (product: PremiumProduct) => {
    if (!product.datasheetPath) {
      message.info('该产品暂未上传数据手册');
      return;
    }
    window.open(`/api/premium-products/${product._id}/datasheet`, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchProducts(1);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    fetchProducts(1);
  };

  const formatRange = (range?: { min?: number; max?: number; unit?: string }) => {
    if (!range) return '--';
    const min = range.min ?? range.minWeeks;
    const max = range.max ?? range.maxWeeks;
    if (min === undefined && max === undefined) return '--';
    if (min !== undefined && max !== undefined && min === max) {
      return `${min}${range.unit ?? ''}`;
    }
    return `${min ?? '≤'} ~ ${max ?? '≥'}${range.unit ?? ''}`;
  };

  const tableColumns: ColumnsType<PremiumProduct> = useMemo(
    () => [
      {
        title: '产品名称',
        dataIndex: 'productName',
        key: 'productName',
        width: 180,
        fixed: 'left',
        render: (text, record) => (
          <Space direction="vertical" size={0}>
            <Space>
              {record.isPromoted ? (
                <Tooltip title="主推产品">
                  <StarFilled style={{ color: '#faad14' }} />
                </Tooltip>
              ) : (
                <StarOutlined style={{ color: '#d9d9d9' }} />
              )}
              <Typography.Text strong>{text}</Typography.Text>
            </Space>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.premiumCode || '--'}
            </Typography.Text>
          </Space>
        ),
      },
      {
        title: '型号规格',
        dataIndex: 'modelSpec',
        key: 'modelSpec',
        width: 180,
      },
      {
        title: '分类',
        dataIndex: 'category',
        key: 'category',
        width: 140,
      },
      {
        title: '关键性能',
        dataIndex: 'keyFunctions',
        key: 'keyFunctions',
        width: 200,
        render: (items) => {
          if (!Array.isArray(items) || !items.length) return '--';
          return (
            <Typography.Paragraph ellipsis={{ rows: 2, expandable: false }}>
              {items.map((item) => item.value).join(' / ')}
            </Typography.Paragraph>
          );
        },
      },
      {
        title: '工作温度范围',
        key: 'temperatureRange',
        width: 140,
        render: (_, record) => formatRange(record.temperatureRange),
      },
      {
        title: '抗辐照指标',
        dataIndex: 'radiationMetrics',
        key: 'radiationMetrics',
        width: 200,
        render: (metrics) =>
          metrics ? (
            <Typography.Paragraph ellipsis={{ rows: 2, expandable: false }}>
              {metrics.tid && `TID: ${metrics.tid}`}
              {metrics.tid && metrics.sel && ' / '}
              {metrics.sel && `SEL: ${metrics.sel}`}
            </Typography.Paragraph>
          ) : (
            '--'
          ),
      },
      {
        title: '封装形式',
        dataIndex: 'packageType',
        key: 'packageType',
        width: 130,
      },
      {
        title: '质量等级',
        dataIndex: 'qualityLevel',
        key: 'qualityLevel',
        width: 130,
        render: (level?: string) => (level ? <Tag color="blue">{level}</Tag> : '--'),
      },
      {
        title: '参考价格（元）',
        key: 'priceRange',
        width: 150,
        render: (_, record) => {
          if (!record.priceRange || (record.priceRange.min === undefined && record.priceRange.max === undefined)) {
            return '--';
          }
          const { min, max } = record.priceRange;
          if (min !== undefined && max !== undefined && min === max) {
            return `${min} 元`;
          }
          return `${min ?? '≤'} ~ ${max ?? '≥'} 元`;
        },
      },
      {
        title: '供货周期（周）',
        key: 'leadTimeRange',
        width: 150,
        render: (_, record) => formatRange(record.leadTimeRange),
      },
      {
        title: '航天供货经历',
        key: 'flightHistory',
        width: 180,
        render: (_, record) => {
          const hasFlight = record.flightHistory?.hasFlightHistory || Boolean(record.flightHistory?.description);
          const description = record.flightHistory?.description?.replace(/\r?\n/g, ' ');
          return (
            <Space align="start">
              <Badge status={hasFlight ? 'success' : 'default'} />
              <Space direction="vertical" size={0}>
                <Typography.Text strong style={{ color: hasFlight ? '#389e0d' : undefined }}>
                  {hasFlight ? '已有执行' : '暂未执行'}
                </Typography.Text>
                {hasFlight && description && (
                  <Typography.Text type="secondary" ellipsis style={{ maxWidth: 120 }}>
                    {description}
                  </Typography.Text>
                )}
              </Space>
            </Space>
          );
        },
      },
      {
        title: '联系人',
        dataIndex: 'contact',
        key: 'contact',
        width: 180,
        render: (contact) => contact?.name || contact?.remark || '--',
      },
      {
        title: '操作',
        key: 'actions',
        width: 120,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Button
              type="link"
              onClick={() => {
                setSelectedProduct(record);
                setDrawerVisible(true);
              }}
            >
              查看详情
            </Button>
            {record.datasheetPath && (
              <Button type="link" onClick={() => handleOpenDatasheet(record)}>
                查看手册
              </Button>
            )}
          </Space>
        ),
      },
    ],
    [pagination.page, filters],
  );

  const handleTableChange = (pageInfo: { current?: number; pageSize?: number }) => {
    const nextPage = pageInfo.current ?? pagination.page;
    const nextSize = pageInfo.pageSize ?? pagination.limit;
    setPagination((prev) => ({ ...prev, page: nextPage, limit: nextSize }));
    fetchProducts(nextPage, nextSize);
  };

  const filterBar = (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Search
          allowClear
            placeholder="产品名称 / 型号规格关键字"
            value={filters.keyword}
            onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
            onSearch={handleSearch}
          />
        </Col>
        <Col xs={24} md={8}>
          <Select
            mode="multiple"
            allowClear
            placeholder="元器件分类"
            style={{ width: '100%' }}
            value={filters.categories}
            onChange={(value) => setFilters((prev) => ({ ...prev, categories: value }))}
            options={categoryOptions.map((item) => ({ label: item, value: item }))}
          />
        </Col>
        <Col xs={24} md={8}>
          <Select
            mode="multiple"
            allowClear
            placeholder="质量等级"
            style={{ width: '100%' }}
            value={filters.qualityLevels}
            onChange={(value) => setFilters((prev) => ({ ...prev, qualityLevels: value }))}
            options={qualityOptions.map((item) => ({ label: item, value: item }))}
          />
        </Col>
        <Col xs={24} md={12}>
          <Space align="baseline">
            <span>价格区间 (元)：</span>
            <InputNumber
              min={0}
              value={filters.priceMin}
              placeholder="最低"
              onChange={(value) => setFilters((prev) => ({ ...prev, priceMin: value ?? undefined }))}
            />
            <span>-</span>
            <InputNumber
              min={0}
              value={filters.priceMax}
              placeholder="最高"
              onChange={(value) => setFilters((prev) => ({ ...prev, priceMax: value ?? undefined }))}
            />
          </Space>
        </Col>
        <Col xs={24} md={12}>
          <Space wrap>
            <Space>
              <Switch
                checked={filters.isPromotedOnly}
                onChange={(checked) => setFilters((prev) => ({ ...prev, isPromotedOnly: checked }))}
              />
              <span>仅看主推产品</span>
            </Space>
            <Space>
              <Switch
                checked={filters.hasFlightHistoryOnly}
                onChange={(checked) => setFilters((prev) => ({ ...prev, hasFlightHistoryOnly: checked }))}
              />
              <span>仅看有航天经历</span>
            </Space>
            <Button type="primary" onClick={handleSearch}>
              查询
            </Button>
            <Button onClick={resetFilters}>重置</Button>
            <Button icon={<ReloadOutlined />} onClick={() => fetchProducts(pagination.page, pagination.limit)}>
              刷新
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  return (
    <>
      <Typography.Title level={4}>优质产品管理</Typography.Title>
      <Typography.Paragraph type="secondary">
        搜索、筛选并查看经过认证的优质元器件，支持一键查看性能指标、辐照能力以及商务信息。
      </Typography.Paragraph>

      {filterBar}

      <Card styles={{ body: { padding: 0 } }}>
        <Table<PremiumProduct>
          rowKey={(record) => record._id}
          loading={loading}
          columns={tableColumns}
          dataSource={data}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Drawer
        title={selectedProduct?.productName}
        width={560}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedProduct ? (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="型号规格">{selectedProduct.modelSpec}</Descriptions.Item>
              <Descriptions.Item label="元器件分类">{selectedProduct.category}</Descriptions.Item>
              <Descriptions.Item label="质量等级">{selectedProduct.qualityLevel || '--'}</Descriptions.Item>
              <Descriptions.Item label="封装形式">{selectedProduct.packageType || '--'}</Descriptions.Item>
              <Descriptions.Item label="工作温度范围">{formatRange(selectedProduct.temperatureRange)}</Descriptions.Item>
              <Descriptions.Item label="抗辐照指标">
                {selectedProduct.radiationMetrics?.remark ||
                  [
                    selectedProduct.radiationMetrics?.tid && `TID: ${selectedProduct.radiationMetrics?.tid}`,
                    selectedProduct.radiationMetrics?.sel && `SEL: ${selectedProduct.radiationMetrics?.sel}`,
                  ]
                    .filter(Boolean)
                    .join(' / ') ||
                  '--'}
              </Descriptions.Item>
              <Descriptions.Item label="参考价格（元）">
                {selectedProduct.priceRange?.min ?? '--'} ~ {selectedProduct.priceRange?.max ?? '--'}
              </Descriptions.Item>
              <Descriptions.Item label="供货周期（周）">{formatRange(selectedProduct.leadTimeRange)}</Descriptions.Item>
              <Descriptions.Item label="航天供货经历">
                <Space direction="vertical">
                  <Badge
                    status={
                      selectedProduct.flightHistory?.hasFlightHistory || selectedProduct.flightHistory?.description
                        ? 'success'
                        : 'default'
                    }
                    text={
                      selectedProduct.flightHistory?.hasFlightHistory || selectedProduct.flightHistory?.description
                        ? '已有执行'
                        : '暂无记录'
                    }
                  />
                  {selectedProduct.flightHistory?.description && (
                    <Typography.Text type="secondary">
                      {selectedProduct.flightHistory.description.replace(/\r?\n/g, ' ')}
                    </Typography.Text>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="联系人">{selectedProduct.contact?.name || selectedProduct.contact?.remark || '--'}</Descriptions.Item>
              <Descriptions.Item label="数据来源">{selectedProduct.dataSource || '--'}</Descriptions.Item>
              <Descriptions.Item label="数据手册">
                {selectedProduct.datasheetPath ? (
                  <Button type="link" onClick={() => handleOpenDatasheet(selectedProduct)}>
                    查看手册
                  </Button>
                ) : (
                  '--'
                )}
              </Descriptions.Item>
            </Descriptions>

            <Card title="关键功能指标" style={{ marginTop: 16 }}>
              {selectedProduct.keyFunctions?.length ? (
                selectedProduct.keyFunctions.map((item) => (
                  <Typography.Paragraph key={item.name}>
                    <Typography.Text strong>{item.name}：</Typography.Text>
                    {item.value} {item.unit}
                  </Typography.Paragraph>
                ))
              ) : (
                <Typography.Text type="secondary">暂无数据</Typography.Text>
              )}
            </Card>
          </>
        ) : (
          <Typography.Text type="secondary">请选择一条记录查看详细信息</Typography.Text>
        )}
      </Drawer>
    </>
  );
};

export default PremiumProducts;


