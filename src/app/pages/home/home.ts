import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { WorldMapComponent } from '../../components/world-map/world-map';
import { QuickSearchComponent } from '../../components/quick-search/quick-search';
import { FooterComponent } from '../../components/footer/footer';
import { AvariaService } from '../../services/avaria.service';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageService } from '../../services/language-service';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    HeaderComponent,
    WorldMapComponent,
    QuickSearchComponent,
    FooterComponent,
    TranslocoDirective,
  ],
  templateUrl: './home.html',
  styles: ``,
})
export class Home {
  private router = inject(Router);
  private avariaService = inject(AvariaService);
  private languageService = inject(LanguageService);

  readonly totalCommissioners = this.avariaService.apiCommissionerCount;
  readonly totalNations = this.avariaService.apiNationCount;
  readonly totalContinents = this.avariaService.apiContinentCount;
  readonly isApiDirectoryLoading = this.avariaService.isApiDirectoryLoading;
  readonly apiDirectoryError = this.avariaService.apiDirectoryError;

  retryApiDirectoryLoad(): void {
    void this.avariaService.loadApiDirectory(this.languageService.currentLang);
  }

  onContinentSelected(continentId: string): void {
    this.router.navigate(['/continent', continentId]);
  }
}
