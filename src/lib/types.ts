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
  assignedToUserId: string;
}

export interface MilkMetrics {
  quantity?: number;
  fat?: number;
  snf?: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  brand?: string;
  quantity: number;
  ownership: 'Self' | 'Company';
}

export type SupplierType = 'Gavali' | 'Gotha' | 'Center';

export interface Supplier {
  id: string;
  supplierId: string; // Manual Business ID
  name: string;
  address: string;
  mobile: string;
  routeId: string;
  supplierType: SupplierType;
  competition?: string;
  additionalInfo?: string;
  cowMilk?: MilkMetrics;
  buffaloMilk?: MilkMetrics;
  adulterationKitInfo?: string;
  // Procurement specific fields
  iceBlocks?: number;
  scaleBrand?: string;
  fatMachineBrand?: string;
  collectionType?: string;
  cattleFeedBrand?: string;
  fssaiNumber?: string;
  fssaiExpiry?: string;
  // Center specific fields (Unified)
  operatorName?: string;
  village?: string;
  paymentCycle?: string;
  spaceOwnership?: 'Self' | 'Rented';
  hygieneGrade?: string;
  additionalNotes?: string;
  // Material tracking
  milkCansCount?: number;
  computerAvailable?: boolean;
  upsInverterAvailable?: boolean;
  solarAvailable?: boolean;
  chemicalsStock?: string;
  batteryCondition?: string;
  equipment?: EquipmentItem[];
  updatedAt: string;
}

export interface CenterMaterial {
  weighingScaleBrand?: string;
  fatMachineBrand?: string;
  milkCansCount?: number;
  computerAvailable?: boolean;
  upsInverterAvailable?: boolean;
  solarAvailable?: boolean;
  chemicalsStock?: string;
  batteryCondition?: string;
  equipment?: EquipmentItem[];
}

export interface CollectionCenter extends Supplier {
  // Inherits from Supplier
}

export interface Route {
  id: string;
  name: string;
  distanceKm: number;
  vehicle: string;
  costPerKm: number;
  supplierIds: string[];
  iceBlocks?: number;
  updatedAt?: string;
}

export interface BreakdownLoss {
  id: string;
  supplierCode: string;
  supplierName: string;
  bufMilkLossLiters: string;
  cowMilkLossLiters: string;
  lossAmount: string;
}

export interface BreakdownRecord {
  id: string;
  routeName: string;
  vehicleType: string;
  vehicleNumber: string;
  driverName: string;
  location: string;
  reason: string;
  losses: BreakdownLoss[];
  date: string;
  totalLossAmount: number;
  createdAt: string;
  updatedAt: string;
}

export type ReportType = 'Daily Office Work' | 'Field Visit' | 'Route Visit' | 'Daily Task' | 'Breakdown' | 'Custom Form' | 'Collection Center Audit' | 'FSSAI Center Inspection' | 'Seizure & Penalty' | 'Milk Procurement Survey' | 'Chilling Report' | 'Transport Breakdown Report' | 'Daily Work Report';

export interface Report {
  id: string;
  type: ReportType;
  date: string;
  reportDate: string;
  generatedByUserId: string;
  summary: string;
  overallSummary: string;
  fullData?: any;
  createdAt: string;
  updatedAt?: string;
}

// Form Builder Types
export type FieldType = 'text' | 'number' | 'date' | 'textarea';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
}

export interface FormDefinition {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}