export declare class Turno {
    nombre: string;
    horaInicio: number;
    horaFin: number;
    static readonly MAÑANA: Turno;
    static readonly TARDE: Turno;
    constructor(nombre: string, horaInicio: number, horaFin: number);
    contiene(hora: string): boolean;
    generarHorarios(): string[];
}
//# sourceMappingURL=Turno.d.ts.map