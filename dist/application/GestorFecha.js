"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GestorFecha = void 0;
const fs = __importStar(require("fs"));
const ARCHIVO_FECHA = "./fecha.txt";
class GestorFecha {
    static guardarConfiguracion(fechaReserva) {
        fs.writeFileSync(ARCHIVO_FECHA, fechaReserva, "utf-8");
    }
    static obtenerFechaReserva() {
        if (!fs.existsSync(ARCHIVO_FECHA))
            return null;
        const contenido = fs.readFileSync(ARCHIVO_FECHA, "utf-8").trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(contenido))
            return null;
        return contenido;
    }
    static esDiaDeReserva() {
        const fechaReserva = this.obtenerFechaReserva();
        if (!fechaReserva)
            return false;
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");
        const hoyLocal = `${año}-${mes}-${dia}`;
        return hoyLocal === fechaReserva;
    }
    static obtenerDiasDisponibles() {
        const inicio = this.obtenerFechaReserva();
        if (!inicio)
            return [];
        const dias = [];
        const fecha = new Date(inicio + "T00:00:00");
        for (let i = 0; i < 6; i++) {
            const d = new Date(fecha);
            d.setDate(fecha.getDate() + i);
            const dia = d.toISOString().split("T")[0];
            dias.push(dia);
        }
        return dias;
    }
    static nombreDia(fecha) {
        const nombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const d = new Date(fecha + "T00:00:00");
        return nombres[d.getDay()];
    }
}
exports.GestorFecha = GestorFecha;
//# sourceMappingURL=GestorFecha.js.map