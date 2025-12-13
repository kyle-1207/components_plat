import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/homepage.css';

import {
  Card,
  Input,
  Tag,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Statistic,
  List,
  Avatar,
  Select,
  Tabs,
} from 'antd';
import {
  SearchOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  RightOutlined,
  TrophyOutlined,
  BellOutlined,
  FileProtectOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ApiOutlined,
  RadarChartOutlined,
  SettingOutlined,
  BugOutlined,
  AppstoreOutlined,
  SwapOutlined,
  UsbOutlined,
  WifiOutlined,
  PoweroffOutlined,
  HeatMapOutlined,
  BranchesOutlined,
  PartitionOutlined,
  BlockOutlined,
  NodeIndexOutlined,
  FileSearchOutlined,
  DiffOutlined,
  BarChartOutlined,
  BulbOutlined,
  BuildOutlined,
} from '@ant-design/icons';

const { Search } = Input;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// DoEEEt真实的顶级分类数据（从数据库统计得出）
const componentCategoriesBase = [
  { 
    icon: <BarChartOutlined />, 
    title: '电阻器', 
    subtitle: 'Resistors',
    color: '#1890ff',
    description: '固定电阻、可变电阻、网络电阵列等',
    familyPath: 'Resistors',
    count: 824599
  },
  { 
    icon: <ThunderboltOutlined />, 
    title: '电容器', 
    subtitle: 'Capacitors',
    color: '#52c41a',
    description: '陶瓷电容、钽电容、薄膜电容等',
    familyPath: 'Capacitors',
    count: 527329
  },
  { 
    icon: <UsbOutlined />, 
    title: '连接器', 
    subtitle: 'Connectors',
    color: '#fa8c16',
    description: 'PCB连接器、D型连接器、射频连接器等',
    familyPath: 'Connectors',
    count: 160090
  },
  { 
    icon: <WifiOutlined />, 
    title: '晶振与振荡器', 
    subtitle: 'Crystals and Oscillators',
    color: '#722ed1',
    description: '晶体振荡器、石英晶体等',
    familyPath: 'Crystals and Oscillators',
    count: 131525
  },
  { 
    icon: <PoweroffOutlined />, 
    title: '开关', 
    subtitle: 'Switches',
    color: '#eb2f96',
    description: '拨动开关、按键开关、旋转开关等',
    familyPath: 'Switches',
    count: 53377
  },
  { 
    icon: <NodeIndexOutlined />, 
    title: '分立器件', 
    subtitle: 'Discretes',
    color: '#13c2c2',
    description: '二极管、三极管、场效应管、功率器件等',
    familyPath: 'Discretes',
    count: 51638
  },
  { 
    icon: <HeatMapOutlined />, 
    title: '热敏电阻', 
    subtitle: 'Thermistors',
    color: '#fa541c',
    description: 'NTC、RTD、热电阻等',
    familyPath: 'Thermistors',
    count: 31302
  },
  { 
    icon: <PartitionOutlined />, 
    title: '微电路', 
    subtitle: 'Microcircuits',
    color: '#2f54eb',
    description: '数字微电路、模拟微电路、外围控制器等',
    familyPath: 'Microcircuits',
    count: 29962
  },
  { 
    icon: <ApiOutlined />, 
    title: '电缆组件', 
    subtitle: 'Cable Assemblies',
    color: '#08979c',
    description: '射频电缆、微波电缆、连接线等',
    familyPath: 'Cable Assemblies',
    count: 9435
  },
  { 
    icon: <BranchesOutlined />, 
    title: '电感器', 
    subtitle: 'Inductors',
    color: '#531dab',
    description: '功率电感、定制电感、RF电感等',
    familyPath: 'Inductors',
    count: 8849
  },
  { 
    icon: <SwapOutlined />, 
    title: '继电器', 
    subtitle: 'Relays',
    color: '#096dd9',
    description: '混合继电器、电磁继电器、固态继电器等',
    familyPath: 'Relays',
    count: 6015
  },
  { 
    icon: <BlockOutlined />, 
    title: '变压器', 
    subtitle: 'Transformers',
    color: '#c41d7f',
    description: '电源变压器、隔离变压器、脉冲变压器等',
    familyPath: 'Transformers',
    count: 3363
  },
  { 
    icon: <DiffOutlined />, 
    title: '滤波器', 
    subtitle: 'Filters',
    color: '#389e0d',
    description: '共模扼流圈、EMI滤波器、信号滤波器等',
    familyPath: 'Filters',
    count: 2565
  },
  { 
    icon: <FileSearchOutlined />, 
    title: '电线电缆', 
    subtitle: 'Wires and Cables',
    color: '#d46b08',
    description: '导线、电缆、屏蔽线等',
    familyPath: 'Wires and Cables',
    count: 1125
  },
  { 
    icon: <RadarChartOutlined />, 
    title: '射频无源器件', 
    subtitle: 'RF Passive Components',
    color: '#9254de',
    description: '同轴衰减器、负载、耦合器等',
    familyPath: 'RF Passive Components',
    count: 243
  },
];

