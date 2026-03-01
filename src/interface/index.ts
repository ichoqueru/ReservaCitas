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
import { GestorReprogramacion } from "../application/GestorReprogramacion";
import { GestorLimite } from "../application/GestorLimite";
import { GestorCitas } from "../application/GestorCitas";

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

const diasDisponibles = GestorFecha.obtenerDiasDisponibles();
if (diasDisponibles.length === 0) {
  console.log("\n No hay fecha configurada");
  process.exit(0);
}

if (!GestorFecha.esDiaDeReserva()) {
  const fechaReserva = GestorFecha.obtenerFechaReserva()!;
  console.log(`\n Las reservas solo se pueden realizar el día ${GestorFecha.nombreDia(fechaReserva)}`);
  console.log(" Vuelva ese día para reservar su cita");
  process.exit(0);
}

//============= MENÚ PRINCIPAL =============
console.clear();
console.log("=== SISTEMA DE CITAS MÉDICAS ===\n");
console.log("1. Reservar cita");
console.log("2. Reprogramar cita");
console.log('(Escribe "cancelar" en cualquier momento para salir)\n');

rl.question("Seleccione opción: ", (opcion) => {
  if (cancelar(opcion)) return;

  if (opcion === "1") {
    reservarCita();
  } else if (opcion === "2") {
    reprogramarCita();
  } else {
    console.log("\n Opción inválida");
    rl.close();
  }
});

