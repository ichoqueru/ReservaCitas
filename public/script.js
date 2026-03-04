const API = "https://reservacitas-production.up.railway.app";
//const API = "http://localhost:3000";
let configuracionReservas = { habilitado: true, fechaPermitida: null };

async function obtenerConfiguracion() {
  try {
    const res = await fetch(API + '/api/configuracion');
    if (!res.ok) throw new Error();
    configuracionReservas = await res.json();
  } catch {
    console.warn("⚠️ No se pudo obtener la configuración del sistema.");
  }
} 

let reserva = { dni:"", nombre:"", medicoId:null, medicoNombre:"", especialidad:"", turno:"", fecha:"", fechaDia:"" };
let citaBuscada = null;

// ════════════════════════════════
//  NAVEGACIÓN
// ════════════════════════════════
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  document.getElementById('hero-section').style.display = (id === 'home') ? '' : 'none';
  if (id === 'home')     cargarHome();
  if (id === 'reservar') iniciarReserva();
  if (id === 'listado')  document.getElementById('listado-fecha').valueAsDate = new Date();
}

// ════════════════════════════════
//  HOME
// ════════════════════════════════
async function cargarHome() {
  const dot = document.getElementById('status-dot');
  const txt = document.getElementById('status-text');
  try {
    const [espRes, medRes, diasRes] = await Promise.all([
      fetch(API + '/api/especialidades'),
      fetch(API + '/api/medicos'),
      fetch(API + '/api/fechas')
    ]);
    if (!espRes.ok) throw new Error();
    const esp  = await espRes.json();
    const med  = await medRes.json();
    const dias = await diasRes.json();
    document.getElementById('stat-esp').textContent  = esp.length;
    document.getElementById('stat-med').textContent  = med.length;
    document.getElementById('stat-dias').textContent = Array.isArray(dias) ? dias.length : 0;
    dot.className = 'dot online';
    txt.textContent = 'Servidor activo';
  } catch {
    dot.className = 'dot offline';
    txt.textContent = 'Servidor desconectado';
    showAlert('alert-home', 'error', '⚠️ No se pudo conectar con el servidor.');
  }
}

