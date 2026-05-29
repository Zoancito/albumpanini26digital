// ═══════════════════════════════════════════════════
//  ÁLBUM MUNDIAL 2026 — friendships.js
// ═══════════════════════════════════════════════════
import { supabase } from './supabase.js'

/**
 * Devuelve la relación entre el usuario logueado y otro usuario.
 * Retorna: null | { id, status, sender_id, receiver_id }
 */
export async function getFriendshipStatus(otherUserId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('friendships')
    .select('id, status, sender_id, receiver_id')
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),` +
      `and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .maybeSingle()

  return data || null
}

/** Envía solicitud de amistad */
export async function sendFriendRequest(receiverId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('friendships')
    .insert({ sender_id: user.id, receiver_id: receiverId })
    .select().single()

  if (error) throw error
  return data
}

/** Acepta una solicitud (solo el receiver puede) */
export async function acceptFriendRequest(friendshipId) {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', friendshipId)
    .select().single()

  if (error) throw error
  return data
}

/** Rechaza o cancela una solicitud / elimina amistad */
export async function removeFriendship(friendshipId) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)

  if (error) throw error
}

/** Lista de amigos confirmados del usuario actual */
export async function getMyFriends() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('friendships')
    .select(`
      id, status, sender_id, receiver_id,
      sender:profiles!friendships_sender_id_fkey(id, username, full_name, avatar_url),
      receiver:profiles!friendships_receiver_id_fkey(id, username, full_name, avatar_url)
    `)
    .eq('status', 'accepted')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

  return (data || []).map(f => {
    const friend = f.sender_id === user.id ? f.receiver : f.sender
    return { friendshipId: f.id, ...friend }
  })
}

/** Solicitudes pendientes recibidas por el usuario actual */
export async function getPendingRequests() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('friendships')
    .select(`
      id, created_at,
      sender:profiles!friendships_sender_id_fkey(id, username, full_name, avatar_url)
    `)
    .eq('receiver_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return data || []
}
