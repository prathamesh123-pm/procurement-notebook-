export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  remark?: string;
  assignedTo: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  supplierName?: string;
  supplierId?: string;
}

export interface MilkMetrics {
  quantity?: number;
  fat?: number;
  snf?: number;
}

export interface Supplier {
  id: string;
  name: string;
  address: string;
  mobile: string;
  routeId: string;
  competition?: string;
  additionalInfo?: string;
  cowMilk?: MilkMetrics;
  buffaloMilk?: MilkMetrics;
  // Operations Fields
  iceBlocks?: number;
  scaleBrand?: string;
  fatMachineBrand?: string;
  collectionType?: string;
  cattleFeedBrand?: string;
  // FSSAI Fields
  fssaiNumber?: string;
  fssaiExpiry?: string;
}

export interface Route {
  id: string;
  name: string;
  distanceKm: number;
  vehicle: string;
  costPerKm: number;
  supplierIds: string[];
  iceBlocks?: number;
}

export type ReportType = 'Daily Office Work' | 'Field Visit' | 'Daily Task';

export interface Report {
  id: string;
  type: ReportType;
  date: string;
  workItemsCount: number;
  interactionsCount: number;
  summary: string;
  fullData?: any;
}
