import React, { useEffect, useState } from 'react';
import { ExternalLink, Clock, User, AlertCircle, Tag, Calendar, ArrowRight } from 'lucide-react';
import { useLangStore } from '../store/lang';

interface AnalysisItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  date: string;
  author: string;
  category?: string;
}

export function AnalysisPage() {
  const [news, setNews] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t, currentLangCode } = useLangStore();
  const isRtl = currentLangCode === 'AR';

  useEffect(() => {
    fetch('/api/analysis')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch analysis');
        return res.json();
      })
      .then(data => {
        setNews(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load market analysis. Please try again later.');
        setLoading(false);
      });
  }, []);

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className={`min-h-screen bg-black text-white px-4 py-12 sm:px-6 lg:px-8`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display font-bold mb-4">{t('analysis.title')}</h1>
        <p className="text-gray-400 mb-12">{t('analysis.subtitle')}</p>
        
        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-xl flex items-center gap-3">
             <AlertCircle size={24} className="shrink-0" />
             <p>{t('analysis.error')}</p>
          </div>
        )}

        {!loading && !error && news.length === 0 && (
          <div className="mt-12 bg-[#0B0F19] border border-white/5 rounded-xl p-8 text-center text-gray-500">
             {t('analysis.empty')}
          </div>
        )}

        {!loading && news.length > 0 && (
          <div className="columns-1 md:columns-2 gap-6 space-y-6">
            {news.map((item, index) => (
              <a 
                key={item.id} 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col bg-[#0B0F19] border border-white/5 hover:border-white/10 transition-colors rounded-2xl p-6 group cursor-pointer break-inside-avoid shadow-sm"
              >
                <div className={`flex justify-between items-center mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1A11] text-yellow-500 border border-yellow-500/20 text-xs font-medium ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Tag size={12} className={isRtl ? 'ml-0.5' : 'mr-0.5'} />
                    <span>{item.category || 'Analysis'}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 text-gray-500 text-xs font-medium ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Calendar size={14} />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-3 text-white group-hover:text-yellow-500 transition-colors line-clamp-2 leading-tight">
                  {item.title}
                </h2>
                
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                  {stripHtml(item.summary)}
                </p>
                
                <div className={`flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-300 transition-colors mt-auto ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span>{t('analysis.readMore') || 'Read more'}</span>
                  <ArrowRight size={16} className={`transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
