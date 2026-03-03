import express from "express";
import cors from "cors";
import path from "path";
import { Especialidad } from "../domain/Especialidad";
import { ListaMedicos } from "../infrastructure/ListaMedicos";
import { GestorFecha } from "../application/GestorFecha";
import { GestorCitas } from "../application/GestorCitas";
import { GestorReprogramacion } from "../application/GestorReprogramacion";
import { Paciente } from "../domain/Paciente";
import { CitaMedica } from "../domain/CitaMedica";
import { EstadoCita } from "../domain/EstadoCita";
import { Notificacion } from "../application/Notificacion";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL SISTEMA
// ══════════════════════════════════════════════════════════════════════════════
async function cargarConfiguracionInicial() {
  try {
    const { JsonFileDb } = await import("../infrastructure/storage/JsonFileDb");
    const dbConfig = new JsonFileDb<any>("./data/config.json");
    const datos = await dbConfig.leerTodo();
    if (datos.length > 0) {
      return { habilitado: datos[0].habilitado, diaPermitido: datos[0].diaPermitido as number | null };
    }
  } catch {}
  const dias = await GestorFecha.obtenerDiasDisponibles();
  if (dias.length === 0) return { habilitado: false, diaPermitido: null as number | null };
  const primerDia = new Date(dias[0] + "T12:00:00").getDay();
  return { habilitado: true, diaPermitido: primerDia as number | null };
}

let configuracionReservas = { habilitado: false, diaPermitido: null as number | null };

cargarConfiguracionInicial().then(config => {
  configuracionReservas = config;
});

// ─── DATOS BASE ────────────────────────────────────────────────────────────────
const especialidades = [
  new Especialidad("Cardiología"),
  new Especialidad("Dermatología"),
  new Especialidad("Pediatría"),
  new Especialidad("Neurología"),
  new Especialidad("Traumatología"),
];
const medicinaGeneral = new Especialidad("Medicina General");
const medicos = ListaMedicos.obtener(especialidades, medicinaGeneral);

// ══════════════════════════════════════════════════════════════════════════════
// RUTAS DE ESPECIALIDADES
// ══════════════════════════════════════════════════════════════════════════════
app.get("/api/especialidades", (req, res) => {
  const lista = [...especialidades.map((e) => e.nombre), medicinaGeneral.nombre];
  res.json(lista);
});

// ══════════════════════════════════════════════════════════════════════════════
// RUTAS DE MÉDICOS
// ══════════════════════════════════════════════════════════════════════════════
app.get("/api/medicos", (req, res) => {
  const { especialidad, turno } = req.query as { especialidad?: string; turno?: string };
  const normalizar = (texto: string) =>
    texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let resultado = medicos;
  if (especialidad) resultado = resultado.filter(m => normalizar(m.especialidad.nombre) === normalizar(especialidad));
  if (turno) resultado = resultado.filter(m => normalizar(m.turno.nombre) === normalizar(turno));
  res.json(resultado.map(m => ({ id: m.id, nombre: m.nombre, especialidad: m.especialidad.nombre, turno: m.turno.nombre })));
});

// ══════════════════════════════════════════════════════════════════════════════
// RUTAS DE FECHAS
// ══════════════════════════════════════════════════════════════════════════════
app.get("/api/fechas", async (req, res) => {
  const dias = await GestorFecha.obtenerDiasDisponibles();
  if (dias.length === 0) return res.status(404).json({ error: "No hay fechas configuradas aún" });
  const diasConNombre = dias.map(d => ({ fecha: d, dia: GestorFecha.nombreDia(d) }));
  res.json(diasConNombre);
});

// ══════════════════════════════════════════════════════════════════════════════
// RUTA ADMIN - CONFIGURAR RESERVAS
// ══════════════════════════════════════════════════════════════════════════════
app.put("/api/admin/configurar-reservas", async (req, res) => {
  const { habilitado, dia } = req.body;
  configuracionReservas.habilitado = habilitado;
  configuracionReservas.diaPermitido = dia;

  // Guardar en archivo para persistir
  const { JsonFileDb } = await import("../infrastructure/storage/JsonFileDb");
  const dbConfig = new JsonFileDb<any>("./data/config.json");
  await dbConfig.guardarTodo([{ habilitado, diaPermitido: dia }]);

  res.json({ mensaje: "Configuración actualizada correctamente", configuracionReservas });
});

app.get("/api/configuracion", (req, res) => {
  res.json({ habilitado: configuracionReservas.habilitado, diaPermitido: configuracionReservas.diaPermitido });
});

// ══════════════════════════════════════════════════════════════════════════════
// RUTAS DE CITAS
// ══════════════════════════════════════════════════════════════════════════════
app.get("/api/citas", async (req, res) => {
  const { fecha } = req.query as { fecha?: string };
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return res.status(400).json({ error: "Debe enviar una fecha válida (YYYY-MM-DD)" });
  }
  const lista = await GestorCitas.buscarCitaPorDNI("") as any;
  const todas = await (await import("../infrastructure/storage/JsonFileDb")).JsonFileDb;
  // Leer todas las citas del JSON
  const { JsonFileDb } = await import("../infrastructure/storage/JsonFileDb");
  const db = new JsonFileDb<any>("./data/citas.json");
  const citas = await db.leerTodo();
  const citasDelDia = citas.filter((c: any) => c.fecha === fecha);
  res.json(citasDelDia);
});

app.get("/api/citas/:dni", async (req, res) => {
  const { dni } = req.params;
  if (!/^\d{8}$/.test(dni)) return res.status(400).json({ error: "DNI inválido (debe tener 8 dígitos)" });
  const cita = await GestorCitas.buscarCitaPorDNI(dni);
  if (!cita) return res.status(404).json({ error: "No se encontró ninguna cita con ese DNI" });
  res.json(cita);
});

