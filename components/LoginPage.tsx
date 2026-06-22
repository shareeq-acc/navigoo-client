'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTimelineStore } from '../hooks/TimelineContext';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Key, 
  Sparkles, 
  Check, 
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get('mode') as 'login' | 'signup') || 'login';
  const { login, register } = useTimelineStore();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Form states
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Feedback indicator
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorText("");

    try {
      if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          setErrorText("Please fill out all required credentials.");
          return;
        }
        await login(email.toLowerCase().trim(), password);
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 700);
      } else {
        if (!username.trim() || !fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
          setErrorText("Please fill out all fields.");
          return;
        }
        if (password !== confirmPassword) {
          setErrorText("Passwords do not match.");
          return;
        }
        if (username.includes(" ")) {
          setErrorText("Username handle cannot contain empty spaces.");
          return;
        }

        const nameParts = fullName.trim().split(/\s+/);
        const fname = nameParts[0] ? nameParts[0].replace(/[^a-zA-Z]/g, "") : "";
        const lname = nameParts.slice(1).join(" ").replace(/[^a-zA-Z]/g, "") || "User";

        if (!fname || fname.length < 2 || fname.length > 15) {
          setErrorText("First name must be between 2 and 15 alphabetic characters.");
          return;
        }
        if (!lname || lname.length < 2 || lname.length > 15) {
          setErrorText("Last name must be between 2 and 15 alphabetic characters.");
          return;
        }
        if (password.length < 8 || !/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) {
          setErrorText("Password must be at least 8 characters and contain both letters and numbers.");
          return;
        }

        await register(username.toLowerCase().trim(), email.toLowerCase().trim(), password, fname, lname);
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 700);
      }
    } catch (err: any) {
      setErrorText(err.message || "Operation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="auth-page" className="w-full min-h-screen bg-[#F9F9F8] flex items-center justify-center p-4 sm:p-8 font-sans select-none relative overflow-hidden">
      
      {/* Decorative ambient gradient backdrop circles */}
      <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-zinc-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-zinc-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Auth visual card container */}
      <div className="w-full max-w-md bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-8 shadow-xl relative z-10">
        
        {/* Back navigation */}
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 text-xs font-bold uppercase tracking-wider font-mono cursor-pointer mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        {/* Brand visual header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white mx-auto mb-3 shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">
            {mode === 'login' ? 'Welcome back to Navigoo' : 'Join Navigoo'}
          </h2>
          {mode === 'login' && (
            <p className="text-zinc-400 text-[10px] mt-1 uppercase font-mono tracking-wider font-bold">
              Enter credentials to navigate dashboards
            </p>
          )}
        </div>

        {/* Error messaging bar */}
        {errorText && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-semibold font-sans flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorText}</span>
          </div>
        )}

        {/* Success animation block */}
        {success ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center mb-2.5">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h4 className="font-serif italic font-bold text-zinc-900 text-sm">Identity Secured</h4>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase font-mono tracking-wider">Syncing workspace caches...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* If in Signup mode, ask for Name and Username Handle */}
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-mono">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Totok Michael"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-mono">Username Handle</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-zinc-400">@</span>
                    <input
                      type="text"
                      required
                      placeholder="totok_mike"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-zinc-805 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-mono">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-mono">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min. 8 characters with letters & numbers"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition cursor-pointer flex items-center justify-center p-1 rounded-md"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-mono">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 transition cursor-pointer flex items-center justify-center p-1 rounded-md"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs uppercase tracking-widest py-3 px-4 rounded-xl flex items-center justify-center gap-2 mt-2 transition-all shadow-md active:scale-99 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In To Account' : 'Join'}</span>
                </>
              )}
            </button>

            {/* Switch mode */}
            <div className="text-center mt-5 text-[11px] font-semibold text-zinc-505">
              {mode === 'login' ? (
                <span>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-zinc-900 hover:underline font-bold cursor-pointer"
                  >
                    Sign Up
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-zinc-900 hover:underline font-bold cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
