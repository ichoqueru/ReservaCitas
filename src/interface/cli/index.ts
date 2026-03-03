import * as readline from "readline";
import { Paciente } from "../../domain/Paciente";
import { Especialidad } from "../../domain/Especialidad";
import { CitaMedica } from "../../domain/CitaMedica";
import { EstadoCita } from "../../domain/EstadoCita";
import { Notificacion } from "../../application/Notificacion";
import { Turno } from "../../domain/Turno";
import { GestorFecha } from "../../application/GestorFecha";
import { ListaMedicos } from "../../infrastructure/ListaMedicos";
import { GestorCancelacion } from "../../application/GestorCancelacion";
import { GestorReprogramacion } from "../../application/GestorReprogramacion";
import { GestorCitas } from "../../application/GestorCitas";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const cancelar = (input: string): boolean => {
  if (GestorCancelacion.esCancelacion(input)) {
    GestorCancelacion.cancelar();
    rl.close();
    return true;
  }
  return false;
};

const normalizar = (texto: string) =>
  texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const especialidades = [
  new Especialidad("Cardiología"),
  new Especialidad("Dermatología"),
  new Especialidad("Pediatría"),
  new Especialidad("Neurología"),
  new Especialidad("Traumatología")
];

const medicinaGeneral = new Especialidad("Medicina General");
const medicos = ListaMedicos.obtener(especialidades, medicinaGeneral);

async function main() {
  const diasDisponibles = await GestorFecha.obtenerDiasDisponibles();

  if (diasDisponibles.length === 0) {
    console.log("\n No hay fecha configurada");
    process.exit(0);
  }

  const esDia = await GestorFecha.esDiaDeReserva();
  if (!esDia) {
    const fechaReserva = await GestorFecha.obtenerFechaReserva();
    console.log(`\n Las reservas solo se pueden realizar el día ${GestorFecha.nombreDia(fechaReserva!)}`);
    console.log(" Vuelva ese día para reservar su cita");
    process.exit(0);
  }

  console.clear();
  console.log("=== SISTEMA DE CITAS MÉDICAS ===\n");
  console.log("1. Reservar cita");
  console.log("2. Reprogramar cita");
  console.log('(Escribe "cancelar" en cualquier momento para salir)\n');

  rl.question("Seleccione opción: ", (opcion) => {
    if (cancelar(opcion)) return;
    if (opcion === "1") reservarCita(diasDisponibles);
    else if (opcion === "2") reprogramarCita(diasDisponibles);
    else { console.log("\n Opción inválida"); rl.close(); }
  });
}

