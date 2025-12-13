/**
 * 参数工具函数
 * 用于生成动态参数列表头和处理参数展示逻辑
 */

import React from 'react';
import { Tooltip } from 'antd';
import type { ColumnType } from 'antd/es/table';

// DOMPurify 是可选依赖，用于清理HTML防止XSS攻击
// 安装方式: npm install dompurify @types/dompurify
let DOMPurify: any = null;
try {
  DOMPurify = require('dompurify');
} catch (e) {
  // 可选依赖缺失时静默跳过，仍可正常渲染（如需开启清理请安装 dompurify）
  DOMPurify = null;
}

/**
 * 参数定义接口
 */
export interface ParameterDefinition {
  parameter_key: string;
  name: string;
  short_name?: string;
  category?: string;
  example?: string;
}

/**
 * 生成参数列的表头标题
 * 
 * 规则：
 * - 如果有 short_name，显示简写，鼠标悬停显示完整 name
 * - 如果没有 short_name，直接显示完整 name
 * 
 * @param name - 完整参数名称
 * @param shortName - 简写名称（可选，可能包含HTML标签如 <sub>）
 * @param options - 可选配置
 * @returns React节点
 * 
 * @example
 * // 有简写的情况
 * generateParameterColumnTitle('Number of Pins', '#Pins')
 * // 返回: <Tooltip><span>#Pins</span></Tooltip>
 * 
 * // 无简写的情况
 * generateParameterColumnTitle('TNID Comments', '')
 * // 返回: 'TNID Comments'
 */
export const generateParameterColumnTitle = (
  name: string,
  shortName?: string,
  options?: {
    sanitizeHtml?: boolean;  // 是否清理HTML（防止XSS攻击）
    tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
  }
): React.ReactNode => {
  const {
    sanitizeHtml = true,
    tooltipPlacement = 'top',
  } = options || {};

  // 检查是否有有效的 short_name
  const hasShortName = shortName && shortName.trim() !== '';

  if (hasShortName) {
    // 有简写：显示简写 + Tooltip显示完整名称
    const sanitized = (sanitizeHtml && DOMPurify) ? DOMPurify.sanitize(shortName) : shortName;
    
    return (
      <Tooltip title={name} placement={tooltipPlacement}>
        <span
          className="parameter-column-title"
          dangerouslySetInnerHTML={{ __html: sanitized }}
          style={{
            cursor: 'help',
            borderBottom: '1px dotted currentColor',
          }}
        />
      </Tooltip>
    );
  }

  // 无简写：直接显示完整名称
  return name;
};

/**
 * 批量生成动态参数列配置
 * 
 * @param parameterDefinitions - 参数定义数组
 * @param options - 可选配置
 * @returns Ant Design Table 列配置数组
 * 
 * @example
 * const dynamicColumns = generateDynamicParameterColumns(
 *   parameterDefinitions,
 *   {
 *     columnWidth: 150,
 *     ellipsis: true,
 *     sortable: true,
 *   }
 * );
 */
export const generateDynamicParameterColumns = <T extends Record<string, any>>(
  parameterDefinitions: ParameterDefinition[],
  options?: {
    columnWidth?: number;          // 列宽度
    minColumnWidth?: number;       // 最小列宽度
    ellipsis?: boolean;            // 超长文本省略
    sortable?: boolean;            // 是否可排序
    filterable?: boolean;          // 是否可筛选
    renderValue?: (value: any, param: ParameterDefinition) => React.ReactNode; // 自定义渲染
  }
): ColumnType<T>[] => {
  const {
    columnWidth = 120,
    minColumnWidth = 80,
    ellipsis = true,
    sortable = false,
    filterable = false,
    renderValue,
  } = options || {};

  return parameterDefinitions.map((param) => {
    // 根据 name 长度动态调整列宽
    const dynamicWidth = Math.max(
      minColumnWidth,
      Math.min(columnWidth, param.name.length * 10)
    );

    const column: ColumnType<T> = {
      title: generateParameterColumnTitle(param.name, param.short_name),
      dataIndex: ['parameters', param.parameter_key],
      key: param.parameter_key,
      width: dynamicWidth,
      ellipsis: ellipsis ? {
        showTitle: true,
      } : false,
    };

    // 添加自定义渲染函数
    if (renderValue) {
      column.render = (value: any) => renderValue(value, param);
    } else {
      // 默认渲染：处理空值、数组等
      column.render = (value: any) => {
        if (value === null || value === undefined) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return String(value);
      };
    }

    // 添加排序功能
    if (sortable) {
      column.sorter = (a: any, b: any) => {
        const aVal = a.parameters?.[param.parameter_key];
        const bVal = b.parameters?.[param.parameter_key];
        
        // 处理数值类型
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return aVal - bVal;
        }
        
        // 处理字符串类型
        return String(aVal || '').localeCompare(String(bVal || ''));
      };
    }

    // 添加筛选功能
    if (filterable && param.example) {
      column.filters = [
        { text: param.example, value: param.example },
      ];
      column.onFilter = (value: any, record: any) => {
        const recordValue = record.parameters?.[param.parameter_key];
        return recordValue === value;
      };
    }

    return column;
  });
};

