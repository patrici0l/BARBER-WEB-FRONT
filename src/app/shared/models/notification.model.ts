export type NotificationChannel = 'EMAIL' | 'WHATSAPP';
export type NotificationTriggerType = 'AUTOMATIC' | 'MANUAL';
export type NotificationStatus = 'SENT' | 'SKIPPED' | 'FAILED';

export interface NotificationSettings {
    reminderMinutesBefore: number;
    automaticEnabled: boolean;
    emailEnabled: boolean;
    whatsappEnabled: boolean;
    whatsappBusinessNumber: string | null;
    updatedAt: string;
}

export interface NotificationSettingsRequest {
    reminderMinutesBefore: number;
    automaticEnabled: boolean;
    emailEnabled: boolean;
    whatsappEnabled: boolean;
    whatsappBusinessNumber?: string | null;
}

export interface ManualNotificationRequest {
    appointmentId: number;
    email: boolean;
    whatsapp: boolean;
    customEmail?: string | null;
    customWhatsapp?: string | null;
    message?: string | null;
}

export interface NotificationHistory {
    id: number;
    appointmentId: number | null;
    clientName: string | null;
    serviceName: string | null;
    channel: NotificationChannel;
    triggerType: NotificationTriggerType;
    status: NotificationStatus;
    recipient: string | null;
    subject: string | null;
    message: string | null;
    scheduledFor: string | null;
    createdAt: string;
    detail: string | null;
}
