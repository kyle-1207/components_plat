import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Tooltip,
  Modal,
  Descriptions,
  Alert,
  Empty,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  SwapOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { componentService, Component, ComponentFilters } from '@/services/componentService';

const { Option } = Select;

const GlobalSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Component[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ primary: string[]; secondary: { [key: string]: string[] } }>({ primary: [], secondary: {} });

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        const [manufacturersData, categoriesData] = await Promise.all([
          componentService.getManufacturers(),
          componentService.getCategories()
        ]);
        setManufacturers(manufacturersData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };
    
    initializeData();
  }, []);

  // 从URL参数初始化搜索
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    
    if (query || category) {
      form.setFieldsValue({
        query,
        primaryCategory: category === 'model' ? '' : category,
      });
      handleSearch({ query, primaryCategory: category === 'model' ? '' : category });
    } else {
      // 初始显示所有数据
      handleSearch();
    }
  }, [searchParams, form]);

  // 搜索处理
  const handleSearch = async (values?: any) => {
    const searchValues = values || form.getFieldsValue();
    setLoading(true);
    
    try {
      const filters: ComponentFilters = {
        search: searchValues.query || '',
        primaryCategory: searchValues.primaryCategory,
        manufacturer: searchValues.manufacturer,
        qualityLevel: searchValues.qualityLevel,
        lifecycle: searchValues.lifecycle,
        page: currentPage,
        limit: pageSize
      };
      
      const result = await componentService.getComponents(filters);
      
      setSearchResults(result.components);
      setTotalCount(result.pagination.totalCount);
      setLoading(false);
      
      // 更新URL参数
      const newSearchParams = new URLSearchParams();
      if (searchValues.query) {
        newSearchParams.set('q', searchValues.query);
      }
      if (searchValues.primaryCategory) {
        newSearchParams.set('category', searchValues.primaryCategory);
      }
      setSearchParams(newSearchParams);
    } catch (error) {
      console.error('Search failed:', error);
      setLoading(false);
    }
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setCurrentPage(1);
    handleSearch();
    setSearchParams({});
  };

  // 查看详情
  const handleViewDetail = (record: Component) => {
    setSelectedComponent(record);
    setDetailModalVisible(true);
  };

  // 获取分类统计
  const getCategoryStats = () => {
    const stats: { [key: string]: number } = {};
    searchResults.forEach(component => {
      stats[component.primaryCategory] = (stats[component.primaryCategory] || 0) + 1;
    });
    return stats;
  };

  // 表格列定义
  const columns = [
    {
      title: '器件型号',
      dataIndex: 'partNumber',
      key: 'partNumber',
      width: 150,
      render: (text: string, record: Component) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record._id}</div>
        </div>
      ),
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 120,
    },
    {
      title: '分类',
      key: 'category',
      width: 180,
      render: (_: any, record: Component) => (
        <div>
          <Tag color="purple">{record.primaryCategory}</Tag>
          <div style={{ marginTop: 4 }}>
            <Tag color="geekblue" style={{ fontSize: '11px' }}>{record.secondaryCategory}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: '封装',
      dataIndex: 'package',
      key: 'package',
      width: 100,
    },
    {
      title: '器件描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: '功能性能',
      dataIndex: 'functionalPerformance',
      key: 'functionalPerformance',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: '参考价格',
      dataIndex: 'referencePrice',
      key: 'referencePrice',
      width: 100,
      sorter: (a: Component, b: Component) => a.referencePrice - b.referencePrice,
      render: (price: number) => {
        if (price === 0) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return <span style={{ color: '#1890ff', fontWeight: 'bold' }}>¥{price.toFixed(2)}</span>;
      },
    },
    {
      title: '质量等级',
      dataIndex: 'qualityLevel',
      key: 'qualityLevel',
      width: 100,
      render: (level: string) => {
        const colorMap: { [key: string]: string } = {
          '宇航级': 'red',
          '军用级': 'orange',
          '工业级': 'blue',
          '汽车级': 'purple',
          '医用级': 'magenta',
          '消费级': 'green'
        };
        return <Tag color={colorMap[level] || 'default'}>{level}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Component) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="对比">
            <Button
              type="link"
              icon={<SwapOutlined />}
            />
          </Tooltip>
          <Tooltip title="加入选型">
            <Button
              type="link"
              icon={<ShoppingCartOutlined />}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const query = searchParams.get('q');
  const category = searchParams.get('category');
  const categoryStats = getCategoryStats();

  return (
    <div>
      {/* 全局搜索标题 */}
      <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
            <AppstoreOutlined style={{ marginRight: 12 }} />
            全局器件搜索
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0', fontSize: '14px' }}>
            Global Component Search - 搜索所有11个分类的器件数据
          </p>
        </div>
      </Card>
      
      {(query || category) && (
        <Alert
          message="当前搜索条件"
          description={
            <div>
              {query && <span>关键词: <strong>{query}</strong></span>}
              {query && category && category !== 'model' && <span> | </span>}
              {category && category !== 'model' && <span>分类: <strong>{category}</strong></span>}
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* 分类统计卡片 */}
      {Object.keys(categoryStats).length > 0 && (
        <Card title="搜索结果分类统计" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            {Object.entries(categoryStats).map(([cat, count]) => (
              <Col span={6} key={cat}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Badge count={count} style={{ backgroundColor: '#1890ff' }}>
                    <div style={{ padding: '8px 16px' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>{cat}</div>
                    </div>
                  </Badge>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
      
      <Card title="器件搜索" extra={<FilterOutlined />}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="搜索关键词" name="query">
                <Input 
                  placeholder="输入器件型号、制造商、描述等关键词" 
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="器件分类" name="primaryCategory">
                <Select placeholder="选择分类" allowClear>
                  {categories.primary.map((cat: string) => (
                    <Option key={cat} value={cat}>{cat}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="制造商" name="manufacturer">
                <Select placeholder="选择制造商" allowClear>
                  {manufacturers.map((mfr: string) => (
                    <Option key={mfr} value={mfr}>{mfr}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="质量等级" name="qualityLevel">
                <Select placeholder="选择质量等级" allowClear>
                  <Option value="宇航级">宇航级</Option>
                  <Option value="军用级">军用级</Option>
                  <Option value="工业级">工业级</Option>
                  <Option value="汽车级">汽车级</Option>
                  <Option value="医用级">医用级</Option>
                  <Option value="消费级">消费级</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="生命周期" name="lifecycle">
                <Select placeholder="选择生命周期" allowClear>
                  <Option value="生产中">生产中</Option>
                  <Option value="工程样片">工程样片</Option>
                  <Option value="停产">停产</Option>
                  <Option value="即将停产">即将停产</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row>
            <Col span={24}>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                  搜索
                </Button>
                <Button onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title={`搜索结果 (${searchResults.length})`}
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <span>已选择 {selectedRowKeys.length} 项</span>
            <Button type="primary" disabled={selectedRowKeys.length === 0}>
              批量对比
            </Button>
            <Button disabled={selectedRowKeys.length === 0}>
              加入选型
            </Button>
          </Space>
        }
      >
        {searchResults.length === 0 && !loading ? (
          <Empty 
            description="暂无符合条件的器件"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={searchResults}
            rowKey="_id"
            loading={loading}
            scroll={{ x: 1400 }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              preserveSelectedRowKeys: true,
            }}
            pagination={{
              current: currentPage,
              total: totalCount,
              pageSize: pageSize,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
              onChange: (page, size) => {
                setCurrentPage(page);
                if (size !== pageSize) {
                  setPageSize(size);
                }
                handleSearch();
              },
            }}
          />
        )}
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="器件详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedComponent && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="器件型号" span={2}>
              <strong style={{ fontSize: '16px', color: '#1890ff' }}>
                {selectedComponent.partNumber}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="制造商">{selectedComponent.manufacturer}</Descriptions.Item>
            <Descriptions.Item label="参考价格">
              {selectedComponent.referencePrice === 0 ? (
                <span style={{ color: '#999' }}>暂无报价</span>
              ) : (
                <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                  ¥{selectedComponent.referencePrice.toFixed(2)}
                </span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="一级分类">{selectedComponent.primaryCategory}</Descriptions.Item>
            <Descriptions.Item label="二级分类">{selectedComponent.secondaryCategory}</Descriptions.Item>
            <Descriptions.Item label="封装形式">{selectedComponent.package}</Descriptions.Item>
            <Descriptions.Item label="质量等级">{selectedComponent.qualityLevel}</Descriptions.Item>
            <Descriptions.Item label="生命周期">{selectedComponent.lifecycle}</Descriptions.Item>
            <Descriptions.Item label="适用标准">
              <Space wrap>
                {selectedComponent.standards.map(std => (
                  <Tag key={std} color="volcano">{std}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="器件描述" span={2}>
              {selectedComponent.description}
            </Descriptions.Item>
            <Descriptions.Item label="功能性能" span={2}>
              {selectedComponent.functionalPerformance}
            </Descriptions.Item>
            {/* 显示技术参数 */}
            {Object.entries(selectedComponent.parameters).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {value}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default GlobalSearch;
