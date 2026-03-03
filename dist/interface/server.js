"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const Especialidad_1 = require("../domain/Especialidad");
const ListaMedicos_1 = require("../infrastructure/ListaMedicos");
const GestorFecha_1 = require("../application/GestorFecha");
const GestorCitas_1 = require("../application/GestorCitas");
const Paciente_1 = require("../domain/Paciente");
const CitaMedica_1 = require("../domain/CitaMedica");
const EstadoCita_1 = require("../domain/EstadoCita");
const Notificacion_1 = require("../application/Notificacion");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 8080;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(process.cwd(), "public")));
function cargarConfiguracionInicial() {
    const dias = GestorFecha_1.GestorFecha.obtenerDiasDisponibles();
    if (dias.length === 0)
        return { habilitado: false, diaPermitido: null };
    const primerDia = new Date(dias[0] + "T12:00:00").getDay();
    return { habilitado: true, diaPermitido: primerDia };
}
let configuracionReservas = cargarConfiguracionInicial();
// ─── DATOS BASE ────────────────────────────────────────────────────────────────
const especialidades = [
    new Especialidad_1.Especialidad("Cardiología"),
    new Especialidad_1.Especialidad("Dermatología"),
    new Especialidad_1.Especialidad("Pediatría"),
    new Especialidad_1.Especialidad("Neurología"),
    new Especialidad_1.Especialidad("Traumatología"),
];
const medicinaGeneral = new Especialidad_1.Especialidad("Medicina General");
const medicos = ListaMedicos_1.ListaMedicos.obtener(especialidades, medicinaGeneral);
// ══════════════════════════════════════════════════════════════════════════════
// RUTAS DE ESPECIALIDADES
// ══════════════════════════════════════════════════════════════════════════════
app.get("/api/especialidades", (req, res) => {
    const lista = [
        ...especialidades.map((e) => e.nombre),
        medicinaGeneral.nombre,
    ];
    res.json(lista);
});
// ══════════════════════════════════════════════════════════════════════════════
// RUTAS DE MÉDICOS
// ══════════════════════════════════════════════════════════════════════════════
app.get("/api/medicos", (req, res) => {
    const { especialidad, turno } = req.query;
    const normalizar = (texto) => texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let resultado = medicos;
    if (especialidad) {
        resultado = resultado.filter((m) => normalizar(m.especialidad.nombre) === normalizar(especialidad));
    }
    if (turno) {
        resultado = resultado.filter((m) => normalizar(m.turno.nombre) === normalizar(turno));
    }
    res.json(resultado.map((m) => ({
        id: m.id,
        nombre: m.nombre,
        especialidad: m.especialidad.nombre,
        turno: m.turno.nombre,
    })));
});
// ══════════════════════════════════════════════════════════════════════════════
// RUTAS DE FECHAS
// ══════════════════════════════════════════════════════════════════════════════
app.get("/api/fechas", (req, res) => {
    const dias = GestorFecha_1.GestorFecha.obtenerDiasDisponibles();
    if (dias.length === 0) {
        return res.status(404).json({ error: "No hay fechas configuradas aún" });
    }
    const diasConNombre = dias.map((d) => ({
        fecha: d,
        dia: GestorFecha_1.GestorFecha.nombreDia(d),
    }));
    res.json(diasConNombre);
});
// ══════════════════════════════════════════════════════════════════════════════
// RUTA ADMIN - CONFIGURAR RESERVAS
// ══════════════════════════════════════════════════════════════════════════════
app.put("/api/admin/configurar-reservas", (req, res) => {
    const { habilitado, dia } = req.body;
    configuracionReservas.habilitado = habilitado;
    configuracionReservas.diaPermitido = dia;
    res.json({
        mensaje: "Configuración actualizada correctamente",
        configuracionReservas
    });
});
// GET /api/configuracion → devuelve si está habilitado y el día permitido
app.get("/api/configuracion", (req, res) => {
    res.json({
        habilitado: configuracionReservas.habilitado,
        diaPermitido: configuracionReservas.diaPermitido // 0=domingo, 1=lunes, etc
    });
});
// ══════════════════════════════════════════════════════════════════════════════
// RUTAS DE CITAS
// ══════════════════════════════════════════════════════════════════════════════
// GET /api/citas?fecha=YYYY-MM-DD → lista citas de un día
app.get("/api/citas", (req, res) => {
    const { fecha } = req.query;
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res
            .status(400)
            .json({ error: "Debe enviar una fecha válida (YYYY-MM-DD)" });
    }
    const fs = require("fs");
    const path = require("path");
    const CARPETA = "./citas";
    if (!fs.existsSync(CARPETA)) {
        return res.json([]);
    }
    const archivos = fs.readdirSync(CARPETA).filter((a) => a.endsWith(".txt"));
    const citasDelDia = [];
    for (const archivo of archivos) {
        const ruta = path.join(CARPETA, archivo);
        const lineas = fs
            .readFileSync(ruta, "utf-8")
            .split("\n")
            .filter((l) => l.trim() !== "");
        for (const linea of lineas) {
            if (linea.includes(`Fecha: ${fecha}`)) {
                const dniMatch = linea.match(/DNI: ([^|]+)\|/);
                const pacienteMatch = linea.match(/Paciente: ([^|]+)\|/);
                const doctorMatch = linea.match(/Doctor: ([^|]+)\|/);
                const espMatch = linea.match(/Especialidad: ([^|]+)\|/);
                const turnoMatch = linea.match(/Turno: ([^|]+)\|/);
                const horaMatch = linea.match(/Hora: (\d{2}:\d{2})/);
                const estadoMatch = linea.match(/Estado: (\S+)/);
                citasDelDia.push({
                    dni: dniMatch ? dniMatch[1].trim() : "?",
                    paciente: pacienteMatch ? pacienteMatch[1].trim() : "?",
                    doctor: doctorMatch ? doctorMatch[1].trim() : "?",
                    especialidad: espMatch ? espMatch[1].trim() : "?",
                    turno: turnoMatch ? turnoMatch[1].trim() : "?",
                    fecha,
                    hora: horaMatch ? horaMatch[1] : "?",
                    estado: estadoMatch ? estadoMatch[1] : "?",
                });
            }
        }
    }
    res.json(citasDelDia);
});
// GET /api/citas/:dni → busca la cita de un paciente por DNI
app.get("/api/citas/:dni", (req, res) => {
    const { dni } = req.params;
    if (!/^\d{8}$/.test(dni)) {
        return res.status(400).json({ error: "DNI inválido (debe tener 8 dígitos)" });
    }
    const resultado = GestorCitas_1.GestorCitas.buscarCitaPorDNI(dni);
    if (!resultado) {
        return res.status(404).json({ error: "No se encontró ninguna cita con ese DNI" });
    }
    const linea = resultado.linea;
    const dniMatch = linea.match(/DNI: ([^|]+)\|/);
    const pacienteMatch = linea.match(/Paciente: ([^|]+)\|/);
    const doctorMatch = linea.match(/Doctor: ([^|]+)\|/);
    const espMatch = linea.match(/Especialidad: ([^|]+)\|/);
    const turnoMatch = linea.match(/Turno: ([^|]+)\|/);
    const fechaMatch = linea.match(/Fecha: (\S+)/);
    const horaMatch = linea.match(/Hora: (\d{2}:\d{2})/);
    const estadoMatch = linea.match(/Estado: (\S+)/);
    res.json({
        dni: dniMatch ? dniMatch[1].trim() : "?",
        paciente: pacienteMatch ? pacienteMatch[1].trim() : "?",
        doctor: doctorMatch ? doctorMatch[1].trim() : "?",
        especialidad: espMatch ? espMatch[1].trim() : "?",
        turno: turnoMatch ? turnoMatch[1].trim() : "?",
        fecha: fechaMatch ? fechaMatch[1] : "?",
        hora: horaMatch ? horaMatch[1] : "?",
        estado: estadoMatch ? estadoMatch[1] : "?",
    });
});
// POST /api/citas → reservar una nueva cita
app.post("/api/citas", (req, res) => {
    //  VALIDACIÓN GLOBAL DEL SISTEMA
    const hoy = new Date().getDay();
    if (!configuracionReservas.habilitado) {
        return res.status(403).json({
            error: "⚠️ Las reservas están deshabilitadas por el administrador."
        });
    }
    if (configuracionReservas.diaPermitido !== null && configuracionReservas.diaPermitido !== hoy) {
        const diasNombre = {
            0: "Domingo",
            1: "Lunes",
            2: "Martes",
            3: "Miércoles",
            4: "Jueves",
            5: "Viernes",
            6: "Sábado",
        };
        return res.status(403).json({
            error: `⚠️ Hoy no se puede reservar citas. El día habilitado para reservas es ${diasNombre[configuracionReservas.diaPermitido]}.`
        });
    }
    const { dni, nombre, medicoId, fecha } = req.body;
    // ── Validaciones
    if (!dni || !/^\d{8}$/.test(dni)) {
        return res.status(400).json({ error: "DNI inválido (debe tener 8 dígitos)" });
    }
    if (!nombre || !nombre.trim()) {
        return res.status(400).json({ error: "El nombre no puede estar vacío" });
    }
    if (!medicoId) {
        return res.status(400).json({ error: "Debe seleccionar un médico" });
    }
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res.status(400).json({ error: "Fecha inválida (use YYYY-MM-DD)" });
    }
    // Buscar médico
    const medico = medicos.find((m) => m.id === Number(medicoId));
    if (!medico) {
        return res.status(404).json({ error: "Médico no encontrado" });
    }
    // Verificar que la fecha esté dentro de los días disponibles
    const diasDisponibles = GestorFecha_1.GestorFecha.obtenerDiasDisponibles();
    if (!diasDisponibles.includes(fecha)) {
        return res.status(400).json({ error: "La fecha no está disponible para reservas" });
    }
    // Verificar cita duplicada
    if (GestorCitas_1.GestorCitas.tieneCitaDuplicada(dni, medico.nombre, fecha)) {
        return res.status(409).json({
            error: `Ya tienes una cita con ${medico.nombre} el ${GestorFecha_1.GestorFecha.nombreDia(fecha)}`,
        });
    }
    // Buscar horario disponible
    const todosHorarios = medico.horariosPorTurno(medico.turno);
    const ocupados = GestorCitas_1.GestorCitas.horariosOcupados(medico.nombre, fecha);
    const disponibles = todosHorarios.filter((h) => !ocupados.includes(h));
    if (disponibles.length === 0) {
        return res.status(409).json({
            error: `No hay horarios disponibles con ${medico.nombre} el ${GestorFecha_1.GestorFecha.nombreDia(fecha)}`,
        });
    }
    const horaAsignada = disponibles[0];
    // Crear y guardar la cita
    const paciente = new Paciente_1.Paciente(dni, nombre.trim());
    const cita = new CitaMedica_1.CitaMedica(paciente, medico, fecha, horaAsignada, EstadoCita_1.EstadoCita.PROGRAMADA, medico.turno.nombre);
    Notificacion_1.Notificacion.enviar(cita);
    res.status(201).json({
        mensaje: "Cita reservada correctamente",
        cita: {
            dni: paciente.dni,
            paciente: paciente.nombre,
            doctor: medico.nombre,
            especialidad: medico.especialidad.nombre,
            turno: medico.turno.nombre,
            fecha,
            hora: horaAsignada,
            estado: EstadoCita_1.EstadoCita.PROGRAMADA,
        },
    });
});
// PUT /api/citas/:dni/reprogramar → reprogramar una cita existente
app.put("/api/citas/:dni/reprogramar", (req, res) => {
    // ... Mantén todo exactamente igual que antes ...
});
// PUT /api/citas/:dni/cancelar → cancelar una cita existente
app.put("/api/citas/:dni/cancelar", (req, res) => {
    // ... Mantén todo exactamente igual que antes ...
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
    console.log("  PUT    /api/admin/configurar-reservas");
});
//# sourceMappingURL=server.js.map