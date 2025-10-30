import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/admin";

interface WriteupItem {
  id: string;
  title: string;
  body: string;
  created_at?: string;
}

const Writeup = () => {
  const [items, setItems] = useState<WriteupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await (supabase as any).from("writeups").select("*").order("created_at", { ascending: false });
      if (!error && data) setItems(data);
      setLoading(false);
    };
    fetch();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminMode(isAdmin(session?.user?.email ?? null));
    });
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMode) return;
    try {
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token ?? "";
      const resp = await fetch('/sentinel-learn-lab/backend/api/writeups.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, body })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        console.error('Create writeup failed', err);
      } else {
        setTitle(""); setBody("");
        const { data } = await (supabase as any).from("writeups").select("*").order("created_at", { ascending: false });
        setItems(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!adminMode) return;
    if (!confirm("Delete this writeup?")) return;
    const session = await supabase.auth.getSession();
    const token = session?.data?.session?.access_token ?? "";
    const resp = await fetch(`/sentinel-learn-lab/backend/api/writeups.php?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!resp.ok) {
      console.error('Delete failed');
    } else setItems((i) => i.filter((x) => x.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Writeups</h1>
          <p className="text-muted-foreground text-lg">Notes and writeups — admin can add or remove entries.</p>
        </div>

        {adminMode && (
          <section className="max-w-3xl mx-auto mb-8 p-4 bg-card/60 rounded-md border border-primary/20">
            <h2 className="text-lg font-semibold text-foreground mb-2">Admin: Add Writeup</h2>
            <form onSubmit={handleUpload} className="grid grid-cols-1 gap-2">
              <input className="p-2 bg-input text-foreground rounded" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <textarea className="p-2 bg-input text-foreground rounded" placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} required />
              <button type="submit" className="bg-primary text-primary-foreground p-2 rounded">Publish</button>
            </form>
          </section>
        )}

        {loading ? (
          <div className="text-center text-primary">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground">No writeups yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {items.map((it) => (
              <Card key={it.id} className="bg-gradient-to-br from-card to-muted border-primary/30">
                <CardHeader>
                  <CardTitle className="text-foreground">{it.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{it.body}</CardDescription>
                  {adminMode && (
                    <div className="mt-3">
                      <button className="text-sm text-destructive" onClick={() => handleDelete(it.id)}>Delete</button>
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
