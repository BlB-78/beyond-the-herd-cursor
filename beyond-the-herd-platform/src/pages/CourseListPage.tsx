import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { getCourses } from '../lib/data';

export function CourseListPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getCourses()
      .then(res => setCourses(res || []))
      .catch(() => {});
  }, []);

  const filtered = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderStars = (rating: number, count: number) => {
    return (
      <div className="flex items-center gap-1 mt-auto pt-4 mb-2">
        <div className="flex text-yellow-500">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={14} fill={i <= Math.round(rating) ? "currentColor" : "none"} className={i <= Math.round(rating) ? "" : "text-gray-600"} />
          ))}
        </div>
        <span className="text-xs text-gray-400 ml-1 font-medium">{rating.toFixed(1)} ({count} {count === 1 ? 'review' : 'reviews'})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-zinc-900 border-b border-white/5 pt-24 pb-16">
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
          alt="Abstract background"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight mb-4 text-white">
              Master the Markets
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-xl">
              Unlock your trading potential with our premium, carefully structured curriculums designed for serious traders.
            </p>
            
            <div className="relative max-w-lg w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-500" />
              </div>
              <input 
                type="text"
                placeholder="Search for courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white/10 transition-all text-white placeholder-gray-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-display">All Courses</h2>
          <span className="text-gray-400 text-sm font-medium bg-white/5 py-1 px-3 rounded-full border border-white/10">
            {filtered.length} {filtered.length === 1 ? 'Course' : 'Courses'}
          </span>
        </div>

        {filtered.length === 0 ? (
           <div className="text-center py-32 bg-zinc-900 border border-white/5 rounded-2xl">
             <div className="w-16 h-16 bg-white/5 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search size={24} />
             </div>
             <h3 className="text-lg font-medium text-white mb-2">No courses found</h3>
             <p className="text-gray-500">We couldn't find any courses matching "{searchTerm}"</p>
             <button 
               onClick={() => setSearchTerm('')}
               className="mt-6 text-sm font-medium text-yellow-500 hover:text-yellow-400"
             >
               Clear search
             </button>
           </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(course => (
              <Link key={course.id} to={`/courses/${course.id}`} className="group bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 hover:shadow-xl hover:shadow-yellow-500/5 transition-all duration-300 flex flex-col transform hover:-translate-y-1">
                <div className="aspect-[16/9] overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                    <span className="bg-yellow-500 text-black font-bold text-sm px-4 py-2 rounded-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">View Course</span>
                  </div>
                  <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-white/5 text-gray-400 text-xs font-semibold px-2 py-1 rounded border border-white/5 uppercase tracking-wide">Course</span>
                    <span className="text-yellow-500 font-medium text-xs">{course.instructor}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-500 transition-colors leading-tight">{course.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{course.description}</p>
                  
                  {renderStars(course.avg_rating || 0, course.review_count || 0)}
                  
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="font-bold text-lg text-white">${course.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
