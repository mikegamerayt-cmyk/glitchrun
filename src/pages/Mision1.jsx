import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { guardarProgreso } from '../utils/progreso'
import { sonidoExito, sonidoError, sonidoMisionCompleta } from '../utils/sonidos'

const C = {
  cyan: '#00fff7', violet: '#a855f7', pink: '#f472b6',
  bg: '#080b18', sidebar: '#0b0f1e', card: '#0f1326',
  border: 'rgba(255,255,255,0.1)',
}

const emails = [
  {
    id: 0,
    remitente: 'Soporte TI',
    email: 'soporte-ti@seguridad-empresaa.com',
    para: 'usuario@glitchrun.com',
    hora: 'Hoy, 09:42 AM',
    asunto: '[URGENTE] Tu contraseña expirará en 24 horas',
    cuerpo: [
      { tipo: 'texto', contenido: 'Hola usuario,' },
      { tipo: 'parrafo', contenido: 'Te informamos que tu contraseña expirará en menos de 24 horas debido a una actualización de seguridad obligatoria.' },
      { tipo: 'parrafo', contenido: 'Para evitar la suspensión de tu cuenta, inicia sesión ahora y actualiza tu contraseña:' },
      { tipo: 'enlace', contenido: 'https://seguridad-empresaa.com/actualizar' },
      { tipo: 'parrafo', contenido: 'Si no realizas este cambio, tu cuenta será bloqueada automáticamente.' },
      { tipo: 'firma', contenido: 'Gracias,\nSoporte Técnico\n© 2025 Seguridad Empresarial' },
    ],
    pistas: [
      'El dominio del remitente tiene una "a" extra: empresaa.com',
      'Ninguna empresa legítima pide cambiar contraseña por correo con urgencia',
      'El enlace apunta a empresaa.com, no al dominio oficial',
      'SPF: FAIL — el correo no viene del servidor oficial',
    ],
    senales: [
      { nivel: 'ALTA', titulo: 'Remitente sospechoso', desc: 'El dominio tiene una "a" extra: empresaa.com' },
      { nivel: 'ALTA', titulo: 'URL falsa', desc: 'El enlace no coincide con ningún dominio corporativo real' },
      { nivel: 'MEDIA', titulo: 'Urgencia artificial', desc: 'Presión de tiempo para que actúes sin pensar' },
      { nivel: 'MEDIA', titulo: 'SPF: FAIL', desc: 'El servidor de envío no está autorizado por el dominio' },
    ],
    esPhishing: true,
  },
  {
    id: 1,
    remitente: 'Bancolombia',
    email: 'notificaciones@bancolombia.com.co',
    para: 'usuario@glitchrun.com',
    hora: 'Hoy, 10:15 AM',
    asunto: 'Tu transferencia fue exitosa',
    cuerpo: [
      { tipo: 'texto', contenido: 'Estimado cliente,' },
      { tipo: 'parrafo', contenido: 'Te confirmamos que tu transferencia de $150.000 COP fue procesada exitosamente el día de hoy.' },
      { tipo: 'parrafo', contenido: 'Puedes consultar el detalle en tu app Bancolombia o en cualquier sucursal.' },
      { tipo: 'firma', contenido: 'Bancolombia\nNo respondas a este correo.' },
    ],
    pistas: [
      'El dominio bancolombia.com.co es el oficial de Bancolombia',
      'El correo no pide hacer clic en ningún enlace',
      'No hay urgencia ni presión para actuar',
      'SPF: PASS — viene del servidor oficial',
    ],
    senales: [
      { nivel: 'OK', titulo: 'Remitente verificado', desc: 'Dominio oficial bancolombia.com.co' },
      { nivel: 'OK', titulo: 'Sin enlaces sospechosos', desc: 'No solicita clics ni datos' },
      { nivel: 'OK', titulo: 'Sin urgencia', desc: 'Mensaje informativo sin presión' },
      { nivel: 'OK', titulo: 'SPF: PASS', desc: 'Servidor de envío autorizado' },
    ],
    esPhishing: false,
  },
  {
    id: 2,
    remitente: 'RRHH Corporativo',
    email: 'rrhh@empresa-nomina-pagos.net',
    para: 'usuario@glitchrun.com',
    hora: 'Hoy, 11:30 AM',
    asunto: 'Actualización urgente de datos bancarios',
    cuerpo: [
      { tipo: 'texto', contenido: 'Estimado colaborador,' },
      { tipo: 'parrafo', contenido: 'Para procesar el pago de nómina del presente mes, necesitamos que actualices tus datos bancarios antes del viernes.' },
      { tipo: 'parrafo', contenido: 'Por favor adjunta foto de tu cédula y número de cuenta al siguiente formulario:' },
      { tipo: 'enlace', contenido: 'http://formulario-rrhh-pagos.com/datos' },
      { tipo: 'firma', contenido: 'Departamento de Recursos Humanos' },
    ],
    pistas: [
      'El dominio empresa-nomina-pagos.net no es un dominio corporativo oficial',
      'RRHH nunca pide cédula ni datos bancarios por correo',
      'El enlace usa HTTP sin cifrado, no HTTPS',
      'DKIM: FAIL — firma digital inválida',
    ],
    senales: [
      { nivel: 'ALTA', titulo: 'Dominio falso', desc: 'empresa-nomina-pagos.net no es corporativo' },
      { nivel: 'ALTA', titulo: 'Solicita documentos', desc: 'Pide cédula y datos bancarios por correo' },
      { nivel: 'MEDIA', titulo: 'HTTP sin cifrado', desc: 'El enlace no usa HTTPS, es inseguro' },
      { nivel: 'MEDIA', titulo: 'DKIM: FAIL', desc: 'La firma digital del correo es inválida' },
    ],
    esPhishing: true,
  },
  {
    id: 3,
    remitente: 'Spotify',
    email: 'no-reply@spotify.com',
    para: 'usuario@glitchrun.com',
    hora: 'Hoy, 02:00 PM',
    asunto: 'Tu resumen de mayo está listo 🎵',
    cuerpo: [
      { tipo: 'texto', contenido: 'Hola,' },
      { tipo: 'parrafo', contenido: 'Tu resumen de escucha de mayo 2025 ya está disponible. Este mes escuchaste 47 horas de música.' },
      { tipo: 'parrafo', contenido: 'Descubre tus artistas más escuchados y géneros favoritos directamente en la app.' },
      { tipo: 'firma', contenido: 'El equipo de Spotify\nno-reply@spotify.com' },
    ],
    pistas: [
      'El dominio spotify.com es el oficial',
      'No pide datos, clics ni contraseñas',
      'Es un resumen esperado de la plataforma',
      'SPF y DKIM: PASS',
    ],
    senales: [
      { nivel: 'OK', titulo: 'Dominio oficial', desc: 'spotify.com verificado' },
      { nivel: 'OK', titulo: 'Sin solicitudes', desc: 'No pide datos ni acciones' },
      { nivel: 'OK', titulo: 'Contenido esperado', desc: 'Resumen mensual normal' },
      { nivel: 'OK', titulo: 'SPF y DKIM: PASS', desc: 'Autenticación completa' },
    ],
    esPhishing: false,
  },
]