/**
 * 根据分类对参数定义进行分组
 * 
 * @param parameterDefinitions - 参数定义数组
 * @returns 按 category 分组的对象
 * 
 * @example
 * const grouped = groupParametersByCategory(parameterDefinitions);
 * // {
 * //   'Mechanical Data': [...],
 * //   'Electrical Characteristics': [...],
 * // }
 */
export const groupParametersByCategory = (
  parameterDefinitions: ParameterDefinition[]
): Record<string, ParameterDefinition[]> => {
  return parameterDefinitions.reduce((acc, param) => {
    const category = param.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(param);
    return acc;
  }, {} as Record<string, ParameterDefinition[]>);
};

/**
 * 生成分组的列（带分类标题）
 * 
 * @param parameterDefinitions - 参数定义数组
 * @param options - 可选配置
 * @returns Ant Design Table 列配置数组（带分组）
 */
export const generateGroupedParameterColumns = <T extends Record<string, any>>(
  parameterDefinitions: ParameterDefinition[],
  options?: Parameters<typeof generateDynamicParameterColumns>[1]
): ColumnType<T>[] => {
  const grouped = groupParametersByCategory(parameterDefinitions);
  
  return Object.entries(grouped).map(([category, params]) => ({
    title: category,
    children: generateDynamicParameterColumns<T>(params, options),
  }));
};

/**
 * 格式化参数值显示
 * 
 * @param value - 参数值
 * @param param - 参数定义
 * @returns 格式化后的字符串
 */
export const formatParameterValue = (
  value: any,
  param?: ParameterDefinition
): string => {
  if (value === null || value === undefined) {
    return '-';
  }
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return String(value);
};

/**
 * 从组件数据中提取参数值
 * 
 * @param component - 组件数据
 * @param parameterKey - 参数键
 * @returns 参数值
 */
export const extractParameterValue = (
  component: any,
  parameterKey: string
): any => {
  return component?.parameters?.[parameterKey];
};

/**
 * 检查参数是否有值
 * 
 * @param component - 组件数据
 * @param parameterKey - 参数键
 * @returns 是否有值
 */
export const hasParameterValue = (
  component: any,
  parameterKey: string
): boolean => {
  const value = extractParameterValue(component, parameterKey);
  return value !== null && value !== undefined && value !== '';
};

/**
 * 导出参数数据为CSV格式
 * 
 * @param components - 组件数据数组
 * @param parameterDefinitions - 参数定义数组
 * @returns CSV字符串
 */
export const exportParametersToCSV = (
  components: any[],
  parameterDefinitions: ParameterDefinition[]
): string => {
  // CSV表头
  const headers = ['Part Number', 'Manufacturer', ...parameterDefinitions.map(p => p.name)];
  const csvRows = [headers.join(',')];
  
  // CSV数据行
  components.forEach(component => {
    const row = [
      component.partNumber || '',
      component.manufacturer || '',
      ...parameterDefinitions.map(param => {
        const value = extractParameterValue(component, param.parameter_key);
        return formatParameterValue(value, param).replace(/,/g, ';'); // 替换逗号避免CSV格式问题
      })
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

/**
 * 下载CSV文件
 * 
 * @param csvContent - CSV内容字符串
 * @param filename - 文件名
 */
export const downloadCSV = (csvContent: string, filename: string = 'components.csv'): void => {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

