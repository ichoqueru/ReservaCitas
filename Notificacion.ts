import { CitaMedica } from "./CitaMedica";

export class Notificacion {
  static enviar(cita: CitaMedica): void {
    console.log("\n NOTIFICACIÓN DE CITA MÉDICA");
    console.log("Paciente:", cita.paciente.nombre);
    console.log("Doctor:", cita.medico.nombre);
    console.log("Especialidad:", cita.medico.especialidad.nombre);
    console.log("Fecha:", cita.fecha);
    console.log("Hora:", cita.hora);
    console.log("Estado:", cita.estado);
  }
}