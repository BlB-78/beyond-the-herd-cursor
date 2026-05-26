import { supabase } from './supabase';

async function requireUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in');
  return user.id;
}

async function attachCourseRatings<T extends { id: string }>(courses: T[]) {
  if (courses.length === 0) return courses;

  const ids = courses.map((c) => c.id);
  const { data: reviews } = await supabase
    .from('reviews')
    .select('course_id, rating')
    .in('course_id', ids);

  const byCourse = new Map<string, number[]>();
  for (const r of reviews ?? []) {
    const list = byCourse.get(r.course_id) ?? [];
    list.push(r.rating);
    byCourse.set(r.course_id, list);
  }

  return courses.map((c) => {
    const ratings = byCourse.get(c.id) ?? [];
    const avg_rating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;
    return { ...c, avg_rating, review_count: ratings.length };
  });
}

export async function getCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return attachCourseRatings(data ?? []);
}

export async function getCourse(id: string) {
  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!course) return null;

  const { data: sections, error: secErr } = await supabase
    .from('sections')
    .select('*')
    .eq('course_id', id)
    .order('order_idx', { ascending: true });

  if (secErr) throw new Error(secErr.message);

  const sectionsWithLessons = await Promise.all(
    (sections ?? []).map(async (section) => {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('section_id', section.id)
        .order('order_idx', { ascending: true });
      return { ...section, lessons: lessons ?? [] };
    })
  );

  const [withRatings] = await attachCourseRatings([course]);
  return { ...withRatings, sections: sectionsWithLessons };
}

export async function getMyCourses() {
  const userId = await requireUserId();

  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select('course_id, enrolled_at')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  if (!enrollments?.length) return [];

  const courseIds = enrollments.map((e) => e.course_id);
  const { data: courses, error: cErr } = await supabase
    .from('courses')
    .select('*')
    .in('id', courseIds);

  if (cErr) throw new Error(cErr.message);

  const enrolledAt = new Map(enrollments.map((e) => [e.course_id, e.enrolled_at]));
  return (courses ?? []).map((c) => ({
    ...c,
    enrolled_at: enrolledAt.get(c.id),
  }));
}

export async function enroll(courseId: string) {
  const userId = await requireUserId();

  const { error } = await supabase.from('enrollments').insert({
    user_id: userId,
    course_id: courseId,
  });

  if (error) {
    if (error.code === '23505') throw new Error('Already enrolled');
    throw new Error(error.message);
  }
}

export async function getProgress(courseId: string) {
  const userId = await requireUserId();

  const { data: sections } = await supabase
    .from('sections')
    .select('id')
    .eq('course_id', courseId);

  const sectionIds = (sections ?? []).map((s) => s.id);
  if (sectionIds.length === 0) return [];

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .in('section_id', sectionIds);

  const lessonIds = (lessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) return [];

  const { data: progress, error } = await supabase
    .from('progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);

  if (error) throw new Error(error.message);
  return (progress ?? []).map((p) => ({ lesson_id: p.lesson_id }));
}

export async function saveProgress(lessonId: string) {
  const userId = await requireUserId();

  const { error } = await supabase.from('progress').insert({
    user_id: userId,
    lesson_id: lessonId,
  });

  if (error && error.code !== '23505') throw new Error(error.message);
}

export async function getReviews(courseId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, user_name, created_at')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addReview(
  courseId: string,
  rating: number,
  comment: string,
  userName: string
) {
  const userId = await requireUserId();

  const { error } = await supabase.from('reviews').insert({
    user_id: userId,
    course_id: courseId,
    rating,
    comment,
    user_name: userName,
  });

  if (error) {
    if (error.code === '23505') throw new Error('You already reviewed this course.');
    throw new Error(error.message);
  }
}

export async function updateProfile(updates: {
  name?: string;
  bio?: string;
  location?: string;
  phone?: string;
  photo_url?: string;
}) {
  const userId = await requireUserId();

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

// --- Admin ---

export async function getAdminStats() {
  const [users, courses, enrollments] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('courses').select('id', { count: 'exact', head: true }),
    supabase.from('enrollments').select('id', { count: 'exact', head: true }),
  ]);

  return {
    totalUsers: users.count ?? 0,
    totalCourses: courses.count ?? 0,
    totalEnrollments: enrollments.count ?? 0,
  };
}

export async function getAdminUsers() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const { data: enrollments } = await supabase.from('enrollments').select('user_id');
  const counts = new Map<string, number>();
  for (const e of enrollments ?? []) {
    counts.set(e.user_id, (counts.get(e.user_id) ?? 0) + 1);
  }

  return (profiles ?? []).map((u) => ({
    ...u,
    enrollments: counts.get(u.id) ?? 0,
  }));
}

export async function getAdminEnrollments() {
  const { data, error } = await supabase
    .from('enrollments')
    .select(
      `
      id,
      enrolled_at,
      profiles ( name, email ),
      courses ( title )
    `
    )
    .order('enrolled_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => {
    const profile = row.profiles as { name: string; email: string } | null;
    const course = row.courses as { title: string } | null;
    return {
      id: row.id,
      enrolled_at: row.enrolled_at,
      user_name: profile?.name ?? 'Unknown',
      user_email: profile?.email ?? '',
      course_title: course?.title ?? 'Unknown course',
    };
  });
}

export async function createCourse(course: {
  title: string;
  description: string;
  instructor: string;
  price: number;
  image_url: string;
}) {
  const { data, error } = await supabase
    .from('courses')
    .insert(course)
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  const { error: secErr } = await supabase.from('sections').insert({
    course_id: data.id,
    title: 'Introduction',
    order_idx: 1,
  });

  if (secErr) throw new Error(secErr.message);
  return data;
}

export async function createSection(
  courseId: string,
  title: string,
  orderIdx: number
) {
  const { data, error } = await supabase
    .from('sections')
    .insert({ course_id: courseId, title, order_idx: orderIdx })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createLesson(
  sectionId: string,
  lesson: {
    title: string;
    video_url: string;
    duration: string;
    order_idx: number;
  }
) {
  const { data, error } = await supabase
    .from('lessons')
    .insert({ section_id: sectionId, ...lesson })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data;
}
