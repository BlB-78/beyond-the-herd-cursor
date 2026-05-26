import React, { useEffect, useState } from 'react';
import { Plus, Loader } from 'lucide-react';
import { getCourses, createCourse } from '../../lib/data';

export function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState('Alex Turner');
  const [price, setPrice] = useState(99.99);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800'
  );

  const fetchCourses = () => {
    getCourses()
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    try {
      await createCourse({
        title,
        description,
        instructor,
        price: Number(price),
        image_url: imageUrl,
      });
      setShowAddForm(false);
      setTitle('');
      setDescription('');
      fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Loader className="animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold">Manage Courses</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-yellow-500 text-black px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-yellow-400"
        >
          <Plus size={18} /> {showAddForm ? 'Cancel' : 'Add Course'}
        </button>
      </div>

      {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

      {showAddForm && (
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Create New Course</h2>
          <form onSubmit={handleAddCourse} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-md p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Instructor</label>
                <input
                  required
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-md p-2 text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-white/10 rounded-md p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Price ($)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 rounded-md p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
                <input
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-md p-2 text-white"
                />
              </div>
            </div>
            <button
              disabled={adding}
              type="submit"
              className="bg-yellow-500 text-black px-6 py-2 rounded-md font-bold mt-4 disabled:opacity-50"
            >
              {adding ? 'Saving...' : 'Save Course'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-gray-400">
            <tr>
              <th className="p-4 font-medium">Course</th>
              <th className="p-4 font-medium">Instructor</th>
              <th className="p-4 font-medium">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-white/5">
                <td className="p-4 flex items-center gap-4">
                  <img src={course.image_url} alt="" className="w-12 h-12 rounded object-cover" />
                  <div>
                    <div className="font-bold">{course.title}</div>
                    <div className="text-gray-500 text-xs w-48 truncate">{course.description}</div>
                  </div>
                </td>
                <td className="p-4 text-gray-300">{course.instructor}</td>
                <td className="p-4 text-gray-300">${course.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
