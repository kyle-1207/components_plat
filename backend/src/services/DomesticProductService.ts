import fs from 'fs';
import path from 'path';
import { DomesticProduct, IDomesticProduct } from '../models/DomesticProduct';

export interface DomesticSearchQuery {
  keyword?: string;
  model?: string;
  manufacturer?: string;
  level1?: string;
  level2?: string;
  level3?: string;
  page?: number;
  limit?: number;
}

export interface DomesticSearchResult {
  items: IDomesticProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DomesticProductService {
  private classificationTreeCache: any | null = null;

  private buildQuery(params: DomesticSearchQuery) {
    const query: Record<string, any> = {};
    const regex = (value: string) => new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    if (params.keyword) {
      const r = regex(params.keyword);
      query.$or = [
        { name: r },
        { model: r },
        { manufacturer: r },
        { key_specs: r },
      ];
    }

    if (params.model) query.model = regex(params.model);
    if (params.manufacturer) query.manufacturer = regex(params.manufacturer);
    if (params.level1) query.level1 = params.level1;
    if (params.level2) query.level2 = params.level2;
    if (params.level3) query.level3 = params.level3;

    return query;
  }

  async search(params: DomesticSearchQuery): Promise<DomesticSearchResult> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 100) : 20;
    const skip = (page - 1) * limit;

    const query = this.buildQuery(params);

    const [items, total] = await Promise.all([
      DomesticProduct.find(query).skip(skip).limit(limit).lean(),
      DomesticProduct.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * 从 classification.json 构建分类树。
   * 结构：[{ value,label, children:[{value,label, children:[...]}] }]
   */
  getCategoryTree() {
    if (this.classificationTreeCache) return this.classificationTreeCache;

    // 尝试多路径读取 classification.json；若格式不规范（前缀文本/注释），做一次清洗
    const candidatePaths = [
      path.resolve(process.cwd(), 'classification.json'),               // backend 启动目录下
      path.resolve(process.cwd(), '..', 'classification.json'),         // 仓库根目录（常见）
      path.resolve(__dirname, '..', '..', '..', 'classification.json'), // 兼容构建后路径
    ];

    let data: Array<{ level1: string; level2: string; level3: string }> = [];
    let foundPath: string | null = null;

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      console.error('读取 classification.json 失败：未找到文件，候选路径：', candidatePaths);
      this.classificationTreeCache = [];
      return { tree: [], subCategories: {} };
    }

    try {
      const raw = fs.readFileSync(foundPath, 'utf-8');
      const start = raw.indexOf('[');
      const end = raw.lastIndexOf(']');
      const jsonStr = start >= 0 && end >= start ? raw.slice(start, end + 1) : raw;
      data = JSON.parse(jsonStr);
    } catch (err) {
      console.error('读取 classification.json 失败，将返回空分类树', err);
      this.classificationTreeCache = [];
      return { tree: [], subCategories: {} };
    }

    const treeMap: Record<string, any> = {};
    const subMap: Record<string, any> = {};
    const norm = (v?: string) => (typeof v === 'string' ? v.trim() : v);

    data.forEach((row) => {
      const l1 = norm(row.level1);
      const l2v = norm(row.level2);
      const l3v = norm(row.level3);
      if (!l1) return;

      if (!treeMap[l1]) {
        treeMap[l1] = { value: l1, label: l1, children: {} };
      }
      if (!subMap[l1]) {
        subMap[l1] = {};
      }

      if (l2v) {
        const l2 = treeMap[l1].children;
        if (!l2[l2v]) {
          l2[l2v] = { value: l2v, label: l2v, children: {} };
        }
        if (!subMap[l1][l2v]) {
          subMap[l1][l2v] = [];
        }
        if (l3v) {
          const l3 = l2[l2v].children;
          l3[l3v] = { value: l3v, label: l3v };
          if (!subMap[l1][l2v].includes(l3v)) {
            subMap[l1][l2v].push(l3v);
          }
        }
      }
    });

    const toArray = (node: any) => {
      const children = node.children ? Object.values(node.children).map(toArray) : undefined;
      const cleaned = { value: node.value, label: node.label };
      if (children && children.length) {
        return { ...cleaned, children };
      }
      return cleaned;
    };

    const tree = Object.values(treeMap).map(toArray);

    // subCategories 形如 { [level1]: { [level2]: [level3, ...] } }
    const subCategories = subMap;

    this.classificationTreeCache = { tree, subCategories };
    return { tree, subCategories };
  }
}

export const domesticProductService = new DomesticProductService();

