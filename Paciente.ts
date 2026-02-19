export class Paciente {
    constructor(
        public id: number,
        public nombre: string,
        public edad: number
    ) {}

    mostrarInformacion(): string {
        return `Paciente: ${this.nombre} | Edad: ${this.edad}`;
    }
}
