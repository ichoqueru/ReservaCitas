import { Especialidad } from "./Especialidad";

export class Medico {
    constructor(
        public id: number,
        public nombre: string,
        public especialidad: Especialidad,
        public horarios: string[]
    ) {}
}