import { Especialidad } from "./Especialidad";
import { Turno } from "./Turno";
export declare class Medico {
    id: number;
    nombre: string;
    especialidad: Especialidad;
    turno: Turno;
    constructor(id: number, nombre: string, especialidad: Especialidad, turno: Turno);
    horariosPorTurno(turno: Turno): string[];
}
//# sourceMappingURL=Medico.d.ts.map