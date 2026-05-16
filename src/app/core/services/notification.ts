import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
    ManualNotificationRequest,
    NotificationHistory,
    NotificationSettings,
    NotificationSettingsRequest
} from '../../shared/models/notification.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private readonly apiUrl = `${environment.apiUrl}/admin/notifications`;

    constructor(private readonly http: HttpClient) { }

    getSettings(): Observable<NotificationSettings> {
        return this.http.get<NotificationSettings>(`${this.apiUrl}/settings`);
    }

    updateSettings(request: NotificationSettingsRequest): Observable<NotificationSettings> {
        return this.http.put<NotificationSettings>(`${this.apiUrl}/settings`, request);
    }

    getHistory(): Observable<NotificationHistory[]> {
        return this.http.get<NotificationHistory[]>(`${this.apiUrl}/history`);
    }

    sendManual(request: ManualNotificationRequest): Observable<NotificationHistory[]> {
        return this.http.post<NotificationHistory[]>(`${this.apiUrl}/manual`, request);
    }
}
