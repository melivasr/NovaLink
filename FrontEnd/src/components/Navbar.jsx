import { Link } from 'react-router-dom'

function Navbar() {
  const name  = localStorage.getItem('userName')
  const email = localStorage.getItem('userEmail')

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>NovaLink</span>
      <div style={styles.links}>
        <Link to="/catalog">Catálogo</Link>
        <Link to="/orders">Mi Carrito</Link>
        <Link to="/my-orders">Mis Órdenes</Link>
        <Link to="/my-skills">Mis Habilidades</Link>
        <Link to="/notifications">Notificaciones</Link>
        {name && (
          <div style={styles.user}>
            <span style={styles.userName}>{name}</span>
            <span style={styles.userEmail}>{email}</span>
          </div>
        )}
        <Link to="/" onClick={() => { localStorage.clear() }}>Cerrar Sesión</Link>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1a1a2e',
    color: 'white',
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  user: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    borderLeft: '1px solid #2FA084',
    paddingLeft: '1rem',
  },
  userName: {
    color: '#EEEEEE',
    fontSize: '13px',
    fontWeight: 500,
  },
  userEmail: {
    color: '#6FCF97',
    fontSize: '11px',
  },
}

export default Navbar
