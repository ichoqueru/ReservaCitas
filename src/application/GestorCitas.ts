import { JsonFileDb } from "../infrastructure/storage/JsonFileDb";
import { LogFile } from "../infrastructure/storage/LogFile";

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

const DATA_PATH = process.env.DATA_PATH || "./data";
const db = new JsonFileDb<Cita>(`${DATA_PATH}/citas.json`);
const log = new LogFile(`${DATA_PATH}/auditoria.log`);

export class GestorCitas {

  static async guardarCita(especialidad: string, cita: Cita): Promise<void> {
    const lista = await db.leerTodo();
    lista.push(cita);
    await db.guardarTodo(lista);
    await log.append(`NUEVA CITA | DNI: ${cita.dni} | Doctor: ${cita.doctor} | Fecha: ${cita.fecha}`);
  }

  static async horariosOcupados(nombreDoctor: string, fecha: string): Promise<string[]> {
    const lista = await db.leerTodo();
    return lista
      .filter(c => c.doctor === nombreDoctor && c.fecha === fecha)
      .map(c => c.hora);
  }

  static async buscarCitaPorDNI(dni: string): Promise<Cita | null> {
    const lista = await db.leerTodo();
    return lista.find(c => c.dni === dni) || null;
  }

  static async obtenerDatosCita(dni: string): Promise<{ doctor: string, turno: string } | null> {
    const cita = await this.buscarCitaPorDNI(dni);
    if (!cita) return null;
    return { doctor: cita.doctor, turno: cita.turno };
  }

  static async reprogramarCita(dni: string, nuevaFecha: string, nuevaHora: string): Promise<boolean> {
    const lista = await db.leerTodo();
    const index = lista.findIndex(c => c.dni === dni);
    if (index === -1) return false;
    lista[index]!.fecha = nuevaFecha;
    lista[index]!.hora = nuevaHora;
    lista[index]!.estado = "REPROGRAMADA";
    await db.guardarTodo(lista);
    await log.append(`REPROGRAMADA | DNI: ${dni} | Nueva fecha: ${nuevaFecha} | Nueva hora: ${nuevaHora}`);
    return true;
  }

  static async cancelarCita(dni: string): Promise<boolean> {
    const lista = await db.leerTodo();
    const index = lista.findIndex(c => c.dni === dni);
    if (index === -1) return false;
    if (lista[index]!.estado === "CANCELADA") return false;
    lista[index]!.estado = "CANCELADA";
    await db.guardarTodo(lista);
    await log.append(`CANCELADA | DNI: ${dni}`);
    return true;
  }

  static async tieneCitaDuplicada(dni: string, nombreDoctor: string, fecha: string): Promise<boolean> {
    const lista = await db.leerTodo();
    return lista.some(c => c.dni === dni && c.doctor === nombreDoctor && c.fecha === fecha);
  }

  static async verCitasDelDia(fecha: string): Promise<void> {
    const lista = await db.leerTodo();
    const citasDelDia = lista.filter(c => c.fecha === fecha);
    if (citasDelDia.length === 0) {
      console.log("\n No hay citas para ese día.");
      return;
    }
    citasDelDia.forEach(c => {
      console.log(`  ${c.hora} | ${c.paciente} | ${c.doctor} | ${c.estado}`);
    });
  }

  static async reiniciar(): Promise<void> {
    await db.guardarTodo([]);
    await log.append("SISTEMA REINICIADO");
    console.log("\n Citas reiniciadas correctamente");
  }
}