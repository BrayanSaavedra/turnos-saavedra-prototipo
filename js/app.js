/* Turnos Saavedra · prototipo funcional
   HTML + CSS + JavaScript puro. Los datos se guardan en el navegador (localStorage),
   así que no necesita servidor ni base de datos: sirve para probar el flujo completo.
   Todos los datos que aparecen al inicio son ficticios (datos de ejemplo). */

/* ------------------------------------------------------------------ */
/* Store: datos y reglas del negocio                                   */
/* ------------------------------------------------------------------ */
const Store = (() => {
  const KEY = 'turnosSaavedra_v2'; // v2: los turnos ahora tienen lavador

  const SERVICIOS = [
    { id: 's1', nombre: 'Lavado sencillo (carro)', precio: 20000 },
    { id: 's2', nombre: 'Lavado completo (carro)', precio: 35000 },
    { id: 's3', nombre: 'Lavado + brillado', precio: 50000 },
    { id: 's4', nombre: 'Lavado de moto', precio: 12000 },
  ];

  // Lavadores del negocio. Cambie esta lista para ajustar cuántos hay (nombres de ejemplo).
  const LAVADORES = [
    { id: 'l1', nombre: 'Lavador 1' }, { id: 'l2', nombre: 'Lavador 2' }, { id: 'l3', nombre: 'Lavador 3' },
    { id: 'l4', nombre: 'Lavador 4' }, { id: 'l5', nombre: 'Lavador 5' }, { id: 'l6', nombre: 'Lavador 6' },
  ];

  function pad(n) { return String(n).padStart(2, '0'); }

  // Franjas de 30 minutos entre 8:00 a. m. y 5:30 p. m.
  const HORAS = [];
  for (let h = 8; h < 18; h++) { HORAS.push(pad(h) + ':00'); HORAS.push(pad(h) + ':30'); }

  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function hoy() { return iso(new Date()); }
  function sumarDias(fechaISO, n) {
    const d = new Date(fechaISO + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return iso(d);
  }

  // Si el navegador bloquea localStorage (modo privado), se trabaja en memoria.
  let enMemoria = null;
  function leer() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function escribir(txt) { try { localStorage.setItem(KEY, txt); } catch (e) { /* solo memoria */ } }

  function sembrar() {
    const clientes = [
      { id: 'c1', nombre: 'Carlos Ramírez', telefono: '3101234567', placa: 'ABC123' },
      { id: 'c2', nombre: 'Marcela Gómez', telefono: '3157654321', placa: 'KLM456' },
      { id: 'c3', nombre: 'Julián Torres', telefono: '3209876543', placa: 'XYZ789' },
      { id: 'c4', nombre: 'Andrea Pineda', telefono: '3004561234', placa: 'DEF321' },
      { id: 'c5', nombre: 'Luis Cárdenas', telefono: '3123217654', placa: 'MNP654' },
      { id: 'c6', nombre: 'Sandra Moreno', telefono: '3186549870', placa: 'QRS987' },
    ];
    const turnos = [];
    const pagos = [];
    let semilla = 7;
    const azar = () => { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; };
    let idT = 1, idP = 1, deudas = 0;
    const hoyISO = hoy();

    // Días anteriores: servicios ya terminados y casi todos pagados.
    for (let atras = 30; atras >= 1; atras--) {
      const fecha = sumarDias(hoyISO, -atras);
      const cantidad = 2 + Math.floor(azar() * 4);
      const usadas = new Set();
      while (usadas.size < cantidad) usadas.add(Math.floor(azar() * HORAS.length));
      [...usadas].sort((a, b) => a - b).forEach(i => {
        const cli = clientes[Math.floor(azar() * clientes.length)];
        const ser = SERVICIOS[Math.floor(azar() * SERVICIOS.length)];
        const lav = LAVADORES[Math.floor(azar() * LAVADORES.length)];
        const turno = { id: 't' + idT++, clienteId: cli.id, servicioId: ser.id, lavadorId: lav.id, fecha, hora: HORAS[i], estado: 'terminado' };
        turnos.push(turno);
        let monto = ser.precio;
        if (deudas < 3 && atras % 7 === 3 && azar() > 0.5) { monto = Math.round(ser.precio / 2); deudas++; }
        pagos.push({ id: 'p' + idP++, turnoId: turno.id, monto, metodo: azar() < 0.6 ? 'efectivo' : 'transferencia', fecha });
      });
    }

    // Hoy: una agenda de ejemplo con distintos estados.
    const dia = [
      ['08:00', 'c1', 's2', 'terminado', true, 'efectivo', 'l1'],
      ['08:00', 'c6', 's1', 'terminado', true, 'transferencia', 'l2'], // mismo horario, otro lavador
      ['09:30', 'c2', 's1', 'terminado', true, 'transferencia', 'l1'],
      ['11:00', 'c3', 's3', 'en_proceso', false, null, 'l3'],
      ['14:00', 'c4', 's2', 'pendiente', false, null, 'l2'],
      ['15:30', 'c5', 's4', 'pendiente', false, null, 'l4'],
    ];
    dia.forEach(([hora, cid, sid, estado, paga, metodo, lid]) => {
      const ser = SERVICIOS.find(s => s.id === sid);
      const t = { id: 't' + idT++, clienteId: cid, servicioId: sid, lavadorId: lid, fecha: hoyISO, hora, estado };
      turnos.push(t);
      if (paga) pagos.push({ id: 'p' + idP++, turnoId: t.id, monto: ser.precio, metodo, fecha: hoyISO });
    });

    return { clientes, turnos, pagos, contador: { t: idT, p: idP, c: 7 } };
  }

  let datos = null;
  function cargar() {
    if (datos) return datos;
    const txt = enMemoria || leer();
    if (txt) {
      try { datos = JSON.parse(txt); return datos; } catch (e) { /* datos dañados: se regeneran */ }
    }
    datos = sembrar();
    guardar();
    return datos;
  }
  function guardar() {
    const txt = JSON.stringify(datos);
    enMemoria = txt;
    escribir(txt);
  }
  function restablecer() { datos = sembrar(); guardar(); }

  /* ---------- Consultas ---------- */
  const servicios = () => SERVICIOS;
  const horas = () => HORAS;
  const clientes = () => cargar().clientes;
  const cliente = id => cargar().clientes.find(c => c.id === id);
  const servicio = id => SERVICIOS.find(s => s.id === id);
  const turno = id => cargar().turnos.find(t => t.id === id);

  function turnosDelDia(fecha) {
    return cargar().turnos
      .filter(t => t.fecha === fecha)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }
  function pagosDe(turnoId) { return cargar().pagos.filter(p => p.turnoId === turnoId); }
  function precioDe(t) { return servicio(t.servicioId).precio; }
  function pagadoDe(t) { return pagosDe(t.id).reduce((s, p) => s + p.monto, 0); }
  function saldoDe(t) { return t.estado === 'cancelado' ? 0 : Math.max(0, precioDe(t) - pagadoDe(t)); }

  // Regla clave (criterio de aceptación de la Act. 2): ningún lavador puede tener dos servicios a la misma hora.
  // Una franja solo queda ocupada cuando TODOS los lavadores ya tienen un turno en ella.
  const lavadores = () => LAVADORES;
  const lavador = id => LAVADORES.find(l => l.id === id);
  function lavadoresLibres(fecha, hora) {
    const ocupados = new Set(cargar().turnos
      .filter(t => t.fecha === fecha && t.hora === hora && t.estado !== 'cancelado')
      .map(t => t.lavadorId));
    return LAVADORES.filter(l => !ocupados.has(l.id));
  }
  const cuposLibres = (fecha, hora) => lavadoresLibres(fecha, hora).length;
  const lavadorLibre = (fecha, hora, lavadorId) => lavadoresLibres(fecha, hora).some(l => l.id === lavadorId);
  const horaOcupada = (fecha, hora) => cuposLibres(fecha, hora) === 0;

  // Si no se elige lavador, se asigna el libre que lleva menos turnos ese día.
  function elegirLavador(fecha, hora) {
    const carga = id => cargar().turnos.filter(t => t.fecha === fecha && t.lavadorId === id && t.estado !== 'cancelado').length;
    return lavadoresLibres(fecha, hora).sort((a, b) => carga(a.id) - carga(b.id))[0] || null;
  }

  /* ---------- Acciones ---------- */
  function agregarCliente({ nombre, telefono, placa, autoriza }) {
    nombre = (nombre || '').trim();
    telefono = (telefono || '').replace(/\s+/g, '');
    placa = (placa || '').trim().toUpperCase();
    if (nombre && nombre.length < 3) return { ok: false, error: 'Si escribe el nombre, debe tener al menos 3 letras (o déjelo vacío).' };
    if (!/^3\d{9}$/.test(telefono)) return { ok: false, error: 'El celular debe tener 10 dígitos y empezar por 3.' };
    if (!/^[A-Z]{3}\d{2}[A-Z0-9]$/.test(placa)) return { ok: false, error: 'La placa debe tener el formato ABC123 (o ABC12D para moto).' };
    if (!autoriza) return { ok: false, error: 'Se necesita la autorización de tratamiento de datos (Ley 1581 de 2012).' };
    const d = cargar();
    if (d.clientes.some(c => c.placa === placa)) return { ok: false, error: 'Ya existe un cliente con esa placa.' };
    if (!nombre) nombre = 'Cliente ' + placa; // registro rápido: el nombre es opcional
    const nuevo = { id: 'c' + d.contador.c++, nombre, telefono, placa };
    d.clientes.push(nuevo);
    guardar();
    return { ok: true, cliente: nuevo };
  }

  function agregarTurno({ clienteId, servicioId, fecha, hora, lavadorId }) {
    if (!clienteId) return { ok: false, error: 'Elija un cliente.' };
    if (!servicioId) return { ok: false, error: 'Elija un servicio.' };
    if (!fecha) return { ok: false, error: 'Elija la fecha.' };
    if (fecha < hoy()) return { ok: false, error: 'No se pueden agendar turnos en fechas pasadas.' };
    if (!hora) return { ok: false, error: 'Elija una hora disponible.' };
    if (lavadorId) {
      if (!lavador(lavadorId)) return { ok: false, error: 'Ese lavador no existe.' };
      if (!lavadorLibre(fecha, hora, lavadorId)) return { ok: false, error: lavador(lavadorId).nombre + ' ya tiene un turno a esa hora. Elija otra hora u otro lavador.' };
    } else {
      const elegido = elegirLavador(fecha, hora);
      if (!elegido) return { ok: false, error: 'Ya no quedan lavadores libres a esa hora. Elija otra franja.' };
      lavadorId = elegido.id;
    }
    const d = cargar();
    const nuevo = { id: 't' + d.contador.t++, clienteId, servicioId, lavadorId, fecha, hora, estado: 'pendiente' };
    d.turnos.push(nuevo);
    guardar();
    return { ok: true, turno: nuevo };
  }

  function cambiarEstado(id, estado) { const t = turno(id); if (t) { t.estado = estado; guardar(); } }

  function agregarPago({ turnoId, monto, metodo }) {
    const t = turno(turnoId);
    monto = Math.round(Number(monto));
    if (!t) return { ok: false, error: 'Elija el turno que va a cobrar.' };
    if (!(monto > 0)) return { ok: false, error: 'Escriba un valor mayor que cero.' };
    if (monto > saldoDe(t)) return { ok: false, error: 'El valor supera lo que el cliente debe.' };
    if (metodo !== 'efectivo' && metodo !== 'transferencia') return { ok: false, error: 'Elija efectivo o transferencia.' };
    const d = cargar();
    d.pagos.push({ id: 'p' + d.contador.p++, turnoId, monto, metodo, fecha: hoy() });
    guardar();
    return { ok: true };
  }

  // Ingresos entre dos fechas (incluidas): lo cobrado, servicios terminados y lo que falta por cobrar.
  function ingresos(desde, hasta) {
    const d = cargar();
    const pagos = d.pagos.filter(p => p.fecha >= desde && p.fecha <= hasta);
    const efectivo = pagos.filter(p => p.metodo === 'efectivo').reduce((s, p) => s + p.monto, 0);
    const transferencia = pagos.filter(p => p.metodo === 'transferencia').reduce((s, p) => s + p.monto, 0);
    const delPeriodo = d.turnos.filter(t => t.fecha >= desde && t.fecha <= hasta);
    const servicios = delPeriodo.filter(t => t.estado === 'terminado').length;
    const porCobrar = delPeriodo.reduce((s, t) => s + saldoDe(t), 0);
    return { total: efectivo + transferencia, efectivo, transferencia, servicios, porCobrar };
  }
  function ingresoDelDia(fecha) { return ingresos(fecha, fecha).total; }

  return {
    hoy, sumarDias, servicios, horas, clientes, cliente, servicio, turno,
    turnosDelDia, pagosDe, precioDe, pagadoDe, saldoDe, horaOcupada,
    lavadores, lavador, lavadoresLibres, cuposLibres, lavadorLibre,
    agregarCliente, agregarTurno, cambiarEstado, agregarPago,
    ingresos, ingresoDelDia, restablecer,
  };
})();

/* ------------------------------------------------------------------ */
/* UI: utilidades de pantalla                                          */
/* ------------------------------------------------------------------ */
const UI = (() => {
  const dinero = n => '$' + Number(n).toLocaleString('es-CO');

  function fecha(iso) {
    const txt = new Date(iso + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    return txt.charAt(0).toUpperCase() + txt.slice(1); // solo la primera letra en mayúscula
  }
  function fechaCorta(iso) {
    return new Date(iso + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  }
  function hora12(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return ((h + 11) % 12 + 1) + ':' + String(m).padStart(2, '0') + (h < 12 ? ' a. m.' : ' p. m.');
  }
  // Evita que un texto escrito por el usuario se interprete como código HTML.
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const MENU = [
    ['agenda', 'index.html', 'Agenda'],
    ['nuevo', 'nuevo.html', 'Nuevo'],
    ['clientes', 'clientes.html', 'Clientes'],
    ['pagos', 'pagos.html', 'Pagos'],
    ['ingresos', 'ingresos.html', 'Ingresos'],
  ];

  // Barra superior y menú inferior con componentes de Bootstrap 5
  const LOGO = '<svg width="36" height="36" viewBox="0 0 34 34" aria-hidden="true" class="flex-shrink-0">' +
    '<rect width="34" height="34" rx="8" fill="#0d6efd"/>' +
    '<path d="M17 6C17 6 8 15 8 21a9 9 0 0 0 18 0C26 15 17 6 17 6z" fill="#fff"/>' +
    '<path d="M13 21l3 3 5-6" stroke="#0d6efd" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function pantalla(activa, titulo, subtitulo) {
    document.getElementById('header').innerHTML =
      '<div class="container d-flex flex-nowrap align-items-center gap-2" style="max-width:560px">' + LOGO +
        '<div class="flex-grow-1" style="min-width:0">' +
          '<span class="navbar-brand mb-0 h1">' + esc(titulo) + '</span>' +
          (subtitulo ? '<span class="navbar-text small d-block">' + esc(subtitulo) + '</span>' : '') +
        '</div>' +
        '<button type="button" class="btn btn-outline-light btn-sm rounded-circle flex-shrink-0" id="btn-ayuda" aria-label="Ayuda: cómo usar la aplicación" style="width:34px;height:34px">?</button>' +
      '</div>';
    document.getElementById('nav').innerHTML =
      '<div class="container" style="max-width:560px"><ul class="nav nav-pills nav-fill w-100">' +
      MENU.map(([clave, href, texto]) =>
        '<li class="nav-item"><a class="nav-link py-2 px-1' + (clave === activa ? ' active' : '') + '" href="' + href + '"' +
        (clave === activa ? ' aria-current="page"' : '') + '>' + texto + '</a></li>').join('') +
      '</ul></div>';
    document.getElementById('btn-ayuda').addEventListener('click', ayuda);
    guiaPrimeraVez();
  }

  // ---------- Ventanas (modales de Bootstrap) ----------
  // Cada ventana es un elemento nuevo que se elimina al cerrarse (evita reutilizar un modal viejo).
  function ventana(id, cuerpoHTML) {
    const el = document.createElement('div');
    el.id = id + '-' + Date.now();
    el.className = 'modal fade';
    el.tabIndex = -1;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="modal-dialog modal-dialog-centered"><div class="modal-content">' + cuerpoHTML + '</div></div>';
    document.body.appendChild(el);
    el.addEventListener('hidden.bs.modal', () => {
      const instancia = bootstrap.Modal.getInstance(el);
      if (instancia) instancia.dispose();
      el.remove();
    });
    return el;
  }

  // Ventana de confirmación (mensaje de confirmación antes de una acción importante).
  function confirmar(titulo, mensaje, textoOk, claseOk) {
    return new Promise(resolver => {
      const el = ventana('modal-confirmar',
        '<div class="modal-header"><h5 class="modal-title">' + esc(titulo) + '</h5>' +
        '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button></div>' +
        '<div class="modal-body">' + esc(mensaje) + '</div>' +
        '<div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">No, volver</button>' +
        '<button type="button" class="btn ' + (claseOk || 'btn-primary') + '" id="modal-confirmar-ok">' + esc(textoOk || 'Sí, continuar') + '</button></div>');
      const m = bootstrap.Modal.getOrCreateInstance(el);
      let acepto = false;
      el.querySelector('#modal-confirmar-ok').addEventListener('click', () => { acepto = true; m.hide(); });
      el.addEventListener('hidden.bs.modal', () => resolver(acepto), { once: true });
      m.show();
    });
  }

  // Guía de uso (recomendación 2 de la evaluación: ayuda en el primer uso).
  function ayuda() {
    const el = ventana('modal-ayuda',
      '<div class="modal-header"><h5 class="modal-title">Cómo usar Turnos Saavedra</h5>' +
      '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button></div>' +
      '<div class="modal-body"><ol class="mb-2">' +
      '<li><strong>Agenda:</strong> vea los turnos del día. Inicie y termine cada lavado con los botones de la tarjeta.</li>' +
      '<li><strong>Nuevo:</strong> elija cliente, servicio, fecha y hora; si quiere, también el lavador. Cada lavador atiende un servicio a la vez: la hora aparece tachada cuando ya no queda ninguno libre.</li>' +
      '<li><strong>Clientes:</strong> registre a un cliente con placa y celular. El nombre es opcional.</li>' +
      '<li><strong>Pagos:</strong> cobre en efectivo o transferencia. Puede registrar abonos.</li>' +
      '<li><strong>Ingresos:</strong> vea lo cobrado por día, semana o mes.</li></ol>' +
      '<p class="text-muted small mb-0">Es un prototipo: los datos son de ejemplo y se guardan solo en este navegador. El botón ? abre esta guía en cualquier momento.</p></div>' +
      '<div class="modal-footer"><button type="button" class="btn btn-primary" data-bs-dismiss="modal">Entendido</button></div>');
    bootstrap.Modal.getOrCreateInstance(el).show();
  }

  function guiaPrimeraVez() {
    let vista = false;
    try {
      vista = localStorage.getItem('turnosSaavedra_guia') === '1';
      localStorage.setItem('turnosSaavedra_guia', '1');
    } catch (e) { vista = true; }
    if (!vista) setTimeout(ayuda, 400);
  }

  let temporizador;
  function aviso(texto, tipo) {
    const el = document.getElementById('toast');
    el.className = 'toast show align-items-center border-0 text-bg-' + (tipo === 'error' ? 'danger' : 'dark');
    el.innerHTML = '<div class="toast-body">' + esc(texto) + '</div>';
    clearTimeout(temporizador);
    temporizador = setTimeout(() => { el.className = 'toast'; }, 2800);
  }

  function param(nombre) { return new URLSearchParams(location.search).get(nombre); }

  return { dinero, fecha, fechaCorta, hora12, esc, pantalla, aviso, param, confirmar, ayuda };
})();
