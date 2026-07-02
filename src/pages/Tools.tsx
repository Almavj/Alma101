import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Trash2, PenSquare, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { isAdmin } from "@/lib/admin";

interface Tool {
  id: string;
  name: string;
  description: string;
  tool_url: string;
  category: string;
}

const Tools = () => {
  const navigate = useNavigate();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [toolUrl, setToolUrl] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchTools = async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setTools(data);
      }
      setLoading(false);
    };

    fetchTools();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminMode(isAdmin(session?.user?.email ?? null));
    });
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = { name, description, tool_url: toolUrl, category };
      const { error } = await supabase.from('tools').insert([payload]);
      if (error) {
        console.error('Supabase create tool error', error);
        toast.error(error.message);
      } else {
        toast.success("Tool added successfully!");
        setName(""); setDescription(""); setToolUrl(""); setCategory("");
        setShowForm(false);
        const { data } = await supabase.from("tools").select("*").order("created_at", { ascending: false });
        setTools(data || []);
      }
    } catch (err) {
      console.error('Create tool unexpected error', err);
      toast.error("Failed to add tool");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!adminMode) return;
    if (!confirm("Delete this tool?")) return;
    try {
      const { error } = await supabase.from('tools').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete tool error', error);
        toast.error(error.message);
      } else {
        toast.success("Tool deleted");
        setTools((t) => t.filter((x) => x.id !== id));
      }
    } catch (err) {
      console.error('Delete tool unexpected error', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {adminMode && (
          <section className="max-w-3xl mx-auto mb-8">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-primary/40 bg-card/40 hover:bg-card/70 hover:border-primary/60 transition-all text-primary font-medium"
              >
                <PenSquare className="h-5 w-5" />
                Add New Tool
              </button>
            ) : (
              <form onSubmit={handleUpload} className="bg-card/60 rounded-xl border border-primary/20 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Add Tool</h2>
                  <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground text-sm">Cancel</button>
                </div>
                <input className="w-full p-3 bg-input text-foreground rounded-lg border border-border/50 focus:border-primary focus:outline-none" placeholder="Tool name" value={name} onChange={(e) => setName(e.target.value)} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="w-full p-3 bg-input text-foreground rounded-lg border border-border/50 focus:border-primary focus:outline-none" placeholder="Tool URL" value={toolUrl} onChange={(e) => setToolUrl(e.target.value)} />
                  <input className="w-full p-3 bg-input text-foreground rounded-lg border border-border/50 focus:border-primary focus:outline-none" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
                <textarea className="w-full p-3 bg-input text-foreground rounded-lg border border-border/50 focus:border-primary focus:outline-none" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <div className="flex justify-end">
                  <button type="submit" disabled={submitting} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                    {submitting ? "Adding..." : "Add Tool"}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Hacking <span className="text-primary">Tools</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Essential tools for ethical hackers and security professionals
          </p>
        </div>

        {loading ? (
          <div className="text-center text-primary text-lg">Loading tools...</div>
        ) : tools.length === 0 ? (
          <div className="text-center text-muted-foreground text-lg">
            No tools available yet. Check back soon!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card
                key={tool.id}
                className="group bg-gradient-to-br from-card to-muted border-primary/30 hover:border-primary transition-all hover:shadow-[0_0_30px_hsl(var(--cyber-glow)/0.3)] hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/tools/${tool.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-foreground">{tool.name}</CardTitle>
                  {tool.category && (
                    <span className="text-xs text-primary font-semibold">{tool.category}</span>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-muted-foreground line-clamp-3">
                    {tool.description}
                  </CardDescription>
                  <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:underline">
                    View details <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {adminMode && (
                    <div className="pt-3 border-t border-border/30">
                      <button
                        className="text-sm text-destructive flex items-center gap-1.5 hover:underline"
                        onClick={(e) => { e.stopPropagation(); handleDelete(tool.id); }}
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

export default Tools;