import React, { useState } from 'react';
import { Card, InputNumber, Button, Space, Select, Row, Col, message } from 'antd';
import { FilterOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

export interface ParameterRange {
  key: string;
  name: string;
  min?: number;
  max?: number;
}

interface ParameterRangeFilterProps {
  onFilterChange: (filters: { [key: string]: { min?: number; max?: number } }) => void;
}

const ParameterRangeFilter: React.FC<ParameterRangeFilterProps> = ({ onFilterChange }) => {
  const [parameterFilters, setParameterFilters] = useState<ParameterRange[]>([]);

  // 常用参数定义
  const commonParameters = [
    { key: 'voltage', name: '工作电压 (V)', unit: 'V' },
    { key: 'current', name: '工作电流 (A)', unit: 'A' },
    { key: 'power', name: '功率 (W)', unit: 'W' },
    { key: 'frequency', name: '频率 (Hz)', unit: 'Hz' },
    { key: 'temperature', name: '工作温度 (°C)', unit: '°C' },
    { key: 'resistance', name: '电阻 (Ω)', unit: 'Ω' },
    { key: 'capacitance', name: '电容 (F)', unit: 'F' },
    { key: 'inductance', name: '电感 (H)', unit: 'H' },
  ];

  const addParameterFilter = () => {
    setParameterFilters([
      ...parameterFilters,
      { key: '', name: '', min: undefined, max: undefined }
    ]);
  };

  const removeParameterFilter = (index: number) => {
    const newFilters = parameterFilters.filter((_, i) => i !== index);
    setParameterFilters(newFilters);
    applyFilters(newFilters);
  };

  const updateParameterFilter = (index: number, field: keyof ParameterRange, value: any) => {
    const newFilters = [...parameterFilters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    
    // 当选择参数类型时，自动填充名称
    if (field === 'key') {
      const param = commonParameters.find(p => p.key === value);
      if (param) {
        newFilters[index].name = param.name;
      }
    }
    
    setParameterFilters(newFilters);
  };

  const applyFilters = (filters: ParameterRange[]) => {
    // 转换为API需要的格式
    const apiFilters: { [key: string]: { min?: number; max?: number } } = {};
    
    filters.forEach(filter => {
      if (filter.key && (filter.min !== undefined || filter.max !== undefined)) {
        apiFilters[filter.key] = {};
        if (filter.min !== undefined) {
          apiFilters[filter.key].min = filter.min;
        }
        if (filter.max !== undefined) {
          apiFilters[filter.key].max = filter.max;
        }
      }
    });
    
    onFilterChange(apiFilters);
  };

  const handleApply = () => {
    applyFilters(parameterFilters);
    message.success('参数筛选已应用');
  };

  const handleReset = () => {
    setParameterFilters([]);
    onFilterChange({});
    message.info('参数筛选已重置');
  };

  return (
    <Card 
      title={
        <span>
          <FilterOutlined style={{ marginRight: 8 }} />
          参数范围筛选
        </span>
      }
      size="small"
      style={{ marginBottom: 16 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {parameterFilters.map((filter, index) => (
          <Row gutter={16} key={index} align="middle">
            <Col span={8}>
              <Select
                placeholder="选择参数类型"
                value={filter.key || undefined}
                onChange={(value) => updateParameterFilter(index, 'key', value)}
                style={{ width: '100%' }}
              >
                {commonParameters.map(param => (
                  <Option key={param.key} value={param.key}>{param.name}</Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <InputNumber
                placeholder="最小值"
                value={filter.min}
                onChange={(value) => updateParameterFilter(index, 'min', value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={1} style={{ textAlign: 'center' }}>
              ~
            </Col>
            <Col span={6}>
              <InputNumber
                placeholder="最大值"
                value={filter.max}
                onChange={(value) => updateParameterFilter(index, 'max', value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={3}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeParameterFilter(index)}
              />
            </Col>
          </Row>
        ))}
        
        <Row gutter={16}>
          <Col span={24}>
            <Space>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addParameterFilter}
              >
                添加参数筛选
              </Button>
              {parameterFilters.length > 0 && (
                <>
                  <Button type="primary" onClick={handleApply}>
                    应用筛选
                  </Button>
                  <Button onClick={handleReset}>
                    重置
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>
      </Space>
    </Card>
  );
};

export default ParameterRangeFilter;

