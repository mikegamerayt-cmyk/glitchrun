import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { guardarProgreso } from '../utils/progreso'
import { sonidoExito, sonidoError, sonidoMisionCompleta } from '../utils/sonidos'

const C = {
  cyan: '#00fff7', violet: '#a855f7', pink: '#f472b6',
  bg: '#080b18', sidebar: '#0b0f1e', card: '#0f1326',
  border: 'rgba(255,255,255,0.1)',
}

const caso = {
  titulo: 'Caso #0047 — Intruso en la Red',
  fecha: '15 de Mayo de 2025',
  victima: 'jlopez',
  descripcion: 'El sistema de alertas detectó actividad anómala en la cuenta del usuario jlopez. Tu misión: descubrir cómo entró el atacante, qué hizo y qué dejó atrás.',
}

const archivos = [
  { nombre: 'factura_mayo.exe', tamaño: '512 KB', tipo: 'Aplicación', fecha: '15/05/2025 07:43:15', sospechoso: true, info: 'Ejecutable disfrazado de factura. Firmado por entidad desconocida.' },
  { nombre: 'notas.txt', tamaño: '2 KB', tipo: 'Documento', fecha: '15/05/2025 07:40:22', sospechoso: false, info: 'Notas personales del usuario. Sin contenido malicioso.' },
  { nombre: 'imagen.png', tamaño: '128 KB', tipo: 'Imagen', fecha: '15/05/2025 07:38:11', sospechoso: false, info: 'Imagen de escritorio normal.' },
  { nombre: 'contrato.pdf', tamaño: '245 KB', tipo: 'PDF', fecha: '15/05/2025 07:37:00', sospechoso: false, info: 'Contrato corporativo legítimo.' },
  { nombre: 'payload.bin', tamaño: '512 KB', tipo: 'Binario', fecha: '15/05/2025 07:44:02', sospechoso: true, info: 'Archivo binario descargado por factura_mayo.exe. Contiene shellcode.' },
  { nombre: 'UpdaterService', tamaño: '89 KB', tipo: 'Tarea programada', fecha: '15/05/2025 07:45:10', sospechoso: true, info: 'Tarea programada maliciosa creada para persistencia. Se ejecuta al inicio.' },
]

const timeline = [
  { hora: '07:42:11', evento: 'Usuario jlopez inicia sesión desde 192.168.1.45', tipo: 'normal', icono: '👤', detalle: 'Logon exitoso desde equipo corporativo.' },
  { hora: '07:43:02', evento: 'Se abrió correo: "Actualización de Facturación"', tipo: 'sospechoso', icono: '📧', detalle: 'Correo de remitente externo: facturacion@micros0ft-update.com' },
  { hora: '07:43:15', evento: 'Se ejecutó archivo adjunto: factura_mayo.exe', tipo: 'malicioso', icono: '💀', detalle: 'El usuario hizo doble clic en el adjunto. Inicio de la cadena de ataque.' },
  { hora: '07:43:17', evento: 'Conexión saliente a 185.220.101.23:4444', tipo: 'malicioso', icono: '🔴', detalle: 'Reverse shell establecida. Puerto 4444 típico de Metasploit/netcat.' },
  { hora: '07:44:02', evento: 'Se descargó payload.bin — 512 KB', tipo: 'malicioso', icono: '⬇️', detalle: 'Segundo stage del malware descargado desde servidor C2.' },
  { hora: '07:45:10', evento: 'Creación de tarea programada "UpdaterService"', tipo: 'malicioso', icono: '⚙️', detalle: 'Mecanismo de persistencia instalado. Sobrevive reinicios.' },
  { hora: '07:47:33', evento: 'Intento de acceso a credenciales guardadas', tipo: 'malicioso', icono: '🔑', detalle: 'Ataque al Windows Credential Manager para robar contraseñas.' },
  { hora: '07:49:55', evento: 'Conexión a 185.220.101.23:80 — Exfiltración', tipo: 'malicioso', icono: '📤', detalle: '2.3 GB transferidos al servidor C2 en 47 minutos.' },
  { hora: '07:50:21', evento: 'Eliminación de logs del sistema', tipo: 'malicioso', icono: '🗑️', detalle: 'Intento de cubrir rastros usando wevtutil.exe.' },
  { hora: '07:51:04', evento: 'Cierre de sesión del usuario jlopez', tipo: 'normal', icono: '🚪', detalle: 'Sesión terminada. El atacante mantuvo acceso vía backdoor.' },
]

