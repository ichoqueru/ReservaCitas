import { CitaMedica } from "../domain/CitaMedica";
import { GestorCitas } from "./GestorCitas";

export class Notificacion {
  static async enviar(cita: CitaMedica): Promise<void> {
    console.log("\n NOTIFICACIÓN DE CITA MÉDICA");
    console.log("Paciente:", cita.paciente.nombre);
    console.log("Doctor:", cita.medico.nombre);
    console.log("Especialidad:", cita.medico.especialidad.nombre);
    console.log("Fecha:", cita.fecha);
    console.log("Hora:", cita.hora);
    console.log("Estado:", cita.estado);

    await GestorCitas.guardarCita(cita.medico.especialidad.nombre, {
      dni: cita.paciente.dni,
      paciente: cita.paciente.nombre,
      doctor: cita.medico.nombre,
      especialidad: cita.medico.especialidad.nombre,
      turno: cita.turno,
      fecha: cita.fecha,
      hora: cita.hora,
      estado: cita.estado
    });

    console.log("\n Cita programada");
  }
}