//============= RESERVAR CITA =============
function reservarCita() {
  console.log("\n---- Reservar cita ----");

  rl.question("\nIngrese DNI del paciente: ", (dni) => {
    if (!/^\d{8}$/.test(dni)) {
      console.log("\n DNI inválido (debe tener 8 dígitos)");
      rl.close();
      return;
    }

    rl.question("Ingrese nombre del paciente: ", (nombre) => {
      if (!nombre.trim()) {
        console.log("\n El nombre no puede estar vacío");
        rl.close();
        return;
      }

      const paciente = new Paciente(dni, nombre.trim());

      // TIPO DE CONSULTA
      console.log("\n¿Qué tipo de consulta desea?");
      console.log("1. Medicina General");
      console.log("2. Especialidades\n");

      rl.question("Seleccione opción: ", (opcionConsulta) => {
        if (cancelar(opcionConsulta)) return;

        if (opcionConsulta.trim() !== "1" && opcionConsulta.trim() !== "2") {
          console.log("\n Opción inválida");
          rl.close();
          return;
        }

        if (opcionConsulta.trim() === "1") {
          // MEDICINA GENERAL
          console.log("\nTurnos disponibles:");
          console.log("1. Mañana");
          console.log("2. Tarde\n");

          rl.question("Seleccione turno: ", (opcionTurno) => {
            if (cancelar(opcionTurno)) return;

            if (opcionTurno.trim() !== "1" && opcionTurno.trim() !== "2") {
              console.log("\n Turno inválido");
              rl.close();
              return;
            }

            const turnoSeleccionado = opcionTurno.trim() === "1" ? Turno.MAÑANA : Turno.TARDE;
            const medicosMG = medicos.filter(med => med.especialidad.nombre === "Medicina General");

            console.log("\nDías disponibles:");
            diasDisponibles.forEach((dia, i) => {
              console.log(`${i + 1}. ${GestorFecha.nombreDia(dia)} ${dia}`);
            });

            const elegirFechaMG = () => {
              rl.question("Seleccione día: ", (opcionDia) => {
                if (cancelar(opcionDia)) return;

                const fecha = diasDisponibles[Number(opcionDia) - 1];

                if (!fecha) {
                  console.log("\n Día inválido, intente de nuevo:");
                  diasDisponibles.forEach((dia, i) => console.log(`${i + 1}. ${GestorFecha.nombreDia(dia)} ${dia}`));
                  elegirFechaMG();
                  return;
                }

                let medicoAsignado = null;
                let horaAsignada = null;

                for (const med of medicosMG) {
                  const todosHorarios = med.horariosPorTurno(turnoSeleccionado);
                  const ocupados = GestorCitas.horariosOcupados(med.nombre, fecha);
                  const disponibles = todosHorarios.filter(h => !ocupados.includes(h));

                  if (disponibles.length > 0) {
                    medicoAsignado = med;
                    horaAsignada = disponibles[0]!;
                    break;
                  }
                }

                if (!medicoAsignado || !horaAsignada) {
                  console.log(`\n No hay horarios disponibles para el ${GestorFecha.nombreDia(fecha)}.`);
                  console.log("Seleccione otro día:\n");
                  diasDisponibles.forEach((dia, i) => console.log(`${i + 1}. ${GestorFecha.nombreDia(dia)} ${dia}`));
                  elegirFechaMG();
                  return;
                }

                console.log("\n=== RESUMEN DE LA CITA ===");
                console.log(`Paciente:     ${paciente.nombre}`);
                console.log(`Doctor:       ${medicoAsignado.nombre}`);
                console.log(`Tipo:         Medicina General`);
                console.log(`Turno:        ${turnoSeleccionado.nombre}`);
                console.log(`Fecha:        ${GestorFecha.nombreDia(fecha)} ${fecha}`);
                console.log(`Hora:         ${horaAsignada}`);

                rl.question("\n¿Confirma la cita? (si/no): ", (respuesta) => {
                  if (cancelar(respuesta)) return;

                  if (normalizar(respuesta.trim()) === "si") {
                    const cita = new CitaMedica(
                      paciente,
                      medicoAsignado!,
                      fecha,
                      horaAsignada!,
                      EstadoCita.PROGRAMADA
                    );
                    Notificacion.enviar(cita);
                  } else {
                    console.log("\n Cita cancelada.");
                  }

                  rl.close();
                });
              });
            };

            elegirFechaMG();
          });

        } else {
          // ESPECIALIDADES
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

            console.log("\nTurnos disponibles:");
            console.log("1. Mañana");
            console.log("2. Tarde\n");

            rl.question("Seleccione turno: ", (opcionTurno) => {
              if (cancelar(opcionTurno)) return;

              if (opcionTurno.trim() !== "1" && opcionTurno.trim() !== "2") {
                console.log("\n Turno inválido");
                rl.close();
                return;
              }

              const turnoSeleccionado = opcionTurno.trim() === "1" ? Turno.MAÑANA : Turno.TARDE;

              const medicosDisponibles = medicos.filter(
                (med) => normalizar(med.especialidad.nombre) === normalizar(especialidad.nombre)
              );

              if (medicosDisponibles.length === 0) {
                console.log(`\n No hay médicos disponibles para ${especialidad.nombre}`);
                rl.close();
                return;
              }

              console.log(`\nMédicos disponibles (${especialidad.nombre} - Turno ${turnoSeleccionado.nombre}):`);
              medicosDisponibles.forEach((med, i) => console.log(`${i + 1}. ${med.nombre}`));

              const elegirMedico = () => {
                rl.question("Seleccione médico: ", (opcionMedico) => {
                  if (cancelar(opcionMedico)) return;

                  const medico = medicosDisponibles[Number(opcionMedico) - 1];

                  if (!medico) {
                    console.log("\n Médico inválido, intente de nuevo:");
                    medicosDisponibles.forEach((med, i) => console.log(`${i + 1}. ${med.nombre}`));
                    elegirMedico();
                    return;
                  }

                  console.log("\nDías disponibles:");
                  diasDisponibles.forEach((dia, i) => {
                    console.log(`${i + 1}. ${GestorFecha.nombreDia(dia)} ${dia}`);
                  });

                  const elegirFecha = () => {
                    rl.question("Seleccione día: ", (opcionDia) => {
                      if (cancelar(opcionDia)) return;

                      const fecha = diasDisponibles[Number(opcionDia) - 1];

                      if (!fecha) {
                        console.log("\n Día inválido, intente de nuevo:");
                        diasDisponibles.forEach((dia, i) => console.log(`${i + 1}. ${GestorFecha.nombreDia(dia)} ${dia}`));
                        elegirFecha();
                        return;
                      }

                      const limite = GestorLimite.obtenerLimite();
                      if (limite !== null) {
                        const citasActuales = GestorCitas.contarCitasPorDoctor(medico.nombre, fecha);
                        if (citasActuales >= limite) {
                          console.log(`\n No hay horarios disponibles para el ${GestorFecha.nombreDia(fecha)}.`);
                          console.log("Seleccione otro día:\n");
                          diasDisponibles.forEach((dia, i) => console.log(`${i + 1}. ${GestorFecha.nombreDia(dia)} ${dia}`));
                          elegirFecha();
                          return;
                        }
                      }

                      const todosHorarios = medico.horariosPorTurno(turnoSeleccionado);
                      const ocupados = GestorCitas.horariosOcupados(medico.nombre, fecha);
                      const horariosFiltrados = todosHorarios.filter(h => !ocupados.includes(h));

                      if (horariosFiltrados.length === 0) {
                        console.log(`\n No hay horarios disponibles para el ${GestorFecha.nombreDia(fecha)}.`);
                        console.log("Seleccione otro día:\n");
                        diasDisponibles.forEach((dia, i) => console.log(`${i + 1}. ${GestorFecha.nombreDia(dia)} ${dia}`));
                        elegirFecha();
                        return;
                      }

                      const hora = horariosFiltrados[0]!;
                      console.log(`\n Horario asignado automáticamente: ${hora}`);

                      console.log("\n=== RESUMEN DE LA CITA ===");
                      console.log(`Paciente:     ${paciente.nombre}`);
                      console.log(`Doctor:       ${medico.nombre}`);
                      console.log(`Especialidad: ${especialidad.nombre}`);
                      console.log(`Turno:        ${turnoSeleccionado.nombre}`);
                      console.log(`Fecha:        ${GestorFecha.nombreDia(fecha)} ${fecha}`);
                      console.log(`Hora:         ${hora}`);

                      rl.question("\n¿Confirma la cita? (si/no): ", (respuesta) => {
                        if (cancelar(respuesta)) return;

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

//============= REPROGRAMAR CITA =============
function reprogramarCita() {
  console.log("\n---- Reprogramar cita ----");

  rl.question("\nIngrese su DNI: ", (dni) => {
    if (cancelar(dni)) return;

    if (!/^\d{8}$/.test(dni)) {
      console.log("\n DNI inválido (debe tener 8 dígitos)");
      rl.close();
      return;
    }

    const resultado = GestorReprogramacion.buscarCita(dni);

    if (!resultado) {
      console.log("\n No se encontró ninguna cita con ese DNI.");
      rl.close();
      return;
    }

    console.log("\n Cita encontrada:");
    console.log(resultado.linea);

    console.log("\nDías disponibles:");
    diasDisponibles.forEach((dia, i) => {
      console.log(`${i + 1}. ${GestorFecha.nombreDia(dia)} ${dia}`);
    });

    rl.question("\nSeleccione nuevo día: ", (opcionDia) => {
      if (cancelar(opcionDia)) return;

      const nuevaFecha = diasDisponibles[Number(opcionDia) - 1];

      if (!nuevaFecha) {
        console.log("\n Día inválido");
        rl.close();
        return;
      }

      rl.question("Nueva hora (ej: 09:00): ", (nuevaHora) => {
        if (cancelar(nuevaHora)) return;

        if (!/^\d{2}:\d{2}$/.test(nuevaHora.trim())) {
          console.log("\n Hora inválida, use el formato HH:MM (ej: 09:00)");
          rl.close();
          return;
        }

        console.log("\n=== RESUMEN DE REPROGRAMACIÓN ===");
        console.log(`Nueva fecha: ${GestorFecha.nombreDia(nuevaFecha)} ${nuevaFecha}`);
        console.log(`Nueva hora:  ${nuevaHora.trim()}`);

        rl.question("\n¿Confirma la reprogramación? (si/no): ", (respuesta) => {
          if (cancelar(respuesta)) return;

          if (respuesta.trim().toLowerCase() === "si") {
            const exito = GestorReprogramacion.reprogramar(dni, nuevaFecha, nuevaHora.trim());
            if (exito) {
              console.log("\n Cita reprogramada correctamente.");
            } else {
              console.log("\n No se pudo reprogramar la cita.");
            }
          } else {
            console.log("\n Reprogramación cancelada.");
          }

          rl.close();
        });
      });
    });
  });
}