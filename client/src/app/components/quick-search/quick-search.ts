import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AvariaService } from '../../services/avaria.service';
import { Continent, Nation } from '../../models/continent.model';

@Component({
    selector: 'app-quick-search',
    imports: [CommonModule, FormsModule],
    templateUrl: './quick-search.html',
    styles: ``,
})
export class QuickSearchComponent {
    private avariaService = inject(AvariaService);
    private router = inject(Router);

    searchTerm = '';
    searchResults: { nation: Nation; continent: Continent }[] = [];
    isFocused = false;

    onSearchChange(): void {
        if (this.searchTerm.trim().length >= 2) {
            this.searchResults = this.avariaService.search(this.searchTerm);
        } else {
            this.searchResults = [];
        }
    }

    selectResult(result: { nation: Nation; continent: Continent }): void {
        this.searchTerm = '';
        this.searchResults = [];
        this.router.navigate(['/continent', result.continent.id], {
            queryParams: { highlight: result.nation.id },
        });
    }

    clearSearch(): void {
        this.searchTerm = '';
        this.searchResults = [];
    }
}
