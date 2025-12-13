import React, { useState } from 'react';
import { Card, List, Button, Input, Select, Space, Tag, Avatar, Modal, Row, Col, Typography, Divider } from 'antd';
import { SearchOutlined, EyeOutlined, HeartOutlined, ShareAltOutlined, MessageOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

interface TechnicalNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'industry' | 'technology' | 'standard' | 'product' | 'research';
  tags: string[];
  author: string;
  publishDate: string;
  readCount: number;
  likeCount: number;
  commentCount: number;
  source: string;
  imageUrl?: string;
  importance: 'high' | 'medium' | 'low';
}

const TechnicalNews: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState<TechnicalNews | null>(null);

  const mockData: TechnicalNews[] = [
    {
      id: '1',
      title: 'SiC功率器件在航天应用中的最新进展',
      summary: '碳化硅(SiC)功率器件凭借其优异的高温、高频、高效率特性，在航天电源系统中的应用日益广泛。本文分析了最新的技术发展趋势...',
      content: `
        <h3>引言</h3>
        <p>碳化硅(SiC)功率器件作为第三代半导体技术的代表，在航天应用领域展现出了巨大的潜力。相比传统硅器件，SiC器件具有更高的击穿电压、更低的导通电阻和更优异的高温性能。</p>
        
        <h3>技术特点</h3>
        <p>1. 高温工作能力：可在200°C以上环境稳定工作</p>
        <p>2. 高效率：开关损耗比硅器件降低50%以上</p>
        <p>3. 高频性能：开关频率可达MHz级别</p>
        <p>4. 辐射抗性：在航天辐射环境下表现优异</p>
        
        <h3>应用前景</h3>
        <p>在航天电源管理、电机驱动、DC/DC变换器等关键系统中，SiC器件正在逐步替代传统硅器件，为航天器提供更高效、更可靠的电源解决方案。</p>
      `,
      category: 'technology',
      tags: ['SiC', '功率器件', '航天应用', '电源管理'],
      author: '张技术',
      publishDate: '2024-01-20',
      readCount: 1256,
      likeCount: 89,
      commentCount: 23,
      source: '航天电子技术',
      importance: 'high'
    },
    {
      id: '2',
      title: 'GJB 548D-2024标准正式发布',
      summary: '新版微电路破坏性物理分析标准正式发布，对航天级器件的可靠性评价提出了更严格的要求...',
      content: `
        <h3>标准概述</h3>
        <p>GJB 548D-2024《微电路破坏性物理分析》标准已于2024年1月正式发布实施，该标准是对GJB 548C-2005的重大修订。</p>
        
        <h3>主要变化</h3>
        <p>1. 增加了新的测试方法和评价指标</p>
        <p>2. 对高密度封装器件提出了专门要求</p>
        <p>3. 完善了辐射效应评价方法</p>
        <p>4. 加强了质量一致性检查要求</p>
        
        <h3>影响分析</h3>
        <p>新标准的实施将进一步提升我国航天级微电路产品的质量水平，为航天任务的成功提供更可靠的器件保障。</p>
      `,
      category: 'standard',
      tags: ['GJB 548D', '标准', '可靠性', '物理分析'],
      author: '李标准',
      publishDate: '2024-01-18',
      readCount: 2134,
      likeCount: 156,
      commentCount: 45,
      source: '标准化研究院',
      importance: 'high'
    },
    {
      id: '3',
      title: 'FPGA在卫星通信系统中的创新应用',
      summary: '随着卫星通信技术的快速发展，FPGA凭借其灵活的可编程特性，在信号处理、协议转换等方面发挥着重要作用...',
      content: `
        <h3>应用背景</h3>
        <p>现代卫星通信系统对信号处理的实时性和灵活性要求越来越高，传统的专用芯片已难以满足快速变化的需求。FPGA作为可编程逻辑器件，为卫星通信系统提供了理想的解决方案。</p>
        
        <h3>关键技术</h3>
        <p>1. 数字信号处理：实现高效的调制解调算法</p>
        <p>2. 协议处理：支持多种通信协议的灵活切换</p>
        <p>3. 波束成形：实现自适应天线阵列控制</p>
        <p>4. 错误纠正：提供强大的信道编解码能力</p>
        
        <h3>发展趋势</h3>
        <p>未来FPGA在卫星通信中的应用将向着更高集成度、更低功耗、更强抗辐射能力的方向发展。</p>
      `,
      category: 'product',
      tags: ['FPGA', '卫星通信', '信号处理', '可编程'],
      author: '王通信',
      publishDate: '2024-01-15',
      readCount: 987,
      likeCount: 67,
      commentCount: 18,
      source: '卫星通信技术',
      importance: 'medium'
    },
    {
      id: '4',
      title: '航天级连接器可靠性研究新突破',
      summary: '某研究团队在航天级连接器的可靠性评价方法上取得重要进展，提出了新的失效模式分析方法...',
      content: `
        <h3>研究背景</h3>
        <p>航天级连接器作为航天器电气系统的关键组件，其可靠性直接影响到整个系统的安全性。传统的可靠性评价方法存在一定的局限性。</p>
        
        <h3>创新成果</h3>
        <p>1. 建立了新的失效物理模型</p>
        <p>2. 开发了加速老化试验方法</p>
        <p>3. 提出了多应力耦合评价技术</p>
        <p>4. 构建了寿命预测算法</p>
        
        <h3>应用价值</h3>
        <p>该研究成果为航天级连接器的设计、制造和应用提供了重要的理论支撑和技术指导。</p>
      `,
      category: 'research',
      tags: ['连接器', '可靠性', '失效分析', '研究'],
      author: '赵研究',
      publishDate: '2024-01-12',
      readCount: 756,
      likeCount: 43,
      commentCount: 12,
      source: '可靠性研究所',
      importance: 'medium'
    },
    {
      id: '5',
      title: '2024年航天电子器件市场展望',
      summary: '分析2024年全球航天电子器件市场的发展趋势，包括技术创新、市场规模、竞争格局等方面...',
      content: `
        <h3>市场概况</h3>
        <p>2024年全球航天电子器件市场预计将继续保持稳定增长，市场规模有望达到新的高度。商业航天的快速发展为市场注入了新的活力。</p>
        
        <h3>发展趋势</h3>
        <p>1. 小型化、集成化趋势明显</p>
        <p>2. 成本控制要求日益严格</p>
        <p>3. 批量化生产需求增长</p>
        <p>4. 国产化替代步伐加快</p>
        
        <h3>机遇挑战</h3>
        <p>面对新的发展机遇，航天电子器件行业也面临着技术升级、质量提升、成本控制等多重挑战。</p>
      `,
      category: 'industry',
      tags: ['市场分析', '航天电子', '发展趋势', '2024'],
      author: '钱市场',
      publishDate: '2024-01-10',
      readCount: 1543,
      likeCount: 98,
      commentCount: 34,
      source: '航天产业研究',
      importance: 'high'
    }
  ];

  const getCategoryColor = (category: string) => {
    const colorMap = {
      industry: 'blue',
      technology: 'green',
      standard: 'orange',
      product: 'purple',
      research: 'red'
    };
    return colorMap[category as keyof typeof colorMap] || 'default';
  };

  const getCategoryText = (category: string) => {
    const textMap = {
      industry: '行业动态',
      technology: '技术前沿',
      standard: '标准更新',
      product: '产品资讯',
      research: '研究成果'
    };
    return textMap[category as keyof typeof textMap] || '其他';
  };

  const getImportanceColor = (importance: string) => {
    const colorMap = {
      high: '#f5222d',
      medium: '#fa8c16',
      low: '#52c41a'
    };
    return colorMap[importance as keyof typeof colorMap];
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="技术动态" extra={
        <Space>
          <Button type="primary">订阅推送</Button>
        </Space>
      }>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索技术动态"
            onSearch={(value) => console.log('搜索:', value)}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          <Select placeholder="分类" style={{ width: 120 }}>
            <Option value="industry">行业动态</Option>
            <Option value="technology">技术前沿</Option>
            <Option value="standard">标准更新</Option>
            <Option value="product">产品资讯</Option>
            <Option value="research">研究成果</Option>
          </Select>
          <Select placeholder="重要程度" style={{ width: 120 }}>
            <Option value="high">高</Option>
            <Option value="medium">中</Option>
            <Option value="low">低</Option>
          </Select>
        </Space>

        <List
          itemLayout="vertical"
          size="large"
          pagination={{
            current: 1,
            pageSize: 5,
            total: 50,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          dataSource={mockData}
          loading={loading}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <Button 
                  type="link" 
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSelectedNews(item);
                    setDetailModalVisible(true);
                  }}
                >
                  阅读全文
                </Button>,
                <Button type="link" icon={<HeartOutlined />}>
                  {item.likeCount}
                </Button>,
                <Button type="link" icon={<MessageOutlined />}>
                  {item.commentCount}
                </Button>,
                <Button type="link" icon={<ShareAltOutlined />}>
                  分享
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div style={{ position: 'relative' }}>
                    <Avatar size={48} icon={<UserOutlined />} />
                    {item.importance === 'high' && (
                      <div style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        width: 12,
                        height: 12,
                        backgroundColor: '#f5222d',
                        borderRadius: '50%',
                        border: '2px solid white'
                      }} />
                    )}
                  </div>
                }
                title={
                  <div>
                    <Title level={4} style={{ margin: 0, display: 'inline' }}>
                      {item.title}
                    </Title>
                    <Tag 
                      color={getCategoryColor(item.category)} 
                      style={{ marginLeft: 8 }}
                    >
                      {getCategoryText(item.category)}
                    </Tag>
                    {item.importance === 'high' && (
                      <Tag color="red" style={{ marginLeft: 4 }}>置顶</Tag>
                    )}
                  </div>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <Space>
                        <Text type="secondary">
                          <CalendarOutlined /> {item.publishDate}
                        </Text>
                        <Text type="secondary">作者: {item.author}</Text>
                        <Text type="secondary">来源: {item.source}</Text>
                        <Text type="secondary">阅读: {item.readCount}</Text>
                      </Space>
                    </div>
                    <Paragraph ellipsis={{ rows: 2 }}>
                      {item.summary}
                    </Paragraph>
                    <div>
                      <Space wrap>
                        {item.tags.map((tag, index) => (
                          <Tag key={index} color="blue">{tag}</Tag>
                        ))}
                      </Space>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 详情查看模态框 */}
      <Modal
        title={selectedNews?.title}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="like" icon={<HeartOutlined />}>
            点赞 ({selectedNews?.likeCount})
          </Button>,
          <Button key="share" icon={<ShareAltOutlined />}>
            分享
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedNews && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Space>
                    <Tag color={getCategoryColor(selectedNews.category)}>
                      {getCategoryText(selectedNews.category)}
                    </Tag>
                    {selectedNews.importance === 'high' && (
                      <Tag color="red">重要</Tag>
                    )}
                  </Space>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text type="secondary">
                    {selectedNews.publishDate} | {selectedNews.author} | {selectedNews.source}
                  </Text>
                </Col>
              </Row>
            </div>

            <Divider />

            <div 
              style={{ 
                lineHeight: 1.8,
                fontSize: '14px'
              }}
              dangerouslySetInnerHTML={{ __html: selectedNews.content }}
            />

            <Divider />

            <div style={{ marginTop: 16 }}>
              <Text strong>标签：</Text>
              <Space wrap style={{ marginLeft: 8 }}>
                {selectedNews.tags.map((tag, index) => (
                  <Tag key={index} color="blue">{tag}</Tag>
                ))}
              </Space>
            </div>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Space size="large">
                <Button type="primary" icon={<HeartOutlined />}>
                  点赞 ({selectedNews.likeCount})
                </Button>
                <Button icon={<MessageOutlined />}>
                  评论 ({selectedNews.commentCount})
                </Button>
                <Button icon={<ShareAltOutlined />}>
                  分享
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TechnicalNews;
