import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageService } from './services/language-service';
import { ThemeService } from './services/theme-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslocoDirective],
  template: `
    <header
      class="h-10 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-end gap-2"
      *transloco="let t"
    >
      <button
        type="button"
        (click)="toggleLanguage()"
        [attr.aria-label]="
          currentLang === 'it' ? t('language.switchToEnglish') : t('language.switchToItalian')
        "
        [attr.title]="
          currentLang === 'it' ? t('language.switchToEnglish') : t('language.switchToItalian')
        "
        class="w-8 h-7 inline-flex items-center justify-center text-xs font-mono font-semibold rounded border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors uppercase"
      >
        {{ currentLang === 'it' ? 'EN' : 'IT' }}
      </button>
      <button
        type="button"
        (click)="toggleTheme()"
        [attr.aria-label]="isDark() ? t('theme.switchToLight') : t('theme.switchToDark')"
        [attr.title]="isDark() ? t('theme.switchToLight') : t('theme.switchToDark')"
        class="w-8 h-7 inline-flex items-center justify-center text-sm rounded border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 transition-colors"
      >
        <i class="pi" [class.pi-sun]="isDark()" [class.pi-moon]="!isDark()" aria-hidden="true"></i>
      </button>
    </header>
    <router-outlet />
  `,
  styles: [],
})
export class App {
  private langService = inject(LanguageService);
  private themeService = inject(ThemeService);

  isDark = this.themeService.isDark;

  get currentLang(): string {
    return this.langService.currentLang;
  }

  toggleLanguage(): void {
    const nextLang = this.currentLang === 'it' ? 'en' : 'it';
    this.langService.setLanguage(nextLang);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
