import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { getAdminEnrollments } from '../../lib/data';

export function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminEnrollments()
      .then((data) => {
        setEnrollments(data);
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
        <h1 className="text-3xl font-display font-bold">Enrollments Data</h1>
        <p className="text-gray-400 mt-2">Track student course enrollment history.</p>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-gray-400">
            <tr>
              <th className="p-4 font-medium">Student</th>
              <th className="p-4 font-medium">Course</th>
              <th className="p-4 font-medium">Enrolled On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {enrollments.map((en) => (
              <tr key={en.id} className="hover:bg-white/5">
                <td className="p-4">
                  <div className="font-medium text-white">{en.user_name}</div>
                  <div className="text-xs text-gray-500">{en.user_email}</div>
                </td>
                <td className="p-4 text-yellow-500 font-medium">{en.course_title}</td>
                <td className="p-4 text-gray-400">
                  {new Date(en.enrolled_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">
                  No enrollments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
