import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Select,
  Slider,
  Checkbox,
  Modal,
  Descriptions,
  Rate,
  Progress,
  Badge,
  Tooltip,
  Typography,
  Divider,
  Collapse,
  Statistic,
  Timeline,
  Avatar
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  EyeOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  DollarOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

// 供应商数据接口
interface Supplier {
  id: string;
  name: string;
  code: string;
  qualificationLevel: 'A' | 'B' | 'C' | 'unqualified';
  contactInfo: any;
  isActive: boolean;
  lastAuditDate?: string;
  certifications: string[];
  businessInfo?: any;
  capabilities?: any;
  performance?: any;
  riskAssessment?: any;
  contractInfo?: any;
  metadata?: any;
}

// 搜索过滤器接口
interface SupplierFilters {
  qualificationLevel: string[];
  certifications: string[];
  productCategories: string[];
  ratingRange: [number, number];
  location: string[];
  spaceQualified: boolean | null;
  radiationTesting: boolean | null;
  isActive: boolean | null;
}

const SupplierSearch: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<SupplierFilters>({
    qualificationLevel: [],
    certifications: [],
    productCategories: [],
    ratingRange: [0, 5],
    location: [],
    spaceQualified: null,
    radiationTesting: null,
    isActive: null
  });

  // 统计数据
  const [statistics, setStatistics] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    aLevelSuppliers: 0,
    spaceQualifiedSuppliers: 0
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [suppliers, searchText, filters]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/suppliers');
      const suppliersData = response.data.data || [];
      setSuppliers(suppliersData);
      
      // 计算统计数据
      const stats = {
        totalSuppliers: suppliersData.length,
        activeSuppliers: suppliersData.filter((s: Supplier) => s.isActive).length,
        aLevelSuppliers: suppliersData.filter((s: Supplier) => s.qualificationLevel === 'A').length,
        spaceQualifiedSuppliers: suppliersData.filter((s: Supplier) => 
          s.capabilities?.spaceQualification?.hasExperience
        ).length
      };
      setStatistics(stats);
    } catch (error) {
      console.error('获取供应商数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = suppliers.filter(supplier => {
      // 文本搜索
      const matchesSearch = !searchText || 
        supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
        supplier.code.toLowerCase().includes(searchText.toLowerCase()) ||
        (supplier.businessInfo?.registrationNumber || '').toLowerCase().includes(searchText.toLowerCase());

      // 资质等级过滤
      const matchesQualification = filters.qualificationLevel.length === 0 || 
        filters.qualificationLevel.includes(supplier.qualificationLevel);

      // 认证过滤
      const matchesCertifications = filters.certifications.length === 0 ||
        filters.certifications.some(cert => supplier.certifications?.includes(cert));

      // 产品类别过滤
      const matchesCategories = filters.productCategories.length === 0 ||
        filters.productCategories.some(cat => 
          supplier.capabilities?.productCategories?.includes(cat)
        );

      // 评分范围过滤
      const rating = supplier.performance?.overallRating || 0;
      const matchesRating = rating >= filters.ratingRange[0] && rating <= filters.ratingRange[1];

      // 航天资质过滤
      const matchesSpaceQualification = filters.spaceQualified === null ||
        supplier.capabilities?.spaceQualification?.hasExperience === filters.spaceQualified;

      // 辐照测试能力过滤
      const matchesRadiationTesting = filters.radiationTesting === null ||
        supplier.capabilities?.radiationTesting?.hasCapability === filters.radiationTesting;

      // 活跃状态过滤
      const matchesActive = filters.isActive === null || supplier.isActive === filters.isActive;

      return matchesSearch && matchesQualification && matchesCertifications && 
             matchesCategories && matchesRating && matchesSpaceQualification && 
             matchesRadiationTesting && matchesActive;
    });

    setFilteredSuppliers(filtered);
  };

  const getQualificationColor = (level: string) => {
    switch (level) {
      case 'A': return 'green';
      case 'B': return 'blue';
      case 'C': return 'orange';
      default: return 'red';
    }
  };

  const getQualificationText = (level: string) => {
    switch (level) {
      case 'A': return 'A级供应商';
      case 'B': return 'B级供应商';
      case 'C': return 'C级供应商';
      default: return '未认证';
    }
  };

  const calculateSupplierScore = (supplier: Supplier) => {
    let score = 0;
    
    // 资质等级权重 (40%)
    const qualificationWeight = {
      'A': 40,
      'B': 30,
      'C': 20,
      'unqualified': 0
    };
    score += qualificationWeight[supplier.qualificationLevel] || 0;

    // 认证数量权重 (20%)
    const certCount = supplier.certifications?.length || 0;
    score += Math.min(certCount * 5, 20);

    // 航天经验权重 (20%)
    if (supplier.capabilities?.spaceQualification?.hasExperience) {
      score += 20;
    }

    // 辐照测试能力权重 (10%)
    if (supplier.capabilities?.radiationTesting?.hasCapability) {
      score += 10;
    }

    // 绩效评级权重 (10%)
    const performanceRating = supplier.performance?.overallRating || 0;
    score += performanceRating * 2;

    return Math.min(score, 100);
  };

  const exportSuppliers = () => {
    const data = filteredSuppliers.map(supplier => ({
      供应商代码: supplier.code,
      供应商名称: supplier.name,
      资质等级: getQualificationText(supplier.qualificationLevel),
      综合评分: calculateSupplierScore(supplier),
      认证数量: supplier.certifications?.length || 0,
      航天资质: supplier.capabilities?.spaceQualification?.hasExperience ? '是' : '否',
      辐照测试: supplier.capabilities?.radiationTesting?.hasCapability ? '是' : '否',
      状态: supplier.isActive ? '活跃' : '停用'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '供应商检索结果');
    XLSX.writeFile(workbook, `供应商检索结果_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const columns = [
    {
      title: '供应商信息',
      key: 'info',
      width: 250,
      render: (_, supplier: Supplier) => (
        <Space direction="vertical" size="small">
          <Space>
            <Avatar size="small" style={{ backgroundColor: getQualificationColor(supplier.qualificationLevel) }}>
              {supplier.code.substring(0, 2)}
            </Avatar>
            <div>
              <Text strong>{supplier.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>{supplier.code}</Text>
            </div>
          </Space>
          <Tag color={getQualificationColor(supplier.qualificationLevel)}>
            {getQualificationText(supplier.qualificationLevel)}
          </Tag>
        </Space>
      )
    },
    {
      title: '综合评分',
      key: 'score',
      width: 120,
      render: (_, supplier: Supplier) => {
        const score = calculateSupplierScore(supplier);
        return (
          <Space direction="vertical" size="small" align="center">
            <Progress
              type="circle"
              size={60}
              percent={score}
              format={percent => `${percent}`}
              strokeColor={score >= 80 ? '#52c41a' : score >= 60 ? '#1890ff' : '#faad14'}
            />
            <Text style={{ fontSize: '12px' }}>综合评分</Text>
          </Space>
        );
      }
    },
    {
      title: '核心能力',
      key: 'capabilities',
      width: 200,
      render: (_, supplier: Supplier) => (
        <Space direction="vertical" size="small">
          <Space wrap>
            {supplier.capabilities?.spaceQualification?.hasExperience && (
              <Tag color="purple" icon={<ThunderboltOutlined />}>航天级</Tag>
            )}
            {supplier.capabilities?.radiationTesting?.hasCapability && (
              <Tag color="orange" icon={<SafetyCertificateOutlined />}>辐照测试</Tag>
            )}
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            认证: {supplier.certifications?.length || 0} 项
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            产品类别: {supplier.capabilities?.productCategories?.length || 0} 个
          </Text>
        </Space>
      )
    },
    {
      title: '绩效指标',
      key: 'performance',
      width: 150,
      render: (_, supplier: Supplier) => (
        <Space direction="vertical" size="small">
          <div>
            <Text style={{ fontSize: '12px' }}>质量评分</Text>
            <Rate disabled size="small" value={supplier.performance?.qualityRating || 0} />
          </div>
          <div>
            <Text style={{ fontSize: '12px' }}>交付评分</Text>
            <Rate disabled size="small" value={supplier.performance?.deliveryRating || 0} />
          </div>
          <div>
            <Text style={{ fontSize: '12px' }}>服务评分</Text>
            <Rate disabled size="small" value={supplier.performance?.serviceRating || 0} />
          </div>
        </Space>
      )
    },
    {
      title: '联系信息',
      key: 'contact',
      width: 180,
      render: (_, supplier: Supplier) => (
        <Space direction="vertical" size="small">
          {supplier.contactInfo?.primaryContact?.email && (
            <Space>
              <MailOutlined style={{ color: '#1890ff' }} />
              <Text style={{ fontSize: '12px' }}>
                {supplier.contactInfo.primaryContact.email}
              </Text>
            </Space>
          )}
          {supplier.contactInfo?.primaryContact?.phone && (
            <Space>
              <PhoneOutlined style={{ color: '#52c41a' }} />
              <Text style={{ fontSize: '12px' }}>
                {supplier.contactInfo.primaryContact.phone}
              </Text>
            </Space>
          )}
          {supplier.contactInfo?.address?.country && (
            <Space>
              <GlobalOutlined style={{ color: '#faad14' }} />
              <Text style={{ fontSize: '12px' }}>
                {supplier.contactInfo.address.country}
              </Text>
            </Space>
          )}
        </Space>
      )
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, supplier: Supplier) => (
        <Space direction="vertical" size="small" align="center">
          <Badge 
            status={supplier.isActive ? 'success' : 'error'} 
            text={supplier.isActive ? '活跃' : '停用'} 
          />
          {supplier.lastAuditDate && (
            <Tooltip title={`最后审核: ${supplier.lastAuditDate}`}>
              <CalendarOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, supplier: Supplier) => (
        <Space direction="vertical" size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedSupplier(supplier);
              setDetailModalVisible(true);
            }}
          >
            详情
          </Button>
          <Checkbox
            checked={selectedForCompare.includes(supplier.id)}
            onChange={(e) => {
              if (e.target.checked) {
                if (selectedForCompare.length < 3) {
                  setSelectedForCompare([...selectedForCompare, supplier.id]);
                }
              } else {
                setSelectedForCompare(selectedForCompare.filter(id => id !== supplier.id));
              }
            }}
            disabled={!selectedForCompare.includes(supplier.id) && selectedForCompare.length >= 3}
          >
            对比
          </Checkbox>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题和统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="供应商总数"
                  value={statistics.totalSuppliers}
                  prefix={<GlobalOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="活跃供应商"
                  value={statistics.activeSuppliers}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="A级供应商"
                  value={statistics.aLevelSuppliers}
                  prefix={<SafetyCertificateOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="航天资质"
                  value={statistics.spaceQualifiedSuppliers}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 搜索和过滤器 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col span={8}>
          <Search
            placeholder="搜索供应商名称、代码或注册号"
            allowClear
            enterButton={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(value) => setSearchText(value)}
          />
        </Col>
        <Col span={16}>
          <Space>
            <Button 
              type="primary" 
              icon={<ExportOutlined />}
              onClick={exportSuppliers}
              disabled={filteredSuppliers.length === 0}
            >
              导出结果 ({filteredSuppliers.length})
            </Button>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              disabled={selectedForCompare.length < 2}
              onClick={() => setCompareModalVisible(true)}
            >
              对比供应商 ({selectedForCompare.length})
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 高级过滤器 */}
      <Card style={{ marginBottom: '16px' }}>
        <Collapse 
          ghost
          items={[
            {
              key: 'filters',
              label: '高级筛选',
              children: (
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <label>资质等级:</label>
                    <Select
                      mode="multiple"
                      placeholder="选择资质等级"
                      style={{ width: '100%' }}
                      value={filters.qualificationLevel}
                      onChange={(value) => setFilters({...filters, qualificationLevel: value})}
                    >
                      <Option value="A">A级供应商</Option>
                      <Option value="B">B级供应商</Option>
                      <Option value="C">C级供应商</Option>
                      <Option value="unqualified">未认证</Option>
                    </Select>
                  </Col>
                  <Col span={6}>
                    <label>评分范围:</label>
                    <Slider
                      range
                      min={0}
                      max={5}
                      step={0.1}
                      value={filters.ratingRange}
                      onChange={(value) => setFilters({...filters, ratingRange: value as [number, number]})}
                      marks={{
                        0: '0',
                        1: '1',
                        2: '2',
                        3: '3',
                        4: '4',
                        5: '5'
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <Space direction="vertical">
                      <Checkbox
                        checked={filters.spaceQualified === true}
                        onChange={(e) => setFilters({
                          ...filters, 
                          spaceQualified: e.target.checked ? true : null
                        })}
                      >
                        航天资质
                      </Checkbox>
                      <Checkbox
                        checked={filters.radiationTesting === true}
                        onChange={(e) => setFilters({
                          ...filters, 
                          radiationTesting: e.target.checked ? true : null
                        })}
                      >
                        辐照测试能力
                      </Checkbox>
                    </Space>
                  </Col>
                  <Col span={6}>
                    <label>状态:</label>
                    <Select
                      placeholder="选择状态"
                      style={{ width: '100%' }}
                      value={filters.isActive}
                      onChange={(value) => setFilters({...filters, isActive: value})}
                      allowClear
                    >
                      <Option value={true}>活跃</Option>
                      <Option value={false}>停用</Option>
                    </Select>
                  </Col>
                </Row>
              )
            }
          ]}
        />
      </Card>

      {/* 供应商列表 */}
      <Card title={`供应商列表 (${filteredSuppliers.length})`}>
        <Table
          columns={columns}
          dataSource={filteredSuppliers}
          loading={loading}
          rowKey="id"
          pagination={{
            total: filteredSuppliers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 供应商详情弹窗 */}
      <Modal
        title="供应商详细信息"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1000}
        footer={null}
      >
        {selectedSupplier && (
          <Collapse 
            defaultActiveKey={['basic', 'performance']}
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <Descriptions column={2}>
                    <Descriptions.Item label="供应商代码">{selectedSupplier.code}</Descriptions.Item>
                    <Descriptions.Item label="供应商名称">{selectedSupplier.name}</Descriptions.Item>
                    <Descriptions.Item label="资质等级">
                      <Tag color={getQualificationColor(selectedSupplier.qualificationLevel)}>
                        {getQualificationText(selectedSupplier.qualificationLevel)}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Badge 
                        status={selectedSupplier.isActive ? 'success' : 'error'} 
                        text={selectedSupplier.isActive ? '活跃' : '停用'} 
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="最后审核日期">
                      {selectedSupplier.lastAuditDate || '未记录'}
                    </Descriptions.Item>
                    <Descriptions.Item label="认证数量">
                      {selectedSupplier.certifications?.length || 0} 项
                    </Descriptions.Item>
                  </Descriptions>
                )
              },
              {
                key: 'performance',
                label: '绩效评估',
                children: (
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Card size="small" title="质量评分">
                        <Rate disabled value={selectedSupplier.performance?.qualityRating || 0} />
                        <div style={{ marginTop: '8px' }}>
                          <Text type="secondary">
                            {selectedSupplier.performance?.qualityScore || 0}/100
                          </Text>
                        </div>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" title="交付评分">
                        <Rate disabled value={selectedSupplier.performance?.deliveryRating || 0} />
                        <div style={{ marginTop: '8px' }}>
                          <Text type="secondary">
                            准时率: {selectedSupplier.performance?.onTimeDeliveryRate || 0}%
                          </Text>
                        </div>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" title="服务评分">
                        <Rate disabled value={selectedSupplier.performance?.serviceRating || 0} />
                        <div style={{ marginTop: '8px' }}>
                          <Text type="secondary">
                            响应时间: {selectedSupplier.performance?.responseTime || 0}h
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                )
              },
              {
                key: 'capabilities',
                label: '能力认证',
                children: (
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Card size="small" title="航天资质">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <Text strong>是否具备航天经验: </Text>
                            <Tag color={selectedSupplier.capabilities?.spaceQualification?.hasExperience ? 'green' : 'red'}>
                              {selectedSupplier.capabilities?.spaceQualification?.hasExperience ? '是' : '否'}
                            </Tag>
                          </div>
                          {selectedSupplier.capabilities?.spaceQualification?.programs && (
                            <div>
                              <Text strong>参与项目: </Text>
                              {selectedSupplier.capabilities.spaceQualification.programs.map((program: string, index: number) => (
                                <Tag key={index}>{program}</Tag>
                              ))}
                            </div>
                          )}
                        </Space>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small" title="辐照测试">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <Text strong>测试能力: </Text>
                            <Tag color={selectedSupplier.capabilities?.radiationTesting?.hasCapability ? 'green' : 'red'}>
                              {selectedSupplier.capabilities?.radiationTesting?.hasCapability ? '具备' : '不具备'}
                            </Tag>
                          </div>
                          {selectedSupplier.capabilities?.radiationTesting?.testTypes && (
                            <div>
                              <Text strong>测试类型: </Text>
                              {selectedSupplier.capabilities.radiationTesting.testTypes.map((type: string, index: number) => (
                                <Tag key={index}>{type.toUpperCase()}</Tag>
                              ))}
                            </div>
                          )}
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                )
              }
            ]}
          />
        )}
      </Modal>

      {/* 供应商对比弹窗 */}
      <Modal
        title="供应商对比分析"
        open={compareModalVisible}
        onCancel={() => setCompareModalVisible(false)}
        width={1200}
        footer={null}
      >
        {selectedForCompare.length > 0 ? (
          <div>
            <Row gutter={16}>
              {suppliers.filter(s => selectedForCompare.includes(s.id)).map((supplier, index) => (
                <Col span={8} key={supplier.id}>
                  <Card 
                    title={supplier.name}
                    size="small"
                    style={{ marginBottom: 16 }}
                    extra={
                      <Button 
                        type="link" 
                        danger 
                        size="small"
                        onClick={() => {
                          const newSelected = selectedForCompare.filter(id => id !== supplier.id);
                          setSelectedForCompare(newSelected);
                        }}
                      >
                        移除
                      </Button>
                    }
                  >
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="类型">
                        <Tag color="blue">{supplier.type}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="等级">
                        <Tag color={supplier.level === '一级' ? 'green' : supplier.level === '二级' ? 'orange' : 'red'}>
                          {supplier.level}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="认证">
                        {supplier.certifications.map(cert => (
                          <Tag key={cert} style={{ marginBottom: 4 }}>{cert}</Tag>
                        ))}
                      </Descriptions.Item>
                      <Descriptions.Item label="主营产品">
                        {supplier.products.slice(0, 3).join(', ')}
                        {supplier.products.length > 3 && '...'}
                      </Descriptions.Item>
                      <Descriptions.Item label="联系人">
                        {supplier.contact}
                      </Descriptions.Item>
                      <Descriptions.Item label="评分">
                        <Rate disabled defaultValue={supplier.rating} style={{ fontSize: 14 }} />
                        <span style={{ marginLeft: 8 }}>{supplier.rating}/5</span>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              ))}
            </Row>
            
            {/* 对比总结 */}
            <Card title="对比总结" size="small">
              <Table
                size="small"
                pagination={false}
                columns={[
                  { title: '对比项', dataIndex: 'item', key: 'item', width: 120 },
                  ...suppliers.filter(s => selectedForCompare.includes(s.id)).map(supplier => ({
                    title: supplier.name,
                    dataIndex: supplier.id,
                    key: supplier.id,
                    align: 'center' as const
                  }))
                ]}
                dataSource={[
                  {
                    key: '1',
                    item: '供应商类型',
                    ...Object.fromEntries(suppliers.filter(s => selectedForCompare.includes(s.id)).map(s => [s.id, s.businessInfo?.type || 'N/A']))
                  },
                  {
                    key: '2',
                    item: '供应商等级',
                    ...Object.fromEntries(suppliers.filter(s => selectedForCompare.includes(s.id)).map(s => [s.id, 
                      <Tag color={s.qualificationLevel === 'A' ? 'green' : s.qualificationLevel === 'B' ? 'orange' : 'red'}>
                        {s.qualificationLevel}
                      </Tag>
                    ]))
                  },
                  {
                    key: '3',
                    item: '认证数量',
                    ...Object.fromEntries(suppliers.filter(s => selectedForCompare.includes(s.id)).map(s => [s.id, s.certifications.length + '项']))
                  },
                  {
                    key: '4',
                    item: '产品种类',
                    ...Object.fromEntries(suppliers.filter(s => selectedForCompare.includes(s.id)).map(s => [s.id, (s.capabilities?.productCategories || []).length + '种']))
                  },
                  {
                    key: '5',
                    item: '综合评分',
                    ...Object.fromEntries(suppliers.filter(s => selectedForCompare.includes(s.id)).map(s => [s.id, 
                      <span>
                        <Rate disabled defaultValue={s.performance?.overallRating || 0} style={{ fontSize: 12 }} />
                        <span style={{ marginLeft: 4 }}>{s.rating}</span>
                      </span>
                    ]))
                  }
                ]}
              />
            </Card>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">请先选择要对比的供应商</Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupplierSearch;
