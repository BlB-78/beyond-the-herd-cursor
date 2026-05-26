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

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Welcome back, {user?.name}</h1>
            <p className="text-gray-400">Continue your journey to market mastery.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar Stats */}
          <div className="space-y-4">
             <div className="bg-zinc-900 border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-2 text-gray-400 text-sm font-medium">
                   <BookOpen size={18} />
                   Enrolled Courses
                </div>
                <div className="text-3xl font-display font-bold">{courses.length}</div>
             </div>
             
             <div className="bg-zinc-900 border border-white/5 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Award size={64} />
                </div>
                <div className="flex items-center gap-4 mb-2 text-yellow-500 text-sm font-medium">
                   <Award size={18} />
                   Certificates
                </div>
                <div className="text-3xl font-display font-bold">0</div>
             </div>
          </div>

          /* Main Content */
          <div className="md:col-span-3">
             <h2 className="text-2xl font-bold mb-6">My Learning Path</h2>
             
             {courses.length === 0 ? (
               <div className="text-center py-24 bg-zinc-900 border border-white/5 rounded-xl">
                 <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet.</p>
                 <Link to="/courses" className="bg-yellow-500 text-black px-6 py-3 rounded-md font-bold hover:bg-yellow-400 transition-colors inline-block">
                   Explore Courses
                 </Link>
               </div>
             ) : (
               <div className="space-y-4">
                 {courses.map(course => (
                   <div key={course.id} className="bg-zinc-900 border border-white/5 rounded-xl flex flex-col sm:flex-row overflow-hidden hover:border-white/10 transition-colors">
                     <div className="sm:w-64 h-40 sm:h-auto">
                       <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                     </div>
                     <div className="p-6 flex flex-col flex-grow justify-center">
                       <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                       <p className="text-sm text-gray-400 mb-6">{course.instructor}</p>
                       <div className="mt-auto">
                         <Link to={`/learn/${course.id}/lesson`} className="text-yellow-500 hover:text-yellow-400 font-medium flex items-center gap-2 group w-max">
                           Resume Course <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
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
