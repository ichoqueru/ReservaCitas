"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Medico = void 0;
const AgendaMedica_1 = require("./AgendaMedica");
class Medico {
    id;
    nombre;
    especialidad;
    agenda;
    constructor(id, nombre, especialidad) {
        this.id = id;
        this.nombre = nombre;
        this.especialidad = especialidad;
        this.agenda = new AgendaMedica_1.AgendaMedica(this);
    }
}
exports.Medico = Medico;
//# sourceMappingURL=Medico.js.map