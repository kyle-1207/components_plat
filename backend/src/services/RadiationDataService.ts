import crypto from 'crypto';
import { FilterQuery } from 'mongoose';
import { IrradiationTest, IIrradiationTest } from '../models/IrradiationTest';
import { CacheService, getCacheService, CacheTTL } from './CacheService';
import { RadiationDataFilterOptions, RadiationDataListResponse } from '../types';

export interface RadiationDataQuery {
  page?: number | string;
  limit?: number | string;
  keyword?: string;
  category?: string;
  subcategory?: string;
  qualityGrade?: string;
  supplier?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc' | string;
  totalDoseMin?: number | string;
  totalDoseMax?: number | string;
  singleEventMin?: number | string;
  singleEventMax?: number | string;
}

interface NormalizedRadiationQuery {
  page: number;
  limit: number;
  keyword?: string;
  category?: string;
  subcategory?: string;
  qualityGrade?: string;
  supplier?: string;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  totalDoseMin?: number;
  totalDoseMax?: number;
  singleEventMin?: number;
  singleEventMax?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_SORT_FIELD = 'model';
const SORTABLE_FIELDS = new Set([
  'model',
  'product_name',
  'quality_grade',
  'supplier',
  'total_dose_numeric',
  'single_event_numeric',
  'created_at',
]);

export class RadiationDataService {
  private cacheService: CacheService;

  constructor(cacheService: CacheService = getCacheService()) {
    this.cacheService = cacheService;
  }

  async listRadiationData(query: RadiationDataQuery): Promise<RadiationDataListResponse> {
    const normalized = this.normalizeQuery(query);
    const cacheKey = this.buildCacheKey(normalized);

    return this.cacheService.getOrSet<RadiationDataListResponse>(cacheKey, async () => {
      const filters = this.buildFilters(normalized);
      const sort = this.buildSort(normalized);
      const skip = (normalized.page - 1) * normalized.limit;

      const [items, total] = await Promise.all([
        IrradiationTest.find(filters)
          .sort(sort)
          .skip(skip)
          .limit(normalized.limit)
          .lean(),
        IrradiationTest.countDocuments(filters),
      ]);

      const totalPages = Math.ceil(total / normalized.limit) || 1;

      return {
        items,
        total,
        page: normalized.page,
        limit: normalized.limit,
        totalPages,
        hasNextPage: normalized.page < totalPages,
        hasPrevPage: normalized.page > 1,
      };
    }, CacheTTL.RADIATION_DATA);
  }

  async getFilterOptions(): Promise<RadiationDataFilterOptions> {
    return this.cacheService.getOrSet<RadiationDataFilterOptions>(
      'radiation:data:filters',
      async () => {
        const [categories, subcategories, qualityGrades, suppliers] = await Promise.all([
          IrradiationTest.distinct('category'),
          IrradiationTest.distinct('subcategory'),
          IrradiationTest.distinct('quality_grade'),
          IrradiationTest.distinct('supplier'),
        ]);

        const normalizeDistinct = (values: unknown[]) =>
          values
            .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
            .map((value) => value.trim())
            .sort((a, b) => a.localeCompare(b, 'zh-CN'));

        return {
          categories: normalizeDistinct(categories),
          subcategories: normalizeDistinct(subcategories),
          qualityGrades: normalizeDistinct(qualityGrades),
          suppliers: normalizeDistinct(suppliers),
        };
      },
      CacheTTL.RADIATION_FILTERS
    );
  }

  private normalizeQuery(query: RadiationDataQuery): NormalizedRadiationQuery {
    const page = Math.max(
      DEFAULT_PAGE,
      Number.isFinite(Number(query.page)) ? Number(query.page) : DEFAULT_PAGE
    );

    const limitRaw = Number.isFinite(Number(query.limit)) ? Number(query.limit) : DEFAULT_LIMIT;
    const limit = Math.min(Math.max(1, limitRaw), MAX_LIMIT);

    const sortField = SORTABLE_FIELDS.has(String(query.sortField || '').trim())
      ? String(query.sortField).trim()
      : DEFAULT_SORT_FIELD;
    const sortOrder = String(query.sortOrder).toLowerCase() === 'desc' ? 'desc' : 'asc';

    const sanitize = (value?: string | string[] | null) =>
      typeof value === 'string' ? value.trim() || undefined : undefined;

    const parseNumber = (value?: string | number) => {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    return {
      page,
      limit,
      keyword: sanitize(query.keyword),
      category: sanitize(query.category),
      subcategory: sanitize(query.subcategory),
      qualityGrade: sanitize(query.qualityGrade),
      supplier: sanitize(query.supplier),
      sortField,
      sortOrder,
      totalDoseMin: parseNumber(query.totalDoseMin),
      totalDoseMax: parseNumber(query.totalDoseMax),
      singleEventMin: parseNumber(query.singleEventMin),
      singleEventMax: parseNumber(query.singleEventMax),
    };
  }

  private buildFilters(query: NormalizedRadiationQuery): FilterQuery<IIrradiationTest> {
    const filters: FilterQuery<IIrradiationTest> = {};

    if (query.keyword) {
      const keywordRegex = new RegExp(this.escapeRegex(query.keyword), 'i');
      filters.$or = [
        { model: keywordRegex },
        { model_spec: keywordRegex },
        { supplier: keywordRegex },
        { product_name: keywordRegex },
      ];
    }

    if (query.category) {
      filters.category = query.category;
    }

    if (query.subcategory) {
      filters.subcategory = query.subcategory;
    }

    if (query.qualityGrade) {
      filters.quality_grade = query.qualityGrade;
    }

    if (query.supplier) {
      filters.supplier = query.supplier;
    }

    const exprConditions: any[] = [];

    if (query.totalDoseMin !== undefined) {
      exprConditions.push({ $gte: [this.numericFieldExpr('total_dose'), query.totalDoseMin] });
    }

    if (query.totalDoseMax !== undefined) {
      exprConditions.push({ $lte: [this.numericFieldExpr('total_dose'), query.totalDoseMax] });
    }

    if (query.singleEventMin !== undefined) {
      exprConditions.push({ $gte: [this.numericFieldExpr('single_event'), query.singleEventMin] });
    }

    if (query.singleEventMax !== undefined) {
      exprConditions.push({ $lte: [this.numericFieldExpr('single_event'), query.singleEventMax] });
    }

    if (exprConditions.length === 1) {
      filters.$expr = exprConditions[0];
    } else if (exprConditions.length > 1) {
      filters.$expr = { $and: exprConditions };
    }

    return filters;
  }

  private buildSort(query: NormalizedRadiationQuery): Record<string, 1 | -1> {
    const direction = query.sortOrder === 'desc' ? -1 : 1;
    return { [query.sortField]: direction };
  }

  private numericFieldExpr(field: string) {
    return {
      $ifNull: [
        `$${field}_numeric`,
        {
          $convert: {
            input: { $ifNull: [`$${field}`, null] },
            to: 'double',
            onError: null,
            onNull: null,
          },
        },
      ],
    };
  }

  private buildCacheKey(query: NormalizedRadiationQuery): string {
    const serialized = JSON.stringify(query);
    const hash = crypto.createHash('md5').update(serialized).digest('hex').substring(0, 24);
    return `radiation:data:list:${hash}`;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}


