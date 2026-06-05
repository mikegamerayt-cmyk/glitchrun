import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { guardarProgreso } from '../utils/progreso'
import { sonidoExito, sonidoError, sonidoMisionCompleta } from '../utils/sonidos'

const C = {
  cyan: '#00fff7', violet: '#a855f7', pink: '#f472b6',
  bg: '#080b18', sidebar: '#0b0f1e', card: '#0f1326',
  border: 'rgba(255,255,255,0.1)',
}

// ============ FASE 1: BRIEFING ============
const briefing = [
  { t: 500, msg: '🔴 ALERTA MÁXIMA: Grupo APT-X detectado en la red corporativa', color: '#f87171' },
  { t: 2000, msg: '💀 APT-X es responsable de 47 ataques a infraestructuras críticas en 2024', color: '#f87171' },
  { t: 3500, msg: '🎯 Objetivo confirmado: sus sistemas financieros y base de datos de clientes', color: '#fbbf24' },
  { t: 5000, msg: '⚠ El ataque es multicapa — phishing, malware, intrusión de red simultáneos', color: '#fbbf24' },
  { t: 6500, msg: '🕐 Tienen acceso desde hace 6 horas. La ventana de contención es ahora', color: '#f87171' },
  { t: 8000, msg: '🎖 Agente, usted es nuestra última línea de defensa. Buena suerte.', color: C.cyan },
]

