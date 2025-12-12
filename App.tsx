import React, { useState, useEffect, useRef } from 'react';
import { User, Section, AgentPersona, VoiceModeCategory } from './types';
import { AGENTS, VOICE_CATEGORIES, SYSTEM_PROMPTS, CONTENT_STYLES, ASPECT_RATIOS } from './constants';
import { geminiService } from './services/geminiService';
import { 
  MessageSquare, Mic, FileText, Image as ImageIcon, 
  Briefcase, Settings, LogOut, History,
  Menu, X, Headphones, Gamepad2, GraduationCap, Video,
  PenTool, StickyNote, Zap, ShieldAlert, Leaf, HeartHandshake,
  BookOpen, Bot, Heart, Sparkles, Send, Upload, ChevronRight,
  MonitorPlay, Phone, MicOff, Volume2, Globe, Sliders, Play, Square, Loader2,
  Mail, Lock, User as UserIcon, Eye, EyeOff, Check, ArrowLeft, Github
} from 'lucide-react';

// --- ICONS MAPPING ---
const ICON_MAP: Record<string, React.FC<any>> = {
  'Zap': Zap,
  'ShieldAlert': ShieldAlert,
  'Leaf': Leaf,
  'HeartHandshake': HeartHandshake,
  'BookOpen': BookOpen,
  'Bot': Bot,
  'Heart': Heart
};

