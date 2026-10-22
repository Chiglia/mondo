import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { WorldMapComponent } from '../../components/world-map/world-map';
import { QuickSearchComponent } from '../../components/quick-search/quick-search';
import { FooterComponent } from '../../components/footer/footer';
import { AvariaService } from '../../services/avaria.service';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    HeaderComponent,
    WorldMapComponent,
    QuickSearchComponent,
    FooterComponent,
  ],
  templateUrl: './home.html',
  styles: ``,
})
export class Home {
  private router = inject(Router);
  private avariaService = inject(AvariaService);

  readonly totalSurveyors = this.avariaService.getTotalSurveyors();

  onContinentSelected(continentId: string): void {
    this.router.navigate(['/continent', continentId]);
  }
}
