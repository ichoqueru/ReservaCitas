import * as fs from "fs";

const ARCHIVO_FECHA = "./fecha.txt";

export class GestorFecha {

  static guardarFechaInicio(fecha: string): void {
    fs.writeFileSync(ARCHIVO_FECHA, fecha, "utf-8");
  }

  static obtenerFechaInicio(): string | null {
    if (!fs.existsSync(ARCHIVO_FECHA)) return null;
    return fs.readFileSync(ARCHIVO_FECHA, "utf-8").trim();
  }

  static obtenerDiasDisponibles(): string[] {
    const inicio = this.obtenerFechaInicio();
    if (!inicio) return [];

    const dias: string[] = [];
    const fecha = new Date(inicio + "T00:00:00");

    for (let i = 0; i < 6; i++) {
      const d = new Date(fecha);
      d.setDate(fecha.getDate() + i);
      const dia = d.toISOString().split("T")[0]!;
      dias.push(dia);
    }

    return dias;
  }

  static nombreDia(fecha: string): string {
    const nombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const d = new Date(fecha + "T00:00:00");
    return nombres[d.getDay()]!;
  }
}