const trafico = [
  { src: '192.168.1.45', dst: '185.220.101.23', puerto: '4444', proto: 'TCP', tamaño: '12 KB', tipo: 'malicioso', desc: 'Shell inversa — canal de control del atacante' },
  { src: '185.220.101.23', dst: '192.168.1.45', puerto: '4444', proto: 'TCP', tamaño: '512 KB', desc: 'Descarga de payload.bin desde servidor C2', tipo: 'malicioso' },
  { src: '192.168.1.45', dst: '8.8.8.8', puerto: '53', proto: 'DNS', tamaño: '1 KB', desc: 'Consulta DNS normal a Google', tipo: 'normal' },
  { src: '192.168.1.45', dst: '185.220.101.23', puerto: '80', proto: 'HTTP', tamaño: '2.3 GB', desc: 'Exfiltración masiva de datos corporativos', tipo: 'malicioso' },
  { src: '192.168.1.45', dst: '192.168.1.1', puerto: '443', proto: 'HTTPS', tamaño: '4 KB', desc: 'Tráfico corporativo normal al gateway', tipo: 'normal' },
]

const preguntas = [
  {
    id: 0,
    pregunta: '¿Cuál fue el vector inicial del ataque?',
    opciones: [
      { id: 'a', texto: 'Exploit de vulnerabilidad en el sistema operativo', correcto: false, razon: 'No hay evidencia de exploit. El sistema no fue atacado directamente.' },
      { id: 'b', texto: 'Phishing — el usuario ejecutó un adjunto malicioso', correcto: true, razon: 'Correcto. El correo de micros0ft-update.com contenía factura_mayo.exe.' },
      { id: 'c', texto: 'Ataque de fuerza bruta a la contraseña', correcto: false, razon: 'El login fue exitoso desde el inicio — no hubo fuerza bruta.' },
      { id: 'd', texto: 'USB infectado conectado al equipo', correcto: false, razon: 'No hay registro de dispositivos USB en los logs.' },
    ],
    xp: 100,
  },
  {
    id: 1,
    pregunta: '¿A qué IP exfiltró datos el atacante y por qué puerto?',
    opciones: [
      { id: 'a', texto: '8.8.8.8 por puerto 53', correcto: false, razon: 'Esa es una consulta DNS normal a Google. No es maliciosa.' },
      { id: 'b', texto: '192.168.1.1 por puerto 443', correcto: false, razon: 'Ese es el gateway corporativo con tráfico HTTPS normal.' },
      { id: 'c', texto: '185.220.101.23 por puerto 80', correcto: true, razon: 'Correcto. 2.3 GB exfiltrados al servidor C2 usando HTTP para parecer tráfico normal.' },
      { id: 'd', texto: '185.220.101.23 por puerto 4444', correcto: false, razon: 'El puerto 4444 fue para la shell inversa de control, no la exfiltración.' },
    ],
    xp: 120,
  },
  {
    id: 2,
    pregunta: '¿Qué mecanismo usó el atacante para mantener acceso tras un reinicio?',
    opciones: [
      { id: 'a', texto: 'Creó un usuario administrador nuevo', correcto: false, razon: 'No hay registro de creación de usuarios en los logs.' },
      { id: 'b', texto: 'Modificó el registro de Windows', correcto: false, razon: 'No hay evidencia de modificación del registro en este caso.' },
      { id: 'c', texto: 'Instaló una tarea programada llamada UpdaterService', correcto: true, razon: 'Correcto. UpdaterService se ejecuta al inicio del sistema garantizando persistencia.' },
      { id: 'd', texto: 'Comprometió el bootloader del sistema', correcto: false, razon: 'Un ataque al bootloader dejaría evidencia diferente y más compleja.' },
    ],
    xp: 110,
  },
  {
    id: 3,
    pregunta: '¿Cuál es la acción MÁS urgente tras confirmar el incidente?',
    opciones: [
      { id: 'a', texto: 'Formatear el equipo inmediatamente', correcto: false, razon: 'Formatear destruye evidencia forense valiosa. Primero se preserva, luego se limpia.' },
      { id: 'b', texto: 'Cambiar la contraseña del usuario afectado', correcto: false, razon: 'Importante pero no lo más urgente — el atacante ya tiene acceso vía backdoor.' },
      { id: 'c', texto: 'Aislar el equipo de la red y bloquear las IPs del C2 en el firewall', correcto: true, razon: 'Correcto. Cortar la comunicación con el C2 neutraliza el control del atacante.' },
      { id: 'd', texto: 'Notificar al usuario afectado por correo', correcto: false, razon: 'El correo puede estar comprometido. Notificar en persona o por canal seguro.' },
    ],
    xp: 130,
  },
]

