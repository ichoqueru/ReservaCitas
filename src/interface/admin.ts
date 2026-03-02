import * as readline from "readline";
import { GestorFecha } from "../application/GestorFecha";
import { GestorCitas } from "../application/GestorCitas";

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
    rl.question("Ingrese fecha del dia de reserva (YYYY-MM-DD): ", (fecha) => {

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


      GestorFecha.guardarConfiguracion(fecha);
      console.log(`\n Fecha de reserva configurado: ${GestorFecha.nombreDia(fecha)} ${fecha}`);

      if (opcion === "1") {
        GestorCitas.reiniciar();
      }

      rl.close();
    });

  } else if (opcion === "3") {
    rl.question("¿Está seguro que desea reiniciar todas las citas? (si/no): ", (respuesta) => {
      if (respuesta.trim().toLowerCase() === "si") {
        GestorCitas.reiniciar();
      } else {
        console.log("\n Operación cancelada.");
      }
      rl.close();
    });

    } else if (opcion === "4") {
      rl.question("Ingrese fecha a consultar (YYYY-MM-DD): ", (fecha) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        console.log("\n Fecha inválida, use el formato YYYY-MM-DD");
        rl.close();
        return;
        }

        const { GestorFecha } = require("../application/GestorFecha");
        console.log(`\n=== CITAS DEL DÍA: ${GestorFecha.nombreDia(fecha)} ${fecha} ===`);
        GestorCitas.verCitasDelDia(fecha);
        rl.close();
      });
    }
    else {
    console.log("\n Opción inválida");
    rl.close();
  }
});