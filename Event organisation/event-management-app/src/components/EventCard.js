import { Link } from 'react-router-dom'
import './EventCard.css'

function EventCard({ event }) {
  const eventDate = new Date(event.event_date)
  const isUpcoming = eventDate > new Date()

  return (
    <Link to={`/events/${event.id}`} className="event-card">
      {event.poster_url && (
        <div className="event-card-image">
          <img src={event.poster_url} alt={event.title} />
        </div>
      )}
      
      <div className="event-card-content">
        <div className="event-card-header">
          <span className="event-type-badge">{event.event_type}</span>
          {event.clubs && (
            <span className="event-club-name">{event.clubs.name}</span>
          )}
        </div>

        <h3 className="event-title">{event.title}</h3>
        
        <p className="event-description">
          {event.description?.substring(0, 100)}
          {event.description?.length > 100 ? '...' : ''}
        </p>

        <div className="event-card-footer">
          <div className="event-date">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{eventDate.toLocaleDateString()}</span>
          </div>

          <div className="event-location">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{event.location}</span>
          </div>
        </div>

        {event.max_participants && event.current_participants !== undefined && (
          <div className="event-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(event.current_participants / event.max_participants) * 100}%` }}
              />
            </div>
            <span className="progress-text">
              {event.current_participants} / {event.max_participants} registered
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default EventCard

