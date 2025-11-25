-- Create password_resets table (optional, only if you want OTP-based resets)
CREATE TABLE IF NOT EXISTS public.password_resets (
  id serial PRIMARY KEY,
  email varchar(255) NOT NULL,
  otp varchar(6) NOT NULL,
  expires_at timestamp NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  CONSTRAINT unique_email_password_resets UNIQUE (email)
);
