import { Paciente } from "./Paciente";
import { Medico } from "./Medico";
import { EstadoCita } from "./EstadoCita";
export declare class CitaMedica {
    paciente: Paciente;
    medico: Medico;
    fecha: string;
    hora: string;
    estado: EstadoCita;
    turno: string;
    constructor(paciente: Paciente, medico: Medico, fecha: string, hora: string, estado: EstadoCita, turno: string);
}
//# sourceMappingURL=CitaMedica.d.ts.map