// --- HELPER COMPONENT: AVATAR ---
const Avatar: React.FC<{ agent: AgentPersona, size?: 'sm'|'md'|'lg'|'xl' }> = ({ agent, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-14 h-14',
        lg: 'w-24 h-24',
        xl: 'w-64 h-64'
    };

    const iconSizes = {
        sm: 16,
        md: 24,
        lg: 40,
        xl: 80
    };
    
    return (
        <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white shadow-lg bg-gradient-to-br ${agent.gradient} border border-white/10 relative overflow-hidden`}>
             <div className="absolute inset-0 bg-white/10 animate-pulse-slow"></div>
             <Bot size={iconSizes[size]} className="relative z-10 opacity-90" />
        </div>
    );
};


// --- AUTH COMPONENTS ---
const AuthScreen: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [termsError, setTermsError] = useState(false);

  // Social Login State
  const [showSocialSelect, setShowSocialSelect] = useState(false);
  const [socialUsers, setSocialUsers] = useState<User[]>([]);
  const [socialProvider, setSocialProvider] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const resetForm = () => {
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
    setTermsError(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const stored = localStorage.getItem(`user_${email}`);
        if (!stored) {
            throw new Error('Account not found. Please register.');
        }
        const userData = JSON.parse(stored);
        
        // Simple password check (In a real app, verify hash)
        if (userData.password && userData.password !== password) {
             throw new Error('Invalid credentials.');
        }

        onLogin(userData);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTermsError(false);
    
    if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }
    if (!agreeTerms) {
        setError("You must agree to the Terms & Conditions to sign up.");
        setTermsError(true);
        return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const stored = localStorage.getItem(`user_${email}`);
        if (stored) {
            throw new Error('User already exists. Please login.');
        }

        const newUser: User = { 
            email, 
            name, 
            isRegistered: true, 
            preferences: { agentId: '1' }
        };
        // Hack to save password for this demo session
        localStorage.setItem(`user_${email}`, JSON.stringify({ ...newUser, password, name }));
        
        setSuccess('Account created successfully! Logging you in...');
        setTimeout(() => onLogin(newUser), 1000);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate sending email
    setSuccess(`If an account exists for ${email}, a reset link has been sent.`);
    setIsLoading(false);
  };

  const handleSocialLogin = async (provider: string) => {
    setError('');
    setIsLoading(true);
    setSocialProvider(provider);

    // Simulate OAuth Redirect / API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Scan local storage for potential accounts
    const foundUsers: User[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_')) {
            try {
                const u = JSON.parse(localStorage.getItem(key) || '{}');
                if (u && u.email) foundUsers.push(u);
            } catch (e) {}
        }
    }

    if (foundUsers.length > 0) {
        setSocialUsers(foundUsers);
        setShowSocialSelect(true);
        setIsLoading(false);
    } else {
        // AUTO CREATE ACCOUNT FOR DEMO if no local accounts found
        const demoEmail = `demo_user_${Date.now()}@${provider.toLowerCase()}.com`;
        const newUser: User = { 
            email: demoEmail, 
            name: `New ${provider} User`, 
            isRegistered: true, 
            preferences: { agentId: '1' }
        };
        localStorage.setItem(`user_${demoEmail}`, JSON.stringify(newUser));
        
        setSuccess(`Created new ${provider} account automatically.`);
        setTimeout(() => onLogin(newUser), 800);
    }
  };

  const selectSocialUser = (user: User) => {
      setShowSocialSelect(false);
      setIsLoading(true);
      // Simulate login
      setTimeout(() => {
          onLogin(user);
      }, 500);
  };

  const SocialButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button 
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black font-sans">
       {/* Background visuals */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="z-10 w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl relative border border-white/10">
        
        {/* Header Section */}
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-300 to-purple-400 tracking-tighter mb-2">Muse AI</h1>
            <p className="text-gray-400 text-sm tracking-widest uppercase">
                {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Recovery'}
            </p>
        </div>

        {/* Alert Messages */}
        {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-start gap-2 animate-float">
                <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                {error}
            </div>
        )}
        {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-sm flex items-start gap-2 animate-float">
                <Check size={16} className="mt-0.5 shrink-0" />
                {success}
            </div>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="text-center text-gray-400 text-sm mb-6">
                    Enter your email address and we'll send you a link to reset your password.
                </div>
                
                <div className="space-y-4">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-4 text-gray-500 group-focus-within:text-brand-400 transition-colors" size={20} />
                        <input 
                            type="email" 
                            required
                            placeholder="Email Address" 
                            className="w-full bg-black/40 border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-gray-600"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-brand-900/50 flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Send Reset Link'}
                </button>

                <button 
                    type="button"
                    onClick={() => { setMode('signin'); resetForm(); }}
                    className="w-full text-gray-400 hover:text-white text-sm py-2 flex items-center justify-center gap-2 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Login
                </button>
            </form>
        )}

        {/* SIGN IN VIEW */}
        {mode === 'signin' && (
            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-4 text-gray-500 group-focus-within:text-brand-400 transition-colors" size={20} />
                        <input 
                            type="email" 
                            required
                            placeholder="Email Address" 
                            className="w-full bg-black/40 border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-gray-600"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-4 text-gray-500 group-focus-within:text-brand-400 transition-colors" size={20} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            placeholder="Password" 
                            className="w-full bg-black/40 border border-gray-700 rounded-xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-gray-600"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-400 hover:text-gray-300 cursor-pointer select-none">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-brand-600 border-brand-600' : 'border-gray-600 bg-transparent'}`}>
                             {rememberMe && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                        Remember me
                    </label>
                    <button 
                        type="button"
                        onClick={() => { setMode('forgot'); resetForm(); }}
                        className="text-brand-400 hover:text-brand-300 transition-colors font-medium"
                    >
                        Forgot Password?
                    </button>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-brand-900/50 flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
                </button>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0e0e11] px-2 text-gray-500">Or continue with</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <SocialButton icon={<Github size={20} />} label="GitHub" onClick={() => handleSocialLogin('GitHub')} />
                    <SocialButton icon={<Globe size={20} className="text-blue-400"/>} label="Google" onClick={() => handleSocialLogin('Google')} />
                </div>

                <div className="text-center mt-6">
                    <p className="text-gray-400 text-sm">
                        Don't have an account?{' '}
                        <button 
                            onClick={() => { setMode('signup'); resetForm(); }}
                            className="text-brand-400 hover:text-white font-bold transition-colors"
                        >
                            Sign Up
                        </button>
                    </p>
                </div>
            </form>
        )}

        {/* SIGN UP VIEW */}
        {mode === 'signup' && (
            <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-4">
                    <div className="relative group">
                        <UserIcon className="absolute left-4 top-4 text-gray-500 group-focus-within:text-brand-400 transition-colors" size={20} />
                        <input 
                            type="text" 
                            required
                            placeholder="Full Name" 
                            className="w-full bg-black/40 border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-gray-600"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-4 text-gray-500 group-focus-within:text-brand-400 transition-colors" size={20} />
                        <input 
                            type="email" 
                            required
                            placeholder="Email Address" 
                            className="w-full bg-black/40 border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-gray-600"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-4 text-gray-500 group-focus-within:text-brand-400 transition-colors" size={20} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            placeholder="Password" 
                            className="w-full bg-black/40 border border-gray-700 rounded-xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-gray-600"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-4 text-gray-500 group-focus-within:text-brand-400 transition-colors" size={20} />
                        <input 
                            type="password" 
                            required
                            placeholder="Confirm Password" 
                            className="w-full bg-black/40 border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-gray-600"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-400">
                    <div 
                        onClick={() => { setAgreeTerms(!agreeTerms); setTermsError(false); }}
                        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${agreeTerms ? 'bg-brand-600 border-brand-600' : termsError ? 'border-red-500 bg-red-500/10' : 'border-gray-600 bg-transparent'}`}
                    >
                        {agreeTerms && <Check size={14} className="text-white" />}
                    </div>
                    <p className={`leading-snug ${termsError ? 'text-red-400' : ''}`}>
                        I agree to the <a href="#" className="text-brand-400 hover:underline">Terms & Conditions</a> and <a href="#" className="text-brand-400 hover:underline">Privacy Policy</a>.
                    </p>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-brand-900/50 flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Create Account'}
                </button>

                <div className="text-center mt-6">
                    <p className="text-gray-400 text-sm">
                        Already have an account?{' '}
                        <button 
                            onClick={() => { setMode('signin'); resetForm(); }}
                            className="text-brand-400 hover:text-white font-bold transition-colors"
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </form>
        )}

      </div>

      {/* Social Account Chooser Modal */}
      {showSocialSelect && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#18181b] w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl p-6 relative">
                <button 
                    onClick={() => setShowSocialSelect(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </button>
                
                <div className="text-center mb-6">
                    {socialProvider === 'Google' ? <Globe size={40} className="mx-auto text-blue-400 mb-3" /> : <Github size={40} className="mx-auto text-white mb-3" />}
                    <h3 className="text-xl font-bold">Choose an account</h3>
                    <p className="text-gray-400 text-sm">to continue to Muse AI</p>
                </div>

                <div className="space-y-2 mb-4">
                    {socialUsers.map((u, i) => (
                        <button 
                            key={i}
                            onClick={() => selectSocialUser(u)}
                            className="w-full flex items-center gap-4 p-3 hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-white/5 text-left group"
                        >
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg text-sm group-hover:scale-105 transition-transform">
                                {(u.name?.[0] || u.email[0]).toUpperCase()}
                             </div>
                             <div className="overflow-hidden">
                                 <div className="font-bold text-sm truncate">{u.name || 'User'}</div>
                                 <div className="text-xs text-gray-400 truncate">{u.email}</div>
                             </div>
                        </button>
                    ))}
                </div>

                <div className="border-t border-white/10 pt-4">
                     <button 
                        onClick={() => { setShowSocialSelect(false); setMode('signup'); }}
                        className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors"
                    >
                        Use another account
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// --- CHAT FEATURE ---
const ChatView: React.FC<{ activeAgent: AgentPersona }> = ({ activeAgent }) => {
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const response = await geminiService.generateChat(history, userMsg.text);
      setMessages(prev => [...prev, { role: 'model', text: response || 'No response.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'Error connecting to Muse AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-grid-pattern bg-repeat relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 pointer-events-none"></div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-60">
             <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl shadow-brand-500/20">
                <Sparkles className="w-10 h-10 text-white" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-2">Muse AI Chat</h3>
             <p className="text-gray-400">Powered by Gemini 3 Pro</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
             <div className={`flex-shrink-0 ${m.role === 'user' ? 'order-1' : ''}`}>
                 {m.role === 'user' ? (
                     <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-white/10 font-bold text-xs">YOU</div>
                 ) : (
                     <Avatar agent={activeAgent} size="sm" />
                 )}
             </div>
             <div className={`max-w-[70%] p-5 rounded-3xl text-sm leading-relaxed shadow-lg ${m.role === 'user' ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-tr-sm' : 'glass-panel text-gray-200 rounded-tl-sm'}`}>
              {m.text}
             </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
             <Avatar agent={activeAgent} size="sm" />
             <div className="glass-panel px-4 py-3 rounded-3xl rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-200"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 relative z-20">
        <div className="max-w-4xl mx-auto glass-panel p-2 rounded-full flex gap-2 shadow-2xl shadow-brand-900/20">
          <input 
            className="flex-1 bg-transparent border-none px-6 text-white focus:outline-none placeholder-gray-500"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask anything..."
          />
          <button 
            onClick={send} 
            className={`p-3 rounded-full transition-all ${input.trim() ? 'bg-brand-500 text-white hover:bg-brand-400 shadow-lg shadow-brand-500/30' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            disabled={!input.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- VOICE MODE ---
const VoiceView: React.FC<{ activeAgent: AgentPersona }> = ({ activeAgent }) => {
  const [category, setCategory] = useState<VoiceModeCategory | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnectFn, setDisconnectFn] = useState<(() => void) | null>(null);
  const [volume, setVolume] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let interval: any;
    if (connected) {
        interval = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
        setDuration(0);
    }
    return () => clearInterval(interval);
  }, [connected]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = async (selectedCategory: VoiceModeCategory) => {
      setCategory(selectedCategory);
      setConnecting(true);
      try {
        const sysPrompt = `${SYSTEM_PROMPTS.VOICE_BASE} You are acting as a ${selectedCategory} agent.`;
        const { disconnect } = await geminiService.connectLive(
          { voiceName: activeAgent.voiceName, systemInstruction: sysPrompt },
          (data) => {
            let sum = 0;
            for(let i = 0; i < data.length; i++) sum += data[i] * data[i];
            setVolume(Math.sqrt(sum / data.length));
          }
        );
        setDisconnectFn(() => disconnect);
        setConnected(true);
      } catch (e) {
        console.error(e);
        alert("Failed to connect to Live API. Please ensure your microphone is enabled.");
        setCategory(null);
      } finally {
        setConnecting(false);
      }
  };

  const endSession = () => {
      disconnectFn?.();
      setConnected(false);
      setCategory(null);
      setDisconnectFn(null);
      setIsMuted(false);
  };

  // 1. Initial Selection State (Instant Call Trigger)
  if (!connected && !connecting) {
    return (
      <div className="h-full p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-2 text-white">Voice Mode</h2>
          <p className="text-gray-400 mb-10">Select an experience to instantly call your AI agent.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VOICE_CATEGORIES.map(cat => {
              const Icon = ICON_MAP[cat.icon as string] || Sparkles;
              return (
                <button 
                  key={cat.id}
                  onClick={() => startSession(cat.id)}
                  className="group glass-panel p-6 rounded-2xl hover:bg-white/5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/20 text-left relative overflow-hidden cursor-pointer"
                >
                  <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${cat.color}`}>
                     <Icon size={100} />
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-black/40 ${cat.color}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{cat.label}</h3>
                  <div className="flex items-center gap-2 mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                     <p className="text-xs uppercase tracking-wide">Tap to call</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. Connecting & Active Call UI
  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-black w-full">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 bg-gradient-to-br ${activeAgent.gradient} opacity-20 blur-3xl`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-80"></div>
      </div>

      {connecting ? (
          <div className="z-20 flex flex-col items-center animate-pulse">
               <div className="relative">
                   <div className="w-24 h-24 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center scale-75">
                       <Avatar agent={activeAgent} size="lg" />
                   </div>
               </div>
               <h3 className="text-2xl font-bold text-white mt-8 tracking-wide">Calling {activeAgent.name}...</h3>
               <p className="text-brand-400 text-sm mt-2">{category}</p>
          </div>
      ) : (
          <>
            <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-md">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-2">{activeAgent.name}</h2>
                    <div className="flex items-center justify-center gap-2">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono text-brand-300 backdrop-blur-md border border-white/5">{formatTime(duration)}</span>
                        <span className="text-gray-400 text-sm font-medium">{category} Session</span>
                    </div>
                </div>

                {/* Main Visualization Orb */}
                <div className="relative w-80 h-80 flex items-center justify-center">
                    {/* Outer Ripples */}
                    <div className="absolute inset-0 rounded-full border border-white/5 scale-110 opacity-30"></div>
                    <div className="absolute inset-0 rounded-full border border-white/5 scale-125 opacity-20"></div>
                    <div className="absolute inset-0 rounded-full border border-white/5 scale-150 opacity-10"></div>
                    
                    {/* Audio Reactive Glow */}
                    <div 
                        className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-500 to-purple-600 blur-3xl transition-transform duration-75 ease-out opacity-60"
                        style={{ transform: `scale(${0.9 + volume * 2})` }}
                    ></div>
                    
                    {/* Avatar Container */}
                    <div className="relative z-10">
                        <Avatar agent={activeAgent} size="xl" />
                    </div>
                </div>
            </div>

            {/* Call Controls */}
            <div className="z-20 w-full max-w-lg px-6 pb-12">
                <div className="glass-panel p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl backdrop-blur-xl border border-white/10 bg-black/40">
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                    </button>

                    <div className="flex flex-col items-center justify-center w-32">
                         <div className="flex gap-1.5 h-6 items-center">
                             {[...Array(5)].map((_, i) => (
                                 <div 
                                    key={i} 
                                    className="w-1.5 bg-brand-500 rounded-full" 
                                    style={{ 
                                        height: `${10 + Math.random() * (volume * 100 + 20)}%`, 
                                        transition: 'height 0.1s ease' 
                                    }}
                                 ></div>
                             ))}
                         </div>
                         <span className="text-[10px] text-gray-500 mt-2 font-bold tracking-widest uppercase">Live Audio</span>
                    </div>

                    <button 
                        onClick={endSession}
                        className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all transform hover:scale-105 active:scale-95"
                        title="End Call"
                    >
                        <Phone size={28} className="rotate-[135deg]" />
                    </button>
                </div>
            </div>
          </>
      )}
    </div>
  );
};

const AnalyzeView: React.FC = () => {
  const [subMode, setSubMode] = useState<'summary' | 'handwriting'>('summary');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Customization States
  const [handStyle, setHandStyle] = useState('font-hand1');
  const [paperType, setPaperType] = useState<'lined' | 'grid' | 'plain'>('lined');
  const [inkColor, setInkColor] = useState<'ink-black' | 'ink-blue' | 'ink-gray'>('ink-blue');
  const [prompt, setPrompt] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const process = async () => {
    if (!file && !prompt) return;
    setLoading(true);
    try {
      let base64 = '';
      if (file) {
        base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        base64 = base64.split(',')[1];
      }

      const system = subMode === 'handwriting' ? SYSTEM_PROMPTS.HANDWRITING : "Analyze this document and provide a detailed explanation.";
      const finalPrompt = prompt || "Analyze this.";
      
      if (base64) {
        const res = await geminiService.analyzeDocument(base64, file?.type || 'image/png', finalPrompt + (subMode === 'handwriting' ? " Return only the text content formatted for an assignment." : ""));
        setResult(res || '');
      } else {
        const res = await geminiService.generateChat([], system + " " + finalPrompt);
        setResult(res || '');
      }
    } catch (e) {
      setResult('Error processing document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden bg-black/20">
      <div className="flex gap-6 mb-6 border-b border-gray-800 pb-2 flex-shrink-0">
        <button onClick={() => setSubMode('summary')} className={`pb-4 px-2 text-sm font-medium transition-all relative ${subMode === 'summary' ? 'text-brand-400' : 'text-gray-400 hover:text-white'}`}>
            Summary & Explain
            {subMode === 'summary' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-400 rounded-t-full"></span>}
        </button>
        <button onClick={() => setSubMode('handwriting')} className={`pb-4 px-2 text-sm font-medium transition-all relative ${subMode === 'handwriting' ? 'text-brand-400' : 'text-gray-400 hover:text-white'}`}>
            Handwritten Assignment
            {subMode === 'handwriting' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-400 rounded-t-full"></span>}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        {/* Input Column */}
        <div className="flex flex-col min-h-0 gap-4">
            <div className="glass-panel p-8 rounded-3xl border border-dashed border-gray-700 hover:border-brand-500/50 transition-colors flex flex-col items-center justify-center text-center group cursor-pointer relative">
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center mb-4 group-hover:bg-brand-900/30 transition-colors">
                    <Upload className="text-gray-400 group-hover:text-brand-400" />
                </div>
                <p className="text-white font-medium mb-1">{file ? file.name : "Drop document or image here"}</p>
                <p className="text-xs text-gray-500">Supports PDF, JPG, PNG</p>
            </div>

            <div className="glass-panel p-1 rounded-3xl flex-1 flex flex-col">
                <textarea 
                    className="w-full h-full bg-transparent p-6 text-white resize-none focus:outline-none placeholder-gray-600 leading-relaxed" 
                    placeholder={subMode === 'summary' ? "Ask questions about the document..." : "Enter topic for assignment (e.g. 'Write a 200 word essay on AI')..."}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                />
            </div>
            
            <button 
                onClick={process} 
                disabled={loading} 
                className="w-full bg-white text-black py-4 rounded-2xl font-bold hover:bg-gray-200 disabled:opacity-50 shadow-lg shadow-white/10 transition-all"
            >
                {loading ? 'Processing...' : 'Generate Analysis'}
            </button>
        </div>
        
        {/* Output Column */}
        <div className="glass-panel rounded-3xl flex flex-col min-h-0 relative overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
            <h3 className="font-bold flex items-center gap-2 text-sm"><FileText size={16} className="text-brand-400"/> Generated Output</h3>
            {subMode === 'handwriting' && (
              <div className="flex gap-2 items-center">
                 <div className="flex bg-black/40 rounded-lg p-1">
                    <button onClick={() => setPaperType('lined')} className={`p-1.5 rounded-md transition-colors ${paperType === 'lined' ? 'bg-gray-700 text-white' : 'text-gray-500'}`} title="Lined"><StickyNote size={14} /></button>
                    <button onClick={() => setPaperType('grid')} className={`p-1.5 rounded-md transition-colors ${paperType === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-500'}`} title="Grid"><div className="w-3.5 h-3.5 border border-current opacity-60 grid grid-cols-2 grid-rows-2"></div></button>
                    <button onClick={() => setPaperType('plain')} className={`p-1.5 rounded-md transition-colors ${paperType === 'plain' ? 'bg-gray-700 text-white' : 'text-gray-500'}`} title="Plain"><div className="w-3.5 h-3.5 border border-current opacity-60"></div></button>
                 </div>
                 
                 <div className="h-6 w-[1px] bg-gray-700 mx-1"></div>

                 <select onChange={e => setHandStyle(e.target.value)} className="bg-black/40 text-xs py-1.5 px-3 rounded-lg text-white border-none outline-none cursor-pointer hover:bg-black/60">
                    <option value="font-hand1">Human Cursive</option>
                    <option value="font-hand2">Natural Print</option>
                    <option value="font-hand3">Messy Note</option>
                    <option value="font-hand4">Relaxed Flow</option>
                 </select>

                 <div className="flex bg-black/40 rounded-lg p-1 gap-1">
                    <button onClick={() => setInkColor('ink-blue')} className={`w-5 h-5 rounded-full bg-blue-700 border ${inkColor === 'ink-blue' ? 'border-white' : 'border-transparent'}`}></button>
                    <button onClick={() => setInkColor('ink-black')} className={`w-5 h-5 rounded-full bg-gray-800 border ${inkColor === 'ink-black' ? 'border-white' : 'border-transparent'}`}></button>
                 </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto relative bg-[#121212]">
             {subMode === 'handwriting' ? (
                <div className={`paper-base ${paperType === 'lined' ? 'paper-lined' : paperType === 'grid' ? 'paper-grid' : 'paper-plain'}`}>
                    <div className={`${handStyle} ${inkColor} text-2xl tracking-wide whitespace-pre-wrap leading-[2rem]`}>
                        {result || (loading ? "Writing assignment..." : "Generated handwriting will appear here.")}
                    </div>
                </div>
             ) : (
                <div className="p-8 text-gray-200 min-h-full whitespace-pre-wrap font-sans leading-7">
                    {result || <div className="text-gray-500 italic">Content will appear here...</div>}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ContentView: React.FC = () => {
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [prompt, setPrompt] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [refImage, setRefImage] = useState<File | null>(null);
  
  // Settings
  const [aspectRatio, setAspectRatio] = useState(mode === 'image' ? '1:1' : '16:9');
  const [style, setStyle] = useState('none');

  useEffect(() => {
    // Reset Aspect Ratio defaults when switching mode if not compatible
    if (mode === 'video' && aspectRatio !== '16:9' && aspectRatio !== '9:16') {
        setAspectRatio('16:9');
    }
    if (mode === 'image' && aspectRatio === '9:16' && !ASPECT_RATIOS.some(r => r.id === aspectRatio)) {
        setAspectRatio('1:1');
    }
  }, [mode]);

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setMediaUrl('');
    try {
      if (mode === 'image') {
        const url = await geminiService.generateImage(prompt, { aspectRatio, style });
        setMediaUrl(url);
      } else {
        let refBase64;
        if (refImage) {
             const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(refImage);
             });
             refBase64 = base64;
        }
        const url = await geminiService.generateVideo(prompt, refBase64, { aspectRatio });
        setMediaUrl(url);
      }
    } catch (e) {
      console.error(e);
      // alert handled by component state usually, but simple alert here for ease
      alert(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-8 flex flex-col items-center justify-center bg-black/20">
      <div className="w-full max-w-4xl">
          <div className="flex justify-center mb-8">
            <div className="bg-black/40 p-1 rounded-full border border-white/10 flex">
                <button onClick={() => setMode('image')} className={`px-8 py-3 rounded-full transition-all font-medium ${mode === 'image' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Image Generation</button>
                <button onClick={() => setMode('video')} className={`px-8 py-3 rounded-full transition-all font-medium ${mode === 'video' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Video Creation</button>
            </div>
          </div>

          <div className="glass-panel rounded-3xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-purple-500 opacity-50"></div>
            
            {/* Settings Toolbar */}
            <div className="bg-black/30 border-b border-white/5 p-4 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Sliders size={16} /> <span className="font-bold text-gray-300">Settings:</span>
                </div>
                
                <div className="h-4 w-[1px] bg-white/10"></div>

                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 uppercase font-bold">Aspect Ratio</label>
                    <select 
                        value={aspectRatio}
                        onChange={e => setAspectRatio(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg text-sm px-3 py-1.5 focus:border-brand-500 outline-none"
                    >
                        {ASPECT_RATIOS.filter(r => mode === 'image' || (r.id === '16:9' || r.id === '9:16')).map(r => (
                            <option key={r.id} value={r.id}>{r.label}</option>
                        ))}
                    </select>
                </div>

                {mode === 'image' && (
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 uppercase font-bold">Visual Style</label>
                        <select 
                            value={style}
                            onChange={e => setStyle(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg text-sm px-3 py-1.5 focus:border-brand-500 outline-none"
                        >
                            {CONTENT_STYLES.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <textarea 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)}
              placeholder={`Describe the ${mode} you want to create in detail...`}
              className="w-full bg-transparent border-none p-6 min-h-[120px] focus:outline-none text-lg placeholder-gray-600 resize-none"
            />
            
            {mode === 'video' && (
                <div className="px-6 pb-4">
                    <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-dashed border-gray-700 cursor-pointer hover:border-brand-500/50 transition-colors relative">
                        <input type="file" accept="image/png, image/jpeg" onChange={e => setRefImage(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <ImageIcon size={18} className="text-gray-400" />
                        <span className="text-sm text-gray-400">{refImage ? refImage.name : "Upload reference image (PNG/JPG) for animation"}</span>
                    </div>
                </div>
            )}
            
            <div className="px-2 pb-2">
                <button 
                    onClick={generate} 
                    disabled={loading}
                    className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                {loading ? <span className="animate-pulse">{mode === 'video' ? 'Generating video (1-2 mins)...' : 'Creating masterpiece...'}</span> : <><Sparkles size={18} /> Generate {mode === 'image' ? 'Image' : 'Video'}</>}
                </button>
            </div>
          </div>

          {mediaUrl && (
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-float relative group">
              <button 
                onClick={() => setMediaUrl('')}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition-all backdrop-blur-md border border-white/10 z-20 opacity-0 group-hover:opacity-100"
                title="Close"
              >
                <X size={20} />
              </button>
              {mode === 'image' ? (
                <img src={mediaUrl} alt="Generated" className="w-full h-auto max-h-[500px] object-contain bg-black mx-auto" />
              ) : (
                <video src={mediaUrl} controls autoPlay loop className="w-full h-auto max-h-[500px] bg-black mx-auto" />
              )}
              <div className="bg-glass p-4 flex justify-between items-center bg-black/50 backdrop-blur-md">
                  <span className="text-sm text-gray-400 flex items-center gap-2"><Bot size={14}/> Generated with Gemini</span>
                  <a href={mediaUrl} download={`muciai_${Date.now()}.${mode === 'image' ? 'jpg' : 'mp4'}`} className="text-brand-400 text-sm hover:underline font-medium bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">Download Asset</a>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

const InterviewView: React.FC = () => {
    const [viewState, setViewState] = useState<'menu' | 'interview' | 'enhancer_menu' | 'tutor' | 'game'>('menu');
    const [connected, setConnected] = useState(false);
    const [volume, setVolume] = useState(0);
    const [disconnectFn, setDisconnectFn] = useState<(() => void) | null>(null);
    const [gameImage, setGameImage] = useState('');
    const [gameChat, setGameChat] = useState<{role:'user'|'model', text:string}[]>([]);
    const [gameInput, setGameInput] = useState('');
    const [loading, setLoading] = useState(false);

    const startVoice = async (systemPrompt: string) => {
        try {
            const { disconnect } = await geminiService.connectLive(
                { voiceName: 'Fenrir', systemInstruction: systemPrompt }, 
                (data) => {
                    let sum = 0;
                    for(let i = 0; i < data.length; i++) sum += data[i] * data[i];
                    setVolume(Math.sqrt(sum / data.length));
                }
            );
            setDisconnectFn(() => disconnect);
            setConnected(true);
        } catch(e) {
            console.error(e);
            alert("Connection failed.");
        }
    };

    const stopVoice = () => {
        if (disconnectFn) disconnectFn();
        setConnected(false);
        setVolume(0);
    };

    const startGame = async () => {
        setLoading(true);
        setGameImage('');
        setGameChat([]);
        try {
            const url = await geminiService.generateImage("A detailed scene of a busy public place like a market, airport, or cafe, realistic style.", { aspectRatio: '1:1', style: 'photorealistic' });
            setGameImage(url);
            setGameChat([{ role: 'model', text: 'Describe what you see in this image. I will help you with vocabulary!' }]);
        } catch(e) {
            alert("Failed to start game.");
        } finally {
            setLoading(false);
        }
    };

    const sendGameChat = async () => {
        if (!gameInput.trim()) return;
        const msgs = [...gameChat, {role: 'user' as const, text: gameInput}];
        setGameChat(msgs);
        setGameInput('');
        setLoading(true);
        try {
            const response = await geminiService.generateChat(
                msgs.map(m => ({ role: m.role, parts: [{ text: m.text }] })), 
                `${SYSTEM_PROMPTS.VISUAL_GAME} The user is describing the image.`
            );
            setGameChat([...msgs, {role: 'model', text: response || ''}]);
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (viewState === 'menu') {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                    <button onClick={() => setViewState('interview')} className="group glass-panel border border-white/5 p-10 rounded-3xl hover:bg-white/5 transition-all hover:-translate-y-2 relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:text-white transition-colors">
                            <Briefcase size={32} />
                        </div>
                        <h3 className="text-3xl font-bold mb-3">Mock Interview</h3>
                        <p className="text-gray-400">Simulate a real job interview with an AI agent. Receive feedback and improve your answers.</p>
                        <div className="mt-8 flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider">Start <ChevronRight size={16}/></div>
                    </button>

                    <button onClick={() => setViewState('enhancer_menu')} className="group glass-panel border border-white/5 p-10 rounded-3xl hover:bg-white/5 transition-all hover:-translate-y-2 relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 text-green-400 group-hover:text-white transition-colors">
                            <GraduationCap size={32} />
                        </div>
                        <h3 className="text-3xl font-bold mb-3">Language Enhancer</h3>
                        <p className="text-gray-400">Talk to a tutor, play word games, and learn using visual aids.</p>
                        <div className="mt-8 flex items-center gap-2 text-green-400 font-bold text-sm uppercase tracking-wider">Start <ChevronRight size={16}/></div>
                    </button>
                </div>
            </div>
        );
    }

    if (viewState === 'enhancer_menu') {
        return (
            <div className="h-full p-8 flex flex-col items-center justify-center">
                <button onClick={() => setViewState('menu')} className="absolute top-8 left-8 text-gray-500 hover:text-white flex items-center gap-2 transition-colors">&larr; Back</button>
                <h2 className="text-4xl font-bold mb-12">Choose Learning Mode</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                    <button onClick={() => setViewState('tutor')} className="glass-panel p-8 rounded-3xl hover:bg-white/5 text-left flex items-start gap-6 group transition-all hover:scale-[1.02]">
                        <div className="p-4 bg-green-900/30 rounded-2xl text-green-400 group-hover:text-white transition-colors"><Headphones size={32} /></div>
                        <div>
                            <div className="font-bold text-2xl mb-2">Voice Tutor</div>
                            <div className="text-gray-400">Conversational practice with instant corrections.</div>
                        </div>
                    </button>
                    <button onClick={() => { setViewState('game'); startGame(); }} className="glass-panel p-8 rounded-3xl hover:bg-white/5 text-left flex items-start gap-6 group transition-all hover:scale-[1.02]">
                        <div className="p-4 bg-purple-900/30 rounded-2xl text-purple-400 group-hover:text-white transition-colors"><Gamepad2 size={32} /></div>
                        <div>
                            <div className="font-bold text-2xl mb-2">Visual Learning</div>
                            <div className="text-gray-400">Describe generated images and learn vocabulary contextually.</div>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    if (viewState === 'interview' || viewState === 'tutor') {
        const isInterview = viewState === 'interview';
        return (
            <div className="h-full flex flex-col items-center justify-center relative bg-black/40">
                <button 
                    onClick={() => { stopVoice(); setViewState(isInterview ? 'menu' : 'enhancer_menu'); }} 
                    className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-2"
                >
                    <X size={20} /> Exit
                </button>

                <div className="relative mb-16">
                     <div className={`w-80 h-80 rounded-full bg-gradient-to-tr ${isInterview ? 'from-blue-600 to-indigo-600' : 'from-green-600 to-teal-600'} blur-[100px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 opacity-60`} style={{ transform: `translate(-50%, -50%) scale(${1 + volume * 5})` }} />
                    <div className="w-48 h-48 rounded-full glass-panel border border-white/10 flex items-center justify-center relative z-10 shadow-2xl">
                        {isInterview ? <Briefcase className="w-20 h-20 text-blue-400" /> : <GraduationCap className="w-20 h-20 text-green-400" />}
                    </div>
                </div>

                <h2 className="text-4xl font-bold mb-4">{isInterview ? 'Mock Interview' : 'Language Tutor'}</h2>
                <p className="text-gray-400 mb-12 max-w-md text-center text-lg leading-relaxed">
                    {isInterview 
                        ? "I am your interviewer. We will discuss your background and skills." 
                        : "I am here to help you speak better. Let's have a conversation!"}
                </p>

                <button 
                    onClick={() => connected ? stopVoice() : startVoice(isInterview ? SYSTEM_PROMPTS.INTERVIEW : SYSTEM_PROMPTS.LANGUAGE_TUTOR)}
                    className={`px-12 py-5 rounded-full font-bold text-lg shadow-xl transition-all hover:scale-105 ${connected ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
                >
                    {connected ? 'End Session' : 'Start Session'}
                </button>
            </div>
        );
    }

    if (viewState === 'game') {
        return (
            <div className="h-full flex flex-col p-6 bg-black/40">
                 <button onClick={() => setViewState('enhancer_menu')} className="self-start text-gray-400 mb-6 hover:text-white flex items-center gap-2"><ChevronRight size={20} className="rotate-180"/> Back</button>
                 <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
                    <div className="flex-1 bg-black/40 rounded-3xl flex items-center justify-center border border-white/5 relative min-h-0 overflow-hidden group">
                        {loading && !gameImage && <div className="flex flex-col items-center gap-4"><div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div><span className="text-purple-400 font-bold">Generating Scenario...</span></div>}
                        {gameImage && <img src={gameImage} alt="Game Scenario" className="w-full h-full object-contain" />}
                        <button onClick={startGame} className="absolute bottom-6 right-6 bg-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-500 shadow-lg flex items-center gap-2 transition-transform hover:scale-105"><Sparkles size={18}/> New Image</button>
                    </div>

                    <div className="flex-1 flex flex-col glass-panel rounded-3xl overflow-hidden min-h-0">
                         <div className="p-4 border-b border-white/5 bg-white/5 font-bold flex items-center gap-2"><MessageSquare size={18} className="text-purple-400"/> Chat Context</div>
                         <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {gameChat.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-gray-800 text-gray-200 rounded-tl-sm'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {loading && gameImage && <div className="text-xs text-gray-500 ml-4 animate-pulse">Teacher is typing...</div>}
                         </div>
                         <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3">
                             <input 
                                value={gameInput}
                                onChange={e => setGameInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendGameChat()}
                                placeholder="Describe what you see..."
                                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:bg-black/50 transition-colors"
                             />
                             <button onClick={sendGameChat} className="bg-purple-600 p-3 rounded-xl hover:bg-purple-500 transition-colors"><Send size={20} /></button>
                         </div>
                    </div>
                 </div>
            </div>
        );
    }

    return null;
}

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [section, setSection] = useState<Section>(Section.CHAT);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  const activeAgent = AGENTS.find(a => a.id === user.preferences.agentId) || AGENTS[0];
  const logout = () => { setUser(null); setSection(Section.CHAT); };
  
  const handlePreview = async (agent: AgentPersona) => {
    if (loadingVoiceId === agent.id || playingVoiceId === agent.id) return;
    
    setLoadingVoiceId(agent.id);
    try {
        await geminiService.previewVoice(
            agent.voiceName, 
            `Hello, I am ${agent.name}.`, 
            () => setPlayingVoiceId(null)
        );
        setLoadingVoiceId(null);
        setPlayingVoiceId(agent.id);
    } catch (e) {
        console.error("Preview failed", e);
        setLoadingVoiceId(null);
        alert("Could not play voice preview.");
    }
  };

  const renderSection = () => {
    switch(section) {
      case Section.CHAT: return <ChatView activeAgent={activeAgent} />;
      case Section.VOICE: return <VoiceView activeAgent={activeAgent} />;
      case Section.ANALYZE: return <AnalyzeView />;
      case Section.CONTENT: return <ContentView />;
      case Section.INTERVIEW: return <InterviewView />;
      default: return <ChatView activeAgent={activeAgent} />;
    }
  };

  return (
    <div className="flex h-screen text-white font-sans overflow-hidden bg-black selection:bg-brand-500/30">
      {/* Sidebar - Glassmorphism */}
      <div className={`${sidebarOpen ? 'w-80 p-4' : 'w-0 p-0'} glass-panel border-r border-white/5 transition-all duration-300 flex flex-col z-50 relative overflow-hidden`}>
        {/* Sidebar Inner Container to prevent squash */}
        <div className="flex-1 flex flex-col min-w-[19rem] h-full">
            <div className="flex items-center gap-3 px-4 mb-8 mt-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                </div>
                <h1 className="font-bold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-purple-400">Muse AI</h1>
            </div>

            <nav className="space-y-2 flex-1">
                {[
                    { id: Section.CHAT, icon: MessageSquare, label: 'Chat' },
                    { id: Section.VOICE, icon: Mic, label: 'Voice Mode' },
                    { id: Section.ANALYZE, icon: FileText, label: 'Analyze Docs' },
                    { id: Section.CONTENT, icon: ImageIcon, label: 'Content Studio' },
                    { id: Section.INTERVIEW, icon: Briefcase, label: 'Interview & Learn' },
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setSection(item.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group relative overflow-hidden ${section === item.id ? 'text-white font-semibold shadow-lg shadow-brand-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        {section === item.id && <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 opacity-20"></div>}
                        {section === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-400"></div>}
                        
                        <item.icon size={22} className={`${section === item.id ? 'text-brand-400' : 'group-hover:text-gray-200'}`} />
                        <span className="relative z-10">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* User Profile - Bottom of Sidebar */}
            <div className="mt-auto pt-4 border-t border-white/10 relative">
                <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-full flex items-center gap-3 hover:bg-white/5 p-3 rounded-xl transition-colors text-left"
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold text-sm border border-white/10 shadow-lg shrink-0">
                        {(user.name?.[0] || user.email[0]).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold leading-none truncate">{user.name || user.email.split('@')[0]}</p>
                        <p className="text-[10px] text-brand-400 font-medium pt-1">PRO PLAN</p>
                    </div>
                </button>

                {showUserMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-full glass-panel border border-white/10 rounded-xl shadow-2xl p-1 backdrop-blur-xl animate-float-up z-50 origin-bottom">
                         <button onClick={() => { setShowSettings(true); setShowUserMenu(false); }} className="w-full text-left p-3 hover:bg-white/10 rounded-lg text-sm flex gap-3 items-center transition-colors"><Settings size={16}/> Settings</button>
                         <button onClick={() => { setShowHistory(true); setShowUserMenu(false); }} className="w-full text-left p-3 hover:bg-white/10 rounded-lg text-sm flex gap-3 items-center transition-colors"><History size={16}/> History</button>
                         <div className="h-px bg-white/10 my-1"></div>
                         <button onClick={logout} className="w-full text-left p-3 hover:bg-red-500/20 text-red-400 rounded-lg text-sm flex gap-3 items-center transition-colors"><LogOut size={16}/> Logout</button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-0 min-w-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
                 {/* Toggle Button */}
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                    <Menu size={24} />
                </button>
                
                <h2 className="font-bold text-xl tracking-wide flex items-center gap-2">
                    {section === Section.CONTENT ? 'Content Studio' : section.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h2>
            </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
            {renderSection()}
        </main>

        {/* Modal Overlays */}
        {(showSettings || showHistory) && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl border border-white/10 p-8 relative shadow-2xl">
                    <button onClick={() => {setShowSettings(false); setShowHistory(false)}} className="absolute top-6 right-6 text-gray-400 hover:text-white"><X size={24}/></button>
                    
                    {showSettings && (
                        <>
                            <h2 className="text-3xl font-bold mb-8">Settings</h2>
                            <h3 className="text-brand-400 mb-6 font-bold uppercase text-sm tracking-wider">Select Personal Agent</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {AGENTS.map(a => (
                                    <div 
                                        key={a.id} 
                                        onClick={() => {
                                            const newUser = { ...user, preferences: { agentId: a.id }};
                                            localStorage.setItem(`user_${user.email}`, JSON.stringify(newUser));
                                            setUser(newUser);
                                        }}
                                        className={`p-4 rounded-xl border cursor-pointer flex gap-4 items-center transition-all ${user.preferences.agentId === a.id ? 'border-brand-500 bg-brand-500/20' : 'border-white/10 hover:bg-white/5 hover:border-white/30'}`}
                                    >
                                        <Avatar agent={a} size="md" />
                                        <div className="flex-1">
                                            <div className="font-bold text-lg flex items-center gap-2">
                                                {a.name}
                                                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full font-normal text-gray-300">{a.style}</span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">{a.description}</div>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePreview(a);
                                            }}
                                            className={`p-3 rounded-full transition-all border border-white/5 ${
                                                playingVoiceId === a.id ? 'bg-brand-500 text-white animate-pulse' : 
                                                loadingVoiceId === a.id ? 'bg-white/10 text-gray-400 cursor-wait' :
                                                'bg-white/5 hover:bg-white/10 text-gray-300'
                                            }`}
                                            title="Preview Voice"
                                            disabled={loadingVoiceId !== null && loadingVoiceId !== a.id}
                                        >
                                            {loadingVoiceId === a.id ? (
                                                <Loader2 size={20} className="animate-spin" />
                                            ) : playingVoiceId === a.id ? (
                                                <Volume2 size={20} />
                                            ) : (
                                                <Play size={20} className="ml-0.5" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {showHistory && (
                        <>
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold">History</h2>
                            </div>
                            <div className="text-gray-400 text-center py-20 flex flex-col items-center gap-4">
                                <History size={48} className="opacity-20"/>
                                <p>Your local history is empty.</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;