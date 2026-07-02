import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { isAdmin } from "@/lib/admin";
import { Calendar, ExternalLink, Trash2, PenSquare, Pencil, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { RichTextEditor } from "@/components/RichTextEditor";

interface WriteupItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  published?: boolean;
  created_at?: string;
}

const Writeup = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<WriteupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadWriteups = async () => {
      try {
        const { data, error } = await supabase
          .from("writeups")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase load writeups error", error);
          setItems([]);
        } else if (data) {
          setItems(data as WriteupItem[]);
        }
      } catch (err) {
        console.error("Load writeups unexpected error", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadWriteups();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminMode(isAdmin(session?.user?.email ?? null));
    });
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setUrl("");
    setPublished(true);
    setEditingId(null);
    setShowForm(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMode) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user ?? null;
      if (!currentUser) {
        alert("You must be logged in to create a writeup!");
        return;
      }

      const payload: any = { title, description, author_id: currentUser.id };
      if (url) {
        const trimmed = url.trim();
        payload.url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      }
      payload.published = published;

      const { error } = await supabase.from("writeups").insert([payload]).select();
      if (error) {
        console.error("Supabase create writeup error", error);
        toast({ title: "Create failed", description: error.message, variant: "destructive" });
      } else {
        resetForm();
        const { data } = await supabase.from("writeups").select("*").order("created_at", { ascending: false });
        setItems((data as WriteupItem[]) ?? []);
      }
    } catch (err) {
      console.error("Create writeup unexpected error", err);
    }
  };

  const handleEdit = (item: WriteupItem) => {
    setEditingId(item.id);
    setTitle(item.title ?? "");
    setDescription(item.description ?? "");
    setUrl(item.url ?? "");
    setPublished(item.published ?? true);
    setShowForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMode || !editingId) return;
    try {
      const payload: any = { title, description };
      if (url) {
        const trimmed = url.trim();
        payload.url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      } else {
        payload.url = null;
      }
      payload.published = published;

      const { error } = await supabase
        .from("writeups")
        .update(payload)
        .eq("id", editingId)
        .select();

      if (error) {
        console.error("Supabase update writeup error", error);
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      } else {
        resetForm();
        const { data } = await supabase.from("writeups").select("*").order("created_at", { ascending: false });
        setItems((data as WriteupItem[]) ?? []);
      }
    } catch (err) {
      console.error("Update writeup unexpected error", err);
      toast({ title: "Update error", description: String(err), variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!adminMode) return;
    if (!confirm("Delete this writeup?")) return;
    try {
      const { error } = await supabase.from("writeups").delete().eq("id", id);
      if (error) {
        console.error("Supabase delete writeup error", error);
      } else {
        setItems((i) => i.filter((x) => x.id !== id));
      }
    } catch (err) {
      console.error("Delete writeup unexpected error", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Writeups</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Detailed walkthroughs and notes — admin can add or remove entries.
          </p>
        </div>

        {/* Admin Form */}
        {adminMode && (
          <section className="max-w-4xl mx-auto mb-10">
            {!showForm && !editingId ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-primary/40 bg-card/40 hover:bg-card/70 hover:border-primary/60 transition-all text-primary font-medium"
              >
                <PenSquare className="h-5 w-5" />
                New Writeup
              </button>
            ) : (
              <form onSubmit={editingId ? handleUpdate : handleUpload} className="bg-card/60 rounded-xl border border-primary/20 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    {editingId ? "Edit Writeup" : "Create Writeup"}
                  </h2>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Cancel
                  </button>
                </div>

                <input
                  className="w-full p-3 bg-input text-foreground rounded-lg border border-border/50 focus:border-primary focus:outline-none transition-colors"
                  placeholder="Writeup title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <input
                  className="w-full p-3 bg-input text-foreground rounded-lg border border-border/50 focus:border-primary focus:outline-none transition-colors"
                  placeholder="External URL (optional)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />

                <RichTextEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="Write your writeup content here..."
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="rounded border-border"
                    />
                    Published
                  </label>
                  <button type="submit" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
                    {editingId ? "Save Changes" : "Publish Writeup"}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* Writeup List */}
        {loading ? (
          <div className="text-center text-primary py-20">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">No writeups yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {items.map((it) => (
              <Card
                key={it.id}
                className="group bg-gradient-to-br from-card to-muted border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--cyber-glow)/0.15)] overflow-hidden cursor-pointer"
                onClick={() => navigate(`/writeup/${it.id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground text-xl leading-tight">{it.title}</CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{it.created_at ? format(new Date(it.created_at), "MMM dd, yyyy") : ""}</span>
                    {it.published === false && (
                      <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-500 font-medium">
                        Draft
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-muted-foreground line-clamp-4">
                    {it.description?.replace(/<[^>]+>/g, "").substring(0, 200) + (it.description && it.description.length > 200 ? "..." : "") || ""}
                  </CardDescription>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:underline">
                      Read writeup <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    {it.url && (
                      <span
                        className="text-sm text-primary font-medium flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={it.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                          Link <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </span>
                    )}
                  </div>

                  {adminMode && (
                    <div className="mt-4 pt-3 border-t border-border/30 flex items-center gap-4">
                      <button
                        className="text-sm text-primary flex items-center gap-1.5 hover:underline"
                        onClick={(e) => { e.stopPropagation(); handleEdit(it); }}
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        className="text-sm text-destructive flex items-center gap-1.5 hover:underline"
                        onClick={(e) => { e.stopPropagation(); handleDelete(it.id); }}
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

export default Writeup;
