import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { getBrowserLang, TranslocoService } from '@jsverse/transloco';
import { PrimeNG } from 'primeng/config';
import { filter, take } from 'rxjs';
import { AvariaService } from './avaria.service';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private translocoService = inject(TranslocoService);
  private primeng = inject(PrimeNG);
  private avariaService = inject(AvariaService);
  private router = inject(Router);
  private title = inject(Title);

  private readonly availableLangs = ['it', 'en'];
  private readonly fallbackLang = 'it';

  constructor() {
    this.init();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.updateDocumentTitle(event.urlAfterRedirects));
  }

  private init() {
    const lang = this.determineLanguage();
    this.setLanguage(lang);
  }

  private determineLanguage(): string {
    // 1. Priorità al localStorage
    const savedLang = localStorage.getItem('user-lang');
    if (savedLang && this.availableLangs.includes(savedLang)) {
      return savedLang;
    }

    // 2. Browser Lang
    const browserLang = getBrowserLang() || '';
    if (this.availableLangs.includes(browserLang)) {
      return browserLang;
    }

    // 3. Fallback
    return this.fallbackLang;
  }

  setLanguage(lang: string) {
    if (!this.availableLangs.includes(lang)) return;

    // Persistenza e stato Transloco
    localStorage.setItem('user-lang', lang);
    this.translocoService.setActiveLang(lang);

    // Aggiornamento DOM e PrimeNG
    document.documentElement.lang = lang;
    this.syncPrimeNG(lang);
    void this.avariaService.loadApiDirectory(lang as 'it' | 'en');
  }

  private syncPrimeNG(lang: string) {
    this.translocoService.selectTranslation(lang).pipe(take(1)).subscribe(labels => {
      const primeNgLabels = labels['primeng'];
      if (primeNgLabels && typeof primeNgLabels === 'object') {
        this.primeng.setTranslation(primeNgLabels);
      }
      this.updateDocumentTitle();
    });
  }

  private updateDocumentTitle(url = this.router.url): void {
    const route = url.split('?')[0].split('/').filter(Boolean);
    if (route[0] === 'continent' && route[1]) {
      const continentName = this.translocoService.translate(`continents.${route[1]}`);
      this.title.setTitle(`${continentName} | ${this.translocoService.translate('app.title')}`);
      return;
    }

    const titleKey = route[0] === 'page-not-found' ? 'pageTitle.notFound' : 'pageTitle.home';
    this.title.setTitle(this.translocoService.translate(titleKey));
  }

  get currentLang() {
    return this.translocoService.getActiveLang() === 'en' ? 'en' : 'it';
  }
}