function nivelColor(nivel) {
  if (nivel === 'ALTA') return '#f87171'
  if (nivel === 'MEDIA') return '#fbbf24'
  if (nivel === 'OK') return '#4ade80'
  return '#94a3b8'
}

const TIEMPO_TOTAL = 60

export default function Mision1({ session }) {
  const navigate = useNavigate()
  const [emailIndex, setEmailIndex] = useState(0)
  const [answered, setAnswered] = useState({})
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [decidido, setDecidido] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [tiempo, setTiempo] = useState(TIEMPO_TOTAL)
  const [pistaIndex, setPistaIndex] = useState(0)
  const [showHeaders, setShowHeaders] = useState(false)
  const [spam, setSpam] = useState([])
  const [bandeja, setBandeja] = useState('entrada')

  const email = emails[emailIndex]

  // Temporizador
  useEffect(() => {
    if (decidido || finished) return
    if (tiempo <= 0) {
      handleJudge(null) // tiempo agotado
      return
    }
    const t = setTimeout(() => setTiempo(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [tiempo, decidido, finished])

  // Pistas progresivas cada 15 segundos
  useEffect(() => {
    if (decidido || finished) return
    if (pistaIndex >= email.pistas.length) return
    const t = setTimeout(() => setPistaIndex(p => p + 1), 15000)
    return () => clearTimeout(t)
  }, [pistaIndex, decidido, finished, emailIndex])

  function handleJudge(esPhishing) {
    if (decidido) return
    setDecidido(true)

    const tiempoAgotado = esPhishing === null
    const correct = !tiempoAgotado && esPhishing === email.esPhishing
    const pts = tiempoAgotado ? 0 : correct ? 50 + Math.floor(tiempo / 2) : 0

    setAnswered(prev => ({ ...prev, [email.id]: esPhishing }))
    setScore(prev => prev + pts)
    if (!tiempoAgotado) correct ? sonidoExito() : sonidoError()
    setResultado({ correct, tiempoAgotado, pts })


    if (esPhishing === true) {
      setSpam(prev => [...prev, email.id])
    }
  }

  function siguiente() {
    if (emailIndex + 1 >= emails.length) {
      sonidoMisionCompleta()
      setFinished(true)
      guardarProgreso(1, score)
      return
    }
    
    setEmailIndex(i => i + 1)
    setDecidido(false)
    setResultado(null)
    setTiempo(TIEMPO_TOTAL)
    setPistaIndex(0)
    setShowHeaders(false)
  }

  const tiempoColor = tiempo > 30 ? '#4ade80' : tiempo > 15 ? '#fbbf24' : '#f87171'
  const tiempoPct = (tiempo / TIEMPO_TOTAL) * 100

  if (finished) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', color: '#e2e8f0' }}>
      <div style={{ background: C.sidebar, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '56px', textAlign: 'center', maxWidth: '520px', width: '100%' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎯</div>
        <div style={{ fontSize: '14px', color: '#64748b', letterSpacing: '2px', marginBottom: '10px' }}>MISIÓN 1 COMPLETADA</div>
        <div style={{ fontSize: '32px', fontWeight: 800, color: C.cyan, marginBottom: '10px' }}>
          {score >= 180 ? '¡Perfecto!' : score >= 100 ? 'Muy bien' : 'Sigue practicando'}
        </div>
        <div style={{ fontSize: '48px', fontWeight: 900, color: '#fbbf24', marginBottom: '10px' }}>+{score} XP</div>
        <div style={{ fontSize: '16px', color: '#64748b', marginBottom: '36px' }}>
          {Object.values(answered).filter((v, i) => v === emails[i]?.esPhishing).length} de {emails.length} correos clasificados correctamente
        </div>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/')} style={{ padding: '14px 28px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: '#94a3b8', fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Volver al Hub
          </button>
          <button onClick={() => navigate('/mision/2')} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Siguiente misión →
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', fontSize: '16px', display: 'flex', flexDirection: 'column' }}>

      {/* TOPBAR */}
      <header style={{ height: '64px', background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '22px' }}>←</button>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '2px' }}>MÓDULO 1 · INGENIERÍA SOCIAL</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: C.cyan }}>Misión 1 — Analiza el correo</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Correo <span style={{ color: C.cyan, fontWeight: 700 }}>{emailIndex + 1}</span> de <span style={{ color: C.cyan }}>{emails.length}</span>
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#fbbf24' }}>⚡ {score} XP</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', flex: 1, overflow: 'hidden' }}>

        {/* BANDEJA IZQUIERDA */}
        <div style={{ background: C.sidebar, borderRight: `1px solid ${C.border}`, overflowY: 'auto' }}>
          {[
            { id: 'entrada', label: 'Bandeja de entrada', icon: '📥', count: emails.length - Object.keys(answered).length },
            { id: 'enviados', label: 'Enviados', icon: '📤', count: Object.keys(answered).filter(id => answered[id] === false).length },
            { id: 'borradores', label: 'Borradores', icon: '📝', count: 0 },
            { id: 'papelera', label: 'Papelera', icon: '🗑', count: 0 },
            { id: 'spam', label: 'Spam', icon: '🛡', count: spam.length },
          ].map((item) => (
            <div key={item.id} onClick={() => setBandeja(item.id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer', background: bandeja === item.id ? `${C.cyan}0f` : 'transparent', borderLeft: bandeja === item.id ? `3px solid ${C.cyan}` : '3px solid transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: bandeja === item.id ? C.cyan : '#94a3b8' }}>
                <span>{item.icon}</span> {item.label}
              </div>
              {item.count > 0 && <span style={{ background: item.id === 'spam' ? '#f87171' : C.cyan, color: '#080b18', borderRadius: '10px', padding: '2px 8px', fontSize: '12px', fontWeight: 700 }}>{item.count}</span>}
            </div>
          ))}

          <div style={{ borderTop: `1px solid ${C.border}`, padding: '12px 18px', fontSize: '12px', color: '#64748b', letterSpacing: '1px' }}>
            {bandeja === 'spam' ? 'CORREOS EN SPAM' : bandeja === 'enviados' ? 'CORREOS SEGUROS' : 'CORREO ACTUAL'}
          </div>

          {bandeja === 'entrada' && (
            <div style={{ padding: '14px 18px', background: `${C.violet}0f`, borderLeft: `3px solid ${C.violet}`, margin: '0 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>{email.remitente}</div>
              <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.asunto}</div>
            </div>
          )}

          {bandeja === 'spam' && spam.map(id => {
            const e = emails.find(x => x.id === id)
            return (
              <div key={id} style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f87171', marginBottom: '4px' }}>{e.remitente}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{e.asunto}</div>
              </div>
            )
          })}

          {bandeja === 'enviados' && Object.keys(answered).filter(id => answered[id] === false).map(id => {
            const e = emails.find(x => x.id === parseInt(id))
            return e ? (
              <div key={id} style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#4ade80', marginBottom: '4px' }}>{e.remitente}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{e.asunto}</div>
              </div>
            ) : null
          })}
        </div>

        {/* VISOR CENTRAL */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: `1px solid ${C.border}` }}>

          {/* TEMPORIZADOR */}
          {!decidido && (
            <div style={{ padding: '12px 24px', background: C.card, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>⏱ Tiempo para decidir</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: tiempoColor }}>{tiempo}s</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>
                <div style={{ height: '100%', borderRadius: '3px', background: tiempoColor, width: `${tiempoPct}%`, transition: 'width 1s linear, background 0.3s' }} />
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

            {/* CABECERA EMAIL */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${C.violet}, ${C.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#080b18', flexShrink: 0 }}>
                  {email.remitente[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>{email.remitente}</span>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{'<'}{email.email}{'>'}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>para: {email.para} · {email.hora}</div>
                </div>
              </div>
              <div style={{ fontSize: '19px', fontWeight: 700, color: 'white' }}>{email.asunto}</div>
            </div>

            {/* CUERPO */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px', marginBottom: '16px', lineHeight: '1.9', fontSize: '15px', color: '#94a3b8' }}>
              {email.cuerpo.map((bloque, i) => {
                if (bloque.tipo === 'enlace') return (
                  <div key={i} style={{ margin: '12px 0', padding: '10px 14px', background: '#080b18', border: `1px solid ${C.border}`, borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px', color: C.cyan }}>
                    🔗 {bloque.contenido}
                  </div>
                )
                if (bloque.tipo === 'firma') return (
                  <div key={i} style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${C.border}`, whiteSpace: 'pre-line', color: '#64748b', fontSize: '14px' }}>{bloque.contenido}</div>
                )
                if (bloque.tipo === 'parrafo') return <p key={i} style={{ margin: '8px 0' }}>{bloque.contenido}</p>
                return <span key={i}>{bloque.contenido}</span>
              })}
            </div>

            {/* ENCABEZADOS TÉCNICOS */}
            {showHeaders && (
              <div style={{ background: '#080b18', border: `1px solid ${C.violet}44`, borderRadius: '10px', padding: '16px', marginBottom: '16px', fontFamily: 'monospace', fontSize: '13px', color: '#94a3b8' }}>
                <div style={{ color: C.violet, fontWeight: 700, marginBottom: '10px' }}>{'</>'} ENCABEZADOS TÉCNICOS</div>
                <div style={{ marginBottom: '4px' }}>From: <span style={{ color: email.esPhishing ? '#f87171' : '#4ade80' }}>{email.email}</span></div>
                <div style={{ marginBottom: '4px' }}>Reply-To: <span style={{ color: email.esPhishing ? '#f87171' : '#4ade80' }}>{email.esPhishing ? 'no-reply@fake-domain.ru' : email.email}</span></div>
                <div style={{ marginBottom: '4px' }}>X-Spam-Score: <span style={{ color: email.esPhishing ? '#f87171' : '#4ade80' }}>{email.esPhishing ? '8.4 (ALTA)' : '0.1 (BAJA)'}</span></div>
                <div style={{ marginBottom: '4px' }}>SPF: <span style={{ color: email.esPhishing ? '#f87171' : '#4ade80' }}>{email.esPhishing ? 'FAIL' : 'PASS'}</span></div>
                <div>DKIM: <span style={{ color: email.esPhishing ? '#f87171' : '#4ade80' }}>{email.esPhishing ? 'FAIL' : 'PASS'}</span></div>
              </div>
            )}

            {/* RESULTADO */}
            {resultado && (
              <div style={{ background: resultado.tiempoAgotado ? 'rgba(251,191,36,0.08)' : resultado.correct ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${resultado.tiempoAgotado ? '#fbbf2444' : resultado.correct ? '#4ade8044' : '#f8717144'}`, borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: resultado.tiempoAgotado ? '#fbbf24' : resultado.correct ? '#4ade80' : '#f87171', marginBottom: '8px' }}>
                  {resultado.tiempoAgotado ? '⏱ Tiempo agotado' : resultado.correct ? '✅ Correcto' : '❌ Incorrecto'} {resultado.pts > 0 && `· +${resultado.pts} XP`}
                </div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px' }}>
                  {email.esPhishing ? 'Este correo era phishing. Revisa las señales en el panel derecho.' : 'Este correo era legítimo. Revisa los indicadores de seguridad a la derecha.'}
                </div>
                <button onClick={siguiente} style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {emailIndex + 1 >= emails.length ? 'Ver resultados →' : 'Siguiente correo →'}
                </button>
              </div>
            )}

            {/* ACCIONES */}
            {!decidido && (
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', letterSpacing: '2px', marginBottom: '12px', fontWeight: 600 }}>¿QUÉ HARÁS?</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <button onClick={() => handleJudge(false)}
                    style={{ padding: '18px', borderRadius: '12px', border: '2px solid #4ade80', background: 'rgba(74,222,128,0.08)', color: '#4ade80', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '24px' }}>🛡</span>
                    ES LEGÍTIMO
                    <span style={{ fontSize: '12px', fontWeight: 400, color: '#94a3b8' }}>Parece seguro</span>
                  </button>
                  <button onClick={() => handleJudge(true)}
                    style={{ padding: '18px', borderRadius: '12px', border: '2px solid #f87171', background: 'rgba(248,113,113,0.08)', color: '#f87171', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '24px' }}>🚨</span>
                    ES PHISHING
                    <span style={{ fontSize: '12px', fontWeight: 400, color: '#94a3b8' }}>Detecté señales de alerta</span>
                  </button>
                </div>
                <button onClick={() => setShowHeaders(!showHeaders)}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `2px solid ${C.cyan}`, background: `${C.cyan}0f`, color: C.cyan, fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {'</>'} {showHeaders ? 'OCULTAR' : 'VER'} ENCABEZADOS TÉCNICOS
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO — PISTAS */}
        <div style={{ background: C.sidebar, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: C.cyan, letterSpacing: '2px', marginBottom: '16px' }}>
              💡 PISTAS DESCUBIERTAS
            </div>

            {/* Pistas progresivas */}
            {pistaIndex === 0 && !decidido && (
              <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
                Analiza el correo...<br />Las pistas aparecerán pronto
              </div>
            )}

            {email.pistas.slice(0, decidido ? email.pistas.length : pistaIndex).map((pista, i) => (
              <div key={i} style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', padding: '12px 14px', marginBottom: '10px', fontSize: '13px', color: '#fbbf24', display: 'flex', gap: '8px' }}>
                <span>💡</span> {pista}
              </div>
            ))}

            {/* Señales — solo después de decidir */}
            {decidido && (
              <>
                <div style={{ fontSize: '13px', fontWeight: 700, color: email.esPhishing ? '#f87171' : '#4ade80', letterSpacing: '2px', margin: '16px 0 12px' }}>
                  {email.esPhishing ? '🚨 SEÑALES DE ALERTA' : '✅ INDICADORES SEGUROS'}
                </div>
                {email.senales.map((s, i) => (
                  <div key={i} style={{ background: s.nivel === 'OK' ? 'rgba(74,222,128,0.08)' : s.nivel === 'ALTA' ? 'rgba(248,113,113,0.08)' : 'rgba(251,191,36,0.08)', border: `1px solid ${nivelColor(s.nivel)}33`, borderRadius: '10px', padding: '12px 14px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{s.titulo}</div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: nivelColor(s.nivel), background: `${nivelColor(s.nivel)}22`, padding: '2px 8px', borderRadius: '6px' }}>{s.nivel}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{s.desc}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}