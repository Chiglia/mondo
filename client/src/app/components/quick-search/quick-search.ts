import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AvariaService } from '../../services/avaria.service';
import { Continent } from '../../models/continent.model';
import { NazioneDto } from '../../api/models';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
    selector: 'app-quick-search',
    imports: [CommonModule, FormsModule, TranslocoDirective],
    templateUrl: './quick-search.html',
    styles: ``,
})
export class QuickSearchComponent {
    private avariaService = inject(AvariaService);
    private router = inject(Router);

    searchTerm = '';
    searchResults: { nation: NazioneDto; continent: Continent }[] = [];
    isFocused = false;

    constructor() {
        effect(() => {
            this.avariaService.apiNationsByContinent();
            if (this.searchTerm.trim().length >= 2) {
                this.searchResults = this.avariaService.searchApiNations(this.searchTerm);
            }
        });
    }

    onSearchChange(): void {
        if (this.searchTerm.trim().length >= 2) {
            this.searchResults = this.avariaService.searchApiNations(this.searchTerm);
        } else {
            this.searchResults = [];
        }
    }

    selectResult(result: { nation: NazioneDto; continent: Continent }): void {
        this.searchTerm = '';
        this.searchResults = [];
        this.router.navigate(['/continent', result.continent.id]);
    }

    clearSearch(): void {
        this.searchTerm = '';
        this.searchResults = [];
    }
}
