import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSkills } from '../services/usersService'
import { getSkills } from '../services/productsService'

function HomePage() {
  const [skills, setSkills] = useState([])
  const [totalXp, setTotalXp] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const userId    = localStorage.getItem('userId')
  const userName  = localStorage.getItem('userName')
  const userEmail = localStorage.getItem('userEmail')

  useEffect(() => {
    if (!userId) { navigate('/'); return }

    Promise.all([getUserSkills(userId), getSkills()])
      .then(([userSkillsRes, allProducts]) => {
        const productMap = {}
        allProducts.forEach((p) => { productMap[p.id] = p })

        const enriched = userSkillsRes.data.map((s) => ({
          ...productMap[s.product_id],
          xp_accumulated: s.xp_accumulated,
        })).filter((s) => s.id)

        const total = enriched.reduce((sum, s) => sum + (s.xp_accumulated || 0), 0)
        setSkills(enriched)
        setTotalXp(total)
      })
      .catch(() => setError('Error cargando tus datos'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={styles.center}>Cargando...</p>
  if (error)   return <p style={{ ...styles.center, color: '#ff6b6b' }}>{error}</p>

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.welcome}>Bienvenido, {userName}</h2>
          <p style={styles.userEmail}>{userEmail}</p>
          <p style={styles.subtitle}>Aquí está tu progreso de habilidades sociales</p>
        </div>
        <button style={styles.ctaBtn} onClick={() => navigate('/catalog')}>
          Comprar habilidades
        </button>
      </div>

      <div style={styles.xpCard}>
        <span style={styles.xpLabel}>XP Total acumulado</span>
        <span style={styles.xpValue}>⭐ {totalXp} XP</span>
      </div>

      {skills.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={{ color: '#888', margin: 0 }}>Aún no tienes habilidades. ¡Empieza comprando una!</p>
          <button style={styles.ctaBtn} onClick={() => navigate('/catalog')}>
            Ver catálogo
          </button>
        </div>
      ) : (
        <>
          <h3 style={styles.sectionTitle}>Desglose por habilidad</h3>
          <div style={styles.grid}>
            {skills.map((skill) => (
              <div key={skill.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <span style={styles.skillName}>{skill.name}</span>
                  <span style={{ ...styles.badge, color: difficultyColor[skill.difficulty], borderColor: difficultyColor[skill.difficulty] }}>
                    {skill.difficulty}
                  </span>
                </div>
                <div style={styles.barWrapper}>
                  <div style={{ ...styles.bar, width: `${Math.min((skill.xp_accumulated / 50) * 100, 100)}%` }} />
                </div>
                <span style={styles.xpText}>⭐ {skill.xp_accumulated} XP</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const difficultyColor = {
  Facil:   '#6FCF97',
  Medio:   '#F2C94C',
  Dificil: '#EB5757',
}

const styles = {
  page: {
    maxWidth: '1100px',
    margin: '2rem auto',
    padding: '0 1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  welcome: {
    color: '#EEEEEE',
    fontSize: '24px',
    fontWeight: 600,
    margin: 0,
  },
  userEmail: {
    color: '#6FCF97',
    fontSize: '12px',
    margin: '2px 0 2px',
  },
  subtitle: {
    color: '#888',
    fontSize: '13px',
    margin: '2px 0 0',
  },
  ctaBtn: {
    padding: '10px 24px',
    background: '#1F6F5F',
    border: 'none',
    borderRadius: '8px',
    color: '#EEEEEE',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  xpCard: {
    background: '#1a1a1a',
    border: '1px solid #2FA084',
    borderRadius: '12px',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  xpLabel: {
    color: '#888',
    fontSize: '14px',
  },
  xpValue: {
    color: '#6FCF97',
    fontSize: '28px',
    fontWeight: 700,
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    padding: '3rem',
    background: '#1a1a1a',
    borderRadius: '12px',
    border: '1px solid #333',
  },
  sectionTitle: {
    color: '#EEEEEE',
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  card: {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '10px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillName: {
    color: '#EEEEEE',
    fontSize: '14px',
    fontWeight: 500,
  },
  badge: {
    fontSize: '11px',
    border: '1px solid',
    borderRadius: '4px',
    padding: '2px 6px',
  },
  barWrapper: {
    background: '#2a2a2a',
    borderRadius: '4px',
    height: '6px',
    overflow: 'hidden',
  },
  bar: {
    background: '#2FA084',
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.4s ease',
  },
  xpText: {
    color: '#6FCF97',
    fontSize: '13px',
  },
  center: {
    textAlign: 'center',
    marginTop: '4rem',
    color: '#EEEEEE',
  },
}

export default HomePage
