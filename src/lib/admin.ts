export const ADMIN_EMAIL = (import.meta.env.VITE_SUPABASE_ADMIN_EMAIL as string) ?? 'machariaallan881@gmail.com';

export const isAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return String(email).toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export default isAdmin;
