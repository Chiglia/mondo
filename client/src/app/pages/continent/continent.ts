import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { SurveyorModalComponent } from '../../components/surveyor-modal/surveyor-modal';
import { AvariaService } from '../../services/avaria.service';
import { Continent, Nation } from '../../models/continent.model';

@Component({
    selector: 'app-continent',
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        HeaderComponent,
        FooterComponent,
        SurveyorModalComponent,
    ],
    templateUrl: './continent.html',
    styles: ``,
})
export class ContinentPage implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private avariaService = inject(AvariaService);

    continent: Continent | null = null;
    allNationsInContinent: Nation[] = [];
    filteredNations: Nation[] = [];

    searchTerm = '';
    selectedSpecialty = 'all';
    sortBy = 'name'; // 'name' | 'surveyors' | 'speed'

    selectedNationForModal: Nation | null = null;

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadContinent(id);
            }
        });

        this.route.queryParamMap.subscribe(queryParams => {
            const highlight = queryParams.get('highlight');
            if (highlight && this.allNationsInContinent.length > 0) {
                const found = this.allNationsInContinent.find(n => n.id === highlight);
                if (found) {
                    this.selectedNationForModal = found;
                }
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
        this.allNationsInContinent = this.avariaService.getNationsByContinent(cont.id);
        this.applyFilters();
    }

    applyFilters(): void {
        const q = this.searchTerm.trim().toLowerCase();
        let list = [...this.allNationsInContinent];

        if (q) {
            list = list.filter(n =>
                n.name.toLowerCase().includes(q) ||
                n.nameEn.toLowerCase().includes(q) ||
                n.mainPorts.some(p => p.toLowerCase().includes(q)) ||
                n.capital.toLowerCase().includes(q)
            );
        }

        if (this.selectedSpecialty !== 'all') {
            list = list.filter(n =>
                n.specialties.some(s => s.toLowerCase().includes(this.selectedSpecialty.toLowerCase()))
            );
        }

        if (this.sortBy === 'surveyors') {
            list.sort((a, b) => b.activeSurveyors - a.activeSurveyors);
        } else if (this.sortBy === 'speed') {
            list.sort((a, b) => a.averageResponseHours - b.averageResponseHours);
        } else {
            list.sort((a, b) => a.name.localeCompare(b.name));
        }

        this.filteredNations = list;
    }

    openSurveyorDesk(nation: Nation): void {
        this.selectedNationForModal = nation;
    }

    closeModal(): void {
        this.selectedNationForModal = null;
    }
}
