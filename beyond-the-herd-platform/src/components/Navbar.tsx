import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, BookOpen, ShieldCheck, ChevronDown, Heart, Shirt, Headphones } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useLangStore, LanguageCode } from '../store/lang';
import logo from '../assets/images/wolf_logo_minimal_1779397330316.png';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { currentLangCode, setLangCode, t } = useLangStore();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const languages: { code: LanguageCode, label: string, flagUrl: string }[] = [
    { code: 'EN', label: 'English', flagUrl: 'https://hatscripts.github.io/circle-flags/flags/gb.svg' },
    { code: 'FR', label: 'Français', flagUrl: 'https://hatscripts.github.io/circle-flags/flags/fr.svg' },
    { code: 'AR', label: 'العربية', flagUrl: 'https://hatscripts.github.io/circle-flags/flags/sa.svg' },
  ];
  
  const currentLang = languages.find(l => l.code === currentLangCode) || languages[0];

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isRtl = currentLangCode === 'AR';

  return (
    <nav className="border-b border-gray-800 bg-black text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1 flex items-center justify-start">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Beyond The Herd Logo" className="w-10 h-10 object-cover rounded-md" />
              <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                Beyond The Herd
              </span>
            </Link>
          </div>
            
          <div className="hidden md:flex items-center justify-center space-x-8 flex-1" dir={isRtl ? 'rtl' : 'ltr'}>
            <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium text-sm transition-colors">{t('nav.home')}</Link>
            <Link to="/courses" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium text-sm transition-colors">{t('nav.courses')}</Link>
            <Link to="/analysis" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium text-sm transition-colors">{t('nav.analysis')}</Link>
            
            {/* About Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors cursor-pointer outline-none ${isDropdownOpen ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white'} group`}>
                {t('nav.about')} <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div 
                className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[700px] z-50 origin-top transform transition-all duration-300 ${isDropdownOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'}`}
              >
                <div className="bg-white rounded-2xl shadow-2xl p-8 relative">
                  {/* Arrow up */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45 rounded-sm shadow-sm pointer-events-none"></div>
                  
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
                  {/* Company */}
                  <div>
                    <h3 className={`text-[#6B7280] text-sm font-bold tracking-wide mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('nav.company')}</h3>
                    <div className="space-y-1">
                      <Link to="/about" className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-[#F0F6FF] text-[#0066FF] flex items-center justify-center shrink-0">
                          <Heart size={20} className="fill-[#0066FF]" />
                        </div>
                        <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors mb-0.5">{t('nav.aboutUs')}</h4>
                          <p className="text-xs text-gray-500 font-medium leading-relaxed">{t('nav.aboutUsDesc')}</p>
                        </div>
                      </Link>

                      <Link to="/shop" className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-[#F0F6FF] text-[#0066FF] flex items-center justify-center shrink-0">
                          <Shirt size={20} className="fill-[#0066FF]" />
                        </div>
                        <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors mb-0.5">{t('nav.shop')}</h4>
                          <p className="text-xs text-gray-500 font-medium leading-relaxed">{t('nav.shopDesc')}</p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Connect */}
                  <div>
                    <h3 className={`text-[#6B7280] text-sm font-bold tracking-wide mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('nav.connect')}</h3>
                    <div className="space-y-1">
                       <Link to="/contact" className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-[#F0F6FF] text-[#0066FF] flex items-center justify-center shrink-0">
                          <Headphones size={20} />
                        </div>
                        <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors mb-0.5">{t('nav.contactUs')}</h4>
                          <p className="text-xs text-gray-500 font-medium leading-relaxed">{t('nav.contactUsDesc')}</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-end space-x-4">
            {/* Language Selector */}
            <div 
              className="relative"
              ref={langDropdownRef}
            >
              <button 
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer outline-none ${isLangDropdownOpen ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white'}`}
              >
                <img src={currentLang.flagUrl} alt={currentLang.label} className="w-[18px] h-[18px] rounded-full object-cover" />
                <span>{currentLang.code}</span>
              </button>
              
              <div 
                className={`absolute ${isRtl ? 'left-0 origin-top-left' : 'right-0 origin-top-right'} mt-2 w-48 rounded-2xl shadow-2xl bg-white z-50 transform transition-all duration-200 border border-black/5 py-2 ${isLangDropdownOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'}`}
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {languages.map(lang => (
                  <button 
                    key={lang.code}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-3 font-medium transition-colors ${currentLangCode === lang.code ? 'text-[#0066FF] font-bold bg-[#F0F6FF]/50' : 'text-gray-900 hover:text-[#0066FF]'}`}
                    onClick={() => {
                      setLangCode(lang.code);
                      setIsLangDropdownOpen(false);
                    }}
                  >
                    <img src={lang.flagUrl} alt={lang.label} className="w-5 h-5 rounded-full object-cover shrink-0" />
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'admin' && (
                   <Link to="/admin" className="text-gray-300 hover:text-yellow-500 flex items-center gap-2 transition-colors">
                     <ShieldCheck size={18} />
                     <span className="text-sm font-medium hidden sm:block">{t('nav.admin')}</span>
                   </Link>
                )}
                <div className="h-6 w-px bg-gray-700 mx-2"></div>
                
                <div className="relative" ref={userDropdownRef}>
                  <button 
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer outline-none"
                  >
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white border border-gray-600">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="hidden sm:block">{user.name}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <div 
                    className={`absolute right-0 mt-[23px] ml-0 w-48 rounded-2xl shadow-2xl bg-white z-50 transform transition-all duration-200 border border-black/5 py-2 ${isUserDropdownOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'}`}
                    dir={isRtl ? 'rtl' : 'ltr'}
                  >
                    <Link 
                      to="/profile" 
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-yellow-600 transition-colors"
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-yellow-600 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button 
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        handleLogout();
                      }} 
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">{t('nav.login')}</Link>
                <Link to="/register" className="bg-yellow-500 text-black hover:bg-yellow-400 px-4 py-2 rounded-md text-sm font-bold transition-colors">{t('nav.signup')}</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
