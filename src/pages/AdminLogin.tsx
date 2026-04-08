import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { cleanFirebaseError } from '../lib/errorUtils';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const siteAdminEmail = 'kenwem@yahoo.com';
      const userEmail = userCredential.user.email?.toLowerCase().trim();
      
      if (!userEmail || userEmail !== siteAdminEmail) {
        await auth.signOut();
        setError('Unauthorized: This account does not have administrative access.');
        return;
      }
      
      navigate('/admin');
    } catch (err: any) {
      setError(cleanFirebaseError(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      setError(cleanFirebaseError(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--c-bg)] flex flex-col items-center justify-center px-6">
      <div className="mb-12">
        <Logo className="text-[16px]" light />
      </div>
      
      <div className="bg-zinc-900 border border-white/20 p-8 rounded-xl w-full max-w-md backdrop-blur-md shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h2>
        
        {error && (
          <div className="bg-red-600/90 border border-red-500 text-white p-4 rounded-lg mb-6 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="shrink-0 text-white" size={18} />
            <span className="text-sm font-bold leading-tight">{error}</span>
          </div>
        )}
        
        {message && (
          <div className="bg-emerald-600/90 border border-emerald-500 text-white p-4 rounded-lg mb-6 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="shrink-0 text-white" size={18} />
            <span className="text-sm font-bold leading-tight">{message}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 pr-10 text-white placeholder:text-white/40 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="button" 
              onClick={handleForgotPassword}
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
