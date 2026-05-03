export interface AvailabilitySlot {
    startTime: string;
    endTime: string;
    available: boolean;
}

export interface RawAvailabilitySlot {
    startTime?: string;
    endTime?: string;
    start?: string;
    end?: string;
    time?: string;
    available: boolean;
}