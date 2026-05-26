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
      <section className="relative px-4 pt-8 pb-24 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/5 text-yellow-500 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D084]" />
            {t('home.hero.badge')}
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8">
            {t('home.hero.title1')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">{t('home.hero.title2')}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-400 mx-auto mb-10">
            {t('home.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses" className={`bg-yellow-500 text-black px-8 py-4 rounded-md font-bold text-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {t('home.hero.explore')} {isRtl ? <ArrowRight size={20} className="rotate-180" /> : <ArrowRight size={20} />}
            </Link>
            <Link to="/analysis" className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-md font-bold text-lg hover:bg-white/10 transition-colors">
              {t('home.hero.analysis')}
            </Link>
          </div>
        </div>
      </section>

      {/* Ticker Section */}
      <Ticker />

      {/* Features */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold">{t('home.learn.title')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#0B0F19] border border-white/5 hover:border-white/10 transition-colors rounded-2xl p-8 flex flex-col items-center text-center">
              <TrendingUp className="text-yellow-500 mb-6" size={32} />
              <h3 className="text-lg font-bold mb-3 text-white">{t('home.learn.f1.title')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t('home.learn.f1.desc')}</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-[#0B0F19] border border-white/5 hover:border-white/10 transition-colors rounded-2xl p-8 flex flex-col items-center text-center">
              <ShieldCheck className="text-yellow-500 mb-6" size={32} />
              <h3 className="text-lg font-bold mb-3 text-white">{t('home.learn.f2.title')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t('home.learn.f2.desc')}</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-[#0B0F19] border border-white/5 hover:border-white/10 transition-colors rounded-2xl p-8 flex flex-col items-center text-center">
              <Brain className="text-yellow-500 mb-6" size={32} />
              <h3 className="text-lg font-bold mb-3 text-white">{t('home.learn.f3.title')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t('home.learn.f3.desc')}</p>
            </div>
            {/* Feature 4 */}
            <div className="bg-[#0B0F19] border border-white/5 hover:border-white/10 transition-colors rounded-2xl p-8 flex flex-col items-center text-center">
              <Trophy className="text-yellow-500 mb-6" size={32} />
              <h3 className="text-lg font-bold mb-3 text-white">{t('home.learn.f4.title')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t('home.learn.f4.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold mb-4">{t('home.courses.title')}</h2>
          <p className="text-gray-400 text-lg">{t('home.courses.subtitle')}</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course, index) => {
            const isFree = course.price === 0;
            // Fake category/level for visual parity with screenshot
            const levels = ['Intermediate', 'Beginner', 'Pro'];
            const level = levels[index % levels.length];
            const categories = ['Price Action', 'Risk Management', 'Funded Accounts'];
            const category = categories[index % categories.length];

            return (
              <Link key={course.id} to={`/courses/${course.id}`} className="group bg-[#0B0F19] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors flex flex-col">
                <div className="relative aspect-video overflow-hidden">
                  <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  {isFree && (
                    <div className="absolute top-3 left-3 bg-[#00D084] text-black px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                      {t('home.courses.free')}
                    </div>
                  )}
                  
                  <div className={`absolute top-3 right-3 px-3 py-1 border rounded-md text-xs font-medium bg-black/50 backdrop-blur-md
                    ${level === 'Beginner' ? 'text-[#00D084] border-[#00D084]/30' : 
                      level === 'Intermediate' ? 'text-yellow-500 border-yellow-500/30' : 
                      'text-red-400 border-red-400/30'}
                  `}>
                    {level}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow text-start">
                  <div className="text-yellow-500 font-medium text-sm mb-2">{category}</div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{course.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-8 flex-grow leading-relaxed">{course.description}</p>
                  
                  <div className="flex justify-between items-end mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Star size={16} className="text-yellow-400 fill-yellow-400 pb-0.5" />
                        {(course.avg_rating || 0).toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={16} className="pb-0.5" />
                        {course.review_count || 0}
                      </div>
                    </div>
                    <span className={`font-bold text-2xl ${isFree ? 'text-[#00D084]' : 'text-yellow-500'}`}>
                      {isFree ? t('home.courses.free_price') : `$${course.price}`}
                    </span>
                  </div>
                  
                  <div className={`text-sm text-gray-500 pt-4 border-t border-white/5 ${isRtl ? 'text-right' : 'text-left'}`}>
                    {t('home.courses.by')} {course.instructor}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 text-center flex justify-center">
          <Link to="/courses" className={`inline-flex items-center gap-2 bg-transparent border border-white/20 hover:border-yellow-500 hover:text-yellow-500 text-white px-8 py-3 rounded-md font-bold transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}>
            {t('home.courses.viewAll')} {isRtl ? <ArrowRight size={18} className="rotate-180" /> : <ArrowRight size={18} />}
          </Link>
        </div>
      </section>
    </div>
  );
}
