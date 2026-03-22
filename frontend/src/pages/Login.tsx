import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';
import { Factory } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px]" />
         <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-cyan-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/80">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl mb-4 ring-1 ring-blue-500/30">
            <Factory className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">Sri Swastik</h1>
          <p className="text-slate-400 text-sm font-medium">Manufacturing Management</p>
        </div>

        {error && (
          <div className="p-3 mb-5 text-sm font-medium text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder-slate-600"
              placeholder="admin@sriswastik.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder-slate-600"
              required
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] mt-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