// 7大核心服务模块
const serviceModules = [
  {
    key: 'standards',
    title: '标准服务',
    icon: <BookOutlined />,
    description: '国际航天标准文档查询与管理',
    features: ['MIL标准', 'ESCC标准', '标准对比', '版本管理'],
    link: '/standards',
    color: '#1890ff',
    stats: { count: '15,000+', label: '标准文档' }
  },
  {
    key: 'components',
    title: '器件查询',
    icon: <SearchOutlined />,
    description: '器件信息管理与查询服务',
    features: ['智能搜索', '器件比对', '供应商检索', '在线选用'],
    link: '/components',
    color: '#52c41a',
    stats: { count: '50,000+', label: '器件型号' }
  },
  {
    key: 'procurement',
    title: '采购服务',
    icon: <ShoppingCartOutlined />,
    description: '专业的航天器件采购与供应链管理',
    features: ['货源开发', '在线采购', '库存管理', '供应链监控'],
    link: '/procurement',
    color: '#fa8c16',
    stats: { count: '2,000+', label: '合格供应商' }
  },
  {
    key: 'application',
    title: '应用支持',
    icon: <ToolOutlined />,
    description: '器件应用技术支持与设计服务',
    features: ['应用指南', '功能单元', '数字模型', '仿真分析'],
    link: '/application',
    color: '#eb2f96',
    stats: { count: '8,000+', label: '应用案例' }
  },
  {
    key: 'quality',
    title: '质量管理',
    icon: <SafetyCertificateOutlined />,
    description: '质量问题管理与追溯服务',
    features: ['问题上报', '质量归零', '预警通报', '追溯查询'],
    link: '/quality',
    color: '#722ed1',
    stats: { count: '99.9%', label: '质量可靠性' }
  },
  {
    key: 'testing',
    title: '试验检测',
    icon: <ExperimentOutlined />,
    description: '专业的航天器件试验检测服务',
    features: ['常规检测', '器件鉴定', '辐照测试', '安全评价'],
    link: '/testing',
    color: '#13c2c2',
    stats: { count: '500+', label: '检测项目' }
  },
  {
    key: 'documents',
    title: '文件培训',
    icon: <FileTextOutlined />,
    description: '技术文档管理与专业培训服务',
    features: ['技术文档', '测试数据', '培训课程', '行业资讯'],
    link: '/documents',
    color: '#fa541c',
    stats: { count: '10,000+', label: '技术文档' }
  },
];

