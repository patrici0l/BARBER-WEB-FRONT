export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    active: boolean;
    available: boolean;
}

export interface ProductRequest {
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string | null;
    active?: boolean;
}

export interface StockUpdateRequest {
    stock: number;
}