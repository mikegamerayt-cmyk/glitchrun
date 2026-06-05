import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { guardarProgreso } from '../utils/progreso'
import { sonidoExito, sonidoError, sonidoMisionCompleta } from '../utils/sonidos'

const C = {
  cyan: '#00fff7', violet: '#a855f7', pink: '#f472b6',
  bg: '#080b18', sidebar: '#0b0f1e', card: '#0f1326',
  border: 'rgba(255,255,255,0.1)',
}

const escenarios = [
  {
    id: 0,
    titulo: 'Ataque DDoS Volumétrico',
    descripcion: 'Has detectado un ataque DDoS contra los servidores. Actúa rápido para mitigar el impacto.',
    tiempoLimite: 90,
    red: {
      trafico: '12.45 Gbps',
      traficoExtra: '↑ 980%',
      conexiones: '134,875',
      conexionesExtra: '↑ 860%',
      cpu: '92%',
      cpuColor: '#f87171',
      servicios: '3 / 7',
    },
    nodos: [
      { id: 'web', nombre: 'Servidor Web', ip: '192.168.1.10', estado: 'critico', disponibilidad: 45 },
      { id: 'api', nombre: 'API Clientes', ip: '192.168.1.20', estado: 'critico', disponibilidad: 35 },
      { id: 'db', nombre: 'Base de Datos', ip: '192.168.1.30', estado: 'ok', disponibilidad: 92 },
      { id: 'mail', nombre: 'Correo Interno', ip: '192.168.1.40', estado: 'ok', disponibilidad: 100 },
    ],
    ipsAtacantes: ['185.220.101.23', '185.220.101.24', '185.220.101.25', '185.220.101.26', '... 542 IPs más'],
    origen: [{ pais: '🇷🇺 Rusia', pct: 42 }, { pais: '🇨🇳 China', pct: 28 }, { pais: '🇺🇸 Estados Unidos', pct: 15 }, { pais: '🌍 Otros', pct: 15 }],
    tipoAtaque: 'DDoS — Volumétrico',
    descripcionAtaque: 'El atacante envía gran cantidad de tráfico para saturar el ancho de banda.',
    acciones: [
      { id: 'mitigar', titulo: 'Activar mitigación automática', desc: 'Activa el sistema de mitigación del firewall para filtrar tráfico malicioso.', exito: 85, xp: 150, correcto: true },
      { id: 'filtrar', titulo: 'Filtrar IPs maliciosas', desc: 'Bloquea las IPs origen que generan mayor volumen de tráfico.', exito: 70, xp: 120, correcto: true },
      { id: 'ratelimit', titulo: 'Redirigir tráfico (Rate Limiting)', desc: 'Limita la tasa de conexiones por IP para evitar saturación.', exito: 60, xp: 100, correcto: true },
      { id: 'scrubbing', titulo: 'Escalar a proveedor (Scrubbing)', desc: 'Redirige el tráfico a un servicio externo de limpieza de DDoS.', exito: 95, xp: 200, correcto: true },
      { id: 'reiniciar', titulo: 'Reiniciar los servidores afectados', desc: 'Apagar y encender los servidores para restaurar el servicio.', exito: 5, xp: -100, correcto: false },
      { id: 'ignorar', titulo: 'Esperar a que el ataque pare solo', desc: 'No tomar acción y esperar que el atacante se canse.', exito: 2, xp: -200, correcto: false },
    ],
  },
  {
    id: 1,
    titulo: 'Intrusión por Fuerza Bruta SSH',
    descripcion: 'El sistema de detección detectó miles de intentos de login SSH desde una IP externa.',
    tiempoLimite: 75,
    red: {
      trafico: '0.8 Gbps',
      traficoExtra: '↑ 12%',
      conexiones: '48,291',
      conexionesExtra: '↑ 4200%',
      cpu: '34%',
      cpuColor: '#fbbf24',
      servicios: '1 / 7',
    },
    nodos: [
      { id: 'ssh', nombre: 'Servidor SSH', ip: '192.168.1.5', estado: 'critico', disponibilidad: 60 },
      { id: 'web', nombre: 'Servidor Web', ip: '192.168.1.10', estado: 'ok', disponibilidad: 98 },
      { id: 'db', nombre: 'Base de Datos', ip: '192.168.1.30', estado: 'ok', disponibilidad: 99 },
      { id: 'mail', nombre: 'Correo Interno', ip: '192.168.1.40', estado: 'ok', disponibilidad: 100 },
    ],
    ipsAtacantes: ['91.108.4.177', '... desde hace 3 horas'],
    origen: [{ pais: '🇧🇷 Brasil', pct: 78 }, { pais: '🇦🇷 Argentina', pct: 22 }],
    tipoAtaque: 'Fuerza Bruta SSH',
    descripcionAtaque: 'Intento masivo de acceso por SSH probando contraseñas automáticamente.',
    acciones: [
      { id: 'bloquear_ip', titulo: 'Bloquear IP atacante en firewall', desc: 'Agrega la IP al blacklist del firewall inmediatamente.', exito: 90, xp: 150, correcto: true },
      { id: 'fail2ban', titulo: 'Activar Fail2Ban', desc: 'Bloquea automáticamente IPs que fallen N intentos de login.', exito: 95, xp: 180, correcto: true },
      { id: 'cambiar_puerto', titulo: 'Cambiar puerto SSH a no estándar', desc: 'Mover SSH del puerto 22 a uno aleatorio reduce ataques automatizados.', exito: 70, xp: 100, correcto: true },
      { id: 'deshabilitar_password', titulo: 'Deshabilitar login por contraseña, solo llaves SSH', desc: 'La autenticación por clave pública es inmune a fuerza bruta.', exito: 99, xp: 200, correcto: true },
      { id: 'ignorar', titulo: 'Ignorar, el servidor aguanta', desc: 'Si la contraseña es fuerte no hay riesgo.', exito: 10, xp: -150, correcto: false },
      { id: 'apagar', titulo: 'Apagar el servidor SSH completamente', desc: 'Sin acceso SSH nadie puede administrar el servidor remotamente.', exito: 20, xp: -80, correcto: false },
    ],
  },
  {
    id: 2,
    titulo: 'Movimiento Lateral en la Red',
    descripcion: 'Un equipo interno fue comprometido y el atacante intenta moverse a otros sistemas.',
    tiempoLimite: 60,
    red: {
      trafico: '2.1 Gbps',
      traficoExtra: '↑ 180%',
      conexiones: '12,440',
      conexionesExtra: '↑ 220%',
      cpu: '67%',
      cpuColor: '#fbbf24',
      servicios: '2 / 7',
    },
    nodos: [
      { id: 'infectado', nombre: 'PC Infectada', ip: '192.168.1.55', estado: 'critico', disponibilidad: 100 },
      { id: 'dc', nombre: 'Controlador de Dominio', ip: '192.168.1.2', estado: 'critico', disponibilidad: 88 },
      { id: 'files', nombre: 'Servidor de Archivos', ip: '192.168.1.15', estado: 'advertencia', disponibilidad: 72 },
      { id: 'web', nombre: 'Servidor Web', ip: '192.168.1.10', estado: 'ok', disponibilidad: 97 },
    ],
    ipsAtacantes: ['192.168.1.55 (INTERNO)', 'Movimiento lateral activo'],
    origen: [{ pais: '🏢 Red interna', pct: 100 }],
    tipoAtaque: 'Movimiento Lateral',
    descripcionAtaque: 'Desde un equipo comprometido el atacante explora y se mueve por la red interna.',
    acciones: [
      { id: 'aislar', titulo: 'Aislar el equipo infectado de la red', desc: 'Desconectar físicamente o bloquear en el switch para contener la amenaza.', exito: 95, xp: 200, correcto: true },
      { id: 'segmentar', titulo: 'Segmentar la red con VLANs', desc: 'Dividir la red en segmentos aislados para limitar el movimiento.', exito: 85, xp: 160, correcto: true },
      { id: 'credenciales', titulo: 'Resetear credenciales de dominio', desc: 'Cambiar contraseñas del AD para invalidar sesiones del atacante.', exito: 80, xp: 140, correcto: true },
      { id: 'monitorear', titulo: 'Solo monitorear para ver hasta dónde llega', desc: 'Observar el movimiento sin intervenir para entender el alcance.', exito: 15, xp: -120, correcto: false },
      { id: 'apagar_todo', titulo: 'Apagar todos los servidores', desc: 'Parar toda la operación de la empresa para detener el ataque.', exito: 30, xp: -100, correcto: false },
    ],
  },
]

