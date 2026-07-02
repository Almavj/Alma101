import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { isAdmin } from "@/lib/admin";

interface WriteupItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  published?: boolean;
  created_at?: string;
}

const WriteupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<WriteupItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("writeups")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) setItem(data);
      setLoading(false);
    };

    fetchItem();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminMode(isAdmin(session?.user?.email ?? null));
    });
  }, [id]);

  const handleDelete = async () => {
    if (!adminMode || !id) return;
    if (!confirm("Delete this writeup?")) return;
    const { error } = await supabase.from("writeups").delete().eq("id", id);
    if (!error) navigate("/writeup");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
        <Navigation />
        <div className="text-center text-primary pt-32">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
        <Navigation />
        <div className="text-center text-muted-foreground pt-32">Writeup not found.</div>
      </div>
    );
  }

  const renderContent = () => {
    const html = item.description || "";
    const looksLikeHtml = /<[^>]+>/g.test(html);
    if (looksLikeHtml) {
      const clean = DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
      return (
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:text-foreground prose-p:text-muted-foreground
            prose-a:text-primary prose-strong:text-foreground
            prose-img:rounded-xl prose-img:my-6 prose-img:shadow-lg
            prose-blockquote:border-primary/40"
          dangerouslySetInnerHTML={{ __html: clean }}
        />
      );
    }
    return <p className="text-muted-foreground whitespace-pre-wrap text-lg leading-relaxed">{html}</p>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        {/* Back button */}
        <button
          onClick={() => navigate("/writeup")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Writeups
        </button>

        {/* Meta */}
        <div className="flex items-center gap-3 text-muted-foreground text-sm mb-4">
          <Calendar className="h-4 w-4" />
          <span>{item.created_at ? format(new Date(item.created_at), "MMMM dd, yyyy") : ""}</span>
          {item.published === false && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-500 font-medium">Draft</span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
          {item.title}
        </h1>

        {/* Content */}
        {renderContent()}

        {/* External link */}
        {item.url && (
          <div className="mt-10 p-4 rounded-xl border border-primary/20 bg-card/40">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Open external link
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
              Delete this writeup
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default WriteupDetail;
