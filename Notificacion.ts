import { CitaMedica } from "./CitaMedica";

export class Notificacion {
    static enviar(cita: CitaMedica) {
        console.log("\n NOTIFICACION");
        console.log("Paciente:", cita.paciente.nombre);
        console.log("Médico:", cita.medico.nombre);
        console.log("Especialidad:", cita.especialidad.nombre);
        console.log("Fecha:", cita.fecha);
        console.log("Hora:", cita.hora);
        console.log("Estado:", cita.estado);
    }
}