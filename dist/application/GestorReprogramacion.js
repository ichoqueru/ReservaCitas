"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GestorReprogramacion = void 0;
const GestorCitas_1 = require("./GestorCitas");
class GestorReprogramacion {
    static reprogramar(dni, nuevaFecha, nuevaHora) {
        return GestorCitas_1.GestorCitas.reprogramarCita(dni, nuevaFecha, nuevaHora);
    }
    static buscarCita(dni) {
        return GestorCitas_1.GestorCitas.buscarCitaPorDNI(dni);
    }
}
exports.GestorReprogramacion = GestorReprogramacion;
//# sourceMappingURL=GestorReprogramacion.js.map