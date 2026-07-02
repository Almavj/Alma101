import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ExternalLink, Trash2, PenSquare, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { isAdmin } from "@/lib/admin";
import { RichTextEditor } from "@/components/RichTextEditor";

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  link?: string;
  author_id?: string;
  published?: boolean;
  created_at: string;
}

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");

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
      setUserId(session?.user?.id ?? null);
      setAdminMode(isAdmin(session?.user?.email ?? null));
    });
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMode) return;
    try {
      const payload: any = { title, excerpt, content, image_url: imageUrl, published: false };
      if (link) payload.link = link;
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user ?? null;
      if (!currentUser) {
        alert("You must be logged in to create a blog!");
        return;
      }
      payload.author_id = currentUser.id;

      const { error } = await supabase.from("blogs").insert([payload]).select();
      if (error) {
        console.error("Supabase create blog error", error);
      } else {
        setTitle("");
        setExcerpt("");
        setContent("");
        setImageUrl("");
        setLink("");
        setShowForm(false);
        const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
        setBlogs(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!adminMode) return;
    if (!confirm("Delete this blog post?")) return;
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) console.error("Supabase delete blog error", error);
      else setBlogs((b) => b.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Delete blog unexpected error", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Security <span className="text-primary">Insights</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Latest articles on cybersecurity, ethical hacking, and digital forensics
          </p>
        </div>

        {/* Admin Form */}
        {adminMode && (
          <section className="max-w-4xl mx-auto mb-10">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-primary/40 bg-card/40 hover:bg-card/70 hover:border-primary/60 transition-all text-primary font-medium"
              >
                <PenSquare className="h-5 w-5" />
                New Blog Post
              </button>
            ) : (
              <form onSubmit={handleUpload} className="bg-card/60 rounded-xl border border-primary/20 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Create Blog Post</h2>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Cancel
                  </button>
                </div>

                <input
                  className="w-full p-3 bg-input text-foreground rounded-lg border border-border/50 focus:border-primary focus:outline-none transition-colors"
                  placeholder="Blog title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <input
                  className="w-full p-3 bg-input text-foreground rounded-lg border border-border/50 focus:border-primary focus:outline-none transition-colors"
                  placeholder="Short excerpt (optional)"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="w-full p-3 bg-input text-foreground rounded-lg border border-border/50 focus:border-primary focus:outline-none transition-colors"
                    placeholder="Cover image URL (optional)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <input
                    className="w-full p-3 bg-input text-foreground rounded-lg border border-border/50 focus:border-primary focus:outline-none transition-colors"
                    placeholder="External link (optional)"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>

                <RichTextEditor content={content} onChange={setContent} placeholder="Write your blog content here..." />

                <div className="flex justify-end">
                  <button type="submit" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
                    Publish Post
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* Blog Grid */}
        {loading ? (
          <div className="text-center text-primary text-lg py-20">Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-muted-foreground text-lg py-20">
            No blog posts available yet. Check back soon!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {blogs.map((blog) => (
              <Card
                key={blog.id}
                className="group bg-gradient-to-br from-card to-muted border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--cyber-glow)/0.15)] hover:-translate-y-1 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/blogs/${blog.id}`)}
              >
                {blog.image_url && (
                  <div className="aspect-video bg-muted/50 overflow-hidden">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground text-xl leading-tight">{blog.title}</CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(new Date(blog.created_at), "MMM dd, yyyy")}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-muted-foreground line-clamp-3">
                    {blog.excerpt || (blog.content ? blog.content.replace(/<[^>]+>/g, "").substring(0, 180) + "..." : "")}
                  </CardDescription>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:underline">
                      Read article <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    {blog.link && (
                      <span
                        className="text-sm text-primary font-medium flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={blog.link} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                          Source <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </span>
                    )}
                  </div>

                  {adminMode && (
                    <div className="mt-4 pt-3 border-t border-border/30">
                      <button
                        className="text-sm text-destructive flex items-center gap-1.5 hover:underline"
                        onClick={(e) => { e.stopPropagation(); handleDelete(blog.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
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
