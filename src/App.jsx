import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import Login from './pages/Login'
import Hub from './pages/Hub'
import Mision1 from './pages/Mision1'
import Mision2 from './pages/Mision2'
import Mision3 from './pages/Mision3'
import Mision4 from './pages/Mision4'
import Mision5 from './pages/Mision5'
import Mision6 from './pages/Mision6'
import Mision7 from './pages/Mision7'
import Tutorial from './pages/Tutorial'

function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

if (session === undefined) return (
  <div style={{ minHeight: '100vh', background: '#080b18', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#00fff7', gap: '32px' }}>
    <img src="/icon.png" alt="GlitchRun" style={{ width: '120px', filter: 'drop-shadow(0 0 24px rgba(0,255,247,0.8))', animation: 'pulse 2s infinite' }} />
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '6px', marginBottom: '8px' }}>
        <span style={{ color: '#00fff7' }}>GLITCH</span><span style={{ color: '#f472b6' }}>RUN</span>
      </div>
      <div style={{ fontSize: '12px', color: '#64748b', letterSpacing: '3px' }}>ACADEMIA DE CIBERSEGURIDAD</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '280px' }}>
      <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'linear-gradient(to right, #00fff7, #a855f7)', borderRadius: '2px', animation: 'loading 1.5s ease-in-out infinite' }} />
      </div>
      <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '2px' }}>INICIANDO SISTEMA...</div>
    </div>
    <style>{`
      @keyframes pulse {
        0%, 100% { filter: drop-shadow(0 0 24px rgba(0,255,247,0.8)); }
        50% { filter: drop-shadow(0 0 40px rgba(0,255,247,1)); }
      }
      @keyframes loading {
        0% { width: 0%; margin-left: 0; }
        50% { width: 70%; margin-left: 0; }
        100% { width: 0%; margin-left: 100%; }
      }
    `}</style>
  </div>
)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={session ? <Hub session={session} /> : <Login onLogin={() => {}} />} />
        <Route path="/mision/1" element={session ? <Mision1 session={session} /> : <Navigate to="/" />} />
        <Route path="/mision/2" element={session ? <Mision2 session={session} /> : <Navigate to="/" />} />
        <Route path="/mision/3" element={session ? <Mision3 session={session} /> : <Navigate to="/" />} />
        <Route path="/mision/4" element={session ? <Mision4 session={session} /> : <Navigate to="/" />} />
        <Route path="/mision/5" element={session ? <Mision5 session={session} /> : <Navigate to="/" />} />
        <Route path="/mision/6" element={session ? <Mision6 session={session} /> : <Navigate to="/" />} />
        <Route path="/mision/7" element={session ? <Mision7 session={session} /> : <Navigate to="/" />} />
        <Route path="/tutorial" element={session ? <Tutorial session={session} /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App