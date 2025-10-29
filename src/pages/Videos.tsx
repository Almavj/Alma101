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

const Videos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
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