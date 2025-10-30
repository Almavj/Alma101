export const ADMIN_EMAIL = 'machariaallan881@gmail.com';

export const isAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return String(email).toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export default isAdmin;
