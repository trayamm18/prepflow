import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Menu, X } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Profile', path: '/dashboard' },
    { name: 'Problems', path: '/problems' },
    { name: 'DSA Prep Sheet', path: '/striver' },
    { name: 'Mock MCQ Tests', path: '/mock' },
    { name: 'Viva & Basics', path: '/viva' },
    { name: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-bg text-gray-800 dark:bg-dark-bg dark:text-gray-100 transition-colors duration-300">
      {/* Top Header Navigation Bar (Leetcode/JavaFX style) */}
      <header className="sticky top-0 z-40 w-full header-bar flex items-center justify-between">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-full">
          <div className="flex items-center gap-8 h-full">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="logo-text">VibeCode</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 h-full pt-2">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item h-full flex items-center ${
                      active ? 'active' : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header controls */}
          <div className="flex items-center gap-4">
            {user && (
              <span className="hidden sm:inline font-bold text-sm text-gray-800 dark:text-gray-200">
                {user.name}
              </span>
            )}

            {/* Theme Toggle (JavaFX Pill style) */}
            <button
              onClick={toggleDarkMode}
              className="btn-secondary text-xs"
              style={{ padding: '5px 12px', borderRadius: '20px' }}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>

            {/* Logout (JavaFX Button style) */}
            <button
              onClick={handleLogout}
              className="btn-secondary text-xs"
              style={{ padding: '5px 12px', borderRadius: '20px', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
            >
              🚪 Logout
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="fixed top-14 right-0 bottom-0 w-64 bg-white dark:bg-dark-card border-l border-light-border dark:border-dark-border p-4 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              {user && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-4">
                  <div className="w-9 h-9 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-secondary font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-sm truncate">{user.name}</span>
                    <span className="text-xs text-gray-400 truncate">@{user.username}</span>
                  </div>
                </div>
              )}
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                      active
                        ? 'border-l-4 border-brand-secondary bg-brand-secondary/10 text-brand-secondary'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Body Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};
