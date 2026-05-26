import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { BookOpen, Award, ArrowRight } from 'lucide-react';
import { getMyCourses } from '../lib/data';

export function DashboardPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCourses()
      .then(data => {
         setCourses(data || []);
         setLoading(false);
      })
      .catch((err) => {
         console.error(err);
         setLoading(false);
      });
  }, [user?.id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 border-b-yellow-500 rounded-full animate-spin" />
  </div>;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 sm:py-12 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 sm:mb-12 border-b border-white/10 pb-6 sm:pb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-1 sm:mb-2">Welcome back, {user?.name}</h1>
            <p className="text-gray-400 text-sm sm:text-base">Continue your journey to market mastery.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Sidebar Stats */}
          <div className="lg:col-span-1 order-1 lg:order-1">
            <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-col lg:gap-4">
              <div className="bg-zinc-900 border border-white/5 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-4 mb-2 text-gray-400 text-xs sm:text-sm font-medium">
                  <BookOpen size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden xs:inline">Enrolled Courses</span>
                  <span className="xs:hidden">Courses</span>
                </div>
                <div className="text-2xl sm:text-3xl font-display font-bold">{courses.length}</div>
              </div>

              <div className="bg-zinc-900 border border-white/5 rounded-lg sm:rounded-xl p-4 sm:p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 hidden lg:block">
                  <Award size={64} />
                </div>
                <div className="flex items-center gap-2 sm:gap-4 mb-2 text-yellow-500 text-xs sm:text-sm font-medium">
                  <Award size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span>Certificates</span>
                </div>
                <div className="text-2xl sm:text-3xl font-display font-bold">0</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-2 lg:order-2">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">My Learning Path</h2>

            {courses.length === 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-24 bg-zinc-900 border border-white/5 rounded-lg sm:rounded-xl px-4">
                <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">You haven't enrolled in any courses yet.</p>
                <Link to="/courses" className="bg-yellow-500 text-black px-6 py-3 rounded-md font-bold hover:bg-yellow-400 transition-colors inline-block min-h-[48px] flex items-center justify-center sm:inline-flex text-sm sm:text-base">
                  Explore Courses
                </Link>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-4">
                {courses.map(course => (
                  <div key={course.id} className="bg-zinc-900 border border-white/5 rounded-lg sm:rounded-xl flex flex-col sm:flex-row overflow-hidden hover:border-white/10 transition-colors">
                    <div className="w-full sm:w-64 h-40 sm:h-auto shrink-0">
                      <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col flex-grow justify-center">
                      <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 line-clamp-2">{course.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">{course.instructor}</p>
                      <div className="mt-auto">
                        <Link to={`/learn/${course.id}/lesson`} className="text-yellow-500 hover:text-yellow-400 font-medium flex items-center gap-2 group w-max text-sm sm:text-base min-h-[44px] flex items-center">
                          Resume Course <ArrowRight size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform"/>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
