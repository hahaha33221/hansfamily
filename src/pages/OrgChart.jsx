import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredMembers } from '../utils/memberStorage';
import { getHonorific } from '../utils/getHonorific';
import styles from './OrgChart.module.css';

const GROUP_ORDER = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'];

const GROUP_LABEL = {
  g1: '가족 1 (김흥만)',
  g2: '가족 2 · 맏이 (한창신)',
  g3: '가족 3 (한성임)',
  g4: '가족 4 (한성재)',
  g5: '가족 5 (한현주)',
  g6: '가족 6 (설영은)',
  g7: '가족 7 (한성학)',
  g8: '가족 8 (한석란)',
};

const INITIAL_CLASS = {
  direct: styles.initialDirect,
  spouse: styles.initialSpouse,
  child: styles.initialChild,
  single: styles.initialSingle,
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

  // Group members classification
  const groups = GROUP_ORDER.map((gid) => {
    const direct = members.find((m) => m.category === 'direct' && m.groupId === gid);
    if (!direct) return null;
    const spouse = direct.spouseId ? findById(direct.spouseId) : null;
    const children = direct.childIds?.map(findById).filter(Boolean) || [];
    return { gid, direct, spouse, children };
  }).filter(Boolean);

  const singles = members.filter((m) => m.category === 'single');

  const isHighlighted = (m) => selected?.id === m.id;
  const isCompare = (m) => compareId === m.id;

  return (
    <main className="pt-24 pb-16 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-serif text-text-main font-bold">가족 조직도</h1>
        <p className="text-text-sub text-sm sm:text-base leading-relaxed">
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
              <p className="text-xs text-text-sub text-center bg-background py-2 px-4 rounded-xl border border-border-beige/50">
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
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-text-sub bg-white border border-border-beige rounded-2xl py-3 px-6 shadow-sm max-w-xl mx-auto">
        {[
          { cls: styles.initialDirect, label: '직계 사촌' },
          { cls: styles.initialSpouse, label: '배우자' },
          { cls: styles.initialChild, label: '자녀' },
          { cls: styles.initialSingle, label: '미혼' },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center space-x-1.5">
            <div className={`w-4 h-4 rounded-full ${cls}`} />
            <span>{label}</span>
          </div>
        ))}
        <div className="text-text-sub/50 hidden sm:block">|</div>
        <span className="text-text-sub font-medium">── 연결선: 혼인 관계</span>
      </div>

      {/* Groups Layout */}
      <div className="flex flex-wrap justify-center gap-6">
        {groups.map(({ gid, direct, spouse, children }) => (
          <div
            key={gid}
            className={`bg-white border ${gid === 'g2' ? 'border-primary/80 ring-2 ring-primary/10' : 'border-border-beige'} rounded-3xl p-5 shadow-sm flex flex-col items-center gap-4 transition-all hover:shadow-md`}
          >
            <p className={`text-xs font-bold uppercase tracking-wider ${gid === 'g2' ? 'text-primary' : 'text-text-sub'}`}>
              {GROUP_LABEL[gid]}
            </p>

            {/* Direct & Spouse Couple Row */}
            <div className="flex items-center gap-3">
              <MemberCard
                member={direct}
                selected={isHighlighted(direct)}
                compare={isCompare(direct)}
                onClick={() => onCardClick(direct, selected, setSelected, setCompareId)}
              />
              {spouse && (
                <>
                  <span className="text-border-beige font-semibold">──</span>
                  <MemberCard
                    member={spouse}
                    selected={isHighlighted(spouse)}
                    compare={isCompare(spouse)}
                    onClick={() => onCardClick(spouse, selected, setSelected, setCompareId)}
                  />
                </>
              )}
            </div>

            {/* Children Row */}
            {children.length > 0 && (
              <div className="w-full space-y-3 pt-2 border-t border-border-beige/40 flex flex-col items-center">
                <div className="w-px h-3 bg-border-beige" />
                <div className="flex justify-center flex-wrap gap-2.5">
                  {children.map((child) => (
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

      {/* Singles Section */}
      {singles.length > 0 && (
        <div className="space-y-4 max-w-4xl mx-auto pt-6">
          <div className="flex items-center gap-4">
            <div className="h-px bg-border-beige flex-1" />
            <span className="text-sm font-bold text-text-sub font-serif">미혼 사촌 ({singles.length}명)</span>
            <div className="h-px bg-border-beige flex-1" />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {singles.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                selected={isHighlighted(m)}
                compare={isCompare(m)}
                onClick={() => onCardClick(m, selected, setSelected, setCompareId)}
              />
            ))}
          </div>
        </div>
      )}
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
  const initCls = INITIAL_CLASS[member.category] || styles.initialDirect;
  return (
    <button
      onClick={onClick}
      className={`bg-white border rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all text-center min-w-[76px] cursor-pointer ${
        selected ? 'border-primary ring-2 ring-primary/20 scale-[1.03] bg-primary/5' : 
        compare ? 'border-success ring-2 ring-success/20 scale-[1.03] bg-success/5' : 
        'border-border-beige hover:border-primary hover:-translate-y-0.5 hover:shadow-sm'
      } ${small ? 'min-w-[68px] p-2.5' : ''}`}
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