const TABS = ['EXPLORADOR', 'LÍNEA DE TIEMPO', 'TRÁFICO DE RED', 'PREGUNTAS']

export default function Mision5({ session }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [archivoSel, setArchivoSel] = useState(null)
  const [eventoSel, setEventoSel] = useState(null)
  const [traficoSel, setTraficoSel] = useState(null)
  const [preguntaIndex, setPreguntaIndex] = useState(0)
  const [respuesta, setRespuesta] = useState(null)
  const [scoreTotal, setScoreTotal] = useState(0)
  const [finished, setFinished] = useState(false)
  const [evidenciasVistas, setEvidenciasVistas] = useState(new Set())

  const evidenciasTotal = 4
  const evidenciasEncontradas = Math.min(evidenciasVistas.size, evidenciasTotal)

  function verEvidencia(tipo) {
    setEvidenciasVistas(prev => new Set([...prev, tipo]))
  }

function elegir(op) {
  if (respuesta) return
  op.correcto ? sonidoExito() : sonidoError()
  setRespuesta(op)
  setScoreTotal(prev => prev + (op.correcto ? preguntas[preguntaIndex].xp : 0))
}

  function siguiente() {
    if (preguntaIndex + 1 >= preguntas.length) {
      const total = scoreTotal + (respuesta?.correcto ? 0 : 0)
      sonidoMisionCompleta()
      guardarProgreso(5, scoreTotal)
      setFinished(true)
      return
    }
    setPreguntaIndex(i => i + 1)
    setRespuesta(null)
  }

  if (finished) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', color: '#e2e8f0' }}>
      <div style={{ background: C.sidebar, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '56px', textAlign: 'center', maxWidth: '520px', width: '100%' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
        <div style={{ fontSize: '14px', color: '#64748b', letterSpacing: '2px', marginBottom: '10px' }}>MISIÓN 5 COMPLETADA</div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: C.cyan, marginBottom: '10px' }}>
          {scoreTotal >= 400 ? '¡Investigador experto!' : scoreTotal >= 200 ? 'Buen análisis' : 'Sigue entrenando'}
        </div>
        <div style={{ fontSize: '48px', fontWeight: 900, color: '#fbbf24', marginBottom: '24px' }}>+{scoreTotal} XP</div>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/')} style={{ padding: '14px 28px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: '#94a3b8', fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit' }}>Volver al Hub</button>
          <button onClick={() => navigate('/mision/6')} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Siguiente misión →</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', fontSize: '15px', display: 'flex', flexDirection: 'column' }}>

      {/* TOPBAR */}
      <header style={{ height: '64px', background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '22px' }}>←</button>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '2px' }}>MÓDULO 5 · ANÁLISIS FORENSE</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: C.cyan }}>Misión 5 — {caso.titulo}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Evidencias: <span style={{ color: evidenciasEncontradas >= evidenciasTotal ? '#4ade80' : C.cyan, fontWeight: 700 }}>{evidenciasEncontradas}/{evidenciasTotal}</span>
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#fbbf24' }}>⚡ {scoreTotal} XP</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 280px', flex: 1, overflow: 'hidden' }}>

        {/* PANEL IZQUIERDO */}
        <div style={{ background: C.sidebar, borderRight: `1px solid ${C.border}`, overflowY: 'auto', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#f87171', fontWeight: 700, letterSpacing: '2px', marginBottom: '12px' }}>🔍 CASO ACTIVO</div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>{caso.titulo}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>📅 {caso.fecha}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>{caso.descripcion}</div>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b', letterSpacing: '1px', marginBottom: '10px' }}>VÍCTIMA</div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${C.violet}33`, border: `2px solid ${C.violet}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👤</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{caso.victima}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Usuario corporativo</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b', letterSpacing: '1px', marginBottom: '10px' }}>HERRAMIENTAS FORENSES</div>
          {[
            { nombre: 'Autopsy', desc: 'Análisis de disco', icono: '💾', activa: true },
            { nombre: 'Wireshark', desc: 'Análisis de tráfico', icono: '📡', activa: true },
            { nombre: 'Volatility', desc: 'Análisis de memoria', icono: '🧠', activa: false },
            { nombre: 'VirusTotal', desc: 'Análisis de malware', icono: '🦠', activa: true },
          ].map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: h.activa ? `${C.cyan}08` : 'rgba(255,255,255,0.02)', border: `1px solid ${h.activa ? C.cyan + '33' : C.border}`, marginBottom: '6px', opacity: h.activa ? 1 : 0.4 }}>
              <span style={{ fontSize: '18px' }}>{h.icono}</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: h.activa ? C.cyan : '#64748b' }}>{h.nombre}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{h.desc}</div>
              </div>
              {h.activa && <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#4ade80' }}>ACTIVA</span>}
            </div>
          ))}
        </div>

        {/* CENTRO */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: `1px solid ${C.border}` }}>

          {/* TABS */}
          <div style={{ display: 'flex', background: C.card, borderBottom: `1px solid ${C.border}` }}>
            {TABS.map((t, i) => (
              <button key={i} onClick={() => { setTab(i); if (i === 0) verEvidencia('explorador'); if (i === 1) verEvidencia('timeline'); if (i === 2) verEvidencia('trafico') }}
                style={{ padding: '14px 20px', border: 'none', borderBottom: tab === i ? `2px solid ${C.cyan}` : '2px solid transparent', background: 'transparent', color: tab === i ? C.cyan : '#64748b', fontSize: '13px', fontWeight: tab === i ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '1px' }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

            {/* TAB 0: EXPLORADOR */}
            {tab === 0 && (
              <div>
                <div style={{ fontSize: '13px', color: C.cyan, letterSpacing: '2px', marginBottom: '16px', fontWeight: 700 }}>📁 C:\Users\jlopez\Downloads</div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 16px', borderBottom: `1px solid ${C.border}`, fontSize: '11px', color: '#64748b', letterSpacing: '1px' }}>
                    <span>NOMBRE</span><span>TAMAÑO</span><span>TIPO</span><span>MODIFICADO</span>
                  </div>
                  {archivos.map((a, i) => (
                    <div key={i} onClick={() => { setArchivoSel(a); verEvidencia('archivo_' + i) }}
                      style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', background: archivoSel?.nombre === a.nombre ? `${C.cyan}08` : 'transparent', borderLeft: `3px solid ${a.sospechoso ? '#f87171' : 'transparent'}` }}>
                      <span style={{ fontSize: '13px', color: a.sospechoso ? '#f87171' : '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{a.sospechoso ? '🔴' : '📄'}</span> {a.nombre}
                      </span>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>{a.tamaño}</span>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>{a.tipo}</span>
                      <span style={{ fontSize: '13px', color: a.sospechoso ? '#f87171' : '#64748b' }}>{a.fecha.split(' ')[1]}</span>
                    </div>
                  ))}
                </div>
                {archivoSel && (
                  <div style={{ background: archivoSel.sospechoso ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.06)', border: `1px solid ${archivoSel.sospechoso ? '#f8717133' : '#4ade8033'}`, borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: archivoSel.sospechoso ? '#f87171' : '#4ade80' }}>
                        {archivoSel.sospechoso ? '⚠ ARCHIVO SOSPECHOSO' : '✅ ARCHIVO NORMAL'}
                      </div>
                      <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: archivoSel.sospechoso ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)', color: archivoSel.sospechoso ? '#f87171' : '#4ade80', fontWeight: 700 }}>
                        {archivoSel.sospechoso ? 'MALICIOSO' : 'LIMPIO'}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.7' }}>{archivoSel.info}</div>
                    <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Tamaño: <span style={{ color: '#e2e8f0' }}>{archivoSel.tamaño}</span></div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Tipo: <span style={{ color: '#e2e8f0' }}>{archivoSel.tipo}</span></div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Fecha: <span style={{ color: '#e2e8f0' }}>{archivoSel.fecha}</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: LÍNEA DE TIEMPO */}
            {tab === 1 && (
              <div>
                <div style={{ fontSize: '13px', color: C.cyan, letterSpacing: '2px', marginBottom: '20px', fontWeight: 700 }}>📅 LÍNEA DE TIEMPO — {caso.fecha}</div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.08)' }} />
                  {timeline.map((ev, i) => (
                    <div key={i} onClick={() => setEventoSel(eventoSel?.hora === ev.hora ? null : ev)}
                      style={{ display: 'flex', gap: '16px', marginBottom: '12px', cursor: 'pointer', paddingLeft: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: ev.tipo === 'malicioso' ? '#f87171' : ev.tipo === 'sospechoso' ? '#fbbf24' : '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, zIndex: 1, marginTop: '4px' }}>
                        {ev.icono}
                      </div>
                      <div style={{ flex: 1, background: eventoSel?.hora === ev.hora ? `${ev.tipo === 'malicioso' ? '#f87171' : ev.tipo === 'sospechoso' ? '#fbbf24' : '#4ade80'}11` : C.card, border: `1px solid ${ev.tipo === 'malicioso' ? '#f8717133' : ev.tipo === 'sospechoso' ? '#fbbf2433' : '#4ade8033'}`, borderRadius: '10px', padding: '12px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: eventoSel?.hora === ev.hora ? '8px' : '0' }}>
                          <span style={{ fontSize: '14px', color: ev.tipo === 'malicioso' ? '#f87171' : ev.tipo === 'sospechoso' ? '#fbbf24' : '#4ade80', fontWeight: 600 }}>{ev.evento}</span>
                          <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace', flexShrink: 0, marginLeft: '12px' }}>{ev.hora}</span>
                        </div>
                        {eventoSel?.hora === ev.hora && (
                          <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>{ev.detalle}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: TRÁFICO */}
            {tab === 2 && (
              <div>
                <div style={{ fontSize: '13px', color: C.cyan, letterSpacing: '2px', marginBottom: '16px', fontWeight: 700 }}>📡 CAPTURA DE TRÁFICO DE RED</div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 80px 80px 100px', padding: '10px 16px', borderBottom: `1px solid ${C.border}`, fontSize: '11px', color: '#64748b', letterSpacing: '1px' }}>
                    <span>ORIGEN</span><span>DESTINO</span><span>PUERTO</span><span>PROTO</span><span>TAMAÑO</span>
                  </div>
                  {trafico.map((t, i) => (
                    <div key={i} onClick={() => setTraficoSel(traficoSel?.src === t.src && traficoSel?.puerto === t.puerto ? null : t)}
                      style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 80px 80px 100px', padding: '12px 16px', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', background: traficoSel?.src === t.src && traficoSel?.puerto === t.puerto ? `${t.tipo === 'malicioso' ? '#f87171' : '#4ade80'}11` : 'transparent', borderLeft: `3px solid ${t.tipo === 'malicioso' ? '#f87171' : '#4ade80'}` }}>
                      <span style={{ fontSize: '12px', color: '#e2e8f0', fontFamily: 'monospace' }}>{t.src}</span>
                      <span style={{ fontSize: '12px', color: '#e2e8f0', fontFamily: 'monospace' }}>{t.dst}</span>
                      <span style={{ fontSize: '12px', color: t.tipo === 'malicioso' ? '#f87171' : '#64748b', fontFamily: 'monospace' }}>{t.puerto}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{t.proto}</span>
                      <span style={{ fontSize: '12px', color: t.tipo === 'malicioso' ? '#f87171' : '#64748b', fontWeight: t.tipo === 'malicioso' ? 700 : 400 }}>{t.tamaño}</span>
                    </div>
                  ))}
                </div>
                {traficoSel && (
                  <div style={{ background: traficoSel.tipo === 'malicioso' ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.06)', border: `1px solid ${traficoSel.tipo === 'malicioso' ? '#f8717133' : '#4ade8033'}`, borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: traficoSel.tipo === 'malicioso' ? '#f87171' : '#4ade80', marginBottom: '8px' }}>
                      {traficoSel.tipo === 'malicioso' ? '⚠ TRÁFICO MALICIOSO' : '✅ TRÁFICO NORMAL'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>{traficoSel.desc}</div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PREGUNTAS */}
            {tab === 3 && (
              <div>
                <div style={{ fontSize: '13px', color: C.cyan, letterSpacing: '2px', marginBottom: '8px', fontWeight: 700 }}>❓ PREGUNTAS DE INVESTIGACIÓN</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                  Pregunta {preguntaIndex + 1} de {preguntas.length} · Usa las evidencias de las otras pestañas para responder
                </div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'white', lineHeight: '1.6' }}>{preguntas[preguntaIndex].pregunta}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {preguntas[preguntaIndex].opciones.map(op => (
                    <div key={op.id} onClick={() => elegir(op)}
                      style={{ padding: '16px 20px', borderRadius: '12px', border: `2px solid ${respuesta ? (op.correcto ? '#4ade80' : '#f87171') : C.border}`, background: respuesta ? (op.correcto ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.04)') : C.card, cursor: respuesta ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: respuesta ? '8px' : '0' }}>
                        <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{op.texto}</span>
                        {respuesta && <span style={{ fontSize: '18px', flexShrink: 0 }}>{op.correcto ? '✅' : '❌'}</span>}
                      </div>
                      {respuesta && <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>{op.razon}</div>}
                    </div>
                  ))}
                </div>
                {respuesta && (
                  <div>
                    <div style={{ background: respuesta.correcto ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${respuesta.correcto ? '#4ade8044' : '#f8717144'}`, borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: respuesta.correcto ? '#4ade80' : '#f87171' }}>
                        {respuesta.correcto ? `✅ +${preguntas[preguntaIndex].xp} XP` : '❌ Incorrecto — revisa las evidencias'}
                      </div>
                    </div>
                    <button onClick={siguiente} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {preguntaIndex + 1 >= preguntas.length ? 'Cerrar caso →' : 'Siguiente pregunta →'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div style={{ background: C.sidebar, overflowY: 'auto', padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: C.cyan, letterSpacing: '2px', marginBottom: '16px' }}>🎯 OBJETIVO</div>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.7', marginBottom: '20px' }}>
            Investiga el incidente y responde las preguntas para descubrir la verdad.
          </p>

          <div style={{ fontSize: '12px', color: '#64748b', letterSpacing: '1px', marginBottom: '12px' }}>PROGRESO DE INVESTIGACIÓN</div>
          {[
            { label: 'Explorar archivos', done: evidenciasVistas.has('explorador') },
            { label: 'Analizar línea de tiempo', done: evidenciasVistas.has('timeline') },
            { label: 'Revisar tráfico de red', done: evidenciasVistas.has('trafico') },
            { label: 'Responder preguntas', done: tab === 3 },
          ].map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px' }}>{p.done ? '✅' : '⬜'}</span>
              <span style={{ fontSize: '13px', color: p.done ? '#4ade80' : '#64748b' }}>{p.label}</span>
            </div>
          ))}

          <div style={{ margin: '20px 0', height: '1px', background: C.border }} />

          <div style={{ fontSize: '12px', color: '#64748b', letterSpacing: '1px', marginBottom: '12px' }}>EVIDENCIAS CLAVE</div>
          {[
            { nombre: 'Archivo malicioso', encontrada: evidenciasVistas.size > 0, desc: 'factura_mayo.exe' },
            { nombre: 'Conexión C2', encontrada: evidenciasVistas.has('trafico'), desc: '185.220.101.23:4444' },
            { nombre: 'Persistencia', encontrada: evidenciasVistas.has('timeline'), desc: 'UpdaterService' },
            { nombre: 'Exfiltración', encontrada: evidenciasVistas.has('trafico'), desc: '2.3 GB robados' },
          ].map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: e.encontrada ? 'rgba(74,222,128,0.06)' : C.card, border: `1px solid ${e.encontrada ? '#4ade8033' : C.border}`, borderRadius: '8px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: e.encontrada ? '#4ade80' : '#64748b' }}>{e.nombre}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{e.desc}</div>
              </div>
              <span style={{ fontSize: '11px', color: e.encontrada ? '#4ade80' : '#64748b', fontWeight: 700 }}>{e.encontrada ? 'Encontrada' : 'Pendiente'}</span>
            </div>
          ))}

          <div style={{ margin: '20px 0', height: '1px', background: C.border }} />

          <div style={{ fontSize: '12px', color: '#64748b', letterSpacing: '1px', marginBottom: '12px' }}>RECOMPENSA</div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#fbbf24' }}>+460 XP</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>si aciertas todo</div>
          </div>

          {evidenciasEncontradas >= 3 && tab !== 3 && (
            <button onClick={() => setTab(3)} style={{ width: '100%', marginTop: '16px', padding: '14px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              ¡Ir a las preguntas! →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}