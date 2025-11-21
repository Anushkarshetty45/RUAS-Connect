import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-logo">
          <h2>RUAS Connect</h2>
        </Link>

        <div className="nav-menu">
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          
          {user && (
            <>
              <Link to="/certificates" className="nav-link">
                🏆 Certificates
              </Link>
              
              <Link to="/profile" className="nav-link nav-profile-link">
                👤 My Profile
              </Link>
              
              <div className="nav-user">
                <span className="user-name">{profile?.full_name || user.email}</span>
                <button onClick={handleSignOut} className="btn-signout">
                  Sign Out
                </button>
              </div>
            </>
          )}

          {!user && (
            <Link to="/login" className="btn-primary">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

