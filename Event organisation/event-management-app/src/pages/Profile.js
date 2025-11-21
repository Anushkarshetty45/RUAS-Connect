import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabaseClient'
import './Profile.css'

function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [pastEvents, setPastEvents] = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    registration_number: '',
    department: '',
    year_of_study: 1
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        registration_number: profile.registration_number || '',
        department: profile.department || '',
        year_of_study: profile.year_of_study || 1
      })
    }
  }, [profile])

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      // Fetch upcoming events
      const { data: upcomingData } = await supabase
        .from('registrations')
        .select(`
          *,
          events (
            id,
            title,
            event_date,
            location,
            event_type,
            poster_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'registered')
        .gte('events.event_date', new Date().toISOString())
        .order('events.event_date', { ascending: true })

      setUpcomingEvents(upcomingData || [])

      // Fetch past events
      const { data: pastData } = await supabase
        .from('registrations')
        .select(`
          *,
          events (
            id,
            title,
            event_date,
            location,
            event_type
          )
        `)
        .eq('user_id', user.id)
        .lt('events.event_date', new Date().toISOString())
        .order('events.event_date', { ascending: false })

      setPastEvents(pastData || [])

      // Fetch certificates
      const { data: certData } = await supabase
        .from('certificates')
        .select(`
          *,
          events (
            title,
            event_type
          )
        `)
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false })

      setCertificates(certData || [])
    } catch (error) {
      console.error('Error fetching user data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()

    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id)

      if (error) throw error

      await refreshProfile()
      setEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      alert('Error updating profile: ' + error.message)
    }
  }

  if (loading) {
    return <div className="loading">Loading profile...</div>
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="profile-info">
          <h1>{profile?.full_name || 'User'}</h1>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <div className="section-header">
            <h2>Personal Information</h2>
            <button onClick={() => setEditing(!editing)} className="btn-secondary">
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  value={formData.registration_number}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Year of Study</label>
                <select
                  value={formData.year_of_study}
                  onChange={(e) => setFormData({ ...formData, year_of_study: parseInt(e.target.value) })}
                  required
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-item">
                <strong>Registration Number:</strong>
                <span>{profile?.registration_number || 'Not set'}</span>
              </div>
              <div className="detail-item">
                <strong>Department:</strong>
                <span>{profile?.department || 'Not set'}</span>
              </div>
              <div className="detail-item">
                <strong>Year of Study:</strong>
                <span>{profile?.year_of_study ? `${profile.year_of_study}${['st', 'nd', 'rd', 'th'][Math.min(profile.year_of_study - 1, 3)]} Year` : 'Not set'}</span>
              </div>
              <div className="detail-item certificate-link-item">
                <strong>🏆 My Certificates:</strong>
                <Link to="/certificates" className="view-certificates-link">
                  View All Certificates →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-number">{profile?.upcoming_events || 0}</div>
            <div className="stat-label">Upcoming Events</div>
          </div>
          <Link to="/certificates" className="stat-card stat-card-clickable">
            <div className="stat-number">{profile?.certificates_received || 0}</div>
            <div className="stat-label">Certificates Earned</div>
            <div className="stat-action">View Certificates →</div>
          </Link>
          <div className="stat-card">
            <div className="stat-number">{upcomingEvents.length + pastEvents.length}</div>
            <div className="stat-label">Total Registrations</div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <p className="empty-state">No upcoming events registered</p>
          ) : (
            <div className="events-list">
              {upcomingEvents.map(reg => (
                <div key={reg.id} className="event-list-item">
                  <div className="event-list-date">
                    {new Date(reg.events.event_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="event-list-content">
                    <h3>{reg.events.title}</h3>
                    <p>{reg.events.location}</p>
                    <span className="event-type-badge">{reg.events.event_type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2>Certificates</h2>
            <Link to="/certificates" className="btn-secondary">
              View All Certificates
            </Link>
          </div>
          {certificates.length === 0 ? (
            <p className="empty-state">No certificates earned yet</p>
          ) : (
            <div className="certificates-grid">
              {certificates.slice(0, 3).map(cert => (
                <div key={cert.id} className="certificate-card">
                  <div className="certificate-icon">🏆</div>
                  <h3>{cert.events.title}</h3>
                  <p>{cert.events.event_type}</p>
                  <p className="certificate-date">
                    Issued on {new Date(cert.issued_at).toLocaleDateString()}
                  </p>
                  {cert.certificate_url && (
                    <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                      View Certificate
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile

