import { Injectable } from '@angular/core';
import { Continent, Nation } from '../models/continent.model';
import { CONTINENTS_META } from '../data/continents-meta.data';
import { NATIONS_EUROPE } from '../data/nations-europe.data';
import { NATIONS_ASIA } from '../data/nations-asia.data';
import { NATIONS_AMERICAS } from '../data/nations-americas.data';
import { NATIONS_AFRICA_OCEANIA } from '../data/nations-africa-oceania.data';

@Injectable({
    providedIn: 'root',
})
export class AvariaService {
    private readonly continents: Continent[] = CONTINENTS_META;
    private readonly nations: Nation[] = [
        ...NATIONS_EUROPE,
        ...NATIONS_ASIA,
        ...NATIONS_AMERICAS,
        ...NATIONS_AFRICA_OCEANIA,
    ];

    getContinents(): Continent[] {
        return this.continents;
    }

    getContinentById(id: string): Continent | undefined {
        return this.continents.find(c => c.id === id || c.slug === id);
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
