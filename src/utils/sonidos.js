let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

function crearSonido(frecuencia, duracion, tipo = 'sine', volumen = 0.3) {
  try {
    const audioCtx = getCtx()
    const oscilador = audioCtx.createOscillator()
    const ganancia = audioCtx.createGain()

    oscilador.connect(ganancia)
    ganancia.connect(audioCtx.destination)

    oscilador.type = tipo
    oscilador.frequency.setValueAtTime(frecuencia, audioCtx.currentTime)
    ganancia.gain.setValueAtTime(volumen, audioCtx.currentTime)
    ganancia.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duracion)

    oscilador.start(audioCtx.currentTime)
    oscilador.stop(audioCtx.currentTime + duracion)
  } catch (e) {}
}

let ultimoSonido = 0

function throttle() {
  const ahora = Date.now()
  if (ahora - ultimoSonido < 300) return false
  ultimoSonido = ahora
  return true
}

export function sonidoExito() {
  if (!throttle()) return
  crearSonido(523, 0.1)
  setTimeout(() => crearSonido(659, 0.1), 100)
  setTimeout(() => crearSonido(784, 0.2), 200)
}

export function sonidoError() {
  if (!throttle()) return
  crearSonido(300, 0.1, 'sawtooth')
  setTimeout(() => crearSonido(200, 0.2, 'sawtooth'), 100)
}

export function sonidoMisionCompleta() {
  if (!throttle()) return
  crearSonido(523, 0.1)
  setTimeout(() => crearSonido(659, 0.1), 100)
  setTimeout(() => crearSonido(784, 0.1), 200)
  setTimeout(() => crearSonido(1047, 0.4), 300)
}

export function sonidoClick() {
  if (!throttle()) return
  crearSonido(800, 0.05, 'sine', 0.1)
}