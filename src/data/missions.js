export const modules = [
    {
    id: 8,
    icon: 'training',
    color: '#4ade80',
    title: 'Centro de entrenamiento',
    sub: 'Tutorial completado',
    status: 'active',
    progress: 0,
    missions: ['Identificación del sistema', 'Primera alerta', 'Primer informe']
  },
  {
    id: 1,
    icon: 'social',
    color: '#00e5ff',
    title: 'Ingeniería social',
    sub: 'Phishing · Vishing · Smishing',
    status: 'active',
    progress: 0,
    missions: ['Correo sospechoso', 'Mensaje SMS falso', 'Llamada sospechosa', 'Perfil falso en red social']
  },
  {
    id: 2,
    icon: 'password',
    color: '#7c3aed',
    title: 'Contraseñas y acceso',
    sub: 'Autenticación · Permisos · 2FA',
    status: 'active',
    progress: 0,
    missions: ['Construir contraseña segura', 'Descifrar acceso bloqueado', 'Doble factor', 'Permisos mal asignados']
  },
  {
    id: 3,
    icon: 'malware',
    color: '#ff6b35',
    title: 'Archivos y malware',
    sub: 'Detección · Cuarentena · USB',
    status: 'active',
    progress: 0,
    missions: ['Bandeja de descargas', 'Escaneo de amenaza', 'Archivo raro', 'USB infectado']
  },
  {
    id: 4,
    icon: 'network',
    color: '#3b82f6',
    title: 'Defensa de red',
    sub: 'Firewall · IPs · Nodos',
    status: 'new',
    progress: 0,
    missions: ['Estado de la red', 'Bloquear IP sospechosa', 'Aislar nodo infectado', 'Activar firewall']
  },
  {
    id: 5,
    icon: 'forensic',
    color: '#a78bfa',
    title: 'Análisis forense',
    sub: 'Logs · Evidencia · Rastreo',
    status: 'new',
    progress: 0,
    missions: ['Revisar logs', 'Reconstruir intrusión', 'Recuperar evidencia', 'Identificar atacante']
  },
  {
    id: 6,
    icon: 'incident',
    color: '#f87171',
    title: 'Respuesta a incidentes',
    sub: 'Contención · Restauración',
    status: 'new',
    progress: 0,
    missions: ['Alerta múltiple', 'Contención de ataque', 'Restauración del sistema']
  },
  {
    id: 7,
    icon: 'boss',
    color: '#e879f9',
    title: 'Jefe final',
    sub: 'Integración total',
    status: 'new',
    progress: 0,
    missions: ['Ataque combinado', 'Laboratorio comprometido', 'Crisis en tiempo real']
  },

]

export const tools = [
  { icon: '📡', name: 'Escáner de archivos', ready: true },
  { icon: '📄', name: 'Lector de logs', ready: true },
  { icon: '🚫', name: 'Bloqueador de IP', ready: true },
  { icon: '🔗', name: 'Analizador de enlaces', ready: false },
  { icon: '🔌', name: 'Aislador de nodo', ready: false },
  { icon: '🔑', name: 'Verificador de contraseñas', ready: false },
]

export const ranking = [
  { pos: 1, name: 'Agente_42', pts: 1280 },
  { pos: 2, name: 'CipherX', pts: 1140 },
  { pos: 3, name: 'N3tGuard', pts: 990 },
  { pos: 4, name: 'Agente_07', pts: 340, me: true },
  { pos: 5, name: 'Phantom_01', pts: 290 },
]

export const playerData = {
  name: 'Agente_07',
  rank: 'Analista Junior',
  nextRank: 'Técnico en Defensa',
  xp: 340,
  xpMax: 1000,
  streak: 3,
}