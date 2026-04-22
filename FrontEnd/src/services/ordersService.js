const BASE_URL = '/api/orders'

export async function createOrder(userId, items) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      items: items.map((i) => ({ skillId: i.id, quantity: i.quantity })),
    }),
  })
  if (!res.ok) throw new Error('Error al crear la orden')
  return res.json()
}

export async function checkoutOrder(orderId) {
  const res = await fetch(`${BASE_URL}/${orderId}`, { method: 'PUT' })
  if (!res.ok) throw new Error('Error al confirmar la orden')
  return res.json()
}

export async function getOrdersByUser(userId) {
  const res = await fetch(`${BASE_URL}/user/${userId}`)
  if (!res.ok) throw new Error('Error al obtener órdenes')
  return res.json()
}
