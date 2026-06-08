import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart } from 'lucide-react';
import { getStoredMembers } from '../utils/memberStorage';

export default function FamilyList() {
  const navigate = useNavigate();
  const membersData = useMemo(() => getStoredMembers(), []);
  const [activeTab, setActiveTab] = useState('all');

  const [searchTerm, setSearchTerm] = useState('');

  // Get initial character of a Korean name
  const getInitial = (name) => {
    return name ? name.charAt(0) : '';
  };

  const getCategoryLabel = (member) => {
    switch (member.category) {
      case 'generation2':
        return '직계 형제자매';
      case 'generation3':
        return '사촌';
      case 'generation4':
        return '자녀 세대';
      case 'spouse':
        return member.note || '배우자';
      default:
        return '가족';
    }
  };

  // Filter logic
  const filteredMembers = membersData.filter((member) => {
    const matchesSearch = member.name.includes(searchTerm);
    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'direct') return member.category === 'generation2' || member.category === 'generation3';
    if (activeTab === 'spouse') return member.category === 'spouse';
    if (activeTab === 'child') return member.category === 'generation4';
    return true;
  });

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
      {/* Title & Introduction */}
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-serif text-text-main font-bold">우리 가족</h1>
        <p className="text-text-sub">함께하는 {membersData.length}명의 가족 구성원 목록입니다.</p>
      </div>

      {/* Filters and Search Bar Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* Tab Filters */}
        <div className="flex overflow-x-auto py-1 space-x-1.5 scrollbar-none">
          {[
            { id: 'all', label: '전체' },
            { id: 'direct', label: '직계' },
            { id: 'spouse', label: '배우자' },
            { id: 'child', label: '자녀' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-border-beige text-text-sub hover:text-primary hover:bg-secondary/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-sub">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="이름으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-border-beige rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main placeholder-text-sub text-sm shadow-sm"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-16 bg-white border border-border-beige rounded-3xl mt-4">
          <Heart className="mx-auto text-primary/30 mb-3" size={40} />
          <p className="text-text-sub text-lg font-medium">검색 결과에 맞는 가족 구성원이 없습니다.</p>
          <button
            onClick={() => { setSearchTerm(''); setActiveTab('all'); }}
            className="mt-4 text-primary font-semibold hover:underline text-sm"
          >
            필터 초기화하기
          </button>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => navigate(`/family/${member.id}`)}
            className="group relative bg-white border border-border-beige rounded-3xl p-5 sm:p-6 text-center cursor-pointer shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            {/* Initial Circle */}
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              {getInitial(member.name)}
            </div>

            {/* Profile Info */}
            <h2 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors font-serif">
              {member.name}
            </h2>
            <p className="text-xs font-semibold text-text-sub mt-1">
              {getCategoryLabel(member)}
            </p>
            <p className="text-xs text-text-sub mt-0.5">
              {member.birthYear ? `${member.birthYear}년생` : '연도 미정'} · {member.gender === 'male' ? '남성' : '여성'}
            </p>

            {/* Hover Action Button overlay */}
            <div className="mt-4 pt-2 border-t border-border-beige/40">
              <button
                className="w-full bg-secondary/35 text-primary group-hover:bg-primary group-hover:text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all duration-300"
              >
                호칭 확인하기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
