import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { guardarProgreso } from '../utils/progreso'
import { sonidoExito, sonidoError, sonidoMisionCompleta } from '../utils/sonidos'

const C = {
  cyan: '#00fff7', violet: '#a855f7', pink: '#f472b6',
  bg: '#080b18', sidebar: '#0b0f1e', card: '#0f1326',
  border: 'rgba(255,255,255,0.1)',
}

const pasos = [
  {
    id: 0,
    tipo: 'intro',
    titulo: 'Bienvenido a GlitchRun',
    subtitulo: 'Academia de Ciberseguridad',
  },
  {
    id: 1,
    tipo: 'historia',
    mensajes: [
      { t: 500, texto: 'Año 2025. Los ciberataques cuestan $10.5 billones al año.', color: '#e2e8f0' },
      { t: 2500, texto: 'Cada 39 segundos ocurre un ataque en algún lugar del mundo.', color: '#fbbf24' },
      { t: 4500, texto: 'El 95% de los incidentes son causados por error humano.', color: '#f87171' },
      { t: 6500, texto: 'GlitchRun fue creado para cambiar eso.', color: C.cyan },
      { t: 8500, texto: 'Tu misión: convertirte en un agente de ciberseguridad capaz de detectar, analizar y responder a amenazas reales.', color: '#e2e8f0' },
      { t: 11000, texto: '¿Estás listo, Agente?', color: C.cyan },
    ],
  },
  {
    id: 2,
    tipo: 'mecanicas',
    titulo: '¿Cómo funciona GlitchRun?',
    items: [
      { icono: '🎯', titulo: 'Misiones', desc: 'Cada módulo tiene misiones con escenarios reales de ciberseguridad. Analiza, decide y actúa.' },
      { icono: '⚡', titulo: 'XP y progreso', desc: 'Ganas XP por cada decisión correcta. Cuanto más rápido y preciso, más XP.' },
      { icono: '⏱', titulo: 'Tiempo real', desc: 'Muchas misiones tienen temporizador. En la vida real los ataques no esperan.' },
      { icono: '💡', titulo: 'Pistas', desc: 'Aparecen con el tiempo para ayudarte. Úsalas sabiamente.' },
      { icono: '🔒', titulo: 'Módulos', desc: 'Hay 7 módulos que se desbloquean progresivamente. Desde phishing hasta jefe final.' },
      { icono: '🏆', titulo: 'Ranking', desc: 'Compite con otros agentes. Los mejores aparecen en el ranking global.' },
    ],
  },
  {
    id: 3,
    tipo: 'practica_email',
    titulo: 'Práctica 1 — Detecta el phishing',
    desc: 'Sin presión, sin tiempo. Solo analiza este correo y decide. Es tu primer entrenamiento.',
    email: {
      de: 'soporte@g00gle-secure.com',
      para: 'agente@glitchrun.io',
      asunto: 'Tu cuenta de Google será suspendida',
      cuerpo: 'Estimado usuario,\n\nHemos detectado actividad sospechosa en tu cuenta. Para evitar la suspensión inmediata, verifica tus datos en el siguiente enlace:\n\nhttp://g00gle-account-verify.xyz/login\n\nTienes 24 horas para actuar.',
      firma: 'El equipo de seguridad de Google',
    },
    esPhishing: true,
    senales: [
      { texto: 'Dominio falso: g00gle-secure.com (zeros en lugar de o)', color: '#f87171' },
      { texto: 'URL sospechosa: g00gle-account-verify.xyz', color: '#f87171' },
      { texto: 'Urgencia artificial: 24 horas', color: '#fbbf24' },
      { texto: 'Google nunca pide verificación por correo con enlaces externos', color: '#fbbf24' },
    ],
  },
  {
    id: 4,
    tipo: 'practica_password',
    titulo: 'Práctica 2 — Contraseñas',
    desc: 'Elige la contraseña más segura de las siguientes opciones.',
    opciones: [
      { id: 'a', valor: 'password123', segura: false, razon: 'Una de las contraseñas más usadas del mundo. Se crackea en menos de 1 segundo.' },
      { id: 'b', valor: 'MiPerro2024!', segura: false, razon: 'Información personal predecible. Los atacantes usan datos personales en sus ataques.' },
      { id: 'c', valor: 'kX9#mP2$vL7!', segura: true, razon: '12 caracteres aleatorios con mayúsculas, números y símbolos. Tardaría millones de años en crackearse.' },
      { id: 'd', valor: 'Colombia123', segura: false, razon: 'País + número secuencial. Muy predecible y común en diccionarios de ataque.' },
    ],
  },
  {
    id: 5,
    tipo: 'practica_usb',
    titulo: 'Práctica 3 — Decisión rápida',
    desc: 'Situación real. Tienes 10 segundos para decidir.',
    situacion: 'Encuentras un USB en el pasillo de tu empresa con una etiqueta que dice "NÓMINAS CONFIDENCIALES 2025". ¿Qué haces?',
    tiempo: 10,
    opciones: [
      { id: 'a', texto: 'Lo conecto en mi computador para ver qué tiene', correcto: false, razon: 'Error. Los USB abandonados son una táctica clásica de ataque llamada "USB drop". Pueden infectar tu equipo al conectarse.' },
      { id: 'b', texto: 'Lo entrego al área de seguridad sin conectarlo', correcto: true, razon: '¡Correcto! El equipo de seguridad tiene herramientas para analizar el USB sin riesgo.' },
      { id: 'c', texto: 'Lo dejo donde está y no lo toco', correcto: false, razon: 'Mejor que conectarlo, pero lo ideal es reportarlo para que seguridad lo analice.' },
      { id: 'd', texto: 'Lo guardo en mi bolsillo para entregarlo después', correcto: false, razon: 'Guardarlo sin reportarlo puede hacer que alguien más lo encuentre y lo conecte.' },
    ],
  },
  {
    id: 6,
    tipo: 'modulos',
    titulo: 'Tu camino de entrenamiento',
    modulos: [
      { id: 1, titulo: 'Ingeniería Social', desc: 'Phishing, vishing, smishing', icono: '🎭', color: C.cyan, desbloqueado: true },
      { id: 2, titulo: 'Contraseñas y Acceso', desc: 'Autenticación, 2FA, gestores', icono: '🔐', color: C.violet, desbloqueado: true },
      { id: 3, titulo: 'Archivos y Malware', desc: 'Detección, cuarentena, USB', icono: '🦠', color: '#ff4d00', desbloqueado: true },
      { id: 4, titulo: 'Defensa de Red', desc: 'Firewall, IPs, DDoS', icono: '🌐', color: '#3b82f6', desbloqueado: true },
      { id: 5, titulo: 'Análisis Forense', desc: 'Logs, evidencia, rastreo', icono: '🔍', color: '#a78bfa', desbloqueado: true },
      { id: 6, titulo: 'Respuesta a Incidentes', desc: 'Crisis, negociación', icono: '🚨', color: '#f87171', desbloqueado: true },
      { id: 7, titulo: 'Jefe Final — APT-X', desc: 'Integración total', icono: '💀', color: C.pink, desbloqueado: false },
    ],
  },
  {
    id: 7,
    tipo: 'fin',
    titulo: '¡Entrenamiento básico completado!',
  },
]

