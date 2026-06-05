import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { guardarProgreso } from '../utils/progreso'
import { sonidoExito, sonidoError, sonidoMisionCompleta } from '../utils/sonidos'

const C = {
  cyan: '#00fff7', violet: '#a855f7', pink: '#f472b6',
  bg: '#080b18', sidebar: '#0b0f1e', card: '#0f1326',
  border: 'rgba(255,255,255,0.1)',
}

// ============ LLAMADAS ============
const llamadas = [
  {
    id: 0,
    titulo: 'Llamada 1 — Soporte corporativo',
    dificultad: 'FÁCIL',
    caller: 'Carlos — Soporte TI',
    initials: 'CS',
    esLegitima: false,
    guion: [
      { de: 'carlos', texto: 'Buenos días, ¿hablo con el usuario de la cuenta corporativa?', tiempo: 1000 },
      { de: 'carlos', texto: 'Soy Carlos del departamento de soporte técnico. Hemos detectado actividad inusual en su cuenta.', tiempo: 4000 },
      { de: 'carlos', texto: 'No se preocupe, es un procedimiento rutinario. Solo necesito verificar su identidad.', tiempo: 7000 },
      { de: 'carlos', texto: 'Para confirmar que es usted, ¿me puede proporcionar su contraseña actual? Es solo para verificación.', tiempo: 11000 },
      { de: 'carlos', texto: '¿Sigue ahí? Es urgente, tenemos que resolver esto antes de que el sistema se bloquee.', tiempo: 15000 },
      { de: 'carlos', texto: 'Mire, si no verificamos en los próximos 2 minutos, su cuenta quedará suspendida indefinidamente.', tiempo: 19000 },
    ],
    opciones: [
      { id: 'verificar', texto: '¿Cuál es su número de empleado y extensión interna?', xp: 150, correcto: true, desc: 'Pedir identificación es la respuesta correcta.' },
      { id: 'partial', texto: 'Le doy los últimos 4 dígitos de mi contraseña para verificar.', xp: -200, correcto: false, desc: 'Dar incluso parte de tu contraseña es un error grave.' },
      { id: 'compartir', texto: 'Está bien, mi contraseña es: MiClave123.', xp: -250, correcto: false, desc: 'Nunca compartas tu contraseña con nadie.' },
      { id: 'colgar', texto: 'No voy a dar ningún dato. Voy a colgar y llamar al número oficial.', xp: 180, correcto: true, desc: 'La mejor respuesta. Siempre verifica llamando al número oficial.' },
    ],
  },
  {
    id: 1,
    titulo: 'Llamada 2 — Bancolombia',
    dificultad: 'FÁCIL',
    caller: 'Bancolombia — Servicio al cliente',
    initials: 'BC',
    esLegitima: true,
    guion: [
      { de: 'carlos', texto: 'Buenos días, le llama Bancolombia desde nuestra línea oficial 604 444 2222. ¿Hablo con el titular de la cuenta?', tiempo: 1000 },
      { de: 'carlos', texto: 'Le informamos que detectamos un intento de transacción por $2.500.000 desde una IP en el exterior. Por seguridad la bloqueamos automáticamente.', tiempo: 3000 },
      { de: 'carlos', texto: 'Para verificar que usted es el titular, le vamos a enviar un código de verificación al número celular registrado. Por favor NO nos diga ese código.', tiempo: 5000 },
      { de: 'carlos', texto: 'Una vez reciba el código, ingréselo directamente en la app de Bancolombia. Nosotros no necesitamos que nos lo diga.', tiempo: 8000 },
      { de: 'carlos', texto: 'También le recomendamos revisar sus últimos movimientos desde la app oficial. ¿Tiene alguna pregunta?', tiempo: 12000 },
    ],
    opciones: [
      { id: 'ok', texto: 'Entendido, voy a revisar la app ahora mismo. Gracias por el aviso.', xp: 150, correcto: true, desc: 'Correcto. Esta es una llamada legítima — te piden verificar en la app, no darte datos.' },
      { id: 'codigo', texto: 'El código que me llegó es 847291. ¿Lo anoto aquí?', xp: -200, correcto: false, desc: 'Nunca compartas códigos OTP con nadie, ni con el banco.' },
      { id: 'desconfiar', texto: 'No creo que sea el banco, voy a colgar y llamar al número del reverso de mi tarjeta.', xp: 100, correcto: true, desc: 'También válido. Verificar siempre es buena práctica.' },
      { id: 'datos', texto: 'Perfecto. ¿También necesita mi número de tarjeta y fecha de vencimiento?', xp: -200, correcto: false, desc: 'El banco nunca te pide datos completos de tarjeta por teléfono.' },
    ],
  },
  {
    id: 2,
    titulo: 'Llamada 3 — El proveedor',
    dificultad: 'MEDIA',
    caller: 'Ana Gómez — Microsoft',
    initials: 'AG',
    esLegitima: false,
    guion: [
      { de: 'carlos', texto: 'Buenos días, le llamo de Microsoft. Mi nombre es Ana Gómez, del equipo de licencias corporativas.', tiempo: 1000 },
      { de: 'carlos', texto: 'Hemos detectado que su licencia de Office 365 vence en 24 horas y perderá acceso a todos sus documentos.', tiempo: 3000 },
      { de: 'carlos', texto: 'Normalmente esto lo maneja TI, pero como es urgente y ellos no responden, me comuniqué directamente con usted.', tiempo: 5000 },
      { de: 'carlos', texto: 'Para procesar la renovación necesito que ingrese a: office-renovacion-co.net y confirme sus credenciales.', tiempo: 8000 },
      { de: 'carlos', texto: 'Es completamente seguro, es un portal oficial de Microsoft habilitado para emergencias de licencia.', tiempo: 10000 },
      { de: 'carlos', texto: 'Si no lo hace ahora, mañana no podrá abrir ningún documento y tendrá que pagar una multa de reactivación.', tiempo: 14000 },
    ],
    opciones: [
      { id: 'url', texto: 'Ese dominio no es oficial. Microsoft usaría microsoft.com, no office-renovacion-co.net.', xp: 180, correcto: true, desc: 'Identificar dominios falsos es una habilidad clave.' },
      { id: 'ingresar', texto: 'Voy a ingresar al enlace pero solo para ver cómo se ve, sin poner datos.', xp: -200, correcto: false, desc: 'Solo visitar un enlace malicioso puede comprometer tu dispositivo.' },
      { id: 'preguntar', texto: 'Está bien, pero antes dígame: ¿cuál es el número de mi licencia actual?', xp: -150, correcto: false, desc: 'Aunque parece prudente, sigues en la llamada y eso te hace vulnerable.' },
      { id: 'ti', texto: 'Voy a contactar directamente al área de TI para verificar esto antes de hacer nada.', xp: 150, correcto: true, desc: 'Correcto. Siempre verifica con tu equipo de TI.' },
    ],
  },
  {
    id: 3,
    titulo: 'Llamada 4 — RRHH de la empresa',
    dificultad: 'MEDIA',
    caller: 'Laura Vargas — RRHH',
    initials: 'LV',
    esLegitima: true,
    guion: [
      { de: 'carlos', texto: 'Hola, soy Laura Vargas de Recursos Humanos. Te llamo desde la extensión 3042 del edificio principal.', tiempo: 1000 },
      { de: 'carlos', texto: 'Te informamos que la empresa actualizó la política de vacaciones y tienes 5 días pendientes que vencen el 31 de diciembre.', tiempo: 4000 },
      { de: 'carlos', texto: 'Para solicitarlos debes ingresar al portal interno en rrhh.empresa.com.co con tu usuario corporativo.', tiempo: 8000 },
      { de: 'carlos', texto: 'No necesitamos ningún dato tuyo por teléfono. Solo queremos avisarte antes de que se venzan.', tiempo: 10000 },
      { de: 'carlos', texto: '¿Tienes alguna duda sobre el proceso de solicitud en el portal?', tiempo: 12000 },
    ],
    opciones: [
      { id: 'ok', texto: 'Gracias por el aviso. Voy a ingresar al portal interno para solicitar las vacaciones.', xp: 150, correcto: true, desc: 'Correcto. La llamada es legítima — no pide datos y dirige al portal oficial.' },
      { id: 'desconfiar', texto: 'No confío en esta llamada. Voy a ignorarlo completamente.', xp: -50, correcto: false, desc: 'Esta llamada era legítima. Ignorarla te hace perder tus días de vacaciones.' },
      { id: 'datos', texto: '¿Me puede confirmar cuántos días exactos tengo?', xp: 100, correcto: true, desc: 'Válido — pedir confirmación es prudente.' },
      { id: 'url_mal', texto: 'Prefiero ingresar a rrhh-empresa-vacaciones.net que vi en un correo.', xp: -200, correcto: false, desc: 'Nunca uses URLs de correos no verificados.' },
    ],
  },
]

