import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  Upload,
  Row,
  Col,
  Typography,
  Tabs,
  Descriptions,
  Rate,
  Progress,
  Badge,
  message,
  Statistic
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  StarOutlined,
  CheckCircleOutlined,
  FileOutlined,
  CloudDownloadOutlined,
  InboxOutlined,
  ExportOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface DigitalModel {
  id: string;
  modelId: string;
  componentCategory: string; // 器件类别
  componentName: string; // 器件名称
  modelSpecification: string; // 型号规格 (原componentPartNumber)
  manufacturer: string; // 生产厂家
  modelCategory: 'IBIS' | 'SPICE' | 'S-Parameter' | 'Thermal' | 'Mechanical' | 'Other'; // 模型类别
  modelPurpose: string; // 模型用途
  fileInfo: {
    fileName: string;
    fileSize: number;
    fileFormat: string;
  };
  validation: {
    isValidated: boolean;
    validationResults: {
      accuracy: number;
      frequencyRange: string;
      temperatureRange: string;
      notes: string;
    };
  };
  // 保留但不在表格中显示的字段
  modelInfo: {
    modelName: string;
    modelType: 'IBIS' | 'SPICE' | 'S-Parameter' | 'Thermal' | 'Mechanical' | 'Other';
    modelVersion: string;
    description: string;
    keywords: string[];
  };
  versionControl: {
    version: string;
    isLatest: boolean;
  };
  sharing: {
    isPublic: boolean;
    accessLevel: 'public' | 'registered' | 'authorized' | 'private';
    downloadCount: number;
    rating: {
      averageRating: number;
      ratingCount: number;
    };
  };
  createdAt: string;
}

