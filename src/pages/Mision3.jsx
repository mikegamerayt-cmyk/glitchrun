import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { guardarProgreso } from '../utils/progreso'
import { sonidoExito, sonidoError, sonidoMisionCompleta } from '../utils/sonidos'

const C = {
  cyan: '#00fff7', violet: '#a855f7', pink: '#f472b6',
  bg: '#080b18', sidebar: '#0b0f1e', card: '#0f1326',
  border: 'rgba(255,255,255,0.1)',
}

const retos = [
  {
    id: 0,
    tipo: 'identificar_archivo',
    titulo: 'Bandeja de descargas infectada',
    descripcion: 'Revisas tu carpeta de descargas y encuentras estos archivos. Identifica cuáles son sospechosos.',
    archivos: [
      { id: 'a', nombre: 'factura_enero.pdf', icono: '📄', sospechoso: false, razon: 'Archivo PDF normal. Los PDFs pueden contener macros maliciosas pero este nombre es genérico y esperado.' },
      { id: 'b', nombre: 'crack_office365.exe', icono: '⚙️', sospechoso: true, razon: 'Cracks y keygens son vectores clásicos de malware. Nunca descargues software pirata.' },
      { id: 'c', nombre: 'foto_vacaciones.jpg.exe', icono: '🖼️', sospechoso: true, razon: 'Doble extensión .jpg.exe — parece imagen pero es ejecutable. Táctica clásica de malware.' },
      { id: 'd', nombre: 'informe_q3_2025.xlsx', icono: '📊', sospechoso: false, razon: 'Archivo Excel normal. Solo sospechoso si habilitas macros sin verificar la fuente.' },
      { id: 'e', nombre: 'actualizacion_windows.exe', icono: '💻', sospechoso: true, razon: 'Windows nunca se actualiza desde archivos descargados. Siempre usa Windows Update oficial.' },
      { id: 'f', nombre: 'contrato_firmado.docm', icono: '📝', sospechoso: true, razon: '.docm es Word con macros habilitadas. Las macros maliciosas son un vector de ataque muy común.' },
    ],
    xp: 120,
  },
  {
    id: 1,
    tipo: 'escaneo',
    titulo: 'Analiza el reporte del antivirus',
    descripcion: 'El antivirus escaneó el sistema y generó este reporte. Decide qué hacer con cada amenaza detectada.',
    amenazas: [
      {
        id: 0,
        nombre: 'Trojan.GenericKD.47291837',
        ruta: 'C:\\Users\\Agente\\Downloads\\crack_office365.exe',
        nivel: 'CRÍTICO',
        acciones: [
          { id: 'eliminar', texto: 'Eliminar el archivo inmediatamente', correcto: true, xp: 80, razon: 'Correcto. Un troyano debe eliminarse de inmediato. No lo abras ni lo muevas.' },
          { id: 'cuarentena', texto: 'Poner en cuarentena para analizarlo después', correcto: false, xp: -40, razon: 'La cuarentena es para amenazas dudosas. Un troyano confirmado debe eliminarse.' },
          { id: 'ignorar', texto: 'Ignorar la alerta, probablemente es un falso positivo', correcto: false, xp: -100, razon: 'Ignorar un troyano confirmado puede comprometer todo el sistema.' },
        ],
      },
      {
        id: 1,
        nombre: 'PUP.Optional.BrowserModifier',
        ruta: 'C:\\Program Files\\FreeDownloadManager\\toolbar.dll',
        nivel: 'MEDIO',
        acciones: [
          { id: 'eliminar', texto: 'Eliminar y desinstalar el programa asociado', correcto: true, xp: 60, razon: 'Los PUP (programas potencialmente no deseados) deben eliminarse aunque no sean malware crítico.' },
          { id: 'ignorar', texto: 'Ignorar, no parece peligroso', correcto: false, xp: -50, razon: 'Los PUP recopilan datos y modifican el navegador. Deben eliminarse.' },
          { id: 'permitir', texto: 'Agregar a excepciones del antivirus', correcto: false, xp: -60, razon: 'Agregar un PUP a excepciones es ignorar el problema. Elimínalo.' },
        ],
      },
      {
        id: 2,
        nombre: 'Suspicious.Cloud.9',
        ruta: 'C:\\Windows\\System32\\legitimate_tool.exe',
        nivel: 'BAJO',
        acciones: [
          { id: 'investigar', texto: 'Investigar el archivo antes de actuar — buscar su hash en VirusTotal', correcto: true, xp: 80, razon: 'Correcto. Archivos en System32 pueden ser del sistema. Siempre investiga antes de eliminar archivos del sistema.' },
          { id: 'eliminar', texto: 'Eliminar inmediatamente por precaución', correcto: false, xp: -70, razon: 'Eliminar archivos del sistema sin investigar puede romper Windows.' },
          { id: 'ignorar', texto: 'Ignorar, está en una carpeta del sistema', correcto: false, xp: -30, razon: 'El malware avanzado se esconde en carpetas del sistema. Hay que investigar.' },
        ],
      },
    ],
    xp: 100,
  },
  {
    id: 2,
    tipo: 'usb',
    titulo: 'USB sospechoso en la oficina',
    descripcion: 'Encuentras un USB en el estacionamiento de la empresa con una etiqueta que dice "NÓMINAS 2025". Evalúa cada decisión.',
    situaciones: [
      {
        id: 0,
        contexto: 'Encuentras el USB. ¿Qué haces primero?',
        opciones: [
          { id: 'conectar', texto: 'Lo conecto en mi computador para ver qué contiene.', correcto: false, xp: -200, razon: 'Error grave. Los USB abandonados son un ataque clásico llamado "USB drop". Pueden instalar malware automáticamente al conectarse.' },
          { id: 'guardar', texto: 'Lo guardo en mi bolsillo para entregarlo después.', correcto: false, xp: -50, razon: 'Guardarlo sin reportarlo puede hacer que alguien más lo conecte. Repórtalo de inmediato.' },
          { id: 'reportar', texto: 'Lo entrego al área de seguridad sin conectarlo.', correcto: true, xp: 120, razon: 'Correcto. El equipo de seguridad tiene herramientas para analizar el USB de forma segura.' },
          { id: 'dejar', texto: 'Lo dejo donde está y no lo toco.', correcto: false, xp: 30, razon: 'Mejor que conectarlo, pero alguien más podría encontrarlo. Lo ideal es reportarlo.' },
        ],
      },
      {
        id: 1,
        contexto: 'Tu colega ya conectó el USB en su computador antes de que pudieras advertirle. ¿Qué haces?',
        opciones: [
          { id: 'nada', texto: 'No hago nada, probablemente no pasó nada.', correcto: false, xp: -100, razon: 'La inacción puede permitir que el malware se propague por toda la red corporativa.' },
          { id: 'desconectar', texto: 'Le digo que desconecte el USB y aviso al área de seguridad inmediatamente.', correcto: true, xp: 100, razon: 'Correcto. Desconectar y reportar de inmediato minimiza el daño. El tiempo es crítico.' },
          { id: 'escanear', texto: 'Le digo que escanee el USB con el antivirus antes de abrir nada.', correcto: false, xp: -30, razon: 'Algunos malware se ejecutan al conectar el USB, antes de que el antivirus pueda reaccionar.' },
        ],
      },
    ],
    xp: 110,
  },
  {
    id: 3,
    tipo: 'ransomware',
    titulo: 'Ataque de ransomware en curso',
    descripcion: 'Recibes esta alerta en tu pantalla. Tienes que actuar rápido y en el orden correcto.',
    alerta: {
      titulo: '🔒 TUS ARCHIVOS HAN SIDO CIFRADOS',
      mensaje: 'Todos tus archivos han sido cifrados con AES-256. Para recuperarlos tienes 48 horas para pagar 0.5 BTC a la siguiente dirección. Si no pagas, los archivos serán eliminados permanentemente.',
      bitcoin: '1A2B3C4D5E6F...',
    },
    pasos: [
      { id: 'pagar', texto: 'Pago el rescate para recuperar los archivos rápido', orden: null, correcto: false, razon: 'NUNCA pagues. No garantiza recuperación y financia a los atacantes.' },
      { id: 'desconectar_red', texto: 'Desconecto el equipo de la red inmediatamente', orden: 1, correcto: true, razon: 'Primer paso crítico — evita que el ransomware se propague a otros equipos.' },
      { id: 'apagar', texto: 'Apago el equipo para detener el cifrado', orden: 2, correcto: true, razon: 'Segundo paso — detiene el proceso de cifrado en curso.' },
      { id: 'reportar', texto: 'Reporto el incidente al área de TI y seguridad', orden: 3, correcto: true, razon: 'Tercer paso — el equipo de respuesta necesita saber de inmediato.' },
      { id: 'backup', texto: 'Restauro los archivos desde el backup más reciente', orden: 4, correcto: true, razon: 'Cuarto paso — los backups son la única forma segura de recuperar archivos.' },
      { id: 'formatear', texto: 'Formateo el equipo y reinstalo el sistema', orden: 5, correcto: true, razon: 'Quinto paso — asegura que no queden rastros del malware.' },
    ],
    xp: 130,
  },
]

