import React, { useState, useMemo } from 'react';
import { ChevronDown, BookOpen, AlertCircle, HelpCircle } from 'lucide-react';
import { getStoredMembers } from '../utils/memberStorage';

export default function HonorificsGuide() {
  const [openFaq, setOpenFaq] = useState(null);
  const members = useMemo(() => getStoredMembers(), []);
  const currentYear = 2026;

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const childrenList = useMemo(() => {
    return members
      .filter((m) => m.category === 'generation4')
      .sort((a, b) => {
        if (a.birthYear !== b.birthYear) {
          return (a.birthYear || 0) - (b.birthYear || 0);
        }
        const idNumA = parseInt(a.id.replace('d', ''), 10);
        const idNumB = parseInt(b.id.replace('d', ''), 10);
        return idNumA - idNumB;
      });
  }, [members]);

  const getRankTag = (idx, total) => {
    if (idx === 0) return "첫째 (최연장)";
    if (idx === total - 1) return "막내 (최연소)";
    const ranks = ["첫째", "둘째", "셋째", "넷째", "다섯째", "여섯째", "일곱째", "여덟째", "아홉째", "열째", "열한째", "열두째"];
    return `${ranks[idx]} 자녀`;
  };

  const faqs = [
    {
      q: '사촌인데 동갑인 경우는 어떻게 부르나요?',
      a: '사촌 간에 출생 연도가 같은 동갑내기인 경우, 보통은 호칭 대신 이름을 부르며 말을 편하게 놓습니다. (예: "성재야", "현주야"). 그러나 한쪽이 배우자(형수, 제수 등)인 경우는 나이와 관계없이 촌수 서열을 존중하여 부르는 것이 전통 예절입니다.',
    },
    {
      q: '나보다 나이가 많은 사촌 동생의 아내는 어떻게 부르나요?',
      a: '나보다 나이가 많더라도 사촌동생(손아래)의 아내이므로 전통적으로는 "제수씨" 또는 "올케"라고 부릅니다. 다만 실제 나이가 나보다 많아 껄끄러운 경우, 상호 존중하여 "~씨"를 붙이거나 서로 존댓말을 사용하는 방식으로 절충합니다.',
    },
    {
      q: '항렬과 나이가 역전된 경우는 어떻게 하나요?',
      a: '나이가 많은 오촌 조카와 나이가 어린 삼촌(당숙)처럼 항렬과 나이가 역전되는 경우가 있습니다. 이 경우 전통적으로는 삼촌에게 존칭을 쓰고 조카에게 낮춤말을 쓰지만, 현대 가족 모임에서는 서로 존중하는 의미에서 존댓말을 섞어 쓰며 상황에 맞게 유연하게 대화하는 추세입니다.',
    },
    {
      q: '배우자의 가족을 부르는 호칭이 너무 헷갈립니다.',
      a: '남편 기준 사촌의 아내(사촌 형수/제수) 혹은 아내 기준 사촌의 남편(사촌 형부/제부) 등 배우자의 촌수를 계산할 때 가장 좋은 팁은 "배우자의 기준에 맞추는 것"입니다. 배우자가 부르는 호칭에 맞춰 짝을 이뤄 부르면 한결 쉽습니다.',
    },
  ];

  return (
    <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto sm:px-6 lg:px-8 space-y-12">
      {/* Introduction */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 text-primary font-bold">
          <BookOpen size={22} />
          <span className="font-serif">호칭 가이드</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-text-main font-bold">
          한국의 가족 호칭, 왜 이렇게 복잡할까요?
        </h1>
        <p className="text-text-sub text-sm sm:text-base leading-relaxed">
          한국의 가족 호칭 체계는 부르는 사람의 성별, 상대방의 성별, 손위/손아래 여부, 그리고 배우자 관계에 따라 세분화되어 있습니다. 복잡해 보이지만 몇 가지 주요 규칙만 이해하면 쉽게 다가갈 수 있습니다.
        </p>
      </div>

      <div className="border-b border-border-beige/50" />

      {/* 1. Cousin Terms Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-text-main">1. 사촌 간 호칭 규칙</h2>
        <p className="text-text-sub text-sm">나와 상대방의 생년월일과 성별에 따라 결정되는 기본 호칭입니다. (동갑내기는 편하게 이름을 부릅니다.)</p>
        
        <div className="overflow-x-auto border border-border-beige rounded-2xl shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-white font-serif">
                <th className="p-4 border-b border-border-beige">구분</th>
                <th className="p-4 border-b border-border-beige">내가 남성인 경우</th>
                <th className="p-4 border-b border-border-beige">내가 여성인 경우</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-beige">
              <tr className="bg-white hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-semibold text-text-main">나보다 손위 남성</td>
                <td className="p-4 text-text-sub">형</td>
                <td className="p-4 text-text-sub">오빠</td>
              </tr>
              <tr className="bg-secondary/15 hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-semibold text-text-main">나보다 손위 여성</td>
                <td className="p-4 text-text-sub">누나</td>
                <td className="p-4 text-text-sub">언니</td>
              </tr>
              <tr className="bg-white hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-semibold text-text-main">나보다 손아래 구성원</td>
                <td className="p-4 text-text-sub">이름 + 아/야 (성씨 제외, 예: 재호야)</td>
                <td className="p-4 text-text-sub">이름 + 아/야 (성씨 제외, 예: 성임아)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Spouse In-law Terms Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-text-main">2. 사촌의 배우자 호칭 규칙</h2>
        <p className="text-text-sub text-sm">사촌 형제자매가 결혼하여 새로 가족이 된 분들을 부르는 호칭입니다.</p>

        <div className="overflow-x-auto border border-border-beige rounded-2xl shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-white font-serif">
                <th className="p-4 border-b border-border-beige">대상</th>
                <th className="p-4 border-b border-border-beige">내가 남성인 경우</th>
                <th className="p-4 border-b border-border-beige">내가 여성인 경우</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-beige">
              <tr className="bg-white hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-semibold text-text-main">손위 사촌의 아내</td>
                <td className="p-4 text-text-sub">형수님</td>
                <td className="p-4 text-text-sub">새언니</td>
              </tr>
              <tr className="bg-secondary/15 hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-semibold text-text-main">손아래 사촌의 아내</td>
                <td className="p-4 text-text-sub">제수씨</td>
                <td className="p-4 text-text-sub">올케</td>
              </tr>
              <tr className="bg-white hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-semibold text-text-main">손위 사촌의 남편</td>
                <td className="p-4 text-text-sub">매형</td>
                <td className="p-4 text-text-sub">형부</td>
              </tr>
              <tr className="bg-secondary/15 hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-semibold text-text-main">손아래 사촌의 남편</td>
                <td className="p-4 text-text-sub">매제</td>
                <td className="p-4 text-text-sub">제부</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Dongseo Terms Table (배우자 간 관계) */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-text-main">3. 동서 간 호칭 규칙 (배우자 간 관계)</h2>
        <p className="text-text-sub text-sm">형제자매 또는 사촌의 배우자들끼리 서로를 부르는 호칭입니다.</p>

        <div className="overflow-x-auto border border-border-beige rounded-2xl shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-white font-serif">
                <th className="p-4 border-b border-border-beige">구분</th>
                <th className="p-4 border-b border-border-beige">내가 여성(아내)인 경우</th>
                <th className="p-4 border-b border-border-beige">내가 남성(남편)인 경우</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-beige">
              <tr className="bg-white hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-semibold text-text-main">나보다 손위 배우자 (남편의 형의 아내 / 아내의 언니의 남편)</td>
                <td className="p-4 text-text-sub">형님</td>
                <td className="p-4 text-text-sub">형님</td>
              </tr>
              <tr className="bg-secondary/15 hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-semibold text-text-main">나보다 손아래 배우자 (남편의 동생의 아내 / 아내의 동생의 남편)</td>
                <td className="p-4 text-text-sub">동서</td>
                <td className="p-4 text-text-sub">동서</td>
              </tr>
              <tr className="bg-white hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-semibold text-text-main">성별이 다른 동서 관계 (남편의 누이의 남편 / 아내의 형제의 아내)</td>
                <td className="p-4 text-text-sub">서로 존칭 (~씨)</td>
                <td className="p-4 text-text-sub">서로 존칭 (~씨)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Grandparent & Great-Grandparent Terms Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-text-main">4. 조부모 및 증조부모 호칭 규칙</h2>
        <p className="text-text-sub text-sm">가계 항렬에 따른 조부모 및 증조부모 세대를 부르는 호칭입니다.</p>

        <div className="overflow-x-auto border border-border-beige rounded-2xl shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-white font-serif">
                <th className="p-4 border-b border-border-beige">관계구분</th>
                <th className="p-4 border-b border-border-beige">상대방이 남성인 경우</th>
                <th className="p-4 border-b border-border-beige">상대방이 여성인 경우</th>
                <th className="p-4 border-b border-border-beige">조부모가 나를 부를 때</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-beige">
              <tr className="bg-white hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-semibold text-text-main">2대 차이 직계 (조부모 ↔ 손자녀)</td>
                <td className="p-4 text-text-sub">할아버지</td>
                <td className="p-4 text-text-sub">할머니</td>
                <td className="p-4 text-text-sub">이름 + 아/야 (성씨 제외, 예: 태완아, 동우야)</td>
              </tr>
              <tr className="bg-secondary/15 hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-semibold text-text-main">3대 차이 직계 (증조부모 ↔ 증손자녀)</td>
                <td className="p-4 text-text-sub">증조할아버지</td>
                <td className="p-4 text-text-sub">증조할머니</td>
                <td className="p-4 text-text-sub">이름 + 아/야 (성씨 제외, 예: 서아야)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Parents & In-laws Terms Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-text-main">5. 부모-자식 및 직계 사위·며느리 호칭 규칙</h2>
        <p className="text-text-sub text-sm">부모와 자식 관계, 그리고 배우자의 부모님(시부모/장인·장모)과의 호칭입니다.</p>

        <div className="overflow-x-auto border border-border-beige rounded-2xl shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-white font-serif">
                <th className="p-4 border-b border-border-beige">관계 대상</th>
                <th className="p-4 border-b border-border-beige">내가 어른(부모)을 부를 때</th>
                <th className="p-4 border-b border-border-beige">어른(부모)이 나를 부를 때</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-beige">
              <tr className="bg-white hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-semibold text-text-main">직계 부모 ↔ 자식</td>
                <td className="p-4 text-text-sub">엄마 / 아빠</td>
                <td className="p-4 text-text-sub">이름 + 아/야 (성씨 제외, 예: 재호야, 은희야)</td>
              </tr>
              <tr className="bg-secondary/15 hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-semibold text-text-main">시부모 ↔ 며느리</td>
                <td className="p-4 text-text-sub">아버님 / 어머님</td>
                <td className="p-4 text-text-sub">아가 / 새아기</td>
              </tr>
              <tr className="bg-white hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-semibold text-text-main">장인·장모 ↔ 사위</td>
                <td className="p-4 text-text-sub">장인어른 / 장모님</td>
                <td className="p-4 text-text-sub">이름 + 서방 (성씨 제외, 예: 명종 서방, 용하 서방)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Uncles & Aunts Terms Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-text-main">6. 2세대 ↔ 3세대 간 친척(삼촌/고모/이모/외삼촌) 호칭 규칙</h2>
        <p className="text-text-sub text-sm">부모의 형제자매 및 그 배우자와 조카 간의 호칭입니다.</p>

        <div className="overflow-x-auto border border-border-beige rounded-2xl shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-white font-serif">
                <th className="p-4 border-b border-border-beige">구분 (친가/외가)</th>
                <th className="p-4 border-b border-border-beige">직계 어른</th>
                <th className="p-4 border-b border-border-beige">배우자 어른</th>
                <th className="p-4 border-b border-border-beige">조카(3세대) 및 그 배우자 호칭</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-beige">
              <tr className="bg-white hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-semibold text-text-main" rowSpan="2">친가 (아버지의 형제자매)</td>
                <td className="p-4 text-text-sub">큰아버지 (아버지보다 연상) / 작은아버지 (아버지보다 연하)</td>
                <td className="p-4 text-text-sub">큰어머니 / 작은어머니</td>
                <td className="p-4 text-text-sub" rowSpan="4">
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="font-semibold text-text-main">조카 직접 호출:</p>
                      <p className="text-text-sub">이름 + 아/야 (성씨 제외, 예: 은희야, 창신아)</p>
                    </div>
                    <div className="border-t border-border-beige/50 pt-2">
                      <p className="font-semibold text-text-main">조카 배우자 호출:</p>
                      <p className="text-text-sub">남성: 이름 + 서방 (예: 명종 서방)</p>
                      <p className="text-text-sub">여성: 새아기</p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="bg-white hover:bg-secondary/10 transition-colors">
                <td className="p-4 text-text-sub">고모</td>
                <td className="p-4 text-text-sub">고모부</td>
              </tr>
              <tr className="bg-secondary/15 hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-semibold text-text-main" rowSpan="2">외가 (어머니의 형제자매)</td>
                <td className="p-4 text-text-sub">외삼촌</td>
                <td className="p-4 text-text-sub">외숙모</td>
              </tr>
              <tr className="bg-secondary/15 hover:bg-secondary/20 transition-colors">
                <td className="p-4 text-text-sub">이모</td>
                <td className="p-4 text-text-sub">이모부</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-background border border-border-beige/50 rounded-2xl p-4 text-xs space-y-2 text-text-sub">
          <p className="font-bold text-text-main">💡 조카의 배우자가 나를 부를 때:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-primary">아내 기준 (남편의 친척 어른):</p>
              <p>시삼촌(시숙), 시고모, 시외삼촌, 시이모, 시숙모, 시고모부, 시외숙모, 시이모부</p>
            </div>
            <div>
              <p className="font-semibold text-primary">남편 기준 (아내의 친척 어른):</p>
              <p>처삼촌, 처고모, 처외삼촌, 처이모, 처숙모, 처고모부, 처외숙모, 처이모부</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Gen3 ↔ Gen4 Terms Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-text-main">7. 3세대 ↔ 4세대 간 호칭 규칙</h2>
        <p className="text-text-sub text-sm">3세대 부모의 사촌 형제자매(5촌 관계)와 4세대 자녀 간의 호칭입니다.</p>

        <div className="overflow-x-auto border border-border-beige rounded-2xl shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-white font-serif">
                <th className="p-4 border-b border-border-beige">관계 구분</th>
                <th className="p-4 border-b border-border-beige">4세대 자녀가 부를 때</th>
                <th className="p-4 border-b border-border-beige">3세대 어른이 부를 때</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-beige">
              <tr className="bg-white hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-semibold text-text-main">3촌 관계 (부모의 형제자매 및 배우자)</td>
                <td className="p-4 text-text-sub">삼촌, 고모, 이모, 외삼촌, 숙모, 이모부 등 (위 세대 테이블 참고)</td>
                <td className="p-4 text-text-sub" rowSpan="2">이름 + 아/야 (성씨 제외, 예: 태완아, 정운아)</td>
              </tr>
              <tr className="bg-secondary/15 hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-semibold text-text-main">5촌 관계 (부모의 사촌 형제자매 및 배우자)</td>
                <td className="p-4 text-text-sub">
                  <div className="space-y-1">
                    <p>남성 친척: 아저씨 (당숙)</p>
                    <p>여성 친척: 아주머니 (당고모)</p>
                    <p>친척의 아내: 아주머니 (당숙모)</p>
                    <p>친척의 남편: 아저씨 (당고모부)</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Children Seniority Order */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-text-main">8. 자녀 세대 서열 및 생년</h2>
        <p className="text-text-sub text-sm">자녀 세대 간에는 출생 연도 서열에 따라 형/누나/오빠/언니 호칭을 씁니다. ({childrenList.length}명 등록됨)</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {childrenList.map((child, idx) => {
            const age = child.birthYear ? currentYear - child.birthYear : 0;
            return (
              <div key={child.id} className="bg-white border border-border-beige rounded-2xl p-4 shadow-sm text-center hover:border-primary hover:-translate-y-0.5 transition-all duration-300">
                <div className="text-xs font-semibold text-primary uppercase mb-1">
                  {getRankTag(idx, childrenList.length)}
                </div>
                <div className="text-lg font-bold text-text-main font-serif">{child.name}</div>
                <div className="text-xs text-text-sub mt-1">
                  {child.birthYear}년생 ({age === 0 ? '영아' : `${age}세`}) · {child.gender === 'male' ? '남성' : '여성'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 9. Special Cases Info Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-text-main">9. 특수 예외 상황 및 상식</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-border-beige rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-primary font-bold">
              <AlertCircle size={20} />
              <h3 className="font-serif text-lg">동갑내기 사촌 간 호칭</h3>
            </div>
            <p className="text-text-sub text-sm leading-relaxed">
              사촌 관계에서 나이가 같을 때는 일반적으로 성씨를 제외한 "이름+아/야"를 쓰며 친구처럼 편히 지냅니다. 다만, 격식 있는 자리나 어른들 앞에서는 상호 존중하거나 배우자들의 서열을 고려해 조심스럽게 부르는 경우도 있습니다.
            </p>
          </div>

          <div className="bg-white border border-border-beige rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-primary font-bold">
              <AlertCircle size={20} />
              <h3 className="font-serif text-lg">항렬과 실제 나이의 역전</h3>
            </div>
            <p className="text-text-sub text-sm leading-relaxed">
              나이가 조카보다 어린 삼촌이나, 반대로 나이가 삼촌보다 많은 조카가 존재할 수 있습니다. 뼈대 있는 집안일수록 항렬 서열을 맞추지만, 일상적인 대가족 만남에서는 무리하게 서열을 강요하기보다 서로 높임말을 쓰고 배려하는 편입니다.
            </p>
          </div>
        </div>
      </div>

      {/* 10. FAQ Accordion */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-text-main">10. 자주 묻는 질문 (FAQ)</h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="bg-white border border-border-beige rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center px-5 py-4 text-left focus:outline-none hover:bg-secondary/10 transition-colors"
                >
                  <div className="flex items-center space-x-3 text-text-main">
                    <HelpCircle size={18} className="text-primary flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-base font-serif">{faq.q}</span>
                  </div>
                  <ChevronDown
                      size={18}
                      className={`text-text-sub transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-60 border-t border-border-beige/50' : 'max-h-0'
                  }`}
                >
                  <div className="px-5 py-4 text-sm text-text-sub leading-relaxed bg-background/30">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
