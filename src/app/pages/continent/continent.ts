import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, distinctUntilChanged, map, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { SurveyorModalComponent } from '../../components/surveyor-modal/surveyor-modal';
import { AvariaService } from '../../services/avaria.service';
import { Continent } from '../../models/continent.model';
import { CommissarioDto, NazioneDto } from '../../api/models';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
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
export class ContinentPage {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private avariaService = inject(AvariaService);
    private languageService = inject(LanguageService);
    private translocoService = inject(TranslocoService);
    private nationRequestId = 0;
    private commissionerRequestId = 0;

    continent: Continent | null = null;
    allNationsInContinent: NazioneDto[] = [];
    filteredNations: NazioneDto[] = [];
    selectedNation: NazioneDto | null = null;

    searchTerm = '';
    readonly isApiDirectoryLoading = signal(true);
    readonly apiDirectoryError = signal<string | null>(null);
    readonly isCommissionersLoading = signal(false);
    readonly commissionersError = signal<string | null>(null);
    commissioners: CommissarioDto[] = [];

    constructor() {
        combineLatest([
            this.route.paramMap,
            this.translocoService.langChanges$.pipe(
                startWith(this.languageService.currentLang),
                map(() => this.languageService.currentLang),
                distinctUntilChanged(),
            ),
        ]).pipe(takeUntilDestroyed()).subscribe(([params]) => {
            const id = params.get('id');
            if (id) {
                void this.loadContinent(id);
            }
        });
    }

    private async loadContinent(id: string): Promise<void> {
        const cont = this.avariaService.getContinentById(id);
        if (!cont) {
            this.router.navigate(['/page-not-found']);
            return;
        }
        const requestId = ++this.nationRequestId;
        this.continent = cont;
        this.closeNationDetails();
        this.searchTerm = '';
        this.allNationsInContinent = [];
        this.filteredNations = [];
        this.isApiDirectoryLoading.set(true);
        this.apiDirectoryError.set(null);
        try {
            const nations = await this.avariaService.loadNations(cont.id, this.languageService.currentLang);
            if (requestId !== this.nationRequestId) return;
            this.allNationsInContinent = nations;
            this.applyFilters();
        } catch (error: unknown) {
            if (requestId === this.nationRequestId) {
                this.apiDirectoryError.set(error instanceof Error ? error.message : 'Errore imprevisto durante il caricamento dei dati.');
            }
        } finally {
            if (requestId === this.nationRequestId) this.isApiDirectoryLoading.set(false);
        }
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
        if (this.continent) void this.loadContinent(this.continent.id);
    }

    getNationCount(): number | null {
        return this.apiDirectoryError() ? null : this.allNationsInContinent.length;
    }

    async selectNation(nation: NazioneDto): Promise<void> {
        const requestId = ++this.commissionerRequestId;
        this.selectedNation = nation;
        this.commissioners = [];
        this.isCommissionersLoading.set(true);
        this.commissionersError.set(null);
        try {
            if (!nation.codice) throw new Error('Codice nazione mancante.');
            const commissioners = await this.avariaService.loadCommissioners(nation.codice);
            if (requestId === this.commissionerRequestId) this.commissioners = commissioners;
        } catch (error: unknown) {
            if (requestId === this.commissionerRequestId) {
                this.commissionersError.set(error instanceof Error ? error.message : 'Errore imprevisto durante il caricamento dei dati.');
            }
        } finally {
            if (requestId === this.commissionerRequestId) this.isCommissionersLoading.set(false);
        }
    }

    closeNationDetails(): void {
        ++this.commissionerRequestId;
        this.selectedNation = null;
        this.commissioners = [];
        this.isCommissionersLoading.set(false);
        this.commissionersError.set(null);
    }

    retryCommissionersLoad(): void {
        if (this.selectedNation) void this.selectNation(this.selectedNation);
    }
}
