import { useState } from 'react'
import '../styles/forms.css'

const TABS = ['Nombre', 'Correo', 'Contraseña']

function ConfigPage() {
  const userId = localStorage.getItem('userId')
  const [activeTab, setActiveTab] = useState('Nombre')

  const [name, setName] = useState(localStorage.getItem('userName') || '')
  const [email, setEmail] = useState(localStorage.getItem('userEmail') || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const resetMessages = () => { setError(''); setSuccess('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    resetMessages()

    if (activeTab === 'Contraseña') {
      if (!password) return setError('Ingresa una nueva contraseña')
      if (password !== confirmPassword) return setError('Las contraseñas no coinciden')
    }

    setLoading(true)

    try {
      const body = {
        name: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail'),
      }

      if (activeTab === 'Nombre') body.name = name
      if (activeTab === 'Correo') body.email = email
      if (activeTab === 'Contraseña') body.password = password

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      localStorage.setItem('userName', data.data.name)
      localStorage.setItem('userEmail', data.data.email)

      setPassword('')
      setConfirmPassword('')
      setSuccess('Actualizado correctamente')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-wrapper">
      <div className="form-card">
        <h2 className="form-title">Ajustes</h2>
        <p className="form-subtitle">¿Qué deseas cambiar?</p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); resetMessages() }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: activeTab === tab ? '#6FCF97' : '#2FA084',
                background: activeTab === tab ? '#1F6F5F' : 'transparent',
                color: activeTab === tab ? '#EEEEEE' : '#6FCF97',
                fontSize: '13px',
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {activeTab === 'Nombre' && (
            <div className="form-group">
              <label>Nuevo nombre</label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {activeTab === 'Correo' && (
            <div className="form-group">
              <label>Nuevo correo electrónico</label>
              <input
                type="email"
                placeholder="juan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          {activeTab === 'Contraseña' && (
            <>
              <div className="form-group">
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirmar contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ConfigPage
