import { computed, inject, Injectable, Injector, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { CommissarioDto, ContinenteDto, NazioneDto } from '../api/models';
import { Continent, Nation } from '../models/continent.model';
import { CONTINENTS_META } from '../data/continents-meta.data';
import { NATIONS_EUROPE } from '../data/nations-europe.data';
import { NATIONS_ASIA } from '../data/nations-asia.data';
import { NATIONS_AMERICAS } from '../data/nations-americas.data';
import { NATIONS_AFRICA_OCEANIA } from '../data/nations-africa-oceania.data';

type AppLanguage = 'it' | 'en';

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

    readonly apiContinents = signal<ContinenteDto[]>([]);
    readonly apiNationsByContinent = signal<Record<string, NazioneDto[]>>({});
    readonly apiCommissionersByNation = signal<Record<string, CommissarioDto[]>>({});
    readonly isApiDirectoryLoading = signal(true);
    readonly apiDirectoryError = signal<string | null>(null);
    readonly apiNationCount = computed(() =>
        Object.values(this.apiNationsByContinent()).reduce((total, nations) => total + nations.length, 0),
    );
    readonly apiContinentCount = computed(() => this.apiContinents().length);
    readonly apiCommissionerCount = computed(() =>
        Object.values(this.apiCommissionersByNation()).reduce((total, commissioners) => total + commissioners.length, 0),
    );

    private apiDirectoryPromise: Promise<void> | null = null;
    private apiDirectoryPromiseLanguage: string | null = null;
    private apiDirectoryLanguage: string | null = null;
    private apiDirectoryRequestId = 0;

    loadApiDirectory(language: AppLanguage = 'it'): Promise<void> {
        if (this.apiDirectoryPromise && this.apiDirectoryPromiseLanguage === language) {
            return this.apiDirectoryPromise;
        }
        if (this.apiDirectoryLanguage === language && !this.apiDirectoryError()) {
            return Promise.resolve();
        }

        const requestId = ++this.apiDirectoryRequestId;
        this.isApiDirectoryLoading.set(true);
        this.apiDirectoryError.set(null);
        this.apiDirectoryPromiseLanguage = language;
        this.apiDirectoryPromise = this.fetchApiDirectory(language)
            .then(({ apiContinents, apiNationsByContinent, apiCommissionersByNation }) => {
                if (requestId !== this.apiDirectoryRequestId) {
                    return;
                }
                this.apiContinents.set(apiContinents);
                this.apiNationsByContinent.set(apiNationsByContinent);
                this.apiCommissionersByNation.set(apiCommissionersByNation);
                this.apiDirectoryLanguage = language;
            })
            .catch((error: unknown) => {
                if (requestId !== this.apiDirectoryRequestId) {
                    return;
                }
                const message = error instanceof Error ? error.message : 'Errore imprevisto durante il caricamento dei dati.';
                this.apiDirectoryError.set(message);
            })
            .finally(() => {
                if (requestId === this.apiDirectoryRequestId) {
                    this.isApiDirectoryLoading.set(false);
                    this.apiDirectoryPromise = null;
                    this.apiDirectoryPromiseLanguage = null;
                }
            });

        return this.apiDirectoryPromise;
    }

    private async fetchApiDirectory(language: AppLanguage): Promise<{
        apiContinents: ContinenteDto[];
        apiNationsByContinent: Record<string, NazioneDto[]>;
        apiCommissionersByNation: Record<string, CommissarioDto[]>;
    }> {
        const { ConsultazioneService } = await import('../api/services/consultazione.service');
        const consultazioneService = this.injector.get(ConsultazioneService);
        const apiContinents = await firstValueFrom(consultazioneService.getContinenti(language));
        if (apiContinents.length === 0) {
            throw new Error('L’API non ha restituito continenti.');
        }

        const continentIds: Record<NonNullable<ContinenteDto['codice']>, string> = {
            AF: 'africa',
            AM: 'america',
            AS: 'asia',
            EU: 'europa',
            OC: 'oceania',
        };

        const results = await Promise.all(
            apiContinents.map(async continent => {
                const code = continent.codice;
                if (!code || !continentIds[code]) {
                    throw new Error(`Codice continente non riconosciuto: ${code ?? 'mancante'}.`);
                }

                const nations = await firstValueFrom(consultazioneService.getNazioni(code, language));
                return [continentIds[code], nations] as const;
            }),
        );

        const nationEntries = results.flatMap(([continentId, nations]) =>
            nations.map(nation => {
                if (!nation.codice) {
                    throw new Error(`L’API ha restituito una nazione senza codice nel continente ${continentId}.`);
                }
                return [nation.codice, nation] as const;
            }),
        );

        const commissionerEntries = await Promise.all(
            nationEntries.map(async ([nationCode]) => {
                const commissioners = await firstValueFrom(consultazioneService.getCommissari(nationCode));
                return [nationCode, commissioners] as const;
            }),
        );

        return {
            apiContinents,
            apiNationsByContinent: Object.fromEntries(results),
            apiCommissionersByNation: Object.fromEntries(commissionerEntries),
        };
    }

    getApiNationsByContinent(continentId: string): NazioneDto[] {
        return this.apiNationsByContinent()[continentId] ?? [];
    }

    getApiNationCount(continentId: string): number {
        return this.getApiNationsByContinent(continentId).length;
    }

    getApiCommissionersByNation(nationCode: string): CommissarioDto[] {
        return this.apiCommissionersByNation()[nationCode] ?? [];
    }

    searchApiNations(term: string): { nation: NazioneDto; continent: Continent }[] {
        const query = term.trim().toLocaleLowerCase();
        if (!query) {
            return [];
        }

        return Object.entries(this.apiNationsByContinent()).flatMap(([continentId, nations]) => {
            const continent = this.getContinentById(continentId);
            if (!continent) {
                return [];
            }

            return nations
                .filter(nation =>
                    nation.descrizione?.toLocaleLowerCase().includes(query) ||
                    nation.codice?.toLocaleLowerCase().includes(query),
                )
                .map(nation => ({ nation, continent }));
        });
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
