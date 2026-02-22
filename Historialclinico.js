"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistorialClinico = void 0;
class HistorialClinico {
    citas = [];
    agregarCita(cita) {
        this.citas.push(cita);
    }
    obtenerCitas() {
        return this.citas;
    }
}
exports.HistorialClinico = HistorialClinico;
//# sourceMappingURL=HistorialClinico.js.map