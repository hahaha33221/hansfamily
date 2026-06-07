import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, RotateCcw, Share2, Sparkles, Check, ChevronRight } from 'lucide-react';
import { getStoredMembers } from '../utils/memberStorage';
import { getHonorific } from '../utils/getHonorific';

export default function HonorificsSearch() {
  const membersData = useMemo(() => getStoredMembers(), []);
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [me, setMe] = useState(null);
  const [other, setOther] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fromId = searchParams.get('from');
    const targetId = searchParams.get('target');
    if (fromId && targetId) {
      const fromMember = membersData.find((m) => m.id === fromId);
      const targetMember = membersData.find((m) => m.id === targetId);
      if (fromMember && targetMember) {
        setMe(fromMember);
        setOther(targetMember);
        setStep(3);
      }
    }
  }, [searchParams, membersData]);



  const handleSelectMe = (member) => {
    setMe(member);
    setStep(2);
  };

  const handleSelectOther = (member) => {
    setOther(member);
    setStep(3);
  };

  const handleReset = () => {
    setMe(null);
    setOther(null);
    setStep(1);
    setCopied(false);
  };

  const getResult = () => {
    if (!me || !other) return null;
    return getHonorific(me, other, membersData);
  };

  const handleShare = () => {
    const res = getResult();
    if (!res) return;
    const shareText = `[가족 호칭 안내]\n${me.name} → ${other.name} (${res.relation})\n- 내가 부를 때: ${res.aCallsB}\n- 상대방이 나를 부를 때: ${res.bCallsA}\n- 설명: ${res.note}`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const result = getResult();

  return (
    <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto sm:px-6 lg:px-8">
      {/* Wizard Steps indicator */}
      <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-10 text-xs sm:text-sm font-semibold">
        <div className={`flex items-center space-x-1.5 ${step >= 1 ? 'text-primary' : 'text-text-sub'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary text-white' : 'border-border-beige text-text-sub'}`}>1</div>
          <span>나 선택</span>
        </div>
        <ChevronRight size={16} className="text-text-sub/50" />
        <div className={`flex items-center space-x-1.5 ${step >= 2 ? 'text-primary' : 'text-text-sub'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary text-white' : 'border-border-beige text-text-sub'}`}>2</div>
          <span>상대방 선택</span>
        </div>
        <ChevronRight size={16} className="text-text-sub/50" />
        <div className={`flex items-center space-x-1.5 ${step >= 3 ? 'text-primary' : 'text-text-sub'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-primary bg-primary text-white' : 'border-border-beige text-text-sub'}`}>3</div>
          <span>호칭 결과</span>
        </div>
      </div>

      {/* Step 1: Select Me */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-main font-serif">나는 누구인가요?</h2>
            <p className="text-text-sub text-sm">먼저 본인의 이름을 선택해주세요.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...membersData]
              .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
              .map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMe(m)}
                  className="bg-white border border-border-beige hover:border-primary hover:bg-secondary/10 px-4 py-3.5 rounded-2xl text-sm font-semibold text-text-main hover:text-primary transition-all duration-200 text-center shadow-sm"
                >
                  {m.name}
                  {m.note && <span className="block text-[10px] text-text-sub font-normal mt-0.5">{m.note}</span>}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Other */}
      {step === 2 && me && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-main font-serif">상대방은 누구인가요?</h2>
            <p className="text-text-sub text-sm">
              호칭을 알고 싶은 가족을 선택해주세요. (선택한 나: <span className="font-bold text-primary">{me.name}</span>)
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...membersData]
              .filter((m) => m.id !== me.id)
              .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
              .map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectOther(m)}
                  className="bg-white border border-border-beige hover:border-primary hover:bg-secondary/10 px-4 py-3.5 rounded-2xl text-sm font-semibold text-text-main hover:text-primary transition-all duration-200 text-center shadow-sm"
                >
                  {m.name}
                  {m.note && <span className="block text-[10px] text-text-sub font-normal mt-0.5">{m.note}</span>}
                </button>
              ))}
          </div>
          <div className="text-center pt-4">
            <button onClick={handleReset} className="text-xs text-text-sub hover:text-primary underline">
              처음으로 돌아가기
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results Display */}
      {step === 3 && me && other && result && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="bg-white border border-border-beige rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 relative overflow-hidden">
            {/* Header branding */}
            <div className="flex justify-between items-center border-b border-border-beige/50 pb-4">
              <span className="font-serif font-bold text-lg text-text-main">호칭 매칭 결과</span>
              <div className="flex items-center space-x-1 text-primary text-xs font-bold bg-primary/10 px-3 py-1 rounded-full">
                <Sparkles size={12} />
                <span>{result.relation}</span>
              </div>
            </div>

            {/* Names relationship */}
            <div className="text-center">
              <span className="text-xl font-bold font-serif text-text-main">{me.name}</span>
              <span className="text-text-sub mx-3">→</span>
              <span className="text-xl font-bold font-serif text-text-main">{other.name}</span>
            </div>

            {/* Symmetrical outputs */}
            <div className="space-y-4">
              {/* Me calls Them */}
              <div className="bg-secondary/20 border-l-4 border-primary rounded-2xl p-5 sm:p-6 space-y-2">
                <p className="text-xs font-bold text-text-sub">
                  내가 {other.name}님을 부를 때:
                </p>
                <h3 className="text-3xl sm:text-5xl font-extrabold text-primary font-serif leading-none tracking-tight py-1">
                  {result.aCallsB}
                </h3>
              </div>

              {/* Them calls Me */}
              <div className="bg-background border-l-4 border-accent rounded-2xl p-5 sm:p-6 space-y-2">
                <p className="text-xs font-bold text-text-sub">
                  {other.name}님이 나를 부를 때:
                </p>
                <h3 className="text-3xl sm:text-5xl font-extrabold text-accent font-serif leading-none tracking-tight py-1">
                  {result.bCallsA}
                </h3>
              </div>
            </div>

            {/* Relationship Note */}
            {result.note && (
              <div className="bg-background/50 border border-border-beige rounded-xl p-4 text-xs sm:text-sm text-text-sub">
                💡 <span className="font-semibold text-text-main">관계 정보:</span> {result.note}
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-4 border-t border-border-beige/50 pt-6">
              <button
                onClick={handleShare}
                className="flex items-center justify-center space-x-2 bg-secondary text-accent hover:bg-secondary/80 font-bold py-3.5 rounded-xl transition-all duration-300 shadow-sm"
              >
                {copied ? <Check size={18} className="text-success" /> : <Share2 size={18} />}
                <span>{copied ? '복사 완료!' : '결과 복사'}</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center justify-center space-x-2 bg-primary text-white hover:bg-primary/95 font-bold py-3.5 rounded-xl transition-all duration-300 shadow-md"
              >
                <RotateCcw size={18} />
                <span>다시 찾기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
