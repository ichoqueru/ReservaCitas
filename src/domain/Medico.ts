import { Especialidad } from "./Especialidad";
import { Turno } from "./Turno";

export class Medico {
    constructor(
        public id: number,
        public nombre: string,
        public especialidad: Especialidad
    ) {}

    horariosPorTurno(turno: Turno): string[] {
        return turno.generarHorarios();
    }
}