export default function Tutorial({ session }) {
  const navigate = useNavigate()
  const [paso, setPaso] = useState(0)
  const [historiaMsgs, setHistoriaMsgs] = useState([])
  const [historiaDone, setHistoriaDone] = useState(false)
  const [respuestaEmail, setRespuestaEmail] = useState(null)
  const [mostrarSenales, setMostrarSenales] = useState(false)
  const [respuestaPass, setRespuestaPass] = useState(null)
  const [tiempoUsb, setTiempoUsb] = useState(10)
  const [respuestaUsb, setRespuestaUsb] = useState(null)
  const [tiempoAgotado, setTiempoAgotado] = useState(false)
  const terminalRef = useRef(null)

  const pasoActual = pasos[paso]

  // Historia
  useEffect(() => {
    if (pasoActual?.tipo !== 'historia') return
    setHistoriaMsgs([])
    setHistoriaDone(false)
    pasoActual.mensajes.forEach(msg => {
      setTimeout(() => setHistoriaMsgs(prev => [...prev, msg]), msg.t)
    })
    const ultimo = pasoActual.mensajes[pasoActual.mensajes.length - 1]
    setTimeout(() => setHistoriaDone(true), ultimo.t + 1500)
  }, [paso])

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [historiaMsgs])

  // Timer USB
  useEffect(() => {
    if (pasoActual?.tipo !== 'practica_usb' || respuestaUsb || tiempoAgotado) return
    if (tiempoUsb <= 0) { setTiempoAgotado(true); return }
    const t = setTimeout(() => setTiempoUsb(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [pasoActual, tiempoUsb, respuestaUsb, tiempoAgotado])

  function siguiente() {
    if (paso + 1 >= pasos.length) return
    setPaso(i => i + 1)
    setRespuestaEmail(null)
    setMostrarSenales(false)
    setRespuestaPass(null)
    setTiempoUsb(10)
    setRespuestaUsb(null)
    setTiempoAgotado(false)
  }

  const tiempoColor = tiempoUsb > 6 ? '#4ade80' : tiempoUsb > 3 ? '#fbbf24' : '#f87171'

  // ===== INTRO =====
  if (pasoActual.tipo === 'intro') return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', color: '#e2e8f0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,255,247,0.04) 0%, transparent 70%)' }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '600px', padding: '40px' }}>
        <img src="/icon.png" alt="GlitchRun" style={{ width: '160px', height: 'auto', marginBottom: '32px', filter: 'drop-shadow(0 0 20px rgba(0,255,247,0.6))' }} />
        <div style={{ fontSize: '14px', color: C.cyan, letterSpacing: '4px', marginBottom: '16px', fontWeight: 700 }}>CENTRO DE ENTRENAMIENTO</div>
        <div style={{ fontSize: '40px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>
          <span style={{ color: C.cyan }}>GLITCH</span><span style={{ color: C.pink }}>RUN</span>
        </div>
        <div style={{ fontSize: '18px', color: '#64748b', marginBottom: '40px' }}>Academia Interactiva de Ciberseguridad</div>
        <div style={{ fontSize: '15px', color: '#94a3b8', lineHeight: '1.8', marginBottom: '40px' }}>
          Aprende ciberseguridad de forma práctica e inmersiva. Enfréntate a amenazas reales, toma decisiones bajo presión y conviértete en un agente de defensa digital.
        </div>
        <button onClick={siguiente} style={{ padding: '18px 48px', borderRadius: '12px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '18px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '1px' }}>
          COMENZAR ENTRENAMIENTO →
        </button>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '16px' }}>~15 minutos · Tutorial completo</div>
      </div>
    </div>
  )

  // ===== HISTORIA =====
  if (pasoActual.tipo === 'historia') return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', color: '#e2e8f0', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', letterSpacing: '3px', marginBottom: '24px', textAlign: 'center' }}>BRIEFING INICIAL</div>
        <div ref={terminalRef} style={{ background: '#050810', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '32px', minHeight: '300px', fontFamily: 'monospace', marginBottom: '32px', overflowY: 'auto', maxHeight: '400px' }}>
          <div style={{ color: C.cyan, marginBottom: '16px', fontSize: '13px' }}>{'>'} SISTEMA GLITCHRUN — INICIALIZANDO...</div>
          {historiaMsgs.map((msg, i) => (
            <div key={i} style={{ color: msg.color, marginBottom: '14px', fontSize: '16px', lineHeight: '1.7' }}>
              {'>'} {msg.texto}
            </div>
          ))}
          {!historiaDone && <div style={{ color: '#64748b' }}>{'>'} █</div>}
        </div>
        {historiaDone && (
          <div style={{ textAlign: 'center' }}>
            <button onClick={siguiente} style={{ padding: '16px 40px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '17px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
              Entendido, continuar →
            </button>
          </div>
        )}
      </div>
    </div>
  )

  // ===== MECÁNICAS =====
  if (pasoActual.tipo === 'mecanicas') return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', color: '#e2e8f0', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '13px', color: C.cyan, letterSpacing: '3px', marginBottom: '12px' }}>CÓMO FUNCIONA</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'white' }}>{pasoActual.titulo}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '40px' }}>
          {pasoActual.items.map((item, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '14px' }}>{item.icono}</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: C.cyan, marginBottom: '8px' }}>{item.titulo}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.7' }}>{item.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={siguiente} style={{ padding: '16px 40px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '17px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            ¡Vamos a practicar! →
          </button>
        </div>
      </div>
    </div>
  )

  // ===== PRÁCTICA EMAIL =====
  if (pasoActual.tipo === 'practica_email') return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: '60px', background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div>
          <div style={{ fontSize: '11px', color: C.cyan, letterSpacing: '2px' }}>PRÁCTICA 1/3 — SIN PENALIZACIÓN</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>{pasoActual.titulo}</div>
        </div>
        <div style={{ fontSize: '13px', color: '#64748b', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', padding: '6px 14px', borderRadius: '8px', color: '#4ade80' }}>
          🟢 MODO ENTRENAMIENTO
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', flex: 1, overflow: 'hidden' }}>
        <div style={{ overflowY: 'auto', padding: '28px' }}>
          <div style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '20px' }}>{pasoActual.desc}</div>

          {/* EMAIL */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(248,113,113,0.2)', border: '2px solid #f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>G</div>
              <div>
                <div style={{ fontSize: '14px', color: '#f87171', fontWeight: 600 }}>{pasoActual.email.de}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>para: {pasoActual.email.para}</div>
              </div>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>{pasoActual.email.asunto}</div>
            <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.9', whiteSpace: 'pre-line', marginBottom: '16px' }}>{pasoActual.email.cuerpo}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>{pasoActual.email.firma}</div>
          </div>

          {!respuestaEmail ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { sonidoExito(); setRespuestaEmail('phishing') }}
                style={{ flex: 1, padding: '16px', borderRadius: '10px', border: '2px solid #f87171', background: 'rgba(248,113,113,0.08)', color: '#f87171', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                🚨 Es phishing
              </button>
              <button onClick={() => { sonidoError(); setRespuestaEmail('seguro') }}
                style={{ flex: 1, padding: '16px', borderRadius: '10px', border: '2px solid #4ade80', background: 'rgba(74,222,128,0.08)', color: '#4ade80', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                ✅ Es seguro
              </button>
            </div>
          ) : (
            <div>
              <div style={{ background: respuestaEmail === 'phishing' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${respuestaEmail === 'phishing' ? '#4ade8044' : '#f8717144'}`, borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ fontSize: '17px', fontWeight: 700, color: respuestaEmail === 'phishing' ? '#4ade80' : '#f87171', marginBottom: '8px' }}>
                  {respuestaEmail === 'phishing' ? '✅ ¡Correcto! Es phishing' : '❌ Era phishing — revisa las señales'}
                </div>
                <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                  {respuestaEmail === 'phishing' ? 'Excelente análisis. Identificaste las señales correctamente.' : 'No te preocupes, es tu primer entrenamiento. Revisa las señales a la derecha.'}
                </div>
              </div>
              <button onClick={() => { setMostrarSenales(true); setTimeout(siguiente, 3000) }}
                style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Ver señales y continuar →
              </button>
            </div>
          )}
        </div>

        {/* PANEL DERECHO */}
        <div style={{ background: C.sidebar, borderLeft: `1px solid ${C.border}`, overflowY: 'auto', padding: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: C.cyan, letterSpacing: '2px', marginBottom: '16px' }}>🔍 ANÁLISIS</div>
          {!mostrarSenales ? (
            <div style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>
              Analiza el correo y toma tu decisión primero.<br /><br />Las señales aparecerán después.
            </div>
          ) : (
            <>
              <div style={{ fontSize: '13px', color: '#f87171', fontWeight: 700, marginBottom: '12px' }}>🚨 SEÑALES DE PHISHING</div>
              {pasoActual.senales.map((s, i) => (
                <div key={i} style={{ background: s.color === '#f87171' ? 'rgba(248,113,113,0.08)' : 'rgba(251,191,36,0.08)', border: `1px solid ${s.color}33`, borderRadius: '8px', padding: '12px', marginBottom: '8px', fontSize: '13px', color: s.color }}>
                  {s.texto}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )

  // ===== PRÁCTICA CONTRASEÑA =====
  if (pasoActual.tipo === 'practica_password') return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: '60px', background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div>
          <div style={{ fontSize: '11px', color: C.cyan, letterSpacing: '2px' }}>PRÁCTICA 2/3 — SIN PENALIZACIÓN</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>{pasoActual.titulo}</div>
        </div>
        <div style={{ fontSize: '13px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', padding: '6px 14px', borderRadius: '8px', color: '#4ade80' }}>
          🟢 MODO ENTRENAMIENTO
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '700px' }}>
          <div style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '28px', textAlign: 'center' }}>{pasoActual.desc}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {pasoActual.opciones.map(op => (
              <div key={op.id} onClick={() => { if (!respuestaPass) { op.segura ? sonidoExito() : sonidoError(); setRespuestaPass(op) } }}
                style={{ padding: '18px 22px', borderRadius: '12px', border: `2px solid ${respuestaPass ? (op.segura ? '#4ade80' : '#f87171') : C.border}`, background: respuestaPass ? (op.segura ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.04)') : C.card, cursor: respuestaPass ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: respuestaPass ? '8px' : '0' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '18px', color: '#e2e8f0', letterSpacing: '2px' }}>{op.valor}</span>
                  {respuestaPass && <span style={{ fontSize: '20px' }}>{op.segura ? '✅' : '❌'}</span>}
                </div>
                {respuestaPass && <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>{op.razon}</div>}
              </div>
            ))}
          </div>

          {respuestaPass && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: respuestaPass.segura ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${respuestaPass.segura ? '#4ade8044' : '#f8717144'}`, borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: respuestaPass.segura ? '#4ade80' : '#f87171' }}>
                  {respuestaPass.segura ? '✅ ¡Correcto!' : '❌ No era la más segura — revisa todas las razones'}
                </div>
              </div>
              <button onClick={siguiente} style={{ padding: '14px 32px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Siguiente práctica →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ===== PRÁCTICA USB =====
  if (pasoActual.tipo === 'practica_usb') return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: '60px', background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div>
          <div style={{ fontSize: '11px', color: C.cyan, letterSpacing: '2px' }}>PRÁCTICA 3/3 — DECISIÓN RÁPIDA</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>{pasoActual.titulo}</div>
        </div>
        {!respuestaUsb && !tiempoAgotado && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `${tiempoColor}11`, border: `1px solid ${tiempoColor}44`, borderRadius: '8px', padding: '6px 16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tiempoColor }} />
            <span style={{ fontSize: '20px', fontWeight: 900, color: tiempoColor, fontFamily: 'monospace' }}>{tiempoUsb}s</span>
          </div>
        )}
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '700px' }}>
          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px', padding: '24px', marginBottom: '28px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔌</div>
            <div style={{ fontSize: '16px', color: '#e2e8f0', lineHeight: '1.8' }}>{pasoActual.situacion}</div>
          </div>

          {!tiempoAgotado && !respuestaUsb ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pasoActual.opciones.map(op => (
                <button key={op.id} onClick={() => { op.correcto ? sonidoExito() : sonidoError(); setRespuestaUsb(op) }}
                  style={{ padding: '16px 20px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.card, color: '#e2e8f0', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                  {op.texto}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ background: tiempoAgotado ? 'rgba(251,191,36,0.08)' : respuestaUsb?.correcto ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${tiempoAgotado ? '#fbbf2444' : respuestaUsb?.correcto ? '#4ade8044' : '#f8717144'}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ fontSize: '17px', fontWeight: 700, color: tiempoAgotado ? '#fbbf24' : respuestaUsb?.correcto ? '#4ade80' : '#f87171', marginBottom: '8px' }}>
                  {tiempoAgotado ? '⏱ Tiempo agotado — en la vida real ya era tarde' : respuestaUsb?.correcto ? '✅ ¡Correcto!' : '❌ No era la mejor decisión'}
                </div>
                <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.7' }}>
                  {tiempoAgotado ? 'La indecisión también es una decisión. En ciberseguridad, la inacción puede costar caro.' : respuestaUsb?.razon}
                </div>
              </div>

              {/* Mostrar todas las opciones con explicación */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: '#64748b', letterSpacing: '1px', marginBottom: '12px' }}>ANÁLISIS DE TODAS LAS OPCIONES:</div>
                {pasoActual.opciones.map(op => (
                  <div key={op.id} style={{ background: op.correcto ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.04)', border: `1px solid ${op.correcto ? '#4ade8033' : '#f8717122'}`, borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span>{op.correcto ? '✅' : '❌'}</span>
                      <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{op.texto}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '24px' }}>{op.razon}</div>
                  </div>
                ))}
              </div>

              <button onClick={siguiente} style={{ padding: '14px 32px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Ver los módulos →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ===== MÓDULOS =====
  if (pasoActual.tipo === 'modulos') return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '13px', color: C.cyan, letterSpacing: '3px', marginBottom: '12px' }}>TU CAMINO</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'white' }}>{pasoActual.titulo}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '40px' }}>
          {pasoActual.modulos.map((mod, i) => (
            <div key={mod.id} style={{ background: mod.desbloqueado ? C.card : 'rgba(255,255,255,0.02)', border: `1px solid ${mod.desbloqueado ? mod.color + '33' : C.border}`, borderRadius: '12px', padding: '20px', textAlign: 'center', opacity: mod.desbloqueado ? 1 : 0.5 }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>{mod.desbloqueado ? mod.icono : '🔒'}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: mod.desbloqueado ? mod.color : '#64748b', marginBottom: '6px' }}>{mod.titulo}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{mod.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={siguiente} style={{ padding: '18px 48px', borderRadius: '12px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '18px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            ¡Comenzar misiones reales! →
          </button>
        </div>
      </div>
    </div>
  )

  // ===== FIN =====
  if (pasoActual.tipo === 'fin') return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', color: '#e2e8f0', padding: '40px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,255,247,0.05) 0%, transparent 70%)' }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎖</div>
        <div style={{ fontSize: '14px', color: C.cyan, letterSpacing: '4px', marginBottom: '12px' }}>ENTRENAMIENTO COMPLETADO</div>
        <div style={{ fontSize: '36px', fontWeight: 900, color: 'white', marginBottom: '16px' }}>{pasoActual.titulo}</div>
        <div style={{ fontSize: '16px', color: '#94a3b8', lineHeight: '1.8', marginBottom: '40px' }}>
          Has completado el tutorial de GlitchRun. Ahora conoces las mecánicas básicas de ciberseguridad y cómo funciona el juego.<br /><br />
          <span style={{ color: C.cyan, fontWeight: 600 }}>El verdadero entrenamiento empieza ahora.</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={() => { sonidoMisionCompleta(); guardarProgreso(8, 100); navigate('/') }} style={{ padding: '18px 48px', borderRadius: '12px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '18px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            🏠 Ir al Hub → Empezar Misión 1
          </button>
        </div>
      </div>
    </div>
  )

  return null
}