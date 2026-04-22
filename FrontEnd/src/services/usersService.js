const BASE_URL = '/api/users'

export async function getUserSkills(userId) {
  const res = await fetch(`${BASE_URL}/${userId}/skills`)
  if (!res.ok) throw new Error('Error al obtener habilidades del usuario')
  return res.json()
}
