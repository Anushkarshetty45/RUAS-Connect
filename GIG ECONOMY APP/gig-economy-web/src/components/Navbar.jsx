import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import {
  MdDashboard,
  MdAttachMoney,
  MdCreditCard,
  MdFlag,
  MdBarChart,
  MdReceipt,
  MdFileDownload,
  MdCalculate,
  MdHealthAndSafety,
  MdLogout,
  MdLightMode,
  MdDarkMode
} from 'react-icons/md';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: MdDashboard },
    { path: '/income', label: 'Income', icon: MdAttachMoney },
    { path: '/expenses', label: 'Expenses', icon: MdCreditCard },
    { path: '/savings-goals', label: 'Goals', icon: MdFlag },
    { path: '/analytics', label: 'Analytics', icon: MdBarChart },
    { path: '/receipt-scanner', label: 'Receipts', icon: MdReceipt },
    { path: '/export', label: 'Export', icon: MdFileDownload },
    { path: '/tax-tools', label: 'Tax Tools', icon: MdCalculate },
    { path: '/insurance', label: 'Insurance', icon: MdHealthAndSafety },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <h2 className="navbar-brand">GIG ECONOMY</h2>
        <div className="navbar-user">
          <span className="user-email">{user?.email}</span>
        </div>
      </div>

      <ul className="navbar-menu">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`navbar-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="navbar-icon">
                  <IconComponent size={20} />
                </span>
                <span className="navbar-label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="navbar-footer">
        <button onClick={toggleTheme} className="theme-toggle-button">
          <span className="navbar-icon">
            {theme === 'dark' ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
          </span>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={handleSignOut} className="signout-button">
          <span className="navbar-icon">
            <MdLogout size={20} />
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
