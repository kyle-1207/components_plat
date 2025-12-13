import React, { useState } from 'react';
import { Card, Table, Button, Input, Select, DatePicker, Space, Tag, Modal, Form, InputNumber, message } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ProcurementItem {
  id: string;
  componentName: string;
  model: string;
  manufacturer: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplier: string;
  deliveryTime: string;
  status: 'available' | 'limited' | 'out_of_stock';
  qualificationLevel: 'A' | 'B' | 'C';
}

const OnlineProcurement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [orderForm] = Form.useForm();

  // 模拟数据
  const mockData: ProcurementItem[] = [
    {
      id: '1',
      componentName: '运算放大器',
      model: 'LM358',
      manufacturer: 'TI',
      quantity: 1000,
      unitPrice: 2.5,
      totalPrice: 2500,
      supplier: '航天电子供应商',
      deliveryTime: '7天',
      status: 'available',
      qualificationLevel: 'A'
    },
    {
      id: '2', 
      componentName: '电阻',
      model: 'RC0805FR-071KL',
      manufacturer: 'Yageo',
      quantity: 500,
      unitPrice: 0.1,
      totalPrice: 50,
      supplier: '电子元件专营',
      deliveryTime: '3天',
      status: 'limited',
      qualificationLevel: 'B'
    }
  ];

  const columns: ColumnsType<ProcurementItem> = [
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
      title: '库存数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity: number) => quantity.toLocaleString(),
    },
    {
      title: '单价(¥)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
    },
    {
      title: '交货期',
      dataIndex: 'deliveryTime',
      key: 'deliveryTime',
      width: 80,
    },
    {
      title: '库存状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          available: { color: 'green', text: '充足' },
          limited: { color: 'orange', text: '紧张' },
          out_of_stock: { color: 'red', text: '缺货' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '资质等级',
      dataIndex: 'qualificationLevel',
      key: 'qualificationLevel',
      width: 100,
      render: (level: string) => {
        const colorMap = { A: 'gold', B: 'blue', C: 'default' };
        return <Tag color={colorMap[level as keyof typeof colorMap]}>{level}级</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>
            详情
          </Button>
          <Button 
            type="primary" 
            size="small" 
            icon={<ShoppingCartOutlined />}
            onClick={() => handleAddToCart(record)}
          >
            加入采购单
          </Button>
        </Space>
      ),
    },
  ];

  const handleAddToCart = (item: ProcurementItem) => {
    message.success(`${item.componentName} 已加入采购单`);
    // 实际应用中这里会添加到购物车状态
  };

  const handleCreateOrder = () => {
    setCartVisible(true);
  };

  const handleOrderSubmit = (values: any) => {
    console.log('订单信息:', values);
    message.success('采购订单创建成功！');
    setCartVisible(false);
    orderForm.resetFields();
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="在线采购" style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索器件名称、型号、制造商"
            onSearch={(value) => console.log('搜索:', value)}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          <Select placeholder="选择分类" style={{ width: 150 }}>
            <Option value="ic">集成电路</Option>
            <Option value="resistor">电阻</Option>
            <Option value="capacitor">电容</Option>
            <Option value="inductor">电感</Option>
          </Select>
          <Select placeholder="供应商" style={{ width: 150 }}>
            <Option value="supplier1">航天电子供应商</Option>
            <Option value="supplier2">电子元件专营</Option>
          </Select>
          <Select placeholder="资质等级" style={{ width: 120 }}>
            <Option value="A">A级</Option>
            <Option value="B">B级</Option>
            <Option value="C">C级</Option>
          </Select>
          <RangePicker placeholder={['开始日期', '结束日期']} />
          <Button type="primary" icon={<SearchOutlined />}>
            搜索
          </Button>
        </Space>

        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateOrder}
              disabled={selectedRowKeys.length === 0}
            >
              创建采购订单 ({selectedRowKeys.length})
            </Button>
            <Button icon={<ShoppingCartOutlined />}>
              查看采购车
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={mockData}
          rowKey="id"
          rowSelection={rowSelection}
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
      </Card>

      {/* 创建订单模态框 */}
      <Modal
        title="创建采购订单"
        open={cartVisible}
        onCancel={() => setCartVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={orderForm}
          layout="vertical"
          onFinish={handleOrderSubmit}
        >
          <Form.Item
            name="orderName"
            label="订单名称"
            rules={[{ required: true, message: '请输入订单名称' }]}
          >
            <Input placeholder="请输入订单名称" />
          </Form.Item>
          
          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="选择优先级">
              <Option value="urgent">紧急</Option>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="deliveryDate"
            label="期望交货日期"
            rules={[{ required: true, message: '请选择交货日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="订单备注信息" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                提交订单
              </Button>
              <Button onClick={() => setCartVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OnlineProcurement;
