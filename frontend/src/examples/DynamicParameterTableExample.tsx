/**
 * 动态参数表格示例
 * 演示如何使用 parameterUtils 工具函数生成动态列
 */

import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, message } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  generateDynamicParameterColumns,
  generateGroupedParameterColumns,
  exportParametersToCSV,
  downloadCSV,
  type ParameterDefinition,
} from '@/utils/parameterUtils';
import type { ColumnsType } from 'antd/es/table';

interface Component {
  id: string;
  partNumber: string;
  manufacturer: string;
  familyPath: string[];
  parameters: {
    [key: string]: any; // parameter_key: value
  };
}

/**
 * 示例1: 基础动态列表格
 */
export const BasicDynamicTable: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [parameterDefinitions, setParameterDefinitions] = useState<ParameterDefinition[]>([]);

  // 模拟数据加载
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // 模拟API调用
      // const response = await fetch('/api/doeeet/search?familyPath=Microcircuits/Digital/Memory');
      // const result = await response.json();
      
      // 模拟数据
      const mockParameterDefinitions: ParameterDefinition[] = [
        {
          parameter_key: '684fe03f-bfea-4a24-a5a4-49e504e21ccd',
          name: 'Number of Pins',
          short_name: '#Pins',
          category: 'Mechanical Data',
          example: '68',
        },
        {
          parameter_key: '3197675d-0949-4d98-a6f4-c069a66f9f6e',
          name: 'Storage Temperature Range',
          short_name: 'T<sub>STG</sub>',
          category: 'Electrical Characteristics',
          example: '-55°C to +150°C',
        },
        {
          parameter_key: '6631fc53-cd8f-4299-b629-f132b34fcc94',
          name: 'TNID Comments',
          short_name: '',
          category: 'Radiation: Potential Sensitivity',
          example: 'CMOS TECHNOLOGY',
        },
      ];

      const mockComponents: Component[] = [
        {
          id: 'comp_001',
          partNumber: '860300YA',
          manufacturer: 'SIB International formerly Rarefill',
          familyPath: ['Microcircuits', 'Digital', 'Memory'],
          parameters: {
            '684fe03f-bfea-4a24-a5a4-49e504e21ccd': 68,
            '3197675d-0949-4d98-a6f4-c069a66f9f6e': '-55°C to +150°C',
            '6631fc53-cd8f-4299-b629-f132b34fcc94': 'CMOS TECHNOLOGY. Effect only exhibited...',
          },
        },
        {
          id: 'comp_002',
          partNumber: '860301YA',
          manufacturer: 'SIB International formerly Rarefill',
          familyPath: ['Microcircuits', 'Digital', 'Memory'],
          parameters: {
            '684fe03f-bfea-4a24-a5a4-49e504e21ccd': 72,
            '3197675d-0949-4d98-a6f4-c069a66f9f6e': '-40°C to +125°C',
            '6631fc53-cd8f-4299-b629-f132b34fcc94': 'BiCMOS devices',
          },
        },
      ];

      setParameterDefinitions(mockParameterDefinitions);
      setComponents(mockComponents);
    } catch (error) {
      console.error('Failed to load data:', error);
      message.error('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 静态列
  const staticColumns: ColumnsType<Component> = [
    {
      title: '器件型号',
      dataIndex: 'partNumber',
      key: 'partNumber',
      width: 150,
      fixed: 'left',
      render: (text: string) => <strong style={{ color: '#1890ff' }}>{text}</strong>,
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 200,
      fixed: 'left',
      ellipsis: true,
    },
  ];

  // 动态参数列
  const dynamicColumns = generateDynamicParameterColumns<Component>(
    parameterDefinitions,
    {
      columnWidth: 150,
      ellipsis: true,
      sortable: true,
    }
  );

  // 合并所有列
  const columns: ColumnsType<Component> = [...staticColumns, ...dynamicColumns];

  // 导出CSV
  const handleExportCSV = () => {
    try {
      const csvContent = exportParametersToCSV(components, parameterDefinitions);
      downloadCSV(csvContent, 'doeeet_components.csv');
      message.success('导出成功');
    } catch (error) {
      console.error('Export failed:', error);
      message.error('导出失败');
    }
  };

  return (
    <Card
      title="动态参数表格 - 基础示例"
      extra={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadData}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            disabled={components.length === 0}
          >
            导出CSV
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={components}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />
    </Card>
  );
};

/**
 * 示例2: 分组参数列表格
 */
export const GroupedParameterTable: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [parameterDefinitions, setParameterDefinitions] = useState<ParameterDefinition[]>([]);

  // 加载数据
  useEffect(() => {
    // 模拟数据（同上）
    setParameterDefinitions([
      {
        parameter_key: '684fe03f-bfea-4a24-a5a4-49e504e21ccd',
        name: 'Number of Pins',
        short_name: '#Pins',
        category: 'Mechanical Data',
      },
      {
        parameter_key: '3197675d-0949-4d98-a6f4-c069a66f9f6e',
        name: 'Storage Temperature Range',
        short_name: 'T<sub>STG</sub>',
        category: 'Electrical Characteristics',
      },
    ]);

    setComponents([
      {
        id: 'comp_001',
        partNumber: '860300YA',
        manufacturer: 'SIB International',
        familyPath: ['Microcircuits', 'Digital'],
        parameters: {
          '684fe03f-bfea-4a24-a5a4-49e504e21ccd': 68,
          '3197675d-0949-4d98-a6f4-c069a66f9f6e': '-55°C to +150°C',
        },
      },
    ]);
  }, []);

  // 静态列
  const staticColumns: ColumnsType<Component> = [
    {
      title: '器件型号',
      dataIndex: 'partNumber',
      key: 'partNumber',
      width: 150,
      fixed: 'left',
    },
  ];

  // 生成分组的动态列
  const groupedColumns = generateGroupedParameterColumns<Component>(
    parameterDefinitions,
    {
      columnWidth: 150,
      ellipsis: true,
    }
  );

  // 合并列
  const columns: ColumnsType<Component> = [...staticColumns, ...groupedColumns];

  return (
    <Card title="动态参数表格 - 分组示例">
      <Table
        columns={columns}
        dataSource={components}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }}
        bordered
      />
    </Card>
  );
};

