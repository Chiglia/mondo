import { computed, inject, Injectable, Injector, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { CommissarioDto, NazioneDto, StatisticheDto } from '../api/models';
import { Continent, Nation } from '../models/continent.model';
import { CONTINENTS_META } from '../data/continents-meta.data';
import { NATIONS_EUROPE } from '../data/nations-europe.data';
import { NATIONS_ASIA } from '../data/nations-asia.data';
import { NATIONS_AMERICAS } from '../data/nations-americas.data';
import { NATIONS_AFRICA_OCEANIA } from '../data/nations-africa-oceania.data';

type AppLanguage = 'it' | 'en';

interface ContinentStatisticsState {
    statistics: StatisticheDto | null;
    loading: boolean;
    error: string | null;
}

@Injectable({
    providedIn: 'root',
})
export class AvariaService {
    private readonly injector = inject(Injector);
    private readonly continents: Continent[] = CONTINENTS_META;
    private readonly nations: Nation[] = [
        ...NATIONS_EUROPE,
        ...NATIONS_ASIA,
        ...NATIONS_AMERICAS,
        ...NATIONS_AFRICA_OCEANIA,
    ];

    readonly isStatisticsLoading = signal(true);
    readonly statisticsError = signal<string | null>(null);
    readonly apiStatistics = signal<StatisticheDto | null>(null);
    readonly apiNationCount = computed(() => this.apiStatistics()?.numeroNazioni ?? null);
    readonly apiCommissionerCount = computed(() => this.apiStatistics()?.numeroCommissari ?? null);
    readonly continentStatistics = signal<Partial<Record<string, ContinentStatisticsState>>>({});
    readonly continentStatisticsErrors = computed(() =>
        Object.entries(this.continentStatistics())
            .filter((entry): entry is [string, ContinentStatisticsState] => !!entry[1]?.error)
            .map(([id, state]) => ({ id, message: state.error })),
    );

    private statisticsPromise: Promise<void> | null = null;
    private readonly continentStatisticsRequests = new Map<string, Promise<void>>();
    private readonly nationRequests = new Map<string, Promise<NazioneDto[]>>();
    private readonly commissionerRequests = new Map<string, Promise<CommissarioDto[]>>();
    private readonly continentCodes = {
        africa: 'AF',
        america: 'AM',
        asia: 'AS',
        europa: 'EU',
        oceania: 'OC',
    } as const;

    loadStatistics(): Promise<void> {
        if (this.statisticsPromise) {
            return this.statisticsPromise;
        }
        if (this.apiStatistics() && !this.statisticsError()) {
            return Promise.resolve();
        }

        this.isStatisticsLoading.set(true);
        this.statisticsError.set(null);
        this.statisticsPromise = this.getApiClient()
            .then(client => firstValueFrom(client.getStatistiche()))
            .then(statistics => this.apiStatistics.set(this.validateStatistics(statistics)))
            .catch((error: unknown) => {
                const message = error instanceof Error ? error.message : 'Errore imprevisto durante il caricamento dei dati.';
                this.statisticsError.set(message);
            })
            .finally(() => {
                this.isStatisticsLoading.set(false);
                this.statisticsPromise = null;
            });

        return this.statisticsPromise;
    }

    async loadContinentStatistics(): Promise<void> {
        await Promise.all(Object.entries(this.continentCodes).map(([id, code]) => {
            const pending = this.continentStatisticsRequests.get(id);
            if (pending) return pending;
            if (this.continentStatistics()[id]?.statistics) return Promise.resolve();

            this.continentStatistics.update(states => ({
                ...states,
                [id]: { statistics: null, loading: true, error: null },
            }));
            const request = this.getApiClient()
                .then(client => firstValueFrom(client.getStatistiche(code)))
                .then(statistics => {
                    const validated = this.validateStatistics(statistics);
                    this.continentStatistics.update(states => ({
                        ...states,
                        [id]: { statistics: validated, loading: false, error: null },
                    }));
                })
                .catch((error: unknown) => {
                    const message = error instanceof Error ? error.message : 'Errore imprevisto durante il caricamento dei dati.';
                    this.continentStatistics.update(states => ({
                        ...states,
                        [id]: { statistics: null, loading: false, error: message },
                    }));
                })
                .finally(() => this.continentStatisticsRequests.delete(id));
            this.continentStatisticsRequests.set(id, request);
            return request;
        }));
    }

    private async getApiClient() {
        const { ConsultazioneService } = await import('../api/services/consultazione.service');
        return this.injector.get(ConsultazioneService);
    }

    private validateStatistics(statistics: StatisticheDto): StatisticheDto {
        if (!statistics ||
            typeof statistics.numeroNazioni !== 'number' ||
            typeof statistics.numeroCommissari !== 'number' ||
            !Number.isSafeInteger(statistics.numeroNazioni) ||
            !Number.isSafeInteger(statistics.numeroCommissari) ||
            statistics.numeroNazioni < 0 || statistics.numeroCommissari < 0) {
            throw new Error('L’API ha restituito statistiche non valide.');
        }
        return statistics;
    }

    loadNations(continentId: string, language: AppLanguage): Promise<NazioneDto[]> {
        const key = `${continentId}:${language}`;
        const cached = this.nationRequests.get(key);
        if (cached) {
            return cached;
        }
        const request = this.getApiClient().then(client => {
            const code = Object.entries(this.continentCodes).find(([id]) => id === continentId)?.[1];
            if (!code) {
                throw new Error(`Continente non riconosciuto: ${continentId}.`);
            }
            return firstValueFrom(client.getNazioni(code, language));
        }).then(nations => {
            if (nations.some(nation => !nation.codice)) {
                throw new Error(`L’API ha restituito una nazione senza codice nel continente ${continentId}.`);
            }
            return nations;
        }).catch((error: unknown) => {
            this.nationRequests.delete(key);
            throw error;
        });
        this.nationRequests.set(key, request);
        return request;
    }

    loadCommissioners(nationCode: string): Promise<CommissarioDto[]> {
        const cached = this.commissionerRequests.get(nationCode);
        if (cached) {
            return cached;
        }
        const request = this.getApiClient()
            .then(client => firstValueFrom(client.getCommissari(nationCode)))
            .catch((error: unknown) => {
                this.commissionerRequests.delete(nationCode);
                throw error;
            });
        this.commissionerRequests.set(nationCode, request);
        return request;
    }

    async searchApiNations(term: string, language: AppLanguage): Promise<NazioneDto> {
        const client = await this.getApiClient();
        const nation = await firstValueFrom(client.getNazioneByDescrizione(term.trim(), language));
        if (!nation?.codice) {
            throw new Error('L’API ha restituito una nazione senza codice.');
        }
        return nation;
    }

    getContinents(): Continent[] {
        return this.continents;
    }

    getContinentById(id: string): Continent | undefined {
        const normalizedId = id === 'america-nord' || id === 'america-sud' ? 'america' : id;
        return this.continents.find(c => c.id === normalizedId || c.slug === normalizedId);
    }

    getNationsByContinent(continentId: string): Nation[] {
        return this.nations.filter(n => n.continentId === continentId);
    }

    getNationById(id: string): Nation | undefined {
        return this.nations.find(n => n.id === id || n.code.toLowerCase() === id.toLowerCase());
    }

    getAllNations(): Nation[] {
        return this.nations;
    }

    search(term: string): { nation: Nation; continent: Continent }[] {
        const q = term.trim().toLowerCase();
        if (!q) return [];

        const results: { nation: Nation; continent: Continent }[] = [];
        for (const nation of this.nations) {
            const matchName = nation.name.toLowerCase().includes(q) || nation.nameEn.toLowerCase().includes(q);
            const matchCode = nation.code.toLowerCase() === q;
            const matchPort = nation.mainPorts.some(p => p.toLowerCase().includes(q));
            const matchSpecialty = nation.specialties.some(s => s.toLowerCase().includes(q));

            if (matchName || matchCode || matchPort || matchSpecialty) {
                const continent = this.getContinentById(nation.continentId);
                if (continent) {
                    results.push({ nation, continent });
                }
            }
        }
        return results;
    }

    getTotalSurveyors(): number {
        return this.nations.reduce((acc, curr) => acc + curr.activeSurveyors, 0);
    }

    getTotalPorts(): number {
        const uniquePorts = new Set<string>();
        this.nations.forEach(n => n.mainPorts.forEach(p => uniquePorts.add(p)));
        return uniquePorts.size;
    }
}
