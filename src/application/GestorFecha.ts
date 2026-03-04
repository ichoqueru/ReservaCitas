import * as fs from "fs";
import { JsonFileDb } from "../infrastructure/storage/JsonFileDb";

const DATA_PATH = process.env.DATA_PATH || "./data";
const db = new JsonFileDb<{ fechaReserva: string }>(`${DATA_PATH}/fecha.json`);

export class GestorFecha {

  static async guardarConfiguracion(fechaReserva: string): Promise<void> {
    await db.guardarTodo([{ fechaReserva }]);
  }

  static async obtenerFechaReserva(): Promise<string | null> {
    const datos = await db.leerTodo();
    if (datos.length === 0) return null;
    const fecha = datos[0]!.fechaReserva;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null;
    return fecha;
  }

  static async esDiaDeReserva(): Promise<boolean> {
    const fechaReserva = await this.obtenerFechaReserva();
    if (!fechaReserva) return false;
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    const hoyLocal = `${año}-${mes}-${dia}`;
    return hoyLocal === fechaReserva;
  }

  static async obtenerDiasDisponibles(): Promise<string[]> {
    const inicio = await this.obtenerFechaReserva();
    if (!inicio) return [];
    const dias: string[] = [];
    const fecha = new Date(inicio + "T00:00:00");
    for (let i = 0; i < 6; i++) {
      const d = new Date(fecha);
      d.setDate(fecha.getDate() + i);
      const año = d.getFullYear();
      const mes = String(d.getMonth() + 1).padStart(2, "0");
      const dia = String(d.getDate()).padStart(2, "0");
      dias.push(`${año}-${mes}-${dia}`);
    }
    return dias;
  }

  static nombreDia(fecha: string): string {
    const nombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const d = new Date(fecha + "T00:00:00");
    return nombres[d.getDay()]!;
  }
}