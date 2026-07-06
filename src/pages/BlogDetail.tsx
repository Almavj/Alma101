import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { isAdmin } from "@/lib/admin";

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

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) setBlog(data);
      setLoading(false);
    };

    fetchBlog();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminMode(isAdmin(session?.user?.email ?? null));
    });
  }, [id]);

  const handleDelete = async () => {
    if (!adminMode || !id) return;
    if (!confirm("Delete this blog post?")) return;
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (!error) navigate("/blogs");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
        <Navigation />
        <div className="text-center text-primary pt-32">Loading...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
        <Navigation />
        <div className="text-center text-muted-foreground pt-32">Blog post not found.</div>
      </div>
    );
  }

  const clean = DOMPurify.sanitize(blog.content || "", { ADD_ATTR: ["target"] });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        {/* Back button */}
        <button
          onClick={() => navigate("/blogs")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Blogs
        </button>

        {/* Cover image */}
        {blog.image_url && (
          <div className="rounded-2xl overflow-hidden mb-8 border border-border/30">
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-full h-auto max-h-[400px] object-cover"
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-muted-foreground text-sm mb-4">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(blog.created_at), "MMMM dd, yyyy")}</span>
          {blog.published === false && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-500 font-medium">Draft</span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
          {blog.title}
        </h1>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-lg text-muted-foreground mb-8 italic">{blog.excerpt}</p>
        )}

        {/* Content */}
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:text-foreground prose-p:text-foreground
            prose-a:text-primary prose-strong:text-foreground
            prose-img:rounded-xl prose-img:my-6 prose-img:shadow-lg
            prose-blockquote:border-primary/40"
          dangerouslySetInnerHTML={{ __html: clean }}
        />

        {/* External link */}
        {blog.link && (
          <div className="mt-10 p-4 rounded-xl border border-primary/20 bg-card/40">
            <a
              href={blog.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Read the full source article
            </a>
          </div>
        )}

        {/* Admin actions */}
        {adminMode && (
          <div className="mt-10 pt-6 border-t border-border/30">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-destructive hover:underline text-sm"
            >
              <Trash2 className="h-4 w-4" />
              Delete this post
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogDetail;
