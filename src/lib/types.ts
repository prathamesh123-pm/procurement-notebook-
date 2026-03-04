
export type TaskStatus = 'assigned' | 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  status: TaskStatus;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  address: string;
  mobile: string;
  milkQuantity: number;
  milkQuality: string;
  additionalInfo?: string;
  routeId?: string;
}

export interface Route {
  id: string;
  name: string;
  distanceKm: number;
  vehicle: string;
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
