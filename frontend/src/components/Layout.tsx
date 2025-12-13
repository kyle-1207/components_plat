import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout as AntLayout,
  Menu,
  Dropdown,
  Avatar,
  theme,
  Space,
  Row,
  Col,
  Button,
  Drawer,
} from 'antd';

import {
  DashboardOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  ExperimentOutlined,
  SafetyOutlined,
  ToolOutlined,
  BookOutlined,
  CloudServerOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import './layout.css';

const { Header, Content } = AntLayout;

const Layout: React.FC = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 菜单项配置 - 基于7大核心模块
  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '首页',
    },
    {
      key: '/standards',
      icon: <BookOutlined />,
      label: '标准服务',
      children: [
        {
          key: '/standards/search',
          label: '标准查询',
        },
        {
          key: '/standards/compare',
          label: '标准对比',
        },
        {
          key: '/standards/versions',
          label: '版本管理',
        },
        {
          key: '/standards/analysis',
          label: '标准解析',
        },
      ],
    },
    {
      key: '/components',
      icon: <SearchOutlined />,
      label: '器件查询',
      children: [
        {
          key: '/components/search',
          label: '智能搜索',
        },
        {
          key: '/components/compare',
          label: '器件比对',
        },
        {
          key: '/components/suppliers',
          label: '供应商检索',
        },
        {
          key: '/components/selection',
          label: '在线选用',
        },
        {
          key: '/components/radiation-data',
          label: '辐照数据查询',
        },
        {
          key: '/quality/premium-products',
          label: '优质产品',
        },
      ],
    },
    {
      key: '/procurement',
      icon: <ShoppingCartOutlined />,
      label: '采购服务',
      children: [
        {
          key: '/procurement/sourcing',
          label: '货源开发',
        },
        {
          key: '/procurement/online',
          label: '在线采购',
        },
        {
          key: '/procurement/inventory',
          label: '库存追踪',
        },
        {
          key: '/procurement/supply-chain',
          label: '供应链监控',
        },
      ],
    },
    {
      key: '/application',
      icon: <ToolOutlined />,
      label: '应用支持',
      children: [
        {
          key: '/application/units',
          label: '功能单元',
        },
        {
          key: '/application/models',
          label: '数字模型',
        },
        {
          key: '/application/simulation',
          label: '应用仿真',
        },
        {
          key: '/application/qpl',
          label: '合格产品目录',
        },
        {
          key: '/application/counterfeit',
          label: '假冒伪劣库',
        },
      ],
    },
    {
      key: '/quality',
      icon: <SafetyOutlined />,
      label: '质量管理',
      children: [
        {
          key: '/quality/zero-defect',
          label: '质量归零',
        },
        {
          key: '/quality/notification',
          label: '质量通报',
        },
        {
          key: '/quality/warning',
          label: '预警发布',
        },
        {
          key: '/quality/traceability',
          label: '追溯查询',
        },
      ],
    },
    {
      key: '/testing',
      icon: <ExperimentOutlined />,
      label: '试验检测',
      children: [
        {
          key: '/testing/routine',
          label: '常规检测',
        },
        {
          key: '/testing/qualification',
          label: '器件鉴定',
        },
        {
          key: '/testing/radiation',
          label: '辐照评估',
        },
        {
          key: '/testing/supply-security',
          label: '供应安全评价',
        },
      ],
    },
    {
      key: '/documents',
      icon: <CloudServerOutlined />,
      label: '资料及培训',
      children: [
        {
          key: '/documents/technical',
          label: '技术文档',
        },
        {
          key: '/documents/test-data',
          label: '测试数据',
        },
        {
          key: '/documents/news',
          label: '技术动态',
        },
        {
          key: '/documents/training',
          label: '技术培训',
        },
        {
          key: '/documents/policy',
          label: '政策法规',
        },
      ],
    },
  ];

  // 根据用户角色过滤菜单
  const filteredMenuItems = menuItems.filter(item => {
    if (!('roles' in item) || !item.roles) return true;
    const roles = item.roles as string[];
    return Array.isArray(roles) && roles.includes(user?.role || '');
  });

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header className="top-navigation" style={{ 
        background: '#001529',
        padding: '0 24px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}>
        <Row justify="space-between" align="middle" style={{ height: '100%' }}>
          <Col flex="auto">
            <div 
              className="platform-logo"
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer' }}
            >
              <span style={{ 
                color: '#ffffff', 
                fontSize: '24px', 
                fontWeight: 'bold',
                letterSpacing: '2px'
              }}>
                CASI
              </span>
            </div>
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={filteredMenuItems}
              onClick={handleMenuClick}
              style={{ 
                background: 'transparent',
                border: 'none',
                display: 'inline-block',
                lineHeight: '64px',
              }}
              className="desktop-menu"
            />
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuVisible(true)}
              className="mobile-menu-trigger"
              style={{ color: 'white', display: 'none' }}
            />
          </Col>
          <Col>
            <Space>
              <span className="user-info">
                欢迎，{user?.username}
              </span>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <Avatar 
                  style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                  icon={<UserOutlined />}
                />
              </Dropdown>
            </Space>
          </Col>
        </Row>
      </Header>

      {/* 移动端抽屉菜单 */}
      <Drawer
        title="导航菜单"
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={filteredMenuItems}
          onClick={(info) => {
            handleMenuClick(info);
            setMobileMenuVisible(false);
          }}
        />
      </Drawer>

      <Content
        className="main-content"
        style={{
          marginTop: '64px',
          padding: location.pathname === '/' ? '0' : '24px',
          minHeight: 'calc(100vh - 64px)',
          background: location.pathname === '/' ? 'transparent' : colorBgContainer,
        }}
      >
        <Outlet />
      </Content>
    </AntLayout>
  );
};

export default Layout;
