import React, { useState } from 'react';
import { Card, Table, Button, Input, Select, Space, Tag, Modal, Progress, Row, Col, Statistic, Tabs, Descriptions, Avatar, List } from 'antd';
import { SearchOutlined, EyeOutlined, PlayCircleOutlined, BookOutlined, TrophyOutlined, UserOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
// TabPane 已废弃，使用 items 属性

interface TrainingCourse {
  id: string;
  courseName: string;
  category: 'basic' | 'advanced' | 'specialized' | 'certification';
  instructor: string;
  duration: number; // 小时
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  description: string;
  objectives: string[];
  prerequisites: string[];
  materials: string[];
  price: number;
  rating: number;
  completionRate: number;
}

const TechnicalTraining: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);

  const mockData: TrainingCourse[] = [
    {
      id: '1',
      courseName: '航天级器件选型与应用基础',
      category: 'basic',
      instructor: '张专家',
      duration: 16,
      difficulty: 'beginner',
      status: 'upcoming',
      startDate: '2024-02-15',
      endDate: '2024-02-16',
      maxStudents: 30,
      currentStudents: 25,
      description: '本课程面向航天系统工程师，全面介绍航天级电子器件的选型原则、应用要点和可靠性评价方法。',
      objectives: [
        '掌握航天级器件的基本概念和分类',
        '了解器件选型的基本原则和方法',
        '熟悉可靠性评价的相关标准',
        '具备初步的器件应用能力'
      ],
      prerequisites: ['电子技术基础', '数字电路基础'],
      materials: ['教材《航天器件选型指南》', '标准GJB 548C-2005', '案例分析资料'],
      price: 2800,
      rating: 4.8,
      completionRate: 95
    },
    {
      id: '2',
      courseName: 'SiC功率器件设计与应用',
      category: 'advanced',
      instructor: '李高工',
      duration: 24,
      difficulty: 'advanced',
      status: 'ongoing',
      startDate: '2024-01-20',
      endDate: '2024-01-22',
      maxStudents: 20,
      currentStudents: 18,
      description: '深入讲解SiC功率器件的工作原理、设计方法和在航天电源系统中的应用技术。',
      objectives: [
        '深入理解SiC器件的物理特性',
        '掌握SiC器件的设计方法',
        '熟悉热管理和驱动电路设计',
        '具备系统级应用设计能力'
      ],
      prerequisites: ['功率电子技术', '半导体器件物理', '电源设计基础'],
      materials: ['SiC器件手册', '仿真软件PSIM', '实验板卡'],
      price: 4200,
      rating: 4.9,
      completionRate: 88
    },
    {
      id: '3',
      courseName: '辐射效应测试与评价',
      category: 'specialized',
      instructor: '王研究员',
      duration: 20,
      difficulty: 'intermediate',
      status: 'completed',
      startDate: '2024-01-10',
      endDate: '2024-01-12',
      maxStudents: 25,
      currentStudents: 23,
      description: '系统介绍电子器件辐射效应的测试方法、评价标准和防护技术。',
      objectives: [
        '理解各种辐射效应机理',
        '掌握辐射测试方法和标准',
        '学会辐射效应评价技术',
        '了解辐射防护设计方法'
      ],
      prerequisites: ['半导体物理', '核物理基础'],
      materials: ['辐射效应手册', '测试标准集', '案例分析'],
      price: 3600,
      rating: 4.7,
      completionRate: 92
    },
    {
      id: '4',
      courseName: 'FPGA在航天系统中的应用',
      category: 'specialized',
      instructor: '赵工程师',
      duration: 32,
      difficulty: 'intermediate',
      status: 'upcoming',
      startDate: '2024-03-01',
      endDate: '2024-03-04',
      maxStudents: 15,
      currentStudents: 12,
      description: '全面讲解FPGA技术在航天系统中的应用，包括设计方法、验证技术和可靠性保证。',
      objectives: [
        '掌握FPGA设计流程和方法',
        '学会Verilog/VHDL语言应用',
        '了解航天级FPGA特点',
        '具备系统设计和验证能力'
      ],
      prerequisites: ['数字电路设计', 'Verilog基础'],
      materials: ['FPGA开发板', 'Vivado软件', '项目案例'],
      price: 5200,
      rating: 4.6,
      completionRate: 85
    }
  ];

  const columns: ColumnsType<TrainingCourse> = [
    {
      title: '课程信息',
      key: 'courseInfo',
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{record.courseName}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            讲师: {record.instructor} | 时长: {record.duration}小时
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {record.startDate} ~ {record.endDate}
          </div>
        </div>
      ),
    },
    {
      title: '课程分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => {
        const categoryMap = {
          basic: { color: 'green', text: '基础课程' },
          advanced: { color: 'blue', text: '高级课程' },
          specialized: { color: 'purple', text: '专业课程' },
          certification: { color: 'orange', text: '认证课程' }
        };
        const config = categoryMap[category as keyof typeof categoryMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '难度等级',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 100,
      render: (difficulty: string) => {
        const difficultyMap = {
          beginner: { color: 'green', text: '初级' },
          intermediate: { color: 'orange', text: '中级' },
          advanced: { color: 'red', text: '高级' }
        };
        const config = difficultyMap[difficulty as keyof typeof difficultyMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          upcoming: { color: 'blue', text: '即将开始' },
          ongoing: { color: 'processing', text: '进行中' },
          completed: { color: 'success', text: '已完成' },
          cancelled: { color: 'error', text: '已取消' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '报名情况',
      key: 'enrollment',
      width: 120,
      render: (_, record) => (
        <div>
          <Progress 
            percent={Math.round((record.currentStudents / record.maxStudents) * 100)}
            size="small"
            format={() => `${record.currentStudents}/${record.maxStudents}`}
          />
        </div>
      )
    },
    {
      title: '价格(元)',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `¥${price.toLocaleString()}`
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (rating: number) => (
        <div>
          <TrophyOutlined style={{ color: '#faad14' }} />
          <span style={{ marginLeft: 4 }}>{rating}</span>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedCourse(record);
              setDetailModalVisible(true);
            }}
          >
            详情
          </Button>
          {record.status === 'upcoming' && (
            <Button type="link" size="small" style={{ color: '#52c41a' }}>
              报名
            </Button>
          )}
          {record.status === 'ongoing' && (
            <Button type="link" size="small" icon={<PlayCircleOutlined />}>
              学习
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="课程总数"
              value={mockData.length}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={mockData.filter(item => item.status === 'ongoing').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总学员"
              value={mockData.reduce((sum, item) => sum + item.currentStudents, 0)}
              valueStyle={{ color: '#3f8600' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均评分"
              value={4.75}
              precision={2}
              valueStyle={{ color: '#722ed1' }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="资料及培训管理">
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索课程名称或讲师"
            onSearch={(value) => console.log('搜索:', value)}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          <Select placeholder="课程分类" style={{ width: 120 }}>
            <Option value="basic">基础课程</Option>
            <Option value="advanced">高级课程</Option>
            <Option value="specialized">专业课程</Option>
            <Option value="certification">认证课程</Option>
          </Select>
          <Select placeholder="难度等级" style={{ width: 120 }}>
            <Option value="beginner">初级</Option>
            <Option value="intermediate">中级</Option>
            <Option value="advanced">高级</Option>
          </Select>
          <Select placeholder="状态" style={{ width: 120 }}>
            <Option value="upcoming">即将开始</Option>
            <Option value="ongoing">进行中</Option>
            <Option value="completed">已完成</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={mockData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: 1,
            pageSize: 10,
            total: 50,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 详情查看模态框 */}
      <Modal
        title="课程详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          selectedCourse?.status === 'upcoming' && (
            <Button key="enroll" type="primary">
              立即报名
            </Button>
          ),
          selectedCourse?.status === 'ongoing' && (
            <Button key="study" type="primary" icon={<PlayCircleOutlined />}>
              开始学习
            </Button>
          ),
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        {selectedCourse && (
          <Tabs 
            defaultActiveKey="basic"
            items={[
              {
                key: "basic",
                label: "课程信息",
                children: (
                  <>
                    <Row gutter={16}>
                <Col span={16}>
                  <Card title="基本信息" size="small">
                    <Descriptions column={2}>
                      <Descriptions.Item label="课程名称" span={2}>
                        {selectedCourse.courseName}
                      </Descriptions.Item>
                      <Descriptions.Item label="课程分类">
                        <Tag color="purple">专业课程</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="难度等级">
                        <Tag color="orange">中级</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="授课讲师">
                        <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                        {selectedCourse.instructor}
                      </Descriptions.Item>
                      <Descriptions.Item label="课程时长">
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {selectedCourse.duration} 小时
                      </Descriptions.Item>
                      <Descriptions.Item label="开课时间">
                        {selectedCourse.startDate}
                      </Descriptions.Item>
                      <Descriptions.Item label="结课时间">
                        {selectedCourse.endDate}
                      </Descriptions.Item>
                      <Descriptions.Item label="课程价格">
                        ¥{selectedCourse.price.toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="课程评分">
                        <TrophyOutlined style={{ color: '#faad14', marginRight: 4 }} />
                        {selectedCourse.rating} 分
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  <Card title="课程描述" size="small" style={{ marginTop: 16 }}>
                    <p>{selectedCourse.description}</p>
                  </Card>
                </Col>

                <Col span={8}>
                  <Card title="报名情况" size="small">
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <Progress
                        type="circle"
                        percent={Math.round((selectedCourse.currentStudents / selectedCourse.maxStudents) * 100)}
                        format={() => `${selectedCourse.currentStudents}/${selectedCourse.maxStudents}`}
                      />
                    </div>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic title="已报名" value={selectedCourse.currentStudents} />
                      </Col>
                      <Col span={12}>
                        <Statistic title="剩余名额" value={selectedCourse.maxStudents - selectedCourse.currentStudents} />
                      </Col>
                    </Row>
                  </Card>

                  <Card title="课程状态" size="small" style={{ marginTop: 16 }}>
                    <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                      即将开始
                    </Tag>
                    <div style={{ marginTop: 12, fontSize: '12px', color: '#666' }}>
                      完成率: {selectedCourse.completionRate}%
                    </div>
                  </Card>
                </Col>
              </Row>
                  </>
                )
              },
              {
                key: "objectives",
                label: "学习目标",
                children: (
                  <Card title="课程目标" size="small">
                    <List
                      dataSource={selectedCourse.objectives}
                      renderItem={(item, index) => (
                        <List.Item>
                          <div>
                            <Tag color="blue">{index + 1}</Tag>
                            {item}
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                )
              },
              {
                key: "prerequisites",
                label: "先修要求",
                children: (
                  <>
                    <Card title="先修课程/技能" size="small">
                      <Space wrap>
                        {selectedCourse.prerequisites.map((item, index) => (
                          <Tag key={index} color="orange" style={{ fontSize: '14px', padding: '4px 12px' }}>
                            {item}
                          </Tag>
                        ))}
                      </Space>
                    </Card>

                    <Card title="学习材料" size="small" style={{ marginTop: 16 }}>
                      <List
                        dataSource={selectedCourse.materials}
                        renderItem={(item) => (
                          <List.Item>
                            <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                            {item}
                          </List.Item>
                        )}
                      />
                    </Card>
                  </>
                )
              }
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default TechnicalTraining;
