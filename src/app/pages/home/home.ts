import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorldMapComponent } from '../../components/world-map/world-map';
import { QuickSearchComponent } from '../../components/quick-search/quick-search';
import { AvariaService } from '../../services/avaria.service';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    WorldMapComponent,
    QuickSearchComponent,
    TranslocoDirective,
  ],
  templateUrl: './home.html',
  styles: `
    :host {
      display: block;
    }

    .home-layout {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      height: calc(100dvh - 2.5rem);
      min-height: max(580px, calc(100dvh - 2.5rem));
    }
  `,
})
export class Home {
  private router = inject(Router);
  private avariaService = inject(AvariaService);

  constructor() {
    void this.avariaService.loadContinentStatistics();
  }

  onContinentSelected(continentId: string): void {
    this.router.navigate(['/continent', continentId]);
  }
}
