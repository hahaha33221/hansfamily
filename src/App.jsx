import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FamilyList from './pages/FamilyList';
import FamilyDetail from './pages/FamilyDetail';
import HonorificsSearch from './pages/HonorificsSearch';
import HonorificsGuide from './pages/HonorificsGuide';
import OrgChart from './pages/OrgChart';
import Admin from './pages/Admin';
import Login from './components/Login';
import { getStoredMembers } from './utils/memberStorage';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadedMembers = getStoredMembers();
    setMembers(loadedMembers);

    const savedUser = localStorage.getItem('hansfamily_current_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Find the freshest member data in case profile picture was changed
        const freshUser = loadedMembers.find(m => m.id === parsedUser.id);
        if (freshUser) {
          setCurrentUser(freshUser);
        } else {
          setCurrentUser(parsedUser);
        }
      } catch (e) {
        console.error('Failed to parse current user', e);
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('hansfamily_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hansfamily_current_user');
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('hansfamily_current_user', JSON.stringify(updatedUser));
    // Refresh members list
    setMembers(getStoredMembers());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text-sub font-medium">로딩 중...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-text-main font-sans antialiased">
        <main className="flex-grow flex items-center justify-center">
          <Login members={members} onLoginSuccess={handleLoginSuccess} />
        </main>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-background text-text-main font-sans antialiased">
        {/* Navigation Bar */}
        <Navbar currentUser={currentUser} onLogout={handleLogout} />

        {/* Page Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/family" element={<FamilyList />} />
            <Route path="/family/:id" element={<FamilyDetail currentUser={currentUser} onUpdateUser={handleUpdateUser} />} />
            <Route path="/search" element={<HonorificsSearch />} />
            <Route path="/guide" element={<HonorificsGuide />} />
            <Route path="/orgchart" element={<OrgChart />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-border-beige py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
            <p className="text-xs text-text-sub">
              본 사이트는 비공개 가족 전용 서비스입니다. 외부 유출 및 무단 도용을 금합니다.
            </p>
            <p className="text-[10px] text-text-sub/70 mt-4">
              &copy; {new Date().getFullYear()} Hans Family. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
