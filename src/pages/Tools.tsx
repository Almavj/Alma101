import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";
import { isAdmin } from "@/lib/admin";
import { uploadFile } from "@/lib/storage";

interface Tool {
  id: string;
  name: string;
  description: string;
  tool_url: string;
  category: string;
}

const Tools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [toolUrl, setToolUrl] = useState("");
  const [category, setCategory] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);

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
    if (!adminMode) return;
    let iconUrl = '';
    if (iconFile) {
      const path = `tools/${Date.now()}_${iconFile.name}`;
      const uploaded = await uploadFile('tools', path, iconFile);
      if (uploaded) iconUrl = uploaded;
    }
    const payload: any = { name, description, tool_url: toolUrl, category };
    if (iconUrl) payload.icon_url = iconUrl;
    try {
      const { error } = await supabase.from('tools').insert([payload]);
      if (error) console.error('Supabase create tool error', error);
      else {
        setName(""); setDescription(""); setToolUrl(""); setCategory(""); setIconFile(null);
        const { data } = await supabase.from("tools").select("*").order("created_at", { ascending: false });
        setTools(data || []);
      }
    } catch (err) {
      console.error('Create tool unexpected error', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!adminMode) return;
    if (!confirm("Delete this tool?")) return;
    try {
      const { error } = await supabase.from('tools').delete().eq('id', id);
      if (error) console.error('Supabase delete tool error', error);
      else setTools((t) => t.filter((x) => x.id !== id));
    } catch (err) {
      console.error('Delete tool unexpected error', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {adminMode && (
          <section className="max-w-3xl mx-auto mb-8 p-4 bg-card/60 rounded-md border border-primary/20">
            <h2 className="text-lg font-semibold text-foreground mb-2">Admin: Add Tool</h2>
            <form onSubmit={handleUpload} className="grid grid-cols-1 gap-2">
              <input className="p-2 bg-input text-foreground rounded" placeholder="Tool name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className="p-2 bg-input text-foreground rounded" placeholder="Tool URL" value={toolUrl} onChange={(e) => setToolUrl(e.target.value)} />
              <input className="p-2 bg-input text-foreground rounded" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
              <input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files ? e.target.files[0] : null)} />
              <textarea className="p-2 bg-input text-foreground rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <button type="submit" className="bg-primary text-primary-foreground p-2 rounded">Add Tool</button>
            </form>
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
              <Card key={tool.id} className="bg-gradient-to-br from-card to-muted border-primary/30 hover:border-primary transition-all hover:shadow-[0_0_30px_hsl(var(--cyber-glow)/0.3)] hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-foreground">{tool.name}</CardTitle>
                  {tool.category && (
                    <span className="text-xs text-primary font-semibold">{tool.category}</span>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-muted-foreground">
                    {tool.description}
                  </CardDescription>
                  {tool.tool_url && (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <a href={tool.tool_url} target="_blank" rel="noopener noreferrer">
                        Access Tool <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {adminMode && (
                    <div className="mt-3">
                      <button className="text-sm text-destructive" onClick={() => handleDelete(tool.id)}>Delete</button>
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