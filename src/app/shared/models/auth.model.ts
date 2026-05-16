export type UserRole = 'ADMIN' | 'CLIENT';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    phoneNumber?: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    userId: number;
    name: string;
    email: string;
    role: UserRole;
}

export interface CurrentUser {
    userId: number;
    name: string;
    email: string;
    role: UserRole;
}
