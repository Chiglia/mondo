import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Continent } from '../../models/continent.model';
import { AvariaService } from '../../services/avaria.service';
import { TranslocoDirective } from '@jsverse/transloco';
import { WORLD_MAP_REGIONS } from '../../data/world-map-regions.data';

@Component({
    selector: 'app-world-map',
    imports: [CommonModule, TranslocoDirective],
    templateUrl: './world-map.html',
    styles: `
        :host {
            display: block;
            height: 100%;
            min-height: 0;
        }

        .continent {
            cursor: pointer;
            outline: none;
        }

        .continent path {
            fill: #1b465d;
            stroke: #426174;
            stroke-width: 0.65;
            stroke-linejoin: round;
            fill-rule: evenodd;
            transition: fill 160ms ease, stroke 160ms ease, filter 160ms ease;
        }

        .continent.active path,
        .continent:focus-visible path {
            fill: #38bdf8;
            stroke: #bae6fd;
            filter: drop-shadow(0 0 3px #38bdf8);
        }

        @media (prefers-reduced-motion: reduce) {
            .continent path {
                transition: none;
            }
        }
    `,
})
export class WorldMapComponent {
    private router = inject(Router);
    private avariaService = inject(AvariaService);

    @Output() continentSelected = new EventEmitter<string>();

    hoveredContinent: Continent | null = null;

    readonly regions = WORLD_MAP_REGIONS;
    readonly continentStatistics = this.avariaService.continentStatistics;
    readonly statisticsErrors = this.avariaService.continentStatisticsErrors;

    retryStatisticsLoad(): void {
        void this.avariaService.loadContinentStatistics();
    }

    onContinentHover(id: string | null): void {
        if (!id) {
            this.hoveredContinent = null;
            return;
        }
        this.hoveredContinent = this.avariaService.getContinentById(id) || null;
    }

    selectContinent(id: string): void {
        this.continentSelected.emit(id);
        this.router.navigate(['/continent', id]);
    }

}
