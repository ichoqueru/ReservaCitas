"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paciente = void 0;
const HistorialClinico_1 = require("./HistorialClinico");
class Paciente {
    id;
    nombre;
    historial;
    constructor(id, nombre, historial = new HistorialClinico_1.HistorialClinico()) {
        this.id = id;
        this.nombre = nombre;
        this.historial = historial;
    }
}
exports.Paciente = Paciente;
//# sourceMappingURL=Paciente.js.map