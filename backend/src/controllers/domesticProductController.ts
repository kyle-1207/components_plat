import { Request, Response } from 'express';
import { domesticProductService } from '../services/DomesticProductService';
import { DomesticProduct } from '../models/DomesticProduct';

const parseNumber = (value?: string | string[]) => {
  if (value === undefined) return undefined;
  const v = Array.isArray(value) ? value[0] : value;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

export const searchDomesticProducts = async (req: Request, res: Response) => {
  const query = {
    keyword: req.query.keyword ? String(req.query.keyword) : undefined,
    model: req.query.model ? String(req.query.model) : undefined,
    manufacturer: req.query.manufacturer ? String(req.query.manufacturer) : undefined,
    level1: req.query.level1 ? String(req.query.level1) : undefined,
    level2: req.query.level2 ? String(req.query.level2) : undefined,
    level3: req.query.level3 ? String(req.query.level3) : undefined,
    page: parseNumber(req.query.page),
    limit: parseNumber(req.query.limit),
  };

  const result = await domesticProductService.search(query);
  res.json({
    success: true,
    data: {
      items: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    },
  });
};

export const getDomesticCategoryTree = async (_req: Request, res: Response) => {
  const { tree, subCategories } = domesticProductService.getCategoryTree();
  res.json({
    success: true,
    data: {
      tree,
      subCategories,
    },
  });
};

/**
 * 国产元器件对比（包含功能描述和参数详情）
 * Body: { componentIds: string[] }
 */
export const compareDomesticProducts = async (req: Request, res: Response) => {
  const ids = Array.isArray(req.body?.componentIds) ? req.body.componentIds : [];
  if (!ids || ids.length < 2) {
    return res.status(400).json({
      success: false,
      message: '请至少选择2个元器件进行对比',
    });
  }

  const docs = await DomesticProduct.find({ _id: { $in: ids } }).lean();

  const components = docs.map((item) => ({
    component_id: String(item._id),
    part_number: item.model || item.name || '-',
    manufacturer_name: item.manufacturer || '-',
    part_type: item.name || '-',
    quality_name: item.quality || '-',
    obsolescence_type: item.space_supply || '-',
    has_stock: 'N/A',
    family_path: [item.level3, item.level2, item.level1].filter(Boolean).join(' / '),
    // 添加功能描述和参数详情字段
    key_specs: item.key_specs || '-',
    temperature_range: item.temperature_range || '-',
    package: item.package || '-',
    price_range: item.price_range || '-',
    lead_time: item.lead_time || '-',
    radiation: item.radiation || '-',
    contact: item.contact || '-',
    is_promoted: item.is_promoted || '-',
  }));

  // 构建参数对比数据
  const parameterKeys = [
    { key: 'key_specs', label: '关键性能' },
    { key: 'temperature_range', label: '工作温度范围' },
    { key: 'package', label: '封装形式' },
    { key: 'price_range', label: '价格范围' },
    { key: 'lead_time', label: '交货期' },
    { key: 'radiation', label: '抗辐照指标' },
    { key: 'contact', label: '联系人' },
    { key: 'is_promoted', label: '是否主推' },
  ];

  const parameters = parameterKeys.map((param) => ({
    key: param.key,
    name: param.label,
    ...Object.fromEntries(
      docs.map((item, idx) => [
        `component_${idx}`,
        {
          name: param.label,
          value: String(item[param.key as keyof typeof item] || '-'),
        },
      ])
    ),
  }));

  res.json({
    success: true,
    data: {
      components,
      parameters,
    },
  });
};

