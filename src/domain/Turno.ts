export class Turno {
    static readonly MAÑANA = new Turno("Mañana", 7, 12);
    static readonly TARDE = new Turno("Tarde", 12, 19);

    constructor(
        public nombre: string,
        public horaInicio: number,
        public horaFin: number
    ) {}

    contiene(hora: string): boolean {
        const hh = parseInt(hora.split(":")[0]!);
        return hh >= this.horaInicio && hh <= this.horaFin;
    }
    generarHorarios(): string[] {
        const horarios: string[] = [];
        let horas = this.horaInicio;
        let minutos = 0;

        while (horas < this.horaFin) {
            const h = String(horas).padStart(2, "0");
            const m = String(minutos).padStart(2, "0");
            horarios.push(`${h}:${m}`);

            minutos += 20;
            if (minutos >= 60) {
                minutos -= 60;
                horas++;
            }
        }

        return horarios;
    }
}