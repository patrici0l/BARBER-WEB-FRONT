export interface BarberService {
    id: number;
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    active: boolean;
}

export interface BarberServiceRequest {
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    active?: boolean;
}