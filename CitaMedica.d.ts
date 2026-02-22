import { Paciente } from "./Paciente";
import { Medico } from "./Medico";
import { EstadoCita } from "./EstadoCita";
export declare class CitaMedica {
    paciente: Paciente;
    medico: Medico;
    fecha: string;
    hora: string;
    estado: EstadoCita;
    constructor(paciente: Paciente, medico: Medico, fecha: string, hora: string);
    cancelar(): void;
    completar(): void;
}
//# sourceMappingURL=CitaMedica.d.ts.map