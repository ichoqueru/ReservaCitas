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

  static reiniciar(): void {
    if (!fs.existsSync(CARPETA)) return;
    const archivos = fs.readdirSync(CARPETA);
    archivos.forEach((archivo) => {
      fs.writeFileSync(path.join(CARPETA, archivo), "", "utf-8");
    });
    console.log("\n Citas reiniciadas correctamente.");
  }
}