import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  bio?: string;
  location?: string;
  phone?: string;
  photoUrl?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoadingAuth: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  initialize: () => () => void;
  refreshProfile: () => Promise<void>;
}

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, bio, location, phone, photo_url')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role as 'admin' | 'user',
    bio: data.bio ?? '',
    location: data.location ?? '',
    phone: data.phone ?? '',
    photoUrl: data.photo_url ?? '',
  };
}

async function ensureProfile(session: Session): Promise<User | null> {
  let profile = await fetchProfile(session.user.id);
  if (profile) return profile;

  const name =
    session.user.user_metadata?.name ??
    session.user.user_metadata?.full_name ??
    session.user.email?.split('@')[0] ??
    'User';

  const { error } = await supabase.from('profiles').upsert({
    id: session.user.id,
    name,
    email: session.user.email ?? '',
    role: 'user',
  });

  if (error) {
    console.error('Failed to create profile:', error.message);
    return null;
  }

  return fetchProfile(session.user.id);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoadingAuth: true,

  setUser: (user) => set({ user }),

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  refreshProfile: async () => {
    const session = get().session;
    if (!session) return;
    const user = await fetchProfile(session.user.id);
    if (user) set({ user });
  },

  initialize: () => {
    let mounted = true;

    const applySession = async (session: Session | null) => {
      if (!mounted) return;
      if (!session) {
        set({ user: null, session: null, isLoadingAuth: false });
        return;
      }
      const user = await ensureProfile(session);
      set({ user, session, isLoadingAuth: false });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ isLoadingAuth: true });
      applySession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  },
}));
