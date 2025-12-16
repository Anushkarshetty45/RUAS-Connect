import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useTransactionStore } from '../store/transactionStore';
import { useExpenseStore } from '../store/expenseStore';
import { useSavingsStore } from '../store/savingsStore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  MdDescription,
  MdPictureAsPdf,
  MdFileDownload,
  MdCheckCircle,
  MdBarChart,
  MdLock,
  MdGpsFixed
} from 'react-icons/md';

export default function ExportTools() {
  const { transactions } = useTransactionStore();
  const { expenses } = useExpenseStore();
  const { goals } = useSavingsStore();

  const [dateRange, setDateRange] = useState('all');
  const [exportType, setExportType] = useState('csv');
  const [dataType, setDataType] = useState('all');
  const [exportHistory, setExportHistory] = useState([]);

  const exportToCSV = (data, filename, type) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    let csvContent = '';

    // Add header with report info
    csvContent += `"Financial Report - ${filename}"\n`;
    csvContent += `"Generated Date: ${new Date().toLocaleString()}"\n`;
    csvContent += `"Total Records: ${data.length}"\n`;
    csvContent += '\n';

    if (type === 'income' || type === 'all') {
      // Group income by platform
      const incomeData = type === 'all'
        ? data.filter(d => d.type === 'Income')
        : data;

      if (incomeData.length > 0) {
        csvContent += '"=== INCOME SUMMARY ==="\n';

        // Group by platform
        const byPlatform = {};
        incomeData.forEach(item => {
          const platform = item.platform || item.description || 'Other';
          if (!byPlatform[platform]) byPlatform[platform] = [];
          byPlatform[platform].push(item);
        });

        Object.keys(byPlatform).sort().forEach(platform => {
          const items = byPlatform[platform];
          const total = items.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

          csvContent += `\n"Platform: ${platform}"\n`;
          csvContent += '"Date","Amount","Notes"\n';
          items.forEach(item => {
            csvContent += `"${item.date}","$${parseFloat(item.amount).toFixed(2)}","${item.notes || ''}"\n`;
          });
          csvContent += `"Subtotal:","$${total.toFixed(2)}"\n`;
        });

        const totalIncome = incomeData.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
        csvContent += `\n"TOTAL INCOME:","$${totalIncome.toFixed(2)}"\n\n`;
      }
    }

    if (type === 'expenses' || type === 'all') {
      // Group expenses by category
      const expenseData = type === 'all'
        ? data.filter(d => d.type === 'Expense')
        : data;

      if (expenseData.length > 0) {
        csvContent += '"=== EXPENSES SUMMARY ==="\n';

        // Group by category
        const byCategory = {};
        expenseData.forEach(item => {
          const category = item.category || item.description || 'Other';
          if (!byCategory[category]) byCategory[category] = [];
          byCategory[category].push(item);
        });

        Object.keys(byCategory).sort().forEach(category => {
          const items = byCategory[category];
          const total = items.reduce((sum, i) => sum + Math.abs(parseFloat(i.amount || 0)), 0);

          csvContent += `\n"Category: ${category}"\n`;
          csvContent += '"Date","Amount","Description","Payment Method"\n';
          items.forEach(item => {
            csvContent += `"${item.date}","$${Math.abs(parseFloat(item.amount)).toFixed(2)}","${item.description || ''}","${item.payment_method || ''}"\n`;
          });
          csvContent += `"Subtotal:","$${total.toFixed(2)}"\n`;
        });

        const totalExpenses = expenseData.reduce((sum, i) => sum + Math.abs(parseFloat(i.amount || 0)), 0);
        csvContent += `\n"TOTAL EXPENSES:","$${totalExpenses.toFixed(2)}"\n\n`;
      }
    }

    if (type === 'goals') {
      csvContent += '"=== SAVINGS GOALS ==="\n';
      csvContent += '"Goal Name","Target Amount","Current Amount","Progress","Status"\n';
      data.forEach(item => {
        csvContent += `"${item.name}","$${parseFloat(item.target_amount).toFixed(2)}","$${parseFloat(item.current_amount).toFixed(2)}","${item.progress}","${item.status}"\n`;
      });
    }

    if (type === 'all') {
      const totalIncome = data.filter(d => d.type === 'Income').reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
      const totalExpenses = data.filter(d => d.type === 'Expense').reduce((sum, i) => sum + Math.abs(parseFloat(i.amount || 0)), 0);
      csvContent += `"NET INCOME:","$${(totalIncome - totalExpenses).toFixed(2)}"\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const downloadFilename = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.download = downloadFilename;
    link.click();

    // Add to export history
    addToHistory(downloadFilename, 'CSV', csvContent);
  };

  const exportToPDF = (data, filename, type) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Add title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Financial Report', pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;

    // Summary box
    doc.setFillColor(139, 92, 246);
    doc.rect(14, yPos, pageWidth - 28, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('SUMMARY', 18, yPos + 5.5);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');

    yPos += 12;

    if (type === 'income' || type === 'all') {
      const incomeData = type === 'all' ? data.filter(d => d.type === 'Income') : data;

      if (incomeData.length > 0) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('INCOME', 14, yPos);
        yPos += 8;

        // Group by platform
        const byPlatform = {};
        incomeData.forEach(item => {
          const platform = item.platform || item.description || 'Other';
          if (!byPlatform[platform]) byPlatform[platform] = { items: [], total: 0 };
          byPlatform[platform].items.push(item);
          byPlatform[platform].total += parseFloat(item.amount || 0);
        });

        Object.keys(byPlatform).sort().forEach(platform => {
          const platformData = byPlatform[platform];

          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          doc.text(`Platform: ${platform}`, 14, yPos);
          doc.text(`Subtotal: $${platformData.total.toFixed(2)}`, pageWidth - 14, yPos, { align: 'right' });
          yPos += 6;

          // Table for this platform
          doc.autoTable({
            head: [['Date', 'Amount', 'Notes']],
            body: platformData.items.map(item => [
              item.date,
              `$${parseFloat(item.amount).toFixed(2)}`,
              item.notes || ''
            ]),
            startY: yPos,
            margin: { left: 20, right: 14 },
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 9 },
            theme: 'striped',
          });

          yPos = doc.lastAutoTable.finalY + 8;
        });

        const totalIncome = incomeData.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setFillColor(34, 197, 94);
        doc.rect(14, yPos, pageWidth - 28, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(`TOTAL INCOME: $${totalIncome.toFixed(2)}`, pageWidth / 2, yPos + 5.5, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        yPos += 15;
      }
    }

    if (type === 'expenses' || type === 'all') {
      const expenseData = type === 'all' ? data.filter(d => d.type === 'Expense') : data;

      if (expenseData.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('EXPENSES', 14, yPos);
        yPos += 8;

        // Group by category
        const byCategory = {};
        expenseData.forEach(item => {
          const category = item.category || item.description || 'Other';
          if (!byCategory[category]) byCategory[category] = { items: [], total: 0 };
          byCategory[category].items.push(item);
          byCategory[category].total += Math.abs(parseFloat(item.amount || 0));
        });

        Object.keys(byCategory).sort().forEach(category => {
          const catData = byCategory[category];

          if (yPos > 240) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          doc.text(`Category: ${category}`, 14, yPos);
          doc.text(`Subtotal: $${catData.total.toFixed(2)}`, pageWidth - 14, yPos, { align: 'right' });
          yPos += 6;

          doc.autoTable({
            head: [['Date', 'Amount', 'Description']],
            body: catData.items.map(item => [
              item.date,
              `$${Math.abs(parseFloat(item.amount)).toFixed(2)}`,
              item.description || ''
            ]),
            startY: yPos,
            margin: { left: 20, right: 14 },
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [239, 68, 68], textColor: 255, fontSize: 9 },
            theme: 'striped',
          });

          yPos = doc.lastAutoTable.finalY + 8;
        });

        const totalExpenses = expenseData.reduce((sum, i) => sum + Math.abs(parseFloat(i.amount || 0)), 0);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setFillColor(239, 68, 68);
        doc.rect(14, yPos, pageWidth - 28, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(`TOTAL EXPENSES: $${totalExpenses.toFixed(2)}`, pageWidth / 2, yPos + 5.5, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        yPos += 15;
      }
    }

    if (type === 'goals') {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('SAVINGS GOALS', 14, yPos);
      yPos += 8;

      doc.autoTable({
        head: [['Goal', 'Target', 'Current', 'Progress', 'Status']],
        body: data.map(item => [
          item.name,
          `$${parseFloat(item.target_amount).toFixed(2)}`,
          `$${parseFloat(item.current_amount).toFixed(2)}`,
          item.progress,
          item.status
        ]),
        startY: yPos,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        theme: 'striped',
      });
    }

    if (type === 'all') {
      const totalIncome = data.filter(d => d.type === 'Income').reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
      const totalExpenses = data.filter(d => d.type === 'Expense').reduce((sum, i) => sum + Math.abs(parseFloat(i.amount || 0)), 0);
      const netIncome = totalIncome - totalExpenses;

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      const color = netIncome >= 0 ? [34, 197, 94] : [239, 68, 68];
      doc.setFillColor(...color);
      doc.rect(14, yPos, pageWidth - 28, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(`NET INCOME: $${netIncome.toFixed(2)}`, pageWidth / 2, yPos + 7, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    }

    // Add footer to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const downloadFilename = `${filename}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(downloadFilename);

    // Add to export history
    addToHistory(downloadFilename, 'PDF', null);
  };

  const addToHistory = (filename, format, content) => {
    const newEntry = {
      filename,
      format,
      content,
      date: new Date().toISOString(),
      timestamp: Date.now(),
    };
    setExportHistory(prev => [newEntry, ...prev].slice(0, 10)); // Keep last 10
  };

  const filterByDateRange = (items, dateField) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    switch (dateRange) {
      case 'thisMonth':
        return items.filter(item => {
          const date = new Date(item[dateField]);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
      case 'lastMonth':
        return items.filter(item => {
          const date = new Date(item[dateField]);
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        });
      case 'thisYear':
        return items.filter(item => {
          const date = new Date(item[dateField]);
          return date.getFullYear() === currentYear;
        });
      default:
        return items;
    }
  };

  const handleExport = () => {
    let dataToExport = [];
    let filename = '';
    let type = dataType;

    switch (dataType) {
      case 'income':
        const filteredTransactions = filterByDateRange(transactions, 'transaction_date');
        dataToExport = filteredTransactions.map(t => ({
          date: t.transaction_date,
          platform: t.platform,
          amount: t.amount,
          notes: t.notes || '',
        }));
        filename = 'income_report';
        break;
      case 'expenses':
        const filteredExpenses = filterByDateRange(expenses, 'expense_date');
        dataToExport = filteredExpenses.map(e => ({
          date: e.expense_date,
          category: e.category,
          amount: e.amount,
          description: e.description || '',
          payment_method: e.payment_method || '',
        }));
        filename = 'expenses_report';
        break;
      case 'goals':
        dataToExport = goals.map(g => ({
          name: g.name,
          target_amount: g.target_amount,
          current_amount: g.current_amount,
          progress: `${((g.current_amount / g.target_amount) * 100).toFixed(2)}%`,
          status: g.status === 'completed' ? 'Completed' : 'In Progress',
        }));
        filename = 'savings_goals';
        break;
      default:
        // All data combined
        filename = 'financial_report_complete';
        const filteredTransAll = filterByDateRange(transactions, 'transaction_date');
        const filteredExpAll = filterByDateRange(expenses, 'expense_date');

        dataToExport = [
          ...filteredTransAll.map(t => ({
            type: 'Income',
            date: t.transaction_date,
            platform: t.platform,
            description: t.platform,
            amount: t.amount,
            notes: t.notes || '',
          })),
          ...filteredExpAll.map(e => ({
            type: 'Expense',
            date: e.expense_date,
            category: e.category,
            description: e.description || '',
            amount: e.amount,
            payment_method: e.payment_method || '',
          })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (exportType === 'csv') {
      exportToCSV(dataToExport, filename, type);
    } else {
      exportToPDF(dataToExport, filename, type);
    }
  };

  const handleQuickExport = (templateType) => {
    let data = [];
    let filename = '';
    let type = 'all';

    const now = new Date();
    const currentYear = now.getFullYear();

    switch (templateType) {
      case 'tax':
        // All income & expenses for current year
        const yearTransactions = transactions.filter(t => new Date(t.transaction_date).getFullYear() === currentYear);
        const yearExpenses = expenses.filter(e => new Date(e.expense_date).getFullYear() === currentYear);

        data = [
          ...yearTransactions.map(t => ({
            type: 'Income',
            date: t.transaction_date,
            platform: t.platform,
            description: t.platform,
            amount: t.amount,
            notes: t.notes || '',
          })),
          ...yearExpenses.map(e => ({
            type: 'Expense',
            date: e.expense_date,
            category: e.category,
            description: e.description || '',
            amount: e.amount,
            payment_method: e.payment_method || '',
          })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        filename = `tax_preparation_${currentYear}`;
        break;

      case 'monthly':
        // Current month
        setDateRange('thisMonth');
        setDataType('all');
        setTimeout(() => handleExport(), 100);
        return;

      case 'quarterly':
        // Last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const quarterTransactions = transactions.filter(t => new Date(t.transaction_date) >= threeMonthsAgo);
        const quarterExpenses = expenses.filter(e => new Date(e.expense_date) >= threeMonthsAgo);

        data = [
          ...quarterTransactions.map(t => ({
            type: 'Income',
            date: t.transaction_date,
            platform: t.platform,
            description: t.platform,
            amount: t.amount,
            notes: t.notes || '',
          })),
          ...quarterExpenses.map(e => ({
            type: 'Expense',
            date: e.expense_date,
            category: e.category,
            description: e.description || '',
            amount: e.amount,
            payment_method: e.payment_method || '',
          })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        filename = 'quarterly_report';
        break;

      case 'yearend':
        // Complete annual summary
        setDateRange('thisYear');
        setDataType('all');
        setTimeout(() => handleExport(), 100);
        return;
    }

    if (exportType === 'csv') {
      exportToCSV(data, filename, type);
    } else {
      exportToPDF(data, filename, type);
    }
  };

  const handleDownloadAgain = (entry) => {
    if (entry.format === 'CSV' && entry.content) {
      const blob = new Blob([entry.content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = entry.filename;
      link.click();
    } else {
      alert('PDF files cannot be re-downloaded. Please export again.');
    }
  };

  const stats = {
    transactions: transactions.length,
    expenses: expenses.length,
    goals: goals.length,
    totalIncome: transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0),
    totalExpenses: expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0),
  };

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Export Tools</h1>
            <p>Download your financial data in CSV or PDF format</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid-four">
          <div className="stat-card">
            <h3>Income Records</h3>
            <p className="stat-value">{stats.transactions}</p>
            <span className="stat-label">Total transactions</span>
          </div>
          <div className="stat-card">
            <h3>Expense Records</h3>
            <p className="stat-value">{stats.expenses}</p>
            <span className="stat-label">Total expenses</span>
          </div>
          <div className="stat-card">
            <h3>Savings Goals</h3>
            <p className="stat-value">{stats.goals}</p>
            <span className="stat-label">Active & completed</span>
          </div>
          <div className="stat-card">
            <h3>Total Income</h3>
            <p className="stat-value positive">${stats.totalIncome.toFixed(2)}</p>
            <span className="stat-label">All time</span>
          </div>
        </div>

        {/* Export Configuration */}
        <div className="export-config-section">
          <div className="config-card">
            <h2>Export Configuration</h2>

            <div className="form-group">
              <label>Data Type</label>
              <select
                className="form-input"
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
              >
                <option value="all">All Financial Data</option>
                <option value="income">Income Only</option>
                <option value="expenses">Expenses Only</option>
                <option value="goals">Savings Goals</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date Range</label>
              <select
                className="form-input"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div className="form-group">
              <label>Export Format</label>
              <div className="format-options">
                <button
                  className={`format-btn ${exportType === 'csv' ? 'active' : ''}`}
                  onClick={() => setExportType('csv')}
                >
                  <span className="format-icon"><MdDescription size={32} /></span>
                  <div>
                    <strong>CSV</strong>
                    <p>Excel compatible</p>
                  </div>
                </button>
                <button
                  className={`format-btn ${exportType === 'pdf' ? 'active' : ''}`}
                  onClick={() => setExportType('pdf')}
                >
                  <span className="format-icon"><MdPictureAsPdf size={32} /></span>
                  <div>
                    <strong>PDF</strong>
                    <p>Formatted report</p>
                  </div>
                </button>
              </div>
            </div>

            <button className="btn btn-primary btn-lg export-btn" onClick={handleExport}>
              <MdFileDownload size={20} /> Export Data
            </button>
          </div>

          {/* Export Templates */}
          <div className="templates-card">
            <h3>Quick Export Templates</h3>
            <div className="template-list">
              <div className="template-item">
                <div>
                  <h4>Tax Preparation</h4>
                  <p>All income & expenses for the year</p>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => handleQuickExport('tax')}>Export</button>
              </div>
              <div className="template-item">
                <div>
                  <h4>Monthly Summary</h4>
                  <p>Current month overview</p>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => handleQuickExport('monthly')}>Export</button>
              </div>
              <div className="template-item">
                <div>
                  <h4>Quarterly Report</h4>
                  <p>Last 3 months detailed</p>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => handleQuickExport('quarterly')}>Export</button>
              </div>
              <div className="template-item">
                <div>
                  <h4>Year-End Report</h4>
                  <p>Complete annual summary</p>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => handleQuickExport('yearend')}>Export</button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Exports */}
        <div className="dashboard-section full-width">
          <h2>Recent Exports</h2>
          <div className="export-history">
            {exportHistory.length > 0 ? (
              exportHistory.map((entry, index) => (
                <div key={index} className="export-history-item">
                  <div className="export-icon">
                    {entry.format === 'CSV' ? <MdDescription size={32} /> : <MdPictureAsPdf size={32} />}
                  </div>
                  <div className="export-details">
                    <h4>{entry.filename}</h4>
                    <p>Exported on {new Date(entry.date).toLocaleString()}</p>
                  </div>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleDownloadAgain(entry)}
                  >
                    Download Again
                  </button>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                <p>No recent exports. Export some data to see your history here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <h3>Export Capabilities</h3>
          <div className="capability-grid">
            <div className="capability-card">
              <div className="capability-icon"><MdCheckCircle size={32} /></div>
              <h4>CSV Format</h4>
              <p>Compatible with Excel, Google Sheets, and all spreadsheet apps</p>
            </div>
            <div className="capability-card">
              <div className="capability-icon"><MdBarChart size={32} /></div>
              <h4>PDF Reports</h4>
              <p>Professional formatted reports ready for printing or sharing</p>
            </div>
            <div className="capability-card">
              <div className="capability-icon"><MdLock size={32} /></div>
              <h4>Secure Export</h4>
              <p>All exports are generated client-side for maximum privacy</p>
            </div>
            <div className="capability-card">
              <div className="capability-icon"><MdGpsFixed size={32} /></div>
              <h4>Custom Filters</h4>
              <p>Export exactly what you need with flexible date and type filters</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
