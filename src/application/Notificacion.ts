import { CitaMedica } from "../domain/CitaMedica";
import { GestorCitas } from "./GestorCitas";

export class Notificacion {
  static enviar(cita: CitaMedica): void {
    console.log("\n NOTIFICACIÓN DE CITA MÉDICA");
    console.log("Paciente:", cita.paciente.nombre);
    console.log("Doctor:", cita.medico.nombre);
    console.log("Especialidad:", cita.medico.especialidad.nombre);
    console.log("Fecha:", cita.fecha);
    console.log("Hora:", cita.hora);
    console.log("Estado:", cita.estado);

    const contenido =
      `Paciente: ${cita.paciente.nombre} | ` +
      `Doctor: ${cita.medico.nombre} | ` +
      `Fecha: ${cita.fecha} | ` +
      `Hora: ${cita.hora} | ` +
      `Estado: ${cita.estado}`;

    GestorCitas.guardarCita(cita.medico.especialidad.nombre, contenido);
    console.log("\n Cita guardada correctamente.");
  }
}