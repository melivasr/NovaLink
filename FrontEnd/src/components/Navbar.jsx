import { Link } from 'react-router-dom'

function Navbar() {
  const isAdmin = localStorage.getItem('isAdmin') === 'true'

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>NovaLink</span>
      <div style={styles.links}>
        <Link to="/home">Inicio</Link>
        <Link to="/catalog">Catálogo</Link>
        <Link to="/orders">Carrito</Link>
        <Link to="/my-orders">Órdenes</Link>
        <Link to="/my-skills">Habilidades</Link>
        <Link to="/notifications">Notificaciones</Link>
        <Link to="/config">Ajustes</Link>
        {isAdmin && <Link to="/admin" style={{ color: '#F2C94C' }}>Admin</Link>}
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
}

export default Navbar
