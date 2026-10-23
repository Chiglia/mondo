import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { WorldMapComponent } from '../../components/world-map/world-map';
import { QuickSearchComponent } from '../../components/quick-search/quick-search';
import { FooterComponent } from '../../components/footer/footer';
import { AvariaService } from '../../services/avaria.service';
import { TranslocoDirective } from '@jsverse/transloco';

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

  readonly totalCommissioners = this.avariaService.apiCommissionerCount;
  readonly totalNations = this.avariaService.apiNationCount;
  readonly totalContinents = this.avariaService.getContinents().length;
  readonly isStatisticsLoading = this.avariaService.isStatisticsLoading;
  readonly statisticsError = this.avariaService.statisticsError;

  constructor() {
    void this.avariaService.loadStatistics();
  }

  retryStatisticsLoad(): void {
    void this.avariaService.loadStatistics();
  }

  onContinentSelected(continentId: string): void {
    this.router.navigate(['/continent', continentId]);
  }
}
