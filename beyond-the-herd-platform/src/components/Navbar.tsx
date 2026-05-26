import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, BookOpen, ShieldCheck, ChevronDown, Heart, Shirt, Headphones, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const languages: { code: LanguageCode, label: string, flagUrl: string }[] = [
    { code: 'EN', label: 'English', flagUrl: 'https://hatscripts.github.io/circle-flags/flags/gb.svg' },
    { code: 'FR', label: 'Français', flagUrl: 'https://hatscripts.github.io/circle-flags/flags/fr.svg' },
    { code: 'AR', label: 'العربية', flagUrl: 'https://hatscripts.github.io/circle-flags/flags/sa.svg' },
  ];

  const currentLang = languages.find(l => l.code === currentLangCode) || languages[0];

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isRtl = currentLangCode === 'AR';

  return (
    <nav className="border-b border-gray-800 bg-black text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <img src={logo} alt="Beyond The Herd Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-md" />
              <span className="text-base sm:text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 hidden xs:block">
                Beyond The Herd
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden lg:flex items-center justify-center space-x-8 flex-1" dir={isRtl ? 'rtl' : 'ltr'}>
            <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium text-sm transition-colors">{t('nav.home')}</Link>
            <Link to="/courses" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium text-sm transition-colors">{t('nav.courses')}</Link>
            <Link to="/analysis" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium text-sm transition-colors">{t('nav.analysis')}</Link>

            {/* About Dropdown - Desktop */}
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors cursor-pointer outline-none ${isDropdownOpen ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white'} group`}>
                {t('nav.about')} <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[600px] xl:w-[700px] z-50 origin-top transform transition-all duration-300 ${isDropdownOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'}`}
              >
                <div className="bg-white rounded-2xl shadow-2xl p-6 xl:p-8 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45 rounded-sm shadow-sm pointer-events-none"></div>

                  <div className="grid grid-cols-2 gap-x-8 xl:gap-x-12 gap-y-4 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
                    <div>
                      <h3 className={`text-[#6B7280] text-sm font-bold tracking-wide mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('nav.company')}</h3>
                      <div className="space-y-1">
                        <Link to="/about" className="flex items-start gap-3 xl:gap-4 p-2 xl:p-3 rounded-xl hover:bg-gray-50 transition-colors group" onClick={() => setIsDropdownOpen(false)}>
                          <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-lg bg-[#F0F6FF] text-[#0066FF] flex items-center justify-center shrink-0">
                            <Heart size={18} className="xl:w-5 xl:h-5 fill-[#0066FF]" />
                          </div>
                          <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                            <h4 className="text-xs xl:text-sm font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors mb-0.5">{t('nav.aboutUs')}</h4>
                            <p className="text-[10px] xl:text-xs text-gray-500 font-medium leading-relaxed hidden md:block">{t('nav.aboutUsDesc')}</p>
                          </div>
                        </Link>

                        <Link to="/shop" className="flex items-start gap-3 xl:gap-4 p-2 xl:p-3 rounded-xl hover:bg-gray-50 transition-colors group" onClick={() => setIsDropdownOpen(false)}>
                          <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-lg bg-[#F0F6FF] text-[#0066FF] flex items-center justify-center shrink-0">
                            <Shirt size={18} className="xl:w-5 xl:h-5 fill-[#0066FF]" />
                          </div>
                          <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                            <h4 className="text-xs xl:text-sm font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors mb-0.5">{t('nav.shop')}</h4>
                            <p className="text-[10px] xl:text-xs text-gray-500 font-medium leading-relaxed hidden md:block">{t('nav.shopDesc')}</p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-[#6B7280] text-sm font-bold tracking-wide mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('nav.connect')}</h3>
                      <div className="space-y-1">
                        <Link to="/contact" className="flex items-start gap-3 xl:gap-4 p-2 xl:p-3 rounded-xl hover:bg-gray-50 transition-colors group" onClick={() => setIsDropdownOpen(false)}>
                          <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-lg bg-[#F0F6FF] text-[#0066FF] flex items-center justify-center shrink-0">
                            <Headphones size={18} className="xl:w-5 xl:h-5" />
                          </div>
                          <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                            <h4 className="text-xs xl:text-sm font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors mb-0.5">{t('nav.contactUs')}</h4>
                            <p className="text-[10px] xl:text-xs text-gray-500 font-medium leading-relaxed hidden md:block">{t('nav.contactUsDesc')}</p>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Selector - Desktop */}
            <div
              className="relative hidden sm:block"
              ref={langDropdownRef}
            >
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg font-bold text-xs sm:text-sm transition-colors cursor-pointer outline-none min-h-[44px] ${isLangDropdownOpen ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white'}`}
              >
                <img src={currentLang.flagUrl} alt={currentLang.label} className="w-[18px] h-[18px] rounded-full object-cover" />
                <span className="hidden sm:inline">{currentLang.code}</span>
              </button>

              <div
                className={`absolute ${isRtl ? 'left-0 origin-top-left' : 'right-0 origin-top-right'} mt-2 w-48 rounded-2xl shadow-2xl bg-white z-50 transform transition-all duration-200 border border-black/5 py-2 ${isLangDropdownOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'}`}
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-3 font-medium transition-colors min-h-[48px] ${currentLangCode === lang.code ? 'text-[#0066FF] font-bold bg-[#F0F6FF]/50' : 'text-gray-900 hover:text-[#0066FF]'}`}
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

            {/* User Menu - Desktop */}
            {user ? (
              <div className="hidden lg:flex items-center gap-2 sm:gap-4">
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-300 hover:text-yellow-500 flex items-center gap-2 transition-colors px-2 py-2 min-h-[44px]">
                    <ShieldCheck size={18} />
                    <span className="text-sm font-medium">{t('nav.admin')}</span>
                  </Link>
                )}
                <div className="h-6 w-px bg-gray-700 hidden sm:block"></div>

                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer outline-none px-2 py-2 min-h-[44px]"
                  >
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white border border-gray-600">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="hidden md:block max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl bg-white z-50 transform transition-all duration-200 border border-black/5 py-2 ${isUserDropdownOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'}`}
                    dir={isRtl ? 'rtl' : 'ltr'}
                  >
                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-yellow-600 transition-colors min-h-[48px] flex items-center"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-yellow-600 transition-colors min-h-[48px] flex items-center"
                    >
                      Dashboard
                    </Link>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2 min-h-[48px]"
                    >
                      <LogOut size={14} />
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2 sm:gap-4">
                <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors min-h-[44px] flex items-center">{t('nav.login')}</Link>
                <Link to="/register" className="bg-yellow-500 text-black hover:bg-yellow-400 px-4 py-2 rounded-md text-sm font-bold transition-colors min-h-[44px] flex items-center">{t('nav.signup')}</Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`lg:hidden absolute top-full left-0 right-0 bg-black border-b border-gray-800 shadow-xl transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
          {/* Navigation Links */}
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium min-h-[48px] flex items-center">
            {t('nav.home')}
          </Link>
          <Link to="/courses" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium min-h-[48px] flex items-center">
            {t('nav.courses')}
          </Link>
          <Link to="/analysis" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium min-h-[48px] flex items-center">
            {t('nav.analysis')}
          </Link>

          {/* About Links - Mobile */}
          <div className="border-t border-gray-800 pt-2 mt-2">
            <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">{t('nav.company')}</h3>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors min-h-[48px]">
              <Heart size={20} className="text-yellow-500" />
              <span className="font-medium">{t('nav.aboutUs')}</span>
            </Link>
            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors min-h-[48px]">
              <Shirt size={20} className="text-yellow-500" />
              <span className="font-medium">{t('nav.shop')}</span>
            </Link>
          </div>

          <div className="border-t border-gray-800 pt-2 mt-2">
            <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">{t('nav.connect')}</h3>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors min-h-[48px]">
              <Headphones size={20} className="text-yellow-500" />
              <span className="font-medium">{t('nav.contactUs')}</span>
            </Link>
          </div>

          {/* Language Selector - Mobile */}
          <div className="border-t border-gray-800 pt-3 mt-3">
            <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Language</h3>
            <div className="flex gap-2 px-4">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLangCode(lang.code);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors min-h-[44px] ${currentLangCode === lang.code ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'text-gray-300 hover:bg-white/5'}`}
                >
                  <img src={lang.flagUrl} alt={lang.label} className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-sm font-medium">{lang.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Actions - Mobile */}
          <div className="border-t border-gray-800 pt-3 mt-3">
            {user ? (
              <>
                <div className="px-4 py-3 flex items-center gap-3">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-white border border-gray-600">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </div>

                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors min-h-[48px]">
                    <ShieldCheck size={20} className="text-yellow-500" />
                    <span className="font-medium">{t('nav.admin')}</span>
                  </Link>
                )}

                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium min-h-[48px] flex items-center">
                  Dashboard
                </Link>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium min-h-[48px] flex items-center">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-colors min-h-[48px]"
                >
                  <LogOut size={20} />
                  <span className="font-medium">{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-center border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 rounded-lg transition-colors font-medium min-h-[48px] flex items-center justify-center">
                  {t('nav.login')}
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-center bg-yellow-500 text-black hover:bg-yellow-400 rounded-lg transition-colors font-bold min-h-[48px] flex items-center justify-center">
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