// ============ FASE 2: OLEADAS DE ATAQUE ============
const oleadas = [
  {
    id: 0,
    titulo: 'OLEADA 1 — Ingeniería Social',
    descripcion: 'APT-X inicia con un ataque de phishing masivo dirigido a ejecutivos.',
    vida_jefe: 100,
    dano_si_fallas: 30,
    tiempo: 45,
    pregunta: 'El CEO recibe este email: "Su cuenta de Office 365 será bloqueada en 1 hora. Verifique en: office365-secure-login.ru" ¿Qué debes hacer?',
    opciones: [
      { id: 'a', texto: 'Reportar el email al equipo de seguridad e ignorarlo', correcto: true, xp: 150, dano_jefe: 25, razon: 'Correcto. Reportar y no interactuar es la respuesta ideal.' },
      { id: 'b', texto: 'Llamar al CEO para advertirle antes de que haga clic', correcto: true, xp: 120, dano_jefe: 20, razon: 'Bueno. Advertir al CEO evita que caiga en la trampa.' },
      { id: 'c', texto: 'Verificar el enlace en un entorno sandbox primero', correcto: true, xp: 100, dano_jefe: 15, razon: 'Válido para análisis, pero primero advierte al CEO.' },
      { id: 'd', texto: 'Filtrar todos los emails de dominios .ru en el firewall', correcto: false, xp: -50, dano_jefe: 0, razon: 'Bloqueo excesivo que puede cortar comunicaciones legítimas.' },
      { id: 'e', texto: 'No hacer nada, el CEO sabe lo que hace', correcto: false, xp: -100, dano_jefe: 0, razon: 'Error. Los ejecutivos son el objetivo principal del spear phishing.' },
    ],
  },
  {
    id: 1,
    titulo: 'OLEADA 2 — Malware Polimórfico',
    descripcion: 'APT-X despliega malware que muta para evadir el antivirus.',
    vida_jefe: 75,
    dano_si_fallas: 35,
    tiempo: 40,
    pregunta: 'El antivirus reporta una amenaza "Suspicious.Polymorphic.Gen" en 3 equipos simultáneamente. El malware se detecta pero no se puede eliminar — muta antes de que el AV actúe.',
    opciones: [
      { id: 'a', texto: 'Aislar los 3 equipos de la red inmediatamente', correcto: true, xp: 180, dano_jefe: 30, razon: 'Correcto. El aislamiento evita la propagación mientras se analiza.' },
      { id: 'b', texto: 'Actualizar las firmas del antivirus y esperar', correcto: false, xp: -80, dano_jefe: 0, razon: 'El malware polimórfico evade firmas. La actualización no es suficiente.' },
      { id: 'c', texto: 'Formatear los equipos y restaurar desde backup limpio', correcto: true, xp: 150, dano_jefe: 25, razon: 'Efectivo si los backups están limpios y aislados del incidente.' },
      { id: 'd', texto: 'Usar análisis de comportamiento (EDR) para detectar el patrón', correcto: true, xp: 160, dano_jefe: 28, razon: 'Excelente. EDR es la herramienta correcta contra malware polimórfico.' },
      { id: 'e', texto: 'Apagar todos los equipos de la empresa', correcto: false, xp: -120, dano_jefe: 0, razon: 'Paralizar la empresa sin un plan causa más daño que el malware.' },
    ],
  },
  {
    id: 2,
    titulo: 'OLEADA 3 — Ataque a Infraestructura Crítica',
    descripcion: 'APT-X compromete el controlador de dominio. Tienen acceso a todo.',
    vida_jefe: 50,
    dano_si_fallas: 40,
    tiempo: 35,
    pregunta: 'APT-X comprometió el Controlador de Dominio (DC). Tienen credenciales de todos los usuarios incluyendo administradores. El DC aún está online.',
    opciones: [
      { id: 'a', texto: 'Desconectar el DC de la red y activar DC de respaldo', correcto: true, xp: 200, dano_jefe: 35, razon: 'Correcto. Aislar el DC comprometido y activar el respaldo es el protocolo.' },
      { id: 'b', texto: 'Resetear TODAS las contraseñas del dominio inmediatamente', correcto: true, xp: 180, dano_jefe: 30, razon: 'Necesario para invalidar las credenciales robadas.' },
      { id: 'c', texto: 'Implementar autenticación de doble factor en todos los sistemas', correcto: true, xp: 160, dano_jefe: 25, razon: 'Correcto. 2FA invalida las credenciales aunque el atacante las tenga.' },
      { id: 'd', texto: 'Monitorear las acciones del atacante para entender su objetivo', correcto: false, xp: -100, dano_jefe: 0, razon: 'Con acceso al DC no puedes darte el lujo de esperar.' },
      { id: 'e', texto: 'Negociar con APT-X para que devuelvan el acceso', correcto: false, xp: -150, dano_jefe: 0, razon: 'Los grupos APT no negocian — solo escalan el ataque.' },
    ],
  },
  {
    id: 3,
    titulo: 'OLEADA FINAL — El Golpe Definitivo',
    descripcion: 'APT-X activa su payload final: ransomware en todos los sistemas simultáneamente.',
    vida_jefe: 25,
    dano_si_fallas: 50,
    tiempo: 30,
    pregunta: 'APT-X activa ransomware en TODOS los sistemas simultáneamente. Tienes exactamente 30 segundos para tomar UNA decisión crítica que determinará el resultado del ataque.',
    opciones: [
      { id: 'a', texto: '🔌 Cortar toda la conectividad de red de la empresa AHORA', correcto: true, xp: 250, dano_jefe: 40, razon: 'La decisión más crítica. Cortar la red detiene la propagación del ransomware entre sistemas.' },
      { id: 'b', texto: '💾 Activar el protocolo de backup offline inmediatamente', correcto: true, xp: 200, dano_jefe: 35, razon: 'Si los backups están offline no se cifrarán. Decisión correcta y crítica.' },
      { id: 'c', texto: '📞 Llamar al proveedor de DRaaS (Disaster Recovery as a Service)', correcto: true, xp: 180, dano_jefe: 30, razon: 'Correcto. DRaaS puede iniciar la recuperación desde infraestructura externa limpia.' },
      { id: 'd', texto: '💰 Pagar el rescate para detener el cifrado', correcto: false, xp: -300, dano_jefe: 0, razon: 'NUNCA. El pago no detiene el cifrado activo y financia futuros ataques.' },
      { id: 'e', texto: '⏳ Esperar instrucciones de la dirección antes de actuar', correcto: false, xp: -200, dano_jefe: 0, razon: 'En un ataque activo cada segundo cuenta. La inacción es catastrófica.' },
    ],
  },
]

