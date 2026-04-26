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
