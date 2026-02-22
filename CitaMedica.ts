import { Paciente } from "./Paciente";
import { Medico } from "./Medico";
import { Especialidad } from "./Especialidad";
import { EstadoCita } from "./EstadoCita";

export class CitaMedica {
    constructor(
        public paciente: Paciente,
        public medico: Medico,
        public especialidad: Especialidad,
        public fecha: string,
        public hora: string,
        public estado: EstadoCita
    ) {}
}