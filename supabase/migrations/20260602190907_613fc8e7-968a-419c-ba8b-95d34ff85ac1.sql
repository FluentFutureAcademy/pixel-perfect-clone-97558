
CREATE TABLE public.loan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  application_date text,
  reference_number text NOT NULL UNIQUE,

  full_name text NOT NULL,
  first_name text,
  age int,
  gender text,
  marital_status text,
  dependents text,
  education text,

  employment_status text,
  monthly_income numeric,
  coapplicant_income numeric DEFAULT 0,
  existing_obligations numeric DEFAULT 0,
  credit_history text,

  loan_purpose text,
  loan_amount numeric,
  loan_term int,
  property_area text,

  eligibility_score numeric,
  decision text,
  risk_category text,
  interest_rate numeric,

  monthly_emi numeric,
  total_interest numeric,
  total_repayment numeric,

  recommendations jsonb,

  financial_health_score numeric,
  financial_health_badge text,
  financial_health_advice jsonb
);

GRANT INSERT ON public.loan_applications TO anon, authenticated;
GRANT ALL ON public.loan_applications TO service_role;

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a loan application"
  ON public.loan_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