const DigitalModels: React.FC = () => {
  const [models, setModels] = useState<DigitalModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    componentCategory: '',
    componentName: '',
    modelSpecification: '',
    manufacturer: '',
    modelCategory: '',
    isValidated: '',
    modelPurpose: ''
  });
  const [selectedModel, setSelectedModel] = useState<DigitalModel | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [batchUploadModalVisible, setBatchUploadModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [batchUploadForm] = Form.useForm();
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [statistics, setStatistics] = useState({
    totalModels: 0,
    validatedModels: 0,
    publicModels: 0,
    totalDownloads: 0
  });

  // 表格列定义
  const columns: ColumnsType<DigitalModel> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: '模型编号',
      dataIndex: 'modelId',
      key: 'modelId',
      width: 120,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '器件类别',
      dataIndex: 'componentCategory',
      key: 'componentCategory',
      width: 100,
      render: (text) => <Tag color="cyan">{text}</Tag>
    },
    {
      title: '器件名称',
      dataIndex: 'componentName',
      key: 'componentName',
      width: 150,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '型号规格',
      dataIndex: 'modelSpecification',
      key: 'modelSpecification',
      width: 120,
      render: (text) => <Text>{text}</Text>
    },
    {
      title: '生产厂家',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 120
    },
    {
      title: '模型类别',
      dataIndex: 'modelCategory',
      key: 'modelCategory',
      width: 100,
      render: (type) => {
        const colors = {
          'IBIS': 'blue',
          'SPICE': 'green',
          'S-Parameter': 'orange',
          'Thermal': 'red',
          'Mechanical': 'purple',
          'Other': 'default'
        };
        return <Tag color={colors[type as keyof typeof colors]}>{type}</Tag>;
      }
    },
    {
      title: '模型用途',
      dataIndex: 'modelPurpose',
      key: 'modelPurpose',
      width: 120,
      render: (text) => <Text>{text}</Text>
    },
    {
      title: '验证状态',
      dataIndex: ['validation', 'isValidated'],
      key: 'isValidated',
      width: 100,
      render: (validated, record) => (
        <div>
          <Badge
            status={validated ? 'success' : 'default'}
            text={validated ? '已验证' : '未验证'}
          />
          {validated && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              精度: {record.validation.validationResults.accuracy}%
            </div>
          )}
        </div>
      )
    },
    {
      title: '文件信息',
      key: 'fileInfo',
      width: 120,
      render: (_, record) => (
        <div>
          <div>{record.fileInfo.fileName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {(record.fileInfo.fileSize / 1024).toFixed(1)}KB
          </div>
          <Tag>{record.fileInfo.fileFormat}</Tag>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            下载
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            danger
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  // 获取数字模型列表
  const fetchModels = async () => {
    setLoading(true);
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      if (searchParams.componentCategory) params.append('componentCategory', searchParams.componentCategory);
      if (searchParams.componentName) params.append('componentName', searchParams.componentName);
      if (searchParams.modelSpecification) params.append('modelSpecification', searchParams.modelSpecification);
      if (searchParams.manufacturer) params.append('manufacturer', searchParams.manufacturer);
      if (searchParams.modelCategory) params.append('modelCategory', searchParams.modelCategory);
      if (searchParams.modelPurpose) params.append('modelPurpose', searchParams.modelPurpose);
      if (searchParams.isValidated) params.append('isValidated', searchParams.isValidated);

      const response = await fetch(`http://localhost:3001/api/digital-models?${params.toString()}`);
      if (!response.ok) {
        throw new Error('获取数字模型列表失败');
      }
      
      const data = await response.json();
      if (data.success) {
        setModels(data.data);
        setStatistics(data.statistics);
      } else {
        throw new Error(data.message || '获取数据失败');
      }
    } catch (error) {
      console.error('获取数字模型列表失败:', error);
      message.error('获取数字模型列表失败');
      
      // 降级到模拟数据
      const mockData: DigitalModel[] = [
        {
          id: '1',
          modelId: 'MDL-2024-001',
          componentCategory: '模拟器件',
          componentName: '双运算放大器',
          modelSpecification: 'LM358',
          manufacturer: 'Texas Instruments',
          modelCategory: 'SPICE',
          modelPurpose: '低功耗运算放大器仿真',
          fileInfo: {
            fileName: 'LM358.lib',
            fileSize: 15360,
            fileFormat: 'SPICE'
          },
          validation: {
            isValidated: true,
            validationResults: {
              accuracy: 95.5,
              frequencyRange: 'DC-1MHz',
              temperatureRange: '-40°C to +85°C',
              notes: '在典型工作条件下验证通过'
            }
          },
          // 保留原有字段用于详情页面
          modelInfo: {
            modelName: 'LM358 SPICE Model',
            modelType: 'SPICE',
            modelVersion: '1.2',
            description: 'LM358双运算放大器SPICE模型，适用于低功耗应用',
            keywords: ['运算放大器', '低功耗', '双通道']
          },
          versionControl: {
            version: '1.2',
            isLatest: true
          },
          sharing: {
            isPublic: true,
            accessLevel: 'public',
            downloadCount: 1250,
            rating: {
              averageRating: 4.5,
              ratingCount: 23
            }
          },
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          modelId: 'MDL-2024-002',
          componentCategory: '模拟器件',
          componentName: '高速运算放大器',
          modelSpecification: 'AD8066',
          manufacturer: 'Analog Devices',
          modelCategory: 'IBIS',
          modelPurpose: '高速信号完整性分析',
          fileInfo: {
            fileName: 'AD8066.ibs',
            fileSize: 8192,
            fileFormat: 'IBIS'
          },
          validation: {
            isValidated: false,
            validationResults: {
              accuracy: 0,
              frequencyRange: '',
              temperatureRange: '',
              notes: ''
            }
          },
          // 保留原有字段用于详情页面
          modelInfo: {
            modelName: 'AD8066 IBIS Model',
            modelType: 'IBIS',
            modelVersion: '2.0',
            description: 'AD8066高速运算放大器IBIS模型',
            keywords: ['高速', '运算放大器', 'IBIS']
          },
          versionControl: {
            version: '2.0',
            isLatest: true
          },
          sharing: {
            isPublic: false,
            accessLevel: 'authorized',
            downloadCount: 45,
            rating: {
              averageRating: 0,
              ratingCount: 0
            }
          },
          createdAt: '2024-01-20'
        },
        {
          id: '3',
          modelId: 'MDL-2024-003',
          componentCategory: '数字器件',
          componentName: '微控制器',
          modelSpecification: 'STM32F103',
          manufacturer: 'STMicroelectronics',
          modelCategory: 'IBIS',
          modelPurpose: 'IO时序和信号完整性分析',
          fileInfo: {
            fileName: 'STM32F103.ibs',
            fileSize: 25600,
            fileFormat: 'IBIS'
          },
          validation: {
            isValidated: true,
            validationResults: {
              accuracy: 92.8,
              frequencyRange: 'DC-100MHz',
              temperatureRange: '-40°C to +105°C',
              notes: '在工业级温度范围内验证通过'
            }
          },
          modelInfo: {
            modelName: 'STM32F103 IBIS Model',
            modelType: 'IBIS',
            modelVersion: '1.5',
            description: 'STM32F103微控制器IBIS模型',
            keywords: ['微控制器', 'ARM', '数字器件']
          },
          versionControl: {
            version: '1.5',
            isLatest: true
          },
          sharing: {
            isPublic: true,
            accessLevel: 'public',
            downloadCount: 890,
            rating: {
              averageRating: 4.2,
              ratingCount: 15
            }
          },
          createdAt: '2024-01-25'
        },
        {
          id: '4',
          modelId: 'MDL-2024-004',
          componentCategory: '功率器件',
          componentName: 'MOSFET',
          modelSpecification: 'IRF540N',
          manufacturer: 'Infineon',
          modelCategory: 'SPICE',
          modelPurpose: '功率开关电路仿真',
          fileInfo: {
            fileName: 'IRF540N.lib',
            fileSize: 12800,
            fileFormat: 'SPICE'
          },
          validation: {
            isValidated: true,
            validationResults: {
              accuracy: 98.2,
              frequencyRange: 'DC-10MHz',
              temperatureRange: '-55°C to +175°C',
              notes: '在扩展温度范围内验证通过'
            }
          },
          modelInfo: {
            modelName: 'IRF540N SPICE Model',
            modelType: 'SPICE',
            modelVersion: '2.1',
            description: 'IRF540N N沟道功率MOSFET SPICE模型',
            keywords: ['MOSFET', '功率器件', '开关']
          },
          versionControl: {
            version: '2.1',
            isLatest: true
          },
          sharing: {
            isPublic: true,
            accessLevel: 'registered',
            downloadCount: 567,
            rating: {
              averageRating: 4.7,
              ratingCount: 8
            }
          },
          createdAt: '2024-02-01'
        }
      ];
      setModels(mockData);
      
      // 模拟统计数据
      setStatistics({
        totalModels: mockData.length,
        validatedModels: mockData.filter(m => m.validation?.isValidated).length,
        publicModels: mockData.filter(m => m.sharing?.isPublic).length,
        totalDownloads: mockData.reduce((sum, m) => sum + (m.sharing?.downloadCount || 0), 0)
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [searchParams]);

  // 查看详情
  const handleViewDetail = (record: DigitalModel) => {
    setSelectedModel(record);
    setDetailModalVisible(true);
  };

  // 下载模型
  const handleDownload = async (record: DigitalModel) => {
    try {
      const response = await fetch(`http://localhost:3001/api/digital-models/${record.id}/download`);
      if (!response.ok) {
        throw new Error('下载失败');
      }
      
      // 创建blob并下载
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = record.fileInfo.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success(`${record.fileInfo.fileName} 下载成功`);
    } catch (error) {
      console.error('下载失败:', error);
      message.error('下载失败');
    }
  };

  // 编辑模型
  const handleEdit = (record: DigitalModel) => {
    setSelectedModel(record);
    editForm.setFieldsValue({
      modelName: record.modelInfo.modelName,
      modelVersion: record.modelInfo.modelVersion,
      description: record.modelInfo.description,
      modelCategory: record.modelCategory,
      modelPurpose: record.modelPurpose,
      manufacturer: record.manufacturer,
      modelSpecification: record.modelSpecification,
      sharing: {
        ...record.sharing,
        isPublic: record.sharing?.isPublic || false
      }
    });
    setEditModalVisible(true);
  };

  // 删除模型
  const handleDelete = (record: DigitalModel) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除模型 "${record.modelInfo.modelName}" 吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/digital-models/${record.id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('删除失败');
          }
          
          message.success('模型删除成功');
          fetchModels(); // 重新获取模型列表
        } catch (error) {
          console.error('删除模型失败:', error);
          message.error('删除模型失败');
        }
      }
    });
  };

  // 上传模型
  const handleUpload = () => {
    form.resetFields();
    setUploadModalVisible(true);
  };

  // 批量上传模型信息
  const handleBatchUpload = () => {
    batchUploadForm.resetFields();
    setUploadedFile(null);
    setPreviewData([]);
    setBatchUploadModalVisible(true);
  };

  // 下载批量上传模板
  const handleDownloadTemplate = () => {
    const headers = [
      '器件类别', '器件名称', '型号规格', '生产厂家', '模型类别', 
      '模型用途', '模型名称', '模型版本', '描述', '关键词', '分享级别'
    ];
    
    const sampleData = [
      [
        '模拟器件', '运算放大器', 'LM358', 'TI', 'SPICE',
        '信号放大', 'LM358 SPICE模型', '1.0', '双运算放大器',
        '运放;模拟;信号', '公开'
      ],
      [
        '数字器件', '逻辑门', '74HC00', 'NXP', 'IBIS',
        '数字逻辑', '74HC00 IBIS模型', '1.0', '四与非门',
        '逻辑门;数字;CMOS', '注册用户'
      ]
    ];
    
    // 添加BOM头，确保Excel正确识别UTF-8编码
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers, ...sampleData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\r\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '数字模型批量上传模板.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 处理文件上传
  const handleFileUpload = (file: any) => {
    setUploadedFile(file);
    
    // 读取文件内容进行预览
    const reader = new FileReader();
    reader.onload = (e) => {
      let text = e.target?.result as string;
      
      // 移除BOM头
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
      }
      
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      
      if (lines.length < 2) {
        message.error('文件格式不正确，请确保包含表头和数据');
        return;
      }
      
      // 解析CSV行（处理带引号的字段）
      const parseCSVLine = (line: string) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        
        result.push(current.trim());
        return result;
      };
      
      const headers = parseCSVLine(lines[0]);
      const expectedHeaders = [
        '器件类别', '器件名称', '型号规格', '生产厂家', '模型类别', 
        '模型用途', '模型名称', '模型版本', '描述', '关键词', '分享级别'
      ];
      
      // 验证表头
      if (headers.length !== expectedHeaders.length) {
        message.error('文件格式不正确，请下载模板文件并按照格式填写');
        return;
      }
      
      // 解析数据
      const data = lines.slice(1).map((line, index) => {
        const values = parseCSVLine(line);
        return {
          key: index,
          器件类别: values[0] || '',
          器件名称: values[1] || '',
          型号规格: values[2] || '',
          生产厂家: values[3] || '',
          模型类别: values[4] || '',
          模型用途: values[5] || '',
          模型名称: values[6] || '',
          模型版本: values[7] || '',
          描述: values[8] || '',
          关键词: values[9] || '',
          分享级别: values[10] || ''
        };
      }).filter(item => item.器件名称); // 过滤空行
      
      setPreviewData(data);
      message.success(`解析成功，共${data.length}条数据`);
    };
    
    reader.readAsText(file, 'UTF-8');
    return false; // 阻止自动上传
  };

  // 确认批量导入
  const handleBatchImport = async () => {
    if (!uploadedFile || previewData.length === 0) {
      message.error('请先上传文件');
      return;
    }
    
    try {
      setLoading(true);
      
      // 将预览数据转换为API格式
      const models = previewData.map((item, index) => ({
        modelId: `MODEL_${Date.now()}_${index}`,
        componentCategory: item.器件类别,
        componentName: item.器件名称,
        modelSpecification: item.型号规格,
        manufacturer: item.生产厂家,
        modelCategory: item.模型类别,
        modelPurpose: item.模型用途,
        modelInfo: {
          modelName: item.模型名称,
          modelType: item.模型类别,
          modelVersion: item.模型版本,
          description: item.描述,
          keywords: item.关键词.split(';').filter((k: string) => k.trim())
        },
        versionControl: {
          version: item.模型版本,
          isLatest: true
        },
        sharing: {
          isPublic: item.分享级别 === '公开',
          accessLevel: item.分享级别 === '公开' ? 'public' : 
                      item.分享级别 === '注册用户' ? 'registered' : 
                      item.分享级别 === '授权用户' ? 'authorized' : 'private',
          downloadCount: 0,
          rating: {
            averageRating: 0,
            ratingCount: 0
          }
        },
        fileInfo: {
          fileName: '待上传',
          fileSize: 0,
          fileFormat: '待定'
        },
        validation: {
          isValidated: false,
          validationResults: {
            accuracy: 0,
            frequencyRange: '',
            temperatureRange: '',
            notes: ''
          }
        },
        createdAt: new Date().toISOString()
      }));
      
      // 批量提交到后端
      const response = await fetch('http://localhost:3001/api/digital-models/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ models })
      });
      
      if (!response.ok) {
        throw new Error('批量导入失败');
      }
      
      const result = await response.json();
      message.success(`成功导入 ${result.count || models.length} 个模型信息`);
      setBatchUploadModalVisible(false);
      fetchModels(); // 刷新模型列表
      
    } catch (error) {
      console.error('批量导入失败:', error);
      message.error('批量导入失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索处理
  const handleSearch = (key: string, value: string) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>数字模型库</Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总模型数"
              value={statistics.totalModels}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已验证模型"
              value={statistics.validatedModels}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="公开模型"
              value={statistics.publicModels}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总下载量"
              value={statistics.totalDownloads}
              prefix={<CloudDownloadOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索区域 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={4}>
            <Select
              placeholder="器件类别"
              style={{ width: '100%' }}
              value={searchParams.componentCategory}
              onChange={(value) => handleSearch('componentCategory', value)}
              allowClear
            >
              <Option value="模拟器件">模拟器件</Option>
              <Option value="数字器件">数字器件</Option>
              <Option value="功率器件">功率器件</Option>
              <Option value="射频器件">射频器件</Option>
              <Option value="传感器">传感器</Option>
            </Select>
          </Col>
          <Col span={5}>
            <Input
              placeholder="器件名称"
              prefix={<SearchOutlined />}
              value={searchParams.componentName}
              onChange={(e) => handleSearch('componentName', e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Input
              placeholder="型号规格"
              value={searchParams.modelSpecification}
              onChange={(e) => handleSearch('modelSpecification', e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Input
              placeholder="生产厂家"
              value={searchParams.manufacturer}
              onChange={(e) => handleSearch('manufacturer', e.target.value)}
            />
          </Col>
          <Col span={3}>
            <Select
              placeholder="模型类别"
              style={{ width: '100%' }}
              value={searchParams.modelCategory}
              onChange={(value) => handleSearch('modelCategory', value)}
              allowClear
            >
              <Option value="IBIS">IBIS</Option>
              <Option value="SPICE">SPICE</Option>
              <Option value="S-Parameter">S参数</Option>
              <Option value="Thermal">热模型</Option>
              <Option value="Mechanical">机械模型</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={5}>
            <Input
              placeholder="模型用途"
              value={searchParams.modelPurpose}
              onChange={(e) => handleSearch('modelPurpose', e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="验证状态"
              style={{ width: '100%' }}
              value={searchParams.isValidated}
              onChange={(value) => handleSearch('isValidated', value)}
              allowClear
            >
              <Option value="true">已验证</Option>
              <Option value="false">未验证</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button icon={<SearchOutlined />}>
              重置
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 表格 */}
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Space>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={handleUpload}
            >
              上传模型
            </Button>
            <Button
              type="default"
              icon={<InboxOutlined />}
              onClick={handleBatchUpload}
            >
              批量导入信息
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={handleDownloadTemplate}
            >
              下载模板
            </Button>
            <Button icon={<PlusOutlined />}>
              创建模型
            </Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={models}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="数字模型详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            下载模型
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={1000}
      >
        {selectedModel && (
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="模型编号">
                  {selectedModel.modelId}
                </Descriptions.Item>
                <Descriptions.Item label="器件型号">
                  {selectedModel.modelSpecification}
                </Descriptions.Item>
                <Descriptions.Item label="制造商">
                  {selectedModel.manufacturer}
                </Descriptions.Item>
                <Descriptions.Item label="模型名称">
                  {selectedModel.modelInfo?.modelName || '未设置'}
                </Descriptions.Item>
                <Descriptions.Item label="模型类型">
                  <Tag color="blue">{selectedModel.modelInfo?.modelType || selectedModel.modelCategory}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="版本">
                  {selectedModel.modelInfo?.modelVersion || selectedModel.versionControl?.version || '1.0'}
                  {selectedModel.versionControl?.isLatest && (
                    <Tag color="green" style={{ marginLeft: '8px' }}>最新</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="访问级别" span={2}>
                  <Tag color={
                    selectedModel.sharing?.accessLevel === 'public' ? 'green' :
                    selectedModel.sharing?.accessLevel === 'registered' ? 'blue' :
                    selectedModel.sharing?.accessLevel === 'authorized' ? 'orange' : 'red'
                  }>
                    {selectedModel.sharing?.accessLevel === 'public' ? '公开' :
                     selectedModel.sharing?.accessLevel === 'registered' ? '注册用户' :
                     selectedModel.sharing?.accessLevel === 'authorized' ? '授权用户' : '私有'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="模型描述" span={2}>
                  {selectedModel.modelInfo?.description || '暂无描述'}
                </Descriptions.Item>
                <Descriptions.Item label="关键词" span={2}>
                  {selectedModel.modelInfo?.keywords?.map((keyword, index) => (
                    <Tag key={index}>{keyword}</Tag>
                  )) || <span style={{ color: '#999' }}>暂无关键词</span>}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="文件信息" key="file">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="文件名">
                  {selectedModel.fileInfo.fileName}
                </Descriptions.Item>
                <Descriptions.Item label="文件大小">
                  {(selectedModel.fileInfo.fileSize / 1024).toFixed(1)} KB
                </Descriptions.Item>
                <Descriptions.Item label="文件格式">
                  <Tag>{selectedModel.fileInfo.fileFormat}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="下载次数">
                  {selectedModel.sharing.downloadCount}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="验证信息" key="validation">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="验证状态">
                    <Badge
                      status={selectedModel.validation.isValidated ? 'success' : 'default'}
                      text={selectedModel.validation.isValidated ? '已验证' : '未验证'}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="验证精度">
                    {selectedModel.validation.isValidated ? (
                      <Progress
                        type="circle"
                        percent={selectedModel.validation.validationResults.accuracy}
                        size={80}
                      />
                    ) : (
                      <Text type="secondary">未验证</Text>
                    )}
                  </Card>
                </Col>
              </Row>
              
              {selectedModel.validation.isValidated && (
                <Card title="验证详情" style={{ marginTop: '16px' }}>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="频率范围">
                      {selectedModel.validation.validationResults.frequencyRange}
                    </Descriptions.Item>
                    <Descriptions.Item label="温度范围">
                      {selectedModel.validation.validationResults.temperatureRange}
                    </Descriptions.Item>
                    <Descriptions.Item label="验证备注">
                      {selectedModel.validation.validationResults.notes}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}
            </TabPane>
            
            <TabPane tab="评价统计" key="rating">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="用户评分">
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                        {selectedModel.sharing.rating.averageRating.toFixed(1)}
                      </div>
                      <Rate disabled value={selectedModel.sharing.rating.averageRating} />
                      <div style={{ color: '#666', marginTop: '8px' }}>
                        基于 {selectedModel.sharing.rating.ratingCount} 人评价
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="下载统计">
                    <Statistic
                      title="总下载量"
                      value={selectedModel.sharing?.downloadCount || 0}
                      prefix={<DownloadOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 上传模型模态框 */}
      <Modal
        title="上传数字模型"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              // 构造提交数据，确保包含 modelInfo
              const submitData = {
                ...values,
                modelInfo: {
                  modelName: values.componentName,
                  modelType: values.modelCategory,
                  modelVersion: '1.0',
                  description: values.description || values.modelPurpose,
                  keywords: []
                },
                versionControl: {
                  version: '1.0',
                  isLatest: true
                },
                sharing: {
                  isPublic: values.accessLevel === 'public',
                  accessLevel: values.accessLevel || 'registered',
                  downloadCount: 0,
                  rating: {
                    averageRating: 0,
                    ratingCount: 0
                  }
                }
              };
              
              // 移除不需要的文件字段
              delete submitData.modelFile;
              
              // 创建数字模型
              const createResponse = await fetch('http://localhost:3001/api/digital-models', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitData)
              });

              if (!createResponse.ok) {
                throw new Error('创建模型失败');
              }

              const createData = await createResponse.json();
              if (createData.success) {
                message.success('模型创建成功');
                
                // 如果有文件上传
                if (values.modelFile && values.modelFile.length > 0) {
                  const formData = new FormData();
                  formData.append('file', values.modelFile[0].originFileObj);
                  
                  const uploadResponse = await fetch(`http://localhost:3001/api/digital-models/${createData.data.id}/upload`, {
                    method: 'POST',
                    body: formData
                  });
                  
                  if (uploadResponse.ok) {
                    message.success('文件上传成功');
                  } else {
                    message.warning('文件上传失败，但模型已创建');
                  }
                }
                
                setUploadModalVisible(false);
                fetchModels();
              } else {
                throw new Error(createData.message || '创建模型失败');
              }
            } catch (error) {
              console.error('上传失败:', error);
              message.error('上传失败: ' + (error as Error).message);
            }
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="器件类别"
                name="componentCategory"
                rules={[{ required: true, message: '请选择器件类别' }]}
              >
                <Select placeholder="请选择器件类别">
                  <Option value="模拟器件">模拟器件</Option>
                  <Option value="数字器件">数字器件</Option>
                  <Option value="功率器件">功率器件</Option>
                  <Option value="射频器件">射频器件</Option>
                  <Option value="传感器">传感器</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="器件名称"
                name="componentName"
                rules={[{ required: true, message: '请输入器件名称' }]}
              >
                <Input placeholder="请输入器件名称" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="型号规格"
                name="modelSpecification"
                rules={[{ required: true, message: '请输入型号规格' }]}
              >
                <Input placeholder="请输入型号规格" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="生产厂家"
                name="manufacturer"
                rules={[{ required: true, message: '请输入生产厂家' }]}
              >
                <Input placeholder="请输入生产厂家" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="模型类别"
                name="modelCategory"
                rules={[{ required: true, message: '请选择模型类别' }]}
              >
                <Select placeholder="请选择模型类别">
                  <Option value="IBIS">IBIS</Option>
                  <Option value="SPICE">SPICE</Option>
                  <Option value="S-Parameter">S参数</Option>
                  <Option value="Thermal">热模型</Option>
                  <Option value="Mechanical">机械模型</Option>
                  <Option value="Other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="模型用途"
                name="modelPurpose"
                rules={[{ required: true, message: '请输入模型用途' }]}
              >
                <Input placeholder="请输入模型用途" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="模型描述"
            name="description"
            rules={[{ required: true, message: '请输入模型描述' }]}
          >
            <TextArea rows={3} placeholder="请输入模型描述" />
          </Form.Item>
          
          <Form.Item
            label="模型文件"
            name="modelFile"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
            rules={[{ required: true, message: '请上传模型文件' }]}
          >
            <Upload.Dragger
              beforeUpload={() => false}
              maxCount={1}
              accept=".lib,.ibs,.s2p,.s4p,.cir,.sp,.spice,.mod"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持 .lib, .ibs, .s2p, .cir, .spice 等格式的模型文件，最大50MB
              </p>
            </Upload.Dragger>
          </Form.Item>
          
          <Form.Item
            label="访问级别"
            name="accessLevel"
            initialValue="registered"
          >
            <Select>
              <Option value="public">公开</Option>
              <Option value="registered">注册用户</Option>
              <Option value="authorized">授权用户</Option>
              <Option value="private">私有</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑模型模态框 */}
      <Modal
        title="编辑数字模型"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => editForm.submit()}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              if (!selectedModel) return;
              
              const updateData = {
                ...values,
                modelInfo: {
                  modelName: values.modelName,
                  modelType: values.modelCategory,
                  modelVersion: values.modelVersion,
                  description: values.description,
                  keywords: []
                },
                sharing: {
                  ...selectedModel.sharing,
                  isPublic: values.sharing?.isPublic || false
                }
              };
              
              const response = await fetch(`http://localhost:3001/api/digital-models/${selectedModel.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
              });
              
              if (!response.ok) {
                throw new Error('更新失败');
              }
              
              message.success('模型更新成功');
              setEditModalVisible(false);
              fetchModels(); // 重新获取模型列表
            } catch (error) {
              console.error('更新模型失败:', error);
              message.error('更新模型失败');
            }
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="模型名称"
                name="modelName"
                rules={[{ required: true, message: '请输入模型名称' }]}
              >
                <Input placeholder="请输入模型名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="版本号"
                name="modelVersion"
                rules={[{ required: true, message: '请输入版本号' }]}
              >
                <Input placeholder="如：1.0.0" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="模型描述"
            name="description"
            rules={[{ required: true, message: '请输入模型描述' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="请简要描述模型的功能和特点"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="模型类别"
                name="modelCategory"
                rules={[{ required: true, message: '请选择模型类别' }]}
              >
                <Select placeholder="请选择模型类别">
                  <Select.Option value="机械设计">机械设计</Select.Option>
                  <Select.Option value="电子设计">电子设计</Select.Option>
                  <Select.Option value="建筑设计">建筑设计</Select.Option>
                  <Select.Option value="工艺流程">工艺流程</Select.Option>
                  <Select.Option value="仿真模型">仿真模型</Select.Option>
                  <Select.Option value="其他">其他</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="制造商"
                name="manufacturer"
              >
                <Input placeholder="请输入制造商名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="应用用途"
                name="modelPurpose"
              >
                <Select placeholder="请选择应用用途">
                  <Select.Option value="产品设计">产品设计</Select.Option>
                  <Select.Option value="工艺优化">工艺优化</Select.Option>
                  <Select.Option value="质量控制">质量控制</Select.Option>
                  <Select.Option value="维护保养">维护保养</Select.Option>
                  <Select.Option value="培训教学">培训教学</Select.Option>
                  <Select.Option value="其他">其他</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="技术规格"
                name="modelSpecification"
              >
                <Input placeholder="请输入技术规格" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="分享设置"
            name={['sharing', 'isPublic']}
            valuePropName="checked"
          >
            <input type="checkbox" style={{ marginRight: 8 }} />
            <span>设为公开模型（其他用户可以查看和下载）</span>
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量上传模态框 */}
      <Modal
        title="批量导入模型信息"
        open={batchUploadModalVisible}
        onCancel={() => setBatchUploadModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setBatchUploadModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="download"
            icon={<ExportOutlined />}
            onClick={handleDownloadTemplate}
          >
            下载模板
          </Button>,
          <Button
            key="import"
            type="primary"
            onClick={handleBatchImport}
            disabled={previewData.length === 0}
            loading={loading}
          >
            确认导入 ({previewData.length} 条)
          </Button>
        ]}
        width={1200}
        style={{ top: 20 }}
      >
        <div style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>使用说明：</Text>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                <li>请先下载模板文件，按照格式填写模型信息</li>
                <li>支持 CSV 格式文件，已自动配置为 UTF-8 编码（Excel 可直接打开）</li>
                <li>批量导入只导入模型基本信息，具体模型文件需要在详情页单独上传</li>
                <li>关键词请用分号(;)分隔，例如：运放;模拟;信号</li>
                <li>分享级别可选：公开、注册用户、授权用户、私有</li>
                <li style={{ color: '#1890ff' }}>如遇乱码问题，请确保文件编码为 UTF-8 格式</li>
              </ul>
            </div>
            
            <Upload.Dragger
              name="file"
              multiple={false}
              accept=".csv"
              beforeUpload={handleFileUpload}
              showUploadList={false}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持 CSV 格式文件，请确保文件编码为 UTF-8
              </p>
            </Upload.Dragger>
            
            {uploadedFile && (
              <div style={{ marginTop: '16px' }}>
                <Text strong>已选择文件：</Text>
                <Text code>{uploadedFile.name}</Text>
                <Text type="secondary" style={{ marginLeft: '16px' }}>
                  ({(uploadedFile.size / 1024).toFixed(2)} KB)
                </Text>
              </div>
            )}
          </Space>
        </div>
        
        {previewData.length > 0 && (
          <div>
            <Text strong style={{ marginBottom: '16px', display: 'block' }}>
              数据预览 ({previewData.length} 条记录)：
            </Text>
            <Table
              columns={[
                { title: '器件类别', dataIndex: '器件类别', key: '器件类别', width: 100 },
                { title: '器件名称', dataIndex: '器件名称', key: '器件名称', width: 120 },
                { title: '型号规格', dataIndex: '型号规格', key: '型号规格', width: 120 },
                { title: '生产厂家', dataIndex: '生产厂家', key: '生产厂家', width: 100 },
                { title: '模型类别', dataIndex: '模型类别', key: '模型类别', width: 100 },
                { title: '模型用途', dataIndex: '模型用途', key: '模型用途', width: 120 },
                { title: '模型名称', dataIndex: '模型名称', key: '模型名称', width: 140 },
                { title: '模型版本', dataIndex: '模型版本', key: '模型版本', width: 80 },
                { title: '分享级别', dataIndex: '分享级别', key: '分享级别', width: 100 }
              ]}
              dataSource={previewData}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                showQuickJumper: false
              }}
              scroll={{ x: 900, y: 300 }}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DigitalModels;