/**
 * 示例3: 自定义渲染
 */
export const CustomRenderTable: React.FC = () => {
  const [parameterDefinitions] = useState<ParameterDefinition[]>([
    {
      parameter_key: '684fe03f-bfea-4a24-a5a4-49e504e21ccd',
      name: 'Number of Pins',
      short_name: '#Pins',
      category: 'Mechanical Data',
    },
  ]);

  const [components] = useState<Component[]>([
    {
      id: 'comp_001',
      partNumber: '860300YA',
      manufacturer: 'SIB International',
      familyPath: ['Microcircuits'],
      parameters: {
        '684fe03f-bfea-4a24-a5a4-49e504e21ccd': 68,
      },
    },
  ]);

  const staticColumns: ColumnsType<Component> = [
    {
      title: '器件型号',
      dataIndex: 'partNumber',
      key: 'partNumber',
      width: 150,
    },
  ];

  // 自定义渲染函数
  const dynamicColumns = generateDynamicParameterColumns<Component>(
    parameterDefinitions,
    {
      renderValue: (value, param) => {
        // 根据参数类型自定义渲染
        if (param.name === 'Number of Pins') {
          return (
            <span style={{ color: value > 50 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
              {value} pins
            </span>
          );
        }
        return value;
      },
    }
  );

  const columns: ColumnsType<Component> = [...staticColumns, ...dynamicColumns];

  return (
    <Card title="动态参数表格 - 自定义渲染示例">
      <Table
        columns={columns}
        dataSource={components}
        rowKey="id"
        pagination={false}
      />
    </Card>
  );
};

/**
 * 主示例页面
 */
const DynamicParameterTableExample: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1>动态参数表格使用示例</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        演示如何使用 <code>parameterUtils</code> 工具函数生成动态参数列
      </p>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <BasicDynamicTable />
        <GroupedParameterTable />
        <CustomRenderTable />
      </Space>
    </div>
  );
};

export default DynamicParameterTableExample;

