import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Heart, Star, Sparkles, MessageCircle, Camera, Check, AlertCircle } from 'lucide-react';
import { getHonorific } from '../utils/getHonorific';
import { API_URL } from '../config';

export default function FamilyDetail({ currentUser, membersList: initialMembersList, onUpdateUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Track dynamically loaded state for updates
  const [membersList, setMembersList] = useState(initialMembersList);
  const [meId, setMeId] = useState('');
  const [imageError, setImageError] = useState('');

  // Sync state with props
  useEffect(() => {
    setMembersList(initialMembersList);
  }, [initialMembersList]);

  // Find the selected member from state
  const member = membersList.find((m) => m.id === id);

  if (!member) {
    return (
      <div className="pt-24 text-center">
        <p className="text-text-sub">구성원을 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/family')} className="mt-4 text-primary font-semibold hover:underline">
          가족 목록으로 돌아가기
        </button>
      </div>
    );
  }

  // Find relatives
  const spouse = membersList.find((m) => m.id === member.spouseId);
  const children = membersList.filter((m) => member.childIds && member.childIds.includes(m.id));
  const parents = membersList.filter((m) => member.parentIds && member.parentIds.includes(m.id));

  // Get active calculations if "me" is selected
  const me = membersList.find((m) => m.id === meId);
  const relationship = me ? getHonorific(me, member, membersList) : null;

  // Filter out the detail member from the "Me" dropdown list
  const otherMembersForMe = [...membersList]
    .filter((m) => m.id !== member.id)
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  const getCategoryLabel = (m) => {
    switch (m.category) {
      case 'generation2': return '직계 형제자매 (2세대)';
      case 'generation3': return '사촌 (3세대)';
      case 'generation4': return '자녀 세대 (4세대)';
      case 'spouse': return m.note || '배우자';
      default: return '가족';
    }
  };

  const isOwnProfile = currentUser && currentUser.id === member.id;
  const isAdmin = localStorage.getItem('hansfamily_admin_logged_in') === 'true';
  const canEditProfile = isOwnProfile || isAdmin;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setImageError('이미지 크기는 2MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      
      const updatedMember = { ...member, profileImage: base64String };

      try {
        const response = await fetch(`${API_URL}/api/members/${member.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedMember),
        });

        if (!response.ok) {
          throw new Error('Failed to update profile image on server');
        }

        const updatedMembers = membersList.map((m) => {
          if (m.id === member.id) {
            return updatedMember;
          }
          return m;
        });

        setMembersList(updatedMembers);
        setImageError('');
        
        // Notify App.jsx about the user profile change
        if (onUpdateUser) {
          onUpdateUser(updatedMember);
        }
      } catch (err) {
        setImageError('프로필 이미지를 저장할 수 없습니다.');
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/family')}
        className="flex items-center space-x-2 text-text-sub hover:text-primary transition-colors mb-6 font-medium text-sm group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>가족 목록으로</span>
      </button>

      {/* Main Detail Card */}
      <div className="bg-white border border-border-beige rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
        {/* Profile Info Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-border-beige/50 pb-6">
          <div className="relative group">
            {member.profileImage ? (
              <div className="w-20 h-20 rounded-full overflow-hidden border border-border-beige shadow-sm">
                <img
                  src={member.profileImage}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{ display: 'none' }} className="w-full h-full bg-primary/10 text-primary items-center justify-center font-bold text-3xl font-serif">
                  {member.name.charAt(0)}
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl font-serif">
                {member.name.charAt(0)}
              </div>
            )}
            
            {/* Own Profile / Admin Camera Overlay */}
            {canEditProfile && (
              <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary/95 text-white p-1.5 rounded-full cursor-pointer shadow-md hover:scale-105 transition-all">
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-text-main">{member.name}</h1>
                {isOwnProfile && (
                  <span className="bg-primary/15 text-primary text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Check size={10} /> 본인 프로필
                  </span>
                )}
                {isAdmin && !isOwnProfile && (
                  <span className="bg-accent/15 text-accent text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    관리자 권한
                  </span>
                )}
              </div>
              <span className="inline-block bg-secondary/50 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                {getCategoryLabel(member)}
              </span>
            </div>
            <p className="text-sm text-text-sub font-medium">
              성별: {member.gender === 'male' ? '남성' : member.gender === 'female' ? '여성' : '미확정'}
              {member.birthYear ? ` | 출생: ${member.birthYear}년생` : ''}
            </p>
            {member.note && (
              <p className="text-sm text-primary font-medium bg-primary/5 px-3 py-1.5 rounded-xl inline-block mt-1">
                📌 {member.note}
              </p>
            )}
            {isOwnProfile && (
              <p className="text-xs text-text-sub block mt-1.5">
                📷 오른쪽 아래 카메라 버튼을 누르면 나만의 고유 프로필 이미지를 등록/수정할 수 있습니다.
              </p>
            )}
            {imageError && (
              <div className="flex items-center gap-1 text-red-500 text-xs font-semibold mt-1">
                <AlertCircle size={12} />
                <span>{imageError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Family connections (Parents, Spouse, Children) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Parents */}
          <div className="bg-background/40 border border-border-beige/50 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-text-sub mb-2">부모</h3>
            {parents.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {parents.map((p) => (
                  <Link
                    key={p.id}
                    to={`/family/${p.id}`}
                    className="bg-white hover:bg-secondary/20 border border-border-beige px-3 py-1.5 rounded-xl text-sm font-medium text-text-main hover:text-primary transition-all duration-200"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-sub font-medium italic">부모 정보가 등록되지 않았습니다.</p>
            )}
          </div>

          {/* Spouse */}
          <div className="bg-background/40 border border-border-beige/50 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-text-sub mb-2">배우자</h3>
            {spouse ? (
              <Link
                to={`/family/${spouse.id}`}
                className="inline-block bg-white hover:bg-secondary/20 border border-border-beige px-3 py-1.5 rounded-xl text-sm font-medium text-text-main hover:text-primary transition-all duration-200"
              >
                {spouse.name} ({spouse.note || '배우자'})
              </Link>
            ) : (
              <p className="text-xs text-text-sub font-medium italic">배우자 정보가 없습니다.</p>
            )}
          </div>

          {/* Children */}
          <div className="bg-background/40 border border-border-beige/50 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-text-sub mb-2">자녀</h3>
            {children.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {children.map((c) => (
                  <Link
                    key={c.id}
                    to={`/family/${c.id}`}
                    className="bg-white hover:bg-secondary/20 border border-border-beige px-3 py-1.5 rounded-xl text-sm font-medium text-text-main hover:text-primary transition-all duration-200"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-sub font-medium italic">자녀 정보가 등록되지 않았습니다.</p>
            )}
          </div>
        </div>

        {/* Interactive "How to Call" Widget */}
        <div className="border-t border-border-beige/50 pt-8 space-y-6">
          <div className="flex items-center space-x-2 text-primary">
            <Sparkles size={20} />
            <h2 className="text-xl font-bold font-serif text-text-main">이 분과 나의 호칭 알아보기</h2>
          </div>

          <div className="bg-secondary/20 border border-border-beige/60 rounded-3xl p-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-text-sub uppercase mb-1.5">내가 누구인지 선택하세요</label>
              <select
                value={meId}
                onChange={(e) => setMeId(e.target.value)}
                className="w-full bg-white border border-border-beige rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main shadow-sm"
              >
                <option value="">나를 선택하세요</option>
                {otherMembersForMe.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.note ? `(${m.note})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {relationship ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-fade-in">
                {/* Me to Them */}
                <div className="bg-white border border-border-beige rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  <p className="text-xs font-semibold text-text-sub">내가 {member.name}님을 부를 때</p>
                  <p className="text-3xl font-bold text-primary font-serif">{relationship.aCallsB}</p>
                </div>

                {/* Them to Me */}
                <div className="bg-white border border-border-beige rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
                  <p className="text-xs font-semibold text-text-sub">{member.name}님이 나를 부를 때</p>
                  <p className="text-3xl font-bold text-accent font-serif">{relationship.bCallsA}</p>
                </div>

                {/* Explanation notes */}
                <div className="md:col-span-2 bg-white/70 border border-border-beige/40 rounded-xl px-4 py-3 text-xs text-text-sub flex items-start space-x-2">
                  <MessageCircle size={14} className="mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-text-main mr-1">관계 설명 ({relationship.relation}):</span>
                    {relationship.note}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-text-sub text-sm italic font-medium">
                위 목록에서 본인 이름을 선택하면 두 구성원 간의 양방향 정식 호칭이 여기에 표시됩니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
