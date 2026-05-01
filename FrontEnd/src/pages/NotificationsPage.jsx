import { useState, useEffect } from 'react'
import '../styles/forms.css'

function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  //const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const userId = payload?.user_id

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/user/${userId}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      setNotifications(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' })
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ))
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      setNotifications(notifications.filter(n => n.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2 style={{ color: '#EEEEEE', marginBottom: '1.5rem' }}>Notificaciones</h2>

      {error && <div className="form-error">{error}</div>}

      {loading && <p style={{ color: '#6FCF97' }}>Cargando...</p>}

      {!loading && notifications.length === 0 && (
        <p style={{ color: '#888' }}>No tienes notificaciones.</p>
      )}

      {notifications.map(n => (
        <div key={n.id} style={{
          background: n.read ? '#1a1a1a' : '#1e2e28',
          border: `1px solid ${n.read ? '#333' : '#2FA084'}`,
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <p style={{ color: '#EEEEEE', margin: '0 0 0.5rem' }}>{n.message}</p>
          <p style={{ color: '#888', fontSize: '12px', margin: '0 0 0.75rem' }}>
            {new Date(n.createdAt).toLocaleString('es-ES')}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!n.read && (
              <button className="btn" style={{ width: 'auto', padding: '6px 14px', fontSize: '13px' }}
                onClick={() => markAsRead(n.id)}>
                Marcar como leída
              </button>
            )}
            <button className="btn" style={{ width: 'auto', padding: '6px 14px', fontSize: '13px', borderColor: '#c00', color: '#ff6b6b' }}
              onClick={() => deleteNotification(n.id)}>
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationsPage