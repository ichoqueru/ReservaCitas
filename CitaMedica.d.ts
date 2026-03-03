import { Paciente } from "./src/domain/Paciente";
import { Medico } from "./Medico";
import { EstadoCita } from "./src/domain/EstadoCita";
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