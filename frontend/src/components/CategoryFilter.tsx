import React, { useState, useEffect } from 'react';
import { Card, Tabs, Space, Typography, Tag, List, message } from 'antd';
import { FolderOutlined, AppstoreOutlined } from '@ant-design/icons';
import httpClient from '@/utils/httpClient';

const { Text } = Typography;
// TabPane 已弃用，改用 items 属性

// 15个顶层分类（从 meta.json 分析结果）
const TOP_CATEGORIES = [
  "Cable Assemblies",
  "Capacitors",
  "Connectors",
  "Crystals and Oscillators",
  "Discretes",
  "Filters",
  "Inductors",
  "Microcircuits",
  "Relays",
  "Resistors",
  "RF Passive Components",
  "Switches",
  "Thermistors",
  "Transformers",
  "Wires and Cables",
];

interface CategoryFilterProps {
  onCategoryChange: (categoryPath: string[]) => void;
  selectedCategory?: string[];
  /**
   * 锁定顶层分类：
   * - 设置后，“浏览所有分类”只显示该顶层分类及其子类
   * - 用于在进入具体器件分类页面时只聚焦该大类，提升检索效率
   */
  lockTopCategory?: string;
}

interface CategoryNode {
  label: string;
  value: string;
  children?: CategoryNode[];
}

/**
 * 分类筛选组件：保留 Tab + 侧边栏浏览（完整导航）
 */
const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  onCategoryChange, 
  selectedCategory,
  lockTopCategory
}) => {
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [selectedTopCategory, setSelectedTopCategory] = useState<string>(lockTopCategory || TOP_CATEGORIES[0]);
  const [subCategories, setSubCategories] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // 加载 meta.json 数据并构建分类树
  useEffect(() => {
    loadCategoryTree();
  }, []);

  // 当锁定顶层分类变化时，同步激活的顶层分类
  useEffect(() => {
    if (lockTopCategory) {
      setSelectedTopCategory(lockTopCategory);
    }
  }, [lockTopCategory]);

  // 当 selectedCategory 被清空时，重置 Tab 到第一个顶层分类
  useEffect(() => {
    if (!selectedCategory || selectedCategory.length === 0) {
      // 清空分类时，重置到第一个顶层分类（如果没有锁定）
      if (!lockTopCategory) {
        setSelectedTopCategory(TOP_CATEGORIES[0]);
      }
    } else if (selectedCategory.length > 0) {
      // 如果有选中的分类，将 Tab 切换到对应的顶层分类
      const topCategory = selectedCategory[selectedCategory.length - 1];
      if (!lockTopCategory || topCategory === lockTopCategory) {
        setSelectedTopCategory(topCategory);
      }
    }
  }, [selectedCategory, lockTopCategory]);

  /**
   * 从后端加载 meta.json 数据并构建分类树
   */
  const loadCategoryTree = async () => {
    setLoading(true);
    try {
      const data = await httpClient.get<{ tree: CategoryNode[]; subCategories: any }>('/api/doeeet/categories/tree', {
        timeoutMs: 15000,
      });
      const fullTree = (data?.tree || []) as CategoryNode[];
      setCategoryTree(fullTree);
      setSubCategories(data?.subCategories || {});
    } catch (error: any) {
      console.error('加载分类树失败:', error);
      message.error(error?.message || '分类加载失败，请检查网络或稍后重试');
      setCategoryTree([]);
      setSubCategories({});
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理Tab切换（选择顶层分类）
   * 点击Tab时自动触发分类筛选，显示该分类下的器件
   */
  const handleTopCategoryChange = (key: string) => {
    // 避免重复设置相同的值导致无限循环
    if (selectedTopCategory === key) {
      return;
    }
    setSelectedTopCategory(key);
    // 自动触发分类筛选：只选择主分类
    onCategoryChange([key]);
  };

  /**
   * 处理子分类点击
   */
  const handleSubCategoryClick = (categoryPath: string[]) => {
    // 注意：数据库中的 family_path 是从具体到一般的顺序
    // 例如: ["Film", "Resistors"] 表示 Film(子类) -> Resistors(父类)
    // 所以我们需要反转数组顺序
    const reversedPath = [...categoryPath].reverse();
    onCategoryChange(reversedPath);
  };

  /**
   * 渲染子分类树（递归）
   */
  const renderSubCategoryTree = (topCategory: string) => {
    const subs = subCategories[topCategory] || {};
    
    return (
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {Object.keys(subs).length === 0 ? (
          <Text type="secondary">暂无子分类数据</Text>
        ) : (
          <List
            size="small"
            dataSource={Object.entries(subs)}
            renderItem={([key, items]: [string, any]) => (
              <List.Item style={{ padding: '8px 0' }}>
                <div style={{ width: '100%' }}>
                  <div 
                    style={{ marginBottom: '8px', cursor: 'pointer' }}
                    onClick={() => handleSubCategoryClick([topCategory, key])}
                  >
                    <FolderOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    <Text strong>{key}</Text>
                  </div>
                  <div style={{ paddingLeft: '24px' }}>
                    <Space size={[8, 8]} wrap>
                      {Array.isArray(items) && items.map((item: string, index: number) => (
                        <Tag
                          key={index}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSubCategoryClick([topCategory, key, item])}
                        >
                          {item}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    );
  };

  return (
    <Card 
      title={
        <Space>
          <AppstoreOutlined />
          <span>分类筛选</span>
        </Space>
      }
      loading={loading}
    >
      {/* 分类浏览 - Tab + 侧边栏 */}
      <div>
        <Text strong style={{ marginBottom: '12px', display: 'block' }}>
          {lockTopCategory ? `浏览 ${lockTopCategory} 子类：` : '浏览所有分类：'}
        </Text>
        
        <Tabs
          activeKey={selectedTopCategory}
          onChange={handleTopCategoryChange}
          type="card"
          size="small"
          items={(lockTopCategory ? [lockTopCategory] : TOP_CATEGORIES).map(category => ({
            key: category,
            label: <span style={{ fontSize: '12px' }}>{category}</span>,
            children: renderSubCategoryTree(category),
          }))}
        />
      </div>

      {/* 当前选择显示 */}
      {selectedCategory && selectedCategory.length > 0 && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#f0f2f5', borderRadius: '4px' }}>
          <Text type="secondary">当前选择：</Text>
          <div style={{ marginTop: '8px' }}>
            <Text strong>{selectedCategory.join(' > ')}</Text>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CategoryFilter;

