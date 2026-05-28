/*
  # Prevent Role Escalation

  Updates the profiles update policy to prevent users from promoting themselves to admin.
  Users can only update their own profile and cannot change their role unless they are already an admin.
*/

-- Drop and recreate the profiles update policy with role escalation protection
drop policy if exists "profiles_update_own_or_admin" on public.profiles;

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (
    public.is_admin()
    or (
      auth.uid() = id
      and role = (select p.role from public.profiles p where p.id = auth.uid())
    )
  );