import { supabase } from '@/integrations/supabase/client';

const API_URL = (import.meta.env as any).VITE_API_URL || `${window.location.origin}/api`;

// API wrapper that automatically attaches auth token
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = (sessionData as any)?.session ?? null;

  const headers: Record<string, string> = {
    // default content-type for JSON requests; FormData callers should omit
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  // Add Authorization header if we have a session
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`API Error (${response.status}): ${text}`);
  }

  return response.json();
};

export const videoService = {
  // Upload video (auto-chooses method)
  async uploadVideo(file: File, fileName?: string): Promise<any> {
    try {
      // Try client-side upload first if we have a session
      const { data: sessionData } = await supabase.auth.getSession();
      const session = (sessionData as any)?.session ?? null;

      if (session?.access_token) {
        const safeFileName = fileName || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

        const { data, error } = await supabase.storage
          .from('videos')
          .upload(safeFileName, file, {
            cacheControl: '3600',
            upsert: false,
            metadata: {
              uploaded_by: (session.user as any)?.email,
              uploaded_at: new Date().toISOString(),
              original_name: file.name,
              size: file.size,
              mime_type: file.type
            }
          });

        if (!error && data) {
          const publicUrl = supabase.storage.from('videos').getPublicUrl(safeFileName).data?.publicUrl;
          return {
            success: true,
            filename: safeFileName,
            public_url: publicUrl,
            size: file.size
          };
        }

        console.warn('Client upload failed, falling back to server:', error);
      }

      // Fallback to server-side upload
      const formData = new FormData();
      formData.append('video', file);
      if (fileName) {
        formData.append('filename', fileName);
      }

      const response = await fetch(`${API_URL}/video.php`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text().catch(() => response.statusText);
        throw new Error(`Server upload failed: ${err}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Video upload failed:', error);
      throw error;
    }
  },

  // Get all videos with pagination
  async getVideos(page: number = 1, limit: number = 20) {
    try {
      // Try direct storage first
      const { data, error } = await supabase.storage
        .from('videos')
        .list('', {
          limit,
          offset: (page - 1) * limit,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (!error) {
        const videos = (data || []).map((item: any) => ({
          ...item,
          url: supabase.storage.from('videos').getPublicUrl(item.name).data?.publicUrl,
          source: item.metadata?.uploaded_by ? 'frontend' : 'backend'
        }));

        return {
          data: videos,
          pagination: { page, limit, has_more: (data || []).length === limit }
        };
      }

      // Fallback to API
      return await apiFetch(`/video.php?page=${page}&limit=${limit}`);

    } catch (error) {
      console.error('Failed to fetch videos:', error);
      throw error;
    }
  },

  // Delete video (admin only)
  async deleteVideo(filename: string) {
    return await apiFetch(`/video.php?filename=${encodeURIComponent(filename)}`, {
      method: 'DELETE'
    });
  },

  // Get video URL (handles private buckets with signed URLs)
  async getVideoUrl(filename: string, expiresIn: number = 3600): Promise<string> {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = (sessionData as any)?.session ?? null;

    if (session?.access_token) {
      // Try to get signed URL for private bucket
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(filename, expiresIn as number);

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    }

    // Fallback to public URL
    const { data } = supabase.storage
      .from('videos')
      .getPublicUrl(filename);

    return (data as any)?.publicUrl;
  }
};

export default videoService;
