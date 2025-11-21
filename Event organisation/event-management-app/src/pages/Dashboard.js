import { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseClient'
import EventCard from '../components/EventCard'
import './Dashboard.css'

function Dashboard() {
  const [events, setEvents] = useState([])
  const [clubs, setClubs] = useState([
    // Fallback data - will be replaced when database connects
    { id: '1', name: 'Cynergy Club', category: 'Technical', description: 'Innovation and entrepreneurship society' },
    { id: '2', name: 'MATH Club', category: 'Academic', description: 'Mathematics and problem-solving club' },
    { id: '3', name: 'Startup Society', category: 'Technical', description: 'Business and startup enthusiasts' },
    { id: '4', name: 'Coders Club', category: 'Technical', description: 'Programming and development club' },
    { id: '5', name: 'Electronics Club', category: 'Technical', description: 'Electronics and hardware projects' },
    { id: '6', name: 'Cultural Committee', category: 'Cultural', description: 'Cultural events and activities' },
    { id: '7', name: 'Pravaah Club', category: 'Cultural', description: 'Literary and creative arts' },
    { id: '8', name: 'Euphony Club', category: 'Cultural', description: 'Music and performing arts' },
    { id: '9', name: 'Rotaract Club', category: 'Social', description: 'Community service and social work' },
    { id: '10', name: 'SPORTS Club', category: 'Sports', description: 'Sports and athletics' },
    { id: '11', name: 'Calisthenics Club', category: 'Sports', description: 'Bodyweight fitness and training' },
    { id: '12', name: 'NSS', category: 'Social', description: 'National Service Scheme' },
    { id: '13', name: 'NCC', category: 'Social', description: 'National Cadet Corps' }
  ])
  const [selectedClub, setSelectedClub] = useState(null)
  const [clubEvents, setClubEvents] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
    fetchClubs()
  }, [])

  const handleClubClick = async (club) => {
    setSelectedClub(club)
    
    // Fetch events for this specific club
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('club_id', club.id)
        .eq('is_active', true)
        .order('event_date', { ascending: true })

      if (error) throw error
      setClubEvents(data || [])
    } catch (error) {
      console.error('Error fetching club events:', error.message)
      setClubEvents([])
    }
  }

  const handleBackToAllEvents = () => {
    setSelectedClub(null)
    setClubEvents([])
  }

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          clubs (
            name,
            logo_url
          )
        `)
        .eq('is_active', true)
        .order('event_date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('name')

      if (error) throw error
      if (data && data.length > 0) {
        setClubs(data) // Use database data if available
      }
      // Otherwise keep fallback data
    } catch (error) {
      console.error('Error fetching clubs:', error.message)
      // Keep fallback data on error
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.event_type === filter
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
                          event.description?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="dashboard">
      <div className="dashboard-layout">
        {/* Left Sidebar - 30% - Clubs */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2>Clubs & Organizations</h2>
            <p>{clubs.length} Active Clubs</p>
          </div>

          <div className="clubs-list">
            {clubs.map(club => (
              <div 
                key={club.id} 
                className={`club-list-item ${selectedClub?.id === club.id ? 'active' : ''}`}
                onClick={() => handleClubClick(club)}
              >
                <div className="club-item-logo">
                  {club.logo_url ? (
                    <img src={club.logo_url} alt={club.name} />
                  ) : (
                    <div className="club-item-logo-placeholder">
                      {club.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="club-item-info">
                  <h3>{club.name}</h3>
                  <span className="club-item-category">{club.category}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Content - 70% - Events or Club Details */}
        <main className="dashboard-content">
          {selectedClub ? (
            // Show selected club details
            <>
              <div className="club-details-header">
                <button onClick={handleBackToAllEvents} className="back-button">
                  ← Back to All Events
                </button>
                <div className="club-details-title">
                  <div className="club-details-logo">
                    {selectedClub.logo_url ? (
                      <img src={selectedClub.logo_url} alt={selectedClub.name} />
                    ) : (
                      <div className="club-details-logo-placeholder">
                        {selectedClub.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h1>{selectedClub.name}</h1>
                    <span className="club-details-category">{selectedClub.category}</span>
                  </div>
                </div>
                {selectedClub.description && (
                  <p className="club-details-description">{selectedClub.description}</p>
                )}
              </div>

              <div className="club-events-section">
                <h2>Events by {selectedClub.name}</h2>
                {clubEvents.length === 0 ? (
                  <div className="no-events">
                    <h3>No events yet</h3>
                    <p>This club hasn't posted any events</p>
                  </div>
                ) : (
                  <div className="events-grid">
                    {clubEvents.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            // Show all events
            <>
              <div className="content-header">
                <h1>Latest Updates</h1>
                <p>Workshops • Seminars • Hackathons • Competitions</p>
              </div>

              <div className="dashboard-filters">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="filter-tabs">
                  <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                  >
                    All Events
                  </button>
                  <button
                    className={filter === 'workshop' ? 'active' : ''}
                    onClick={() => setFilter('workshop')}
                  >
                    Workshops
                  </button>
                  <button
                    className={filter === 'seminar' ? 'active' : ''}
                    onClick={() => setFilter('seminar')}
                  >
                    Seminars
                  </button>
                  <button
                    className={filter === 'hackathon' ? 'active' : ''}
                    onClick={() => setFilter('hackathon')}
                  >
                    Hackathons
                  </button>
                  <button
                    className={filter === 'competition' ? 'active' : ''}
                    onClick={() => setFilter('competition')}
                  >
                    Competitions
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="loading">Loading events...</div>
              ) : filteredEvents.length === 0 ? (
                <div className="no-events">
                  <h3>No events found</h3>
                  <p>Try changing your search or filter criteria</p>
                </div>
              ) : (
                <div className="events-grid">
                  {filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard

