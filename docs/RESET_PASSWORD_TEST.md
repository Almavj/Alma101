Manual test plan — Password reset flow

1. Prerequisites
   - Ensure SUPABASE_URL and SUPABASE_ANON_KEY (and service role key if needed) are set in the backend .env and the frontend can access the anon key (via Vite env).
   - Configure your Supabase project's SMTP/email settings so recovery emails are delivered.

2. Request a reset (frontend)
   - Open the app and go to /auth (login page).
   - Enter the email for an existing test account in the Email field.
      - Click "Forgot password?" — this triggers Supabase's reset email with redirectTo set to /auth.
   - Confirm you receive an email from Supabase with a recovery link.

3. Complete the reset (client-side)
      - Click the recovery link. The link will usually open the Supabase-hosted reset page, or if configured to redirect to your app it will return to /auth. The built-in Supabase flow will guide the user to set a new password.
      - If you configured redirectTo to `/auth`, users land back on the login page after finishing the hosted reset flow and can sign in with the new password.
   - Try signing in with the new password.

4. Troubleshooting
   - No email received: check Supabase project's SMTP settings and verify the project's sender email is allowed.
   - Link lands on Supabase-hosted page: ensure the redirectTo supplied when requesting reset matches the app host and path.
   - Token not found on landing page: open browser devtools and inspect the link — Supabase sometimes places tokens in the URL hash (#). The reset page checks both query and hash.

5. Optional: Admin password set
   - If you prefer an admin-side reset (server sets password), use the admin API with the service role key. The code base previously contained `backend/api/reset-password.php` (now removed). If you want that flow restored, re-add an admin endpoint that accepts email + newPassword and calls `/auth/v1/admin/users/{id}`.

6. Notes
   - We included an optional Supabase migration at `supabase/migrations/20251031010100_add_password_resets.sql` if you later decide to switch to an OTP-based workflow.
