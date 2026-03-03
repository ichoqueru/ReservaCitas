import * as fs from "fs";
import * as path from "path";

const CARPETA = "./citas";

export class GestorCitas {

  static inicializar(): void {
    if (!fs.existsSync(CARPETA)) {
      fs.mkdirSync(CARPETA);
    }
  }

  static guardarCita(especialidad: string, contenido: string): void {
    this.inicializar();
    const nombreArchivo = especialidad.normalize("NFD").replace(/[\u0300-\u036f]/g, "") + ".txt";
    const rutaArchivo = path.join(CARPETA, nombreArchivo);
    fs.appendFileSync(rutaArchivo, contenido + "\n", "utf-8");
  }

  static horariosOcupados(nombreDoctor: string, fecha: string): string[] {
    this.inicializar();
    const archivos = fs.readdirSync(CARPETA);
    const ocupados: string[] = [];

    for (const archivo of archivos) {
      const ruta = path.join(CARPETA, archivo);
      const lineas = fs.readFileSync(ruta, "utf-8").split("\n").filter(l => l.trim() !== "");

      for (const linea of lineas) {
        if (linea.includes(`Doctor: ${nombreDoctor}`) && linea.includes(`Fecha: ${fecha}`)) {
          const match = linea.match(/Hora: (\d{2}:\d{2})/);
          if (match) ocupados.push(match[1]!);
        }
      }
    }

    return ocupados;
  }


  static buscarCitaPorDNI(dni: string): { linea: string, archivo: string } | null {
    this.inicializar();
    const archivos = fs.readdirSync(CARPETA);

    for (const archivo of archivos) {
      const ruta = path.join(CARPETA, archivo);
      const lineas = fs.readFileSync(ruta, "utf-8").split("\n").filter(l => l.trim() !== "");
    
      for (const linea of lineas) {
        if (linea.includes(`DNI: ${dni}`)) {
          return { linea, archivo: ruta };
        }
      }
    }
    return null;
  }

  static obtenerDatosCita(dni: string): { doctor: string, turno: string } | null {
  this.inicializar();
  const archivos = fs.readdirSync(CARPETA);

  for (const archivo of archivos) {
    const ruta = path.join(CARPETA, archivo);
    const lineas = fs.readFileSync(ruta, "utf-8").split("\n").filter(l => l.trim() !== "");

    for (const linea of lineas) {
      if (linea.includes(`DNI: ${dni}`)) {
        const doctorMatch = linea.match(/Doctor: ([^|]+)\|/);
        const turnoMatch = linea.match(/Turno: ([^|]+)\|/);
        if (doctorMatch && turnoMatch) {
          return {
            doctor: doctorMatch[1]!.trim(),
            turno: turnoMatch[1]!.trim()
          };
        }
      }
    }
  }
  return null;
}

  static reprogramarCita(dni: string, nuevaFecha: string, nuevaHora: string): boolean {
    this.inicializar();
    const archivos = fs.readdirSync(CARPETA);

    for (const archivo of archivos) {
      const ruta = path.join(CARPETA, archivo);
      const lineas = fs.readFileSync(ruta, "utf-8").split("\n").filter(l => l.trim() !== "");
      const index = lineas.findIndex(l => l.includes(`DNI: ${dni}`));

      if (index !== -1) {
      const lineaAnterior = lineas[index]!;

      // Extraer turno y especialidad de la cita anterior
      const especialidadMatch = lineaAnterior.match(/Especialidad: ([^|]+)\|/);
      const especialidad = especialidadMatch ? especialidadMatch[1]!.trim() : null;

      // Actualizar la línea con nueva fecha, hora y estado
      lineas[index] = lineaAnterior
        .replace(/Fecha: \S+/, `Fecha: ${nuevaFecha}`)
        .replace(/Hora: \S+/, `Hora: ${nuevaHora}`)
        .replace(/Estado: \S+/, `Estado: REPROGRAMADA`);

      fs.writeFileSync(ruta, lineas.join("\n") + "\n", "utf-8");

      // Si cambió de especialidad guardar en archivo correcto
      if (especialidad) {
        const nuevoArchivo = especialidad.normalize("NFD").replace(/[\u0300-\u036f]/g, "") + ".txt";
        const rutaNueva = path.join(CARPETA, nuevoArchivo);
        if (rutaNueva !== ruta) {
          fs.appendFileSync(rutaNueva, lineas[index] + "\n", "utf-8");
          lineas.splice(index, 1);
          fs.writeFileSync(ruta, lineas.join("\n") + "\n", "utf-8");
        }
      }

      return true;
    }
  }
    return false;
  }