// ════════════════════════════════
//  RESERVAR
// ════════════════════════════════
async function iniciarReserva() {
  reserva = { dni:"", nombre:"", medicoId:null, medicoNombre:"", especialidad:"", turno:"", fecha:"", fechaDia:"" };
  irPaso(1);
  await obtenerConfiguracion();

  // ✅ Corregido - usa hora local
  const ahora = new Date();
  const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,'0')}-${String(ahora.getDate()).padStart(2,'0')}`;

  const bloqueado = !configuracionReservas.habilitado ||
    (configuracionReservas.fechaPermitida !== null && configuracionReservas.fechaPermitida !== hoy);

  console.log("Hoy:", hoy);
  console.log("Fecha permitida:", configuracionReservas.fechaPermitida);
  console.log("Bloqueado:", bloqueado);

  if (bloqueado) {
    const msg = !configuracionReservas.habilitado
      ? `⚠️ Hoy no se puede reservar citas. ${configuracionReservas.fechaPermitida !== null
          ? `El día habilitado es: <strong>${configuracionReservas.fechaPermitida}</strong>.`
          : 'Consulta con el administrador.'}`
      : `⚠️ Hoy no se puede reservar. El día habilitado es: <strong>${configuracionReservas.fechaPermitida}</strong>.`;

    showAlert('alert-step1', 'error', msg);
    document.querySelector('#form-step1 .btn-primary').disabled = true;
  } else {
    hideAlert('alert-step1');
    document.querySelector('#form-step1 .btn-primary').disabled = false;
  }

  try {
    const res = await fetch(API + '/api/especialidades');
    const esp = await res.json();
    const sel = document.getElementById('select-esp');
    sel.innerHTML = '<option value="">— Selecciona —</option>';
    esp.forEach(e => {
      const o = document.createElement('option');
      o.value = e; o.textContent = e;
      sel.appendChild(o);
    });
  } catch { showAlert('alert-step2', 'error', '⚠️ No se pudieron cargar las especialidades.'); }

  try {
    const res  = await fetch(API + '/api/fechas');
    const dias = await res.json();
    const sel  = document.getElementById('select-fecha');
    sel.innerHTML = '<option value="">— Selecciona —</option>';
    if (Array.isArray(dias)) {
      dias.forEach(d => {
        const o = document.createElement('option');
        o.value = d.fecha;
        o.textContent = `${d.dia} ${d.fecha}`;
        sel.appendChild(o);
      });
    }
  } catch { showAlert('alert-step3', 'error', '⚠️ No se pudieron cargar las fechas.'); }
}

async function cargarMedicos() {
  const esp   = document.getElementById('select-esp').value;
  const turno = document.getElementById('select-turno').value;
  const sel   = document.getElementById('select-medico');
  sel.innerHTML = '<option value="">— Selecciona especialidad y turno —</option>';
  if (!esp || !turno) return;
  try {
    const url = `${API}/api/medicos?especialidad=${encodeURIComponent(esp)}&turno=${encodeURIComponent(turno)}`;
    const res = await fetch(url);
    const med = await res.json();
    sel.innerHTML = '<option value="">— Selecciona médico —</option>';
    if (med.length === 0) { sel.innerHTML = '<option value="">Sin médicos disponibles</option>'; return; }
    med.forEach(m => {
      const o = document.createElement('option');
      o.value = m.id; o.textContent = m.nombre;
      sel.appendChild(o);
    });
  } catch { showAlert('alert-step2', 'error', '⚠️ Error al cargar médicos.'); }
}

function irPaso2() {
  const dni    = document.getElementById('dni').value.trim();
  const nombre = document.getElementById('nombre').value.trim();
  if (!/^\d{8}$/.test(dni))  { showAlert('alert-step1','error','⚠️ El DNI debe tener exactamente 8 dígitos.'); return; }
  if (!nombre)                { showAlert('alert-step1','error','⚠️ Ingresa el nombre del paciente.'); return; }
  reserva.dni    = dni;
  reserva.nombre = nombre;
  hideAlert('alert-step1');
  irPaso(2);
}

function irPaso3() {
  const espVal   = document.getElementById('select-esp').value;
  const turnoVal = document.getElementById('select-turno').value;
  const medVal   = document.getElementById('select-medico').value;
  const medTxt   = document.getElementById('select-medico').options[document.getElementById('select-medico').selectedIndex]?.text;
  if (!espVal)   { showAlert('alert-step2','error','⚠️ Selecciona una especialidad.'); return; }
  if (!turnoVal) { showAlert('alert-step2','error','⚠️ Selecciona un turno.'); return; }
  if (!medVal)   { showAlert('alert-step2','error','⚠️ Selecciona un médico.'); return; }
  reserva.especialidad = espVal;
  reserva.turno        = turnoVal;
  reserva.medicoId     = Number(medVal);
  reserva.medicoNombre = medTxt;
  hideAlert('alert-step2');
  irPaso(3);
}

function irPaso4() {
  const fechaVal = document.getElementById('select-fecha').value;
  const fechaTxt = document.getElementById('select-fecha').options[document.getElementById('select-fecha').selectedIndex]?.text;
  if (!fechaVal) { showAlert('alert-step3','error','⚠️ Selecciona una fecha disponible.'); return; }
  reserva.fecha    = fechaVal;
  reserva.fechaDia = fechaTxt;
  hideAlert('alert-step3');
  document.getElementById('resumen-grid').innerHTML = `
    <div class="resumen-item"><span class="rkey">Paciente</span><span class="rval">${reserva.nombre}</span></div>
    <div class="resumen-item"><span class="rkey">DNI</span><span class="rval">${reserva.dni}</span></div>
    <div class="resumen-item"><span class="rkey">Especialidad</span><span class="rval">${reserva.especialidad}</span></div>
    <div class="resumen-item"><span class="rkey">Turno</span><span class="rval">${reserva.turno}</span></div>
    <div class="resumen-item"><span class="rkey">Médico</span><span class="rval">${reserva.medicoNombre}</span></div>
    <div class="resumen-item"><span class="rkey">Fecha</span><span class="rval">${reserva.fechaDia}</span></div>
  `;
  irPaso(4);
}

function irPaso(n) {
  [1,2,3,4].forEach(i => {
    document.getElementById('form-step'+i).style.display = (i===n) ? 'block' : 'none';
    const stepEl = document.getElementById('step'+i);
    stepEl.className = 'step' + (i<n?' done':i===n?' active':'');
  });
  document.getElementById('progress-fill').style.width = (n*25)+'%';
}

async function confirmarCita() {
  const btn = document.getElementById('btn-confirmar');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Reservando...';
  hideAlert('alert-step4');

  try {
    await obtenerConfiguracion();

    // ✅ Corregido - usa hora local
    const ahora = new Date();
    const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,'0')}-${String(ahora.getDate()).padStart(2,'0')}`;

    if (!configuracionReservas.habilitado ||
        (configuracionReservas.fechaPermitida !== null && configuracionReservas.fechaPermitida !== hoy)) {

      const fechaConfigurada = configuracionReservas.fechaPermitida ?? "la fecha configurada";
      showAlert('alert-step4', 'error', `⚠️ Hoy no se puede reservar citas. Solo se puede reservar para el <strong>${fechaConfigurada}</strong> según la configuración del administrador.`);

      btn.disabled = false;
      btn.innerHTML = '✅ Confirmar Reserva';
      return;
    }

    const res = await fetch(API + '/api/citas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni: reserva.dni, nombre: reserva.nombre, medicoId: reserva.medicoId, fecha: reserva.fecha })
    });

    const data = await res.json();

    if (!res.ok) {
      showAlert('alert-step4', 'error', '⚠️ ' + data.error);
      btn.disabled = false;
      btn.innerHTML = '✅ Confirmar Reserva';
      return;
    }

    const c = data.cita;
    document.getElementById('resumen-cita').style.display = 'none';
    const exitoEl = document.getElementById('resumen-exito');
    exitoEl.style.display = 'block';
    document.getElementById('resumen-exito-grid').innerHTML = `
      <div class="resumen-item"><span class="rkey">Paciente</span><span class="rval">${c.paciente}</span></div>
      <div class="resumen-item"><span class="rkey">DNI</span><span class="rval">${c.dni}</span></div>
      <div class="resumen-item"><span class="rkey">Doctor</span><span class="rval">${c.doctor}</span></div>
      <div class="resumen-item"><span class="rkey">Especialidad</span><span class="rval">${c.especialidad}</span></div>
      <div class="resumen-item"><span class="rkey">Fecha</span><span class="rval">${c.fecha}</span></div>
      <div class="resumen-item"><span class="rkey">Hora</span><span class="rval">${c.hora} ⏰</span></div>
      <div class="resumen-item"><span class="rkey">Turno</span><span class="rval">${c.turno}</span></div>
      <div class="resumen-item"><span class="rkey">Estado</span><span class="rval">✅ ${c.estado}</span></div>
    `;

  } catch {
    showAlert('alert-step4','error','⚠️ No se pudo conectar con el servidor.');
    btn.disabled = false;
    btn.innerHTML = '✅ Confirmar Reserva';
  }
}

