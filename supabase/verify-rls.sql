-- Paste into the Supabase SQL editor to see the actual protection state of
-- public.leads. Read-only: it changes nothing.

-- 1. Is RLS switched on?
--    rls_enabled must be true. If it is false, anyone holding your project URL
--    and the publishable key can read every lead.
select
  relname                as table_name,
  relrowsecurity         as rls_enabled,
  relforcerowsecurity    as rls_forced_for_owner
from pg_class
where oid = 'public.leads'::regclass;

-- 2. Which policies exist?
--    ZERO ROWS IS THE CORRECT ANSWER HERE. This table is written only by the
--    server using the secret key, which bypasses RLS. With RLS on and no
--    policies, every other caller is denied by default. Adding a policy would
--    open it up, not lock it down.
select policyname, cmd, roles, qual
from pg_policies
where schemaname = 'public' and tablename = 'leads';

-- 3. What table grants do the public roles hold?
--    anon and authenticated should not appear at all. The migration revokes
--    them. This is the belt to RLS's braces: even if RLS were switched off by
--    accident, no grant means no access.
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'leads'
order by grantee, privilege_type;
