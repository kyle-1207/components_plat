/**
 * 选型清单相关类型定义
 */

export interface SelectionItem {
  id: string;
  componentId: string;
  componentName: string;
  componentType: string;
  specification: string;
  quantity: number;
  unit: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'selected' | 'approved' | 'rejected';
  estimatedCost: number;
  actualCost?: number;
  leadTime: number; // 交付周期(天)
  supplierId?: string;
  supplierName?: string;
  alternativeSuppliers: Array<{
    supplierId: string;
    supplierName: string;
    price: number;
    leadTime: number;
    qualificationLevel: string;
  }>;
  technicalRequirements: string[];
  qualityRequirements: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export interface SelectionList {
  id: string;
  name: string;
  description: string;
  projectId: string;
  projectName: string;
  status: 'draft' | 'in_review' | 'approved' | 'completed' | 'cancelled';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  items: SelectionItem[];
  totalEstimatedCost: number;
  totalActualCost: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  deadline?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export interface SelectionCriteria {
  costWeight: number; // 成本权重 (0-1)
  qualityWeight: number; // 质量权重 (0-1)
  deliveryWeight: number; // 交付权重 (0-1)
  serviceWeight: number; // 服务权重 (0-1)
  maxBudget?: number;
  maxLeadTime?: number;
  requiredQualifications: string[];
  preferredSuppliers: string[];
  excludedSuppliers: string[];
}

export interface SelectionAnalysis {
  listId: string;
  totalItems: number;
  completedItems: number;
  pendingItems: number;
  totalCost: number;
  averageLeadTime: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  recommendations: Array<{
    itemId: string;
    recommendation: string;
    reason: string;
    impact: 'low' | 'medium' | 'high';
  }>;
  costBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  supplierDistribution: Array<{
    supplierId: string;
    supplierName: string;
    itemCount: number;
    totalValue: number;
  }>;
}

export interface CreateSelectionListRequest {
  name: string;
  description: string;
  projectId: string;
  projectName: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  deadline?: Date;
  tags: string[];
}

export interface UpdateSelectionListRequest {
  name?: string;
  description?: string;
  status?: 'draft' | 'in_review' | 'approved' | 'completed' | 'cancelled';
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  deadline?: Date;
  tags?: string[];
}

export interface CreateSelectionItemRequest {
  componentId: string;
  componentName: string;
  componentType: string;
  specification: string;
  quantity: number;
  unit: string;
  priority: 'high' | 'medium' | 'low';
  estimatedCost: number;
  leadTime: number;
  technicalRequirements: string[];
  qualityRequirements: string[];
  notes?: string;
}

export interface UpdateSelectionItemRequest {
  quantity?: number;
  priority?: 'high' | 'medium' | 'low';
  status?: 'pending' | 'selected' | 'approved' | 'rejected';
  estimatedCost?: number;
  actualCost?: number;
  leadTime?: number;
  supplierId?: string;
  supplierName?: string;
  technicalRequirements?: string[];
  qualityRequirements?: string[];
  notes?: string;
}

export interface SelectionListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'draft' | 'in_review' | 'approved' | 'completed' | 'cancelled';
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  projectId?: string;
  createdBy?: string;
  tag?: string;
  sortBy?: 'name' | 'priority' | 'status' | 'createdAt' | 'deadline' | 'totalCost';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface BulkSelectionOperation {
  operation: 'update_status' | 'assign_supplier' | 'update_priority' | 'delete';
  itemIds: string[];
  data?: {
    status?: 'pending' | 'selected' | 'approved' | 'rejected';
    supplierId?: string;
    supplierName?: string;
    priority?: 'high' | 'medium' | 'low';
  };
}
