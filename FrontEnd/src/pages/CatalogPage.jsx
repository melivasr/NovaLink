import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSkills } from '../services/productsService'
import { getUserSkills } from '../services/usersService'
import { useCart } from '../context/CartContext'

const difficultyColor = {
  Facil: '#6FCF97',
  Medio: '#F2C94C',
  Dificil: '#EB5757',
}

function SkillCard({ skill, onAdd, ownedXp }) {
  const disabled = skill.stock === 0

  return (
    <div style={{ ...styles.card, borderColor: ownedXp > 0 ? '#2FA084' : '#444' }}>
      <div style={styles.cardHeader}>
        <span style={styles.name}>{skill.name}</span>
        <span style={{ ...styles.badge, color: difficultyColor[skill.difficulty], borderColor: difficultyColor[skill.difficulty] }}>
          {skill.difficulty}
        </span>
      </div>
      <div style={styles.info}>
        <span>⭐ {skill.xp_points} XP/unidad</span>
        <span>💲{Number(skill.price).toFixed(2)}/unidad</span>
      </div>
      <div style={styles.info}>
        <span>📦 Stock: {skill.stock}</span>
      </div>
      {ownedXp > 0 && (
        <div style={styles.ownedBadge}>Tienes {ownedXp} XP en esta habilidad</div>
      )}
      <button
        style={{ ...styles.btn, opacity: disabled ? 0.4 : 1 }}
        disabled={disabled}
        onClick={() => onAdd(skill)}
      >
        {skill.stock === 0 ? 'Sin stock' : ownedXp > 0 ? 'Agregar más XP' : 'Agregar al carrito'}
      </button>
    </div>
  )
}

function CatalogPage() {
  const [skills, setSkills] = useState([])
  const [ownedIds, setOwnedIds] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const { cart, addToCart } = useCart()
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')

  useEffect(() => {
    const fetchData = [getSkills()]
    if (userId) fetchData.push(getUserSkills(userId))

    Promise.all(fetchData)
      .then(([allSkills, userSkillsRes]) => {
        setSkills(allSkills.filter((s) => s.is_activated))
        if (userSkillsRes) {
          const map = {}
          userSkillsRes.data.forEach((s) => { map[s.product_id] = s.xp_accumulated })
          setOwnedIds(map)
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function handleAdd(skill) {
    if (cart.find((i) => i.id === skill.id)) {
      setMsg(`"${skill.name}" ya está en el carrito`)
    } else {
      addToCart(skill)
      setMsg(`"${skill.name}" agregado al carrito`)
    }
    setTimeout(() => setMsg(''), 2500)
  }

  if (loading) return <p style={styles.center}>Cargando habilidades...</p>
  if (error) return <p style={{ ...styles.center, color: '#ff6b6b' }}>{error}</p>

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Catálogo de Habilidades</h2>

      {msg && <div style={styles.toast}>{msg}</div>}


      {cart.length > 0 && (
        <button style={styles.cartBtn} onClick={() => navigate('/orders')}>
          🛒 Ver carrito ({cart.length})
        </button>
      )}

      <div style={styles.grid}>
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} onAdd={handleAdd} ownedXp={ownedIds[skill.id] || 0} />
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
  btn: {
    padding: '8px',
    background: '#1F6F5F',
    border: 'none',
    borderRadius: '8px',
    color: '#EEEEEE',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  center: {
    textAlign: 'center',
    marginTop: '4rem',
    color: '#EEEEEE',
  },
  cartBtn: {
    marginBottom: '1rem',
    padding: '10px 20px',
    background: '#1F6F5F',
    border: 'none',
    borderRadius: '8px',
    color: '#EEEEEE',
    fontSize: '14px',
    cursor: 'pointer',
  },
  ownedBadge: {
    fontSize: '12px',
    color: '#6FCF97',
    background: '#0d2b1f',
    border: '1px solid #2FA084',
    borderRadius: '6px',
    padding: '3px 8px',
    textAlign: 'center',
  },
  toast: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    background: '#1a1a1a',
    border: '1px solid #2FA084',
    color: '#6FCF97',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '14px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    zIndex: 1000,
  },
}

export default CatalogPage
