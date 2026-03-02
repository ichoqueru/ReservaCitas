import * as fs from "fs";

const ARCHIVO_FECHA = "./fecha.txt";

export class GestorFecha {

  static guardarConfiguracion(fechaReserva: string): void {
    fs.writeFileSync(ARCHIVO_FECHA, fechaReserva, "utf-8");
  }

  static obtenerFechaReserva(): string | null {
    if (!fs.existsSync(ARCHIVO_FECHA)) return null;
    const contenido = fs.readFileSync(ARCHIVO_FECHA, "utf-8").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(contenido)) return null;
      return contenido;
  }

  static esDiaDeReserva(): boolean {
    const fechaReserva = this.obtenerFechaReserva();
    if (!fechaReserva) return false;
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    const hoyLocal = `${año}-${mes}-${dia}`;
  
    return hoyLocal === fechaReserva;
  }

  static obtenerDiasDisponibles(): string[] {
    const inicio = this.obtenerFechaReserva();
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