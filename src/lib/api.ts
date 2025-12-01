// Default to a relative API path so the browser will call the same host
// serving the frontend (avoids hard-coded localhost addresses).
export const API_URL = import.meta.env.VITE_API_URL ?? '/api';