// 最新动态数据
const latestNews = [
  {
    id: 1,
    type: 'news',
    title: '新版MIL-STD-883标准发布',
    content: '美军标MIL-STD-883K版本正式发布，新增多项测试方法...',
    date: '2024-01-15',
    icon: <FileProtectOutlined style={{ color: '#1890ff' }} />
  },
  {
    id: 2,
    type: 'quality',
    title: '质量预警：某型存储器批次问题',
    content: '发现某厂商2023年第4季度生产的SRAM器件存在质量隐患...',
    date: '2024-01-14',
    icon: <BellOutlined style={{ color: '#ff4d4f' }} />
  },
  {
    id: 3,
    type: 'achievement',
    title: '平台器件数据库突破5万种',
    content: '经过持续建设，平台器件数据库已收录超过5万种航天级器件...',
    date: '2024-01-12',
    icon: <TrophyOutlined style={{ color: '#52c41a' }} />
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchCategory, setSearchCategory] = useState('model');
  const [componentCategories, setComponentCategories] = useState(componentCategoriesBase.map(cat => ({ ...cat, count: '...' })));
  const [statsLoading, setStatsLoading] = useState(true);

  // 获取统计数据
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setStatsLoading(true);
        const response = await fetch('/api/doeeet/statistics');
        const result = await response.json();
        
        if (result.success && result.data) {
          // 更新分类统计数据
          const updatedCategories = componentCategoriesBase.map(cat => {
            const stats = result.data.categoryStats || {};
            // 尝试匹配分类名称
            const count = stats[cat.familyPath] || stats[cat.title] || 0;
            return {
              ...cat,
              count: count > 0 ? count.toLocaleString() : '0'
            };
          });
          setComponentCategories(updatedCategories);
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
        // 使用默认值
        setComponentCategories(componentCategoriesBase.map(cat => ({ ...cat, count: '-' })));
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchStatistics();
  }, []);

  const handleSearch = (value: string) => {
    if (value.trim()) {
      // 根据搜索类别设置不同的查询参数
      if (searchCategory === 'supplier') {
        // 供应商搜索：传递 manufacturer 参数
        navigate(`/components/search?manufacturer=${encodeURIComponent(value)}`);
      } else if (searchCategory === 'standard') {
        // 标准编号搜索：传递 standard 参数（如果后端支持）
        navigate(`/components/search?q=${encodeURIComponent(value)}&category=standard`);
      } else {
        // 型号规格搜索：传递 q 参数
        navigate(`/components/search?q=${encodeURIComponent(value)}&category=model`);
      }
    }
  };

  const handleCategoryClick = (category: string) => {
    // 为特定分类指定专门的路由
    if (category === '数字单片集成电路') {
      navigate('/components/digital-ic');
    } else if (category === '模拟单片集成电路') {
      navigate('/components/analog-ic');
    } else if (category === '混合集成电路') {
      navigate('/components/hybrid-ic');
    } else if (category === '半导体分立器件') {
      navigate('/components/discrete');
    } else if (category === '固态微波器件与电路') {
      navigate('/components/microwave');
    } else if (category === '真空电子器件') {
      navigate('/components/vacuum');
    } else if (category === '光电子器件') {
      navigate('/components/optoelectronic');
    } else if (category === '机电组件') {
      navigate('/components/electromechanical');
    } else if (category === '电能源') {
      navigate('/components/power');
    } else if (category === '通用与特种元件') {
      navigate('/components/general');
    } else if (category === '微系统') {
      navigate('/components/microsystems');
    } else {
      navigate(`/components/search?category=${encodeURIComponent(category)}`);
    }
  };

  const handleModuleClick = (link: string) => {
    navigate(link);
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Hero Section - 类似 doEEEt 的深蓝色背景 */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        padding: '60px 0 80px',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 左侧火箭背景图 */}
        <div 
          className="hero-bg-rocket"
          style={{
            backgroundImage: 'url(/images/flight_2.jpg)'
          }}
        />
        
        {/* 右侧芯片背景图 */}
        <div 
          className="hero-bg-chip"
          style={{
            backgroundImage: 'url(/images/chip.jpg)'
          }}
        />
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          padding: '0 24px',
          position: 'relative',
          zIndex: 2
        }}>
          <Title level={1} style={{ 
            color: 'white', 
            fontSize: '42px', 
            marginBottom: 16,
            fontWeight: 'normal'
          }}>
            商业航天元器件及其应用支持一站式服务平台
          </Title>
          <Paragraph style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '18px', 
            marginBottom: 50,
            maxWidth: 800,
            margin: '0 auto 50px'
          }}>
            查找来自数百家制造商的电气电子机电(EEE)器件和数据表，为商业航天提供专业的元器件解决方案
          </Paragraph>
          
          {/* 主搜索框 - 参考知网的设计 */}
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* 搜索类别选择 */}
            <div style={{ 
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'center'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '4px',
                backdropFilter: 'blur(10px)'
              }}>
                <Space.Compact>
                  <Button
                    type={searchCategory === 'model' ? 'primary' : 'default'}
                    onClick={() => setSearchCategory('model')}
                    style={{
                      background: searchCategory === 'model' ? '#3b82f6' : 'transparent',
                      borderColor: searchCategory === 'model' ? '#3b82f6' : 'rgba(255,255,255,0.3)',
                      color: searchCategory === 'model' ? 'white' : 'rgba(255,255,255,0.9)',
                      height: '36px'
                    }}
                  >
                    型号规格
                  </Button>
                  <Button
                    type={searchCategory === 'supplier' ? 'primary' : 'default'}
                    onClick={() => setSearchCategory('supplier')}
                    style={{
                      background: searchCategory === 'supplier' ? '#3b82f6' : 'transparent',
                      borderColor: searchCategory === 'supplier' ? '#3b82f6' : 'rgba(255,255,255,0.3)',
                      color: searchCategory === 'supplier' ? 'white' : 'rgba(255,255,255,0.9)',
                      height: '36px'
                    }}
                  >
                    供应商
                  </Button>
                  <Button
                    type={searchCategory === 'standard' ? 'primary' : 'default'}
                    onClick={() => setSearchCategory('standard')}
                    style={{
                      background: searchCategory === 'standard' ? '#3b82f6' : 'transparent',
                      borderColor: searchCategory === 'standard' ? '#3b82f6' : 'rgba(255,255,255,0.3)',
                      color: searchCategory === 'standard' ? 'white' : 'rgba(255,255,255,0.9)',
                      height: '36px'
                    }}
                  >
                    标准编号
                  </Button>
                </Space.Compact>
              </div>
            </div>

            {/* 搜索框 */}
            <Search
              placeholder={
                searchCategory === 'model' ? "搜索元器件的型号规格..." :
                searchCategory === 'supplier' ? "搜索供应商名称..." :
                "搜索标准编号..."
              }
              size="large"
              enterButton={
                <Button 
                  type="primary" 
                  size="large"
                  icon={<SearchOutlined />}
                  style={{ 
                    background: '#3b82f6',
                    borderColor: '#3b82f6',
                    height: '50px',
                    paddingLeft: 24,
                    paddingRight: 24
                  }}
                >
                  搜索
                </Button>
              }
              onSearch={handleSearch}
              styles={{
                input: {
                  fontSize: '16px',
                  height: '50px',
                  paddingLeft: '16px'
                }
              }}
            />
            <div style={{ marginTop: 20, textAlign: 'left' }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                热门搜索：
              </Text>
              <Space wrap style={{ marginLeft: 8 }}>
                {searchCategory === 'model' && (
                  <>
                    <Tag 
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        border: '1px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSearch('LM358')}
                    >
                      LM358
                    </Tag>
                    <Tag 
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        border: '1px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSearch('STM32F103')}
                    >
                      STM32F103
                    </Tag>
                    <Tag 
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        border: '1px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSearch('AD8232')}
                    >
                      AD8232
                    </Tag>
                    <Tag 
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        border: '1px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSearch('TPS62180')}
                    >
                      TPS62180
                    </Tag>
                  </>
                )}
                {searchCategory === 'supplier' && (
                  <>
                    <Tag 
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        border: '1px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSearch('深圳国微')}
                    >
                      深圳国微
                    </Tag>
                    <Tag 
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        border: '1px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSearch('复旦微')}
                    >
                      复旦微
                    </Tag>
                    <Tag 
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        border: '1px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSearch('兆易创新')}
                    >
                      兆易创新
                    </Tag>
                    <Tag 
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        border: '1px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSearch('英飞凌')}
                    >
                      英飞凌
                    </Tag>
                  </>
                )}
                {searchCategory === 'standard' && (
                  <>
                    <Tag 
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        border: '1px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSearch('GJB 548')}
                    >
                      GJB 548
                    </Tag>
                    <Tag 
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        border: '1px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSearch('MIL-STD-883')}
                    >
                      MIL-STD-883
                    </Tag>
                    <Tag 
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        border: '1px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSearch('Q/QJA 20084')}
                    >
                      Q/QJA 20084
                    </Tag>
                    <Tag 
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'white', 
                        border: '1px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSearch('Q/QJA 20085')}
                    >
                      Q/QJA 20085
                    </Tag>
                  </>
                )}
              </Space>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* 器件分类浏览 - 参考 doEEEt 的 Browse by category */}
        <section style={{ padding: '60px 0 40px' }}>
          <Title 
            level={2} 
            style={{ 
              textAlign: 'left', 
              marginBottom: 40,
              fontSize: '32px',
              color: '#1e293b',
              fontWeight: 'bold'
            }}
          >
            按类别浏览
          </Title>
          <Row gutter={[20, 20]} justify="center">
            {componentCategories.map((category, index) => (
              <Col xs={12} sm={8} md={6} lg={4} key={index}>
                <Card
                  hoverable
                  style={{
                    height: '140px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                  styles={{ 
                    body: {
                      padding: '20px 16px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }
                  }}
                  onClick={() => handleCategoryClick(category.title)}
                >
                  <div 
                    style={{ 
                      fontSize: '24px', 
                      marginBottom: 12,
                      color: category.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {category.icon}
                  </div>
                  <Title 
                    level={5} 
                    style={{ 
                      marginBottom: 4, 
                      color: category.color,
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    {category.title}
                  </Title>
                  <Text 
                    style={{ 
                      color: '#64748b',
                      fontSize: '12px',
                      textAlign: 'center'
                    }}
                  >
                    {category.subtitle}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* 服务和工具 - 类似 doEEEt 的 Services and tools */}
        <section style={{ padding: '40px 0' }}>
          <Title 
            level={2} 
            style={{ 
              textAlign: 'left', 
              marginBottom: 40,
              fontSize: '32px',
              color: '#1e293b',
              fontWeight: 'bold'
            }}
          >
            服务和工具
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  height: '200px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
                onClick={() => handleModuleClick('/standards/search')}
              >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <FileSearchOutlined 
                    style={{ 
                      fontSize: '48px', 
                      color: '#3b82f6',
                      marginBottom: 16 
                    }} 
                  />
                  <Title level={4} style={{ marginBottom: 8, color: '#1e293b' }}>
                    标准查询
                  </Title>
                  <Paragraph style={{ color: '#64748b', margin: 0 }}>
                    查询国际和行业标准，获取最新的技术规范和认证要求。
                  </Paragraph>
                  <Button 
                    type="link" 
                    style={{ 
                      marginTop: 12,
                      color: '#3b82f6',
                      fontWeight: '500'
                    }}
                  >
                    进入工具 <RightOutlined />
                  </Button>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  height: '200px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
                onClick={() => handleModuleClick('/components/compare')}
              >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <DiffOutlined 
                    style={{ 
                      fontSize: '48px', 
                      color: '#10b981',
                      marginBottom: 16 
                    }} 
                  />
                  <Title level={4} style={{ marginBottom: 8, color: '#1e293b' }}>
                    器件比对
                  </Title>
                  <Paragraph style={{ color: '#64748b', margin: 0 }}>
                    在同一显示屏中比较多个器件，通过参数筛选找到最佳选择。
                  </Paragraph>
                  <Button 
                    type="link" 
                    style={{ 
                      marginTop: 12,
                      color: '#10b981',
                      fontWeight: '500'
                    }}
                  >
                    进入工具 <RightOutlined />
                  </Button>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  height: '200px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
                onClick={() => handleModuleClick('/procurement/online')}
              >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <ShoppingCartOutlined 
                    style={{ 
                      fontSize: '48px', 
                      color: '#f59e0b',
                      marginBottom: 16 
                    }} 
                  />
                  <Title level={4} style={{ marginBottom: 8, color: '#1e293b' }}>
                    在线采购
                  </Title>
                  <Paragraph style={{ color: '#64748b', margin: 0 }}>
                    快速便捷的器件采购平台，添加器件到购物车并获取报价。
                  </Paragraph>
                  <Button 
                    type="link" 
                    style={{ 
                      marginTop: 12,
                      color: '#f59e0b',
                      fontWeight: '500'
                    }}
                  >
                    进入工具 <RightOutlined />
                  </Button>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  height: '200px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
                onClick={() => handleModuleClick('/application/models')}
              >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <BarChartOutlined 
                    style={{ 
                      fontSize: '48px', 
                      color: '#8b5cf6',
                      marginBottom: 16 
                    }} 
                  />
                  <Title level={4} style={{ marginBottom: 8, color: '#1e293b' }}>
                    数字模型
                  </Title>
                  <Paragraph style={{ color: '#64748b', margin: 0 }}>
                    访问器件的数字化模型和仿真数据，支持设计验证和分析。
                  </Paragraph>
                  <Button 
                    type="link" 
                    style={{ 
                      marginTop: 12,
                      color: '#8b5cf6',
                      fontWeight: '500'
                    }}
                  >
                    进入工具 <RightOutlined />
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </section>

        {/* 内容和资源 - 类似 doEEEt 的 Content and resources */}
        <section style={{ padding: '40px 0 60px' }}>
          <Title 
            level={2} 
            style={{ 
              textAlign: 'left', 
              marginBottom: 40,
              fontSize: '32px',
              color: '#1e293b',
              fontWeight: 'bold'
            }}
          >
            内容和资源
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card
                hoverable
                style={{
                  height: '160px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
                onClick={() => handleModuleClick('/documents/technical')}
              >
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <BookOutlined 
                    style={{ 
                      fontSize: '48px', 
                      color: '#3b82f6',
                      marginRight: 20 
                    }} 
                  />
                  <div style={{ flex: 1 }}>
                    <Title level={4} style={{ marginBottom: 8, color: '#1e293b' }}>
                      技术博客：掌握高可靠器件最新动态
                    </Title>

                    <Button 
                      type="link" 
                      style={{ 
                        padding: 0,
                        marginTop: 8,
                        color: '#3b82f6',
                        fontWeight: '500'
                      }}
                    >
                      访问技术博客 <RightOutlined />
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                hoverable
                style={{
                  height: '160px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
                onClick={() => handleModuleClick('/documents/training')}
              >
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <TrophyOutlined 
                    style={{ 
                      fontSize: '48px', 
                      color: '#10b981',
                      marginRight: 20 
                    }} 
                  />
                  <div style={{ flex: 1 }}>
                    <Title level={4} style={{ marginBottom: 8, color: '#1e293b' }}>
                      活动/网络研讨会：不错过任何活动
                    </Title>

                    <Button 
                      type="link" 
                      style={{ 
                        padding: 0,
                        marginTop: 8,
                        color: '#10b981',
                        fontWeight: '500'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModuleClick('/documents/training');
                      }}
                    >
                      查看日程表 <RightOutlined />
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