function nuevaReserva() {
  document.getElementById('resumen-cita').style.display  = '';
  document.getElementById('resumen-exito').style.display = 'none';
  document.getElementById('dni').value    = '';
  document.getElementById('nombre').value = '';
  iniciarReserva();
}

// ════════════════════════════════
//  BUSCAR
// ════════════════════════════════
async function buscarCita() {
  const dni = document.getElementById('buscar-dni').value.trim();
  hideAlert('alert-buscar');
  document.getElementById('cita-encontrada').classList.remove('show');
  citaBuscada = null;
  if (!/^\d{8}$/.test(dni)) { showAlert('alert-buscar','error','⚠️ El DNI debe tener exactamente 8 dígitos.'); return; }
  const btn = document.getElementById('btn-buscar');
  btn.disabled = true; btn.textContent = 'Buscando...';
  try {
    const res  = await fetch(API + '/api/citas/' + dni);
    const data = await res.json();
    btn.disabled = false; btn.textContent = '🔍 Buscar';
    if (!res.ok) { showAlert('alert-buscar','error','🔍 ' + data.error); return; }
    citaBuscada = data;
    mostrarCitaEncontrada(data);
  } catch {
    btn.disabled = false; btn.textContent = '🔍 Buscar';
    showAlert('alert-buscar','error','⚠️ No se pudo conectar con el servidor.');
  }
}

