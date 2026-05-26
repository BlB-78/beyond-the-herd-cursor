import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { getAdminUsers } from '../../lib/data';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminUsers()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <Loader className="animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Manage Users</h1>
        <p className="text-gray-400 mt-2">View all registered students and administrators.</p>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-gray-400">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Enrollments</th>
              <th className="p-4 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5">
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4 text-gray-400">{user.email}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-white/5 text-gray-300'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{user.enrollments} courses</td>
                <td className="p-4 text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
