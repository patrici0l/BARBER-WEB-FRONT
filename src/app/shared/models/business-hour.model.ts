export type DayOfWeek =
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';

export interface BusinessHour {
    id: number;
    dayOfWeek: DayOfWeek;
    openTime: string | null;
    closeTime: string | null;
    active: boolean;
}

export interface BusinessHourRequest {
    dayOfWeek: DayOfWeek;
    openTime: string | null;
    closeTime: string | null;
    active: boolean;
}