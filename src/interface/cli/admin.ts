import * as readline from "readline";
import { GestorFecha } from "../../application/GestorFecha";
import { GestorCitas } from "../../application/GestorCitas";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.clear();
console.log("=== PANEL DE ADMINISTRACIÓN ===\n");
console.log("1. Configurar nueva semana (reiniciar citas + nueva fecha)");
console.log("2. Solo cambiar fecha de inicio");
console.log("3. Solo reiniciar citas");
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
        console.log("\n Fecha inválida, use el formato YYYY-MM-DD");
        rl.close();
        return;
      }

      await GestorFecha.guardarConfiguracion(fecha);
      console.log(`\n Fecha de reserva configurada: ${GestorFecha.nombreDia(fecha)} ${fecha}`);

      // ✅ Sincronizar fecha con Railway
      try {
        await fetch("https://reservacitas-production.up.railway.app/api/admin/configurar-fecha", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fecha })
        });
        console.log(` Fecha sincronizada en Railway: ${fecha}`);
      } catch {
        console.log(" ⚠️ No se pudo sincronizar la fecha con el servidor.");
      }

      // ✅ Sincronizar configuración de reservas con Railway
      try {
        await fetch("https://reservacitas-production.up.railway.app/api/admin/configurar-reservas", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habilitado: true, fechaPermitida: fecha })
        });
        console.log(` Reservas habilitadas para: ${GestorFecha.nombreDia(fecha)}`);
      } catch {
        console.log(" ⚠️ No se pudo sincronizar con el servidor.");
      }

      if (opcion === "1") {
        // ✅ Reiniciar citas en Railway
        try {
          await fetch("https://reservacitas-production.up.railway.app/api/admin/reiniciar-citas", {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
          });
          console.log(" Citas reiniciadas en Railway");
        } catch {
          console.log(" ⚠️ No se pudo reiniciar las citas en el servidor.");
        }
        await GestorCitas.reiniciar();
      }

      rl.close();
    });

  } else if (opcion === "3") {
    rl.question("¿Está seguro que desea reiniciar todas las citas? (si/no): ", async (respuesta) => {
      if (respuesta.trim().toLowerCase() === "si") {
        // ✅ Reiniciar citas en Railway
        try {
          await fetch("https://reservacitas-production.up.railway.app/api/admin/reiniciar-citas", {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
          });
          console.log(" Citas reiniciadas en Railway");
        } catch {
          console.log(" ⚠️ No se pudo reiniciar las citas en el servidor.");
        }
        await GestorCitas.reiniciar();
      } else {
        console.log("\n Operación cancelada.");
      }
      rl.close();
    });

  } else if (opcion === "4") {
    rl.question("Ingrese fecha a consultar (YYYY-MM-DD): ", async (fecha) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        console.log("\n Fecha inválida, use el formato YYYY-MM-DD");
        rl.close();
        return;
      }
      console.log(`\n=== CITAS DEL DÍA: ${GestorFecha.nombreDia(fecha)} ${fecha} ===`);

      // ✅ Consultar Railway en vez de local
      try {
        const res = await fetch(`https://reservacitas-production.up.railway.app/api/citas?fecha=${fecha}`);
        const citas = await res.json();
        if (!Array.isArray(citas) || citas.length === 0) {
          console.log(" No hay citas para ese día.");
        } else {
          citas.forEach((c: any) => {
            console.log(`\n  Paciente: ${c.paciente} | DNI: ${c.dni}`);
            console.log(`  Doctor: ${c.doctor} | Especialidad: ${c.especialidad}`);
            console.log(`  Turno: ${c.turno} | Hora: ${c.hora} | Estado: ${c.estado}`);
          });
        }
      } catch {
        console.log(" ⚠️ No se pudo conectar con el servidor.");
      }

      rl.close();
    });

  } else {
    console.log("\n Opción inválida");
    rl.close();
  }
});