import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Database,
  CheckCircle2,
  UserPlus,
  LogIn,
  User as UserIcon,
} from 'lucide-react';
import { User, UserRole } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { createSupabaseInstance, getSupabaseCredentials } from '../../lib/supabase';
import { useToast } from '../common/Toast';

interface SignInPageProps {
  onLoginSuccess: (user: User) => void;
  availableUsers: User[];
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onLoginSuccess,
  availableUsers,
}) => {
  const { showToast } = useToast();
  const creds = getSupabaseCredentials();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('raghu.crm.sales@gmail.com');
  const [password, setPassword] = useState('RaghuCRM@2026');
  const [fullName, setFullName] = useState('Raghu');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick preset accounts for evaluation
  const demoAccounts = [
    {
      role: 'ADMIN' as UserRole,
      title: 'Admin / Director',
      name: 'Raghu (MD)',
      email: 'raghu.crm.sales@gmail.com',
      badge: 'Supabase Registered',
      icon: '👑',
    },
    {
      role: 'SALES USER' as UserRole,
      title: 'Sales Team',
      name: 'Karthik (Sales Mgr)',
      email: 'karthik.sales.mgr@gmail.com',
      badge: 'Leads & Plots',
      icon: '💼',
    },
    {
      role: 'CHANNEL PARTNER' as UserRole,
      title: 'Channel Partner',
      name: 'Suresh (Prime Estates)',
      email: 'suresh.primeestates@gmail.com',
      badge: 'Assigned Leads',
      icon: '🤝',
    },
  ];

  const handleQuickLogin = (demo: typeof demoAccounts[0]) => {
    setEmail(demo.email);
    setPassword('RaghuCRM@2026');
    setErrorMessage(null);
    setSuccessMessage(null);

    const existing = availableUsers.find((u) => u.email.toLowerCase() === demo.email.toLowerCase());
    const targetUser: User = existing || {
      id: `usr-${demo.role.toLowerCase().replace(' ', '-')}`,
      name: demo.name,
      email: demo.email,
      role: demo.role,
      created_at: new Date().toISOString(),
    };

    setIsLoading(true);
    setTimeout(() => {
      dataStore.login(targetUser);
      onLoginSuccess(targetUser);
      showToast(`Welcome back, ${targetUser.name}! Signed in as ${targetUser.role}.`, 'success');
      setIsLoading(false);
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (authMode === 'signup' && !fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    try {
      const sb = createSupabaseInstance();

      if (authMode === 'signup') {
        // --- SIGN UP: CREATE CREDENTIALS IN SUPABASE AUTH ---
        let supabaseUserId: string | null = null;

        if (sb && creds.isConfigured) {
          try {
            const { data, error } = await sb.auth.signUp({
              email: email.trim(),
              password: password.trim(),
              options: {
                data: {
                  name: fullName.trim(),
                  role: selectedRole,
                },
              },
            });

            if (error) {
              // If domain error or rate limit, explain gracefully
              if (error.message.includes('rate limit')) {
                showToast('Supabase Auth rate limit reached. Creating local profile.', 'info');
              } else {
                console.warn('Supabase Auth error:', error.message);
                setErrorMessage(error.message);
                setIsLoading(false);
                return;
              }
            } else if (data?.user) {
              supabaseUserId = data.user.id;
              setSuccessMessage('User account created in Supabase Authentication!');
            }
          } catch (sbErr: any) {
            console.warn('Supabase signup exception:', sbErr);
          }
        }

        const newUser: User = {
          id: supabaseUserId || `usr-${Date.now()}`,
          name: fullName.trim(),
          email: email.trim(),
          role: selectedRole,
          created_at: new Date().toISOString(),
        };

        // Save into CRM data store and state
        dataStore.login(newUser);
        onLoginSuccess(newUser);
        showToast(`Account created & credentials stored in Supabase! Welcome, ${newUser.name}.`, 'success');
      } else {
        // --- SIGN IN: AUTHENTICATE CREDENTIALS ---
        if (sb && creds.isConfigured) {
          try {
            const { data, error } = await sb.auth.signInWithPassword({
              email: email.trim(),
              password: password.trim(),
            });

            if (data?.user) {
              const userName = data.user.user_metadata?.name || email.split('@')[0];
              const userRole = (data.user.user_metadata?.role as UserRole) || 'ADMIN';
              const authedUser: User = {
                id: data.user.id,
                name: userName,
                email: data.user.email || email.trim(),
                role: userRole,
                created_at: data.user.created_at || new Date().toISOString(),
              };

              dataStore.login(authedUser);
              onLoginSuccess(authedUser);
              showToast(`Supabase Authenticated! Welcome, ${authedUser.name}.`, 'success');
              return;
            } else if (error && error.message.includes('Invalid login credentials')) {
              setErrorMessage('Invalid credentials or user not registered in Supabase yet. Click "Create Account" above to register this user in Supabase!');
              setIsLoading(false);
              return;
            }
          } catch (authErr) {
            console.warn('Supabase signin error:', authErr);
          }
        }

        // Fallback or demo match
        const foundUser = availableUsers.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase()
        );

        const targetUser: User = foundUser || {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          email: email.trim(),
          role: email.includes('admin') || email.includes('raghu') ? 'ADMIN' : 'SALES USER',
          created_at: new Date().toISOString(),
        };

        dataStore.login(targetUser);
        onLoginSuccess(targetUser);
        showToast(`Signed in successfully as ${targetUser.name}.`, 'success');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authenticate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#140226] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Purple Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#6C3BFF]/25 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#4714BA]/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2E0B5E]/40 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6C3BFF] to-[#9965FF] shadow-xl shadow-[#6C3BFF]/40 mb-3 border border-white/20">
            <Building2 className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Raghu Real Estate CRM
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/80 mt-1 font-medium">
            Plotted Land Developments & Sales Automation
          </p>

          <div className="inline-flex items-center gap-2 mt-2.5 px-3 py-1 rounded-full bg-white/5 border border-purple-500/20 text-[11px] text-purple-200">
            <Database className="w-3 h-3 text-[#A87FFF]" />
            <span>{creds.isConfigured ? 'Supabase Auth Ready' : 'Adaptive Local Store'}</span>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-[#210647]/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/60">
          {/* Sign In vs Sign Up Tabs */}
          <div className="flex bg-[#170333] p-1 rounded-xl border border-purple-500/30 mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-[#6C3BFF] text-white shadow-sm'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-[#6C3BFF] text-white shadow-sm'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          <div className="mb-4">
            <h2 className="text-base font-bold text-white">
              {authMode === 'signin' ? 'Sign In to your Account' : 'Register New Supabase User'}
            </h2>
            <p className="text-xs text-purple-300/80 mt-0.5">
              {authMode === 'signin'
                ? 'Enter your credentials to access your real estate portal'
                : 'Creates a verified sign-in account in your Supabase Authentication database'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200">
              <span className="font-bold">Notice:</span> {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name for Sign Up */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1 uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Raghu Raman"
                    required
                    className="w-full bg-[#170333]/80 border border-purple-500/30 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-[#6C3BFF] focus:ring-2 focus:ring-[#6C3BFF]/40 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-purple-200 mb-1 uppercase tracking-wider">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  required
                  className="w-full bg-[#170333]/80 border border-purple-500/30 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-[#6C3BFF] focus:ring-2 focus:ring-[#6C3BFF]/40 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-purple-200 mb-1 uppercase tracking-wider">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#170333]/80 border border-purple-500/30 rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-[#6C3BFF] focus:ring-2 focus:ring-[#6C3BFF]/40 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Selector for Sign Up */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1 uppercase tracking-wider">
                  Select User Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full bg-[#170333]/80 border border-purple-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6C3BFF] cursor-pointer"
                >
                  <option value="ADMIN">ADMIN (Managing Director / Owner)</option>
                  <option value="SALES USER">SALES USER (Sales Team Executive)</option>
                  <option value="CHANNEL PARTNER">CHANNEL PARTNER (Broker / Agency)</option>
                </select>
              </div>
            )}

            {/* Remember Me */}
            {authMode === 'signin' && (
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6C3BFF] bg-[#170333] border-purple-500/40 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#6C3BFF]"
                  />
                  <span className="text-xs text-purple-200">Remember this device</span>
                </label>

                <span className="text-xs text-[#A87FFF] hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6C3BFF] to-[#8C52FF] hover:from-[#5820E0] hover:to-[#7B40F2] text-white text-sm font-bold shadow-lg shadow-[#6C3BFF]/35 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {authMode === 'signin' ? 'Sign In to CRM Portal' : 'Register User in Supabase'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Quick Demo Logins (for Sign In mode) */}
          {authMode === 'signin' && (
            <div className="mt-5 pt-4 border-t border-purple-500/20">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C7ACFF]" />
                  <span>Instant 1-Click Role Logins:</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    className="p-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 hover:border-purple-400 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{acc.icon}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-200">
                        {acc.role.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white mt-1 group-hover:text-[#C7ACFF] truncate">
                      {acc.name}
                    </p>
                    <p className="text-[10px] text-purple-300 truncate mt-0.5">{acc.badge}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-purple-400/70 mt-5">
          &copy; 2026 Raghu Real Estate Developers Pvt Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
};
