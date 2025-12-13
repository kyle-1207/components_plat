import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { premiumProductService } from '../services';
import { CustomError } from '../middleware/errorHandler';

const parseArrayParam = (value?: string | string[]): string[] | undefined => {
  if (!value) return undefined;
  const list = Array.isArray(value) ? value : String(value).split(',');
  const normalized = list.map((item) => item.trim()).filter(Boolean);
  return normalized.length ? normalized : undefined;
};

const parseBooleanParam = (value?: string | string[]): boolean | undefined => {
  if (value === undefined) return undefined;
  const str = Array.isArray(value) ? value[0] : value;
  const normalized = str.trim().toLowerCase();
  if (!normalized) return undefined;
  if (['1', 'true', 'yes', 'y', '是', '有'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', '否', '无'].includes(normalized)) return false;
  return undefined;
};

const parseNumberParam = (value?: string | string[]): number | undefined => {
  if (value === undefined) return undefined;
  const str = Array.isArray(value) ? value[0] : value;
  const parsed = Number(str);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const listPremiumProducts = async (req: Request, res: Response) => {
  const query = {
    page: parseNumberParam(req.query.page),
    limit: parseNumberParam(req.query.limit),
    categories: parseArrayParam(req.query.category),
    qualityLevels: parseArrayParam(req.query.qualityLevel),
    keyword: req.query.keyword ? String(req.query.keyword) : undefined,
    isPromoted: parseBooleanParam(req.query.isPromoted),
    hasFlightHistory: parseBooleanParam(req.query.hasFlightHistory),
    priceMin: parseNumberParam(req.query.priceMin),
    priceMax: parseNumberParam(req.query.priceMax),
    leadTimeMaxWeeks: parseNumberParam(req.query.leadTimeMaxWeeks || req.query.leadTimeMax),
  };

  const result = await premiumProductService.listProducts(query);

  res.json({
    success: true,
    data: result.items,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
    },
  });
};

export const getPremiumProductDetail = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new CustomError('缺少产品ID', 400, 'MISSING_PRODUCT_ID');
  }

  const product = await premiumProductService.getProductById(id);
  if (!product) {
    throw new CustomError('未找到对应的优质产品', 404, 'PREMIUM_PRODUCT_NOT_FOUND');
  }

  res.json({
    success: true,
    data: product,
  });
};

export const downloadPremiumProductDatasheet = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new CustomError('缺少产品ID', 400, 'MISSING_PRODUCT_ID');
  }

  const product = await premiumProductService.getProductById(id);
  if (!product || !product.datasheetPath) {
    throw new CustomError('暂无可用的数据手册', 404, 'DATASHEET_NOT_FOUND');
  }

  const filePath = product.datasheetPath;
  if (!fs.existsSync(filePath)) {
    throw new CustomError('数据手册文件不存在，请联系管理员', 404, 'DATASHEET_FILE_MISSING');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.download(filePath, path.basename(filePath));
};


