import { useEffect, useState } from 'react'
import { getUserSkills } from '../services/usersService'
import { getSkills } from '../services/productsService'

const difficultyColor = {
  Facil:  '#6FCF97',
  Medio:  '#F2C94C',
  Dificil: '#EB5757',
}

function MySkillsPage() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  //const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const userId = payload?.user_id

  useEffect(() => {
    if (!userId) {
      setError('No hay sesión activa')
      setLoading(false)
      return
    }

    Promise.all([getUserSkills(userId), getSkills()])
      .then(([userSkillsRes, allProducts]) => {
        const productMap = {}
        allProducts.forEach((p) => { productMap[p.id] = p })

        const enriched = userSkillsRes.data.map((s) => ({
          ...productMap[s.product_id],
          xp_accumulated: s.xp_accumulated,
          acquired_at: s.acquired_at,
        })).filter((s) => s.id)

        setSkills(enriched)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={styles.center}>Cargando habilidades...</p>
  if (error)   return <p style={{ ...styles.center, color: '#ff6b6b' }}>{error}</p>

  if (skills.length === 0) {
    return (
      <div style={styles.page}>
        <h2 style={styles.title}>Mis Habilidades</h2>
        <p style={{ color: '#888', textAlign: 'center', marginTop: '3rem' }}>
          Aún no tienes habilidades adquiridas.
        </p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Mis Habilidades</h2>
      <div style={styles.grid}>
        {skills.map((skill) => (
          <div key={skill.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.name}>{skill.name}</span>
              <span style={{ ...styles.badge, color: difficultyColor[skill.difficulty], borderColor: difficultyColor[skill.difficulty] }}>
                {skill.difficulty}
              </span>
            </div>
            <div style={styles.info}>
              <span>⭐ {skill.xp_accumulated} XP acumulados</span>
              <span style={{ color: '#888', fontSize: '12px' }}>
                Desde {new Date(skill.acquired_at).toLocaleDateString('es-ES')}
              </span>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  card: {
    background: '#1a1a1a',
    border: '1px solid #2FA084',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: '#EEEEEE',
    fontWeight: 500,
    fontSize: '15px',
  },
  badge: {
    fontSize: '12px',
    border: '1px solid',
    borderRadius: '6px',
    padding: '2px 8px',
  },
  info: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#6FCF97',
  },
  center: {
    textAlign: 'center',
    marginTop: '4rem',
    color: '#EEEEEE',
  },
}

export default MySkillsPage
