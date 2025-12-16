import { useState } from 'react';
import Navbar from '../components/Navbar';
import {
  MdVisibility,
  MdVisibilityOff,
  MdContentCopy,
  MdRefresh
} from 'react-icons/md';

export default function APIAccess() {
  const [apiKey, setApiKey] = useState('gig_sk_live_xxxxxxxxxxxxx');
  const [showKey, setShowKey] = useState(false);

  const generateNewKey = () => {
    const newKey = 'gig_sk_live_' + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
    alert('New API key generated!');
  };

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>API Access</h1>
            <p>Integrate your financial data with external applications</p>
          </div>
        </div>

        <div className="api-section">
          <div className="api-key-card">
            <h2>Your API Key</h2>
            <div className="api-key-display">
              <code>{showKey ? apiKey : '••••••••••••••••••••'}</code>
              <button className="btn btn-sm" onClick={() => setShowKey(!showKey)}>
                {showKey ? <><MdVisibilityOff size={16} /> Hide</> : <><MdVisibility size={16} /> Show</>}
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => navigator.clipboard.writeText(apiKey)}>
                <MdContentCopy size={16} /> Copy
              </button>
            </div>
            <button className="btn btn-primary" onClick={generateNewKey}>
              <MdRefresh size={20} /> Generate New Key
            </button>
          </div>

          <div className="api-docs-card">
            <h2>API Documentation</h2>
            <div className="endpoint-list">
              <div className="endpoint-item">
                <div className="endpoint-method get">GET</div>
                <div className="endpoint-path">/api/v1/transactions</div>
                <p>Retrieve all income transactions</p>
              </div>
              <div className="endpoint-item">
                <div className="endpoint-method post">POST</div>
                <div className="endpoint-path">/api/v1/transactions</div>
                <p>Create a new transaction</p>
              </div>
              <div className="endpoint-item">
                <div className="endpoint-method get">GET</div>
                <div className="endpoint-path">/api/v1/expenses</div>
                <p>Retrieve all expenses</p>
              </div>
              <div className="endpoint-item">
                <div className="endpoint-method get">GET</div>
                <div className="endpoint-path">/api/v1/analytics</div>
                <p>Get analytics data and reports</p>
              </div>
            </div>
          </div>

          <div className="code-example-card">
            <h2>Example Request</h2>
            <pre className="code-block">{`curl -X GET https://api.gigeconomy.com/v1/transactions \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"

{
  "transactions": [
    {
      "id": "txn_123",
      "amount": 150.00,
      "platform": "Uber",
      "date": "2024-12-15"
    }
  ]
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
