"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface DBUser {
  id: number; userName: string; userEmail: string; avatar: string; created_at: string;
  totalCredits: number; remainingCredits: number; invite_link: string; current_status: string;
  userPhone: string; institutionName: string; mainFocus: string; is_verified: boolean;
  isQuizDone: boolean; latitude: number; longitude: number; isPro: boolean; calendarconnected: boolean;
}
interface DBMentor {
  id: string; full_name: string; email: string; phone: string | null; linkedin: string | null;
  bio: string | null; expertise: string[]; current_position: string; availability: boolean;
  rating: number; avatar: string | null; created_at: string; is_verified: boolean; video_url: string | null;
}
interface UserDataContextType {
  user: DBUser | null; mentor: DBMentor | null;
  setUser: React.Dispatch<React.SetStateAction<DBUser | null>>;
  setMentor: React.Dispatch<React.SetStateAction<DBMentor | null>>;
  loading: boolean; error: string | null; isNewUser: boolean; isNewMentor: boolean;
  ensureUserInDB: () => Promise<void>;
}
const UserDataContext = createContext<UserDataContextType | undefined>(undefined);
// OAuth refresh tokens never enter the browser profile/context payload.
const userColumns = 'id,userName,userEmail,avatar,created_at,totalCredits,remainingCredits,invite_link,current_status,userPhone,institutionName,mainFocus,is_verified,isQuizDone,latitude,longitude,isPro,calendarconnected';

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<DBUser | null>(null);
  const [mentor, setMentor] = useState<DBMentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isNewMentor, setIsNewMentor] = useState(false);
  const ensureUserInDB = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data: { user: account }, error: authError } = await supabase.auth.getUser();
      if (authError || !account) { setUser(null); setMentor(null); return; }
      if (!account.email) throw new Error('An account email is required.');
      const { data: ownMentor, error: mentorError } = await supabase.from('mentors').select('*').eq('auth_uid', account.id).maybeSingle();
      if (mentorError) throw mentorError;
      // Metadata chooses an onboarding preference, not an authorization privilege.
      // Server checks and RLS authorize only the account's own database profile.
      const enrollMentor = Boolean(ownMentor) || window.location.pathname.startsWith('/auth-mentor') || account.user_metadata?.role === 'mentor';
      if (enrollMentor) {
        let profile = ownMentor;
        if (!profile) {
          const { error: insertError } = await supabase.from('mentors').upsert({
            auth_uid: account.id, email: account.email,
            full_name: account.user_metadata?.full_name || 'CareerIQ Mentor',
            avatar: account.user_metadata?.avatar_url || account.user_metadata?.picture || null,
            expertise: [], current_position: '', availability: true, rating: 0,
          }, { onConflict: 'auth_uid', ignoreDuplicates: true });
          if (insertError) throw insertError;
          const { data, error: fetchError } = await supabase.from('mentors').select('*').eq('auth_uid', account.id).single();
          if (fetchError) throw fetchError;
          profile = data;
          setIsNewMentor(true); localStorage.setItem('isOnboardingDoneMentor', 'false');
        } else setIsNewMentor(false);
        setMentor(profile); setUser(null);
      } else {
        const { data: existing, error: fetchError } = await supabase.from('users').select(userColumns).eq('auth_uid', account.id).maybeSingle();
        if (fetchError) throw fetchError;
        let profile = existing;
        if (!profile) {
          const { error: insertError } = await supabase.from('users').upsert({
            auth_uid: account.id, userName: account.user_metadata?.full_name || account.user_metadata?.name || 'CareerIQ User',
            userEmail: account.email, avatar: account.user_metadata?.avatar_url || account.user_metadata?.picture || null, invite_link: uuidv4(),
          }, { onConflict: 'auth_uid', ignoreDuplicates: true });
          if (insertError) throw insertError;
          const { data, error: profileError } = await supabase.from('users').select(userColumns).eq('auth_uid', account.id).single();
          if (profileError) throw profileError;
          profile = data; setIsNewUser(true); localStorage.setItem('isOnboardingDone', 'false');
        } else setIsNewUser(false);
        setUser(profile as DBUser); setMentor(null);
      }
      localStorage.setItem('emailProvider', String(account.app_metadata?.provider === 'email'));
    } catch {
      setUser(null); setMentor(null);
      setError('Your profile could not be loaded. Please retry. If this continues, the project database setup needs attention.');
    } finally { setLoading(false); }
  }, [supabase]);
  useEffect(() => {
    void ensureUserInDB();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') { setUser(null); setMentor(null); setLoading(false); }
      else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Leave the auth callback before making another Supabase request.
        setTimeout(() => { void ensureUserInDB(); }, 0);
      }
    });
    return () => subscription.unsubscribe();
  }, [ensureUserInDB, supabase]);
  return <UserDataContext.Provider value={{ user, mentor, setUser, setMentor, loading, error, isNewUser, isNewMentor, ensureUserInDB }}>{children}</UserDataContext.Provider>;
}
export function useUserData() {
  const value = useContext(UserDataContext);
  if (!value) throw new Error('useUserData must be used within a UserDataProvider');
  return value;
}
