import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabaseClient'
import { useAuth } from '../context/AuthContext'
import './EventDetails.css'

function EventDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [event, setEvent] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registrationCount, setRegistrationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    fetchEventDetails()
    if (user) {
      checkRegistration()
    }
  }, [id, user])

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          clubs (
            name,
            description,
            logo_url
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setEvent(data)
      
      // Get registration count
      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id)
      
      setRegistrationCount(count || 0)
    } catch (error) {
      console.error('Error fetching event:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const checkRegistration = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .single()

      setIsRegistered(!!data)
    } catch (error) {
      setIsRegistered(false)
    }
  }

  const handleRegister = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setRegistering(true)

    try {
      const { error } = await supabase
        .from('registrations')
        .insert({
          event_id: id,
          user_id: user.id,
          status: 'registered'
        })

      if (error) throw error

      setIsRegistered(true)
      setRegistrationCount(prev => prev + 1)
      alert('Successfully registered for the event!')
    } catch (error) {
      alert(error.message)
    } finally {
      setRegistering(false)
    }
  }

  const handleCancelRegistration = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) {
      return
    }

    setRegistering(true)

    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'cancelled' })
        .eq('event_id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setIsRegistered(false)
      setRegistrationCount(prev => Math.max(0, prev - 1))
      alert('Registration cancelled successfully')
    } catch (error) {
      alert(error.message)
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading event details...</div>
  }

  if (!event) {
    return <div className="error">Event not found</div>
  }

  const eventDate = new Date(event.event_date)
  const registrationDeadline = new Date(event.registration_deadline)
  const isRegistrationOpen = new Date() < registrationDeadline
  const spotsLeft = event.max_participants ? event.max_participants - registrationCount : null

  return (
    <div className="event-details">
      {event.poster_url && (
        <div className="event-poster">
          <img src={event.poster_url} alt={event.title} />
        </div>
      )}

      <div className="event-content">
        <div className="event-header">
          <div className="event-type-badge">{event.event_type}</div>
          <h1>{event.title}</h1>
          
          {event.clubs && (
            <div className="event-club">
              Organized by <strong>{event.clubs.name}</strong>
            </div>
          )}
        </div>

        <div className="event-details-grid">
          <div className="event-main">
            <div className="event-section">
              <h2>About This Event</h2>
              <p>{event.description}</p>
            </div>

            <div className="event-section">
              <h2>Event Details</h2>
              <div className="event-info-list">
                <div className="info-item">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong>Date & Time</strong>
                    <p>{eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="info-item">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong>Location</strong>
                    <p>{event.location}</p>
                  </div>
                </div>

                <div className="info-item">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <div>
                    <strong>Participants</strong>
                    <p>{registrationCount} registered {spotsLeft !== null && `(${spotsLeft} spots left)`}</p>
                  </div>
                </div>

                <div className="info-item">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong>Registration Deadline</strong>
                    <p>{registrationDeadline.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="event-sidebar">
            <div className="registration-card">
              {isRegistered ? (
                <>
                  <div className="registered-badge">✓ You're Registered!</div>
                  <button
                    onClick={handleCancelRegistration}
                    disabled={registering}
                    className="btn-secondary"
                  >
                    {registering ? 'Cancelling...' : 'Cancel Registration'}
                  </button>
                </>
              ) : isRegistrationOpen ? (
                <>
                  <button
                    onClick={handleRegister}
                    disabled={registering || (spotsLeft !== null && spotsLeft <= 0)}
                    className="btn-primary"
                  >
                    {registering ? 'Registering...' : 'Register Now'}
                  </button>
                  {spotsLeft !== null && spotsLeft <= 0 && (
                    <p className="error-text">Event is full</p>
                  )}
                </>
              ) : (
                <div className="error-text">Registration closed</div>
              )}
            </div>

            {event.clubs && (
              <div className="club-info-card">
                <h3>About the Club</h3>
                <p>{event.clubs.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails

