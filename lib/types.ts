export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  items: Product[];
  nextCursor: string | null;
  hasMore: boolean;
}
