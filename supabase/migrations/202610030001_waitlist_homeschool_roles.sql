-- Adds homeschool parents and microschool or learning-pod leaders to the waitlist roles.
-- Until this runs, the waitlist route saves those sign-ups as 'other' with the role noted in organization.
alter table public.waitlist drop constraint if exists waitlist_role_check;
alter table public.waitlist add constraint waitlist_role_check
  check (role in ('teacher','instructional coach','administrator','district leader','homeschool parent','microschool leader','EdTech','other'));
