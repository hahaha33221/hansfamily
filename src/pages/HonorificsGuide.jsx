import React, { useState } from 'react';
import { ChevronDown, BookOpen, AlertCircle, HelpCircle } from 'lucide-react';

export default function HonorificsGuide() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
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

      {/* Cousin Terms Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-text-main">1. 사촌 간 호칭 규칙</h2>
        <p className="text-text-sub text-sm">나와 상대방의 생년월일과 성별에 따라 결정되는 기본 호칭입니다.</p>
        
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
                <td className="p-4 text-text-sub">이름 + 아/야</td>
                <td className="p-4 text-text-sub">이름 + 아/야</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Spouse In-law Terms Table */}
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

      {/* Children Seniority Order */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-text-main">3. 자녀 세대 서열 및 생년</h2>
        <p className="text-text-sub text-sm">자녀 세대 간에는 출생 연도 서열에 따라 형/누나/오빠/언니 호칭을 씁니다.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: '지윤', age: '14세', year: '2012년생', tag: '최연장 자녀' },
            { name: '리원', age: '12세', year: '2014년생', tag: '둘째 자녀' },
            { name: '지유', age: '8세', year: '2018년생', tag: '셋째 자녀' },
            { name: '태완', age: '7세', year: '2019년생', tag: '넷째 자녀' },
            { name: '승윤', age: '6세', year: '2020년생', tag: '다섯째 자녀' },
            { name: '정윤', age: '6세', year: '2020년생', tag: '동갑내기 자녀' },
            { name: '홍서아', age: '0세', year: '2026년생', tag: '막내 영아' },
          ].map((child, idx) => (
            <div key={idx} className="bg-white border border-border-beige rounded-2xl p-4 shadow-sm text-center">
              <div className="text-xs font-semibold text-primary uppercase mb-1">{child.tag}</div>
              <div className="text-lg font-bold text-text-main font-serif">{child.name}</div>
              <div className="text-xs text-text-sub mt-1">{child.year} ({child.age})</div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Cases Info Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-text-main">4. 특수 예외 상황 및 상식</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-border-beige rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-primary font-bold">
              <AlertCircle size={20} />
              <h3 className="font-serif text-lg">동갑내기 사촌 간 호칭</h3>
            </div>
            <p className="text-text-sub text-sm leading-relaxed">
              사촌 관계에서 나이가 같을 때는 일반적으로 "이름+아/야"를 쓰며 친구처럼 편히 지냅니다. 다만, 격식 있는 자리나 어른들 앞에서는 상호 존중하거나 배우자들의 서열을 섞어 부르는 경우도 있습니다.
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

      {/* FAQ Accordion */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-text-main">5. 자주 묻는 질문 (FAQ)</h2>
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
