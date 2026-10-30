'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
const mentorRoles = ['mentor'];
export default function RoleGuard({children, allowedRoles = mentorRoles}: {children: React.ReactNode; allowedRoles?: string[]}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function check() {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.replace('/auth-mentor'); return; }
      const table = allowedRoles.includes('mentor') ? 'mentors' : 'users';
      const { data: profile, error: profileError } = await supabase.from(table).select('id').eq('auth_uid', user.id).maybeSingle();
      if (profileError || !profile) { router.replace(table === 'mentors' ? '/auth-mentor/callback' : '/auth/callback'); return; }
      if (active) setLoading(false);
    }
    void check(); return () => { active = false; };
  }, [allowedRoles, router]);
  return loading ? <div className="p-6">Checking access...</div> : <>{children}</>;
}
