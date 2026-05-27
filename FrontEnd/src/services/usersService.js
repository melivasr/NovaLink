const BASE_URL = '/api/users'

export async function getUserSkills(userId) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE_URL}/${userId}/skills`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Error al obtener habilidades del usuario')
  return res.json()
}