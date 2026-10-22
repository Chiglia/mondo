import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Continent } from '../../models/continent.model';
import { AvariaService } from '../../services/avaria.service';

@Component({
    selector: 'app-world-map',
    imports: [CommonModule],
    templateUrl: './world-map.html',
    styles: ``,
})
export class WorldMapComponent {
    private router = inject(Router);
    private avariaService = inject(AvariaService);

    @Output() continentSelected = new EventEmitter<string>();

    hoveredContinent: Continent | null = null;

    readonly continents = this.avariaService.getContinents();

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
