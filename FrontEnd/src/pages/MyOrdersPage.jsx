import { useEffect, useState } from 'react'
import { getOrdersByUser } from '../services/ordersService'
import { getSkills } from '../services/productsService'

const statusColor = {
  Pendiente:  '#F2C94C',
  Completada: '#6FCF97',
  Cancelada:  '#EB5757',
}

function MyOrdersPage() {
  const [orders, setOrders] = useState([])
  const [productMap, setProductMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const userId = localStorage.getItem('userId')

  useEffect(() => {
    if (!userId) {
      setError('No hay sesión activa')
      setLoading(false)
      return
    }
    Promise.all([getOrdersByUser(userId), getSkills()])
      .then(([ordersRes, allProducts]) => {
        const map = {}
        allProducts.forEach((p) => { map[p.id] = p.name })
        setProductMap(map)
        setOrders(ordersRes.data || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={styles.center}>Cargando órdenes...</p>
  if (error)   return <p style={{ ...styles.center, color: '#ff6b6b' }}>{error}</p>

  if (orders.length === 0) {
    return (
      <div style={styles.page}>
        <h2 style={styles.title}>Mis Órdenes</h2>
        <p style={{ color: '#888', textAlign: 'center', marginTop: '3rem' }}>
          No tienes órdenes registradas.
        </p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Mis Órdenes</h2>
      <div style={styles.list}>
        {orders.map((order) => (
          <div key={order.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.orderId}>#{order.id.slice(0, 8)}...</span>
              <span style={{ ...styles.badge, color: statusColor[order.status], borderColor: statusColor[order.status] }}>
                {order.status}
              </span>
            </div>
            <p style={styles.date}>{new Date(order.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            {order.totalAmount > 0 && (
              <p style={styles.total}>Total pagado: 💲{Number(order.totalAmount).toFixed(2)}</p>
            )}
            <div style={styles.items}>
              {order.items.map((item) => (
                <span key={item.skillId} style={styles.item}>
                  {productMap[item.skillId] || item.skillId.slice(0, 8)} × {item.quantity}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  page: {
    maxWidth: '1100px',
    margin: '2rem auto',
    padding: '0 1.5rem',
  },
  title: {
    color: '#EEEEEE',
    fontSize: '22px',
    fontWeight: 500,
    marginBottom: '1.5rem',
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  card: {
    background: '#1a1a1a',
    border: '1px solid #2FA084',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.4rem',
  },
  orderId: {
    color: '#EEEEEE',
    fontWeight: 500,
    fontSize: '14px',
  },
  badge: {
    fontSize: '12px',
    border: '1px solid',
    borderRadius: '6px',
    padding: '2px 8px',
  },
  date: {
    color: '#888',
    fontSize: '13px',
    margin: '0 0 0.25rem',
  },
  total: {
    color: '#6FCF97',
    fontSize: '14px',
    fontWeight: 500,
    margin: '0 0 0.75rem',
  },
  items: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  item: {
    background: '#222',
    border: '1px solid #333',
    borderRadius: '6px',
    padding: '3px 10px',
    fontSize: '12px',
    color: '#6FCF97',
  },
  center: {
    textAlign: 'center',
    marginTop: '4rem',
    color: '#EEEEEE',
  },
}

export default MyOrdersPage
