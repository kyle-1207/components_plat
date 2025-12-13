import { Response } from 'express';

export function ok(res: Response, data: any) {
  return res.json({ success: true, data });
}

export function fail(
  res: Response,
  statusCode: number,
  code: string,
  message: string
) {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

export function buildPagination<T = any>(items: T[], total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / Math.max(1, limit));
  return {
    items,
    total,
    totalPages,
    page,
    limit,
    hasNextPage: page < totalPages,
  };
}

export type ApiComponent = {
  component_id: string;
  part_number: string;
  manufacturer_name: string;
  part_type?: string;
  quality_name?: string;
  obsolescence_type?: string;
  has_stock: string; // "Yes" | "No"
  family_path?: string[] | string;
  qpl_name?: string;
  qualified?: string;
  cad?: string;
  [key: string]: any;
};

export function mapHasStockToYesNo(value: any): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === 'Yes' || value === 'No') return value;
  if (value === 1 || value === '1' || value === 'true' || value === 'TRUE') return 'Yes';
  if (value === 0 || value === '0' || value === 'false' || value === 'FALSE') return 'No';
  return 'No';
}

export function formatComponentForApi(raw: any): ApiComponent {
  return {
    ...raw,
    has_stock: mapHasStockToYesNo(raw?.has_stock),
  };
}

export function formatListForApi(rawItems: any[]) {
  return rawItems.map(formatComponentForApi);
}
