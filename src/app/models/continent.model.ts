export interface InspectionSpecialty {
    code: string;
    label: string;
    description: string;
}

export interface SurveyorDesk {
    contactName: string;
    role: string;
    phone: string;
    email: string;
    emergency24h: string;
    address: string;
    certifications: string[];
}

export interface Nation {
    id: string;
    code: string; // ISO 2-letter
    name: string;
    nameEn: string;
    continentId: string;
    flagEmoji: string;
    capital: string;
    mainPorts: string[];
    activeSurveyors: number;
    averageResponseHours: number;
    specialties: string[];
    coverageH24: boolean;
    desk: SurveyorDesk;
}

export interface Continent {
    id: string;
    slug: string;
    name: string;
    nameEn: string;
    totalSurveyors: number;
    totalPorts: number;
    nationsCount: number;
    svgColor: string;
}