function mostrarCitaEncontrada(c) {
  const badge = document.getElementById('badge-estado');
  badge.textContent = c.estado;
  badge.className   = 'badge ' + (c.estado==='PROGRAMADA'?'badge-green':c.estado==='REPROGRAMADA'?'badge-orange':'badge-red');
  document.getElementById('cita-detail-grid').innerHTML = `
    <div class="cita-detail-item"><span class="dkey">Paciente</span><span class="dval">${c.paciente}</span></div>
    <div class="cita-detail-item"><span class="dkey">DNI</span><span class="dval">${c.dni}</span></div>
    <div class="cita-detail-item"><span class="dkey">Doctor</span><span class="dval">${c.doctor}</span></div>
    <div class="cita-detail-item"><span class="dkey">Especialidad</span><span class="dval">${c.especialidad}</span></div>
    <div class="cita-detail-item"><span class="dkey">Turno</span><span class="dval">${c.turno}</span></div>
    <div class="cita-detail-item"><span class="dkey">Fecha</span><span class="dval">${c.fecha}</span></div>
    <div class="cita-detail-item"><span class="dkey">Hora</span><span class="dval">${c.hora}</span></div>
    <div class="cita-detail-item"><span class="dkey">Estado</span><span class="dval">${c.estado}</span></div>
  `;
  cancelarReprogram();
  document.getElementById('cita-encontrada').classList.add('show');
}

async function mostrarReprogram() {
  document.getElementById('reprogram-form').classList.add('show');
  document.getElementById('cita-acciones').style.display = 'none';
  hideAlert('alert-reprogram');
  try {
    const res  = await fetch(API + '/api/fechas');
    const dias = await res.json();
    const sel  = document.getElementById('reprogram-fecha');
    sel.innerHTML = '<option value="">— Selecciona nueva fecha —</option>';
    if (Array.isArray(dias)) {
      dias.forEach(d => {
        const o = document.createElement('option');
        o.value = d.fecha; o.textContent = `${d.dia} ${d.fecha}`;
        sel.appendChild(o);
      });
    }
  } catch { showAlert('alert-reprogram','error','⚠️ Error al cargar fechas.'); }
}

function cancelarReprogram() {
  document.getElementById('reprogram-form').classList.remove('show');
  document.getElementById('cita-acciones').style.display = '';
  hideAlert('alert-reprogram');
}

