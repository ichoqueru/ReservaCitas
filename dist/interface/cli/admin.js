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
const readline = __importStar(require("readline"));
const GestorFecha_1 = require("../../application/GestorFecha");
const GestorCitas_1 = require("../../application/GestorCitas");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
console.clear();
console.log("=== PANEL DE ADMINISTRACIÓN ===\n");
console.log("1. Configurar nueva semana (reiniciar citas + nueva fecha)");
console.log("2. Solo cambiar fecha de inicio");
console.log("3. Solo reiniciar citas\n");
console.log("4. Ver citas del día\n");
rl.question("Seleccione opción: ", (opcion) => {
    if (opcion === "1" || opcion === "2") {
        rl.question("Ingrese fecha del dia de reserva (YYYY-MM-DD): ", async (fecha) => {
            const hoy = new Date();
            const año = hoy.getFullYear();
            const mes = String(hoy.getMonth() + 1).padStart(2, "0");
            const dia = String(hoy.getDate()).padStart(2, "0");
            const hoyLocal = `${año}-${mes}-${dia}`;
            if (fecha < hoyLocal) {
                console.log("\n La fecha no puede ser una fecha pasada");
                rl.close();
                return;
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
                console.log("\n Fecha inválida, use el formato YYYY-MM-DD (ej: 2026-02-23)");
                rl.close();
                return;
            }
            GestorFecha_1.GestorFecha.guardarConfiguracion(fecha);
            console.log(`\n Fecha de reserva configurado: ${GestorFecha_1.GestorFecha.nombreDia(fecha)} ${fecha}`);
            // Sincronizar día permitido con el servidor
            const diaSemana = new Date(fecha + "T12:00:00").getDay();
            try {
                await fetch("http://localhost:3000/api/admin/configurar-reservas", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ habilitado: true, dia: diaSemana })
                });
                console.log(` Reservas habilitadas para: ${GestorFecha_1.GestorFecha.nombreDia(fecha)}`);
            }
            catch {
                console.log(" ⚠️ No se pudo sincronizar con el servidor.");
            }
            if (opcion === "1") {
                GestorCitas_1.GestorCitas.reiniciar();
            }
            rl.close();
        });
    }
    else if (opcion === "3") {
        rl.question("¿Está seguro que desea reiniciar todas las citas? (si/no): ", (respuesta) => {
            if (respuesta.trim().toLowerCase() === "si") {
                GestorCitas_1.GestorCitas.reiniciar();
            }
            else {
                console.log("\n Operación cancelada.");
            }
            rl.close();
        });
    }
    else if (opcion === "4") {
        rl.question("Ingrese fecha a consultar (YYYY-MM-DD): ", (fecha) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
                console.log("\n Fecha inválida, use el formato YYYY-MM-DD");
                rl.close();
                return;
            }
            console.log(`\n=== CITAS DEL DÍA: ${GestorFecha_1.GestorFecha.nombreDia(fecha)} ${fecha} ===`);
            GestorCitas_1.GestorCitas.verCitasDelDia(fecha);
            rl.close();
        });
    }
    else {
        console.log("\n Opción inválida");
        rl.close();
    }
});
//# sourceMappingURL=admin.js.map