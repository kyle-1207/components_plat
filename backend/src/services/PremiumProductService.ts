import { FilterQuery } from 'mongoose';
import { IPremiumProduct, PremiumProduct } from '../models';

export interface PremiumProductListQuery {
  page?: number;
  limit?: number;
  categories?: string[];
  qualityLevels?: string[];
  isPromoted?: boolean;
  hasFlightHistory?: boolean;
  priceMin?: number;
  priceMax?: number;
  leadTimeMaxWeeks?: number;
  keyword?: string;
}

export class PremiumProductService {
  async listProducts(query: PremiumProductListQuery) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit ? Math.min(Math.max(query.limit, 1), 100) : 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IPremiumProduct> = {};

    if (query.categories?.length) {
      filter.category = { $in: query.categories };
    }

    if (query.qualityLevels?.length) {
      filter.qualityLevel = { $in: query.qualityLevels };
    }

    if (typeof query.isPromoted === 'boolean') {
      filter.isPromoted = query.isPromoted;
    }

    if (query.hasFlightHistory === true) {
      // 有航天经历：标记为已飞或有非空描述均认为有经历
      filter.$or = [
        { 'flightHistory.hasFlightHistory': true },
        { 'flightHistory.description': { $exists: true, $ne: '' } },
      ];
    }

    const mergeRangeFilter = (field: string, operator: '$gte' | '$lte', value: number) => {
      const current = (filter as Record<string, Record<string, number>>)[field] || {};
      (filter as Record<string, Record<string, number>>)[field] = { ...current, [operator]: value };
    };

    if (query.priceMin !== undefined) {
      mergeRangeFilter('priceRange.min', '$gte', query.priceMin);
    }

    if (query.priceMax !== undefined) {
      mergeRangeFilter('priceRange.max', '$lte', query.priceMax);
    }

    if (query.leadTimeMaxWeeks !== undefined) {
      mergeRangeFilter('leadTimeRange.maxWeeks', '$lte', query.leadTimeMaxWeeks);
    }

    if (query.keyword) {
      const regex = new RegExp(query.keyword, 'i');
      filter.$or = [{ productName: regex }, { modelSpec: regex }, { packageType: regex }];
    }

    const [items, total] = await Promise.all([
      PremiumProduct.find(filter)
        .sort({ isPromoted: -1, 'flightHistory.hasFlightHistory': -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PremiumProduct.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  }

  async getProductById(id: string) {
    return PremiumProduct.findById(id).lean();
  }
}

export const premiumProductService = new PremiumProductService();


