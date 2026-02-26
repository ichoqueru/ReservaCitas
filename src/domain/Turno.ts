export class Turno {
    static readonly MAÑANA = new Turno("Mañana", 0, 11);
    static readonly TARDE = new Turno("Tarde", 12, 23);

    constructor(
        public nombre: string,
        public horaInicio: number,
        public horaFin: number
    ) {}

    contiene(hora: string): boolean {
        const hh = parseInt(hora.split(":")[0]!);
        return hh >= this.horaInicio && hh <= this.horaFin;
    }
}