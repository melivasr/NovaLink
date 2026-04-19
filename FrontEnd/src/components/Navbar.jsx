import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>NovaLink</span>
      <div style={styles.links}>
        <Link to="/catalog">Catálogo</Link>
        <Link to="/orders">Mi Carrito</Link>
        <Link to="/my-orders">Mis Órdenes</Link>
        <Link to="/my-skills">Mis Habilidades</Link>
        <Link to="/notifications">Notificaciones</Link>
        <Link to="/">Cerrar Sesión</Link>
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
  },
}

export default Navbar