async function confirmarReprogram() {
  if (!citaBuscada) return;
  const nuevaFecha = document.getElementById('reprogram-fecha').value;
  if (!nuevaFecha) { showAlert('alert-reprogram','error','⚠️ Selecciona una nueva fecha.'); return; }
  hideAlert('alert-reprogram');
  try {
    const res = await fetch(`${API}/api/citas/${citaBuscada.dni}/reprogramar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nuevaFecha })
    });
    const data = await res.json();
    if (!res.ok) { showAlert('alert-reprogram','error','⚠️ ' + data.error); return; }
    showAlert('alert-reprogram','success',`✅ Cita reprogramada para el ${data.dia} ${data.nuevaFecha} a las ${data.nuevaHora}`);
    cancelarReprogram();
    setTimeout(() => buscarCita(), 1200);
  } catch { showAlert('alert-reprogram','error','⚠️ No se pudo conectar con el servidor.'); }
}

// ════════════════════════════════
//  CANCELAR CITA
// ════════════════════════════════
async function cancelarCita() {
  if (!citaBuscada) return;

  if (citaBuscada.estado === "CANCELADA") {
    showAlert('alert-buscar','error','⚠️ Esta cita ya está cancelada.');
    return;
  }

  const confirmar = confirm("¿Estás seguro que deseas cancelar esta cita?");
  if (!confirmar) return;

  try {
    const res = await fetch(`${API}/api/citas/${citaBuscada.dni}/cancelar`, { method: 'PUT' });
    const data = await res.json();

    if (!res.ok) {
      showAlert('alert-buscar','error','⚠️ ' + (data.error || 'Error al cancelar.'));
      return;
    }

    showAlert('alert-buscar','success','✅ Cita cancelada correctamente.');
    citaBuscada.estado = "CANCELADA";

    const badge          = document.getElementById('badge-estado');
    const btnCancelar    = document.getElementById('btn-cancelar');
    const btnReprogramar = document.getElementById('btn-reprogramar');
    const reprogramForm  = document.getElementById('reprogram-form');
    const acciones       = document.getElementById('cita-acciones');

    if (badge)          { badge.textContent = 'CANCELADA'; badge.className = 'badge badge-red'; }
    if (btnCancelar)    btnCancelar.disabled = true;
    if (btnReprogramar) btnReprogramar.disabled = true;
    if (reprogramForm)  reprogramForm.classList.remove('show');
    if (acciones)       acciones.style.display = 'none';

  } catch {
    showAlert('alert-buscar','error','⚠️ No se pudo conectar con el servidor.');
  }
}

// ════════════════════════════════
//  LISTADO
// ════════════════════════════════
async function cargarListado() {
  const fecha = document.getElementById('listado-fecha').value;
  if (!fecha) { showAlert('alert-listado','error','⚠️ Selecciona una fecha.'); return; }
  hideAlert('alert-listado');
  document.getElementById('tabla-citas-wrap').style.display = 'none';
  document.getElementById('listado-empty').style.display    = 'none';
  try {
    const res  = await fetch(`${API}/api/citas?fecha=${fecha}`);
    const data = await res.json();
    if (!res.ok) { showAlert('alert-listado','error','⚠️ ' + (data.error||'Error al cargar.')); return; }
    if (!Array.isArray(data) || data.length === 0) { document.getElementById('listado-empty').style.display = 'block'; return; }
    const tbody = document.getElementById('tabla-citas-body');
    tbody.innerHTML = '';
    data.forEach(c => {
      const cls = c.estado==='PROGRAMADA'?'badge-green':c.estado==='REPROGRAMADA'?'badge-orange':'badge-red';
      tbody.innerHTML += `<tr>
        <td><strong>${c.hora}</strong></td>
        <td>${c.paciente}</td><td>${c.dni}</td>
        <td>${c.doctor}</td><td>${c.especialidad}</td><td>${c.turno}</td>
        <td><span class="badge ${cls}">${c.estado}</span></td>
      </tr>`;
    });
    document.getElementById('tabla-citas-wrap').style.display = 'block';
  } catch { showAlert('alert-listado','error','⚠️ No se pudo conectar con el servidor.'); }
}

// ════════════════════════════════
//  HELPERS
// ════════════════════════════════
function showAlert(id, type, msg) {
  const el = document.getElementById(id);
  el.className = `alert alert-${type} show`;
  el.innerHTML = msg;
}
function hideAlert(id) {
  const el = document.getElementById(id);
  el.className = 'alert';
  el.innerHTML = '';
}

// ════════════════════════════════
//  INIT
// ════════════════════════════════
obtenerConfiguracion().then(() => cargarHome());