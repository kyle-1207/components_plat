import { Request, Response } from 'express';
import { domesticProductService } from '../services/DomesticProductService';

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

