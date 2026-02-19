"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paciente = void 0;
class Paciente {
    constructor(id, nombre, edad) {
        this.id = id;
        this.nombre = nombre;
        this.edad = edad;
    }
    mostrarInformacion() {
        return `Paciente: ${this.nombre} | Edad: ${this.edad}`;
    }
}
exports.Paciente = Paciente;
