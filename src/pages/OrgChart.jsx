import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredMembers } from '../utils/memberStorage';
import { getHonorific } from '../utils/getHonorific';
import styles from './OrgChart.module.css';

const GROUP_ORDER = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];

const GROUP_LABEL = {
  g1: '가족 1 (한기남 계열)',
  g2: '가족 2 · 맏이 (한위수 계열)',
  g3: '가족 3 (한옥수 계열)',
  g4: '가족 4 (한범윤 계열)',
  g5: '가족 5 (한필점 계열)',
  g6: '가족 6 (한정숙 계열)',
  g7: '가족 7 (한영수 계열)',
};

const INITIAL_CLASS = {
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

      {/* Result Panel */}
      {selected && (
        <div className={`${styles.resultPanel} bg-white border border-border-beige rounded-3xl p-6 shadow-md max-w-2xl mx-auto animate-fade-in`}>
          {!compareId ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
              <p className="text-sm text-text-sub font-medium">
                👉 <span className="font-bold text-primary">{selected.name}</span> 선택됨 — 호칭을 비교할 두 번째 가족 카드를 클릭하세요.
              </p>
              <button
                className="text-xs bg-secondary hover:bg-secondary/80 text-accent font-bold px-4 py-2 rounded-xl transition-all"
                onClick={() => { setSelected(null); setCompareId(null); }}
              >
                선택 해제
              </button>
            </div>
          ) : (
            <div className="space-y-6 w-full">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <div className="bg-background border border-border-beige rounded-2xl p-4 text-center flex-1 max-w-[240px] w-full">
                  <p className="text-xs text-text-sub font-semibold mb-1">{findById(compareId)?.name} ➜ {selected.name}</p>
                  <p className="text-2xl font-bold text-primary font-serif">{honorific?.aCallsB}</p>
                </div>
                <div className="text-2xl text-primary font-bold hidden sm:block">↔</div>
                <div className="bg-background border border-border-beige rounded-2xl p-4 text-center flex-1 max-w-[240px] w-full">
                  <p className="text-xs text-text-sub font-semibold mb-1">{selected.name} ➜ {findById(compareId)?.name}</p>
                  <p className="text-2xl font-bold text-accent font-serif">{honorific?.bCallsA}</p>
                </div>
              </div>
              <p className="text-xs text-text-sub text-center bg-background py-2 px-4 rounded-xl border border-border-beige/50 font-sans">
                🔍 <span className="font-bold text-text-main">관계:</span> {honorific?.relation} | {honorific?.note}
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  className="bg-primary hover:bg-primary/95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
                  onClick={() => navigate(`/search?from=${compareId}&target=${selected.id}`)}
                >
                  상세 보기 →
                </button>
                <button
                  className="border border-border-beige hover:bg-background text-text-sub text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                  onClick={() => { setSelected(null); setCompareId(null); }}
                >
                  다시 선택
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-text-sub bg-white border border-border-beige rounded-2xl py-3 px-6 shadow-sm max-w-xl mx-auto font-sans">
        {[
          { cls: styles.initialDirect, label: '직계 사촌' },
          { cls: styles.initialSpouse, label: '배우자' },
          { cls: styles.initialChild, label: '자녀' },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center space-x-1.5">
            <div className={`w-4 h-4 rounded-full ${cls}`} />
            <span>{label}</span>
          </div>
        ))}
        <div className="text-text-sub/50 hidden sm:block">|</div>
        <span className="text-text-sub font-medium">── 연결선: 혼인 관계</span>
      </div>

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
      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${initCls} ${small ? 'w-7 h-7 text-xs' : ''}`}>
        {member.name.charAt(0)}
      </div>
      <div className="space-y-0.5">
        <p className={`font-serif font-bold text-text-main ${small ? 'text-xs' : 'text-sm'}`}>{member.name}</p>
        {member.birthYear && <p className="text-[10px] text-text-sub/80">{member.birthYear}</p>}
        {member.note && <p className="text-[9px] text-primary font-medium truncate max-w-[70px]">{member.note}</p>}
      </div>
    </button>
  );
}
