import { Especialidad } from "./Especialidad";
import { Turno } from "./Turno";

export class Medico {
    constructor(
        public id: number,
        public nombre: string,
        public especialidad: Especialidad,
        public horarios: string[]
    ) {}

    horariosPorTurno(turno: Turno): string[] {
        return this.horarios.filter((hora) => turno.contiene(hora));
    }
}