// ============ FASE 3: CONFRONTACIÓN FINAL ============
const dialogoFinal = [
  { de: 'jefe', texto: 'Impresionante, agente. Has resistido más de lo que esperábamos.', t: 1000 },
  { de: 'jefe', texto: 'Pero esto no ha terminado. Hemos plantado puertas traseras en 3 sistemas que no encontraron.', t: 4000 },
  { de: 'jefe', texto: 'Tienen 60 segundos para rendirse o activamos el payload de destrucción.', t: 7000 },
  { de: 'sistema', texto: '⚠ SISTEMA: Detectadas 3 conexiones anómalas en puertos no estándar', t: 10000 },
  { de: 'sistema', texto: '📍 Puerto 8443 — Servidor de archivos | Puerto 31337 — Servidor backup | Puerto 9999 — DC', t: 12000 },
]

const decisionFinal = {
  pregunta: 'APT-X tiene 3 backdoors activos. Tienes herramientas limitadas. ¿Cuál es tu movimiento final?',
  opciones: [
    { id: 'f1', texto: '🔍 Usar el IDS para identificar y bloquear las 3 conexiones simultáneamente', xp: 300, tipo: 'perfecto', resultado: 'VICTORIA TOTAL — Las 3 backdoors bloqueadas. APT-X desconectado. Sistemas seguros.' },
    { id: 'f2', texto: '🔌 Desconectar físicamente los 3 servidores afectados', xp: 250, tipo: 'bueno', resultado: 'VICTORIA — Servidores aislados. Pérdida de servicio temporal pero el ataque fue contenido.' },
    { id: 'f3', texto: '📋 Documentar las IPs y reportar a CERT nacional', xp: 150, tipo: 'neutral', resultado: 'PARCIAL — Las autoridades actuarán pero el payload se activó parcialmente.' },
    { id: 'f4', texto: '🏳️ Rendirse y negociar términos', xp: -200, tipo: 'derrota', resultado: 'DERROTA — APT-X obtuvo lo que quería. La empresa sufrió daños masivos.' },
  ],
}

