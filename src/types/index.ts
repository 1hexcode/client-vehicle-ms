export interface Part {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  supplierId: string;
  createdAt: string;
  updatedAt: string;
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
