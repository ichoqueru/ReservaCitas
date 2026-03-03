import * as fs from "fs";

export class JsonFileDb<T> {
  constructor(private path: string) {}

  private async asegurarArchivo(): Promise<void> {
  // Crear carpeta si no existe
  const carpeta = this.path.substring(0, this.path.lastIndexOf("/"));
  if (carpeta) {
    await fs.promises.mkdir(carpeta, { recursive: true });
  }
  try {
    await fs.promises.access(this.path);
  } catch {
    await fs.promises.writeFile(this.path, JSON.stringify([]), { encoding: "utf-8" });
  }
}

  async leerTodo(): Promise<T[]> {
    await this.asegurarArchivo();
    const contenido = await fs.promises.readFile(this.path, { encoding: "utf-8" });
    try {
      return JSON.parse(contenido) as T[];
    } catch {
      await fs.promises.writeFile(this.path, JSON.stringify([]), { encoding: "utf-8" });
      return [];
    }
  }

  async guardarTodo(data: T[]): Promise<void> {
    await this.asegurarArchivo();
    await fs.promises.writeFile(this.path, JSON.stringify(data, null, 2), { encoding: "utf-8" });
  }
}