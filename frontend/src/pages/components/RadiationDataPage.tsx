import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { DownloadOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { radiationDataAPI } from '@/services/api';
import type {
  RadiationDataListResponse,
  RadiationDataRecord,
  RadiationFilterOptions,
} from '@/types';
import { downloadCSV } from '@/utils/parameterUtils';

const { Title, Paragraph, Text } = Typography;

const DEFAULT_PAGE_SIZE = 20;

// 上标字符映射
const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
};

// 将数字转换为上标
const toSuperscript = (text: string): string => {
  return text
    .split('')
    .map((char) => SUPERSCRIPT_MAP[char] || char)
    .join('');
};

// 格式化科学记数法，将 10^3 或 103 转换为 10³
const formatScientificNotation = (value: string | undefined | null): React.ReactNode => {
  if (!value) return '--';
  
  const str = String(value);
  
  // 匹配模式：1×10^3 或 1×103 或 1×10³
  // 也匹配：1x10^3, 1*10^3 等变体
  // 将 10^3 或 103 转换为 10³
  // 注意：如果已经是上标格式（如10³），则不会匹配，保持原样
  const formatted = str.replace(/(\d+(?:\.\d+)?)\s*[×xX*]\s*10\^?(\d+)/g, (_match, base, exp) => {
    const superscript = toSuperscript(exp);
    return `${base}×10${superscript}`;
  });
  
  return <span style={{ fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{formatted}</span>;
};

const columnDefinitions: ColumnsType<RadiationDataRecord> = [
  {
    title: '产品类别',
    dataIndex: 'category',
    key: 'category',
    width: 160,
    render: (value: string) => <Tag color="blue">{value}</Tag>,
  },
  {
    title: '产品细类',
    dataIndex: 'subcategory',
    key: 'subcategory',
    width: 160,
  },
  {
    title: '产品名称',
    dataIndex: 'product_name',
    key: 'product_name',
    width: 200,
  },
  {
    title: '型号规格',
    dataIndex: 'model_spec',
    key: 'model_spec',
    width: 200,
  },
  {
    title: '封装形式',
    dataIndex: 'package',
    key: 'package',
    width: 140,
  },
  {
    title: '总剂量',
    dataIndex: 'total_dose',
    key: 'total_dose',
    width: 160,
    render: (value: string) => formatScientificNotation(value),
  },
  {
    title: '单粒子',
    dataIndex: 'single_event',
    key: 'single_event',
    width: 160,
    render: (value: string) => formatScientificNotation(value),
  },
  {
    title: '位移',
    dataIndex: 'displacement',
    key: 'displacement',
    width: 140,
    render: (value: string) => formatScientificNotation(value),
  },
  {
    title: '抗静电能力',
    dataIndex: 'esd_rating',
    key: 'esd_rating',
    width: 140,
  },
  {
    title: '质量等级',
    dataIndex: 'quality_grade',
    key: 'quality_grade',
    width: 140,
    render: (value: string) =>
      value ? (
        <Tag color="purple" style={{ minWidth: 80, textAlign: 'center' }}>
          {value}
        </Tag>
      ) : (
        '--'
      ),
  },
  {
    title: '供应商',
    dataIndex: 'supplier',
    key: 'supplier',
    width: 200,
  },
  {
    title: '通用规范',
    dataIndex: 'general_spec',
    key: 'general_spec',
    width: 200,
  },
  {
    title: '详细规范',
    dataIndex: 'detail_spec',
    key: 'detail_spec',
    width: 200,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 240,
    ellipsis: true,
  },
];

const RadiationDataPage: React.FC = () => {
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [options, setOptions] = useState<RadiationFilterOptions>({
    categories: [],
    subcategories: [],
    qualityGrades: [],
    suppliers: [],
  });
  const [listResponse, setListResponse] = useState<RadiationDataListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentParams = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (value) {
        params[key] = value;
      }
    });
    return params;
  }, [searchParams]);

  const initialFormValues = useMemo(
    () => ({
      keyword: currentParams.keyword,
      category: currentParams.category,
      subcategory: currentParams.subcategory,
      supplier: currentParams.supplier,
      qualityGrade: currentParams.qualityGrade,
      totalDoseMin: currentParams.totalDoseMin ? Number(currentParams.totalDoseMin) : undefined,
      totalDoseMax: currentParams.totalDoseMax ? Number(currentParams.totalDoseMax) : undefined,
      singleEventMin: currentParams.singleEventMin
        ? Number(currentParams.singleEventMin)
        : undefined,
      singleEventMax: currentParams.singleEventMax
        ? Number(currentParams.singleEventMax)
        : undefined,
    }),
    [currentParams]
  );

  useEffect(() => {
    form.setFieldsValue(initialFormValues);
  }, [form, initialFormValues]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const response = await radiationDataAPI.getFilters();
        if (response.success) {
          setOptions(response.data);
        }
      } catch (err) {
        console.warn('获取筛选选项失败', err);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await radiationDataAPI.list({
          page: currentParams.page,
          limit: currentParams.limit,
          keyword: currentParams.keyword,
          category: currentParams.category,
          subcategory: currentParams.subcategory,
          supplier: currentParams.supplier,
          qualityGrade: currentParams.qualityGrade,
          totalDoseMin: currentParams.totalDoseMin,
          totalDoseMax: currentParams.totalDoseMax,
          singleEventMin: currentParams.singleEventMin,
          singleEventMax: currentParams.singleEventMax,
          sortField: currentParams.sortField,
          sortOrder: currentParams.sortOrder,
        });

        if (response.success) {
          setListResponse(response.data);
        } else {
          setError(response.message || '数据获取失败');
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.error?.message || err?.message || '数据获取失败，请稍后重试';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentParams]);

  const updateSearchParams = (next: Record<string, any>) => {
    const merged: Record<string, string> = {
      page: next.page ?? currentParams.page ?? '1',
      limit: next.limit ?? currentParams.limit ?? String(DEFAULT_PAGE_SIZE),
      keyword: next.keyword ?? currentParams.keyword,
      category: next.category ?? currentParams.category,
      subcategory: next.subcategory ?? currentParams.subcategory,
      supplier: next.supplier ?? currentParams.supplier,
      qualityGrade: next.qualityGrade ?? currentParams.qualityGrade,
      totalDoseMin: next.totalDoseMin ?? currentParams.totalDoseMin,
      totalDoseMax: next.totalDoseMax ?? currentParams.totalDoseMax,
      singleEventMin: next.singleEventMin ?? currentParams.singleEventMin,
      singleEventMax: next.singleEventMax ?? currentParams.singleEventMax,
      sortField: next.sortField ?? currentParams.sortField,
      sortOrder: next.sortOrder ?? currentParams.sortOrder,
    };

    Object.keys(merged).forEach((key) => {
      const value = merged[key];
      if (value === undefined || value === null || value === '' || Number.isNaN(value)) {
        delete merged[key];
      } else {
        merged[key] = String(value);
      }
    });

    setSearchParams(merged, { replace: true });
  };

  const handleSearch = (values: Record<string, any>) => {
    updateSearchParams({
      ...values,
      page: '1',
    });
  };

  const handleReset = () => {
    form.resetFields();
    setSearchParams(
      {
        page: '1',
        limit: String(DEFAULT_PAGE_SIZE),
      },
      { replace: true }
    );
  };

  const handleTableChange: TableProps<RadiationDataRecord>['onChange'] = (
    pagination,
    _filters,
    sorter
  ) => {
    const nextParams: Record<string, any> = {
      page: pagination.current,
      limit: pagination.pageSize,
    };

    if (Array.isArray(sorter)) {
      delete nextParams.sortField;
      delete nextParams.sortOrder;
    } else if (sorter && sorter.field && sorter.order) {
      nextParams.sortField = sorter.field;
      nextParams.sortOrder = sorter.order === 'descend' ? 'desc' : 'asc';
    } else {
      nextParams.sortField = undefined;
      nextParams.sortOrder = undefined;
    }

    updateSearchParams(nextParams);
  };

  const handleExport = async () => {
    if (!listResponse?.items?.length) return;
    setExporting(true);
    try {
      const headers = columnDefinitions.map((column) => column.title).filter(Boolean) as string[];
      const rows = listResponse.items.map((item) =>
        columnDefinitions.map((column) => {
          // 检查是否是分组列（没有dataIndex）
          if ('children' in column || !('dataIndex' in column)) {
            return '--';
          }
          const key = column.dataIndex as keyof RadiationDataRecord;
          const value = item[key];
          // 对于科学记数法字段，导出时保持原始格式（不转换上标）
          return value === undefined || value === null ? '--' : String(value);
        })
      );
      const csvLines = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
      ];
      downloadCSV(csvLines.join('\n'), `radiation-data-${dayjs().format('YYYYMMDD-HHmmss')}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const pagination: TablePaginationConfig = {
    current: Number(currentParams.page) || 1,
    pageSize: Number(currentParams.limit) || DEFAULT_PAGE_SIZE,
    total: listResponse?.total || 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  };

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={3} style={{ marginBottom: 8 }}>
            辐照数据查询
          </Title>
          <Paragraph style={{ marginBottom: 0, color: '#475467' }}>
            展示《通用器件辐照数据.xlsx》导入的 1,921 条记录，可按型号、供应商、质量等级等进行筛选。
            数据来自最新一次脚本导入（见 `backend/scripts/import_irradiation_excel.py`）。
          </Paragraph>
          <Paragraph style={{ marginTop: 8 }}>
            <Text type="secondary">
              若 Excel 更新，请重新导入并清除缓存 `radiation:data:*`，即可让页面实时展示最新内容。
            </Text>
          </Paragraph>
        </Card>

        <Card>
          <Form layout="vertical" form={form} onFinish={handleSearch}>
            <Row gutter={16}>
              <Col xs={24} md={12} lg={8}>
                <Form.Item label="关键词" name="keyword">
                  <Input
                    allowClear
                    placeholder="型号 / 规格 / 供应商"
                    prefix={<SearchOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item label="产品类别" name="category">
                  <Select
                    allowClear
                    placeholder="选择类别"
                    options={options.categories.map((value) => ({ label: value, value }))}
                    showSearch
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item label="产品细类" name="subcategory">
                  <Select
                    allowClear
                    placeholder="选择细类"
                    options={options.subcategories.map((value) => ({ label: value, value }))}
                    showSearch
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item label="质量等级" name="qualityGrade">
                  <Select
                    allowClear
                    placeholder="选择等级"
                    options={options.qualityGrades.map((value) => ({ label: value, value }))}
                    showSearch
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item label="供应商" name="supplier">
                  <Select
                    allowClear
                    placeholder="选择供应商"
                    options={options.suppliers.map((value) => ({ label: value, value }))}
                    showSearch
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item label="总剂量范围 (rad)">
                  <Input.Group compact>
                    <Form.Item name="totalDoseMin" noStyle>
                      <InputNumber
                        min={0}
                        placeholder="最小值"
                        style={{ width: '50%' }}
                      />
                    </Form.Item>
                    <Input
                      disabled
                      value="~"
                      style={{ width: 40, textAlign: 'center', background: '#fafafa' }}
                    />
                    <Form.Item name="totalDoseMax" noStyle>
                      <InputNumber
                        min={0}
                        placeholder="最大值"
                        style={{ width: '50%' }}
                      />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item label="单粒子范围 (MeV·cm²/mg)">
                  <Input.Group compact>
                    <Form.Item name="singleEventMin" noStyle>
                      <InputNumber
                        min={0}
                        placeholder="最小值"
                        style={{ width: '50%' }}
                      />
                    </Form.Item>
                    <Input
                      disabled
                      value="~"
                      style={{ width: 40, textAlign: 'center', background: '#fafafa' }}
                    />
                    <Form.Item name="singleEventMax" noStyle>
                      <InputNumber
                        min={0}
                        placeholder="最大值"
                        style={{ width: '50%' }}
                      />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
            </Row>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={exporting}
                disabled={!listResponse?.items?.length}
              >
                导出 CSV
              </Button>
            </Space>
          </Form>
        </Card>

        {error && (
          <Alert
            type="error"
            message="加载失败"
            description={error}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Card>
          <Table<RadiationDataRecord>
            rowKey={(record) => record._id || `${record.product_name}-${record.model}`}
            columns={columnDefinitions}
            dataSource={listResponse?.items || []}
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1800 }}
            locale={{
              emptyText: loading ? (
                '加载中...'
              ) : (
                <Empty description="暂无数据，试试调整筛选条件" />
              ),
            }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default RadiationDataPage;


