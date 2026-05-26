import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, ShieldCheck, Activity, Star, Users, Brain, Trophy } from 'lucide-react';
import { Ticker } from '../components/Ticker';
import { useLangStore } from '../store/lang';

import { getCourses } from '../lib/data';

export function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const { t, currentLangCode } = useLangStore();

  useEffect(() => {
    getCourses()
      .then(data => {
        if (data) setFeaturedCourses(data.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const isRtl = currentLangCode === 'AR';

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="relative px-4 pt-8 pb-12 sm:pb-16 lg:pb-24 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-[600px] sm:w-[800px] lg:w-[1000px] h-[600px] sm:h-[800px] lg:h-[1000px] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[500px] sm:w-[600px] lg:w-[800px] h-[500px] sm:h-[600px] lg:h-[800px] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/5 text-yellow-500 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D084]" />
            {t('home.hero.badge')}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold tracking-tight mb-4 sm:mb-6 lg:mb-8 px-2">
            <span className="block">{t('home.hero.title1')}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">{t('home.hero.title2')}</span>
          </h1>
          <p className="mt-2 sm:mt-4 max-w-xs sm:max-w-md lg:max-w-2xl text-base sm:text-lg lg:text-xl text-gray-400 mx-auto mb-6 sm:mb-8 lg:mb-10 px-4 leading-relaxed">
            {t('home.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto px-4 sm:px-0">
            <Link to="/courses" className={`bg-yellow-500 text-black px-6 sm:px-8 py-3 sm:py-4 rounded-md font-bold text-base sm:text-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[56px] ${isRtl ? 'flex-row-reverse' : ''}`}>
              {t('home.hero.explore')} {isRtl ? <ArrowRight size={18} className="sm:w-5 sm:h-5 rotate-180" /> : <ArrowRight size={18} className="sm:w-5 sm:h-5" />}
            </Link>
            <Link to="/analysis" className="bg-white/5 border border-white/10 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-md font-bold text-base sm:text-lg hover:bg-white/10 transition-colors min-h-[48px] sm:min-h-[56px] flex items-center justify-center">
              {t('home.hero.analysis')}
            </Link>
          </div>
        </div>
      </section>

      {/* Ticker Section */}
      <Ticker />

      {/* Features */}
      <section className="py-12 sm:py-16 lg:py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">{t('home.learn.title')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Feature 1 */}
            <div className="bg-[#0B0F19] border border-white/5 hover:border-white/10 transition-colors rounded-xl sm:rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center">
              <TrendingUp className="text-yellow-500 mb-4 sm:mb-6" size={28} />
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-white">{t('home.learn.f1.title')}</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{t('home.learn.f1.desc')}</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-[#0B0F19] border border-white/5 hover:border-white/10 transition-colors rounded-xl sm:rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center">
              <ShieldCheck className="text-yellow-500 mb-4 sm:mb-6" size={28} />
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-white">{t('home.learn.f2.title')}</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{t('home.learn.f2.desc')}</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-[#0B0F19] border border-white/5 hover:border-white/10 transition-colors rounded-xl sm:rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center">
              <Brain className="text-yellow-500 mb-4 sm:mb-6" size={28} />
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-white">{t('home.learn.f3.title')}</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{t('home.learn.f3.desc')}</p>
            </div>
            {/* Feature 4 */}
            <div className="bg-[#0B0F19] border border-white/5 hover:border-white/10 transition-colors rounded-xl sm:rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center">
              <Trophy className="text-yellow-500 mb-4 sm:mb-6" size={28} />
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-white">{t('home.learn.f4.title')}</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{t('home.learn.f4.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4">{t('home.courses.title')}</h2>
          <p className="text-gray-400 text-base sm:text-lg">{t('home.courses.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredCourses.map((course, index) => {
            const isFree = course.price === 0;
            const levels = ['Intermediate', 'Beginner', 'Pro'];
            const level = levels[index % levels.length];
            const categories = ['Price Action', 'Risk Management', 'Funded Accounts'];
            const category = categories[index % categories.length];

            return (
              <Link key={course.id} to={`/courses/${course.id}`} className="group bg-[#0B0F19] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden hover:border-white/10 transition-colors flex flex-col">
                <div className="relative aspect-video overflow-hidden">
                  <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                  {isFree && (
                    <div className="absolute top-3 left-3 bg-[#00D084] text-black px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                      {t('home.courses.free')}
                    </div>
                  )}

                  <div className={`absolute top-3 right-3 px-2 sm:px-3 py-1 border rounded-md text-xs font-medium bg-black/50 backdrop-blur-md
                    ${level === 'Beginner' ? 'text-[#00D084] border-[#00D084]/30' :
                      level === 'Intermediate' ? 'text-yellow-500 border-yellow-500/30' :
                      'text-red-400 border-red-400/30'}
                  `}>
                    {level}
                  </div>
                </div>

                <div className="p-4 sm:p-6 flex flex-col flex-grow text-start">
                  <div className="text-yellow-500 font-medium text-xs sm:text-sm mb-1.5 sm:mb-2">{category}</div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-white line-clamp-2">{course.title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-4 sm:mb-6 flex-grow leading-relaxed">{course.description}</p>

                  <div className="flex justify-between items-end mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center gap-1 sm:gap-1.5 font-bold text-white">
                        <Star size={14} className="sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400 pb-0.5" />
                        {(course.avg_rating || 0).toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <Users size={14} className="sm:w-4 sm:h-4 pb-0.5" />
                        {course.review_count || 0}
                      </div>
                    </div>
                    <span className={`font-bold text-lg sm:text-xl md:text-2xl ${isFree ? 'text-[#00D084]' : 'text-yellow-500'}`}>
                      {isFree ? t('home.courses.free_price') : `$${course.price}`}
                    </span>
                  </div>

                  <div className={`text-xs sm:text-sm text-gray-500 pt-3 sm:pt-4 border-t border-white/5 ${isRtl ? 'text-right' : 'text-left'}`}>
                    {t('home.courses.by')} {course.instructor}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 sm:mt-12 text-center flex justify-center">
          <Link to="/courses" className={`inline-flex items-center gap-2 bg-transparent border border-white/20 hover:border-yellow-500 hover:text-yellow-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-md font-bold text-sm sm:text-base transition-colors min-h-[44px] sm:min-h-[48px] ${isRtl ? 'flex-row-reverse' : ''}`}>
            {t('home.courses.viewAll')} {isRtl ? <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] rotate-180" /> : <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />}
          </Link>
        </div>
      </section>
    </div>
  );
}
