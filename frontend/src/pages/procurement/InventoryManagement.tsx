import React, { useState } from 'react';
import { Card, Table, Button, Input, Select, Space, Tag, Modal, Form, InputNumber, message, Tabs, Progress, Statistic, Row, Col } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExportOutlined, AlertOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface InventoryItem {
  id: string;
  componentName: string;
  model: string;
  manufacturer: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  location: string;
  lastUpdated: string;
  status: 'normal' | 'low' | 'out' | 'excess';
}

interface StockMovement {
  id: string;
  componentName: string;
  type: 'in' | 'out' | 'transfer' | 'adjust';
  quantity: number;
  reason: string;
  operator: string;
  date: string;
}

const InventoryManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [movementModalVisible, setMovementModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editForm] = Form.useForm();
  const [movementForm] = Form.useForm();

  // 模拟库存数据
  const mockInventoryData: InventoryItem[] = [
    {
      id: '1',
      componentName: '运算放大器',
      model: 'LM358',
      manufacturer: 'TI',
      currentStock: 150,
      minStock: 100,
      maxStock: 1000,
      unitPrice: 2.5,
      totalValue: 375,
      location: 'A-01-01',
      lastUpdated: '2024-01-15',
      status: 'normal'
    },
    {
      id: '2',
      componentName: '电阻',
      model: 'RC0805FR-071KL',
      manufacturer: 'Yageo',
      currentStock: 50,
      minStock: 100,
      maxStock: 5000,
      unitPrice: 0.1,
      totalValue: 5,
      location: 'B-02-03',
      lastUpdated: '2024-01-14',
      status: 'low'
    },
    {
      id: '3',
      componentName: '电容',
      model: 'CC0805KRX7R9BB104',
      manufacturer: 'Yageo',
      currentStock: 0,
      minStock: 200,
      maxStock: 2000,
      unitPrice: 0.05,
      totalValue: 0,
      location: 'C-01-05',
      lastUpdated: '2024-01-13',
      status: 'out'
    }
  ];

  // 模拟出入库记录
  const mockMovementData: StockMovement[] = [
    {
      id: '1',
      componentName: 'LM358',
      type: 'in',
      quantity: 500,
      reason: '采购入库',
      operator: '张三',
      date: '2024-01-15 10:30'
    },
    {
      id: '2',
      componentName: 'RC0805FR-071KL',
      type: 'out',
      quantity: 200,
      reason: '生产领用',
      operator: '李四',
      date: '2024-01-14 14:20'
    }
  ];

  const inventoryColumns: ColumnsType<InventoryItem> = [
    {
      title: '器件名称',
      dataIndex: 'componentName',
      key: 'componentName',
      width: 120,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 150,
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 100,
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 100,
      render: (stock: number, record: InventoryItem) => (
        <span style={{ color: record.status === 'low' ? '#ff4d4f' : record.status === 'out' ? '#ff4d4f' : '#52c41a' }}>
          {stock.toLocaleString()}
        </span>
      ),
    },
    {
      title: '库存范围',
      key: 'stockRange',
      width: 120,
      render: (_, record: InventoryItem) => (
        <span>{record.minStock} - {record.maxStock}</span>
      ),
    },
    {
      title: '单价(¥)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '库存价值(¥)',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 120,
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '库位',
      dataIndex: 'location',
      key: 'location',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          normal: { color: 'green', text: '正常' },
          low: { color: 'orange', text: '库存不足' },
          out: { color: 'red', text: '缺货' },
          excess: { color: 'blue', text: '库存过多' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" onClick={() => handleMovement(record)}>
            出入库
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const movementColumns: ColumnsType<StockMovement> = [
    {
      title: '器件型号',
      dataIndex: 'componentName',
      key: 'componentName',
      width: 150,
    },
    {
      title: '操作类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap = {
          in: { color: 'green', text: '入库' },
          out: { color: 'red', text: '出库' },
          transfer: { color: 'blue', text: '调拨' },
          adjust: { color: 'orange', text: '调整' }
        };
        const config = typeMap[type as keyof typeof typeMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity: number, record: StockMovement) => (
        <span style={{ color: record.type === 'in' ? '#52c41a' : '#ff4d4f' }}>
          {record.type === 'in' ? '+' : '-'}{quantity}
        </span>
      ),
    },
    {
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: '操作时间',
      dataIndex: 'date',
      key: 'date',
      width: 150,
    },
  ];

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    editForm.setFieldsValue(item);
    setEditModalVisible(true);
  };

  const handleMovement = (item: InventoryItem) => {
    setSelectedItem(item);
    movementForm.setFieldsValue({ componentName: item.componentName, model: item.model });
    setMovementModalVisible(true);
  };

  const handleEditSubmit = (values: any) => {
    console.log('编辑库存:', values);
    message.success('库存信息更新成功！');
    setEditModalVisible(false);
    editForm.resetFields();
  };

  const handleMovementSubmit = (values: any) => {
    console.log('出入库操作:', values);
    message.success('出入库操作成功！');
    setMovementModalVisible(false);
    movementForm.resetFields();
  };

  // 统计数据
  const totalValue = mockInventoryData.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockCount = mockInventoryData.filter(item => item.status === 'low' || item.status === 'out').length;
  const totalItems = mockInventoryData.length;

  return (
    <div style={{ padding: 24 }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="库存总价值" value={totalValue} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="库存品种数" value={totalItems} suffix="种" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="预警数量" 
              value={lowStockCount} 
              suffix="种"
              valueStyle={{ color: lowStockCount > 0 ? '#cf1322' : '#3f8600' }}
              prefix={lowStockCount > 0 ? <AlertOutlined /> : undefined}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div>
              <div style={{ marginBottom: 8 }}>库存健康度</div>
              <Progress 
                percent={Math.round(((totalItems - lowStockCount) / totalItems) * 100)} 
                status={lowStockCount > totalItems * 0.2 ? 'exception' : 'success'}
                strokeColor={lowStockCount > totalItems * 0.2 ? '#ff4d4f' : '#52c41a'}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="inventory">
          <TabPane tab="库存管理" key="inventory">
            <Space style={{ marginBottom: 16 }} wrap>
              <Search
                placeholder="搜索器件名称、型号"
                onSearch={(value) => console.log('搜索:', value)}
                style={{ width: 300 }}
                enterButton={<SearchOutlined />}
              />
              <Select placeholder="库存状态" style={{ width: 150 }}>
                <Option value="normal">正常</Option>
                <Option value="low">库存不足</Option>
                <Option value="out">缺货</Option>
                <Option value="excess">库存过多</Option>
              </Select>
              <Select placeholder="库位" style={{ width: 150 }}>
                <Option value="A">A区</Option>
                <Option value="B">B区</Option>
                <Option value="C">C区</Option>
              </Select>
              <Button type="primary" icon={<PlusOutlined />}>
                新增库存
              </Button>
              <Button icon={<ExportOutlined />}>
                导出数据
              </Button>
            </Space>

            <Table
              columns={inventoryColumns}
              dataSource={mockInventoryData}
              rowKey="id"
              loading={loading}
              pagination={{
                current: 1,
                pageSize: 10,
                total: 100,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
            />
          </TabPane>

          <TabPane tab="出入库记录" key="movements">
            <Space style={{ marginBottom: 16 }} wrap>
              <Search
                placeholder="搜索器件型号、操作人"
                onSearch={(value) => console.log('搜索:', value)}
                style={{ width: 300 }}
                enterButton={<SearchOutlined />}
              />
              <Select placeholder="操作类型" style={{ width: 150 }}>
                <Option value="in">入库</Option>
                <Option value="out">出库</Option>
                <Option value="transfer">调拨</Option>
                <Option value="adjust">调整</Option>
              </Select>
              <Button icon={<ExportOutlined />}>
                导出记录
              </Button>
            </Space>

            <Table
              columns={movementColumns}
              dataSource={mockMovementData}
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
          </TabPane>
        </Tabs>
      </Card>

      {/* 编辑库存模态框 */}
      <Modal
        title="编辑库存信息"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="componentName" label="器件名称">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="model" label="型号">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="currentStock"
                label="当前库存"
                rules={[{ required: true, message: '请输入当前库存' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="minStock"
                label="最小库存"
                rules={[{ required: true, message: '请输入最小库存' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxStock"
                label="最大库存"
                rules={[{ required: true, message: '请输入最大库存' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="unitPrice"
                label="单价"
                rules={[{ required: true, message: '请输入单价' }]}
              >
                <InputNumber min={0} precision={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="库位"
                rules={[{ required: true, message: '请输入库位' }]}
              >
                <Input placeholder="如：A-01-01" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 出入库操作模态框 */}
      <Modal
        title="出入库操作"
        open={movementModalVisible}
        onCancel={() => setMovementModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={movementForm}
          layout="vertical"
          onFinish={handleMovementSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="componentName" label="器件名称">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="model" label="型号">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="操作类型"
                rules={[{ required: true, message: '请选择操作类型' }]}
              >
                <Select placeholder="选择操作类型">
                  <Option value="in">入库</Option>
                  <Option value="out">出库</Option>
                  <Option value="transfer">调拨</Option>
                  <Option value="adjust">调整</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="数量"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="reason"
            label="操作原因"
            rules={[{ required: true, message: '请输入操作原因' }]}
          >
            <Input placeholder="如：采购入库、生产领用等" />
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="其他备注信息" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确认操作
              </Button>
              <Button onClick={() => setMovementModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryManagement;
