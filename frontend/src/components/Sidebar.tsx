import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Wallet,
  Settings,
  LogOut,
  Sparkles,
  Target,
  Receipt,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Alex Morgan';
  const displayEmail = user?.email || 'alex@example.com';

  const navItems = [
  {
    path: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard'
  },
   {
    path: '/chat',
    icon: MessageSquare,
    label: 'AI Assistant'
  },
  {
    path: '/onboarding',
    icon: Wallet,
    label: 'Financial Setup'
  },
  {
    path: '/savings',
    icon: Target,
    label: 'Savings Goal'
  },
  {
    path: '/transactions',
    icon: Receipt,
    label: 'Transactions'
  },
  {
    path: '/insights',
    icon: BarChart3,
    label: 'Insights'
  }];

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - desktop always visible, mobile slide-in */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white border-r border-gray-100 h-screen flex flex-col dark:bg-gray-800 dark:border-gray-700
        lg:relative lg:translate-x-0 lg:w-64 lg:border-r lg:sticky lg:top-0
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-gray-900">
            <Sparkles size={18} />
          </div>
          <span className="font-heading font-semibold text-xl tracking-tight dark:text-white">
            Budgetly
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) =>
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-accent-light text-gray-900 font-medium dark:bg-accent/20 dark:text-accent-light' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`
            }>
            
              <item.icon size={20} />
              {item.label}
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <NavLink
            to="/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer mb-2 ${isActive ? 'bg-accent-light text-gray-900 font-medium dark:bg-accent/20 dark:text-accent-light' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`
            }>
            
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </NavLink>

          <NavLink
            to="/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mt-2 rounded-xl transition-colors ${
                isActive
                  ? 'bg-accent-light text-gray-900 dark:bg-accent/20 dark:text-accent-light'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`
            }
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              {profile?.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                {displayEmail}
              </p>
            </div>

            {/* Prevent navigation when clicking logout */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                logout();
                navigate('/');
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <LogOut size={18} />
            </button>
          </NavLink>
      </div>
    </aside>
    </>
  );

}