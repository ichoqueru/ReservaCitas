import { GestorCitas } from "./GestorCitas";

export class GestorReprogramacion {

  static reprogramar(dni: string, nuevaFecha: string, nuevaHora: string): boolean {
    return GestorCitas.reprogramarCita(dni, nuevaFecha, nuevaHora);
  }

  static buscarCita(dni: string): { linea: string, archivo: string } | null {
    return GestorCitas.buscarCitaPorDNI(dni);
  }
}