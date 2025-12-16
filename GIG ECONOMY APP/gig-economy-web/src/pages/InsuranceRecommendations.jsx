import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTransactionStore } from '../store/transactionStore';
import { useExpenseStore } from '../store/expenseStore';
import Navbar from '../components/Navbar';
import {
  MdHealthAndSafety,
  MdDirectionsCar,
  MdHome,
  MdWork,
  MdFamilyRestroom,
  MdSecurity,
  MdTrendingUp,
  MdCheckCircle,
  MdInfo
} from 'react-icons/md';

export default function InsuranceRecommendations() {
  const user = useAuthStore((state) => state.user);
  const { transactions, fetchTransactions } = useTransactionStore();
  const { expenses, fetchExpenses } = useExpenseStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setLoading(true);
        await Promise.all([fetchTransactions(user.id), fetchExpenses(user.id)]);
        setLoading(false);
      }
    };
    fetchData();
  }, [user, fetchTransactions, fetchExpenses]);

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const totalIncome = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const monthlyIncome = totalIncome / Math.max(1, transactions.length / 30);
    const monthlyExpenses = totalExpenses / Math.max(1, expenses.length / 30);

    // Calculate expense categories
    const vehicleExpenses = expenses
      .filter(e => ['Gas/Fuel', 'Vehicle Maintenance', 'Car Wash', 'Car Payment', 'Auto Insurance', 'Oil Change', 'Tires', 'Repairs'].includes(e.category))
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const healthExpenses = expenses
      .filter(e => ['Health Insurance', 'Healthcare', 'Personal Care'].includes(e.category))
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const homeExpenses = expenses
      .filter(e => ['Rent', 'Utilities', 'Home'].includes(e.category))
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const workEquipment = expenses
      .filter(e => ['Phone Bill', 'Internet', 'Phone/Tablet Purchase', 'Work Supplies', 'Safety Equipment'].includes(e.category))
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    return {
      monthlyIncome,
      monthlyExpenses,
      totalIncome,
      totalExpenses,
      vehicleExpenses,
      healthExpenses,
      homeExpenses,
      workEquipment,
      hasVehicleExpenses: vehicleExpenses > 0,
      hasHomeExpenses: homeExpenses > 0,
      isHighIncome: monthlyIncome > 5000,
      isMediumIncome: monthlyIncome >= 3000 && monthlyIncome <= 5000,
    };
  }, [transactions, expenses]);

  // Generate insurance recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    let idCounter = 1;

    // Health Insurance
    if (financialMetrics.monthlyIncome > 2000) {
      recs.push({
        id: idCounter++,
        type: 'Health Insurance',
        icon: <MdHealthAndSafety size={32} />,
        priority: 'Critical',
        priorityColor: '#EF4444',
        estimatedCost: financialMetrics.isHighIncome ? '$400-600/month' : '$200-400/month',
        reason: `With a monthly income of $${financialMetrics.monthlyIncome.toFixed(0)}, health insurance is essential to protect against medical emergencies.`,
        benefits: [
          'Coverage for medical emergencies and hospitalizations',
          'Preventive care and routine checkups',
          'Prescription drug coverage',
          'Protection from high medical costs'
        ],
        recommended: financialMetrics.healthExpenses < 200,
      });
    }

    // Dental Insurance
    if (financialMetrics.monthlyIncome > 2000) {
      recs.push({
        id: idCounter++,
        type: 'Dental Insurance',
        icon: <MdHealthAndSafety size={32} />,
        priority: 'Medium',
        priorityColor: '#10B981',
        estimatedCost: '$20-50/month',
        reason: 'Dental care is essential for overall health and can be expensive without insurance.',
        benefits: [
          'Coverage for preventive care (cleanings, exams)',
          'Discounts on major procedures',
          'Protection against high dental costs',
          'Access to network of dentists'
        ],
        recommended: financialMetrics.isMediumIncome || financialMetrics.isHighIncome,
      });
    }

    // Vision Insurance
    if (financialMetrics.monthlyIncome > 2000) {
      recs.push({
        id: idCounter++,
        type: 'Vision Insurance',
        icon: <MdHealthAndSafety size={32} />,
        priority: 'Medium',
        priorityColor: '#10B981',
        estimatedCost: '$10-20/month',
        reason: 'Regular eye exams and corrective lenses can be costly without insurance.',
        benefits: [
          'Annual eye exams covered',
          'Discounts on glasses and contacts',
          'Early detection of eye diseases',
          'Affordable vision correction'
        ],
        recommended: financialMetrics.isMediumIncome || financialMetrics.isHighIncome,
      });
    }

    // Short-Term Disability Insurance
    if (financialMetrics.monthlyIncome > 2500) {
      recs.push({
        id: idCounter++,
        type: 'Short-Term Disability Insurance',
        icon: <MdSecurity size={32} />,
        priority: 'High',
        priorityColor: '#F59E0B',
        estimatedCost: `$${(financialMetrics.monthlyIncome * 0.01).toFixed(0)}-${(financialMetrics.monthlyIncome * 0.02).toFixed(0)}/month`,
        reason: 'Covers you for temporary disabilities lasting 3-6 months, common for gig workers.',
        benefits: [
          'Replace 60-70% of income for short periods',
          'Coverage starts after brief waiting period',
          'Protection for temporary injuries',
          'Peace of mind during recovery'
        ],
        recommended: true,
      });
    }

    // Long-Term Disability Insurance
    if (financialMetrics.monthlyIncome > 3000) {
      recs.push({
        id: idCounter++,
        type: 'Long-Term Disability Insurance',
        icon: <MdSecurity size={32} />,
        priority: 'High',
        priorityColor: '#F59E0B',
        estimatedCost: `$${(financialMetrics.monthlyIncome * 0.02).toFixed(0)}-${(financialMetrics.monthlyIncome * 0.03).toFixed(0)}/month`,
        reason: 'Critical protection if you cannot work due to serious injury or illness for extended periods.',
        benefits: [
          'Replace 50-70% of your income long-term',
          'Protection for independent contractors',
          'Coverage until retirement age',
          'Financial security for serious conditions'
        ],
        recommended: true,
      });
    }

    // Term Life Insurance
    if (financialMetrics.monthlyIncome > 3000) {
      recs.push({
        id: idCounter++,
        type: 'Term Life Insurance',
        icon: <MdFamilyRestroom size={32} />,
        priority: 'High',
        priorityColor: '#F59E0B',
        estimatedCost: '$20-50/month',
        reason: 'Affordable protection for dependents during your working years.',
        benefits: [
          'Most affordable life insurance option',
          '10, 20, or 30-year terms available',
          'Coverage during peak earning years',
          'Simple and straightforward'
        ],
        recommended: financialMetrics.isMediumIncome || financialMetrics.isHighIncome,
      });
    }

    // Whole Life Insurance
    if (financialMetrics.isHighIncome) {
      recs.push({
        id: idCounter++,
        type: 'Whole Life Insurance',
        icon: <MdFamilyRestroom size={32} />,
        priority: 'Medium',
        priorityColor: '#10B981',
        estimatedCost: '$100-300/month',
        reason: 'Permanent coverage with cash value accumulation for high earners.',
        benefits: [
          'Lifetime coverage guaranteed',
          'Builds cash value over time',
          'Tax-advantaged savings component',
          'Can borrow against policy'
        ],
        recommended: financialMetrics.monthlyIncome > 6000,
      });
    }

    // Auto Insurance
    if (financialMetrics.hasVehicleExpenses) {
      recs.push({
        id: idCounter++,
        type: 'Auto Insurance',
        icon: <MdDirectionsCar size={32} />,
        priority: 'Critical',
        priorityColor: '#EF4444',
        estimatedCost: '$100-200/month',
        reason: `You have $${financialMetrics.vehicleExpenses.toFixed(0)} in vehicle-related expenses, indicating you rely on your vehicle for work.`,
        benefits: [
          'Liability coverage (required by law)',
          'Protection against accidents and theft',
          'Coverage for vehicle repairs',
          'Rideshare/delivery driver endorsements available'
        ],
        recommended: true,
      });
    }

    // Commercial Auto Insurance
    if (financialMetrics.hasVehicleExpenses && financialMetrics.monthlyIncome > 3000) {
      recs.push({
        id: idCounter++,
        type: 'Commercial Auto Insurance',
        icon: <MdDirectionsCar size={32} />,
        priority: 'High',
        priorityColor: '#F59E0B',
        estimatedCost: '$150-300/month',
        reason: 'Essential if you use your vehicle extensively for business purposes.',
        benefits: [
          'Higher liability limits than personal auto',
          'Coverage during business use',
          'Protection for business equipment in vehicle',
          'Required by many gig platforms'
        ],
        recommended: financialMetrics.vehicleExpenses > 500,
      });
    }

    // Renters/Homeowners Insurance
    if (financialMetrics.hasHomeExpenses) {
      const insuranceType = financialMetrics.homeExpenses > 1500 ? 'Homeowners' : 'Renters';
      recs.push({
        id: idCounter++,
        type: `${insuranceType} Insurance`,
        icon: <MdHome size={32} />,
        priority: insuranceType === 'Homeowners' ? 'High' : 'Medium',
        priorityColor: insuranceType === 'Homeowners' ? '#F59E0B' : '#10B981',
        estimatedCost: insuranceType === 'Renters' ? '$15-30/month' : '$100-200/month',
        reason: `Your housing expenses suggest you need ${insuranceType.toLowerCase()} insurance to protect your belongings and liability.`,
        benefits: [
          'Protection for personal belongings',
          'Liability coverage for accidents',
          'Temporary living expenses if displaced',
          'Peace of mind for your home'
        ],
        recommended: true,
      });
    }

    // Umbrella Insurance
    if (financialMetrics.isHighIncome) {
      recs.push({
        id: idCounter++,
        type: 'Umbrella Insurance',
        icon: <MdSecurity size={32} />,
        priority: 'Medium',
        priorityColor: '#10B981',
        estimatedCost: '$15-50/month',
        reason: 'Extra liability coverage beyond your auto and home policies for high-net-worth individuals.',
        benefits: [
          'Coverage for major liability claims',
          '$1-5 million in additional protection',
          'Covers legal fees and settlements',
          'Protects your assets'
        ],
        recommended: financialMetrics.monthlyIncome > 6000,
      });
    }

    // Professional Liability Insurance (E&O)
    if (financialMetrics.workEquipment > 500 || financialMetrics.monthlyIncome > 4000) {
      recs.push({
        id: idCounter++,
        type: 'Professional Liability Insurance',
        icon: <MdWork size={32} />,
        priority: 'High',
        priorityColor: '#F59E0B',
        estimatedCost: '$30-80/month',
        reason: 'Protects your business from claims of negligence, errors, or omissions in your professional services.',
        benefits: [
          'Coverage for legal defense costs',
          'Protection against client lawsuits',
          'Professional credibility',
          'Required by some clients/platforms'
        ],
        recommended: financialMetrics.monthlyIncome > 4000,
      });
    }

    // General Liability Insurance
    if (financialMetrics.monthlyIncome > 3000) {
      recs.push({
        id: idCounter++,
        type: 'General Liability Insurance',
        icon: <MdWork size={32} />,
        priority: 'Medium',
        priorityColor: '#10B981',
        estimatedCost: '$40-100/month',
        reason: 'Protects your business from third-party claims of bodily injury or property damage.',
        benefits: [
          'Coverage for customer injuries',
          'Property damage protection',
          'Legal defense costs covered',
          'Business credibility and trust'
        ],
        recommended: financialMetrics.monthlyIncome > 4000,
      });
    }

    // Workers Compensation Insurance
    if (financialMetrics.monthlyIncome > 5000) {
      recs.push({
        id: idCounter++,
        type: 'Workers Compensation Insurance',
        icon: <MdWork size={32} />,
        priority: 'Medium',
        priorityColor: '#10B981',
        estimatedCost: '$50-150/month',
        reason: 'May be required if you hire subcontractors or employees for your gig business.',
        benefits: [
          'Coverage for employee injuries',
          'Medical expenses and lost wages',
          'Legal protection for your business',
          'Required by law in most states'
        ],
        recommended: financialMetrics.monthlyIncome > 7000,
      });
    }

    // Cyber Liability Insurance
    if (financialMetrics.workEquipment > 300 || financialMetrics.monthlyIncome > 4000) {
      recs.push({
        id: idCounter++,
        type: 'Cyber Liability Insurance',
        icon: <MdSecurity size={32} />,
        priority: 'Medium',
        priorityColor: '#10B981',
        estimatedCost: '$50-150/month',
        reason: 'Protects against data breaches, cyber attacks, and digital security incidents.',
        benefits: [
          'Coverage for data breach costs',
          'Customer notification expenses',
          'Legal fees and settlements',
          'Business interruption coverage'
        ],
        recommended: financialMetrics.workEquipment > 500,
      });
    }

    // Business Property Insurance
    if (financialMetrics.workEquipment > 1000) {
      recs.push({
        id: idCounter++,
        type: 'Business Property Insurance',
        icon: <MdWork size={32} />,
        priority: 'Medium',
        priorityColor: '#10B981',
        estimatedCost: '$30-100/month',
        reason: `With $${financialMetrics.workEquipment.toFixed(0)} in work equipment expenses, protect your business assets.`,
        benefits: [
          'Coverage for business equipment',
          'Protection against theft and damage',
          'Replacement cost coverage',
          'Business interruption coverage'
        ],
        recommended: true,
      });
    }

    // Equipment Insurance
    if (financialMetrics.workEquipment > 500) {
      recs.push({
        id: idCounter++,
        type: 'Equipment Insurance',
        icon: <MdWork size={32} />,
        priority: 'Medium',
        priorityColor: '#10B981',
        estimatedCost: '$20-60/month',
        reason: 'Protects expensive tools and equipment essential for your gig work.',
        benefits: [
          'Coverage for laptops, cameras, tools',
          'Protection against theft and accidents',
          'On and off-site coverage',
          'Quick replacement'
        ],
        recommended: financialMetrics.workEquipment > 500,
      });
    }

    // Travel Insurance
    if (financialMetrics.monthlyIncome > 4000) {
      recs.push({
        id: idCounter++,
        type: 'Travel Insurance',
        icon: <MdTrendingUp size={32} />,
        priority: 'Low',
        priorityColor: '#6B7280',
        estimatedCost: '$50-150/trip',
        reason: 'Important if you travel for work or have clients in multiple locations.',
        benefits: [
          'Trip cancellation coverage',
          'Medical emergency coverage abroad',
          'Lost baggage protection',
          'Travel delay reimbursement'
        ],
        recommended: financialMetrics.monthlyIncome > 5000,
      });
    }

    // Critical Illness Insurance
    if (financialMetrics.monthlyIncome > 3000) {
      recs.push({
        id: idCounter++,
        type: 'Critical Illness Insurance',
        icon: <MdHealthAndSafety size={32} />,
        priority: 'Medium',
        priorityColor: '#10B981',
        estimatedCost: '$30-80/month',
        reason: 'Provides lump sum payment if diagnosed with serious illness like cancer, heart attack, or stroke.',
        benefits: [
          'Lump sum cash payment',
          'Use funds for any purpose',
          'Covers treatment costs',
          'Supplements health insurance'
        ],
        recommended: financialMetrics.isMediumIncome || financialMetrics.isHighIncome,
      });
    }

    // Accident Insurance
    if (financialMetrics.monthlyIncome > 2500) {
      recs.push({
        id: idCounter++,
        type: 'Accident Insurance',
        icon: <MdHealthAndSafety size={32} />,
        priority: 'Low',
        priorityColor: '#6B7280',
        estimatedCost: '$10-30/month',
        reason: 'Provides cash benefits for injuries from accidents, complementing health insurance.',
        benefits: [
          'Cash payments for accidents',
          'Covers ER visits and hospitalization',
          'Fracture and dislocation benefits',
          'Affordable supplemental coverage'
        ],
        recommended: financialMetrics.hasVehicleExpenses,
      });
    }

    // Identity Theft Protection
    if (financialMetrics.monthlyIncome > 2000) {
      recs.push({
        id: idCounter++,
        type: 'Identity Theft Protection',
        icon: <MdSecurity size={32} />,
        priority: 'Low',
        priorityColor: '#6B7280',
        estimatedCost: '$10-30/month',
        reason: 'Protects your personal and financial information from identity theft.',
        benefits: [
          'Credit monitoring and alerts',
          'Identity restoration services',
          'Reimbursement for stolen funds',
          'Legal assistance included'
        ],
        recommended: financialMetrics.monthlyIncome > 3000,
      });
    }

    // Pet Insurance
    if (financialMetrics.monthlyIncome > 2500) {
      recs.push({
        id: idCounter++,
        type: 'Pet Insurance',
        icon: <MdFamilyRestroom size={32} />,
        priority: 'Low',
        priorityColor: '#6B7280',
        estimatedCost: '$30-80/month per pet',
        reason: 'If you have pets, insurance helps manage unexpected veterinary costs.',
        benefits: [
          'Coverage for accidents and illnesses',
          'Discounts on preventive care',
          'Emergency and specialty care covered',
          'Predictable monthly costs'
        ],
        recommended: false,
      });
    }

    return recs.sort((a, b) => {
      const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [financialMetrics]);

  // Calculate total estimated insurance costs
  const totalEstimatedCost = useMemo(() => {
    const recommendedInsurance = recommendations.filter(r => r.recommended);
    const minCosts = recommendedInsurance.map(r => {
      const match = r.estimatedCost.match(/\$(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const maxCosts = recommendedInsurance.map(r => {
      const matches = r.estimatedCost.match(/\$(\d+)/g);
      if (matches && matches.length > 1) {
        return parseInt(matches[1].replace('$', ''));
      }
      return minCosts[recommendedInsurance.indexOf(r)];
    });

    const totalMin = minCosts.reduce((sum, cost) => sum + cost, 0);
    const totalMax = maxCosts.reduce((sum, cost) => sum + cost, 0);

    return { min: totalMin, max: totalMax };
  }, [recommendations]);

  if (loading) {
    return (
      <div className="page-layout">
        <Navbar />
        <div className="page-content">
          <div className="loading">Loading recommendations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Insurance Recommendations</h1>
            <p>Personalized insurance suggestions based on your income and expenses</p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="stats-grid-four">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Monthly Income</h3>
              <p className="stat-value positive">
                ${financialMetrics.monthlyIncome.toFixed(0)}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div className="stat-content">
              <h3>Monthly Expenses</h3>
              <p className="stat-value">
                ${financialMetrics.monthlyExpenses.toFixed(0)}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛡️</div>
            <div className="stat-content">
              <h3>Recommended Plans</h3>
              <p className="stat-value">{recommendations.filter(r => r.recommended).length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Est. Total Cost</h3>
              <p className="stat-value">
                ${totalEstimatedCost.min}-${totalEstimatedCost.max}/mo
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="info-banner">
          <MdInfo size={24} />
          <div>
            <h3>About These Recommendations</h3>
            <p>
              These insurance recommendations are based on your current income and expense patterns.
              They are suggestions only and should not replace professional financial advice.
              Consult with a licensed insurance agent for personalized quotes and coverage options.
            </p>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="recommendations-grid">
          {recommendations.map((rec) => (
            <div key={rec.id} className={`recommendation-card ${rec.recommended ? 'recommended' : ''}`}>
              <div className="recommendation-header">
                <div className="recommendation-icon" style={{ color: rec.priorityColor }}>
                  {rec.icon}
                </div>
                <div className="recommendation-priority" style={{ backgroundColor: rec.priorityColor }}>
                  {rec.priority} Priority
                </div>
              </div>

              <h3>{rec.type}</h3>
              <div className="recommendation-cost">
                <MdTrendingUp size={20} />
                <span>Estimated: {rec.estimatedCost}</span>
              </div>

              <div className="recommendation-reason">
                <strong>Why you need this:</strong>
                <p>{rec.reason}</p>
              </div>

              <div className="recommendation-benefits">
                <strong>Key Benefits:</strong>
                <ul>
                  {rec.benefits.map((benefit, index) => (
                    <li key={index}>
                      <MdCheckCircle size={18} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {rec.recommended && (
                <div className="recommendation-badge">
                  <MdCheckCircle size={16} />
                  Recommended for You
                </div>
              )}

              <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>
                Get Quotes
              </button>
            </div>
          ))}
        </div>

        {/* Educational Section */}
        <div className="insurance-education">
          <h2>Understanding Your Insurance Needs</h2>
          <div className="education-grid">
            <div className="education-card">
              <h4>Why Insurance Matters for Gig Workers</h4>
              <p>
                As a gig worker, you don't have employer-provided benefits. Insurance protects you from
                financial devastation due to accidents, illness, or liability claims. It's not just about
                compliance—it's about protecting your livelihood and future.
              </p>
            </div>
            <div className="education-card">
              <h4>How Much Should You Spend?</h4>
              <p>
                Financial experts recommend spending 10-15% of your gross income on insurance. For gig workers,
                this typically includes health, auto (if applicable), disability, and liability insurance.
                Adjust based on your specific risk factors.
              </p>
            </div>
            <div className="education-card">
              <h4>Tips for Getting the Best Rates</h4>
              <p>
                Shop around and compare quotes from multiple insurers. Bundle policies when possible for discounts.
                Maintain good credit, as it affects rates. Consider higher deductibles to lower premiums, but
                ensure you can afford the deductible in an emergency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
