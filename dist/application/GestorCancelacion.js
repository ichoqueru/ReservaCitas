"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GestorCancelacion = void 0;
class GestorCancelacion {
    static cancelar() {
        console.log("\n Proceso cancelado por el usuario");
    }
    static esCancelacion(input) {
        return input.trim().toLowerCase() === "cancelar";
    }
}
exports.GestorCancelacion = GestorCancelacion;
//# sourceMappingURL=GestorCancelacion.js.map