app.post("/api/citas", async (req, res) => {
  const hoy = new Date().getDay();
  if (!configuracionReservas.habilitado) {
    return res.status(403).json({ error: "⚠️ Las reservas están deshabilitadas por el administrador." });
  }
  if (configuracionReservas.diaPermitido !== null && configuracionReservas.diaPermitido !== hoy) {
    const diasNombre: Record<number, string> = { 0:"Domingo", 1:"Lunes", 2:"Martes", 3:"Miércoles", 4:"Jueves", 5:"Viernes", 6:"Sábado" };
    return res.status(403).json({ error: `⚠️ Hoy no se puede reservar. El día habilitado es ${diasNombre[configuracionReservas.diaPermitido]}.` });
  }

  const { dni, nombre, medicoId, fecha } = req.body;
  if (!dni || !/^\d{8}$/.test(dni)) return res.status(400).json({ error: "DNI inválido" });
  if (!nombre || !nombre.trim()) return res.status(400).json({ error: "El nombre no puede estar vacío" });
  if (!medicoId) return res.status(400).json({ error: "Debe seleccionar un médico" });
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return res.status(400).json({ error: "Fecha inválida" });

  const medico = medicos.find(m => m.id === Number(medicoId));
  if (!medico) return res.status(404).json({ error: "Médico no encontrado" });

  const diasDisponibles = await GestorFecha.obtenerDiasDisponibles();
  if (!diasDisponibles.includes(fecha)) return res.status(400).json({ error: "La fecha no está disponible" });

  if (await GestorCitas.tieneCitaDuplicada(dni, medico.nombre, fecha)) {
    return res.status(409).json({ error: `Ya tienes una cita con ${medico.nombre} el ${GestorFecha.nombreDia(fecha)}` });
  }

  const todosHorarios = medico.horariosPorTurno(medico.turno);
  const ocupados = await GestorCitas.horariosOcupados(medico.nombre, fecha);
  const disponibles = todosHorarios.filter(h => !ocupados.includes(h));

  if (disponibles.length === 0) {
    return res.status(409).json({ error: `No hay horarios disponibles con ${medico.nombre} el ${GestorFecha.nombreDia(fecha)}` });
  }

  const horaAsignada = disponibles[0]!;
  const paciente = new Paciente(dni, nombre.trim());
  const cita = new CitaMedica(paciente, medico, fecha, horaAsignada, EstadoCita.PROGRAMADA, medico.turno.nombre);
  await Notificacion.enviar(cita);

  res.status(201).json({
    mensaje: "Cita reservada correctamente",
    cita: { dni: paciente.dni, paciente: paciente.nombre, doctor: medico.nombre, especialidad: medico.especialidad.nombre, turno: medico.turno.nombre, fecha, hora: horaAsignada, estado: EstadoCita.PROGRAMADA }
  });
});

app.put("/api/citas/:dni/reprogramar", async (req, res) => {
  const { dni } = req.params;
  const { nuevaFecha } = req.body;
  if (!/^\d{8}$/.test(dni)) return res.status(400).json({ error: "DNI inválido" });
  if (!nuevaFecha) return res.status(400).json({ error: "Debe enviar una nueva fecha" });

  const diasDisponibles = await GestorFecha.obtenerDiasDisponibles();
  if (!diasDisponibles.includes(nuevaFecha)) return res.status(400).json({ error: "La fecha no está disponible" });

  const cita = await GestorCitas.buscarCitaPorDNI(dni);
  if (!cita) return res.status(404).json({ error: "No se encontró ninguna cita con ese DNI" });

  const medico = medicos.find(m => m.nombre === cita.doctor);
  if (!medico) return res.status(404).json({ error: "Médico no encontrado" });

  const todosHorarios = medico.horariosPorTurno(medico.turno);
  const ocupados = await GestorCitas.horariosOcupados(medico.nombre, nuevaFecha);
  const disponibles = todosHorarios.filter(h => !ocupados.includes(h));

  if (disponibles.length === 0) return res.status(409).json({ error: "No hay horarios disponibles para esa fecha" });

  const nuevaHora = disponibles[0]!;
  const exito = await GestorReprogramacion.reprogramar(dni, nuevaFecha, nuevaHora);
  if (!exito) return res.status(500).json({ error: "No se pudo reprogramar la cita" });

  res.json({ mensaje: "Cita reprogramada correctamente", nuevaFecha, nuevaHora, dia: GestorFecha.nombreDia(nuevaFecha) });
});

app.put("/api/citas/:dni/cancelar", async (req, res) => {
  const { dni } = req.params;
  if (!/^\d{8}$/.test(dni)) return res.status(400).json({ error: "DNI inválido" });
  const exito = await GestorCitas.cancelarCita(dni);
  if (!exito) return res.status(400).json({ error: "No se pudo cancelar la cita o ya está cancelada" });
  res.json({ mensaje: "Cita cancelada correctamente" });
});

// ══════════════════════════════════════════════════════════════════════════════
// INICIAR SERVIDOR
// ══════════════════════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`\n Servidor corriendo en puerto ${PORT}`);
  console.log("\n Rutas disponibles:");
  console.log("  GET    /api/especialidades");
  console.log("  GET    /api/medicos?especialidad=X&turno=Y");
  console.log("  GET    /api/fechas");
  console.log("  GET    /api/citas?fecha=YYYY-MM-DD");
  console.log("  GET    /api/citas/:dni");
  console.log("  POST   /api/citas");
  console.log("  PUT    /api/citas/:dni/reprogramar");
  console.log("  PUT    /api/citas/:dni/cancelar");
  console.log("  PUT    /api/admin/configurar-reservas");
});