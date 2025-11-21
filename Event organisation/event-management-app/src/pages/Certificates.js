import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabaseClient'
import './Certificates.css'

function Certificates() {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, workshop, seminar, hackathon, competition
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user) {
      fetchCertificates()
    }
  }, [user])

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          events (
            id,
            title,
            event_type,
            event_date,
            location,
            clubs (
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false })

      if (error) throw error
      setCertificates(data || [])
    } catch (error) {
      console.error('Error fetching certificates:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (certificateUrl, eventTitle) => {
    if (!certificateUrl) {
      alert('Certificate not available for download')
      return
    }

    try {
      // Open certificate in new tab
      window.open(certificateUrl, '_blank')
    } catch (error) {
      alert('Error downloading certificate: ' + error.message)
    }
  }

  const filteredCertificates = certificates.filter(cert => {
    const matchesFilter = filter === 'all' || cert.events?.event_type === filter
    const matchesSearch = cert.events?.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return <div className="loading">Loading certificates...</div>
  }

  return (
    <div className="certificates-page">
      <div className="certificates-header">
        <div className="header-content">
          <h1>🏆 My Certificates</h1>
          <p>View and download all your earned certificates</p>
        </div>
        <div className="certificates-count">
          <span className="count-number">{certificates.length}</span>
          <span className="count-label">Total Certificates</span>
        </div>
      </div>

      <div className="certificates-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search certificates by event name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
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

      {filteredCertificates.length === 0 ? (
        <div className="no-certificates">
          <div className="no-certificates-icon">📜</div>
          <h3>No certificates found</h3>
          <p>
            {searchTerm || filter !== 'all'
              ? 'Try adjusting your filters or search term'
              : 'Participate in events to earn certificates!'}
          </p>
        </div>
      ) : (
        <div className="certificates-grid">
          {filteredCertificates.map(cert => (
            <div key={cert.id} className="certificate-item">
              <div className="certificate-visual">
                <div className="certificate-border">
                  <div className="certificate-seal">
                    <span className="seal-icon">🏆</span>
                  </div>
                  <div className="certificate-content">
                    <h3>Certificate of Participation</h3>
                    <div className="certificate-divider"></div>
                    <h2>{cert.events?.title}</h2>
                    <p className="certificate-type">{cert.events?.event_type?.toUpperCase()}</p>
                    {cert.events?.clubs && (
                      <p className="certificate-club">Organized by {cert.events.clubs.name}</p>
                    )}
                    <p className="certificate-date">
                      Issued on {new Date(cert.issued_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="certificate-actions">
                <button
                  className="btn-download"
                  onClick={() => handleDownload(cert.certificate_url, cert.events?.title)}
                  disabled={!cert.certificate_url}
                >
                  <span>📥</span>
                  {cert.certificate_url ? 'Download' : 'Not Available'}
                </button>
                <button
                  className="btn-view"
                  onClick={() => handleDownload(cert.certificate_url, cert.events?.title)}
                  disabled={!cert.certificate_url}
                >
                  <span>👁️</span>
                  View
                </button>
              </div>

              <div className="certificate-info">
                <div className="info-row">
                  <span className="info-label">Event Date:</span>
                  <span className="info-value">
                    {cert.events?.event_date
                      ? new Date(cert.events.event_date).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                {cert.events?.location && (
                  <div className="info-row">
                    <span className="info-label">Location:</span>
                    <span className="info-value">{cert.events.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Certificates

