import { useState } from 'react';
import Navbar from '../components/Navbar';
import {
  MdDirectionsCar,
  MdRestaurant,
  MdWork,
  MdPalette,
  MdBarChart,
  MdCreditCard,
  MdSync,
  MdAccessTime,
  MdShowChart
} from 'react-icons/md';

export default function Integrations() {
  const integrations = [
    { name: 'Uber', icon: MdDirectionsCar, connected: true, category: 'Rideshare' },
    { name: 'DoorDash', icon: MdRestaurant, connected: true, category: 'Food Delivery' },
    { name: 'Upwork', icon: MdWork, connected: false, category: 'Freelance' },
    { name: 'Fiverr', icon: MdPalette, connected: false, category: 'Freelance' },
    { name: 'QuickBooks', icon: MdBarChart, connected: true, category: 'Accounting' },
    { name: 'Stripe', icon: MdCreditCard, connected: false, category: 'Payment' },
  ];

  const toggleIntegration = (name) => {
    alert(`${name} integration toggled!`);
  };

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Integrations</h1>
            <p>Connect your favorite platforms and automate data sync</p>
          </div>
        </div>

        <div className="integrations-grid">
          {integrations.map((integration) => {
            const IconComponent = integration.icon;
            return (
            <div key={integration.name} className="integration-card">
              <div className="integration-header">
                <span className="integration-icon"><IconComponent size={32} /></span>
                <div>
                  <h3>{integration.name}</h3>
                  <span className="integration-category">{integration.category}</span>
                </div>
              </div>
              <div className="integration-status">
                {integration.connected ? (
                  <>
                    <span className="status-badge connected">✓ Connected</span>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => toggleIntegration(integration.name)}
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => toggleIntegration(integration.name)}
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          );
          })}
        </div>

        <div className="info-section">
          <h3>Why Connect Integrations?</h3>
          <div className="info-grid">
            <div className="info-card">
              <h4><MdSync size={24} /> Auto-Sync</h4>
              <p>Automatically import earnings from connected platforms</p>
            </div>
            <div className="info-card">
              <h4><MdAccessTime size={24} /> Save Time</h4>
              <p>No more manual data entry</p>
            </div>
            <div className="info-card">
              <h4><MdShowChart size={24} /> Real-Time Data</h4>
              <p>Always up-to-date financial information</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
