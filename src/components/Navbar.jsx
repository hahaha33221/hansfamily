import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Search, BookOpen, Settings, Menu, X, Network, LogOut } from 'lucide-react';

export default function Navbar({ currentUser, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems = [
    { name: '우리 가족', path: '/family', icon: <Users size={18} /> },
    { name: '가족 조직도', path: '/orgchart', icon: <Network size={18} /> },
    { name: '호칭 찾기', path: '/search', icon: <Search size={18} /> },
    { name: '호칭 가이드', path: '/guide', icon: <BookOpen size={18} /> },
    { name: '관리자', path: '/admin', icon: <Settings size={18} /> },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/85 backdrop-blur-md shadow-sm border-b border-border-beige'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2 text-text-main group flex-shrink-0">
            <div className="bg-primary/10 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Home size={20} />
            </div>
            <span className="font-serif font-bold text-lg sm:text-xl tracking-tight">
              han's family
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-sub hover:text-primary hover:bg-secondary/40'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          {/* User profile & Logout on Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser && (
              <div className="flex items-center space-x-2.5">
                <NavLink to={`/family/${currentUser.id}`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                  {currentUser.profileImage ? (
                    <img
                      src={currentUser.profileImage}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover border border-border-beige"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-text-main">{currentUser.name}님</span>
                </NavLink>
                <button
                  onClick={onLogout}
                  className="p-2 text-text-sub hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                  title="로그아웃"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger & profile button */}
          <div className="flex md:hidden items-center space-x-2">
            {currentUser && (
              <NavLink to={`/family/${currentUser.id}`} className="w-8 h-8 rounded-full overflow-hidden border border-border-beige flex items-center justify-center">
                {currentUser.profileImage ? (
                  <img
                    src={currentUser.profileImage}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
              </NavLink>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-text-main hover:text-primary p-2 focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <div
        className={`md:hidden fixed inset-x-0 top-16 bg-background border-b border-border-beige shadow-lg transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-sub hover:text-primary hover:bg-secondary/30'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
          {currentUser && (
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut size={18} />
              <span>로그아웃</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
