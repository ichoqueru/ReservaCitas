import { GestorCitas } from "./GestorCitas";

interface Cita {
  dni: string;
  paciente: string;
  doctor: string;
  especialidad: string;
  turno: string;
  fecha: string;
  hora: string;
  estado: string;
}

export class GestorReprogramacion {

  static async reprogramar(dni: string, nuevaFecha: string, nuevaHora: string): Promise<boolean> {
    return await GestorCitas.reprogramarCita(dni, nuevaFecha, nuevaHora);
  }

  static async buscarCita(dni: string): Promise<Cita | null> {
    return await GestorCitas.buscarCitaPorDNI(dni);
  }
}