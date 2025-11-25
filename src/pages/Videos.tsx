import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Play } from "lucide-react";

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  category: string;
}

import { isAdmin } from "@/lib/admin";
import { uploadFile } from "@/lib/storage";

const Videos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [adminMode, setAdminMode] = useState(false);

  // upload form state (minimal)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setVideos(data);
      }
      setLoading(false);
    };

    fetchVideos();
    // determine current user and admin status
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email ?? null;
      setUserEmail(email);
      setAdminMode(isAdmin(email));
    });
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMode) return;
    try {
      // If files were provided, upload them to Supabase Storage first
      let finalThumbnail = thumbnailUrl;
      let finalVideoUrl = videoUrl;

      if (thumbnailFile) {
        const thumbPath = `thumbnails/${Date.now()}_${thumbnailFile.name}`;
        const uploadedThumb = await uploadFile('videos', thumbPath, thumbnailFile);
        if (uploadedThumb) finalThumbnail = uploadedThumb;
      }

      if (videoFile) {
        const vidPath = `videos/${Date.now()}_${videoFile.name}`;
        const uploadedVid = await uploadFile('videos', vidPath, videoFile);
        if (uploadedVid) finalVideoUrl = uploadedVid;
      }

      // create directly in Supabase
      const { error } = await supabase.from('videos').insert([{ title, description, video_url: finalVideoUrl, thumbnail_url: finalThumbnail, category }]);
      if (error) {
        console.error('Supabase create video error', error);
      } else {
        setTitle(""); setDescription(""); setVideoUrl(""); setThumbnailUrl(""); setCategory("");
        setThumbnailFile(null); setVideoFile(null);
        const { data } = await supabase.from("videos").select("*").order("created_at", { ascending: false });
        setVideos(data || []);
      }
    } catch (err: unknown) {
      console.error("Upload video error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!adminMode) return;
    if (!confirm("Delete this video?")) return;
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) console.error('Supabase delete video error', error);
      else setVideos((v) => v.filter((x) => x.id !== id));
    } catch (err) {
      console.error('Delete video unexpected error', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {adminMode && (
          <section className="max-w-3xl mx-auto mb-8 p-4 bg-card/60 rounded-md border border-primary/20">
            <h2 className="text-lg font-semibold text-foreground mb-2">Admin: Upload Video</h2>
            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input className="p-2 bg-input text-foreground rounded" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <input className="p-2 bg-input text-foreground rounded" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
              <input className="p-2 col-span-2 bg-input text-foreground rounded" placeholder="Video URL (optional if uploading file)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
              <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)} className="col-span-2" />
              <input className="p-2 col-span-2 bg-input text-foreground rounded" placeholder="Thumbnail URL (optional if uploading file)" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
              <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files ? e.target.files[0] : null)} className="col-span-2" />
              <textarea className="p-2 col-span-2 bg-input text-foreground rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <button type="submit" className="col-span-2 bg-primary text-primary-foreground p-2 rounded">Upload</button>
            </form>
          </section>
        )}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Hacking <span className="text-primary">Videos</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Learn from expert tutorials and demonstrations
          </p>
        </div>

        {loading ? (
          <div className="text-center text-primary text-lg">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="text-center text-muted-foreground text-lg">
            No videos available yet. Check back soon!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="bg-gradient-to-br from-card to-muted border-primary/30 hover:border-primary transition-all hover:shadow-[0_0_30px_hsl(var(--cyber-glow)/0.3)] hover:-translate-y-1">
                <CardHeader>
                  <div className="relative aspect-video bg-muted/50 rounded-lg overflow-hidden mb-4 group cursor-pointer">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-16 w-16 text-primary" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-20 w-20 text-primary drop-shadow-[0_0_15px_hsl(var(--cyber-glow))]" />
                    </div>
                  </div>
                  <CardTitle className="text-foreground">{video.title}</CardTitle>
                  {video.category && (
                    <span className="text-xs text-primary font-semibold">{video.category}</span>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {video.description}
                  </CardDescription>
                  {adminMode && (
                    <div className="mt-3">
                      <button className="text-sm text-destructive" onClick={() => handleDelete(video.id)}>Delete</button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Videos;