import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Table, Tag, Spin, message, Button, Space, Typography } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import httpClient from '@/utils/httpClient';

const { Text } = Typography;

interface ComponentCompareModalProps {
  visible: boolean;
  componentIds: string[];
  onClose: () => void;
}

interface ComponentInfo {
  component_id: string;
  part_number: string;
  manufacturer_name: string;
  part_type: string;
  quality_name: string;
  obsolescence_type: string;
  has_stock: string;
  family_path: string;
}

interface ParameterValue {
  name: string;
  value: string;
  numericValue?: number;
}

interface ComparisonData {
  components: ComponentInfo[];
  parameters: Array<{
    key: string;
    [key: string]: any; // component_0, component_1, etc.
  }>;
}

const ComponentCompareModal: React.FC<ComponentCompareModalProps> = ({
  visible,
  componentIds,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);

  useEffect(() => {
    if (visible && componentIds.length >= 2) {
      fetchComparisonData();
    }
  }, [visible, componentIds]);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const data = await httpClient.post<ComparisonData, { componentIds: string[] }>(
        '/api/doeeet/components/compare',
        { componentIds },
        { timeoutMs: 15000, retries: 2, retryDelayMs: 400, suppressErrorMessage: true }
      );
      if (data) {
        setComparisonData(data);
      } else {
        message.error('获取对比数据失败');
      }
    } catch (error: any) {
      console.error('对比组件失败:', error);
      message.error(error?.message || '对比组件失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'green';
      case 'Obsolete':
        return 'red';
      case 'Last Time Buy':
        return 'orange';
      case 'Risk':
        return 'volcano';
      default:
        return 'default';
    }
  };

  // 基本信息列定义
  const basicInfoColumns = [
    {
      title: '属性',
      dataIndex: 'label',
      key: 'label',
      width: 150,
      fixed: 'left' as const,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    ...( comparisonData?.components.map((comp, index) => ({
      title: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
            {comp.part_number}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {comp.manufacturer_name}
          </div>
        </div>
      ),
      dataIndex: `component_${index}`,
      key: `component_${index}`,
      width: 200,
    })) || []),
  ];

  const basicInfoData = comparisonData ? [
    {
      key: 'part_type',
      label: '产品类型',
      ...Object.fromEntries(
        comparisonData.components.map((comp, idx) => [
          `component_${idx}`,
          comp.part_type || '-',
        ])
      ),
    },
    {
      key: 'family_path',
      label: '分类',
      ...Object.fromEntries(
        comparisonData.components.map((comp, idx) => {
          try {
            const familyPath = JSON.parse(comp.family_path.replace(/'/g, '"'));
            return [`component_${idx}`, Array.isArray(familyPath) ? familyPath.join(' > ') : comp.family_path];
          } catch (e) {
            return [`component_${idx}`, comp.family_path];
          }
        })
      ),
    },
    {
      key: 'quality_name',
      label: '质量等级',
      ...Object.fromEntries(
        comparisonData.components.map((comp, idx) => [
          `component_${idx}`,
          <Tag key={idx} color="blue">{comp.quality_name || '-'}</Tag>,
        ])
      ),
    },
    {
      key: 'obsolescence_type',
      label: '淘汰状态',
      ...Object.fromEntries(
        comparisonData.components.map((comp, idx) => [
          `component_${idx}`,
          <Tag key={idx} color={getStatusColor(comp.obsolescence_type)}>
            {comp.obsolescence_type}
          </Tag>,
        ])
      ),
    },
    {
      key: 'has_stock',
      label: '库存状态',
      ...Object.fromEntries(
        comparisonData.components.map((comp, idx) => [
          `component_${idx}`,
          <Tag key={idx} color={comp.has_stock === 'Yes' ? 'green' : 'default'}>
            {comp.has_stock === 'Yes' ? '有库存' : '无库存'}
          </Tag>,
        ])
      ),
    },
  ] : [];

  const getParameterDisplayName = (record: any) => {
    const componentCount = comparisonData?.components.length ?? 0;
    for (let i = 0; i < componentCount; i += 1) {
      const param = record[`component_${i}`] as ParameterValue | undefined;
      const candidate = param?.name?.trim();
      if (candidate && candidate.toLowerCase() !== 'unknown') {
        return candidate;
      }
    }

    const fallback = record?.name?.trim();
    if (fallback && fallback.toLowerCase() !== 'unknown') {
      return fallback;
    }

    return '未命名参数';
  };

  // 参数对比列定义
  const parameterColumns = [
    {
      title: '参数名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left' as const,
      render: (_text: string, record: any) => (
        <div>
          <Text strong>{getParameterDisplayName(record)}</Text>
        </div>
      ),
    },
    ...(comparisonData?.components.map((comp, index) => ({
      title: comp.part_number,
      dataIndex: `component_${index}`,
      key: `component_${index}`,
      width: 180,
      render: (paramValue: ParameterValue) => {
        if (!paramValue || paramValue.value === '-') {
          return <Text type="secondary">-</Text>;
        }
        
        // 尝试解析数组值
        try {
          const parsed = JSON.parse(paramValue.value.replace(/'/g, '"'));
          if (Array.isArray(parsed)) {
            return parsed.join(', ');
          }
        } catch (e) {
          // 不是JSON数组，直接显示
        }
        
        return paramValue.value;
      },
    })) || []),
  ];

  const filteredParameters = useMemo(() => {
    if (!comparisonData?.parameters || comparisonData.parameters.length === 0) {
      return [];
    }

    const componentCount = comparisonData.components.length;

    return comparisonData.parameters.filter(param => {
      if (!param) {
        return false;
      }

      const hasMeaningfulName = Array.from({ length: componentCount }).some((_, idx) => {
        const value = param[`component_${idx}`] as ParameterValue | undefined;
        const candidate = value?.name?.trim();
        return !!candidate && candidate.toLowerCase() !== 'unknown';
      });

      const fallback = (param as any)?.name?.trim();

      if (!hasMeaningfulName) {
        if (!fallback) {
          return false;
        }
        return fallback.toLowerCase() !== 'unknown';
      }

      return true;
    });
  }, [comparisonData]);

  return (
    <Modal
      title={
        <Space>
          <SwapOutlined style={{ color: '#1890ff' }} />
          <span>组件对比</span>
          <Text type="secondary">({componentIds.length}个组件)</Text>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
      width="90%"
      style={{ top: 20 }}
      styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" tip="加载对比数据中..." />
        </div>
      ) : comparisonData ? (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 基本信息对比 */}
          <div>
            <Text strong style={{ fontSize: '16px', marginBottom: '12px', display: 'block' }}>
              基本信息对比
            </Text>
            <Table
              columns={basicInfoColumns}
              dataSource={basicInfoData}
              pagination={false}
              size="small"
              bordered
              scroll={{ x: 'max-content' }}
            />
          </div>

          {/* 参数对比 */}
          <div>
                <Text strong style={{ fontSize: '16px', marginBottom: '12px', display: 'block' }}>
              参数对比 ({filteredParameters.length}个参数)
            </Text>
            <Table
              columns={parameterColumns}
              dataSource={filteredParameters}
              pagination={{ pageSize: 20 }}
              size="small"
              bordered
              scroll={{ x: 'max-content' }}
              rowKey="key"
            />
          </div>
        </Space>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Text type="secondary">暂无对比数据</Text>
        </div>
      )}
    </Modal>
  );
};

export default ComponentCompareModal;

