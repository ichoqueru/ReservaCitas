import * as fs from "fs";

export class FileIO {
  static async escribirTexto(path: string, contenido: string): Promise<void> {
    await fs.promises.writeFile(path, contenido, { encoding: "utf-8" });
  }

  static async leerTexto(path: string): Promise<string> {
    return await fs.promises.readFile(path, { encoding: "utf-8" });
  }
}