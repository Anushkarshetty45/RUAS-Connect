import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useTransactionStore } from '../store/transactionStore';
import { useExpenseStore } from '../store/expenseStore';
import {
  MdLightbulb,
  MdCalendarToday,
  MdDirectionsCar,
  MdHome
} from 'react-icons/md';

export default function TaxTools() {
  const { transactions } = useTransactionStore();
  const { expenses } = useExpenseStore();

  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [quarterlyData, setQuarterlyData] = useState([]);

  useEffect(() => {
    calculateQuarterly();
  }, [transactions, expenses, taxYear]);

  const calculateQuarterly = () => {
    const quarters = [
      { name: 'Q1', months: [0, 1, 2] },
      { name: 'Q2', months: [3, 4, 5] },
      { name: 'Q3', months: [6, 7, 8] },
      { name: 'Q4', months: [9, 10, 11] },
    ];

    const data = quarters.map((quarter) => {
      const income = transactions
        .filter((t) => {
          const date = new Date(t.transaction_date);
          return (
            date.getFullYear() === taxYear &&
            quarter.months.includes(date.getMonth())
          );
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const expense = expenses
        .filter((e) => {
          const date = new Date(e.expense_date);
          return (
            date.getFullYear() === taxYear &&
            quarter.months.includes(date.getMonth())
          );
        })
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

      const estimatedTax = (income - expense) * 0.25; // 25% estimate

      return {
        quarter: quarter.name,
        income: income.toFixed(2),
        expenses: expense.toFixed(2),
        taxable: (income - expense).toFixed(2),
        estimatedTax: estimatedTax.toFixed(2),
      };
    });

    setQuarterlyData(data);
  };

  const yearlyIncome = transactions
    .filter(
      (t) => new Date(t.transaction_date).getFullYear() === taxYear
    )
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const yearlyExpenses = expenses
    .filter(
      (e) => new Date(e.expense_date).getFullYear() === taxYear
    )
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const taxableIncome = yearlyIncome - yearlyExpenses;
  const estimatedTaxBill = taxableIncome * 0.25;

  const deductionCategories = [
    { category: 'Office Supplies', amount: 1245.50, percentage: 15 },
    { category: 'Equipment', amount: 3200.00, percentage: 38 },
    { category: 'Software', amount: 890.00, percentage: 11 },
    { category: 'Travel', amount: 2100.00, percentage: 25 },
    { category: 'Other', amount: 924.50, percentage: 11 },
  ];

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Tax Tools</h1>
            <p>Track deductions and estimate tax obligations</p>
          </div>
          <select
            className="year-selector"
            value={taxYear}
            onChange={(e) => setTaxYear(parseInt(e.target.value))}
          >
            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
            <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
          </select>
        </div>

        {/* Year Summary */}
        <div className="stats-grid-four">
          <div className="stat-card">
            <h3>Total Income</h3>
            <p className="stat-value positive">${yearlyIncome.toFixed(2)}</p>
            <span className="stat-label">{taxYear} year to date</span>
          </div>
          <div className="stat-card">
            <h3>Deductible Expenses</h3>
            <p className="stat-value">${yearlyExpenses.toFixed(2)}</p>
            <span className="stat-label">Business expenses</span>
          </div>
          <div className="stat-card highlight">
            <h3>Taxable Income</h3>
            <p className="stat-value">${taxableIncome.toFixed(2)}</p>
            <span className="stat-label">After deductions</span>
          </div>
          <div className="stat-card highlight">
            <h3>Est. Tax Bill</h3>
            <p className="stat-value negative">${estimatedTaxBill.toFixed(2)}</p>
            <span className="stat-label">25% rate estimate</span>
          </div>
        </div>

        {/* Quarterly Breakdown */}
        <div className="dashboard-section full-width">
          <h2>Quarterly Breakdown - {taxYear}</h2>
          <div className="quarterly-table">
            <table className="tax-table">
              <thead>
                <tr>
                  <th>Quarter</th>
                  <th>Income</th>
                  <th>Expenses</th>
                  <th>Taxable</th>
                  <th>Est. Tax</th>
                </tr>
              </thead>
              <tbody>
                {quarterlyData.map((q) => (
                  <tr key={q.quarter}>
                    <td><strong>{q.quarter}</strong></td>
                    <td className="positive">${q.income}</td>
                    <td>${q.expenses}</td>
                    <td><strong>${q.taxable}</strong></td>
                    <td className="negative">${q.estimatedTax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deduction Categories */}
        <div className="dashboard-grid">
          <div className="dashboard-section">
            <h2>Deduction Categories</h2>
            <div className="deduction-list">
              {deductionCategories.map((item, index) => (
                <div key={index} className="deduction-item">
                  <div className="deduction-info">
                    <h4>{item.category}</h4>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="deduction-amount">${item.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Checklist */}
          <div className="dashboard-section">
            <h2>Tax Preparation Checklist</h2>
            <div className="checklist">
              <label className="checklist-item">
                <input type="checkbox" />
                <span>Gather all 1099 forms</span>
              </label>
              <label className="checklist-item">
                <input type="checkbox" />
                <span>Review deductible expenses</span>
              </label>
              <label className="checklist-item">
                <input type="checkbox" />
                <span>Calculate mileage deduction</span>
              </label>
              <label className="checklist-item">
                <input type="checkbox" />
                <span>Organize receipts</span>
              </label>
              <label className="checklist-item">
                <input type="checkbox" />
                <span>Consult tax professional</span>
              </label>
              <label className="checklist-item">
                <input type="checkbox" />
                <span>Make estimated payment</span>
              </label>
            </div>
          </div>
        </div>

        {/* Tax Tips */}
        <div className="info-section">
          <h3>Tax Tips for Gig Workers</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <h4><MdLightbulb size={24} /> Track Everything</h4>
              <p>Keep detailed records of all income and expenses throughout the year</p>
            </div>
            <div className="tip-card">
              <h4><MdCalendarToday size={24} /> Quarterly Payments</h4>
              <p>Make estimated tax payments quarterly to avoid penalties</p>
            </div>
            <div className="tip-card">
              <h4><MdDirectionsCar size={24} /> Mileage Deduction</h4>
              <p>Track business miles - standard mileage rate is $0.67/mile for 2024</p>
            </div>
            <div className="tip-card">
              <h4><MdHome size={24} /> Home Office</h4>
              <p>If you work from home, you may qualify for home office deduction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
