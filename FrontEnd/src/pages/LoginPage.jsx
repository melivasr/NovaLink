import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/forms.css'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Ingresa tu correo electrónico')
      return
    }

    // TODO: reemplazar con POST /api/v1/auth/login cuando esté listo
    localStorage.setItem('userEmail', email)
    navigate('/catalog')
  }

  return (
    <div className="form-wrapper">
      
      <div className="form-card">
        <h2 className="form-title">Iniciar sesión</h2>
        <p className="form-subtitle">Ingresa tu correo para continuar</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="juan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn" type="submit">
            Entrar
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px', color: '#888' }}>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage