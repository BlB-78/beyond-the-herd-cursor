import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Book, Users, ClipboardList, LogOut, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/auth';

export function AdminLayout() {
  const location = useLocation();
  const { logout } = useAuthStore();

  const links = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Courses', path: '/admin/courses', icon: Book },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Enrollments', path: '/admin/enrollments', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-black flex text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-white/10 flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
           <Link to="/" className="flex items-center gap-2 hover:text-yellow-500 transition-colors">
              <ArrowLeft size={18} />
              <span className="font-bold tracking-tight">Exit Admin</span>
           </Link>
        </div>
        
        <div className="p-4 flex-1">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Management</div>
          <nav className="space-y-1">
            {links.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors w-full cursor-pointer"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-black">
        <Outlet />
      </main>
    </div>
  );
}
