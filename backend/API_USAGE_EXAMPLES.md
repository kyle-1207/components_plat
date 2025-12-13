# API 使用示例

本文档提供了企业级元器件管理平台的主要 API 端点使用示例。

## 器件查询 API

### 1. 搜索器件

```bash
# 基本搜索
GET /api/components?search=STM32&limit=10&offset=0

# 带筛选条件的搜索
GET /api/components?search=STM32&manufacturer=STMicroelectronics&category=microcontroller&minPrice=5&maxPrice=50&inStock=true

# 响应示例
{
  "components": [
    {
      "id": "comp_001",
      "partNumber": "STM32F103C8T6",
      "manufacturer": "STMicroelectronics",
      "category": "Microcontroller",
      "description": "32位ARM Cortex-M3微控制器",
      "specifications": {
        "coreArchitecture": "ARM Cortex-M3",
        "flashMemory": "64KB",
        "sramMemory": "20KB",
        "operatingVoltage": "2.0V-3.6V"
      },
      "pricing": [
        {
          "supplier": "Digikey",
          "price": 12.50,
          "currency": "USD",
          "quantity": 1,
          "priceBreaks": [
            { "quantity": 1, "price": 12.50 },
            { "quantity": 10, "price": 11.25 },
            { "quantity": 100, "price": 10.00 }
          ]
        }
      ],
      "availability": [
        {
          "supplier": "Digikey",
          "stockQuantity": 1500,
          "leadTime": "2-3 days"
        }
      ]
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

### 2. 获取器件详细信息

```bash
GET /api/components/comp_001

# 响应示例
{
  "id": "comp_001",
  "partNumber": "STM32F103C8T6",
  "manufacturer": "STMicroelectronics",
  "category": "Microcontroller",
  "description": "32位ARM Cortex-M3微控制器",
  "datasheet": "https://example.com/datasheet.pdf",
  "specifications": {
    "coreArchitecture": "ARM Cortex-M3",
    "flashMemory": "64KB",
    "sramMemory": "20KB",
    "operatingVoltage": "2.0V-3.6V",
    "packageType": "LQFP-48",
    "operatingTemperature": "-40°C to +85°C"
  },
  "pricing": [...],
  "availability": [...],
  "alternatives": [
    {
      "id": "comp_002",
      "partNumber": "STM32F103CBT6",
      "manufacturer": "STMicroelectronics",
      "similarityScore": 0.95
    }
  ],
  "priceHistory": [
    {
      "date": "2024-01-01",
      "price": 12.50,
      "supplier": "Digikey"
    }
  ],
  "certifications": [
    {
      "name": "RoHS",
      "status": "Compliant",
      "expiryDate": "2025-12-31"
    }
  ]
}
```

### 3. 器件对比

```bash
POST /api/components/compare
Content-Type: application/json

{
  "componentIds": ["comp_001", "comp_002", "comp_003"]
}

# 响应示例
{
  "comparison": {
    "comp_001": {
      "partNumber": "STM32F103C8T6",
      "manufacturer": "STMicroelectronics",
      "price": 12.50,
      "inStock": true,
      "flashMemory": "64KB",
      "sramMemory": "20KB"
    },
    "comp_002": {
      "partNumber": "STM32F103CBT6",
      "manufacturer": "STMicroelectronics",
      "price": 15.00,
      "inStock": true,
      "flashMemory": "128KB",
      "sramMemory": "20KB"
    },
    "comp_003": {
      "partNumber": "STM32F103RCT6",
      "manufacturer": "STMicroelectronics",
      "price": 18.50,
      "inStock": false,
      "flashMemory": "256KB",
      "sramMemory": "48KB"
    }
  },
  "recommendations": [
    {
      "type": "best_value",
      "componentId": "comp_001",
      "reason": "最佳性价比选择"
    },
    {
      "type": "best_performance",
      "componentId": "comp_003",
      "reason": "最高性能但缺货"
    }
  ]
}
```

### 4. 获取器件推荐

```bash
GET /api/components/comp_001/recommendations?type=alternatives&limit=5

# 响应示例
{
  "recommendations": [
    {
      "component": {
        "id": "comp_002",
        "partNumber": "STM32F103CBT6",
        "manufacturer": "STMicroelectronics"
      },
      "score": 0.95,
      "reason": "相同系列，更大存储容量",
      "type": "upgrade"
    },
    {
      "component": {
        "id": "comp_004",
        "partNumber": "STM32F401CCU6",
        "manufacturer": "STMicroelectronics"
      },
      "score": 0.88,
      "reason": "更新架构，更高性能",
      "type": "alternative"
    }
  ]
}
```

## 供应商 API

### 1. 获取所有供应商

```bash
GET /api/suppliers

# 响应示例
{
  "suppliers": [
    {
      "id": "supp_001",
      "name": "Digikey",
      "website": "https://www.digikey.com",
      "country": "USA",
      "rating": 4.8,
      "certification": ["ISO 9001", "AS9100"]
    },
    {
      "id": "supp_002",
      "name": "Mouser",
      "website": "https://www.mouser.com",
      "country": "USA",
      "rating": 4.7,
      "certification": ["ISO 9001"]
    }
  ]
}
```

### 2. 获取供应商详细信息

```bash
GET /api/suppliers/supp_001

# 响应示例
{
  "id": "supp_001",
  "name": "Digikey",
  "website": "https://www.digikey.com",
  "contactInfo": {
    "email": "support@digikey.com",
    "phone": "+1-800-344-4539",
    "address": "701 Brooks Avenue South, Thief River Falls, MN 56701"
  },
  "certification": ["ISO 9001", "AS9100"],
  "paymentTerms": "Net 30",
  "shippingOptions": ["Standard", "Express", "International"],
  "minimumOrder": 25.00,
  "currency": "USD"
}
```

## 分析 API

### 1. 获取市场趋势

```bash
GET /api/analytics/market-trends?category=microcontroller&period=6months

