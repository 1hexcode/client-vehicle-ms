export interface Part {
  id: string;
  categoryId: string;
  categoryName?: string;
  vendorId?: string;
  vendorName?: string;
  name: string;
  sku: string;
  description?: string;
  costPrice: number;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PartCategory {
  id: string;
  name: string;
  description?: string;
  vehicleType: string;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
}

export interface Staff {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone: string;
  address?: string;
  openingBalance: number;
  dueAmount: number;
  totalPaid: number;
  isActive: boolean;
  createdAt: string;
}

export interface VendorPayment {
  id: string;
  vendorId: string;
  amount: number;
  type: string;
  attachmentUrl?: string;
  receiptNo?: string;
  notes?: string;
  createdAt: string;
}

export interface VendorPurchaseItem {
  id: string;
  vehiclePartName: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  createdAt: string;
}

export interface VendorPurchase {
  id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: VendorPurchaseItem[];
}

export interface PurchaseInvoiceItem {
  id?: string;
  vehiclePartId: string;
  vehiclePartName?: string;
  quantity: number;
  unitCost: number;
  lineTotal?: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber?: string;
  vendorId: string;
  vendorName?: string;
  receivedAt: string;
  tax: number;
  subtotal?: number;
  total: number;
  notes?: string;
  status?: string;
  createdAt: string;
  items: PurchaseInvoiceItem[];
}

export interface MeProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role: string;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  customerId: string;
  vehicleNumber: string;
  type: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleNumber: string;
  serviceType: string;
  requestedAt: string;
  confirmedAt?: string;
  status: string;
  notes?: string;
  assignedStaffUserId?: string;
  assignedStaffName?: string;
  createdAt: string;
}

export interface SalesInvoiceLine {
  id: string;
  partId: string;
  partName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  vehicleId?: string;
  vehicleNumber?: string;
  createdByUserId: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: string;
  issuedAt?: string;
  dueAt?: string;
  createdAt: string;
  updatedAt?: string;
  lines: SalesInvoiceLine[];
}

