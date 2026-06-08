import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Plus, Edit2, Trash2, Download, Save, X, Lock, Check } from 'lucide-react';
import { getStoredMembers, saveStoredMembers } from '../utils/memberStorage';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [members, setMembers] = useState([]);
  
  // Modal/Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null); // null means adding
  
  // Form Fields
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [birthYear, setBirthYear] = useState('');
  const [category, setCategory] = useState('generation3');
  const [spouseId, setSpouseId] = useState('');
  const [parentIds, setParentIds] = useState([]);
  const [childIds, setChildIds] = useState([]);
  const [note, setNote] = useState('');

  // Authentication check
  useEffect(() => {
    const isLogged = localStorage.getItem('hansfamily_admin_logged_in');
    if (isLogged === 'true') {
      setIsAuthenticated(true);
      setMembers(getStoredMembers());
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'hans1234') {
      setIsAuthenticated(true);
      localStorage.setItem('hansfamily_admin_logged_in', 'true');
      setMembers(getStoredMembers());
      setError('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('hansfamily_admin_logged_in');
    setPassword('');
  };

  // Open modal for adding
  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setGender('male');
    setBirthYear('');
    setCategory('generation3');
    setSpouseId('');
    setParentIds([]);
    setChildIds([]);
    setNote('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (member) => {
    setEditingMember(member);
    setName(member.name);
    setGender(member.gender || 'male');
    setBirthYear(member.birthYear || '');
    setCategory(member.category);
    setSpouseId(member.spouseId || '');
    setParentIds(member.parentIds || []);
    setChildIds(member.childIds || []);
    setNote(member.note || '');
    setIsModalOpen(true);
  };

  // Save member (Add / Edit)
  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    let updatedMembers = [...members];

    const newMemberData = {
      id: editingMember ? editingMember.id : String(Date.now()),
      name: name.trim(),
      gender: gender,
      birthYear: birthYear ? Number(birthYear) : null,
      category: category,
      spouseId: spouseId || null,
      parentIds: parentIds,
      childIds: childIds,
      groupId: editingMember ? editingMember.groupId : 'g_new',
      note: note.trim() || null,
    };

    if (editingMember) {
      // Edit existing
      updatedMembers = updatedMembers.map((m) => (m.id === editingMember.id ? newMemberData : m));
    } else {
      // Add new
      updatedMembers.push(newMemberData);
    }

    // Bidirectional links syncing
    // 1) Sync Spouse Link
    if (newMemberData.spouseId) {
      updatedMembers = updatedMembers.map((m) => {
        if (m.id === newMemberData.spouseId) {
          return { ...m, spouseId: newMemberData.id };
        }
        // If someone else was married to this spouse, clear it
        if (m.spouseId === newMemberData.spouseId && m.id !== newMemberData.id) {
          return { ...m, spouseId: null };
        }
        return m;
      });
    }

    // 2) Sync Children Link
    if (newMemberData.childIds && newMemberData.childIds.length > 0) {
      updatedMembers = updatedMembers.map((m) => {
        if (newMemberData.childIds.includes(m.id)) {
          const parentsList = m.parentIds || [];
          if (!parentsList.includes(newMemberData.id)) {
            return { ...m, parentIds: [...parentsList, newMemberData.id] };
          }
        }
        return m;
      });
    }

    // 3) Sync Parents Link
    if (newMemberData.parentIds && newMemberData.parentIds.length > 0) {
      updatedMembers = updatedMembers.map((m) => {
        if (newMemberData.parentIds.includes(m.id)) {
          const childrenList = m.childIds || [];
          if (!childrenList.includes(newMemberData.id)) {
            return { ...m, childIds: [...childrenList, newMemberData.id] };
          }
        }
        return m;
      });
    }

    setMembers(updatedMembers);
    saveStoredMembers(updatedMembers);
    setIsModalOpen(false);
  };

  // Delete member
  const handleDelete = (id) => {
    if (window.confirm('정말로 이 구성원을 삭제하시겠습니까? 관련 배우자 및 자녀 연결도 해제됩니다.')) {
      let updatedMembers = members.filter((m) => m.id !== id);

      // Clean up references in other members
      updatedMembers = updatedMembers.map((m) => {
        let changes = {};
        if (m.spouseId === id) changes.spouseId = null;
        if (m.parentIds && m.parentIds.includes(id)) {
          changes.parentIds = m.parentIds.filter((pid) => pid !== id);
        }
        if (m.childIds && m.childIds.includes(id)) {
          changes.childIds = m.childIds.filter((cid) => cid !== id);
        }
        return Object.keys(changes).length > 0 ? { ...m, ...changes } : m;
      });

      setMembers(updatedMembers);
      saveStoredMembers(updatedMembers);
    }
  };

  // Export JSON Backup
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'hansfamily_members_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getSpouseName = (spouseId) => {
    const sp = members.find((m) => m.id === spouseId);
    return sp ? sp.name : '-';
  };

  // Login view
  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-16 px-4 max-w-md mx-auto sm:px-6">
        <div className="bg-white border border-border-beige rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Lock size={22} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif text-text-main font-bold">관리자 인증</h1>
            <p className="text-text-sub text-xs">정보 보호를 위해 관리자 비밀번호를 입력해주세요.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border-beige rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
              required
            />
            {error && <p className="text-red-500 text-xs text-left px-1">{error}</p>}
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/95 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-md"
            >
              <LogIn size={18} />
              <span>로그인</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-border-beige rounded-3xl p-6 shadow-sm gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-text-main">관리자 대시보드</h1>
          <p className="text-text-sub text-xs sm:text-sm mt-0.5">가족 구성원의 기본 정보와 관계를 추가, 수정, 삭제할 수 있습니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 border border-border-beige hover:bg-secondary/20 text-text-main px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          >
            <Download size={16} />
            <span>백업 내보내기</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-1.5 bg-primary hover:bg-primary/95 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm"
          >
            <Plus size={16} />
            <span>구성원 추가</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 border border-red-200 hover:bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          >
            <LogOut size={16} />
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      {/* Main Members Grid/Table */}
      <div className="bg-white border border-border-beige rounded-3xl shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-secondary/20 text-text-main border-b border-border-beige font-serif">
                <th className="p-4">이름</th>
                <th className="p-4">성별</th>
                <th className="p-4">출생년도</th>
                <th className="p-4">구분</th>
                <th className="p-4">배우자</th>
                <th className="p-4 text-center">동작</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-beige">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-background/40 transition-colors">
                  <td className="p-4 font-bold text-text-main">{m.name}</td>
                  <td className="p-4 text-text-sub">{m.gender === 'male' ? '남성' : m.gender === 'female' ? '여성' : '미확정'}</td>
                  <td className="p-4 text-text-sub">{m.birthYear ? `${m.birthYear}년생` : '-'}</td>
                  <td className="p-4 text-text-sub">
                    {m.category === 'generation1' ? '1세대 조부모' : m.category === 'generation2' ? '2세대 직계' : m.category === 'generation3' ? '3세대 사촌' : m.category === 'generation4' ? '4세대 자녀' : '배우자'}
                  </td>
                  <td className="p-4 text-text-sub">{getSpouseName(m.spouseId)}</td>
                  <td className="p-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => openEditModal(m)}
                        className="p-1.5 border border-border-beige hover:border-primary text-text-sub hover:text-primary rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 border border-red-100 hover:border-red-400 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List Cards */}
        <div className="block md:hidden divide-y divide-border-beige">
          {members.map((m) => (
            <div key={m.id} className="p-4 flex justify-between items-center hover:bg-background/25">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-text-main">{m.name}</span>
                  <span className="text-[10px] bg-secondary/50 text-accent px-2 py-0.5 rounded-full font-semibold">
                    {m.category === 'generation1' ? '1세대' : m.category === 'generation2' ? '2세대' : m.category === 'generation3' ? '3세대' : m.category === 'generation4' ? '4세대' : '배우자'}
                  </span>
                </div>
                <div className="text-xs text-text-sub font-medium">
                  {m.gender === 'male' ? '남성' : m.gender === 'female' ? '여성' : '미정'}
                  {m.birthYear ? ` | ${m.birthYear}년생` : ''}
                  {m.spouseId ? ` | 배우자: ${getSpouseName(m.spouseId)}` : ''}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(m)}
                  className="p-2 border border-border-beige text-text-sub hover:text-primary rounded-xl"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-2 border border-red-100 text-red-500 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Add Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full sm:max-w-md h-full sm:h-auto sm:rounded-3xl shadow-2xl flex flex-col p-6 overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-border-beige/50 pb-4 mb-4">
              <h2 className="text-xl font-bold font-serif text-text-main">
                {editingMember ? '구성원 정보 수정' : '신규 구성원 추가'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-sub hover:text-text-main p-1">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-text-sub uppercase mb-1">이름</label>
                <input
                  type="text"
                  placeholder="예: 한성재"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border-beige rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-sub uppercase mb-1">성별</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-background border border-border-beige rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
                  >
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-sub uppercase mb-1">출생년도</label>
                  <input
                    type="number"
                    placeholder="예: 1982"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="w-full bg-background border border-border-beige rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-sub uppercase mb-1">카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-border-beige rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
                >
                  <option value="generation1">1세대 조부모</option>
                  <option value="generation2">2세대 직계</option>
                  <option value="generation3">3세대 사촌</option>
                  <option value="generation4">4세대 자녀</option>
                  <option value="spouse">배우자</option>
                </select>
              </div>

              {/* Conditionally link Spouse */}
              {category === 'spouse' && (
                <div>
                  <label className="block text-xs font-semibold text-text-sub uppercase mb-1">배우자 연결</label>
                  <select
                    value={spouseId}
                    onChange={(e) => setSpouseId(e.target.value)}
                    className="w-full bg-background border border-border-beige rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
                  >
                    <option value="">배우자 없음</option>
                    {members
                      .filter((m) => m.id !== (editingMember ? editingMember.id : '') && m.category !== 'generation4')
                      .map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                  </select>
                </div>
              )}

              {/* Parents linkages for children */}
              {category === 'generation4' && (
                <div>
                  <label className="block text-xs font-semibold text-text-sub uppercase mb-1">부모 연결 (다중선택)</label>
                  <select
                    multiple
                    value={parentIds}
                    onChange={(e) => setParentIds(Array.from(e.target.selectedOptions, (option) => option.value))}
                    className="w-full bg-background border border-border-beige rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main h-24"
                  >
                    {members
                      .filter((m) => m.category !== 'generation4')
                      .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
                      .map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                  </select>
                  <span className="text-[10px] text-text-sub block mt-1">Ctrl/Cmd 키를 누르고 클릭하면 여러 명을 선택할 수 있습니다.</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-text-sub uppercase mb-1">메모 (역할/메모)</label>
                <input
                  type="text"
                  placeholder="예: 한성재 처, 최연장자 등"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-background border border-border-beige rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-md"
                >
                  <Save size={18} />
                  <span>정보 저장</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
