import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, ShieldAlert, Award, ArrowRight } from 'lucide-react';
import { getStoredMembers } from '../utils/memberStorage';
import { getHonorific } from '../utils/getHonorific';

export default function Home() {
  const navigate = useNavigate();
  const membersData = useMemo(() => getStoredMembers(), []);
  
  const stats = useMemo(() => {
    const total = membersData.length;
    const cousins = membersData.filter(m => m.category === 'generation3').length;
    const children = membersData.filter(m => m.category === 'generation4').length;
    return { total, cousins, children };
  }, [membersData]);

  const [meId, setMeId] = useState('');
  const [otherId, setOtherId] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!meId || !otherId) return;
    const me = membersData.find((m) => m.id === meId);
    const other = membersData.find((m) => m.id === otherId);
    const res = getHonorific(me, other, membersData);
    setResult({ ...res, me, other });
  };

  // Sort members for dropdown selection
  const sortedMembers = [...membersData].sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  return (
    <div className="pt-20 pb-16 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
      {/* Hero & Quick Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[70vh]">
        {/* Hero Section */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left fade-in">

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-main leading-tight font-serif">
            우리 가족,<br />
            <span className="text-primary">서로를 제대로</span> 부르고 있나요?
          </h1>
          <p className="text-lg text-text-sub max-w-2xl mx-auto lg:mx-0 font-sans">
            사촌, 이종사촌 등 복잡한 가족 관계 속에서 서로의 정식 호칭을 쉽고 빠르게 확인해보세요. 27명의 따뜻한 우리 가족 안내소입니다.
          </p>
          <div className="flex flex-col sm:flex-wrap sm:flex-row gap-3 justify-center lg:justify-start pt-2">
            <button
              onClick={() => navigate('/search')}
              className="flex items-center justify-center space-x-2 bg-primary text-white font-medium px-6 py-3.5 rounded-2xl shadow-lg hover:bg-primary/95 transition-all duration-300 hover:shadow-xl group"
            >
              <span>상세 호칭 찾기</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/orgchart')}
              className="flex items-center justify-center space-x-2 bg-accent text-white font-medium px-6 py-3.5 rounded-2xl shadow-md hover:bg-accent/95 transition-all duration-300 hover:shadow-lg"
            >
              <span>가족 조직도</span>
            </button>
            <button
              onClick={() => navigate('/family')}
              className="flex items-center justify-center space-x-2 border-2 border-primary/20 text-text-main font-medium px-6 py-3.5 rounded-2xl hover:bg-secondary/20 transition-all duration-300"
            >
              <span>우리 가족 전체보기</span>
            </button>
          </div>
        </div>

        {/* Inline Quick Widget */}
        <div className="lg:col-span-5 w-full bg-white rounded-3xl border border-border-beige shadow-xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-primary mb-4">
              <Search size={20} />
              <h2 className="text-xl font-bold font-serif text-text-main">빠른 호칭 찾기</h2>
            </div>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-sub uppercase mb-1.5">나는 누구인가요?</label>
                <select
                  value={meId}
                  onChange={(e) => {
                    setMeId(e.target.value);
                    setResult(null);
                  }}
                  className="w-full bg-background border border-border-beige rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
                  required
                >
                  <option value="">나를 선택하세요</option>
                  {sortedMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.note ? `(${m.note})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-sub uppercase mb-1.5">상대방은 누구인가요?</label>
                <select
                  value={otherId}
                  onChange={(e) => {
                    setOtherId(e.target.value);
                    setResult(null);
                  }}
                  className="w-full bg-background border border-border-beige rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
                  required
                >
                  <option value="">상대방을 선택하세요</option>
                  {sortedMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.note ? `(${m.note})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!meId || !otherId}
                className="w-full bg-primary hover:bg-primary/95 text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                호칭 확인하기
              </button>
            </form>
          </div>

          {/* Quick Result Box */}
          {result && (
            <div className="mt-6 p-4 rounded-2xl bg-secondary/30 border-l-4 border-primary text-text-main animate-fade-in space-y-2">
              <div className="text-xs text-text-sub font-semibold">
                {result.me.name} → {result.other.name} ({result.relation})
              </div>
              <div className="text-sm">
                내가 부를 때: <span className="font-bold text-primary text-lg">{result.aCallsB}</span>
              </div>
              <div className="text-sm">
                상대가 부를 때: <span className="font-semibold text-text-main">{result.bCallsA}</span>
              </div>
              {result.note && <div className="text-xs text-text-sub border-t border-border-beige pt-1.5 mt-1">{result.note}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="mt-20">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-3xl font-serif text-text-main font-bold">숫자로 보는 우리 가족</h2>
          <p className="text-text-sub">함께 모여 더욱 돈독한 대가족의 구성 통계</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-border-beige rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-center text-primary mb-3">
              <Users size={28} />
            </div>
            <p className="text-text-sub text-sm font-medium">총 가족 구성원</p>
            <p className="text-3xl font-bold text-text-main mt-1 font-serif">{stats.total}<span className="text-lg">명</span></p>
          </div>

          <div className="bg-white border border-border-beige rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-center text-primary mb-3">
              <Award size={28} />
            </div>
            <p className="text-text-sub text-sm font-medium">가족 그룹</p>
            <p className="text-3xl font-bold text-text-main mt-1 font-serif">7<span className="text-lg">가족</span></p>
          </div>

          <div className="bg-white border border-border-beige rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-center text-primary mb-3">
              <ShieldAlert size={28} />
            </div>
            <p className="text-text-sub text-sm font-medium">3세대 사촌</p>
            <p className="text-3xl font-bold text-text-main mt-1 font-serif">{stats.cousins}<span className="text-lg">명</span></p>
          </div>

          <div className="bg-white border border-border-beige rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-center text-primary mb-3">
              <Users size={28} />
            </div>
            <p className="text-text-sub text-sm font-medium">4세대 자녀</p>
            <p className="text-3xl font-bold text-text-main mt-1 font-serif">{stats.children}<span className="text-lg">명</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