function reservarCita(diasDisponibles: string[]) {
  console.log("\n---- Reservar cita ----");

  rl.question("\nIngrese DNI del paciente: ", (dni) => {
    if (!/^\d{8}$/.test(dni)) { console.log("\n DNI inválido"); rl.close(); return; }

    rl.question("Ingrese nombre del paciente: ", (nombre) => {
      if (!nombre.trim()) { console.log("\n El nombre no puede estar vacío"); rl.close(); return; }

      const paciente = new Paciente(dni, nombre.trim());

      console.log("\n¿Qué tipo de consulta desea?");
      console.log("1. Medicina General");
      console.log("2. Especialidades\n");

      rl.question("Seleccione opción: ", (opcionConsulta) => {
        if (cancelar(opcionConsulta)) return;

        if (opcionConsulta.trim() === "1") {
          console.log("\nTurnos disponibles:\n1. Mañana\n2. Tarde\n");

          rl.question("Seleccione turno: ", (opcionTurno) => {
            if (cancelar(opcionTurno)) return;
            const turnoSeleccionado = opcionTurno.trim() === "1" ? Turno.MAÑANA : Turno.TARDE;
            const medicosMG = medicos.filter(m =>
              m.especialidad.nombre === "Medicina General" && m.turno.nombre === turnoSeleccionado.nombre
            );

            if (medicosMG.length === 0) { console.log("\n No hay médicos disponibles"); rl.close(); return; }

            console.log(`\nMédicos disponibles:`);
            medicosMG.forEach((m, i) => console.log(`${i + 1}. ${m.nombre}`));

            const elegirMedicoMG = () => {
              rl.question("Seleccione médico: ", (op) => {
                if (cancelar(op)) return;
                const medico = medicosMG[Number(op) - 1];
                if (!medico) { console.log("\n Médico inválido"); elegirMedicoMG(); return; }

                console.log("\nDías disponibles:");
                diasDisponibles.forEach((d, i) => console.log(`${i + 1}. ${GestorFecha.nombreDia(d)} ${d}`));

                const elegirFecha = () => {
                  rl.question("Seleccione día: ", async (opDia) => {
                    if (cancelar(opDia)) return;
                    const fecha = diasDisponibles[Number(opDia) - 1];
                    if (!fecha) { console.log("\n Día inválido"); elegirFecha(); return; }

                    if (await GestorCitas.tieneCitaDuplicada(paciente.dni, medico.nombre, fecha)) {
                      console.log(`\n Ya tienes una cita con ${medico.nombre} ese día`);
                      elegirFecha(); return;
                    }

                    const ocupados = await GestorCitas.horariosOcupados(medico.nombre, fecha);
                    const disponibles = medico.horariosPorTurno(turnoSeleccionado).filter(h => !ocupados.includes(h));

                    if (disponibles.length === 0) { console.log("\n No hay horarios disponibles"); elegirFecha(); return; }

                    const hora = disponibles[0]!;
                    console.log(`\n Horario asignado: ${hora}`);
                    console.log(`\n=== RESUMEN ===\nPaciente: ${paciente.nombre}\nDoctor: ${medico.nombre}\nFecha: ${GestorFecha.nombreDia(fecha)} ${fecha}\nHora: ${hora}`);

                    rl.question("\n¿Confirma? (si/no): ", async (resp) => {
                      if (cancelar(resp)) return;
                      if (normalizar(resp.trim()) === "si") {
                        const cita = new CitaMedica(paciente, medico, fecha, hora, EstadoCita.PROGRAMADA, turnoSeleccionado.nombre);
                        await Notificacion.enviar(cita);
                      } else { console.log("\n Cita cancelada."); }
                      rl.close();
                    });
                  });
                };
                elegirFecha();
              });
            };
            elegirMedicoMG();
          });

        } else {
          console.log("\nEspecialidades disponibles:");
          especialidades.forEach(e => console.log(`- ${e.nombre}`));

          rl.question("Ingrese la especialidad: ", (nombreEsp) => {
            const especialidad = especialidades.find(e => normalizar(e.nombre) === normalizar(nombreEsp.trim()));
            if (!especialidad) { console.log("\n Especialidad no encontrada"); rl.close(); return; }

            console.log("\nTurnos disponibles:\n1. Mañana\n2. Tarde\n");

            rl.question("Seleccione turno: ", (opcionTurno) => {
              if (cancelar(opcionTurno)) return;
              const turnoSeleccionado = opcionTurno.trim() === "1" ? Turno.MAÑANA : Turno.TARDE;
              const medicosDisponibles = medicos.filter(m =>
                normalizar(m.especialidad.nombre) === normalizar(especialidad.nombre) &&
                m.turno.nombre === turnoSeleccionado.nombre
              );

              if (medicosDisponibles.length === 0) { console.log("\n No hay médicos disponibles"); rl.close(); return; }

              console.log("\nMédicos disponibles:");
              medicosDisponibles.forEach((m, i) => console.log(`${i + 1}. ${m.nombre}`));

              const elegirMedico = () => {
                rl.question("Seleccione médico: ", (op) => {
                  if (cancelar(op)) return;
                  const medico = medicosDisponibles[Number(op) - 1];
                  if (!medico) { console.log("\n Médico inválido"); elegirMedico(); return; }

                  console.log("\nDías disponibles:");
                  diasDisponibles.forEach((d, i) => console.log(`${i + 1}. ${GestorFecha.nombreDia(d)} ${d}`));

                  const elegirFecha = () => {
                    rl.question("Seleccione día: ", async (opDia) => {
                      if (cancelar(opDia)) return;
                      const fecha = diasDisponibles[Number(opDia) - 1];
                      if (!fecha) { console.log("\n Día inválido"); elegirFecha(); return; }

                      if (await GestorCitas.tieneCitaDuplicada(paciente.dni, medico.nombre, fecha)) {
                        console.log(`\n Ya tienes una cita con ${medico.nombre} ese día`);
                        elegirFecha(); return;
                      }

                      const ocupados = await GestorCitas.horariosOcupados(medico.nombre, fecha);
                      const disponibles = medico.horariosPorTurno(turnoSeleccionado).filter(h => !ocupados.includes(h));

                      if (disponibles.length === 0) { console.log("\n No hay horarios disponibles"); elegirFecha(); return; }

                      const hora = disponibles[0]!;
                      console.log(`\n Horario asignado: ${hora}`);
                      console.log(`\n=== RESUMEN ===\nPaciente: ${paciente.nombre}\nDoctor: ${medico.nombre}\nEspecialidad: ${especialidad.nombre}\nFecha: ${GestorFecha.nombreDia(fecha)} ${fecha}\nHora: ${hora}`);

                      rl.question("\n¿Confirma? (si/no): ", async (resp) => {
                        if (cancelar(resp)) return;
                        if (normalizar(resp.trim()) === "si") {
                          const cita = new CitaMedica(paciente, medico, fecha, hora, EstadoCita.PROGRAMADA, turnoSeleccionado.nombre);
                          await Notificacion.enviar(cita);
                        } else { console.log("\n Cita cancelada."); }
                        rl.close();
                      });
                    });
                  };
                  elegirFecha();
                });
              };
              elegirMedico();
            });
          });
        }
      });
    });
  });
}

