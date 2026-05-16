import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'themeMode';
  readonly mode = signal<ThemeMode>('light');

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    const savedMode = localStorage.getItem(this.storageKey) as ThemeMode | null;
    this.setTheme(savedMode === 'dark' ? 'dark' : 'light');
  }

  toggleTheme(): void {
    this.setTheme(this.mode() === 'light' ? 'dark' : 'light');
  }

  setTheme(mode: ThemeMode): void {
    this.mode.set(mode);
    this.document.documentElement.dataset['theme'] = mode;
    localStorage.setItem(this.storageKey, mode);
  }
}
