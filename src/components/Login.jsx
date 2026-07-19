import React, { useState } from 'react';
import { LogIn, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login({ members, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    const foundMember = members.find(
      (m) => m.username === username.trim() && m.password === password.trim()
    );

    if (foundMember) {
      onLoginSuccess(foundMember);
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-border-beige rounded-3xl p-6 sm:p-10 shadow-xl">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
            <LogIn size={28} />
          </div>
          <h2 className="text-3xl font-serif text-text-main font-bold">가족 로그인</h2>
          <p className="text-text-sub text-xs">
            한스패밀리 구성원 고유 아이디와 비밀번호를 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-text-sub uppercase mb-1.5">
                아이디 (ID)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-sub">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  placeholder="예: hans_gilsang"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-background border border-border-beige rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main placeholder-text-sub text-sm"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-text-sub uppercase mb-1.5">
                비밀번호 (Password)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-sub">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border-beige rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-text-main placeholder-text-sub text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-sub hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start space-x-2 text-red-600 text-xs font-semibold">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/95 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <span>로그인</span>
            </button>
          </div>
        </form>

        <div className="text-center border-t border-border-beige/50 pt-4 mt-6">
          <p className="text-[11px] text-text-sub">
            💡 아이디와 패스워드는 <span className="font-semibold">hans_이름영문</span> 및 <span className="font-semibold">hans생년월일(4자리)</span>로 초기 설정되어 있습니다.<br />
            (예: 한길상 ➡️ ID: <code className="bg-background px-1 py-0.5 rounded font-mono">hans_gilsang</code> / PW: <code className="bg-background px-1 py-0.5 rounded font-mono">hans1923</code>)
          </p>
        </div>
      </div>
    </div>
  );
}
