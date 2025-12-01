import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a file to Supabase Storage and return a public URL.
 * bucket: storage bucket name (e.g., 'blogs', 'videos', 'tools', or other public buckets)
 * Note: the helper calls getPublicUrl after upload, so buckets must be public to return
 * a usable URL. For private buckets, change the flow to use signed URLs from the backend.
 */
export async function uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
  try {
    // debug: log attempt
    console.debug('[uploadFile] attempting upload', { bucket, path, filename: file.name, size: file.size });

    // Ensure we have a valid session. If this is the 'videos' bucket we require
    // the fixed admin email to be logged in (prevent non-admin client uploads).
    const { data: { session } } = await supabase.auth.getSession();
    console.debug('[uploadFile] supabase session present?', !!session);

    const ADMIN_EMAIL = 'machariaallan881@gmail.com';
    if (bucket === 'videos') {
      if (!session) {
        console.error('[uploadFile] upload blocked: no authenticated session');
        throw new Error('Not authenticated. Please sign in as admin to upload.');
      }
      const email = (session as any)?.user?.email ?? null;
      console.debug('[uploadFile] user email:', email);
      if (email !== ADMIN_EMAIL) {
        console.error('[uploadFile] upload blocked: user is not admin', { email });
        throw new Error('Admin privileges required to upload to the videos bucket.');
      }
    }

    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) {
      // log full error to help debug permission/credential issues
      console.error('[uploadFile] Storage upload error', { bucket, path, error });
      // Provide developer-friendly hint when common errors occur
      if (error.message) {
        if (/size|413/i.test(error.message)) {
          console.error('[uploadFile] Upload may have failed due to file size limits. Check your Supabase bucket or proxy limits.');
        }
        if (/row-level security/i.test(error.message) || /violates row-level security/i.test(error.message)) {
          console.error('[uploadFile] Upload failed due to Supabase row-level security (RLS).');
          console.error('[uploadFile] Action: ensure the storage bucket allows authenticated uploads or perform uploads server-side with the service role key.');
        }
      }
      return null;
    }

    if (!data || !data.path) {
      console.error('[uploadFile] Storage upload returned no data', { bucket, path, data });
      return null;
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    console.debug('[uploadFile] upload succeeded', { bucket, path, data, publicData });

    // publicData has shape { publicUrl } in most SDK versions
    if (publicData) {
      const pd: any = publicData;
      if (pd.publicUrl || pd.publicURL) return pd.publicUrl ?? pd.publicURL;
    }

    // If public URL could not be constructed, return the stored path as a fallback
    return data.path ?? null;
  } catch (err) {
    console.error('[uploadFile] Upload exception', err);
    return null;
  }
}

export default uploadFile;
