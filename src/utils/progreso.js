import { supabase } from '../supabase'

export async function guardarProgreso(misionId, xp) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Guardar progreso de la misión
  const { error } = await supabase
    .from('progreso')
    .upsert({
      user_id: user.id,
      mision_id: misionId,
      completada: true,
      xp: xp,
      completada_at: new Date().toISOString()
    }, { onConflict: 'user_id,mision_id' })

  if (error) console.error('Error guardando progreso:', error)

  // Actualizar perfil con XP total y misiones completadas
  const { data: misiones } = await supabase
    .from('progreso')
    .select('xp')
    .eq('user_id', user.id)

  const xpTotal = (misiones || []).reduce((acc, m) => acc + (m.xp || 0), 0)
  const misionesCompletadas = (misiones || []).length

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Agente'

  await supabase
    .from('perfiles')
    .upsert({
      id: user.id,
      username,
      xp: xpTotal,
      misiones_completadas: misionesCompletadas,
    }, { onConflict: 'id' })
}

export async function cargarProgreso() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('progreso')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error cargando progreso:', error)
    return []
  }

  return data || []
}

export async function cargarRanking() {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .order('xp', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error cargando ranking:', error)
    return []
  }

  return data || []
}