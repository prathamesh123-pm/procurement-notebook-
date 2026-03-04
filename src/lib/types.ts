
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  status: TaskStatus;
  createdAt: string;
}

export interface MilkMetrics {
  quantity: number;
  fat: number;
  snf: number;
}

export interface Supplier {
  id: string;
  name: string;
  address: string;
  mobile: string;
  milkQuality: string;
  routeId?: string;
  competition?: string;
  additionalInfo?: string;
  cowMilk: MilkMetrics;
  buffaloMilk: MilkMetrics;
}

export interface Route {
  id: string;
  name: string;
  distanceKm: number;
  vehicle: string;
  costPerKm: number;
  supplierIds: string[];
}

export interface VisitReport {
  id: string;
  routeId: string;
  supplierId: string;
  date: string;
  observations: string;
  summary?: string;
}

export interface DailyReport {
  id: string;
  date: string;
  taskIds: string[];
  routeIds: string[];
  notes: string;
  summary?: string;
}
