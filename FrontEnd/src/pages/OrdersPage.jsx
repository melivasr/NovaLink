import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { createOrder, checkoutOrder } from '../services/ordersService'

function OrdersPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const userId = localStorage.getItem('userId')

  async function handleCheckout() {
    if (cart.length === 0) return
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const order = await createOrder(userId, cart)
      await checkoutOrder(order.data.id)
      setSuccess('¡Orden completada! Habilidades adquiridas.')
      clearCart()
      setTimeout(() => navigate('/catalog'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0 && !success) {
    return (
      <div style={styles.page}>
        <h2 style={styles.title}>Mi Carrito</h2>
        <p style={{ color: '#888', textAlign: 'center', marginTop: '3rem' }}>
          No tienes habilidades en el carrito.{' '}
          <span style={{ color: '#2FA084', cursor: 'pointer' }} onClick={() => navigate('/catalog')}>
            Ir al catálogo
          </span>
        </p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Mi Carrito</h2>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.list}>
        {cart.map((item) => (
          <div key={item.id} style={styles.item}>
            <div style={{ flex: 1 }}>
              <span style={styles.name}>{item.name}</span>
              <div style={styles.itemMeta}>
                <span>💲{Number(item.price).toFixed(2)}/unidad · ⭐ {item.xp_points} XP/unidad</span>
              </div>
              <div style={styles.itemTotal}>
                Subtotal: 💲{(item.price * item.quantity).toFixed(2)} · ⭐ {item.xp_points * item.quantity} XP
              </div>
            </div>
            <div style={styles.itemActions}>
              <div style={styles.qtyControl}>
                <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                <span style={styles.qtyValue}>{item.quantity}</span>
                <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <button style={styles.removeBtn} onClick={() => removeFromCart(item.id)}>Quitar</button>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <div>
          <div style={{ color: '#6FCF97', fontSize: '13px' }}>{cart.length} habilidad(es) seleccionada(s)</div>
          <div style={{ color: '#EEEEEE', fontSize: '16px', fontWeight: 500, marginTop: '4px' }}>
            Total: 💲{cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}
          </div>
        </div>
        <button style={styles.btn} onClick={handleCheckout} disabled={loading}>
          {loading ? 'Procesando...' : 'Confirmar orden'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: {
    maxWidth: '700px',
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
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  item: {
    background: '#1a1a1a',
    border: '1px solid #2FA084',
    borderRadius: '10px',
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: '#EEEEEE',
    fontWeight: 500,
  },
  sub: {
    color: '#6FCF97',
    fontSize: '13px',
  },
  itemMeta: {
    color: '#888',
    fontSize: '12px',
    marginTop: '4px',
  },
  itemTotal: {
    color: '#6FCF97',
    fontSize: '13px',
    marginTop: '4px',
    fontWeight: 500,
  },
  itemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  qtyControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  qtyBtn: {
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#EEEEEE',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
  },
  qtyValue: {
    color: '#EEEEEE',
    fontSize: '14px',
    minWidth: '20px',
    textAlign: 'center',
  },
  removeBtn: {
    background: 'transparent',
    border: '1px solid #EB5757',
    borderRadius: '6px',
    color: '#EB5757',
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  footer: {
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btn: {
    padding: '10px 24px',
    background: '#1F6F5F',
    border: 'none',
    borderRadius: '8px',
    color: '#EEEEEE',
    fontSize: '15px',
    cursor: 'pointer',
  },
  error: {
    background: '#1a1a1a',
    border: '1px solid #c00',
    borderRadius: '8px',
    color: '#ff6b6b',
    padding: '10px 14px',
    marginBottom: '1rem',
    fontSize: '13px',
  },
  success: {
    background: '#1a1a1a',
    border: '1px solid #2FA084',
    borderRadius: '8px',
    color: '#6FCF97',
    padding: '10px 14px',
    marginBottom: '1rem',
    fontSize: '13px',
  },
}

export default OrdersPage
