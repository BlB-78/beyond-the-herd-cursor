import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { CircleCheck as CheckCircle, CirclePlay as PlayCircle, Menu, X, ArrowLeft } from 'lucide-react';
import { getCourse, getProgress, saveProgress } from '../lib/data';

export function LessonPlayerPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [progress, setProgress] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    getCourse(courseId)
      .then(data => {
        if (!data) return;
        setCourse(data);
        if (!lessonId && data.sections?.length > 0 && data.sections[0].lessons?.length > 0) {
           navigate(`/learn/${courseId}/lesson/${data.sections[0].lessons[0].id}`, { replace: true });
        }
      });

    getProgress(courseId)
      .then(res => res && setProgress(res.map(p => p.lesson_id)));
  }, [courseId, lessonId, user?.id, navigate]);

  if (!course) return <div className="min-h-screen bg-black" />;

  let currentLesson = null;
  for (const sec of course.sections || []) {
    for (const les of sec.lessons || []) {
      // NOTE: using string ID comparison
      if (les.id === lessonId) {
        currentLesson = les;
      }
    }
  }

  const markComplete = async () => {
    if (!currentLesson) return;
    try {
      await saveProgress(currentLesson.id);
      setProgress([...progress, currentLesson.id]);
    } catch (err) {
      console.error(err);
    }
  };

  const isCompleted = currentLesson && progress.includes(currentLesson.id);

  return (
    <div className="flex flex-col h-screen bg-black text-white relative max-h-screen overflow-hidden">

      {/* Top Bar inside player */}
      <div className="h-12 sm:h-14 border-b border-white/10 flex items-center justify-between px-3 sm:px-4 shrink-0 bg-zinc-950">
         <Link to="/dashboard" className="flex items-center gap-1.5 sm:gap-2 text-gray-400 hover:text-white transition-colors text-xs sm:text-sm font-medium min-h-[44px] flex items-center">
            <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Back to Dashboard</span>
            <span className="xs:hidden">Back</span>
         </Link>
         <div className="font-medium text-xs sm:text-sm hidden md:block truncate max-w-[200px] lg:max-w-none">{course.title}</div>
         <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Toggle course menu">
           {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
         </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">

        {/* Main Video Area */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-5xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
              <div className="aspect-video bg-zinc-900 rounded-lg sm:rounded-xl overflow-hidden mb-4 sm:mb-6 lg:mb-8 border border-white/5 relative">
                <iframe
                  src={currentLesson.video_url}
                  title={currentLesson.title}
                  className="w-full h-full absolute inset-0"
                  allowFullScreen
                />
              </div>

              <div className="flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold mb-1.5 sm:mb-2 line-clamp-2">{currentLesson.title}</h1>
                  <p className="text-gray-400 text-sm sm:text-base">Duration: {currentLesson.duration}</p>
                </div>

                <button
                  onClick={markComplete}
                  disabled={isCompleted}
                  className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-md font-bold flex items-center justify-center gap-2 transition-colors w-full sm:w-auto min-h-[48px] text-sm sm:text-base ${isCompleted ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500 text-black hover:bg-yellow-400'}`}
                >
                  <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                  {isCompleted ? 'Completed' : 'Mark as Complete'}
                </button>
              </div>

              <div className="prose prose-invert border-t border-white/5 pt-6 sm:pt-8">
                 <h3 className="text-base sm:text-lg lg:text-xl">Lesson Notes</h3>
                 <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                   In this lesson we cover the essential concepts of {currentLesson.title.toLowerCase()}.
                   Make sure to take notes and pause the video to review key structures.
                 </p>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500 text-sm sm:text-base">Select a lesson</div>
          )}
        </div>

        {/* Sidebar */}
        <div className={`w-[280px] sm:w-80 bg-zinc-950 border-l border-white/10 flex-shrink-0 flex flex-col absolute lg:relative inset-y-0 right-0 transform transition-transform z-40 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
           <div className="p-3 sm:p-4 border-b border-white/10 flex justify-between items-center bg-zinc-950">
             <h3 className="font-bold text-sm sm:text-base">Course Content</h3>
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
               <X size={18} />
             </button>
           </div>

           <div className="flex-1 overflow-y-auto overscroll-contain">
             {course.sections?.map((section: any) => (
               <div key={section.id} className="border-b border-white/5">
                 <div className="p-3 sm:p-4 bg-zinc-900/50">
                   <h4 className="font-bold text-xs sm:text-sm text-gray-300">{section.title}</h4>
                 </div>
                 <div className="divide-y divide-white/5">
                   {section.lessons?.map((lesson: any) => {
                     const isCurrent = lesson.id === lessonId;
                     const isDone = progress.includes(lesson.id);
                     return (
                       <Link
                         key={lesson.id}
                         to={`/learn/${courseId}/lesson/${lesson.id}`}
                         onClick={() => setSidebarOpen(false)}
                         className={`block p-3 sm:p-4 pl-4 sm:pl-6 transition-colors min-h-[48px] flex items-center ${isCurrent ? 'bg-yellow-500/10 border-l-2 border-yellow-500' : 'hover:bg-white/5 border-l-2 border-transparent'}`}
                       >
                         <div className="flex items-start gap-2 sm:gap-3">
                           <div className="mt-0.5 shrink-0">
                             {isDone ? (
                               <CheckCircle size={14} className="sm:w-4 sm:h-4 text-green-500" />
                             ) : (
                               <PlayCircle size={14} className={`sm:w-4 sm:h-4 ${isCurrent ? 'text-yellow-500' : 'text-gray-600'}`} />
                             )}
                           </div>
                           <div className="min-w-0 flex-1">
                             <div className={`text-xs sm:text-sm font-medium line-clamp-2 ${isCurrent ? 'text-white' : 'text-gray-400'}`}>{lesson.title}</div>
                             <div className="text-xs text-gray-600 mt-0.5 sm:mt-1">{lesson.duration}</div>
                           </div>
                         </div>
                       </Link>
                     );
                   })}
                 </div>
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
}
