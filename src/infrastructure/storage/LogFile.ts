import * as fs from "fs";

export class LogFile {
  constructor(private path: string) {}

  async append(linea: string): Promise<void> {
    const registro = `${new Date().toISOString()} | ${linea}\n`;
    await fs.promises.appendFile(this.path, registro, { encoding: "utf-8" });
  }
}