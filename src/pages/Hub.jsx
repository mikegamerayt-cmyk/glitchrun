import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { modules, tools, playerData } from '../data/missions'
import { MdDashboard, MdOutlineFlag, MdBuild, MdInventory, MdLeaderboard, MdEmojiEvents, MdSettings, MdPowerSettingsNew } from 'react-icons/md'
import { RiRadarLine, RiFolderOpenLine, RiTerminalBoxLine, RiLockUnlockLine, RiShieldFlashLine } from 'react-icons/ri'
import ModuleIcon from '../components/ModuleIcon'
import { useNavigate } from 'react-router-dom'
import { cargarProgreso, cargarRanking } from '../utils/progreso'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
  { id: 'misiones', label: 'Misiones', icon: MdOutlineFlag },
  { id: 'herramientas', label: 'Herramientas', icon: MdBuild },
  { id: 'inventario', label: 'Inventario', icon: MdInventory },
  { id: 'ranking', label: 'Ranking', icon: MdLeaderboard },
  { id: 'logros', label: 'Logros', icon: MdEmojiEvents },
  { id: 'ajustes', label: 'Ajustes', icon: MdSettings },
]

const quickTools = [
  { icon: RiRadarLine, label: 'Escáner de Red', color: '#00fff7' },
  { icon: RiFolderOpenLine, label: 'Analizador de Archivos', color: '#a855f7' },
  { icon: RiTerminalBoxLine, label: 'Terminal Segura', color: '#a855f7' },
  { icon: RiLockUnlockLine, label: 'Descifrador', color: '#f472b6' },
  { icon: RiShieldFlashLine, label: 'Firewall', color: '#00fff7' },
]

const missionColors = ['#00fff7', '#a855f7', '#ff4d00', '#3b82f6']

const C = {
  cyan: '#00fff7', violet: '#a855f7', pink: '#f472b6',
  bg: '#080b18', sidebar: '#0b0f1e', card: '#0f1326',
  border: 'rgba(255,255,255,0.1)',
}

