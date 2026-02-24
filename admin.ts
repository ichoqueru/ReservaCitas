import * as readline from "readline";
import { GestorFecha } from "./GestorFecha";
import { GestorCitas } from "./GestorCitas";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.clear();
console.log("=== PANEL DE ADMINISTRACIÓN ===\n");
console.log("1. Configurar nueva semana (reiniciar citas + nueva fecha)");
console.log("2. Solo cambiar fecha de inicio");
console.log("3. Solo reiniciar citas\n");

rl.question("Seleccione opción: ", (opcion) => {

  if (opcion === "1" || opcion === "2") {
    rl.question("Ingrese fecha del lunes (YYYY-MM-DD): ", (fecha) => {

      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        console.log("\n Fecha inválida, use el formato YYYY-MM-DD (ej: 2026-02-23)");
        rl.close();
        return;
      }

      const dia = new Date(fecha + "T00:00:00").getDay();
      if (dia !== 1) {
        console.log("\n La fecha debe ser un lunes");
        rl.close();
        return;
      }

      GestorFecha.guardarFechaInicio(fecha);
      console.log(`\n Fecha de inicio configurada: ${fecha}`);

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

  } else {
    console.log("\n Opción inválida");
    rl.close();
  }
});