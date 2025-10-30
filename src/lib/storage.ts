import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a file to Supabase Storage and return a public URL.
 * bucket: storage bucket name (e.g., 'uploads' or 'public')
 */
export async function uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) {
      console.error('Storage upload error:', error.message);
      return null;
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicData.publicUrl || null;
  } catch (err) {
    console.error('Upload exception', err);
    return null;
  }
}

export default uploadFile;
