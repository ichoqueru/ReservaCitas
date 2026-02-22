import { HorarioDisponible } from "./HorarioDisponible";
import { Medico } from "./Medico";
export declare class AgendaMedica {
    medico: Medico;
    private horarios;
    constructor(medico: Medico);
    agregarHorario(horario: HorarioDisponible): void;
    obtenerHorarios(): HorarioDisponible[];
    estaDisponible(fecha: string, hora: string): boolean;
    removerHorario(fecha: string, hora: string): void;
}
//# sourceMappingURL=AgendaMedica.d.ts.map