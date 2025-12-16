import React, { useState, useEffect, useMemo } from 'react';
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
  source?: 'import' | 'domestic';
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
  source = 'import',
  lockTopCategory
}) => {
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [subCategories, setSubCategories] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // 确保 source 有有效的默认值或兜底逻辑
  const effectiveSource: 'import' | 'domestic' = (source === 'domestic' ? 'domestic' : 'import');
  
  // 根据 source 获取顶层分类列表（使用 useMemo 缓存）
  const topCategories = useMemo((): string[] => {
    if (effectiveSource === 'domestic') {
      // 国产分类：从 subCategories 中提取 level1（顶层分类）
      const topCats = Object.keys(subCategories);
      if (topCats.length > 0) {
        return topCats;
      }
      // 如果 subCategories 为空，尝试从 categoryTree 中提取
      if (categoryTree.length > 0) {
        return categoryTree.map(node => node.value || node.label);
      }
      // 默认返回国产分类的顶层分类（从 classification.json 提取的 level1）
      return [
        '数字单片集成电路',
        '模拟单片集成电路',
        '混合集成电路',
        '半导体分立器件',
        '固态微波器件与电路',
        '真空电子器件',
        '光电子器件',
        '机电组件',
        '电能源',
        '通用与特种元件',
        '微系统'
      ];
    } else {
      // 进口分类：使用硬编码的 TOP_CATEGORIES
      return TOP_CATEGORIES;
    }
  }, [effectiveSource, subCategories, categoryTree]);
  
  const [selectedTopCategory, setSelectedTopCategory] = useState<string>(
    lockTopCategory || (topCategories.length > 0 ? topCategories[0] : '')
  );

  // 加载分类树，source 变化时重新加载
  useEffect(() => {
    console.log('[CategoryFilter] source changed:', effectiveSource);
    loadCategoryTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveSource]);
  
  // 当 topCategories 更新时，确保 selectedTopCategory 在有效的分类列表中
  useEffect(() => {
    if (topCategories.length > 0 && !lockTopCategory) {
      // 如果当前选中的分类不在列表中，或者列表为空，重置为第一个分类
      if (!topCategories.includes(selectedTopCategory) || selectedTopCategory === '') {
        setSelectedTopCategory(topCategories[0]);
      }
    }
  }, [topCategories, selectedTopCategory, lockTopCategory]);

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
      if (!lockTopCategory && topCategories.length > 0) {
        setSelectedTopCategory(topCategories[0]);
      }
    } else if (selectedCategory.length > 0) {
      // 如果有选中的分类，将 Tab 切换到对应的顶层分类
      const topCategory = selectedCategory[selectedCategory.length - 1];
      if (!lockTopCategory || topCategory === lockTopCategory) {
        setSelectedTopCategory(topCategory);
      }
    }
  }, [selectedCategory, lockTopCategory, topCategories]);

  /**
   * 从后端加载分类树数据
   * 当 source 为 'domestic' 时加载国产分类树(classification.json)，
   * 否则加载进口分类树(DoEEEt)
   */
  const loadCategoryTree = async () => {
    setLoading(true);
    try {
      // 根据 source 选择对应的接口
      const endpoint = effectiveSource === 'domestic' 
        ? '/api/domestic/categories/tree' 
        : '/api/doeeet/categories/tree';
      
      console.log('[CategoryFilter] Loading category tree from:', endpoint, 'source:', effectiveSource);
      
      const data = await httpClient.get<{ tree: CategoryNode[]; subCategories: any }>(endpoint, {
        timeoutMs: 15000,
      });
      const fullTree = (data?.tree || []) as CategoryNode[];
      console.log('[CategoryFilter] Loaded category tree:', fullTree.length, 'categories');
      console.log('[CategoryFilter] SubCategories:', data?.subCategories);
      setCategoryTree(fullTree);
      setSubCategories(data?.subCategories || {});
      
      // 如果当前选中的顶层分类不在新的分类列表中，重置为第一个分类
      if (effectiveSource === 'domestic' && !lockTopCategory) {
        const newTopCats = Object.keys(data?.subCategories || {});
        if (newTopCats.length > 0 && !newTopCats.includes(selectedTopCategory)) {
          setSelectedTopCategory(newTopCats[0]);
        }
      }
    } catch (error: any) {
      console.error('[CategoryFilter] 加载分类树失败:', error);
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
          items={(lockTopCategory ? [lockTopCategory] : topCategories).map(category => ({
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

