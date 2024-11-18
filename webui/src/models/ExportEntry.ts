//participant + group info

export interface ExportEntry {
    Gr: number;
    Nr: number;
    Vorname: string;
    Nachname: string;
    Geburtsdatum: string;
    Kategorie: string;
    KategorieNr: string;
    VIP: 0 | 1 | 'True' | 'False';
    Gruppe: string;
}