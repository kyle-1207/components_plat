import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';

export function coercePagination(req: Request) {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  req.query.page = String(Number.isFinite(page) && page > 0 ? Math.floor(page) : 1);
  const bounded = Math.max(1, Math.min(100, Number.isFinite(limit) ? Math.floor(limit) : 20));
  req.query.limit = String(bounded);
}

function normalizeHasStockParam(raw: any): boolean | undefined {
  if (raw === undefined) return undefined;
  const str = String(raw).trim();
  if (str === 'Yes') return true;
  if (str === 'No') return false;
  if (/^(true|1)$/i.test(str)) return true;
  if (/^(false|0)$/i.test(str)) return false;
  return undefined;
}

export function validateSearchQuery(req: Request, _res: Response, next: NextFunction) {
  coercePagination(req);

  const { sort } = req.query as any;
  if (sort && typeof sort !== 'string') {
    return next(new CustomError('无效的排序参数', 400, 'INVALID_SORT'));
  }

  // familyPath 可以是字符串或 JSON 数组字符串
  const fp = req.query.familyPath;
  if (fp && typeof fp === 'string') {
    const decoded = decodeURIComponent(fp);
    if (decoded.startsWith('[') && decoded.endsWith(']')) {
      try {
        JSON.parse(decoded);
      } catch {
        return next(new CustomError('familyPath 必须为 JSON 数组字符串', 400, 'INVALID_FAMILY_PATH'));
      }
    }
  }

  // hasStock 兼容 Yes/No 或 布尔表达
  const hs = normalizeHasStockParam(req.query.hasStock);
  if (hs !== undefined) {
    (req as any).validatedHasStock = hs;
  }

  next();
}

export function validateComponentId(req: Request, _res: Response, next: NextFunction) {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.length < 3) {
    return next(new CustomError('组件ID不能为空', 400, 'INVALID_ID'));
  }
  next();
}

export function validateCompareBody(req: Request, _res: Response, next: NextFunction) {
  const ids = req.body?.componentIds;
  if (!Array.isArray(ids) || ids.length < 2 || ids.length > 5) {
    return next(new CustomError('componentIds 需为长度 2-5 的数组', 400, 'INVALID_COMPONENT_IDS'));
  }
  if (!ids.every((x: any) => typeof x === 'string' && x.length >= 3)) {
    return next(new CustomError('componentIds 中存在无效ID', 400, 'INVALID_COMPONENT_IDS'));
  }
  next();
}
