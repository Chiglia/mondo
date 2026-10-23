import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AvariaService } from '../../services/avaria.service';
import { CommissarioDto, NazioneDto } from '../../api/models';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LanguageService } from '../../services/language-service';
import { SurveyorModalComponent } from '../surveyor-modal/surveyor-modal';

@Component({
    selector: 'app-quick-search',
    imports: [CommonModule, FormsModule, TranslocoDirective, SurveyorModalComponent],
    templateUrl: './quick-search.html',
    styles: ``,
})
export class QuickSearchComponent {
    private avariaService = inject(AvariaService);
    private languageService = inject(LanguageService);
    private translocoService = inject(TranslocoService);
    private requestId = 0;
    private commissionerRequestId = 0;

    searchTerm = '';
    searchResults: NazioneDto[] = [];
    selectedNation: NazioneDto | null = null;
    commissioners: CommissarioDto[] = [];
    isFocused = false;
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);
    readonly searchMessage = signal<'quickSearch.notFound' | 'quickSearch.ambiguous' | null>(null);
    readonly commissionersLoading = signal(false);
    readonly commissionersError = signal<string | null>(null);

    constructor() {
        this.translocoService.langChanges$.pipe(takeUntilDestroyed()).subscribe(() => {
            void this.onSearchChange();
        });
    }

    async onSearchChange(): Promise<void> {
        const requestId = ++this.requestId;
        this.searchResults = [];
        this.error.set(null);
        this.searchMessage.set(null);
        this.loading.set(false);
        if (this.searchTerm.trim().length < 2) return;
        this.loading.set(true);
        try {
            const nation = await this.avariaService.searchApiNations(this.searchTerm, this.languageService.currentLang);
            if (requestId === this.requestId) this.searchResults = [nation];
        } catch (error: unknown) {
            if (requestId === this.requestId) {
                if (error instanceof HttpErrorResponse && error.status === 404) {
                    this.searchMessage.set('quickSearch.notFound');
                } else if (error instanceof HttpErrorResponse && error.status === 409) {
                    this.searchMessage.set('quickSearch.ambiguous');
                } else {
                    this.error.set(error instanceof Error ? error.message : 'Errore imprevisto durante il caricamento dei dati.');
                }
            }
        } finally {
            if (requestId === this.requestId) this.loading.set(false);
        }
    }

    async selectResult(nation: NazioneDto): Promise<void> {
        this.clearSearch();
        const requestId = ++this.commissionerRequestId;
        this.selectedNation = nation;
        this.commissioners = [];
        this.commissionersError.set(null);
        this.commissionersLoading.set(true);
        try {
            if (!nation.codice) throw new Error('Codice nazione mancante.');
            const commissioners = await this.avariaService.loadCommissioners(nation.codice);
            if (requestId === this.commissionerRequestId) this.commissioners = commissioners;
        } catch (error: unknown) {
            if (requestId === this.commissionerRequestId) {
                this.commissionersError.set(error instanceof Error ? error.message : 'Errore imprevisto durante il caricamento dei dati.');
            }
        } finally {
            if (requestId === this.commissionerRequestId) this.commissionersLoading.set(false);
        }
    }

    closeNationDetails(): void {
        ++this.commissionerRequestId;
        this.selectedNation = null;
        this.commissioners = [];
        this.commissionersLoading.set(false);
        this.commissionersError.set(null);
    }

    retryCommissionersLoad(): void {
        if (this.selectedNation) void this.selectResult(this.selectedNation);
    }

    clearSearch(): void {
        this.searchTerm = '';
        this.searchResults = [];
        ++this.requestId;
        this.loading.set(false);
        this.error.set(null);
        this.searchMessage.set(null);
    }
}