  static cancelarCita(dni: string): boolean {
  this.inicializar();
  const archivos = fs.readdirSync(CARPETA);

  for (const archivo of archivos) {
    const ruta = path.join(CARPETA, archivo);
    const lineas = fs.readFileSync(ruta, "utf-8")
      .split("\n")
      .filter(l => l.trim() !== "");

    const index = lineas.findIndex(l => l.includes(`DNI: ${dni}`));

    if (index !== -1) {
      const lineaAnterior = lineas[index]!;

      if (lineaAnterior.includes("Estado: CANCELADA")) {
        return false;
      }
      // Cambiar estado a CANCELADA
      lineas[index] = lineaAnterior.replace(/Estado: \S+/, "Estado: CANCELADA");

      fs.writeFileSync(ruta, lineas.join("\n") + "\n", "utf-8");

      return true;
    }
  }

  return false;
}

  static tieneCitaDuplicada(dni: string, nombreDoctor: string, fecha: string): boolean {
  this.inicializar();
  const archivos = fs.readdirSync(CARPETA);

  for (const archivo of archivos) {
    const ruta = path.join(CARPETA, archivo);
    const lineas = fs.readFileSync(ruta, "utf-8").split("\n").filter(l => l.trim() !== "");

    for (const linea of lineas) {
      if (
        linea.includes(`DNI: ${dni}`) &&
        linea.includes(`Doctor: ${nombreDoctor}`) &&
        linea.includes(`Fecha: ${fecha}`)
      ) {
        return true;
      }
    }
  }
  return false;
}

static verCitasDelDia(fecha: string): void {
  this.inicializar();
  const archivos = fs.readdirSync(CARPETA).filter(a => a.endsWith(".txt"));

  let hayCitas = false;

  for (const archivo of archivos) {
    const especialidad = archivo.replace(".txt", "");
    const ruta = path.join(CARPETA, archivo);
    const lineas = fs.readFileSync(ruta, "utf-8").split("\n").filter(l => l.trim() !== "");
    const citasDelDia = lineas.filter(l => l.includes(`Fecha: ${fecha}`));

    if (citasDelDia.length > 0) {
      hayCitas = true;
      console.log(`\n${especialidad.toUpperCase()}:`);
      citasDelDia.forEach((linea) => {
        const pacienteMatch = linea.match(/Paciente: ([^|]+)\|/);
        const doctorMatch = linea.match(/Doctor: ([^|]+)\|/);
        const horaMatch = linea.match(/Hora: (\d{2}:\d{2})/);
        const estadoMatch = linea.match(/Estado: (\S+)/);

        const paciente = pacienteMatch ? pacienteMatch[1]!.trim() : "?";
        const doctor = doctorMatch ? doctorMatch[1]!.trim() : "?";
        const hora = horaMatch ? horaMatch[1] : "?";
        const estado = estadoMatch ? estadoMatch[1] : "?";

        console.log(`  ${hora} | ${paciente} | ${doctor} | ${estado}`);
      });
    }
  }

  if (!hayCitas) {
    console.log("\n No hay citas para ese día.");
  }
}

  static reiniciar(): void {
    if (!fs.existsSync(CARPETA)) return;
    const archivos = fs.readdirSync(CARPETA);
    archivos.forEach((archivo) => {
      fs.writeFileSync(path.join(CARPETA, archivo), "", "utf-8");
    });
    console.log("\n Citas reiniciadas correctamente");
  }
}