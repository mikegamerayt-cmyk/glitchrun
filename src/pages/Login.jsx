import { useState } from 'react'
import { supabase } from '../supabase'
import { MdPerson, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Credenciales incorrectas. Intenta de nuevo.')
    else onLogin()
    setLoading(false)
  }

  async function handleRegister() {
    setLoading(true)
    setError('')
    if (!username || !email || !password) { setError('Completa todos los campos.'); setLoading(false); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); setLoading(false); return }
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } })
    if (error) setError(error.message)
    else setMessage('Cuenta creada. Ya puedes iniciar sesión.')
    setLoading(false)
  }

  const inp = {
    width: '100%',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    padding: '15px 16px 15px 48px',
    color: '#e2e8f0',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '16px',
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>

      {/* FONDO */}
      <img src="/bg-login.png" alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,11,24,0.65)' }} />

      {/* CARD */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '500px', background: 'rgba(8,11,24,0.85)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '48px 44px', backdropFilter: 'blur(16px)' }}>

        {/* LOGO SOLO SIN TEXTO */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <img src="/icon.png" alt="GlitchRun" style={{ width: '250px', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 14px rgba(0,255,247,0.8))' }} />
        </div>

        {/* TÍTULO */}
        <div style={{ fontSize: '22px', fontWeight: 400, color: '#00fff7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '28px' }}>
          {mode === 'login' ? 'Inicio de sesión' : 'Crear cuenta'}
        </div>

        {/* CAMPO NOMBRE — solo registro */}
        {mode === 'register' && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Usuario</div>
            <div style={{ position: 'relative' }}>
              <MdPerson style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '22px' }} />
              <input style={inp} placeholder="Ingresa tu usuario" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
          </div>
        )}

        {/* CORREO */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Usuario</div>
          <div style={{ position: 'relative' }}>
            <MdPerson style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '22px' }} />
            <input style={inp} type="email" placeholder="Ingresa tu usuario" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>

        {/* CONTRASEÑA */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Contraseña</div>
          <div style={{ position: 'relative' }}>
            <MdLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '22px' }} />
            <input style={inp} type={showPassword ? 'text' : 'password'} placeholder="Ingresa tu contraseña"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())} />
            <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {showPassword ? <MdVisibilityOff size={22} color="#64748b" /> : <MdVisibility size={22} color="#64748b" />}
            </button>
          </div>
        </div>

        {/* RECORDARME */}
        {mode === 'login' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: '#00fff7', width: '16px', height: '16px' }} /> Recordarme
            </label>
            <span style={{ color: '#00fff7', cursor: 'pointer' }}>¿Olvidaste tu contraseña?</span>
          </div>
        )}

        {/* ERRORES */}
        {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#f87171', marginBottom: '16px' }}>⚠ {error}</div>}
        {message && <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#4ade80', marginBottom: '16px' }}>✓ {message}</div>}

        {/* BOTÓN */}
        <button onClick={mode === 'login' ? handleLogin : handleRegister} disabled={loading}
          style={{ width: '100%', padding: '16px', borderRadius: '10px', border: 'none', background: 'linear-gradient(to right, #00c6ff, #a855f7)', color: 'white', fontSize: '17px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px', fontFamily: 'inherit' }}>
          {loading ? 'Procesando...' : mode === 'login' ? 'ENTRAR' : 'CREAR CUENTA'} →
        </button>

        {/* CAMBIAR MODO */}
        <div style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
          {mode === 'login'
            ? <>¿No tienes cuenta? <span onClick={() => { setMode('register'); setError('') }} style={{ color: '#00fff7', cursor: 'pointer', fontWeight: 600 }}>Crear cuenta</span></>
            : <>¿Ya tienes cuenta? <span onClick={() => { setMode('login'); setError('') }} style={{ color: '#00fff7', cursor: 'pointer', fontWeight: 600 }}>Iniciar sesión</span></>
          }
        </div>

        {mode === 'login' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: '14px', color: '#64748b' }}>o</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>
            <button style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#94a3b8', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontFamily: 'inherit' }}>
              <MdPerson size={22} color="#94a3b8" /> ENTRAR COMO INVITADO
            </button>
          </>
        )}
      </div>
    </div>
  )
}