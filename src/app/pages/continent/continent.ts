import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { SurveyorModalComponent } from '../../components/surveyor-modal/surveyor-modal';
import { AvariaService } from '../../services/avaria.service';
import { Continent } from '../../models/continent.model';
import { CommissarioDto, NazioneDto } from '../../api/models';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageService } from '../../services/language-service';

@Component({
    selector: 'app-continent',
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        HeaderComponent,
        FooterComponent,
        SurveyorModalComponent,
        TranslocoDirective,
    ],
    templateUrl: './continent.html',
    styles: ``,
})
export class ContinentPage implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private avariaService = inject(AvariaService);
    private languageService = inject(LanguageService);

    continent: Continent | null = null;
    allNationsInContinent: NazioneDto[] = [];
    filteredNations: NazioneDto[] = [];
    selectedNation: NazioneDto | null = null;

    searchTerm = '';
    readonly isApiDirectoryLoading = this.avariaService.isApiDirectoryLoading;
    readonly apiDirectoryError = this.avariaService.apiDirectoryError;

    constructor() {
        effect(() => {
            this.avariaService.apiNationsByContinent();
            if (this.continent) {
                this.allNationsInContinent = this.avariaService.getApiNationsByContinent(this.continent.id);
                this.applyFilters();
            }
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadContinent(id);
            }
        });

    }

    private loadContinent(id: string): void {
        const cont = this.avariaService.getContinentById(id);
        if (!cont) {
            this.router.navigate(['/page-not-found']);
            return;
        }
        this.continent = cont;
        this.allNationsInContinent = [];
        this.filteredNations = [];
        void this.avariaService.loadApiDirectory(this.languageService.currentLang).then(() => {
            this.allNationsInContinent = this.avariaService.getApiNationsByContinent(cont.id);
            this.applyFilters();
        });
    }

    applyFilters(): void {
        const q = this.searchTerm.trim().toLowerCase();
        let list = [...this.allNationsInContinent];

        if (q) {
            list = list.filter(nation =>
                nation.descrizione?.toLowerCase().includes(q) ||
                nation.codice?.toLowerCase().includes(q)
            );
        }

        list.sort((a, b) => (a.descrizione ?? '').localeCompare(b.descrizione ?? ''));

        this.filteredNations = list;
    }

    retryApiDirectoryLoad(): void {
        void this.avariaService.loadApiDirectory(this.languageService.currentLang).then(() => {
            if (this.continent) {
                this.allNationsInContinent = this.avariaService.getApiNationsByContinent(this.continent.id);
                this.applyFilters();
            }
        });
    }

    selectNation(nation: NazioneDto): void {
        this.selectedNation = nation;
    }

    closeNationDetails(): void {
        this.selectedNation = null;
    }

    getSelectedNationCommissioners(): CommissarioDto[] {
        const nationCode = this.selectedNation?.codice;
        return nationCode ? this.avariaService.getApiCommissionersByNation(nationCode) : [];
    }
}
