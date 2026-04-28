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
