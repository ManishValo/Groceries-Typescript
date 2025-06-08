export interface Product {
  ProductID: number;
  ProductName: string;
  ProductDescription: string;
  ProductPrice: number;
  ProductImg: string;
  ProductQuantity: number;
}

export interface CartItem {
  CartID?: number;              
  ProductID: number;
  ProductName: string;
  ProductPrice: number;
  ProductImg: string;
  Description: string;
  ProductQuantity?: number;
  CartQty: number;
  TotalPrice: number;
  UserID: number;
}

export interface User {
  UserID: number;
  name: string;
}

export interface Category {
  CategoryID: number;
  CategoryName: string;
}