// ============ CONTRASEÑAS ============
const retos = [
  {
    id: 0,
    tipo: 'construir',
    titulo: 'Crea una contraseña maestra',
    descripcion: 'El sistema de seguridad requiere una contraseña maestra. Debe cumplir estándares militares.',
    requisitos: [
      { id: 'length', label: 'Mínimo 16 caracteres', check: v => v.length >= 16 },
      { id: 'upper', label: 'Al menos 2 mayúsculas', check: v => (v.match(/[A-Z]/g) || []).length >= 2 },
      { id: 'number', label: 'Al menos 2 números', check: v => (v.match(/[0-9]/g) || []).length >= 2 },
      { id: 'special', label: 'Al menos 2 símbolos (!@#$%^&*)', check: v => (v.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length >= 2 },
      { id: 'nocommon', label: 'Sin palabras comunes (pass, admin, user, qwerty)', check: v => !/(pass|admin|user|qwerty|login|root)/i.test(v) },
      { id: 'norepeat', label: 'Sin 3 caracteres iguales seguidos (aaa, 111)', check: v => !(/(.)\1\1/).test(v) },
    ],
    xp: 120,
  },
  {
    id: 1,
    tipo: 'identificar',
    titulo: '¿Cuál es la única contraseña segura?',
    descripcion: 'Solo UNA es realmente segura. Las demás tienen vulnerabilidades ocultas.',
    opciones: [
      { id: 'a', valor: 'P@ssw0rd2024!', segura: false, razon: 'Sustituciones obvias (a→@, o→0). Es de las primeras que prueban los atacantes.' },
      { id: 'b', valor: 'MiGato#Peludo7', segura: false, razon: 'Información personal predecible.' },
      { id: 'c', valor: 'Colombia2024$', segura: false, razon: 'País + año actual. Muy usada en diccionarios de ataque.' },
      { id: 'd', valor: 'correct-horse-battery', segura: false, razon: 'Palabras del diccionario encadenadas. Vulnerable a ataques de diccionario.' },
      { id: 'e', valor: 'zR#9kM$2pL!7vN@4', segura: true, razon: '16 caracteres completamente aleatorios sin patrones.' },
      { id: 'f', valor: 'SuperSegura!123', segura: false, razon: 'Palabra del diccionario + números al final. Predecible.' },
    ],
    xp: 100,
  },
  {
    id: 2,
    tipo: 'descifrar',
    titulo: 'Descifra la contraseña del sistema',
    descripcion: 'El agente anterior dejó pistas. Solo una cumple TODAS.',
    pistas: [
      '🔒 Exactamente 9 caracteres',
      '🔒 Empieza con mayúscula',
      '🔒 El símbolo @ está en la posición 5',
      '🔒 Termina con 4 dígitos cuya suma es 10',
      '🔒 Los primeros 4 caracteres son una capital europea',
    ],
    opciones: [
      { id: 'a', valor: 'Gato@1234', correcto: false, razon: 'Gato no es una capital europea.' },
      { id: 'b', valor: 'Luis@2341', correcto: false, razon: 'Luis no es una capital europea.' },
      { id: 'c', valor: 'Ana@12340', correcto: false, razon: 'Ana tiene 3 letras, @ quedaría en posición 4.' },
      { id: 'd', valor: 'Roma@1234', correcto: true, razon: 'R-o-m-a-@-1-2-3-4 = 9 chars ✓, mayúscula ✓, @ pos 5 ✓, 1+2+3+4=10 ✓, Roma es capital europea ✓.' },
      { id: 'e', valor: 'Juan@2110', correcto: false, razon: '2+1+1+0=4, no 10.' },
      { id: 'f', valor: 'Mara@3214', correcto: false, razon: 'Mara no es una capital europea.' },
    ],
    correcta: 'Roma@1234',
    xp: 130,
  },
  {
    id: 3,
    tipo: 'doble_factor',
    titulo: 'Doble factor en situaciones reales',
    descripcion: 'Evalúa cada situación de 2FA. Algunas son trampas sutiles.',
    situaciones: [
      {
        id: 0,
        contexto: 'Recibes un SMS con código 2FA que no solicitaste. Segundos después te llama alguien diciendo ser soporte y pide el código.',
        opciones: [
          { id: 'dar', texto: 'Le doy el código porque parece urgente.', correcto: false, xp: -150, razon: 'Error crítico. Es un ataque de SIM swapping + ingeniería social.' },
          { id: 'ignorar', texto: 'Cuelgo, no doy el código, y llamo yo al banco desde el número oficial.', correcto: true, xp: 100, razon: 'Nadie legítimo pide tu código 2FA.' },
          { id: 'preguntar', texto: 'Le pregunto más datos antes de dar el código.', correcto: false, xp: -80, razon: 'El código no debe compartirse bajo ninguna circunstancia.' },
        ],
      },
      {
        id: 1,
        contexto: 'Configuras 2FA en tu correo corporativo. El sistema ofrece SMS, app autenticadora o email de respaldo.',
        opciones: [
          { id: 'sms', texto: 'Elijo SMS, es lo más cómodo.', correcto: false, xp: -30, razon: 'SMS es el método 2FA más débil. Vulnerable a SIM swapping.' },
          { id: 'app', texto: 'Elijo app autenticadora (Google Authenticator o Authy).', correcto: true, xp: 80, razon: 'Las apps autenticadoras son el método más seguro disponible.' },
          { id: 'email', texto: 'Elijo email de respaldo para no perder acceso.', correcto: false, xp: -40, razon: 'Si hackean tu correo, también tendrán el 2FA.' },
        ],
      },
    ],
    xp: 100,
  },
]

function FuerzaPassword({ valor }) {
  const checks = [valor.length >= 8, valor.length >= 12, valor.length >= 16, /[A-Z]/.test(valor), /[a-z]/.test(valor), /[0-9]/.test(valor), /[!@#$%^&*]/.test(valor)]
  const score = checks.filter(Boolean).length
  const color = score <= 3 ? '#f87171' : score <= 5 ? '#fbbf24' : '#4ade80'
  const label = score <= 3 ? 'Débil' : score <= 5 ? 'Media' : 'Fuerte'
  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: '#64748b' }}>Fuerza</span>
        <span style={{ fontSize: '13px', color, fontWeight: 700 }}>{label}</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>
        <div style={{ height: '100%', borderRadius: '3px', background: color, width: `${(score / 7) * 100}%`, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

export default function Mision2({ session }) {
  const navigate = useNavigate()
  const [modulo, setModulo] = useState('llamadas') // llamadas | contrasenas
  const [scoreTotal, setScoreTotal] = useState(0)
  const [finished, setFinished] = useState(false)

  // LLAMADAS
  const [llamadaIndex, setLlamadaIndex] = useState(0)
  const [mensajes, setMensajes] = useState([])
  const [opcionElegida, setOpcionElegida] = useState(null)
  const [scoreLlamadas, setScoreLlamadas] = useState(0)
  const [timer, setTimer] = useState(0)
  const [timerActivo, setTimerActivo] = useState(true)
  const [faseLlamada, setFaseLlamada] = useState('llamada')
  const chatRef = useRef(null)

  // CONTRASEÑAS
  const [retoIndex, setRetoIndex] = useState(0)
  const [scoreContrasenas, setScoreContrasenas] = useState(0)
  const [password, setPassword] = useState('')
  const [passwordEnviada, setPasswordEnviada] = useState(false)
  const [seleccionada, setSeleccionada] = useState(null)
  const [descifrada, setDescifrada] = useState(null)
  const [situacionIndex, setSituacionIndex] = useState(0)
  const [respuestaActual, setRespuestaActual] = useState(null)
  const [respuestasDFA, setRespuestasDFA] = useState({})

  const llamada = llamadas[llamadaIndex]
  const reto = retos[retoIndex]

  // TIMER LLAMADAS
  useEffect(() => {
    if (modulo !== 'llamadas' || !timerActivo) return
    const t = setInterval(() => setTimer(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [modulo, timerActivo])

  // GUION LLAMADAS
  useEffect(() => {
    if (modulo !== 'llamadas') return
    setMensajes([])
    setOpcionElegida(null)
    setFaseLlamada('llamada')
    setTimer(0)
    setTimerActivo(true)
    const timeouts = llamada.guion.map(msg => setTimeout(() => setMensajes(prev => [...prev, msg]), msg.tiempo))
    const final = setTimeout(() => setFaseLlamada('decision'), llamada.guion[llamada.guion.length - 1].tiempo + 2000)
    return () => { timeouts.forEach(clearTimeout); clearTimeout(final) }
  }, [llamadaIndex, modulo])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [mensajes])

  function elegirLlamada(opcion) {
    setOpcionElegida(opcion)
    setTimerActivo(false)
    opcion.correcto ? sonidoExito() : sonidoError()
    setScoreLlamadas(prev => prev + Math.max(0, opcion.xp))
    setMensajes(prev => [...prev, { de: 'yo', texto: opcion.texto }])
    setTimeout(() => setFaseLlamada('resultado'), 1500)
  }

  function siguienteLlamada() {
    if (llamadaIndex + 1 >= llamadas.length) {
      setModulo('contrasenas')
      return
    }
    setLlamadaIndex(i => i + 1)
  }

  // CONTRASEÑAS
  function siguienteReto(pts) {
    setScoreContrasenas(prev => prev + Math.max(0, pts))
    if (retoIndex + 1 >= retos.length) {
      const total = scoreLlamadas + scoreContrasenas + Math.max(0, pts)
      sonidoMisionCompleta()
guardarProgreso(2, total)
setScoreTotal(total)
setFinished(true)
      guardarProgreso(2, total)
      setScoreTotal(total)
      setFinished(true)
      return
    }
    setRetoIndex(i => i + 1)
    setSeleccionada(null)
    setDescifrada(null)
    setSituacionIndex(0)
    setRespuestaActual(null)
    setRespuestasDFA({})
    setPassword('')
    setPasswordEnviada(false)
  }

  function siguienteSituacion() {
    if (situacionIndex + 1 >= reto.situaciones.length) {
      const total = Object.values({ ...respuestasDFA, [situacionIndex]: respuestaActual }).reduce((a, o) => a + Math.max(0, o.xp), 0)
      siguienteReto(total)
    } else {
      setSituacionIndex(i => i + 1)
      setRespuestaActual(null)
    }
  }

  const timerStr = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`
  const dificultadColor = llamada?.dificultad === 'FÁCIL' ? '#4ade80' : llamada?.dificultad === 'MEDIA' ? '#fbbf24' : '#f87171'

  // ===== FIN =====
  if (finished) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', color: '#e2e8f0' }}>
      <div style={{ background: C.sidebar, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '56px', textAlign: 'center', maxWidth: '520px', width: '100%' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔐</div>
        <div style={{ fontSize: '14px', color: '#64748b', letterSpacing: '2px', marginBottom: '10px' }}>MISIÓN 2 COMPLETADA</div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: C.cyan, marginBottom: '10px' }}>
          {scoreTotal >= 700 ? '¡Experto en accesos!' : scoreTotal >= 400 ? 'Buen trabajo' : 'Sigue practicando'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Llamadas</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: C.cyan }}>+{scoreLlamadas} XP</div>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Contraseñas</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: C.violet }}>+{scoreContrasenas} XP</div>
          </div>
        </div>
        <div style={{ fontSize: '48px', fontWeight: 900, color: '#fbbf24', marginBottom: '24px' }}>+{scoreTotal} XP</div>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/')} style={{ padding: '14px 28px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: '#94a3b8', fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit' }}>Volver al Hub</button>
          <button onClick={() => navigate('/mision/3')} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Siguiente misión →</button>
        </div>
      </div>
    </div>
  )

  // ===== MÓDULO LLAMADAS =====
  if (modulo === 'llamadas') return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', fontSize: '16px', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: '64px', background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '22px' }}>←</button>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '2px' }}>MÓDULO 2 · PARTE 1/2 — LLAMADAS</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: C.cyan }}>Misión 2 Contraseñas y Acceso — Vishing</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '13px', color: dificultadColor, fontWeight: 700, border: `1px solid ${dificultadColor}44`, padding: '4px 12px', borderRadius: '20px' }}>{llamada.dificultad}</span>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Llamada <span style={{ color: C.cyan, fontWeight: 700 }}>{llamadaIndex + 1}</span>/{llamadas.length}</span>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#fbbf24' }}>⚡ {scoreLlamadas} XP</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', flex: 1, overflow: 'hidden' }}>
        {/* PANEL IZQUIERDO */}
        <div style={{ background: C.sidebar, borderRight: `1px solid ${C.border}`, overflowY: 'auto', padding: '24px' }}>
          <div style={{ fontSize: '11px', color: C.cyan, letterSpacing: '2px', marginBottom: '12px' }}>PARTE 1 — VISHING</div>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.7', marginBottom: '20px' }}>
            Recibirás {llamadas.length} llamadas. Algunas legítimas, otras falsas. Identifica las tácticas y actúa correctamente.
          </p>
          <div style={{ marginBottom: '20px' }}>
            {llamadas.map((ll, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', opacity: i > llamadaIndex ? 0.4 : 1 }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: i < llamadaIndex ? '#4ade80' : i === llamadaIndex ? C.cyan : 'transparent', border: `2px solid ${i < llamadaIndex ? '#4ade80' : i === llamadaIndex ? C.cyan : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#080b18', flexShrink: 0 }}>
                  {i < llamadaIndex ? '✓' : i === llamadaIndex ? '●' : ''}
                </div>
                <span style={{ fontSize: '12px', color: i === llamadaIndex ? C.cyan : i < llamadaIndex ? '#4ade80' : '#64748b' }}>{ll.titulo}</span>
              </div>
            ))}
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>SIGUIENTE</div>
            <div style={{ fontSize: '13px', color: C.violet }}>Parte 2: Contraseñas seguras</div>
          </div>
        </div>

        {/* CHAT */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: `1px solid ${C.border}` }}>
          <div style={{ padding: '16px 24px', background: C.card, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: C.cyan }}>{llamada.titulo}</div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#64748b', fontFamily: 'monospace' }}>{timerStr}</span>
          </div>
          <div style={{ padding: '16px 24px', background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `linear-gradient(135deg, ${C.violet}, #6366f1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: 'white' }}>{llamada.initials}</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>{llamada.caller}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Llamada entrante</div>
              </div>
            </div>
            <div style={{ fontSize: '20px', color: '#4ade80' }}>📶</div>
          </div>
          <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mensajes.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.de === 'yo' ? 'flex-end' : 'flex-start', gap: '10px', alignItems: 'flex-end' }}>
                {msg.de !== 'yo' && <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg, ${C.violet}, #6366f1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0 }}>{llamada.initials}</div>}
                <div style={{ maxWidth: '70%', background: msg.de === 'yo' ? `${C.violet}33` : C.card, border: `1px solid ${msg.de === 'yo' ? C.violet + '44' : C.border}`, borderRadius: msg.de === 'yo' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '12px 16px' }}>
                  <div style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.6' }}>{msg.texto}</div>
                </div>
                {msg.de === 'yo' && <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${C.cyan}22`, border: `1px solid ${C.cyan}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>👤</div>}
              </div>
            ))}
          </div>
          {faseLlamada === 'decision' && !opcionElegida && (
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, background: C.sidebar }}>
              <div style={{ fontSize: '12px', color: '#64748b', letterSpacing: '2px', marginBottom: '12px' }}>ELIGE TU RESPUESTA:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {llamada.opciones.map(op => (
                  <button key={op.id} onClick={() => elegirLlamada(op)} style={{ padding: '12px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.card, color: '#e2e8f0', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    {op.texto}
                  </button>
                ))}
              </div>
            </div>
          )}
          {faseLlamada === 'resultado' && (
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, background: C.sidebar, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={siguienteLlamada} style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {llamadaIndex + 1 >= llamadas.length ? 'Parte 2: Contraseñas →' : 'Siguiente llamada →'}
              </button>
            </div>
          )}
        </div>

        {/* PANEL DERECHO */}
        <div style={{ background: C.sidebar, overflowY: 'auto', padding: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: C.cyan, letterSpacing: '2px', marginBottom: '16px' }}>💡 ANÁLISIS</div>
          {!opcionElegida && (
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '13px', color: '#64748b', textAlign: 'center', lineHeight: '1.8' }}>
              Escucha con atención y toma tu decisión.<br /><br />El análisis aparecerá después.
            </div>
          )}
          {opcionElegida && !opcionElegida.correcto && (
            <>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', marginBottom: '12px' }}>❌ CAÍSTE EN LA TRAMPA</div>
              <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', padding: '14px', fontSize: '13px', color: '#94a3b8' }}>{opcionElegida.desc}</div>
            </>
          )}
          {opcionElegida && opcionElegida.correcto && (
            <>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80', marginBottom: '12px' }}>✅ BIEN MANEJADO</div>
              <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '10px', padding: '14px', fontSize: '13px', color: '#4ade80' }}>{opcionElegida.desc}</div>
            </>
          )}
          <div style={{ marginTop: '20px', background: `${C.violet}0f`, border: `1px solid ${C.violet}33`, borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: C.violet, fontWeight: 700, marginBottom: '8px' }}>🎯 OBJETIVO</div>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>Identifica tácticas de vishing y actúa de forma segura.</p>
          </div>
        </div>
      </div>
    </div>
  )

  // ===== MÓDULO CONTRASEÑAS =====
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', fontSize: '16px', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: '64px', background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '22px' }}>←</button>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '2px' }}>MÓDULO 2 · PARTE 2/2 — CONTRASEÑAS</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: C.violet }}>Contraseñas y Acceso — Seguridad</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Reto <span style={{ color: C.violet, fontWeight: 700 }}>{retoIndex + 1}</span>/{retos.length}</span>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#fbbf24' }}>⚡ {scoreLlamadas + scoreContrasenas} XP</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', flex: 1, overflow: 'hidden' }}>
        {/* PANEL IZQUIERDO */}
        <div style={{ background: C.sidebar, borderRight: `1px solid ${C.border}`, overflowY: 'auto', padding: '24px' }}>
          <div style={{ fontSize: '11px', color: C.violet, letterSpacing: '2px', marginBottom: '12px' }}>PARTE 2 — CONTRASEÑAS</div>
          <div style={{ marginBottom: '20px' }}>
            {retos.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', opacity: i > retoIndex ? 0.4 : 1 }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i < retoIndex ? '#4ade80' : i === retoIndex ? C.violet : 'transparent', border: `2px solid ${i < retoIndex ? '#4ade80' : i === retoIndex ? C.violet : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', flexShrink: 0 }}>
                  {i < retoIndex ? '✓' : i === retoIndex ? '●' : ''}
                </div>
                <span style={{ fontSize: '12px', color: i === retoIndex ? C.violet : i < retoIndex ? '#4ade80' : '#64748b' }}>{r.titulo}</span>
              </div>
            ))}
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>XP de llamadas</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: C.cyan }}>+{scoreLlamadas}</div>
          </div>
        </div>

        {/* CENTRO */}
        <div style={{ overflowY: 'auto', padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{reto.titulo}</div>
            <div style={{ fontSize: '15px', color: '#94a3b8', lineHeight: '1.7' }}>{reto.descripcion}</div>
          </div>

          {/* CONSTRUIR */}
          {reto.tipo === 'construir' && (
            <div>
              <input type="text" value={password} onChange={e => setPassword(e.target.value)} disabled={passwordEnviada}
                placeholder="Escribe tu contraseña maestra..."
                style={{ width: '100%', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '16px', color: '#e2e8f0', fontSize: '18px', fontFamily: 'monospace', outline: 'none', letterSpacing: '2px', marginBottom: '16px' }} />
              <FuerzaPassword valor={password} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '16px 0 24px' }}>
                {reto.requisitos.map(req => {
                  const ok = req.check(password)
                  return (
                    <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: ok ? 'rgba(74,222,128,0.06)' : C.card, border: `1px solid ${ok ? '#4ade8033' : C.border}`, borderRadius: '8px' }}>
                      <span>{ok ? '✅' : '⬜'}</span>
                      <span style={{ fontSize: '14px', color: ok ? '#4ade80' : '#64748b' }}>{req.label}</span>
                    </div>
                  )
                })}
              </div>
              {!passwordEnviada ? (
                <button onClick={() => { if (reto.requisitos.every(r => r.check(password))) setPasswordEnviada(true) }}
                  disabled={!reto.requisitos.every(r => r.check(password))}
                  style={{ padding: '16px 32px', borderRadius: '10px', border: 'none', background: reto.requisitos.every(r => r.check(password)) ? `linear-gradient(to right, ${C.cyan}, ${C.violet})` : 'rgba(255,255,255,0.08)', color: reto.requisitos.every(r => r.check(password)) ? '#080b18' : '#64748b', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Confirmar contraseña →
                </button>
              ) : (
                <div>
                  <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid #4ade8044', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#4ade80', marginBottom: '8px' }}>✅ Contraseña maestra creada</div>
                  </div>
                  <button onClick={() => siguienteReto(reto.xp)} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Siguiente reto →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* IDENTIFICAR */}
          {reto.tipo === 'identificar' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {reto.opciones.map(op => (
                  <div key={op.id} onClick={() => !seleccionada && setSeleccionada(op)}
                    style={{ padding: '16px 20px', borderRadius: '12px', border: `2px solid ${seleccionada ? (op.segura ? '#4ade80' : '#f87171') : C.border}`, background: seleccionada ? (op.segura ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.04)') : C.card, cursor: seleccionada ? 'default' : 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: seleccionada ? '8px' : '0' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '16px', color: '#e2e8f0', letterSpacing: '1px' }}>{op.valor}</span>
                      {seleccionada && <span>{op.segura ? '✅' : '❌'}</span>}
                    </div>
                    {seleccionada && <div style={{ fontSize: '13px', color: '#94a3b8' }}>{op.razon}</div>}
                  </div>
                ))}
              </div>
              {seleccionada && (
                <button onClick={() => siguienteReto(seleccionada.segura ? reto.xp : 0)} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Siguiente reto →
                </button>
              )}
            </div>
          )}

          {/* DESCIFRAR */}
          {reto.tipo === 'descifrar' && (
            <div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: C.cyan, letterSpacing: '2px', marginBottom: '12px', fontWeight: 700 }}>PISTAS CIFRADAS</div>
                {reto.pistas.map((p, i) => (
                  <div key={i} style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>{p}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {reto.opciones.map(op => (
                  <div key={op.id} onClick={() => !descifrada && setDescifrada(op)}
                    style={{ padding: '14px 18px', borderRadius: '12px', border: `2px solid ${descifrada ? (op.valor === reto.correcta ? '#4ade80' : '#f87171') : C.border}`, background: descifrada ? (op.valor === reto.correcta ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.04)') : C.card, cursor: descifrada ? 'default' : 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '16px', color: '#e2e8f0' }}>{op.valor}</span>
                      {descifrada && <span>{op.valor === reto.correcta ? '✅' : '❌'}</span>}
                    </div>
                    {descifrada && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>{op.razon}</div>}
                  </div>
                ))}
              </div>
              {descifrada && (
                <button onClick={() => siguienteReto(descifrada.correcto ? reto.xp : 0)} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Siguiente reto →
                </button>
              )}
            </div>
          )}

          {/* 2FA */}
          {reto.tipo === 'doble_factor' && reto.situaciones[situacionIndex] && (
            <div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: C.cyan, letterSpacing: '2px', marginBottom: '10px', fontWeight: 700 }}>SITUACIÓN {situacionIndex + 1}/{reto.situaciones.length}</div>
                <div style={{ fontSize: '16px', color: '#e2e8f0', lineHeight: '1.7' }}>{reto.situaciones[situacionIndex].contexto}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {reto.situaciones[situacionIndex].opciones.map(op => (
                  <div key={op.id} onClick={() => { if (!respuestaActual) { setRespuestaActual(op); setRespuestasDFA(prev => ({ ...prev, [situacionIndex]: op })) } }}
                    style={{ padding: '16px 20px', borderRadius: '12px', border: `2px solid ${respuestaActual ? (op.correcto ? '#4ade80' : '#f87171') : C.border}`, background: respuestaActual ? (op.correcto ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.04)') : C.card, cursor: respuestaActual ? 'default' : 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: respuestaActual ? '8px' : '0' }}>
                      <span style={{ fontSize: '15px', color: '#e2e8f0' }}>{op.texto}</span>
                      {respuestaActual && <span>{op.correcto ? '✅' : '❌'}</span>}
                    </div>
                    {respuestaActual && <div style={{ fontSize: '13px', color: '#94a3b8' }}>{op.razon}</div>}
                  </div>
                ))}
              </div>
              {respuestaActual && (
                <button onClick={siguienteSituacion} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {situacionIndex + 1 >= reto.situaciones.length ? 'Finalizar módulo →' : 'Siguiente situación →'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* PANEL DERECHO */}
        <div style={{ background: C.sidebar, overflowY: 'auto', padding: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: C.violet, letterSpacing: '2px', marginBottom: '16px' }}>💡 CONCEPTOS CLAVE</div>
          {[
            { titulo: 'Entropía', desc: 'Una contraseña de 16 chars aleatorios tiene más entropía que una de 20 chars predecibles.' },
            { titulo: 'Diccionarios de ataque', desc: 'Los atacantes prueban millones de palabras y variaciones comunes antes de la fuerza bruta.' },
            { titulo: 'Nunca reutilices', desc: 'Si una cuenta es hackeada y reutilizas contraseñas, todas están comprometidas.' },
            { titulo: 'SMS 2FA es débil', desc: 'SIM swapping permite a atacantes recibir tus SMS. Usa apps autenticadoras.' },
            { titulo: 'Códigos de respaldo', desc: 'Guarda los códigos de respaldo del 2FA en un lugar seguro al configurarlo.' },
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