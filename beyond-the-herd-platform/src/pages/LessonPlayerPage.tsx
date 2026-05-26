import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { CheckCircle, PlayCircle, Menu, X, ArrowLeft } from 'lucide-react';
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
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-zinc-950">
         <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Dashboard
         </Link>
         <div className="font-medium text-sm hidden sm:block">{course.title}</div>
         <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2">
           <Menu size={20} />
         </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Main Video Area */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-5xl mx-auto p-4 lg:p-8">
              <div className="aspect-video bg-zinc-900 rounded-xl overflow-hidden mb-8 border border-white/5 relative">
                {/* Fallback mock player if iframe fails */}
                <iframe 
                  src={currentLesson.video_url} 
                  title={currentLesson.title}
                  className="w-full h-full absolute inset-0"
                  allowFullScreen
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2">{currentLesson.title}</h1>
                  <p className="text-gray-400">Duration: {currentLesson.duration}</p>
                </div>
                
                <button 
                  onClick={markComplete}
                  disabled={isCompleted}
                  className={`px-6 py-3 rounded-md font-bold flex items-center gap-2 transition-colors ${isCompleted ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500 text-black hover:bg-yellow-400'}`}
                >
                  <CheckCircle size={20} />
                  {isCompleted ? 'Completed' : 'Mark as Complete'}
                </button>
              </div>

              <div className="prose prose-invert border-t border-white/5 pt-8">
                 <h3>Lesson Notes</h3>
                 <p className="text-gray-400 leading-relaxed">
                   In this lesson we cover the essential concepts of {currentLesson.title.toLowerCase()}. 
                   Make sure to take notes and pause the video to review key structures.
                 </p>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">Select a lesson</div>
          )}
        </div>

        {/* Sidebar */}
        <div className={`w-80 bg-zinc-950 border-l border-white/10 flex-shrink-0 flex flex-col absolute lg:relative inset-y-0 right-0 transform transition-transform z-40 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
           <div className="p-4 border-b border-white/10 flex justify-between items-center bg-zinc-950">
             <h3 className="font-bold">Course Content</h3>
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
               <X size={20} />
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto">
             {course.sections?.map((section: any) => (
               <div key={section.id} className="border-b border-white/5">
                 <div className="p-4 bg-zinc-900/50">
                   <h4 className="font-bold text-sm text-gray-300">{section.title}</h4>
                 </div>
                 <div className="divide-y divide-white/5">
                   {section.lessons?.map((lesson: any) => {
                     const isCurrent = lesson.id === Number(lessonId);
                     const isDone = progress.includes(lesson.id);
                     return (
                       <Link 
                         key={lesson.id} 
                         to={`/learn/${courseId}/lesson/${lesson.id}`}
                         className={`block p-4 pl-6 transition-colors ${isCurrent ? 'bg-yellow-500/10 border-l-2 border-yellow-500' : 'hover:bg-white/5 border-l-2 border-transparent'}`}
                       >
                         <div className="flex items-start gap-3">
                           <div className="mt-0.5">
                             {isDone ? (
                               <CheckCircle size={16} className="text-green-500" />
                             ) : (
                               <PlayCircle size={16} className={isCurrent ? 'text-yellow-500' : 'text-gray-600'} />
                             )}
                           </div>
                           <div>
                             <div className={`text-sm font-medium ${isCurrent ? 'text-white' : 'text-gray-400'}`}>{lesson.title}</div>
                             <div className="text-xs text-gray-600 mt-1">{lesson.duration}</div>
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
