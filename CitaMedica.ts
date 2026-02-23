import { Paciente } from "./Paciente";
import { Medico } from "./Medico";
import { EstadoCita } from "./EstadoCita";

export class CitaMedica {
    constructor(
        public paciente: Paciente,
        public medico: Medico,
        public fecha: string,
        public hora: string,
        public estado: EstadoCita
    ) {}
}