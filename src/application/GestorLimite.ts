import * as fs from "fs";

const ARCHIVO_LIMITE = "./limite.txt";

export class GestorLimite {

  static guardarLimite(limite: number): void {
    fs.writeFileSync(ARCHIVO_LIMITE, limite.toString(), "utf-8");
  }

  static obtenerLimite(): number | null {
    if (!fs.existsSync(ARCHIVO_LIMITE)) return null;
    const contenido = fs.readFileSync(ARCHIVO_LIMITE, "utf-8").trim();
    const numero = parseInt(contenido);
    return isNaN(numero) ? null : numero;
  }
}