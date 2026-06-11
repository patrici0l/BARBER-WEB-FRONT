export interface BarberService {
    id: number;
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    imageUrl: string | null;
    active: boolean;
}

export interface BarberServiceRequest {
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    imageUrl?: string | null;
    active?: boolean;
}
