import React, { useEffect, useState } from 'react';
import { Users, Book, Activity } from 'lucide-react';
import { getAdminStats } from '../../lib/data';

export function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalEnrollments: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-display font-bold mb-8">Dashboard Overview</h1>
      {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-400 font-medium text-sm">Total Users</div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="text-3xl font-display font-bold">{stats.totalUsers}</div>
        </div>
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-400 font-medium text-sm">Active Courses</div>
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
              <Book size={20} />
            </div>
          </div>
          <div className="text-3xl font-display font-bold">{stats.totalCourses}</div>
        </div>
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-400 font-medium text-sm">Total Enrollments</div>
            <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
              <Activity size={20} />
            </div>
          </div>
          <div className="text-3xl font-display font-bold">{stats.totalEnrollments}</div>
        </div>
      </div>
    </div>
  );
}