export default function Hub({ session }) {
  const [activePage, setActivePage] = useState('dashboard')
  const [selectedModule, setSelectedModule] = useState(null)
  const [progresoReal, setProgresoReal] = useState([])
  const [rankingReal, setRankingReal] = useState([])
  const navigate = useNavigate()
  const username = session?.user?.user_metadata?.username || 'Agente'
  

  useEffect(() => {
    cargarProgreso().then(data => setProgresoReal(data))
    cargarRanking().then(data => setRankingReal(data))
  }, [])

  const getModuloData = (mod) => {
    const p = progresoReal.find(pr => pr.mision_id === mod.id)
    return {
      ...mod,
      progress: p ? 100 : mod.progress,
      status: p ? 'completed' : mod.status,
    }
  }

const miPos = rankingReal.findIndex(r => r.id === session?.user?.id)
const miPerfil = rankingReal.find(r => r.id === session?.user?.id)
const xpReal = miPerfil?.xp || progresoReal.reduce((acc, m) => acc + (m.xp || 0), 0)
const xpMax = 1000
const nivelReal = xpReal >= 800 ? 'Especialista' : xpReal >= 500 ? 'Analista Nivel 3' : xpReal >= 200 ? 'Analista Nivel 2' : 'Analista Nivel 1'
const pageStyle = {
  animation: 'fadeSlideIn 0.3s ease forwards',
}

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', fontSize: '15px' }}>
      <style>{`
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`}</style>     

      {/* SIDEBAR */}
      <aside style={{ width: '240px', minHeight: '100vh', background: C.sidebar, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 20 }}>
        <div style={{ padding: '8px 0px 0px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
          <img src="/icon.png" alt="GlitchRun" style={{ width: '205px', height: 'auto', objectFit: 'contain', transform: 'scale(1.5)', transformOrigin: 'center', filter: 'drop-shadow(0 0 12px rgba(0,255,247,0.8))' }} />
        </div>
        <nav style={{ flex: 1, padding: '2px 10px' }}>
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <button key={item.id} onClick={() => setActivePage(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '16px', padding: '13px 16px', borderRadius: '10px', background: activePage === item.id ? 'rgba(0,255,247,0.12)' : 'transparent', border: 'none', borderLeft: activePage === item.id ? `3px solid ${C.cyan}` : '3px solid transparent', color: activePage === item.id ? C.cyan : '#64748b', fontSize: '16px', fontWeight: activePage === item.id ? 600 : 400, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', marginBottom: '1px', fontFamily: 'inherit' }}>
                <Icon size={36} />
                {item.label.toUpperCase()}
              </button>
            )
          })}
        </nav>
        <div style={{ padding: '20px 24px', borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => supabase.auth.signOut()} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', color: '#f87171', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
            <MdPowerSettingsNew size={20} /> CERRAR SESIÓN
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* TOPBAR */}
        <header style={{ height: '70px', background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 32px', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: `2px solid ${C.violet}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👤</div>
            <div>
<div style={{ fontSize: '16px', color: C.cyan, fontWeight: 600 }}>{nivelReal}</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
  <div style={{ width: '160px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)' }}>
    <div style={{ height: '100%', borderRadius: '3px', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, width: `${Math.min((xpReal / xpMax) * 100, 100)}%` }} />
  </div>
  <span style={{ fontSize: '13px', color: '#64748b' }}>{xpReal} / {xpMax} XP</span>
</div>
            </div>
          </div>
        </header>

        {/* DASHBOARD */}
{activePage === 'dashboard' && (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', flex: 1, animation: 'fadeSlideIn 0.3s ease forwards' }}>
            <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ position: 'relative', minHeight: '300px', overflow: 'hidden' }}>
                <img src="/hero.png" alt="hero" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,11,24,0.97) 35%, rgba(8,11,24,0.5) 70%, rgba(8,11,24,0.2))' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,11,24,1) 0%, transparent 40%)' }} />
                <div style={{ position: 'relative', zIndex: 1, padding: '48px 40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '13px', color: C.cyan, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>Centro de Operaciones</div>
                  <div style={{ fontSize: '38px', fontWeight: 800, color: 'white', marginBottom: '14px' }}>Bienvenido, {username}</div>
                  <p style={{ fontSize: '16px', color: '#94a3b8', maxWidth: '420px', lineHeight: '1.7', marginBottom: '28px' }}>
                    Entrena tus habilidades, completa misiones y protege sistemas en escenarios reales.
                  </p>
                  <button onClick={() => navigate('/tutorial')} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', borderRadius: '10px', border: `2px solid ${C.cyan}`, background: 'transparent', color: C.cyan, fontSize: '15px', fontWeight: 600, letterSpacing: '1px', cursor: 'pointer', fontFamily: 'inherit', width: 'fit-content' }}>
                    INICIAR ENTRENAMIENTO →
                  </button>
                </div>
              </div>

              <div style={{ padding: '28px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '13px', color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '18px', fontWeight: 600 }}>Herramientas Rápidas</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                  {quickTools.map((t, i) => {
                    const Icon = t.icon
                    return (
                      <button key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 12px', borderRadius: '12px', border: `1px solid ${C.border}`, background: C.card, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: `${t.color}22`, border: `1px solid ${t.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color }}>
                          <Icon size={26} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', lineHeight: '1.4' }}>{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div style={{ fontSize: '13px', color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>Misiones Activas</div>
                  <button onClick={() => setActivePage('misiones')} style={{ background: 'none', border: 'none', color: C.cyan, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '1px' }}>VER TODAS</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {modules.filter(m => m.status === 'active' || m.status === 'new').slice(0, 4).map((mod, i) => (
                    <div key={mod.id} onClick={() => setActivePage('misiones')} style={{ background: C.card, border: `1px solid ${C.border}`, borderBottom: `3px solid ${missionColors[i]}`, borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${missionColors[i]}22`, border: `1px solid ${missionColors[i]}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                        <ModuleIcon type={mod.icon} color={missionColors[i]} size={24} />
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>{mod.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>{mod.sub}</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>{mod.progress}%</div>
                      <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', marginBottom: '12px' }}>
                        <div style={{ height: '100%', borderRadius: '2px', background: missionColors[i], width: `${mod.progress}%`, boxShadow: `0 0 8px ${missionColors[i]}` }} />
                      </div>
                      <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '6px', background: `${missionColors[i]}22`, border: `1px solid ${missionColors[i]}66`, fontSize: '11px', color: missionColors[i], letterSpacing: '1px', fontWeight: 600 }}>
                        {mod.status === 'locked' ? '🔒 BLOQUEADO' : 'EN CURSO'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: C.sidebar, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ padding: '24px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '12px', color: C.cyan, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 700 }}>Misión Actual</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>Ingeniería social</div>
                <div style={{ fontSize: '14px', marginBottom: '16px' }}>Dificultad: <span style={{ color: C.cyan, fontWeight: 600 }}>Media</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Progreso</span>
                  <span style={{ color: 'white', fontWeight: 600 }}>60%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ height: '100%', width: '60%', borderRadius: '3px', background: `linear-gradient(to right, ${C.cyan}, ${C.violet})`, boxShadow: `0 0 10px ${C.cyan}88` }} />
                </div>
              </div>
              <div style={{ padding: '24px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '12px', color: C.cyan, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 700 }}>Puntuación</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${C.violet}33`, border: `2px solid ${C.violet}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: C.violet }}>★</div>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: 'white', lineHeight: 1 }}>{xpReal} pts</div>
                    <div style={{ fontSize: '13px', color: C.cyan, marginTop: '4px' }}>+150 pts esta sesión</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '24px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '12px', color: C.cyan, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 700 }}>Racha</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${C.violet}33`, border: `2px solid ${C.violet}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: 'white', lineHeight: 1 }}>{progresoReal.length} misiones</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '24px' }}>
<div style={{ fontSize: '12px', color: C.cyan, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 700 }}>Consejo del Día</div>
<p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.8' }}>
  {[
    'Mantén siempre tus sistemas actualizados. Muchas brechas explotan vulnerabilidades conocidas.',
    'Usa un gestor de contraseñas. Reutilizar contraseñas es uno de los errores más comunes.',
    'Activa el doble factor en todas tus cuentas importantes. Un código extra puede salvarte.',
    'Desconfía de correos urgentes. La urgencia artificial es la táctica favorita del phishing.',
    'Nunca conectes USBs desconocidos. Un USB abandonado puede comprometer toda una empresa.',
    'El 95% de los incidentes de seguridad son causados por error humano. Entrena constantemente.',
    'Verifica siempre el dominio antes de ingresar credenciales. Un carácter diferente puede ser fatal.',
    'Los backups son tu última línea de defensa contra el ransomware. Guárdalos offline.',
    'El soporte técnico legítimo nunca te pedirá tu contraseña por teléfono.',
    'Una red WiFi pública puede ser controlada por un atacante. Usa VPN en redes desconocidas.',
  ][new Date().getDay() % 10]}
</p>
              </div>
            </div>
          </div>
        )}

        {/* MISIONES */}
{activePage === 'misiones' && (
  <div style={{ padding: '28px', overflowY: 'auto', animation: 'fadeSlideIn 0.3s ease forwards' }}>
            <div style={{ fontSize: '13px', color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', fontWeight: 600 }}>
              <span style={{ color: C.cyan }}>▸</span> Módulos de entrenamiento
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {modules.map((mod, i) => {
                const modData = getModuloData(mod)
                return (
                  <div key={modData.id} onClick={() => modData.status !== 'locked' && setSelectedModule(selectedModule?.id === modData.id ? null : modData)}
                    style={{ background: C.card, border: `1px solid ${selectedModule?.id === modData.id ? missionColors[i % 4] + '88' : C.border}`, borderBottomWidth: '3px', borderBottomColor: missionColors[i % 4], borderRadius: '12px', padding: '20px', cursor: modData.status === 'locked' ? 'not-allowed' : 'pointer', opacity: modData.status === 'locked' ? 0.4 : 1, transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${missionColors[i % 4]}22`, border: `1px solid ${missionColors[i % 4]}66`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ModuleIcon type={modData.icon} color={missionColors[i % 4]} size={26} />
                      </div>
                      <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', background: modData.status === 'active' ? `${C.cyan}22` : modData.status === 'completed' ? 'rgba(74,222,128,0.12)' : modData.status === 'new' ? 'rgba(251,191,36,0.12)' : 'rgba(100,116,139,0.12)', color: modData.status === 'active' ? C.cyan : modData.status === 'completed' ? '#4ade80' : modData.status === 'new' ? '#fbbf24' : '#64748b', border: `1px solid ${modData.status === 'active' ? C.cyan + '66' : modData.status === 'completed' ? '#4ade8044' : modData.status === 'new' ? '#fbbf2444' : '#64748b44'}`, fontWeight: 600 }}>
                        {modData.status === 'active' ? 'EN CURSO' : modData.status === 'completed' ? 'COMPLETO' : modData.status === 'new' ? 'DISPONIBLE' : 'BLOQUEADO'}
                      </span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '6px' }}>{modData.title}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{modData.sub}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>{modData.missions.length} misiones</span>
                      <span style={{ color: missionColors[i % 4], fontWeight: 600 }}>{modData.progress}%</span>
                    </div>
                    <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ height: '100%', borderRadius: '3px', background: missionColors[i % 4], width: `${modData.progress}%`, boxShadow: `0 0 8px ${missionColors[i % 4]}` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {selectedModule && (
              <div style={{ background: C.card, border: `1px solid ${C.cyan}44`, borderLeft: `4px solid ${C.cyan}`, borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${selectedModule.color}22`, border: `1px solid ${selectedModule.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ModuleIcon type={selectedModule.icon} color={selectedModule.color} size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{selectedModule.title}</div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>{selectedModule.missions.length} misiones · {selectedModule.progress}% completado</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate(selectedModule.id === 8 ? '/tutorial' : `/mision/${selectedModule.id}`)} style={{ padding: '10px 24px', borderRadius: '10px', border: `2px solid ${C.cyan}`, background: `${C.cyan}22`, color: C.cyan, fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>[ INICIAR ]</button>
                    <button onClick={() => setSelectedModule(null)} style={{ padding: '10px 14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                  </div>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', marginBottom: '20px' }}>
                  <div style={{ height: '100%', borderRadius: '3px', background: C.cyan, width: `${selectedModule.progress}%`, boxShadow: `0 0 10px ${C.cyan}` }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {selectedModule.missions.map((m, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px', cursor: 'pointer' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>Misión {i + 1}</div>
                      <div style={{ fontSize: '14px', color: C.cyan }}>{m}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RANKING */}
{activePage === 'ranking' && (
  <div style={{ padding: '28px', overflowY: 'auto', animation: 'fadeSlideIn 0.3s ease forwards' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', fontWeight: 600 }}>
                  <span style={{ color: C.cyan }}>▸</span> Top Agentes Globales
                </div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 24px', borderBottom: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px', fontSize: '11px', color: '#64748b', letterSpacing: '2px' }}>
                    <span>POS</span><span>AGENTE</span><span>XP</span><span>MISIONES</span>
                  </div>
                  {rankingReal.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                      Sé el primero en el ranking — completa una misión.
                    </div>
                  ) : (
                    rankingReal.map((r, i) => {
                      const esYo = r.id === session?.user?.id
                      const medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                      return (
                        <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px', padding: '14px 24px', borderBottom: `1px solid ${C.border}`, background: esYo ? `${C.cyan}08` : 'transparent', alignItems: 'center' }}>
                          <div style={{ fontSize: '18px' }}>{medalla || `#${i + 1}`}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: esYo ? `${C.cyan}33` : 'rgba(255,255,255,0.05)', border: `2px solid ${esYo ? C.cyan : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                              {r.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div style={{ fontSize: '14px', color: esYo ? C.cyan : 'white', fontWeight: esYo ? 700 : 400 }}>
                              {r.username} {esYo && <span style={{ fontSize: '11px' }}>◀ tú</span>}
                            </div>
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: esYo ? C.cyan : 'white' }}>{r.xp?.toLocaleString()} XP</div>
                          <div style={{ fontSize: '13px', color: '#64748b' }}>{r.misiones_completadas}/7</div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13px', color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', fontWeight: 600 }}>
                  <span style={{ color: C.cyan }}>▸</span> Tu posición
                </div>
                <div style={{ background: C.card, border: `1px solid ${C.cyan}33`, borderRadius: '14px', padding: '24px', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', fontWeight: 900, color: C.cyan, marginBottom: '8px' }}>
                    {miPos === -1 ? '—' : `#${miPos + 1}`}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {miPos === -1 ? 'Completa una misión para aparecer' : `de ${rankingReal.length} agentes`}
                  </div>
                </div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px' }}>
                  <div style={{ fontSize: '12px', color: C.cyan, letterSpacing: '2px', marginBottom: '14px', fontWeight: 700 }}>TUS STATS</div>
                  {[
                    { label: 'XP Total', valor: `${(miPerfil?.xp || playerData.xp).toLocaleString()}`, color: '#fbbf24' },
                    { label: 'Misiones', valor: `${progresoReal.length}/7`, color: '#4ade80' },
                    { label: 'Rango', valor: playerData.rank, color: C.cyan },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>{s.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: s.color }}>{s.valor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HERRAMIENTAS */}
{activePage === 'herramientas' && (
  <div style={{ padding: '28px', animation: 'fadeSlideIn 0.3s ease forwards' }}>
            <div style={{ fontSize: '13px', color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', fontWeight: 600 }}>
              <span style={{ color: C.cyan }}>▸</span> Kit de seguridad
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '700px' }}>
              {tools.map((t, i) => (
                <div key={i} style={{ background: t.ready ? `${C.cyan}0f` : C.card, border: t.ready ? `1px solid ${C.cyan}44` : `1px solid ${C.border}`, borderRadius: '12px', padding: '28px', textAlign: 'center', opacity: t.ready ? 1 : 0.4 }}>
                  <div style={{ fontSize: '38px', marginBottom: '14px' }}>{t.icon}</div>
                  <div style={{ fontSize: '15px', color: 'white', marginBottom: '14px', fontWeight: 600 }}>{t.name}</div>
                  <span style={{ fontSize: '12px', padding: '5px 14px', borderRadius: '20px', border: t.ready ? `1px solid ${C.cyan}66` : '1px solid rgba(100,116,139,0.3)', color: t.ready ? C.cyan : '#64748b', background: t.ready ? `${C.cyan}22` : 'transparent', fontWeight: 600 }}>
                    {t.ready ? 'DISPONIBLE' : 'BLOQUEADA'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

{activePage === 'logros' && (
  <div style={{ padding: '28px', overflowY: 'auto', animation: 'fadeSlideIn 0.3s ease forwards' }}>
    <div style={{ fontSize: '13px', color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', fontWeight: 600 }}>
      <span style={{ color: C.cyan }}>▸</span> Logros desbloqueados
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      {[
        { icono: '🎓', titulo: 'Primera misión', desc: 'Completa tu primera misión', desbloqueado: progresoReal.length >= 1, xp: 50 },
        { icono: '📧', titulo: 'Anti-Phishing', desc: 'Completa la misión de ingeniería social', desbloqueado: progresoReal.some(p => p.mision_id === 1), xp: 100 },
        { icono: '📞', titulo: 'Detector de Vishing', desc: 'Completa el módulo de llamadas', desbloqueado: progresoReal.some(p => p.mision_id === 2), xp: 150 },
        { icono: '🔐', titulo: 'Maestro de contraseñas', desc: 'Completa el módulo de contraseñas', desbloqueado: progresoReal.some(p => p.mision_id === 3), xp: 150 },
        { icono: '🦠', titulo: 'Cazador de malware', desc: 'Completa la misión de archivos y malware', desbloqueado: progresoReal.some(p => p.mision_id === 3), xp: 200 },
        { icono: '🌐', titulo: 'Defensor de redes', desc: 'Completa la misión de defensa de red', desbloqueado: progresoReal.some(p => p.mision_id === 4), xp: 200 },
        { icono: '🔍', titulo: 'Investigador forense', desc: 'Completa el análisis forense', desbloqueado: progresoReal.some(p => p.mision_id === 5), xp: 250 },
        { icono: '🚨', titulo: 'Gestor de crisis', desc: 'Completa la respuesta a incidentes', desbloqueado: progresoReal.some(p => p.mision_id === 6), xp: 300 },
        { icono: '💀', titulo: 'Cazador de APT', desc: 'Derrota al jefe final APT-X', desbloqueado: progresoReal.some(p => p.mision_id === 7), xp: 500 },
        { icono: '🏆', titulo: 'Agente Élite', desc: 'Completa todas las misiones', desbloqueado: progresoReal.length >= 7, xp: 1000 },
        { icono: '⚡', titulo: 'Velocista', desc: 'Completa una misión en menos de 2 minutos', desbloqueado: false, xp: 200 },
        { icono: '🎯', titulo: 'Perfeccionista', desc: 'Obtén puntuación perfecta en cualquier misión', desbloqueado: false, xp: 300 },
      ].map((logro, i) => (
        <div key={i} style={{ background: logro.desbloqueado ? `${C.cyan}08` : C.card, border: `1px solid ${logro.desbloqueado ? C.cyan + '44' : C.border}`, borderRadius: '14px', padding: '24px', opacity: logro.desbloqueado ? 1 : 0.4, transition: 'all 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div style={{ fontSize: '40px' }}>{logro.desbloqueado ? logro.icono : '🔒'}</div>
            <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', background: logro.desbloqueado ? 'rgba(74,222,128,0.15)' : 'rgba(100,116,139,0.12)', color: logro.desbloqueado ? '#4ade80' : '#64748b', fontWeight: 700 }}>
              {logro.desbloqueado ? '✓ LOGRADO' : 'BLOQUEADO'}
            </span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: logro.desbloqueado ? 'white' : '#64748b', marginBottom: '6px' }}>{logro.titulo}</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', lineHeight: '1.5' }}>{logro.desc}</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>+{logro.xp} XP</div>
        </div>
      ))}
    </div>
  </div>
)}

{activePage === 'inventario' && (
  <div style={{ padding: '28px', overflowY: 'auto', animation: 'fadeSlideIn 0.3s ease forwards' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>

      <div>
        <div style={{ fontSize: '13px', color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', fontWeight: 600 }}>
          <span style={{ color: C.cyan }}>▸</span> Arsenal del agente
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            { icono: '🔍', nombre: 'Escáner de Red', tipo: 'Herramienta', rareza: 'COMÚN', desbloqueado: true, desc: 'Escanea puertos y servicios activos en la red.' },
            { icono: '📄', nombre: 'Lector de Logs', tipo: 'Herramienta', rareza: 'COMÚN', desbloqueado: true, desc: 'Analiza archivos de registro del sistema.' },
            { icono: '🚫', nombre: 'Bloqueador de IP', tipo: 'Herramienta', rareza: 'POCO COMÚN', desbloqueado: true, desc: 'Bloquea IPs maliciosas en el firewall.' },
            { icono: '🔗', nombre: 'Analizador de URLs', tipo: 'Herramienta', rareza: 'POCO COMÚN', desbloqueado: progresoReal.length >= 1, desc: 'Detecta URLs maliciosas y dominios falsos.' },
            { icono: '🧠', nombre: 'Analizador de Memoria', tipo: 'Herramienta', rareza: 'RARO', desbloqueado: progresoReal.length >= 3, desc: 'Analiza procesos en memoria RAM.' },
            { icono: '🕵️', nombre: 'Rastreador Forense', tipo: 'Herramienta', rareza: 'RARO', desbloqueado: progresoReal.some(p => p.mision_id === 5), desc: 'Reconstruye la línea de tiempo de un ataque.' },
            { icono: '💀', nombre: 'Analizador APT', tipo: 'Herramienta', rareza: 'ÉPICO', desbloqueado: progresoReal.some(p => p.mision_id === 7), desc: 'Detecta amenazas persistentes avanzadas.' },
            { icono: '🛡️', nombre: 'Escudo Cuántico', tipo: 'Especial', rareza: 'LEGENDARIO', desbloqueado: progresoReal.length >= 7, desc: 'Protección total contra todos los vectores conocidos.' },
            { icono: '⚡', nombre: 'Turbo Firewall', tipo: 'Especial', rareza: 'ÉPICO', desbloqueado: progresoReal.some(p => p.mision_id === 4), desc: 'Firewall de alta velocidad con IA integrada.' },
          ].map((item, i) => {
            const colorRareza = item.rareza === 'LEGENDARIO' ? '#fbbf24' : item.rareza === 'ÉPICO' ? C.violet : item.rareza === 'RARO' ? C.cyan : '#4ade80'
            return (
              <div key={i} style={{ background: item.desbloqueado ? C.card : 'rgba(255,255,255,0.02)', border: `1px solid ${item.desbloqueado ? colorRareza + '44' : C.border}`, borderRadius: '12px', padding: '20px', opacity: item.desbloqueado ? 1 : 0.4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontSize: '36px' }}>{item.desbloqueado ? item.icono : '🔒'}</div>
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: `${colorRareza}22`, color: colorRareza, fontWeight: 700, border: `1px solid ${colorRareza}44` }}>
                    {item.rareza}
                  </span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: item.desbloqueado ? 'white' : '#64748b', marginBottom: '4px' }}>{item.nombre}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>{item.tipo}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>{item.desbloqueado ? item.desc : 'Completa más misiones para desbloquear.'}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '13px', color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', fontWeight: 600 }}>
          <span style={{ color: C.cyan }}>▸</span> Resumen
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: C.cyan, letterSpacing: '2px', marginBottom: '14px', fontWeight: 700 }}>COLECCIÓN</div>
          {[
            { label: 'Items desbloqueados', valor: `${[true, true, true, progresoReal.length >= 1, progresoReal.length >= 3, progresoReal.some(p => p.mision_id === 5), progresoReal.some(p => p.mision_id === 7), progresoReal.length >= 7, progresoReal.some(p => p.mision_id === 4)].filter(Boolean).length}/9`, color: C.cyan },
            { label: 'Herramientas', valor: '3+', color: '#4ade80' },
            { label: 'Items épicos', valor: progresoReal.some(p => p.mision_id === 4) ? '1' : '0', color: C.violet },
            { label: 'Items legendarios', valor: progresoReal.length >= 7 ? '1' : '0', color: '#fbbf24' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{s.label}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: s.color }}>{s.valor}</span>
            </div>
          ))}
        </div>
        <div style={{ background: `${C.violet}0f`, border: `1px solid ${C.violet}33`, borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: C.violet, letterSpacing: '2px', marginBottom: '10px', fontWeight: 700 }}>💡 PRÓXIMOS ITEMS</div>
          <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.7' }}>
            Completa más misiones para desbloquear herramientas raras y épicas de tu arsenal.
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{activePage === 'ajustes' && (
  <div style={{ padding: '28px', overflowY: 'auto', animation: 'fadeSlideIn 0.3s ease forwards' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '900px' }}>

      {/* PERFIL */}
      <div>
        <div style={{ fontSize: '13px', color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 600 }}>
          <span style={{ color: C.cyan }}>▸</span> Perfil del agente
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `linear-gradient(135deg, ${C.cyan}33, ${C.violet}33)`, border: `2px solid ${C.cyan}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>👤</div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>{username}</div>
              <div style={{ fontSize: '13px', color: C.cyan }}>{playerData.rank}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{session?.user?.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>NOMBRE DE AGENTE</div>
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, fontSize: '14px', color: '#e2e8f0' }}>{username}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>CORREO</div>
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, fontSize: '14px', color: '#e2e8f0' }}>{session?.user?.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>RANGO ACTUAL</div>
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: `${C.cyan}08`, border: `1px solid ${C.cyan}33`, fontSize: '14px', color: C.cyan, fontWeight: 600 }}>{playerData.rank}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CUENTA Y PELIGRO */}
      <div>
        <div style={{ fontSize: '13px', color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 600 }}>
          <span style={{ color: C.cyan }}>▸</span> Cuenta
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: C.cyan, letterSpacing: '2px', marginBottom: '14px', fontWeight: 700 }}>ESTADÍSTICAS</div>
          {[
            { label: 'Misiones completadas', valor: `${progresoReal.length}/7` },
            { label: 'XP acumulado', valor: `${xpReal.toLocaleString()}` },
            { label: 'Logros desbloqueados', valor: `${[progresoReal.length >= 1, progresoReal.some(p => p.mision_id === 1), progresoReal.some(p => p.mision_id === 2), progresoReal.some(p => p.mision_id === 3), progresoReal.some(p => p.mision_id === 4), progresoReal.some(p => p.mision_id === 5), progresoReal.some(p => p.mision_id === 6), progresoReal.some(p => p.mision_id === 7), progresoReal.length >= 7].filter(Boolean).length}/12` },
            { label: 'Miembro desde', valor: new Date(session?.user?.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' }) },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{s.label}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{s.valor}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '14px', padding: '24px' }}>
          <div style={{ fontSize: '12px', color: '#f87171', letterSpacing: '2px', marginBottom: '14px', fontWeight: 700 }}>⚠ ZONA DE PELIGRO</div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px', lineHeight: '1.6' }}>
            Cerrar sesión te desconectará de GlitchRun. Tu progreso está guardado en la nube.
          </div>
          <button onClick={() => supabase.auth.signOut()}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.1)', color: '#f87171', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            🚪 Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  )
}