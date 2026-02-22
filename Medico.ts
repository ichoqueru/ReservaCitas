import { Especialidad } from "./Especialidad";
import { AgendaMedica } from "./AgendaMedica";

export class Medico {
    public agenda: AgendaMedica;

    constructor(
        public id: number,
        public nombre: string,
        public especialidad: Especialidad
    ) {
        this.agenda = new AgendaMedica(this);
    }
}
