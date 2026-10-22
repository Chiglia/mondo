import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language-service';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
    selector: 'app-header',
    imports: [CommonModule, RouterLink, TranslocoDirective],
    templateUrl: './header.html',
    styles: ``,
})
export class HeaderComponent {
    private langService = inject(LanguageService);
    private router = inject(Router);

    get currentLang(): string {
        return this.langService.currentLang || 'it';
    }

    toggleLanguage(): void {
        const nextLang = this.currentLang === 'it' ? 'en' : 'it';
        this.langService.setLanguage(nextLang);
    }

    scrollToMap(): void {
        if (this.router.url !== '/') {
            this.router.navigate(['/']).then(() => {
                setTimeout(() => this.executeScroll('mappa-mondo'), 100);
            });
        } else {
            this.executeScroll('mappa-mondo');
        }
    }

    private executeScroll(id: string): void {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}
