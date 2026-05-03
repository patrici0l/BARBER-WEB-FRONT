import { BarberService } from './barber-service.model';

export type AppointmentStatus = 'BOOKED' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
    id: number;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;

    service?: BarberService;
    serviceId?: number;
    serviceName?: string;

    userId?: number;
    userName?: string;
    userEmail?: string;

    clientName?: string;
    clientEmail?: string;
}

export interface AppointmentRequest {
    serviceId: number;
    appointmentDate: string;
    startTime: string;
}