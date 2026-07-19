import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredMembers } from '../utils/memberStorage';
import { getHonorific } from '../utils/getHonorific';
import styles from './OrgChart.module.css';

const GROUP_ORDER = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];

const GROUP_LABEL = {
  g1: '한기남 가족',
  g2: '한위수 가족',
  g3: '한옥수 가족',
  g4: '한범윤',
  g5: '한필점 가족',
  g6: '한정숙 가족',
  g7: '한영수 가족',
};

const INITIAL_CLASS = {
  generation1: styles.initialDirect,
  generation2: styles.initialDirect,
  generation3: styles.initialDirect,
  generation4: styles.initialChild,
  spouse: styles.initialSpouse,
};

export default function OrgChart() {
  const members = useMemo(() => getStoredMembers(), []);
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [compareId, setCompareId] = useState(null);

  const findById = (id) => members.find((m) => m.id === id);

  const gen1Grandfather = members.find((m) => m.id === 'gen1-1');
  const gen1Grandmother = members.find((m) => m.id === 'gen1-2');

  const honorific = selected && compareId
    ? getHonorific(findById(compareId), findById(selected.id), members)
    : null;

  // Group members classification (Gen 2 -> Gen 3 -> Gen 4 hierarchy)
  const groups = useMemo(() => {
    return GROUP_ORDER.map((gid) => {
      const directGen2 = members.find((m) => m.category === 'generation2' && m.groupId === gid);
      if (!directGen2) return null;
      const spouseGen2 = directGen2.spouseId ? findById(directGen2.spouseId) : null;
      
      const gen3Cousins = members.filter(m => m.category === 'generation3' && m.groupId === gid);
      const gen3Families = gen3Cousins.map(g3Direct => {
        const g3Spouse = g3Direct.spouseId ? findById(g3Direct.spouseId) : null;
        const g4Children = members.filter(m => m.category === 'generation4' && m.parentIds && m.parentIds.includes(g3Direct.id));
        return { g3Direct, g3Spouse, g4Children };
      }).sort((a, b) => (a.g3Direct.birthYear || 0) - (b.g3Direct.birthYear || 0));

      return { gid, directGen2, spouseGen2, gen3Families };
    }).filter(Boolean);
  }, [members]);

  const isHighlighted = (m) => selected?.id === m.id;
  const isCompare = (m) => compareId === m.id;

  return (
    <main className="pt-24 pb-16 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-serif text-text-main font-bold">가족 조직도</h1>
        <p className="text-text-sub text-sm sm:text-base leading-relaxed font-sans">
          카드를 클릭해 구성원을 선택하고, 두 번째 카드를 선택하면 상호 호칭을 실시간으로 확인할 수 있습니다.
        </p>
      </div>

      {/* Instructions Toast when only one person is selected */}
      {selected && !compareId && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-primary text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 animate-fade-in font-sans text-sm font-semibold">
          <span>👉 {selected.name} 선택됨 — 두 번째 가족 구성원 카드를 클릭하세요.</span>
          <button 
            onClick={() => { setSelected(null); setCompareId(null); }}
            className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-2.5 py-1 text-xs transition-colors"
          >
            취소
          </button>
        </div>
      )}

      {/* Result Modal Popup - Only triggers when BOTH are selected */}
      {selected && compareId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          {/* Backdrop click to dismiss */}
          <div className="absolute inset-0" onClick={() => { setSelected(null); setCompareId(null); }} />

          <div className={`${styles.resultPanel} relative bg-white border border-border-beige rounded-3xl p-6 sm:p-8 shadow-2xl max-w-xl w-full mx-auto animate-scale-up space-y-6 z-10`}>
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-border-beige/50 pb-3">
              <h3 className="font-serif font-bold text-lg text-text-main">
                호칭 비교 결과
              </h3>
              <button 
                onClick={() => { setSelected(null); setCompareId(null); }}
                className="text-text-sub hover:text-text-main p-1.5 rounded-lg hover:bg-background transition-colors text-sm font-semibold"
              >
                닫기
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                {/* Card A (Compare Target) */}
                <div className="bg-background border border-border-beige rounded-2xl p-5 text-center flex-1 w-full flex flex-col items-center gap-3">
                  {findById(compareId)?.profileImage ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-border-beige shadow-sm">
                      <img src={findById(compareId).profileImage} alt={findById(compareId).name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl font-serif">
                      {findById(compareId)?.name.charAt(0)}
                    </div>
                  )}
                  <p className="text-xs text-text-sub font-semibold">{findById(compareId)?.name} ➜ {selected.name}</p>
                  <p className="text-2xl font-bold text-primary font-serif">{honorific?.aCallsB}</p>
                </div>

                <div className="text-2xl text-primary font-bold hidden sm:block">↔</div>

                {/* Card B (Selected) */}
                <div className="bg-background border border-border-beige rounded-2xl p-5 text-center flex-1 w-full flex flex-col items-center gap-3">
                  {selected.profileImage ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-border-beige shadow-sm">
                      <img src={selected.profileImage} alt={selected.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-2xl font-serif">
                      {selected.name.charAt(0)}
                    </div>
                  )}
                  <p className="text-xs text-text-sub font-semibold">{selected.name} ➜ {findById(compareId)?.name}</p>
                  <p className="text-2xl font-bold text-accent font-serif">{honorific?.bCallsA}</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-text-sub text-center bg-background py-2 px-4 rounded-xl border border-border-beige/50 font-sans">
                🔍 <span className="font-bold text-text-main">관계:</span> {honorific?.relation} | {honorific?.note}
              </p>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  className="bg-primary hover:bg-primary/95 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-md"
                  onClick={() => navigate(`/search?from=${compareId}&target=${selected.id}`)}
                >
                  상세 보기 →
                </button>
                <button
                  className="border border-border-beige hover:bg-background text-text-sub text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition-all"
                  onClick={() => { setSelected(null); setCompareId(null); }}
                >
                  다시 선택하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-text-sub bg-white border border-border-beige rounded-2xl py-3 px-6 shadow-sm max-w-xl mx-auto font-sans">
        {[
          { cls: styles.initialDirect, label: '직계 구성원' },
          { cls: styles.initialSpouse, label: '배우자' },
          { cls: styles.initialChild, label: '자녀 세대' },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center space-x-1.5">
            <div className={`w-4 h-4 rounded-full ${cls}`} />
            <span>{label}</span>
          </div>
        ))}
        <div className="text-text-sub/50 hidden sm:block">|</div>
        <span className="text-text-sub font-medium">── 연결선: 혼인 관계</span>
      </div>

      {/* 1세대 조부모 Section */}
      {gen1Grandfather && gen1Grandmother && (
        <div className="bg-white border border-border-beige rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center gap-4 max-w-xl mx-auto text-center animate-fade-in relative z-10">
          <div className="absolute top-3 left-1/2 -translate-x-1/2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-sub bg-secondary/50 px-2.5 py-1 rounded-full whitespace-nowrap">
              1세대 조부모 (가족의 뿌리)
            </span>
          </div>
          <div className="flex items-center gap-4 pt-6">
            <MemberCard
              member={gen1Grandfather}
              selected={isHighlighted(gen1Grandfather)}
              compare={isCompare(gen1Grandfather)}
              onClick={() => onCardClick(gen1Grandfather, selected, setSelected, setCompareId)}
            />
            <span className="text-border-beige font-semibold">──</span>
            <MemberCard
              member={gen1Grandmother}
              selected={isHighlighted(gen1Grandmother)}
              compare={isCompare(gen1Grandmother)}
              onClick={() => onCardClick(gen1Grandmother, selected, setSelected, setCompareId)}
            />
          </div>
        </div>
      )}

      {/* Vertical connection line */}
      {gen1Grandfather && gen1Grandmother && (
        <div className="flex justify-center -my-6 z-0">
          <div className="w-px h-16 bg-border-beige" />
        </div>
      )}

      {/* Family Tree Groups */}
      <div className="space-y-12">
        {groups.map(({ gid, directGen2, spouseGen2, gen3Families }) => (
          <div
            key={gid}
            className={`bg-white border ${gid === 'g2' ? 'border-primary/80 ring-2 ring-primary/5' : 'border-border-beige'} rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center gap-6`}
          >
            {/* Gen 2 Header */}
            <div className="flex flex-col items-center space-y-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${gid === 'g2' ? 'text-primary' : 'text-text-sub'}`}>
                {GROUP_LABEL[gid]}
              </span>
              <div className="flex items-center gap-3">
                <MemberCard
                  member={directGen2}
                  selected={isHighlighted(directGen2)}
                  compare={isCompare(directGen2)}
                  onClick={() => onCardClick(directGen2, selected, setSelected, setCompareId)}
                />
                {spouseGen2 && (
                  <>
                    <span className="text-border-beige font-semibold">──</span>
                    <MemberCard
                      member={spouseGen2}
                      selected={isHighlighted(spouseGen2)}
                      compare={isCompare(spouseGen2)}
                      onClick={() => onCardClick(spouseGen2, selected, setSelected, setCompareId)}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Gen 3 and Gen 4 descendants */}
            {gen3Families.length > 0 && (
              <div className="w-full flex flex-col items-center border-t border-border-beige/40 pt-4">
                <div className="w-px h-6 bg-border-beige mb-4" />
                <div className="flex flex-wrap justify-center gap-8 w-full">
                  {gen3Families.map(({ g3Direct, g3Spouse, g4Children }, idx) => (
                    <div key={idx} className="flex flex-col items-center border border-border-beige/50 bg-background/20 rounded-2xl p-4 min-w-[200px] gap-3">
                      {/* Gen 3 Couple */}
                      <div className="flex items-center gap-2">
                        <MemberCard
                          member={g3Direct}
                          selected={isHighlighted(g3Direct)}
                          compare={isCompare(g3Direct)}
                          onClick={() => onCardClick(g3Direct, selected, setSelected, setCompareId)}
                          small
                        />
                        {g3Spouse && (
                          <>
                            <span className="text-border-beige text-xs">─</span>
                            <MemberCard
                              member={g3Spouse}
                              selected={isHighlighted(g3Spouse)}
                              compare={isCompare(g3Spouse)}
                              onClick={() => onCardClick(g3Spouse, selected, setSelected, setCompareId)}
                              small
                            />
                          </>
                        )}
                      </div>

                      {/* Gen 4 Children */}
                      {g4Children.length > 0 && (
                        <div className="w-full flex flex-col items-center pt-2 border-t border-border-beige/30">
                          <div className="w-px h-2.5 bg-border-beige mb-2" />
                          <div className="flex justify-center flex-wrap gap-1.5">
                            {g4Children.map((child) => (
                              <MemberCard
                                key={child.id}
                                member={child}
                                selected={isHighlighted(child)}
                                compare={isCompare(child)}
                                onClick={() => onCardClick(child, selected, setSelected, setCompareId)}
                                small
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

// Card click dual selection helper
function onCardClick(member, selected, setSelected, setCompareId) {
  if (!selected) {
    setSelected(member);
  } else if (selected.id === member.id) {
    setSelected(null);
    setCompareId(null);
  } else {
    setCompareId(member.id);
  }
}

// Reusable mini member card
function MemberCard({ member, selected, compare, onClick, small }) {
  const initCls = INITIAL_CLASS[member.category] || (member.category === 'spouse' ? styles.initialSpouse : styles.initialDirect);
  return (
    <button
      onClick={onClick}
      className={`bg-white border rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all text-center min-w-[76px] cursor-pointer ${
        selected ? 'border-primary ring-2 ring-primary/20 scale-[1.03] bg-primary/5' : 
        compare ? 'border-success ring-2 ring-success/20 scale-[1.03] bg-success/5' : 
        'border-border-beige hover:border-primary hover:-translate-y-0.5 hover:shadow-sm'
      } ${small ? 'min-w-[68px] p-2' : ''}`}
    >
      {member.profileImage ? (
        <div className={`rounded-full overflow-hidden border border-border-beige/50 w-9 h-9 ${small ? 'w-7 h-7' : ''}`}>
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
          <div style={{ display: 'none' }} className={`w-full h-full flex items-center justify-center font-bold text-sm ${initCls} ${small ? 'text-xs' : ''}`}>
            {member.name.charAt(0)}
          </div>
        </div>
      ) : (
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${initCls} ${small ? 'w-7 h-7 text-xs' : ''}`}>
          {member.name.charAt(0)}
        </div>
      )}
      <div className="space-y-0.5">
        <p className={`font-serif font-bold text-text-main ${small ? 'text-xs' : 'text-sm'}`}>{member.name}</p>
        <p className="text-[10px] text-text-sub/80">
          {member.birthYear ? `${member.birthYear} · ` : ''}{member.gender === 'male' ? '남' : '여'}
        </p>
        {member.note && <p className="text-[9px] text-primary font-medium truncate max-w-[70px]">{member.note}</p>}
      </div>
    </button>
  );
}