export default function Mision4({ session }) {
  const navigate = useNavigate()
  const [retoIndex, setRetoIndex] = useState(0)
  const [scoreTotal, setScoreTotal] = useState(0)
  const [finished, setFinished] = useState(false)

  // Reto 0
  const [seleccionados, setSeleccionados] = useState({})
  const [enviado0, setEnviado0] = useState(false)

  // Reto 1
  const [amenazaIndex, setAmenazaIndex] = useState(0)
  const [respuestaAmenaza, setRespuestaAmenaza] = useState(null)
  const [ptsEscaneo, setPtsEscaneo] = useState(0)

  // Reto 2
  const [situacionIndex, setSituacionIndex] = useState(0)
  const [respuestaSit, setRespuestaSit] = useState(null)
  const [ptsUsb, setPtsUsb] = useState(0)

  // Reto 3
  const [ordenSeleccionado, setOrdenSeleccionado] = useState([])
  const [enviado3, setEnviado3] = useState(false)

  const reto = retos[retoIndex]

  function siguiente(pts) {
    setScoreTotal(prev => prev + Math.max(0, pts))
    if (retoIndex + 1 >= retos.length) { sonidoMisionCompleta(); setFinished(true); guardarProgreso(3, scoreTotal + Math.max(0, pts)); return }
    setRetoIndex(i => i + 1)
    setSeleccionados({})
    setEnviado0(false)
    setAmenazaIndex(0)
    setRespuestaAmenaza(null)
    setPtsEscaneo(0)
    setSituacionIndex(0)
    setRespuestaSit(null)
    setPtsUsb(0)
    setOrdenSeleccionado([])
    setEnviado3(false)
  }

  // Reto 0
  function toggleArchivo(id) {
    if (enviado0) return
    setSeleccionados(prev => ({ ...prev, [id]: !prev[id] }))
  }

function submitArchivos() {
  const archivos = reto.archivos
  const correctos = archivos.filter(a => !!seleccionados[a.id] === a.sospechoso).length
  correctos === archivos.length ? sonidoExito() : sonidoError()
  setEnviado0(true)
  return correctos
}

  // Reto 1
  function elegirAmenaza(accion) {
    if (respuestaAmenaza) return
    accion.correcto ? sonidoExito() : sonidoError()
    setRespuestaAmenaza(accion)
    setPtsEscaneo(prev => prev + Math.max(0, accion.xp))
  }

  function siguienteAmenaza() {
    const amenazas = reto.amenazas
    if (amenazaIndex + 1 >= amenazas.length) {
      siguiente(ptsEscaneo + Math.max(0, respuestaAmenaza?.xp || 0))
    } else {
      setAmenazaIndex(i => i + 1)
      setRespuestaAmenaza(null)
    }
  }

  // Reto 2
  function elegirSit(op) {
    if (respuestaSit) return
    op.correcto ? sonidoExito() : sonidoError()
    setRespuestaSit(op)
    setPtsUsb(prev => prev + Math.max(0, op.xp))
  }

  function siguienteSit() {
    const sits = reto.situaciones
    if (situacionIndex + 1 >= sits.length) {
      siguiente(ptsUsb + Math.max(0, respuestaSit?.xp || 0))
    } else {
      setSituacionIndex(i => i + 1)
      setRespuestaSit(null)
    }
  }

  // Reto 3
  function togglePaso(paso) {
    if (enviado3 || !paso.correcto) return
    if (ordenSeleccionado.find(p => p.id === paso.id)) {
      setOrdenSeleccionado(prev => prev.filter(p => p.id !== paso.id))
    } else {
      setOrdenSeleccionado(prev => [...prev, paso])
    }
  }

function submitRansomware() {
    setEnviado3(true)
    const correctos = reto.pasos.filter(p => p.correcto)
    const acertados = ordenSeleccionado.filter((p, i) => p.orden === i + 1).length
    siguiente(Math.round((acertados / correctos.length) * reto.xp))
  }

  if (finished) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', color: '#e2e8f0' }}>
      <div style={{ background: C.sidebar, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '56px', textAlign: 'center', maxWidth: '520px', width: '100%' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛡️</div>
        <div style={{ fontSize: '14px', color: '#64748b', letterSpacing: '2px', marginBottom: '10px' }}>MISIÓN 3 COMPLETADA</div>
        <div style={{ fontSize: '32px', fontWeight: 800, color: C.cyan, marginBottom: '10px' }}>
          {scoreTotal >= 350 ? '¡Experto en malware!' : scoreTotal >= 200 ? 'Buen trabajo' : 'Sigue practicando'}
        </div>
        <div style={{ fontSize: '48px', fontWeight: 900, color: '#fbbf24', marginBottom: '24px' }}>+{scoreTotal} XP</div>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/')} style={{ padding: '14px 28px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: '#94a3b8', fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit' }}>Volver al Hub</button>
        <button onClick={() => navigate('/mision/5')} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Siguiente misión →</button>        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', fontSize: '16px', display: 'flex', flexDirection: 'column' }}>

      <header style={{ height: '64px', background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '22px' }}>←</button>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '2px' }}>MÓDULO 3 · ARCHIVOS Y MALWARE</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: C.cyan }}>Misión 3 Detección de amenazas</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Reto <span style={{ color: C.cyan, fontWeight: 700 }}>{retoIndex + 1}</span>/{retos.length}</span>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#fbbf24' }}>⚡ {scoreTotal} XP</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', flex: 1, overflow: 'hidden' }}>

        {/* PANEL IZQUIERDO */}
        <div style={{ background: C.sidebar, borderRight: `1px solid ${C.border}`, overflowY: 'auto', padding: '24px' }}>
          <div style={{ fontSize: '11px', color: C.cyan, letterSpacing: '2px', marginBottom: '12px' }}>ARCHIVOS Y MALWARE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ff4d0022', border: '1px solid #ff4d0044', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🦠</div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>MISIÓN 4</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>MALWARE</div>
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', letterSpacing: '1px', marginBottom: '12px' }}>RETOS</div>
            {retos.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', opacity: i > retoIndex ? 0.4 : 1 }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i < retoIndex ? '#4ade80' : i === retoIndex ? C.cyan : 'transparent', border: `2px solid ${i < retoIndex ? '#4ade80' : i === retoIndex ? C.cyan : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#080b18', flexShrink: 0 }}>
                  {i < retoIndex ? '✓' : i === retoIndex ? '●' : ''}
                </div>
                <span style={{ fontSize: '12px', color: i === retoIndex ? C.cyan : i < retoIndex ? '#4ade80' : '#64748b' }}>{r.titulo}</span>
              </div>
            ))}
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>RECOMPENSA TOTAL</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#fbbf24' }}>+460 XP</div>
          </div>
        </div>

        {/* CENTRO */}
        <div style={{ overflowY: 'auto', padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{reto.titulo}</div>
            <div style={{ fontSize: '15px', color: '#94a3b8', lineHeight: '1.7' }}>{reto.descripcion}</div>
          </div>

          {/* RETO 0: IDENTIFICAR ARCHIVOS */}
          {reto.tipo === 'identificar_archivo' && (
            <div>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>Haz clic en los archivos que consideres <span style={{ color: '#f87171' }}>sospechosos</span>:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {reto.archivos.map(a => {
                  const marcado = !!seleccionados[a.id]
                  const correcto = enviado0 ? marcado === a.sospechoso : null
                  return (
                    <div key={a.id} onClick={() => toggleArchivo(a.id)}
                      style={{ padding: '16px', borderRadius: '12px', border: `2px solid ${enviado0 ? (correcto ? '#4ade80' : '#f87171') : marcado ? '#f87171' : C.border}`, background: enviado0 ? (correcto ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)') : marcado ? 'rgba(248,113,113,0.08)' : C.card, cursor: enviado0 ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: enviado0 ? '8px' : '0' }}>
                        <span style={{ fontSize: '24px' }}>{a.icono}</span>
                        <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#e2e8f0', wordBreak: 'break-all' }}>{a.nombre}</span>
                        {marcado && !enviado0 && <span style={{ marginLeft: 'auto', fontSize: '16px' }}>🚨</span>}
                        {enviado0 && <span style={{ marginLeft: 'auto', fontSize: '16px' }}>{correcto ? '✅' : '❌'}</span>}
                      </div>
                      {enviado0 && <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>{a.razon}</div>}
                    </div>
                  )
                })}
              </div>
              {!enviado0 ? (
                <button onClick={() => { const c = submitArchivos(); siguiente(Math.round((c / reto.archivos.length) * reto.xp)) }}
                  disabled={Object.keys(seleccionados).length === 0}
                  style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: Object.keys(seleccionados).length > 0 ? `linear-gradient(to right, ${C.cyan}, ${C.violet})` : 'rgba(255,255,255,0.08)', color: Object.keys(seleccionados).length > 0 ? '#080b18' : '#64748b', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Confirmar selección →
                </button>
              ) : null}
            </div>
          )}

          {/* RETO 1: ESCANEO */}
          {reto.tipo === 'escaneo' && (() => {
            const amenaza = reto.amenazas[amenazaIndex]
            return (
              <div>
                <div style={{ background: '#080b18', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '12px', padding: '20px', marginBottom: '20px', fontFamily: 'monospace' }}>
                  <div style={{ fontSize: '12px', color: '#f87171', marginBottom: '12px', letterSpacing: '2px' }}>⚠ ALERTA {amenazaIndex + 1}/{reto.amenazas.length}</div>
                  <div style={{ fontSize: '16px', color: '#f87171', fontWeight: 700, marginBottom: '8px' }}>{amenaza.nombre}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Ruta: <span style={{ color: '#94a3b8' }}>{amenaza.ruta}</span></div>
                  <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '6px', background: amenaza.nivel === 'CRÍTICO' ? 'rgba(248,113,113,0.2)' : amenaza.nivel === 'MEDIO' ? 'rgba(251,191,36,0.2)' : 'rgba(74,222,128,0.2)', color: amenaza.nivel === 'CRÍTICO' ? '#f87171' : amenaza.nivel === 'MEDIO' ? '#fbbf24' : '#4ade80', fontSize: '12px', fontWeight: 700 }}>
                    {amenaza.nivel}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {amenaza.acciones.map(a => (
                    <div key={a.id} onClick={() => elegirAmenaza(a)}
                      style={{ padding: '16px 20px', borderRadius: '12px', border: `2px solid ${respuestaAmenaza ? (a.correcto ? '#4ade80' : '#f87171') : C.border}`, background: respuestaAmenaza ? (a.correcto ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.04)') : C.card, cursor: respuestaAmenaza ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: respuestaAmenaza ? '8px' : '0' }}>
                        <span style={{ fontSize: '15px', color: '#e2e8f0' }}>{a.texto}</span>
                        {respuestaAmenaza && <span>{a.correcto ? '✅' : '❌'}</span>}
                      </div>
                      {respuestaAmenaza && <div style={{ fontSize: '13px', color: '#94a3b8' }}>{a.razon}</div>}
                    </div>
                  ))}
                </div>
                {respuestaAmenaza && (
                  <button onClick={siguienteAmenaza} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {amenazaIndex + 1 >= reto.amenazas.length ? 'Siguiente reto →' : 'Siguiente amenaza →'}
                  </button>
                )}
              </div>
            )
          })()}

          {/* RETO 2: USB */}
          {reto.tipo === 'usb' && (() => {
            const sit = reto.situaciones[situacionIndex]
            return (
              <div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', color: C.cyan, letterSpacing: '2px', marginBottom: '10px', fontWeight: 700 }}>SITUACIÓN {situacionIndex + 1}/{reto.situaciones.length}</div>
                  <div style={{ fontSize: '16px', color: '#e2e8f0', lineHeight: '1.7' }}>{sit.contexto}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {sit.opciones.map(op => (
                    <div key={op.id} onClick={() => elegirSit(op)}
                      style={{ padding: '16px 20px', borderRadius: '12px', border: `2px solid ${respuestaSit ? (op.correcto ? '#4ade80' : '#f87171') : C.border}`, background: respuestaSit ? (op.correcto ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.04)') : C.card, cursor: respuestaSit ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: respuestaSit ? '8px' : '0' }}>
                        <span style={{ fontSize: '15px', color: '#e2e8f0' }}>{op.texto}</span>
                        {respuestaSit && <span>{op.correcto ? '✅' : '❌'}</span>}
                      </div>
                      {respuestaSit && <div style={{ fontSize: '13px', color: '#94a3b8' }}>{op.razon}</div>}
                    </div>
                  ))}
                </div>
                {respuestaSit && (
                  <button onClick={siguienteSit} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {situacionIndex + 1 >= reto.situaciones.length ? 'Siguiente reto →' : 'Siguiente situación →'}
                  </button>
                )}
              </div>
            )
          })()}

          {/* RETO 3: RANSOMWARE */}
          {reto.tipo === 'ransomware' && (
            <div>
              <div style={{ background: '#080b18', border: '2px solid #f87171', borderRadius: '12px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#f87171', marginBottom: '12px' }}>{reto.alerta.titulo}</div>
                <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.7', marginBottom: '16px' }}>{reto.alerta.mensaje}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#fbbf24', background: 'rgba(251,191,36,0.08)', padding: '8px 16px', borderRadius: '8px', display: 'inline-block' }}>
                  {reto.alerta.bitcoin}
                </div>
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                Selecciona los pasos correctos <span style={{ color: C.cyan }}>en el orden correcto</span> (ignora las malas opciones):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {reto.pasos.map(paso => {
                  const pos = ordenSeleccionado.findIndex(p => p.id === paso.id)
                  const seleccionado = pos !== -1
                  return (
                    <div key={paso.id} onClick={() => togglePaso(paso)}
                      style={{ padding: '14px 18px', borderRadius: '12px', border: `2px solid ${enviado3 ? (paso.correcto ? '#4ade80' : '#f87171') : seleccionado ? C.cyan : paso.correcto ? C.border : '#f8717144'}`, background: enviado3 ? (paso.correcto ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)') : seleccionado ? `${C.cyan}0f` : paso.correcto ? C.card : 'rgba(248,113,113,0.03)', cursor: enviado3 || !paso.correcto ? 'default' : 'pointer', opacity: !paso.correcto ? 0.6 : 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: enviado3 ? '6px' : '0' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: seleccionado ? C.cyan : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: seleccionado ? '#080b18' : '#64748b', fontWeight: 700, flexShrink: 0 }}>
                          {seleccionado ? pos + 1 : paso.correcto ? '?' : '✗'}
                        </div>
                        <span style={{ fontSize: '15px', color: '#e2e8f0' }}>{paso.texto}</span>
                      </div>
                      {enviado3 && paso.correcto && <div style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '38px' }}>{paso.razon}</div>}
                    </div>
                  )
                })}
              </div>
              {!enviado3 ? (
                <button onClick={submitRansomware}
                  disabled={ordenSeleccionado.length === 0}
                  style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: ordenSeleccionado.length > 0 ? `linear-gradient(to right, ${C.cyan}, ${C.violet})` : 'rgba(255,255,255,0.08)', color: ordenSeleccionado.length > 0 ? '#080b18' : '#64748b', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Confirmar orden de respuesta →
                </button>
              ) : (
                <button onClick={() => siguiente(0)} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Finalizar misión →
                </button>
              )}
            </div>
          )}
        </div>

        {/* PANEL DERECHO */}
        <div style={{ background: C.sidebar, overflowY: 'auto', padding: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: C.cyan, letterSpacing: '2px', marginBottom: '16px' }}>💡 CONCEPTOS CLAVE</div>
          {[
            { titulo: 'Doble extensión', desc: 'archivo.pdf.exe parece un PDF pero es ejecutable. Windows oculta extensiones por defecto.' },
            { titulo: 'USB Drop Attack', desc: 'Atacantes dejan USBs infectados en lugares públicos esperando que alguien los conecte.' },
            { titulo: 'Macros maliciosas', desc: 'Archivos .docm y .xlsm pueden contener macros que ejecutan código al abrirse.' },
            { titulo: 'Ransomware', desc: 'Cifra archivos y pide rescate. Los backups son la única defensa real.' },
            { titulo: 'Nunca pagues', desc: 'Pagar el rescate no garantiza recuperar los archivos y financia futuros ataques.' },
            { titulo: 'VirusTotal', desc: 'Herramienta gratuita para analizar archivos y URLs sospechosas antes de abrirlos.' },
          ].map((c, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: C.violet, marginBottom: '6px' }}>{c.titulo}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>{c.desc}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}