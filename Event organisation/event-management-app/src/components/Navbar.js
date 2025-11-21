import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setShowProfileDropdown(false)
    navigate('/login')
  }

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown)
  }

  // Close dropdown when clicking outside
  const handleClickOutside = () => {
    if (showProfileDropdown) {
      setShowProfileDropdown(false)
    }
  }

  return (
    <nav className="navbar" onClick={handleClickOutside}>
      <div className="nav-container">
        <Link to="/dashboard" className="nav-logo">
          <h2>RUAS Connect</h2>
        </Link>

        <div className="nav-menu">
          {user && (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              
              <Link to="/certificates" className="nav-link">
                🏆 Certificates
              </Link>
              
              <Link to="/profile" className="nav-link nav-profile-link">
                👤 My Profile
              </Link>
              
              <div className="nav-user">
                <div 
                  className="user-profile-trigger" 
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleProfileDropdown()
                  }}
                >
                  <div className="user-avatar">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="user-name">{profile?.full_name || user.email}</span>
                  <span className={`dropdown-arrow ${showProfileDropdown ? 'open' : ''}`}>▼</span>
                </div>

                {showProfileDropdown && (
                  <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="dropdown-user-info">
                        <strong>{profile?.full_name || 'User'}</strong>
                        <span className="dropdown-email">{user.email}</span>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <div className="dropdown-credentials">
                      <div className="credential-item">
                        <span className="credential-label">Registration Number:</span>
                        <span className="credential-value">{profile?.registration_number || 'Not set'}</span>
                      </div>
                      <div className="credential-item">
                        <span className="credential-label">Department:</span>
                        <span className="credential-value">{profile?.department || 'Not set'}</span>
                      </div>
                      <div className="credential-item">
                        <span className="credential-label">Year of Study:</span>
                        <span className="credential-value">
                          {profile?.year_of_study ? `${profile.year_of_study}${['st', 'nd', 'rd', 'th'][Math.min(profile.year_of_study - 1, 3)]} Year` : 'Not set'}
                        </span>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <div className="dropdown-actions">
                      <Link to="/profile" className="dropdown-link" onClick={() => setShowProfileDropdown(false)}>
                        <span>⚙️</span> Edit Profile
                      </Link>
                      <Link to="/certificates" className="dropdown-link" onClick={() => setShowProfileDropdown(false)}>
                        <span>🏆</span> My Certificates
                      </Link>
                      <button onClick={handleSignOut} className="dropdown-signout">
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  </div>
                )}
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

