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

  static reprogramarCita(dni: string, nuevaFecha: string, nuevaHora: string): boolean {
    this.inicializar();
    const archivos = fs.readdirSync(CARPETA);

    for (const archivo of archivos) {
      const ruta = path.join(CARPETA, archivo);
      const lineas = fs.readFileSync(ruta, "utf-8").split("\n").filter(l => l.trim() !== "");
      const index = lineas.findIndex(l => l.includes(`DNI: ${dni}`));

      if (index !== -1) {
        lineas[index] = lineas[index]!
          .replace(/Fecha: \S+/, `Fecha: ${nuevaFecha}`)
          .replace(/Hora: \S+/, `Hora: ${nuevaHora}`)
          .replace(/Estado: \S+/, `Estado: REPROGRAMADA`);

        fs.writeFileSync(ruta, lineas.join("\n") + "\n", "utf-8");
        return true;
      }
    }
    return false;
  }

  static reiniciar(): void {
    if (!fs.existsSync(CARPETA)) return;
    const archivos = fs.readdirSync(CARPETA);
    archivos.forEach((archivo) => {
      fs.writeFileSync(path.join(CARPETA, archivo), "", "utf-8");
    });
    console.log("\n Citas reiniciadas correctamente.");
  }
}