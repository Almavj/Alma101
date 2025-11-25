import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/admin";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface WriteupItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  published?: boolean;
  created_at?: string;
}

const Writeup = () => {
  const [items, setItems] = useState<WriteupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [published, setPublished] = useState(true);

  useEffect(() => {
        const loadWriteups = async () => {
      try {
        const { data, error } = await (supabase.from('writeups' as any).select('*').order('created_at', { ascending: false }));
        if (error) {
          console.error('Supabase load writeups error', error);
          setItems([]);
        } else if (data) {
          setItems(data as WriteupItem[]);
        }
      } catch (err) {
        console.error('Load writeups unexpected error', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadWriteups();
    // determine current user and admin status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminMode(isAdmin(session?.user?.email ?? null));
    });
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMode) return;
    try {
      const payload: any = { title, description };
      if (url) payload.url = url;
      payload.published = published;

      const { error } = await supabase.from('writeups' as any).insert([payload]);
      if (error) {
        console.error('Supabase create writeup error', error);
      } else {
        setTitle('');
        setDescription('');
        setUrl('');
        setPublished(true);
        const { data } = await supabase.from('writeups' as any).select('*').order('created_at', { ascending: false });
        setItems(data ?? []);
      }
    } catch (err) {
      console.error('Create writeup unexpected error', err);
    }
  };


  const handleDelete = async (id: string) => {
    if (!adminMode) return;
    if (!confirm("Delete this writeup?")) return;
    try {
      const { error } = await (supabase.from('writeups' as any).delete().eq('id', id));
      if (error) {
        console.error('Supabase delete writeup error', error);
      } else {
        setItems((i) => i.filter((x) => x.id !== id));
      }
    } catch (err) {
      console.error('Delete writeup unexpected error', err);
    }
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
              <input className="p-2 bg-input text-foreground rounded" placeholder="URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} />
              <textarea className="p-2 bg-input text-foreground rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                <span className="text-muted-foreground">Published</span>
              </label>
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
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{it.created_at ? format(new Date(it.created_at), "MMM dd, yyyy") : ''}</span>
                        {it.published === false && <span className="ml-2 text-xs text-amber-500">Draft</span>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-muted-foreground">{it.description}</CardDescription>
                      {it.url && (
                        <div className="mt-3">
                          <a href={it.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">Read full writeup</a>
                        </div>
                      )}
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
