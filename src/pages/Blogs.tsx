import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { isAdmin } from "@/lib/admin";
import { uploadFile } from "@/lib/storage";

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  created_at: string;
}

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);

  // upload state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBlogs(data);
      }
      setLoading(false);
    };

    fetchBlogs();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminMode(isAdmin(session?.user?.email ?? null));
    });
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMode) return;
    try {
      let finalImage = imageUrl;
      if (imageFile) {
        const imgPath = `blogs/${Date.now()}_${imageFile.name}`;
        const uploaded = await uploadFile('public', imgPath, imageFile);
        if (uploaded) finalImage = uploaded;
      }

      // send to backend for validation
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token ?? "";
      const resp = await fetch('/sentinel-learn-lab/backend/api/blogs.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, excerpt, content, image_url: finalImage })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create blog');
      }

      setTitle(""); setExcerpt(""); setContent(""); setImageUrl("");
      setImageFile(null);
      const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
      setBlogs(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!adminMode) return;
    if (!confirm("Delete this blog post?")) return;
    const session = await supabase.auth.getSession();
    const token = session?.data?.session?.access_token ?? "";
    const resp = await fetch(`/sentinel-learn-lab/backend/api/blogs.php?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!resp.ok) {
      console.error('Delete failed');
    } else {
      setBlogs((b) => b.filter((x) => x.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {adminMode && (
          <section className="max-w-3xl mx-auto mb-8 p-4 bg-card/60 rounded-md border border-primary/20">
            <h2 className="text-lg font-semibold text-foreground mb-2">Admin: Publish Blog</h2>
            <form onSubmit={handleUpload} className="grid grid-cols-1 gap-2">
              <input className="p-2 bg-input text-foreground rounded" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <input className="p-2 bg-input text-foreground rounded" placeholder="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
              <input className="p-2 bg-input text-foreground rounded" placeholder="Image URL (optional if uploading)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} />
              <textarea className="p-2 bg-input text-foreground rounded" placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
              <button type="submit" className="bg-primary text-primary-foreground p-2 rounded">Publish</button>
            </form>
          </section>
        )}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Security <span className="text-primary">Insights</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Latest articles on cybersecurity and ethical hacking
          </p>
        </div>

        {loading ? (
          <div className="text-center text-primary text-lg">Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-muted-foreground text-lg">
            No blog posts available yet. Check back soon!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {blogs.map((blog) => (
              <Card key={blog.id} className="bg-gradient-to-br from-card to-muted border-primary/30 hover:border-primary transition-all hover:shadow-[0_0_30px_hsl(var(--cyber-glow)/0.3)] hover:-translate-y-1">
                <CardHeader>
                  {blog.image_url && (
                    <div className="aspect-video bg-muted/50 rounded-lg overflow-hidden mb-4">
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardTitle className="text-foreground text-xl">{blog.title}</CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(blog.created_at), "MMM dd, yyyy")}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {blog.excerpt || blog.content.substring(0, 150) + "..."}
                  </CardDescription>
                  {adminMode && (
                    <div className="mt-3">
                      <button className="text-sm text-destructive" onClick={() => handleDelete(blog.id)}>Delete</button>
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

export default Blogs;