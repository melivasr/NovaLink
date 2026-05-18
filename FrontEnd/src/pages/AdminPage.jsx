import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminPage() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()

  //const isAdmin = localStorage.getItem('isAdmin') === 'true'

  // Debe estar así para que dependa del tokeen
  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const isAdmin = payload?.is_admin === true

  useEffect(() => {
    if (!isAdmin) {
      navigate('/catalog')
      return
    }
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => setSkills(data))
      .catch(() => setError('Error cargando habilidades'))
      .finally(() => setLoading(false))
  }, [])

  const toggleActivated = async (skill) => {
    const newState = !skill.is_activated
    try {
      const res = await fetch(`/api/products/${skill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_activated: newState }),
      })
      if (!res.ok) throw new Error()
  
      setSkills((prev) =>
        prev.map((s) => s.id === skill.id ? { ...s, is_activated: newState } : s)
      )
  
      const usersRes = await fetch('/api/users')
      const usersData = await usersRes.json()
      const allUsers = usersData.data || []
      console.log('Usuarios encontrados:', allUsers.length, allUsers)
  
      await Promise.all(
        allUsers.map(async (user) => {
          const body = {
            userId: user.id,
            message: `La habilidad "${skill.name}" ha sido ${newState ? 'activada' : 'desactivada'}.`,
          }
          console.log('Enviando notificación a:', user.id, body)
          const notifRes = await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          const notifData = await notifRes.json()
          console.log('Respuesta notificación:', notifRes.status, notifData)
        })
      )
  
      setMsg(`"${skill.name}" ${newState ? 'activada' : 'desactivada'}`)
      setTimeout(() => setMsg(''), 2500)
    } catch (e) {
      console.error('Error:', e)
      setError('Error actualizando habilidad')
    }
  }

  if (loading) return <p style={styles.center}>Cargando...</p>
  if (error)   return <p style={{ ...styles.center, color: '#ff6b6b' }}>{error}</p>

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Panel de Administración</h2>
      <p style={styles.subtitle}>Activa o desactiva habilidades del catálogo</p>

      {msg && <div style={styles.toast}>{msg}</div>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Habilidad</th>
            <th style={styles.th}>Dificultad</th>
            <th style={styles.th}>XP/unidad</th>
            <th style={styles.th}>Precio</th>
            <th style={styles.th}>Stock</th>
            <th style={styles.th}>Estado</th>
            <th style={styles.th}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => (
            <tr key={skill.id} style={{ opacity: skill.is_activated ? 1 : 0.5 }}>
              <td style={styles.td}>{skill.name}</td>
              <td style={styles.td}>{skill.difficulty}</td>
              <td style={styles.td}>⭐ {skill.xp_points}</td>
              <td style={styles.td}>💲{Number(skill.price).toFixed(2)}</td>
              <td style={styles.td}>{skill.stock}</td>
              <td style={styles.td}>
                <span style={{ color: skill.is_activated ? '#6FCF97' : '#EB5757' }}>
                  {skill.is_activated ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td style={styles.td}>
                <button
                  style={{ ...styles.btn, borderColor: skill.is_activated ? '#EB5757' : '#6FCF97', color: skill.is_activated ? '#EB5757' : '#6FCF97' }}
                  onClick={() => toggleActivated(skill)}
                >
                  {skill.is_activated ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const styles = {
  page: {
    maxWidth: '900px',
    margin: '2rem auto',
    padding: '0 1.5rem',
  },
  title: {
    color: '#EEEEEE',
    fontSize: '22px',
    fontWeight: 500,
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: '#888',
    fontSize: '13px',
    marginBottom: '1.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    color: '#6FCF97',
    fontSize: '12px',
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '1px solid #2FA084',
    fontWeight: 500,
  },
  td: {
    color: '#EEEEEE',
    fontSize: '13px',
    padding: '10px 12px',
    borderBottom: '1px solid #222',
  },
  btn: {
    background: 'transparent',
    border: '1px solid',
    borderRadius: '6px',
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  toast: {
    background: '#1a1a1a',
    border: '1px solid #2FA084',
    color: '#6FCF97',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '1rem',
    fontSize: '13px',
  },
  center: {
    textAlign: 'center',
    marginTop: '4rem',
    color: '#EEEEEE',
  },
}

export default AdminPage
