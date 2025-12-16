import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import { useExpenseStore } from '../store/expenseStore';
import {
  MdCameraAlt,
  MdSave,
  MdClose,
  MdLooksOne,
  MdLooksTwo,
  MdLooks3
} from 'react-icons/md';
import Tesseract from 'tesseract.js';

export default function ReceiptScanner() {
  const user = useAuthStore((state) => state.user);
  const addExpense = useExpenseStore((state) => state.addExpense);
  const expenses = useExpenseStore((state) => state.expenses);
  const fetchExpenses = useExpenseStore((state) => state.fetchExpenses);

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [rawText, setRawText] = useState('');

  // Load expenses when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchExpenses(user.id);
    }
  }, [user, fetchExpenses]);

  // Get receipt-scanned expenses (filtered by description containing "Receipt scan")
  const receiptExpenses = expenses
    .filter((expense) => expense.description?.includes('Receipt scan'))
    .slice(0, 10); // Show last 10 scanned receipts

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      setUploadedFile(file);
      scanReceipt(file);
    } else {
      alert('Please upload an image file (JPG, PNG, etc.)');
    }
  };

  const parseReceiptText = (text) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);

    // Extract merchant name (usually first non-empty line)
    const merchant = lines[0]?.trim() || 'Unknown Store';

    // Extract date using regex patterns
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/i,
    ];

    let date = new Date().toISOString().split('T')[0];
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const parsedDate = new Date(match[0]);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString().split('T')[0];
          break;
        }
      }
    }

    // Extract amounts (numbers with $ or decimal points)
    const amountPattern = /\$?\s*(\d+\.\d{2})/g;
    const amounts = [];
    let match;
    while ((match = amountPattern.exec(text)) !== null) {
      amounts.push(parseFloat(match[1]));
    }

    // Extract total (look for keywords like "total", "amount", "balance")
    const totalPattern = /(total|amount due|balance|grand total)[:\s]*\$?\s*(\d+\.\d{2})/i;
    const totalMatch = text.match(totalPattern);
    const total = totalMatch ? parseFloat(totalMatch[2]) : (amounts.length > 0 ? Math.max(...amounts) : 0);

    // Extract tax
    const taxPattern = /(tax|sales tax)[:\s]*\$?\s*(\d+\.\d{2})/i;
    const taxMatch = text.match(taxPattern);
    const tax = taxMatch ? parseFloat(taxMatch[2]) : 0;

    // Extract line items (simplified - looks for lines with prices)
    const items = [];
    const itemPattern = /^(.+?)\s+\$?\s*(\d+\.\d{2})\s*$/;

    for (const line of lines) {
      const itemMatch = line.match(itemPattern);
      if (itemMatch && items.length < 10) { // Limit to 10 items
        const itemName = itemMatch[1].trim();
        const price = itemMatch[2];

        // Filter out lines that are likely not items (subtotal, tax, etc.)
        if (!/(subtotal|tax|total|balance|change|cash|credit|debit)/i.test(itemName)) {
          items.push({ name: itemName, price });
        }
      }
    }

    // Determine category based on merchant name
    const categoryMap = {
      'walmart': 'Groceries',
      'target': 'Shopping',
      'costco': 'Groceries',
      'safeway': 'Groceries',
      'kroger': 'Groceries',
      'whole foods': 'Groceries',
      'trader joe': 'Groceries',
      'shell': 'Gas/Fuel',
      'chevron': 'Gas/Fuel',
      'exxon': 'Gas/Fuel',
      'bp': 'Gas/Fuel',
      '76': 'Gas/Fuel',
      'arco': 'Gas/Fuel',
      'mobil': 'Gas/Fuel',
      'texaco': 'Gas/Fuel',
      'starbucks': 'Food/Meals',
      'mcdonalds': 'Food/Meals',
      'subway': 'Food/Meals',
      'chipotle': 'Food/Meals',
      'panera': 'Food/Meals',
      'dunkin': 'Coffee/Drinks',
      'peets': 'Coffee/Drinks',
      'amazon': 'Shopping',
      'ebay': 'Shopping',
      'office depot': 'Office Supplies',
      'staples': 'Office Supplies',
      'best buy': 'Phone/Tablet Purchase',
      'apple store': 'Phone/Tablet Purchase',
      'autozone': 'Vehicle Maintenance',
      'jiffy lube': 'Oil Change',
      'pep boys': 'Vehicle Maintenance',
      'carwash': 'Car Wash',
      'parking': 'Parking',
      'cvs': 'Healthcare',
      'walgreens': 'Healthcare',
      'rite aid': 'Personal Care',
      'at&t': 'Phone Bill',
      'verizon': 'Phone Bill',
      't-mobile': 'Phone Bill',
      'comcast': 'Internet',
      'spectrum': 'Internet',
    };

    let category = 'Other Expense';
    const merchantLower = merchant.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
      if (merchantLower.includes(key)) {
        category = value;
        break;
      }
    }

    return {
      merchant,
      amount: total.toFixed(2),
      date,
      category,
      items: items.length > 0 ? items : [
        { name: 'Unable to extract items', price: '0.00' }
      ],
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const scanReceipt = async (file) => {
    setScanning(true);
    setOcrProgress(0);
    setRawText('');

    try {
      // Use Tesseract.js to perform OCR on the image
      const result = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          },
        }
      );

      const extractedText = result.data.text;
      setRawText(extractedText); // Store raw text for debugging

      // Parse the extracted text
      const parsedData = parseReceiptText(extractedText);

      setScannedData(parsedData);
      setScanning(false);
      setOcrProgress(100);
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to scan receipt. Please try again with a clearer image.');
      setScanning(false);
      setOcrProgress(0);
    }
  };

  const saveExpense = async () => {
    if (!scannedData) return;

    const expense = {
      user_id: user.id,
      amount: parseFloat(scannedData.total),
      category: scannedData.category,
      description: `${scannedData.merchant} - Receipt scan`,
      expense_date: scannedData.date,
      payment_method: 'Card',
    };

    const result = await addExpense(expense);

    if (result.success) {
      // Reset
      setUploadedFile(null);
      setScannedData(null);
      alert('Expense saved successfully!');
    } else {
      alert('Failed to save expense: ' + (result.error || 'Unknown error'));
    }
  };

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Receipt Scanner</h1>
            <p>Upload receipt images and automatically extract expense data</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Upload Section */}
          <div className="dashboard-section">
            <h2>Upload Receipt</h2>
            <div
              className={`receipt-upload-zone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {scanning ? (
                <div className="upload-scanning">
                  <div className="loading-spinner"></div>
                  <p>Scanning receipt...</p>
                  <span>Processing image with OCR ({ocrProgress}%)</span>
                  <div className="progress-bar" style={{ marginTop: '10px', width: '200px' }}>
                    <div
                      className="progress-fill"
                      style={{ width: `${ocrProgress}%`, backgroundColor: '#4CAF50' }}
                    />
                  </div>
                </div>
              ) : uploadedFile ? (
                <div className="upload-preview">
                  <img
                    src={URL.createObjectURL(uploadedFile)}
                    alt="Receipt preview"
                    className="receipt-preview-img"
                  />
                  <p>{uploadedFile.name}</p>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setUploadedFile(null);
                      setScannedData(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="upload-icon"><MdCameraAlt size={48} /></div>
                  <h3>Drop receipt image here</h3>
                  <p>or</p>
                  <label className="btn btn-primary">
                    Browse Files
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span className="upload-hint">Supports JPG, PNG, PDF</span>
                </>
              )}
            </div>

            {scannedData && (
              <div className="scan-actions">
                <button className="btn btn-primary" onClick={saveExpense}>
                  <MdSave size={20} /> Save as Expense
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setUploadedFile(null);
                    setScannedData(null);
                  }}
                >
                  <MdClose size={20} /> Cancel
                </button>
              </div>
            )}
          </div>

          {/* Scanned Data */}
          {scannedData && (
            <div className="dashboard-section">
              <h2>Extracted Data</h2>
              <div className="scanned-data-card">
                <div className="data-row">
                  <span className="data-label">Merchant:</span>
                  <span className="data-value">{scannedData.merchant}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Date:</span>
                  <span className="data-value">{scannedData.date}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Category:</span>
                  <span className="data-value">{scannedData.category}</span>
                </div>
                <div className="data-row highlight">
                  <span className="data-label">Total Amount:</span>
                  <span className="data-value amount">${scannedData.total}</span>
                </div>

                <div className="items-section">
                  <h4>Items</h4>
                  {scannedData.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <span>{item.name}</span>
                      <span>${item.price}</span>
                    </div>
                  ))}
                  {parseFloat(scannedData.tax) > 0 && (
                    <div className="item-row">
                      <span>Tax</span>
                      <span>${scannedData.tax}</span>
                    </div>
                  )}
                </div>

                {rawText && (
                  <details style={{ marginTop: '15px', fontSize: '12px', color: '#888' }}>
                    <summary style={{ cursor: 'pointer' }}>View Raw OCR Text</summary>
                    <pre style={{
                      whiteSpace: 'pre-wrap',
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: '#1a1a1a',
                      borderRadius: '4px',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      {rawText}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent Scans History */}
        {receiptExpenses.length > 0 && (
          <div className="dashboard-section full-width">
            <h2>Recent Scans</h2>
            <div className="scan-history-grid">
              {receiptExpenses.map((expense) => {
                // Extract merchant name from description
                const merchant = expense.description?.replace(' - Receipt scan', '') || 'Unknown';
                return (
                  <div key={expense.id} className="history-card">
                    <div className="history-header">
                      <h4>{merchant}</h4>
                      <span className="history-amount">${parseFloat(expense.amount).toFixed(2)}</span>
                    </div>
                    <p className="history-date">{new Date(expense.created_at || expense.expense_date).toLocaleString()}</p>
                    <span className="history-category">{expense.category}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="info-section">
          <h3>How Receipt Scanning Works</h3>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon"><MdLooksOne size={32} /></div>
              <h4>Upload Photo</h4>
              <p>Take a photo of your receipt or upload an existing image</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><MdLooksTwo size={32} /></div>
              <h4>AI Processing</h4>
              <p>Our AI extracts merchant, amount, date, and line items</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><MdLooks3 size={32} /></div>
              <h4>Review & Save</h4>
              <p>Verify the data and save directly to your expenses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
