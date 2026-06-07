import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FamilyList from './pages/FamilyList';
import FamilyDetail from './pages/FamilyDetail';
import HonorificsSearch from './pages/HonorificsSearch';
import HonorificsGuide from './pages/HonorificsGuide';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-background text-text-main font-sans antialiased">
        {/* Navigation Bar */}
        <Navbar />

        {/* Page Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/family" element={<FamilyList />} />
            <Route path="/family/:id" element={<FamilyDetail />} />
            <Route path="/search" element={<HonorificsSearch />} />
            <Route path="/guide" element={<HonorificsGuide />} />
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
