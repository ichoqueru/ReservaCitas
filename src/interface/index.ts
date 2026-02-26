import * as readline from "readline";
import { Paciente } from "../domain/Paciente";
import { Especialidad } from "../domain/Especialidad";
import { CitaMedica } from "../domain/CitaMedica";
import { EstadoCita } from "../domain/EstadoCita";
import { Notificacion } from "../application/Notificacion";
import { Turno } from "../domain/Turno";
import { GestorFecha } from "../application/GestorFecha";
import { ListaMedicos } from "../data/ListaMedicos";
import { GestorCancelacion } from "../application/GestorCancelacion";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//CANCELAR
const cancelar = (input: string): boolean => {
  if (GestorCancelacion.esCancelacion(input)) {
    GestorCancelacion.cancelar();
    rl.close();
    return true;
  }
  return false;
}

const normalizar = (texto: string) =>
  texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// ===== Especialidades disponibles =====
const especialidades = [
  new Especialidad("Cardiología"),
  new Especialidad("Dermatología"),
  new Especialidad("Pediatría"),
  new Especialidad("Neurología"),
  new Especialidad("Traumatología")
];

//MEDICOS
const medicos = ListaMedicos.obtener(especialidades);

//VERIFICAR FECHA CONFIGURADA
const diasDisponibles = GestorFecha.obtenerDiasDisponibles();
if (diasDisponibles.length === 0) {
  console.log("\n No hay semana configurada. Pida al administrador que ejecute: npx ts-node admin.ts");
  process.exit(0);
}

//VERIFICAR DIA DE RESERVA
if (!GestorFecha.esDiaDeReserva()) {
  const fechaReserva = GestorFecha.obtenerFechaReserva()!;
  console.log(`\n Las reservas solo se pueden realizar el día ${GestorFecha.nombreDia(fechaReserva)} ${fechaReserva}.`);
  console.log(" Vuelva ese día para reservar su cita");
  process.exit(0);
}

console.clear();
console.log("=== SISTEMA DE CITAS MÉDICAS ===\n");

//  PRIMERO DNI
rl.question("Ingrese DNI del paciente: ", (dni) => {

  if (!/^\d{8}$/.test(dni)) {
    console.log("\n DNI inválido (debe tener 8 dígitos)");
    rl.close();
    return;
  }

  //  LUEGO NOMBRE
  rl.question("Ingrese nombre del paciente: ", (nombre) => {

    if (!nombre.trim()) {
      console.log("\n El nombre no puede estar vacío");
      rl.close();
      return;
    }

    const paciente = new Paciente(dni, nombre.trim());

    //ESPECIALIDAD
    console.log("\nEspecialidades disponibles:");
    especialidades.forEach((esp) => console.log(`- ${esp.nombre}`));

    rl.question("Ingrese la especialidad: ", (nombreEsp) => {
      const especialidad = especialidades.find(
        (esp) => normalizar(esp.nombre) === normalizar(nombreEsp.trim())
      );

    if (!especialidad) {
      console.log("\n Especialidad no encontrada");
      rl.close();
      return;
    }

    // TURNO
    console.log("\nTurnos disponibles:");
    console.log("1. Mañana");
    console.log("2. Tarde");
    console.log('(Escribe "cancelar" en cualquier momento para salir)\n');

    rl.question("Seleccione turno: ", (opcionTurno) => {
      if (cancelar(opcionTurno)) return;

      if (opcionTurno.trim() !== "1" && opcionTurno.trim() !== "2") {
        console.log("\n Turno inválido");
        rl.close();
        return;
      }

      const turnoSeleccionado = opcionTurno.trim() === "1" ? Turno.MAÑANA : Turno.TARDE;
      
      // MÉDICOS DISPONIBLES
      const medicosDisponibles = medicos.filter(
        (med) =>
          normalizar(med.especialidad.nombre) === normalizar(especialidad.nombre) &&
          med.horariosPorTurno(turnoSeleccionado).length > 0
      );

      if (medicosDisponibles.length === 0) {
        console.log(`\n No hay médicos disponibles para ${especialidad.nombre} en el turno ${turnoSeleccionado.nombre}`);
        rl.close();
        return;
      }

      console.log(`\nMédicos disponibles (${especialidad.nombre} - Turno ${turnoSeleccionado.nombre}):`);
      medicosDisponibles.forEach((med, i) => console.log(`${i + 1}. ${med.nombre}`));


      rl.question("Seleccione médico: ", (opcionMedico) => {
        if (cancelar(opcionMedico)) return;

        const medico = medicosDisponibles[Number(opcionMedico) - 1];

        if (!medico) {
          console.log("\n Médico inválido");
          rl.close();
          return;
        }


        //FECHA
        console.log("\nDías disponibles:");
          diasDisponibles.forEach((dia, i) => {
            console.log(`${i + 1}. ${GestorFecha.nombreDia(dia)} ${dia}`);
          });

          rl.question("Seleccione día: ", (opcionDia) => {
            if (cancelar(opcionDia)) return;

            const fecha = diasDisponibles[Number(opcionDia) - 1];

            if (!fecha) {
              console.log("\n Día inválido");
              rl.close();
              return;
            }

        //HORARIO          
        const horariosFiltrados = medico.horariosPorTurno(turnoSeleccionado);

        console.log(`\nHorarios disponibles (Turno ${turnoSeleccionado.nombre}):`);
        horariosFiltrados.forEach((hora, i) => console.log(`${i + 1}. ${hora}`));

        rl.question("Seleccione horario: ", (opcionHora) => {
          if (cancelar(opcionHora)) return;
          
          const hora = horariosFiltrados[Number(opcionHora) - 1];

          if (!hora) {
            console.log("\n Horario inválido");
            rl.close();
            return;
          }

          //VALIDAR LA CITA

          console.log("\n=== RESUMEN DE LA CITA ===");
          console.log(`Paciente:     ${paciente.nombre}`);
          console.log(`Doctor:       ${medico.nombre}`);
          console.log(`Especialidad: ${especialidad.nombre}`);
          console.log(`Turno:        ${turnoSeleccionado.nombre}`);
          console.log(`Fecha:        ${GestorFecha.nombreDia(fecha)} ${fecha}`);
          console.log(`Hora:         ${hora}`);

          rl.question("\n¿Confirma la cita? (si/no): ", (respuesta) => {
            if (cancelar(respuesta)) return;


          //CITA
      
            if (normalizar(respuesta.trim()) === "si") {
              const cita = new CitaMedica(
                paciente,
                medico,
                fecha,
                hora,
                EstadoCita.PROGRAMADA
              );
              Notificacion.enviar(cita);
        
            } else {
              console.log("\n Cita cancelada.");
            }
                          
            rl.close();
              });
            });
          });
        });
      });
    });
  });
});