function NodoRed({ nodo }) {
  const color = nodo.estado === 'critico' ? '#f87171' : nodo.estado === 'advertencia' ? '#fbbf24' : '#4ade80'
  return (
    <div style={{ background: C.card, border: `1px solid ${color}44`, borderRadius: '10px', padding: '12px 14px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{nodo.nombre}</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{nodo.ip}</div>
        </div>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
      </div>
      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Disponibilidad</div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
        <div style={{ height: '100%', borderRadius: '2px', background: color, width: `${nodo.disponibilidad}%` }} />
      </div>
      <div style={{ fontSize: '11px', color, marginTop: '3px', fontWeight: 700 }}>{nodo.disponibilidad}%</div>
    </div>
  )
}

export default function Mision5({ session }) {
  const navigate = useNavigate()
  const [escenarioIndex, setEscenarioIndex] = useState(0)
  const [accionElegida, setAccionElegida] = useState(null)
  const [scoreTotal, setScoreTotal] = useState(0)
  const [tiempo, setTiempo] = useState(escenarios[0].tiempoLimite)
  const [tiempoAgotado, setTiempoAgotado] = useState(false)
  const [finished, setFinished] = useState(false)
  const [fase, setFase] = useState('analisis') // analisis | decision | resultado

  const escenario = escenarios[escenarioIndex]

  useEffect(() => {
    setTiempo(escenario.tiempoLimite)
    setTiempoAgotado(false)
  }, [escenarioIndex])

  useEffect(() => {
    if (accionElegida || tiempoAgotado) return
    if (tiempo <= 0) { setTiempoAgotado(true); setFase('resultado'); return }
    const t = setTimeout(() => setTiempo(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [tiempo, accionElegida, tiempoAgotado])

function elegirAccion(accion) {
  if (accionElegida) return
  accion.correcto ? sonidoExito() : sonidoError()
  setAccionElegida(accion)
  setScoreTotal(prev => prev + Math.max(0, accion.xp))
  setFase('resultado')
}

function siguiente() {
  if (escenarioIndex + 1 >= escenarios.length) { sonidoMisionCompleta(); setFinished(true); guardarProgreso(5, scoreTotal); return }
    setEscenarioIndex(i => i + 1)
    setAccionElegida(null)
    setFase('analisis')
  }

  const tiempoColor = tiempo > 45 ? '#4ade80' : tiempo > 20 ? '#fbbf24' : '#f87171'
  const timerStr = `${String(Math.floor(tiempo / 60)).padStart(2, '0')}:${String(tiempo % 60).padStart(2, '0')}`

  if (finished) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', color: '#e2e8f0' }}>
      <div style={{ background: C.sidebar, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '56px', textAlign: 'center', maxWidth: '520px', width: '100%' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🌐</div>
        <div style={{ fontSize: '14px', color: '#64748b', letterSpacing: '2px', marginBottom: '10px' }}>MISIÓN 4 COMPLETADA</div>
        <div style={{ fontSize: '32px', fontWeight: 800, color: C.cyan, marginBottom: '10px' }}>
          {scoreTotal >= 400 ? '¡Defensor de redes!' : scoreTotal >= 200 ? 'Buen trabajo' : 'Sigue practicando'}
        </div>
        <div style={{ fontSize: '48px', fontWeight: 900, color: '#fbbf24', marginBottom: '24px' }}>+{scoreTotal} XP</div>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/')} style={{ padding: '14px 28px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: '#94a3b8', fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit' }}>Volver al Hub</button>
        <button onClick={() => navigate('/mision/6')} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Siguiente misión →</button>        </div>
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
            <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '2px' }}>MÓDULO 4 · DEFENSA DE RED</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: C.cyan }}>Misión 4 — {escenario.titulo}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Escenario <span style={{ color: C.cyan, fontWeight: 700 }}>{escenarioIndex + 1}</span>/{escenarios.length}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `${tiempoColor}11`, border: `1px solid ${tiempoColor}44`, borderRadius: '8px', padding: '6px 14px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tiempoColor }} />
            <span style={{ fontSize: '16px', fontWeight: 700, color: tiempoColor, fontFamily: 'monospace' }}>
              {accionElegida ? 'RESUELTO' : tiempoAgotado ? 'TIEMPO AGOTADO' : timerStr}
            </span>
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#fbbf24' }}>⚡ {scoreTotal} XP</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 300px', flex: 1, overflow: 'hidden' }}>

        {/* PANEL IZQUIERDO */}
        <div style={{ background: C.sidebar, borderRight: `1px solid ${C.border}`, overflowY: 'auto', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: C.cyan, letterSpacing: '2px', marginBottom: '8px' }}>MÓDULO 4</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>DEFENSA DE RED</div>

          <div style={{ marginBottom: '16px' }}>
            {escenarios.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', opacity: i > escenarioIndex ? 0.4 : 1 }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i < escenarioIndex ? '#4ade80' : i === escenarioIndex ? C.cyan : 'transparent', border: `2px solid ${i < escenarioIndex ? '#4ade80' : i === escenarioIndex ? C.cyan : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#080b18', flexShrink: 0 }}>
                  {i < escenarioIndex ? '✓' : i === escenarioIndex ? '●' : ''}
                </div>
                <span style={{ fontSize: '12px', color: i === escenarioIndex ? C.cyan : i < escenarioIndex ? '#4ade80' : '#64748b' }}>
                  Escenario {i + 1}: {e.titulo}
                </span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.7', marginBottom: '16px' }}>{escenario.descripcion}</p>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', letterSpacing: '1px' }}>RECOMPENSA</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚡</span><span style={{ fontSize: '18px', fontWeight: 700, color: C.cyan }}>250</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⭐</span><span style={{ fontSize: '18px', fontWeight: 700, color: '#fbbf24' }}>400</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', letterSpacing: '1px' }}>PROGRESO</div>
            {['Detecta el ataque', 'Analiza el origen', 'Activa mitigación', 'Restablece servicios'].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px' }}>{i <= 1 ? '✅' : i === 2 && accionElegida ? '✅' : i === 2 ? '🔵' : accionElegida ? '🔒' : '🔒'}</span>
                <span style={{ fontSize: '12px', color: i <= 1 ? '#4ade80' : i === 2 && accionElegida ? '#4ade80' : i === 2 ? C.cyan : '#64748b' }}>{p}</span>
              </div>
            ))}
          </div>

          {!accionElegida && (
            <div style={{ background: `${C.cyan}0a`, border: `1px solid ${C.cyan}33`, borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '12px', color: C.cyan, fontWeight: 700, marginBottom: '6px' }}>💡 PISTA</div>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
                Observa el tráfico entrante y bloquea las IPs maliciosas. Usa el filtrado por tasa de conexión.
              </p>
            </div>
          )}
        </div>

        {/* CENTRO — MONITOREO */}
        <div style={{ overflowY: 'auto', padding: '20px 24px' }}>

          {/* HEADER MONITOREO */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: C.cyan, letterSpacing: '2px' }}>MONITOREO DE RED EN TIEMPO REAL</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171' }} />
              <span style={{ fontSize: '13px', color: '#f87171', fontWeight: 700 }}>ATAQUE EN CURSO</span>
            </div>
          </div>

          {/* MÉTRICAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: 'TRÁFICO ENTRANTE', val: escenario.red.trafico, extra: escenario.red.traficoExtra, color: '#f87171' },
              { label: 'CONEXIONES', val: escenario.red.conexiones, extra: escenario.red.conexionesExtra, color: '#f87171' },
              { label: 'CPU SERVIDOR', val: escenario.red.cpu, extra: '', color: escenario.red.cpuColor },
              { label: 'SERVICIOS AFECTADOS', val: escenario.red.servicios, extra: 'SERVICIOS ⚠', color: '#fbbf24' },
            ].map((m, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '1px', marginBottom: '8px' }}>{m.label}</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: m.color }}>{m.val}</div>
                {m.extra && <div style={{ fontSize: '11px', color: m.color, marginTop: '4px' }}>{m.extra}</div>}
              </div>
            ))}
          </div>

          {/* DIAGRAMA DE RED */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

              {/* IPs ATACANTES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px' }}>
                {escenario.ipsAtacantes.map((ip, i) => (
                  <div key={i} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', color: '#f87171', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>💀</span> {ip}
                  </div>
                ))}
              </div>

              {/* FLECHA */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ fontSize: '11px', color: '#f87171', letterSpacing: '1px' }}>INTERNET</div>
                <div style={{ fontSize: '24px', color: '#f87171' }}>→→→</div>
              </div>

              {/* FIREWALL */}
              <div style={{ background: 'rgba(0,255,247,0.08)', border: `2px solid ${C.cyan}`, borderRadius: '12px', padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>🔥</div>
                <div style={{ fontSize: '12px', color: C.cyan, fontWeight: 700 }}>FIREWALL</div>
                <div style={{ fontSize: '10px', color: '#4ade80' }}>DEFENSA ACTIVA</div>
              </div>

              {/* FLECHA */}
              <div style={{ fontSize: '24px', color: '#4ade80' }}>→→→</div>

              {/* RED INTERNA */}
              <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '10px', padding: '12px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#4ade80', fontWeight: 700, marginBottom: '4px' }}>RED INTERNA</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>192.168.1.0/24</div>
              </div>
            </div>
          </div>

          {/* GRIDS INFERIORES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {/* TRÁFICO */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px', marginBottom: '10px' }}>TRÁFICO EN TIEMPO REAL</div>
              <div style={{ display: 'flex', align: 'flex-end', gap: '3px', height: '50px', alignItems: 'flex-end' }}>
                {[30, 45, 40, 60, 55, 80, 95, 100, 90, 100].map((h, i) => (
                  <div key={i} style={{ flex: 1, background: i >= 6 ? '#f87171' : C.cyan, borderRadius: '2px 2px 0 0', height: `${h}%`, opacity: 0.7 }} />
                ))}
              </div>
            </div>

            {/* ORIGEN */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px', marginBottom: '10px' }}>ORIGEN DEL ATAQUE</div>
              {escenario.origen.map((o, i) => (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '3px' }}>
                    <span>{o.pais}</span><span>{o.pct}%</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                    <div style={{ height: '100%', borderRadius: '2px', background: '#f87171', width: `${o.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* TIPO */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px', marginBottom: '10px' }}>TIPO DE ATAQUE</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f87171', marginBottom: '8px' }}>⚠ {escenario.tipoAtaque}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>{escenario.descripcionAtaque}</div>
            </div>
          </div>

          {/* SERVICIOS */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px', marginBottom: '12px' }}>SERVICIOS CRÍTICOS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {escenario.nodos.map(nodo => {
                const color = nodo.estado === 'critico' ? '#f87171' : nodo.estado === 'advertencia' ? '#fbbf24' : '#4ade80'
                return (
                  <div key={nodo.id} style={{ background: '#080b18', border: `1px solid ${color}33`, borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>{nodo.nombre}</div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '6px' }}>Disponibilidad</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color }}>{nodo.disponibilidad}%</div>
                    <span style={{ fontSize: '10px' }}>{nodo.estado === 'critico' ? '⚠' : '✅'}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RESULTADO */}
          {(accionElegida || tiempoAgotado) && (
            <div style={{ background: accionElegida?.correcto ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${accionElegida?.correcto ? '#4ade8044' : '#f8717144'}`, borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '17px', fontWeight: 700, color: tiempoAgotado ? '#fbbf24' : accionElegida?.correcto ? '#4ade80' : '#f87171', marginBottom: '8px' }}>
                {tiempoAgotado ? '⏱ Tiempo agotado — los servicios quedaron caídos' : accionElegida?.correcto ? `✅ ${accionElegida.titulo} — Éxito ${accionElegida.exito}%` : `❌ ${accionElegida?.titulo} — Decisión incorrecta`}
              </div>
              {accionElegida && <div style={{ fontSize: '14px', color: '#94a3b8' }}>{accionElegida.desc}</div>}
              <button onClick={siguiente} style={{ marginTop: '16px', padding: '12px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, color: '#080b18', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {escenarioIndex + 1 >= escenarios.length ? 'Ver resultados →' : 'Siguiente escenario →'}
              </button>
            </div>
          )}
        </div>

        {/* PANEL DERECHO — ACCIONES */}
        <div style={{ background: C.sidebar, overflowY: 'auto', padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: C.cyan, letterSpacing: '2px', marginBottom: '6px' }}>¿QUÉ HARÁS?</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Selecciona la mejor acción para mitigar el ataque.</div>

          {escenario.acciones.map(accion => (
            <div key={accion.id} onClick={() => !accionElegida && !tiempoAgotado && elegirAccion(accion)}
              style={{ background: accionElegida ? (accion.correcto ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.04)') : C.card, border: `2px solid ${accionElegida ? (accion.correcto ? '#4ade8044' : '#f8717122') : C.border}`, borderRadius: '12px', padding: '14px', marginBottom: '10px', cursor: accionElegida || tiempoAgotado ? 'default' : 'pointer', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', flex: 1, marginRight: '8px' }}>{accion.titulo}</div>
                {accionElegida && <span style={{ fontSize: '16px', flexShrink: 0 }}>{accion.correcto ? '✅' : '❌'}</span>}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '8px' }}>{accion.desc}</div>
              {accionElegida && (
                <div style={{ fontSize: '12px', fontWeight: 700, color: accion.correcto ? '#4ade80' : '#f87171' }}>
                  ÉXITO PROBABLE: {accion.exito}% · {accion.xp > 0 ? `+${accion.xp}` : accion.xp} XP
                </div>
              )}
            </div>
          ))}

          {!accionElegida && !tiempoAgotado && (
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', padding: '12px 14px', marginTop: '8px' }}>
              <div style={{ fontSize: '12px', color: '#f87171', fontWeight: 700, marginBottom: '4px' }}>⚠ IMPACTO SI NO ACTÚAS</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Si no respondes a tiempo, los servicios críticos podrían quedar inactivos.</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: tiempoColor, marginTop: '8px', fontFamily: 'monospace' }}>
                {timerStr} TIEMPO RESTANTE
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}