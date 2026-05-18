const BASE_URL = '/api/products'

export async function getSkills() {
  const res = await fetch(BASE_URL)
  if (!res.ok) throw new Error('Error al obtener habilidades')
  return res.json()
}
