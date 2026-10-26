import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    readonly isDark = signal(false);
    private readonly systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

    constructor() {
        const savedTheme = localStorage.getItem('user-theme');
        this.isDark.set(savedTheme === 'dark' || (savedTheme !== 'light' && this.systemTheme.matches));
        this.applyTheme();

        this.systemTheme.addEventListener('change', event => {
            const savedTheme = localStorage.getItem('user-theme');
            if (savedTheme === 'dark' || savedTheme === 'light') return;

            this.isDark.set(event.matches);
            this.applyTheme();
        });
    }

    toggle(): void {
        const isDark = !this.isDark();
        this.isDark.set(isDark);
        localStorage.setItem('user-theme', isDark ? 'dark' : 'light');
        this.applyTheme();
    }

    private applyTheme(): void {
        const root = document.documentElement;
        root.classList.toggle('dark', this.isDark());
        root.classList.toggle('my-app-dark', this.isDark());
        root.style.colorScheme = this.isDark() ? 'dark' : 'light';
    }
}