# 响应示例
{
  "trends": [
    {
      "period": "2024-01",
      "averagePrice": 12.30,
      "totalVolume": 15000,
      "componentCount": 250
    },
    {
      "period": "2024-02",
      "averagePrice": 12.85,
      "totalVolume": 16500,
      "componentCount": 268
    }
  ],
  "analysis": {
    "priceChange": "+4.5%",
    "volumeChange": "+10%",
    "trend": "increasing"
  }
}
```

### 2. 获取价格分析

```bash
GET /api/analytics/price-analysis?componentIds=comp_001,comp_002&period=3months

# 响应示例
{
  "priceAnalysis": {
    "comp_001": {
      "currentPrice": 12.50,
      "averagePrice": 12.20,
      "minPrice": 11.80,
      "maxPrice": 13.00,
      "priceChange": "+2.5%",
      "volatility": "low"
    },
    "comp_002": {
      "currentPrice": 15.00,
      "averagePrice": 14.50,
      "minPrice": 14.00,
      "maxPrice": 15.50,
      "priceChange": "+3.4%",
      "volatility": "medium"
    }
  },
  "recommendations": [
    {
      "componentId": "comp_001",
      "action": "buy",
      "reason": "价格相对稳定，适合采购"
    }
  ]
}
```

## 错误处理

所有 API 端点都遵循统一的错误响应格式：

```json
{
  "error": {
    "code": "COMPONENT_NOT_FOUND",
    "message": "指定的器件不存在",
    "details": {
      "componentId": "invalid_id"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_12345"
}
```

### 常见错误码

- `COMPONENT_NOT_FOUND` (404): 器件不存在
- `INVALID_PARAMETERS` (400): 请求参数无效
- `SUPPLIER_NOT_FOUND` (404): 供应商不存在
- `INSUFFICIENT_DATA` (422): 数据不足，无法生成分析
- `RATE_LIMIT_EXCEEDED` (429): 请求频率超限
- `INTERNAL_SERVER_ERROR` (500): 服务器内部错误

## 认证

所有 API 请求都需要包含认证令牌：

```bash
# 在请求头中包含 Authorization
GET /api/components
Authorization: Bearer YOUR_JWT_TOKEN
```

## 分页

支持分页的 API 端点使用以下参数：

- `limit`: 每页返回的记录数（默认 20，最大 100）
- `offset`: 跳过的记录数（默认 0）

响应中包含分页信息：

```json
{
  "data": [...],
  "pagination": {
    "total": 1500,
    "limit": 20,
    "offset": 0,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 速率限制

- 每个 IP 地址每分钟最多 60 次请求
- 认证用户每分钟最多 1000 次请求
- 超出限制时返回 429 状态码

## 示例客户端代码

### JavaScript/Node.js

```javascript
const axios = require('axios');

class ComponentAPI {
  constructor(baseURL, token) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async searchComponents(query, filters = {}) {
    const params = { search: query, ...filters };
    const response = await this.client.get('/components', { params });
    return response.data;
  }

  async getComponent(id) {
    const response = await this.client.get(`/components/${id}`);
    return response.data;
  }

  async compareComponents(componentIds) {
    const response = await this.client.post('/components/compare', {
      componentIds
    });
    return response.data;
  }
}

// 使用示例
const api = new ComponentAPI('http://localhost:3000/api', 'your-jwt-token');

async function example() {
  try {
    // 搜索器件
    const searchResults = await api.searchComponents('STM32', {
      manufacturer: 'STMicroelectronics',
      limit: 10
    });
    
    // 获取器件详情
    const component = await api.getComponent('comp_001');
    
    // 对比器件
    const comparison = await api.compareComponents(['comp_001', 'comp_002']);
    
    console.log('搜索结果:', searchResults);
    console.log('器件详情:', component);
    console.log('对比结果:', comparison);
  } catch (error) {
    console.error('API 调用失败:', error.response?.data || error.message);
  }
}
```

### Python

```python
import requests
import json

class ComponentAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def search_components(self, query, filters=None):
        params = {'search': query}
        if filters:
            params.update(filters)
        
        response = requests.get(
            f'{self.base_url}/components',
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def get_component(self, component_id):
        response = requests.get(
            f'{self.base_url}/components/{component_id}',
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def compare_components(self, component_ids):
        data = {'componentIds': component_ids}
        response = requests.post(
            f'{self.base_url}/components/compare',
            headers=self.headers,
            json=data
        )
        response.raise_for_status()
        return response.json()

# 使用示例
api = ComponentAPI('http://localhost:3000/api', 'your-jwt-token')

try:
    # 搜索器件
    search_results = api.search_components('STM32', {
        'manufacturer': 'STMicroelectronics',
        'limit': 10
    })
    
    # 获取器件详情
    component = api.get_component('comp_001')
    
    # 对比器件
    comparison = api.compare_components(['comp_001', 'comp_002'])
    
    print('搜索结果:', json.dumps(search_results, indent=2))
    print('器件详情:', json.dumps(component, indent=2))
    print('对比结果:', json.dumps(comparison, indent=2))
    
except requests.exceptions.RequestException as e:
    print(f'API 调用失败: {e}')
```

这个 API 使用示例文档涵盖了主要的功能端点，包括器件搜索、详情查询、对比分析等，以及完整的错误处理和客户端代码示例。
