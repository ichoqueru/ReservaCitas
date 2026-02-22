import { Paciente } from "./Paciente";
import { Medico } from "./Medico";
import { CitaMedica } from "./CitaMedica";
export declare class SistemaCitas {
    private citas;
    reservarCita(paciente: Paciente, medico: Medico, fecha: string, hora: string): CitaMedica;
    reprogramarCita(cita: CitaMedica, nuevaFecha: string, nuevaHora: string): void;
}
//# sourceMappingURL=SistemaCitas.d.ts.map