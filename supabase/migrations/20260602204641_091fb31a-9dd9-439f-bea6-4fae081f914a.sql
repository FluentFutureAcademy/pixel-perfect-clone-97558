DROP POLICY IF EXISTS "Anyone can read loan applications" ON public.loan_applications;
REVOKE SELECT ON public.loan_applications FROM anon, authenticated;