async function reprogramarCita(diasDisponibles: string[]) {
  console.log("\n---- Reprogramar cita ----");

  rl.question("\nIngrese su DNI: ", async (dni) => {
    if (cancelar(dni)) return;
    if (!/^\d{8}$/.test(dni)) { console.log("\n DNI inválido"); rl.close(); return; }

    const cita = await GestorReprogramacion.buscarCita(dni);
    if (!cita) { console.log("\n No se encontró ninguna cita con ese DNI."); rl.close(); return; }

    console.log(`\n Cita encontrada:\nPaciente: ${cita.paciente}\nDoctor: ${cita.doctor}\nFecha: ${cita.fecha}\nHora: ${cita.hora}\nEstado: ${cita.estado}`);

    const datos = await GestorCitas.obtenerDatosCita(dni);
    if (!datos) { console.log("\n No se pudieron obtener los datos."); rl.close(); return; }

    const turnoSeleccionado = datos.turno === "Mañana" ? Turno.MAÑANA : Turno.TARDE;
    const medico = medicos.find(m => m.nombre === datos.doctor);
    if (!medico) { console.log("\n No se encontró el médico."); rl.close(); return; }

    console.log("\nDías disponibles:");
    diasDisponibles.forEach((d, i) => console.log(`${i + 1}. ${GestorFecha.nombreDia(d)} ${d}`));

    const elegirFecha = () => {
      rl.question("\nSeleccione nuevo día: ", async (opDia) => {
        if (cancelar(opDia)) return;
        const nuevaFecha = diasDisponibles[Number(opDia) - 1];
        if (!nuevaFecha) { console.log("\n Día inválido"); elegirFecha(); return; }

        const ocupados = await GestorCitas.horariosOcupados(medico.nombre, nuevaFecha);
        const disponibles = medico.horariosPorTurno(turnoSeleccionado).filter(h => !ocupados.includes(h));

        if (disponibles.length === 0) { console.log("\n No hay horarios disponibles"); elegirFecha(); return; }

        const nuevaHora = disponibles[0]!;
        console.log(`\n=== RESUMEN ===\nDoctor: ${medico.nombre}\nNueva fecha: ${GestorFecha.nombreDia(nuevaFecha)} ${nuevaFecha}\nNueva hora: ${nuevaHora}`);

        rl.question("\n¿Confirma? (si/no): ", async (resp) => {
          if (cancelar(resp)) return;
          if (resp.trim().toLowerCase() === "si") {
            const exito = await GestorReprogramacion.reprogramar(dni, nuevaFecha, nuevaHora);
            console.log(exito ? "\n Cita reprogramada correctamente." : "\n No se pudo reprogramar.");
          } else { console.log("\n Reprogramación cancelada."); }
          rl.close();
        });
      });
    };
    elegirFecha();
  });
}

main();