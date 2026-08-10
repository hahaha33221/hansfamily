import React, { useState } from 'react';
import { LogIn, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';

export default function Login({ members, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.user);
      } else {
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('서버와 통신할 수 없습니다.');
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
                  placeholder="예: 한길상"
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
                  placeholder="비밀번호 입력 (hans)"
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


      </div>
    </div>
  );
}