export default function Mision7({ session }) {
  const navigate = useNavigate()
  const [fase, setFase] = useState(0) // 0=briefing, 1=oleadas, 2=final, 3=resultado
  const [briefingMsgs, setBriefingMsgs] = useState([])
  const [briefingDone, setBriefingDone] = useState(false)

  // Oleadas
  const [oleadaIndex, setOleadaIndex] = useState(0)
  const [vidaJefe, setVidaJefe] = useState(100)
  const [vidaBase, setVidaBase] = useState(100)
  const [respuestaOleada, setRespuestaOleada] = useState(null)
  const [tiempoOleada, setTiempoOleada] = useState(45)
  const [scoreTotal, setScoreTotal] = useState(0)
  const [tiempoAgotado, setTiempoAgotado] = useState(false)

  // Final
  const [dialogoMsgs, setDialogoMsgs] = useState([])
  const [dialogoDone, setDialogoDone] = useState(false)
  const [respuestaFinal, setRespuestaFinal] = useState(null)
  const terminalRef = useRef(null)
  const chatFinalRef = useRef(null)

  const oleada = oleadas[oleadaIndex]

  // BRIEFING
  useEffect(() => {
    if (fase !== 0) return
    briefing.forEach(msg => {
      setTimeout(() => setBriefingMsgs(prev => [...prev, msg]), msg.t)
    })
    setTimeout(() => setBriefingDone(true), 9000)
  }, [fase])

  // TIMER OLEADA
  useEffect(() => {
    if (fase !== 1 || respuestaOleada || tiempoAgotado) return
    if (tiempoOleada <= 0) {
      setTiempoAgotado(true)
      setVidaBase(prev => Math.max(0, prev - oleada.dano_si_fallas))
      return
    }
    const t = setTimeout(() => setTiempoOleada(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [fase, tiempoOleada, respuestaOleada, tiempoAgotado])

  // SCROLL TERMINAL
  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [briefingMsgs])

  // DIALOGO FINAL
  useEffect(() => {
    if (fase !== 2) return
    dialogoFinal.forEach(msg => {
      setTimeout(() => setDialogoMsgs(prev => [...prev, msg]), msg.t)
    })
    setTimeout(() => setDialogoDone(true), 14000)
  }, [fase])

  useEffect(() => {
    if (chatFinalRef.current) chatFinalRef.current.scrollTop = chatFinalRef.current.scrollHeight
  }, [dialogoMsgs])

function elegirOleada(op) {
  if (respuestaOleada || tiempoAgotado) return
  op.correcto ? sonidoExito() : sonidoError()
  setRespuestaOleada(op)
    setScoreTotal(prev => prev + Math.max(0, op.xp))
    if (op.correcto) {
      setVidaJefe(prev => Math.max(0, prev - op.dano_jefe))
    } else {
      setVidaBase(prev => Math.max(0, prev - oleada.dano_si_fallas / 2))
    }
  }

  function siguienteOleada() {
    if (oleadaIndex + 1 >= oleadas.length) {
      setFase(2)
      return
    }
    const siguiente = oleadas[oleadaIndex + 1]
    setOleadaIndex(i => i + 1)
    setVidaJefe(siguiente.vida_jefe)
    setRespuestaOleada(null)
    setTiempoAgotado(false)
    setTiempoOleada(siguiente.tiempo)
  }

function elegirFinal(op) {
  if (respuestaFinal) return
  op.tipo === 'perfecto' || op.tipo === 'bueno' ? sonidoExito() : sonidoError()
  setRespuestaFinal(op)
    setScoreTotal(prev => prev + Math.max(0, op.xp))
    setTimeout(() => {
sonidoMisionCompleta()
setFase(3)
guardarProgreso(7, scoreTotal + Math.max(0, op.xp))
    }, 2000)
  }

  const tiempoColor = tiempoOleada > 20 ? '#4ade80' : tiempoOleada > 10 ? '#fbbf24' : '#f87171'

  // ===== RESULTADO FINAL =====
  if (fase === 3) {
    const victoria = respuestaFinal?.tipo === 'perfecto' || respuestaFinal?.tipo === 'bueno'
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', color: '#e2e8f0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: victoria ? 'radial-gradient(ellipse at center, rgba(0,255,247,0.05) 0%, transparent 70%)' : 'radial-gradient(ellipse at center, rgba(248,113,113,0.05) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, background: C.sidebar, border: `2px solid ${victoria ? C.cyan : '#f87171'}`, borderRadius: '20px', padding: '56px', textAlign: 'center', maxWidth: '640px', width: '100%', boxShadow: `0 0 60px ${victoria ? C.cyan + '22' : '#f8717122'}` }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>{scoreTotal >= 1200 ? '🏆' : scoreTotal >= 800 ? '🥇' : scoreTotal >= 400 ? '🎯' : '💀'}</div>
          <div style={{ fontSize: '14px', color: '#64748b', letterSpacing: '3px', marginBottom: '10px' }}>JEFE FINAL — MISIÓN COMPLETADA</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: victoria ? C.cyan : '#f87171', marginBottom: '8px' }}>
            {scoreTotal >= 1200 ? '¡LEYENDA DE LA CIBERSEGURIDAD!' : scoreTotal >= 800 ? '¡Victoria épica!' : scoreTotal >= 400 ? 'APT-X contenido' : 'APT-X ganó esta vez'}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>{respuestaFinal?.resultado}</div>
          <div style={{ fontSize: '56px', fontWeight: 900, color: '#fbbf24', marginBottom: '24px' }}>+{scoreTotal} XP</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '28px' }}>
            {[
              { label: 'Vida base', val: `${vidaBase}%`, color: vidaBase > 60 ? '#4ade80' : vidaBase > 30 ? '#fbbf24' : '#f87171' },
              { label: 'Vida jefe', val: `${vidaJefe}%`, color: '#4ade80' },
              { label: 'Oleadas', val: `${oleadaIndex + 1}/${oleadas.length}`, color: C.cyan },
              { label: 'XP total', val: `${scoreTotal}`, color: '#fbbf24' },
            ].map((s, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>{s.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/')} style={{ padding: '16px 32px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '17px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
              🏠 Volver al Hub
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== FASE 0: BRIEFING =====
  if (fase === 0) return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '13px', color: '#f87171', letterSpacing: '4px', marginBottom: '12px', fontWeight: 700 }}>⚠ MISIÓN 7 — JEFE FINAL</div>
          <div style={{ fontSize: '36px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>OPERACIÓN: APT-X</div>
          <div style={{ fontSize: '16px', color: '#64748b' }}>Nivel de amenaza: <span style={{ color: '#f87171', fontWeight: 700 }}>CRÍTICO MÁXIMO</span></div>
        </div>

        <div style={{ background: '#0d0a1a', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '12px', padding: '24px', marginBottom: '32px', fontFamily: 'monospace', minHeight: '280px' }} ref={terminalRef}>
          <div style={{ color: '#f87171', marginBottom: '12px', fontSize: '13px' }}>{'>'} SISTEMA DE INTELIGENCIA GLITCHRUN v3.0 — MODO CRISIS</div>
          {briefingMsgs.map((msg, i) => (
            <div key={i} style={{ color: msg.color, marginBottom: '8px', fontSize: '14px', lineHeight: '1.6' }}>
              {'>'} {msg.msg}
            </div>
          ))}
          {!briefingDone && <div style={{ color: '#64748b', fontSize: '13px' }}>{'>'} <span style={{ animation: 'blink 1s infinite' }}>█</span></div>}
        </div>

        {briefingDone && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '24px' }}>
              Esta misión combina todo lo aprendido. Habrá <strong style={{ color: C.cyan }}>4 oleadas</strong> de ataque y una <strong style={{ color: '#f87171' }}>confrontación final</strong> contra APT-X.
            </div>
            <button onClick={() => { setFase(1); setTiempoOleada(oleadas[0].tiempo) }}
              style={{ padding: '18px 48px', borderRadius: '12px', border: 'none', background: 'linear-gradient(to right, #f87171, #a855f7)', color: 'white', fontSize: '18px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '2px' }}>
              ⚔ INICIAR OPERACIÓN APT-X
            </button>
          </div>
        )}
      </div>
    </div>
  )

  // ===== FASE 1: OLEADAS =====
  if (fase === 1) return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', fontSize: '15px', display: 'flex', flexDirection: 'column' }}>

      {/* TOPBAR */}
      <header style={{ height: '64px', background: '#0d0a1a', borderBottom: `2px solid #f87171`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f87171' }} />
          <div>
            <div style={{ fontSize: '11px', color: '#f87171', letterSpacing: '2px', fontWeight: 700 }}>JEFE FINAL — {oleada.titulo}</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>Operación APT-X</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `${tiempoColor}11`, border: `1px solid ${tiempoColor}44`, borderRadius: '8px', padding: '6px 14px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tiempoColor }} />
            <span style={{ fontSize: '20px', fontWeight: 900, color: tiempoColor, fontFamily: 'monospace' }}>{tiempoOleada}s</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#fbbf24' }}>⚡ {scoreTotal} XP</div>
        </div>
      </header>

      {/* BARRAS DE VIDA */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '12px 28px', display: 'grid', gridTemplateColumns: '1fr 120px 1fr', gap: '20px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
            <span style={{ color: '#4ade80', fontWeight: 700 }}>🏢 EMPRESA — TU BASE</span>
            <span style={{ color: vidaBase > 60 ? '#4ade80' : vidaBase > 30 ? '#fbbf24' : '#f87171', fontWeight: 700 }}>{vidaBase}%</span>
          </div>
          <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px' }}>
            <div style={{ height: '100%', borderRadius: '5px', background: vidaBase > 60 ? '#4ade80' : vidaBase > 30 ? '#fbbf24' : '#f87171', width: `${vidaBase}%`, transition: 'width 0.5s', boxShadow: `0 0 10px ${vidaBase > 60 ? '#4ade80' : '#f87171'}` }} />
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '22px', fontWeight: 900, color: '#f87171' }}>VS</div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
            <span style={{ color: '#f87171', fontWeight: 700 }}>💀 APT-X</span>
            <span style={{ color: '#f87171', fontWeight: 700 }}>{vidaJefe}%</span>
          </div>
          <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px' }}>
            <div style={{ height: '100%', borderRadius: '5px', background: 'linear-gradient(to right, #f87171, #a855f7)', width: `${vidaJefe}%`, transition: 'width 0.5s', boxShadow: '0 0 10px rgba(248,113,113,0.5)' }} />
          </div>
        </div>
      </div>

      {/* PROGRESO OLEADAS */}
      <div style={{ background: C.sidebar, borderBottom: `1px solid ${C.border}`, padding: '10px 28px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#64748b', marginRight: '8px' }}>OLEADAS:</span>
        {oleadas.map((o, i) => (
          <div key={i} style={{ flex: 1, height: '6px', borderRadius: '3px', background: i < oleadaIndex ? '#4ade80' : i === oleadaIndex ? C.cyan : 'rgba(255,255,255,0.08)', boxShadow: i === oleadaIndex ? `0 0 8px ${C.cyan}` : 'none', transition: 'all 0.3s' }} />
        ))}
        <span style={{ fontSize: '12px', color: C.cyan, marginLeft: '8px', fontWeight: 700 }}>{oleadaIndex + 1}/{oleadas.length}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', flex: 1, overflow: 'hidden' }}>

        {/* CENTRO */}
        <div style={{ overflowY: 'auto', padding: '28px' }}>
          <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', color: '#f87171', fontWeight: 700, letterSpacing: '2px', marginBottom: '8px' }}>⚠ {oleada.titulo}</div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>{oleada.descripcion}</div>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'white', lineHeight: '1.7' }}>{oleada.pregunta}</div>
          </div>

          {(respuestaOleada || tiempoAgotado) && (
            <div style={{ background: respuestaOleada?.correcto ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${respuestaOleada?.correcto ? '#4ade8044' : '#f8717144'}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '17px', fontWeight: 700, color: tiempoAgotado ? '#fbbf24' : respuestaOleada?.correcto ? '#4ade80' : '#f87171', marginBottom: '8px' }}>
                {tiempoAgotado ? '⏱ Tiempo agotado — APT-X avanza' : respuestaOleada?.correcto ? `✅ +${respuestaOleada.xp} XP — ${respuestaOleada.razon}` : `❌ ${respuestaOleada?.razon}`}
              </div>
              <button onClick={siguienteOleada} style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, #f87171, ${C.violet})`, color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {oleadaIndex + 1 >= oleadas.length ? 'Confrontación final →' : `Oleada ${oleadaIndex + 2} →`}
              </button>
            </div>
          )}
        </div>

        {/* OPCIONES */}
        <div style={{ background: C.sidebar, borderLeft: `1px solid ${C.border}`, overflowY: 'auto', padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: C.cyan, letterSpacing: '2px', marginBottom: '4px' }}>⚡ TU RESPUESTA</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '14px' }}>Elige sabiamente — el tiempo corre</div>
          {oleada.opciones.map(op => (
            <div key={op.id} onClick={() => elegirOleada(op)}
              style={{ background: respuestaOleada ? (op.correcto ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.04)') : C.card, border: `2px solid ${respuestaOleada ? (op.correcto ? '#4ade8044' : '#f8717122') : C.border}`, borderRadius: '12px', padding: '14px', marginBottom: '10px', cursor: respuestaOleada || tiempoAgotado ? 'default' : 'pointer', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: respuestaOleada ? '6px' : '0' }}>
                <span style={{ fontSize: '14px', color: '#e2e8f0', flex: 1, marginRight: '8px' }}>{op.texto}</span>
                {respuestaOleada && <span style={{ flexShrink: 0 }}>{op.correcto ? '✅' : '❌'}</span>}
              </div>
              {respuestaOleada && (
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{op.razon}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: op.correcto ? '#4ade80' : '#f87171' }}>{op.xp > 0 ? `+${op.xp} XP` : `${op.xp} XP`}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ===== FASE 2: CONFRONTACIÓN FINAL =====
  if (fase === 2) return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', fontSize: '15px', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: '64px', background: '#0d0a1a', borderBottom: `2px solid ${C.violet}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div>
          <div style={{ fontSize: '11px', color: C.violet, letterSpacing: '2px', fontWeight: 700 }}>CONFRONTACIÓN FINAL</div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'white' }}>APT-X — Movimiento Final</div>
        </div>
        <div style={{ fontSize: '17px', fontWeight: 700, color: '#fbbf24' }}>⚡ {scoreTotal} XP acumulados</div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', flex: 1, overflow: 'hidden' }}>

        {/* CHAT FINAL */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: `1px solid ${C.border}` }}>
          <div style={{ padding: '14px 24px', background: C.card, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(248,113,113,0.2)', border: '2px solid #f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💀</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#f87171' }}>APT-X — Liderazgo</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Canal cifrado — última comunicación</div>
            </div>
          </div>

          <div ref={chatFinalRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {dialogoMsgs.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.de === 'sistema' ? 'center' : msg.de === 'yo' ? 'flex-end' : 'flex-start', gap: '10px', alignItems: 'flex-end' }}>
                {msg.de === 'sistema' ? (
                  <div style={{ background: 'rgba(168,85,247,0.1)', border: `1px solid ${C.violet}33`, borderRadius: '8px', padding: '10px 16px', fontSize: '13px', color: C.violet, fontFamily: 'monospace' }}>{msg.texto}</div>
                ) : (
                  <>
                    {msg.de !== 'yo' && <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(248,113,113,0.2)', border: '1px solid #f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>💀</div>}
                    <div style={{ maxWidth: '70%', background: msg.de === 'yo' ? `${C.violet}33` : 'rgba(248,113,113,0.08)', border: `1px solid ${msg.de === 'yo' ? C.violet + '44' : '#f8717133'}`, borderRadius: msg.de === 'yo' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '14px 18px' }}>
                      <div style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.6' }}>{msg.texto}</div>
                    </div>
                    {msg.de === 'yo' && <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${C.cyan}22`, border: `1px solid ${C.cyan}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🕵️</div>}
                  </>
                )}
              </div>
            ))}
          </div>

          {dialogoDone && !respuestaFinal && (
            <div style={{ padding: '20px 24px', borderTop: `1px solid ${C.border}`, background: C.sidebar }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: C.cyan, marginBottom: '14px' }}>{decisionFinal.pregunta}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {decisionFinal.opciones.map(op => (
                  <button key={op.id} onClick={() => elegirFinal(op)}
                    style={{ padding: '14px 18px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.card, color: '#e2e8f0', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', fontWeight: 600 }}>
                    {op.texto}
                  </button>
                ))}
              </div>
            </div>
          )}

          {respuestaFinal && (
            <div style={{ padding: '20px 24px', borderTop: `1px solid ${C.border}`, background: respuestaFinal.tipo === 'perfecto' || respuestaFinal.tipo === 'bueno' ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: respuestaFinal.tipo === 'perfecto' || respuestaFinal.tipo === 'bueno' ? '#4ade80' : '#f87171' }}>
                {respuestaFinal.tipo === 'perfecto' ? '🏆 VICTORIA TOTAL' : respuestaFinal.tipo === 'bueno' ? '✅ VICTORIA' : respuestaFinal.tipo === 'neutral' ? '⚠ RESULTADO PARCIAL' : '💀 DERROTA'}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Calculando resultado final...</div>
            </div>
          )}
        </div>

        {/* PANEL DERECHO */}
        <div style={{ background: C.sidebar, overflowY: 'auto', padding: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: C.cyan, letterSpacing: '2px', marginBottom: '16px' }}>📊 ESTADO FINAL</div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>RESUMEN DE OLEADAS</div>
            {oleadas.map((o, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px' }}>✅</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{o.titulo}</span>
              </div>
            ))}
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>VIDA BASE</div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginBottom: '6px' }}>
              <div style={{ height: '100%', borderRadius: '4px', background: vidaBase > 60 ? '#4ade80' : vidaBase > 30 ? '#fbbf24' : '#f87171', width: `${vidaBase}%` }} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: vidaBase > 60 ? '#4ade80' : '#fbbf24' }}>{vidaBase}%</div>
          </div>

          <div style={{ background: `${C.violet}0f`, border: `1px solid ${C.violet}33`, borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: C.violet, fontWeight: 700, marginBottom: '8px' }}>💡 PISTAS DETECTADAS</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.8' }}>
              · Puerto 8443 — Servidor de archivos<br />
              · Puerto 31337 — Servidor backup<br />
              · Puerto 9999 — DC<br />
              · IP origen: 91.108.4.177
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return null
}