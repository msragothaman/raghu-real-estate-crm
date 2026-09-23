import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Clock,
  Send,
  HelpCircle,
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

  // Email verification state
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);
  const [pendingEmailForResend, setPendingEmailForResend] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Check on mount if user arrived via confirmed email session
  useEffect(() => {
    const sb = createSupabaseInstance();
    if (!sb) return;

    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && session.user.email_confirmed_at) {
        const userName =
          session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
        const userRole = (session.user.user_metadata?.role as UserRole) || 'ADMIN';
        const authedUser: User = {
          id: session.user.id,
          name: userName,
          email: session.user.email || '',
          role: userRole,
          created_at: session.user.created_at || new Date().toISOString(),
        };
        dataStore.login(authedUser);
        onLoginSuccess(authedUser);
      }
    });
  }, [onLoginSuccess]);

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
    setPendingConfirmationEmail(null);
    setPendingEmailForResend(null);

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

  const handleResendConfirmation = async (targetEmail: string) => {
    if (!targetEmail || resendCooldown > 0 || isResending) return;
    const sb = createSupabaseInstance();
    if (!sb) {
      showToast('Supabase client not initialized', 'error');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await sb.auth.resend({
        type: 'signup',
        email: targetEmail.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast(`Verification link sent to ${targetEmail.trim()}! Please check your inbox.`, 'success');
        setResendCooldown(60);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to resend confirmation email.', 'error');
    } finally {
      setIsResending(false);
    }
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
    if (authMode === 'signup' && password.trim().length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const sb = createSupabaseInstance();

      if (authMode === 'signup') {
        // --- SIGN UP: CREATE CREDENTIALS IN SUPABASE AUTH ---
        if (sb && creds.isConfigured) {
          const { data, error } = await sb.auth.signUp({
            email: email.trim(),
            password: password.trim(),
            options: {
              data: {
                name: fullName.trim(),
                role: selectedRole,
              },
              emailRedirectTo: window.location.origin,
            },
          });

          if (error) {
            const errLower = error.message.toLowerCase();
            if (errLower.includes('already registered')) {
              setErrorMessage('An account with this email already exists. If your email is not verified yet, click below to resend the confirmation link.');
              setPendingEmailForResend(email.trim());
            } else {
              setErrorMessage(error.message);
            }
            setIsLoading(false);
            return;
          }

          // Check if email confirmation is required:
          // In Supabase, when email verification is required, data.session is null and data.user.email_confirmed_at is not set.
          if (!data?.session || !data?.user?.email_confirmed_at) {
            // DO NOT LOG IN! DO NOT OPEN CRM!
            setPendingConfirmationEmail(email.trim());
            setPendingEmailForResend(email.trim());
            setResendCooldown(60);
            showToast(`Confirmation email sent to ${email.trim()}! Please confirm before accessing CRM.`, 'info');
            setIsLoading(false);
            return;
          }

          // Only reached if email confirmation is completely disabled on the Supabase project:
          const newUser: User = {
            id: data.user.id,
            name: fullName.trim(),
            email: email.trim(),
            role: selectedRole,
            created_at: data.user.created_at || new Date().toISOString(),
          };

          dataStore.login(newUser);
          onLoginSuccess(newUser);
          showToast(`Account created! Welcome, ${newUser.name}.`, 'success');
          return;
        }

        // Offline / Unconfigured fallback:
        const newUser: User = {
          id: `usr-${Date.now()}`,
          name: fullName.trim(),
          email: email.trim(),
          role: selectedRole,
          created_at: new Date().toISOString(),
        };

        dataStore.login(newUser);
        onLoginSuccess(newUser);
        showToast(`Account created! Welcome, ${newUser.name}.`, 'success');
      } else {
        // --- SIGN IN: AUTHENTICATE CREDENTIALS ---
        if (sb && creds.isConfigured) {
          const { data, error } = await sb.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
          });

          if (error) {
            const errLower = error.message.toLowerCase();
            if (errLower.includes('email not confirmed') || errLower.includes('not confirmed')) {
              // EMAIL NOT CONFIRMED - DO NOT LOG IN
              setErrorMessage('Your email address has not been confirmed yet. Please click the confirmation link sent to your email before opening the CRM.');
              setPendingEmailForResend(email.trim());
              setIsLoading(false);
              return;
            }

            if (errLower.includes('invalid login credentials')) {
              setErrorMessage('Invalid email or password. If you recently created your account, please ensure you confirmed your email link first.');
              setIsLoading(false);
              return;
            }

            setErrorMessage(error.message);
            setIsLoading(false);
            return;
          }

          if (data?.user && data?.session) {
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
          }
        }

        // Only when Supabase is NOT configured in environment or settings:
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

        {/* Card Container */}
        <div className="bg-[#210647]/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/60">
          {pendingConfirmationEmail ? (
            /* --- EMAIL VERIFICATION PENDING SCREEN --- */
            <div className="text-center py-2 space-y-4">
              {/* Animated Envelope Icon with Glow */}
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 rounded-3xl bg-[#6C3BFF]/40 blur-xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#6C3BFF] to-[#A87FFF] flex items-center justify-center shadow-xl shadow-[#6C3BFF]/40 border border-white/20">
                  <Mail className="w-10 h-10 text-white animate-bounce" />
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Email Verification Required
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Check Your Inbox
                </h2>
                <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-sm mx-auto">
                  We've sent an activation link to your email address:
                </p>
                <div className="mt-3 p-3 bg-[#15022D] border border-purple-500/40 rounded-2xl flex items-center justify-center gap-2 font-mono text-xs sm:text-sm font-bold text-purple-100 shadow-inner">
                  <Mail className="w-4 h-4 text-[#A87FFF] shrink-0" />
                  <span className="truncate">{pendingConfirmationEmail}</span>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="text-left bg-[#170333]/80 border border-purple-500/25 rounded-2xl p-4 space-y-3 text-xs text-purple-200">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#6C3BFF] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-xs">
                    1
                  </span>
                  <p>
                    Open your email inbox and find the confirmation message from{' '}
                    <strong className="text-white">Raghu Real Estate CRM</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#6C3BFF] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-xs">
                    2
                  </span>
                  <p>
                    Click the <strong className="text-[#C7ACFF]">"Confirm your mail"</strong> button inside the email to verify your account in Supabase.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#6C3BFF] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-xs">
                    3
                  </span>
                  <p>
                    Once confirmed, click below or sign in with your password to open the CRM.
                  </p>
                </div>
              </div>

              {/* Spam folder notice */}
              <p className="text-[11px] text-purple-300/70 italic">
                Didn't receive the email? Check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
              </p>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail(pendingConfirmationEmail);
                    setPendingConfirmationEmail(null);
                    setAuthMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6C3BFF] to-[#8C52FF] hover:from-[#5820E0] hover:to-[#7B40F2] text-white text-sm font-bold shadow-lg shadow-[#6C3BFF]/35 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <LogIn className="w-4 h-4" />
                  <span>I've Confirmed My Email — Sign In</span>
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || isResending}
                  onClick={() => handleResendConfirmation(pendingConfirmationEmail)}
                  className="w-full py-2 px-4 rounded-xl bg-[#170333] hover:bg-purple-900/50 border border-purple-500/30 text-xs font-bold text-purple-200 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isResending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-purple-300/30 border-t-white rounded-full animate-spin" />
                      <span>Sending confirmation link...</span>
                    </>
                  ) : resendCooldown > 0 ? (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      Resend confirmation email in {resendCooldown}s
                    </span>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5 text-[#A87FFF]" />
                      <span>Resend Confirmation Email</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPendingConfirmationEmail(null);
                    setAuthMode('signup');
                  }}
                  className="text-xs text-purple-400 hover:text-purple-200 transition-colors pt-1 block mx-auto underline cursor-pointer"
                >
                  Register with a different email address
                </button>
              </div>
            </div>
          ) : (
            /* --- NORMAL SIGN IN / SIGN UP FORM --- */
            <>
              {/* Sign In vs Sign Up Tabs */}
              <div className="flex bg-[#170333] p-1 rounded-xl border border-purple-500/30 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
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
                    setSuccessMessage(null);
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
                  {authMode === 'signin' ? 'Sign In to your Account' : 'Register New Account'}
                </h2>
                <p className="text-xs text-purple-300/80 mt-0.5">
                  {authMode === 'signin'
                    ? 'Enter your credentials to access your real estate portal'
                    : 'A confirmation link will be sent to your email to activate your account'}
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold">Notice:</span> {errorMessage}
                    </div>
                  </div>

                  {pendingEmailForResend && (
                    <div className="mt-2.5 pt-2.5 border-t border-rose-500/30 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-rose-200/90">Need another link?</span>
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || isResending}
                        onClick={() => handleResendConfirmation(pendingEmailForResend)}
                        className="text-xs font-bold text-white bg-rose-600/70 hover:bg-rose-600 px-3 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
                      >
                        {isResending ? (
                          'Sending...'
                        ) : resendCooldown > 0 ? (
                          `Resend in ${resendCooldown}s`
                        ) : (
                          <>
                            <Mail className="w-3 h-3" />
                            <span>Resend Confirmation Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
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
                        {authMode === 'signin'
                          ? 'Sign In to CRM Portal'
                          : 'Create Account & Send Verification Email'}
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
            </>
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
