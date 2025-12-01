import { supabase } from "@/integrations/supabase/client";

// Build API URL similar to other services in the app
const DEFAULT_API = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/api`;
const API_URL = (import.meta.env as any).VITE_API_URL || DEFAULT_API;

export const uploadVideo = async (file: File, fileName: string) => {
  try {
    // Get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const session = (sessionData as any)?.session ?? null;

    if (sessionError || !session) {
      // Fallback to backend API if no session
      return await uploadViaBackendAPI(file, fileName);
    }

    // Upload via frontend with proper metadata
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        // Add metadata for easier management
        metadata: {
          uploaded_by: (session.user && (session.user as any).email) || 'unknown',
          uploaded_at: new Date().toISOString()
        }
      });

    if (error) {
      console.error('Frontend upload failed, trying backend:', error);
      // Fallback to backend
      return await uploadViaBackendAPI(file, fileName);
    }

    return data;

  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

// Fallback upload via your PHP backend
const uploadViaBackendAPI = async (file: File, fileName: string) => {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('filename', fileName);

  // Try to include a session token if present
  let token: string | null = null;
  try {
    const s = await supabase.auth.getSession();
    token = (s.data as any)?.session?.access_token ?? null;
  } catch (e) {
    // ignore
  }

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/video.php`, {
    method: 'POST',
    body: formData,
    headers
  });

  if (!response.ok) {
    throw new Error(`Backend upload failed: ${response.statusText}`);
  }

  return await response.json();
};

// Get all videos (frontend + backend)
export const getAllVideos = async () => {
  const { data, error } = await supabase.storage
    .from('videos')
    .list('', {
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }

  return data.map(item => ({
    ...item,
    // Generate public URL
    url: supabase.storage.from('videos').getPublicUrl((item as any).name).data.publicUrl,
    // Determine source
    source: (item as any).metadata && (item as any).metadata.uploaded_by ? 'frontend' : 'backend'
  }));
};

export default { uploadVideo, getAllVideos };
