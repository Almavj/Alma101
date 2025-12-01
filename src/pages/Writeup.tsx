import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();
  // Backend API base (centralized)
  const API_BASE = (API_URL ?? '').replace(/\/+$/, '');

  useEffect(() => {
        const loadWriteups = async () => {
      try {
              // Supabase client types can be narrow here; cast to any to simplify usage
              const { data, error } = await (supabase.from('writeups' as any).select('*').order('created_at', { ascending: false })) as any;
            if (error) {
              console.error('Supabase load writeups error', error);
              setItems([]);
            } else if (data) {
                setItems((data as WriteupItem[]) ?? []);
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
      // Normalize URL: ensure it has a protocol so links work correctly
      if (url) {
        const trimmed = url.trim();
        payload.url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      }
      payload.published = published;

      // Use backend API to create writeup (ensures admin auth + consistent behavior)
  const { data: { session } } = await supabase.auth.getSession();
  const token = (session as any)?.access_token ?? null;
  const resp = await fetch(`${API_BASE}/writeups.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const result = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        console.error('Create writeup error', result);
        toast({ title: 'Create failed', description: (result?.message || JSON.stringify(result)) as any, variant: 'destructive' });
      } else {
        // Prefer using returned data (backend returns created representation) for immediate UI update
        const newItem = (result && result.data && Array.isArray(result.data) && result.data[0]) ? result.data[0] : null;

        setTitle('');
        setDescription('');
        setUrl('');
        setPublished(true);

        if (newItem) {
          setItems((prev) => [newItem as any, ...prev]);
        } else {
          // fallback: reload items from Supabase
            const { data } = await (supabase.from('writeups' as any).select('*').order('created_at', { ascending: false })) as any;
            setItems((data as WriteupItem[]) ?? []);
        }
      }
    } catch (err) {
      console.error('Create writeup unexpected error', err);
    }
  };

  const handleEdit = (item: WriteupItem) => {
    setEditingId(item.id);
    setTitle(item.title ?? '');
    setDescription(item.description ?? '');
    setUrl(item.url ?? '');
    setPublished(item.published ?? true);
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

  const { data: { session } } = await supabase.auth.getSession();
  const token = (session as any)?.access_token ?? null;
  const resp = await fetch(`${API_BASE}/writeups.php?id=${encodeURIComponent(editingId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const result = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        console.error('Update writeup error', result);
        toast({ title: 'Update failed', description: (result?.message || JSON.stringify(result)) as any, variant: 'destructive' });
      } else {
        // if backend returned the updated representation, use it to update local state
        // backend returns { data: [ ...updatedRows ] }
        let updatedItem: any = null;
        if (result && result.data && Array.isArray(result.data) && result.data[0]) {
          updatedItem = result.data[0];
        }

        setEditingId(null);
        setTitle('');
        setDescription('');
        setUrl('');
        setPublished(true);

        if (updatedItem) {
          setItems((prev) => prev.map((it) => (it.id === updatedItem.id ? updatedItem : it)));
        } else {
          // fallback: reload items from Supabase
          const { data } = await (supabase.from('writeups' as any).select('*').order('created_at', { ascending: false })) as any;
          setItems((data as WriteupItem[]) ?? []);
        }
      }
    } catch (err) {
      console.error('Update writeup unexpected error', err);
      toast({ title: 'Update error', description: String(err), variant: 'destructive' });
    }
  };


  const handleDelete = async (id: string) => {
    if (!adminMode) return;
    if (!confirm("Delete this writeup?")) return;
    try {
      // Call backend API to delete (backend enforces admin via token)
  const { data: { session } } = await supabase.auth.getSession();
  const token = (session as any)?.access_token ?? null;
  const resp = await fetch(`${API_BASE}/writeups.php?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        console.error('Backend delete error', body);
        toast({ title: 'Delete failed', description: (body?.message || JSON.stringify(body)) as any, variant: 'destructive' });
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
            <form onSubmit={editingId ? handleUpdate : handleUpload} className="grid grid-cols-1 gap-2">
              <input id="writeup-title" name="title" className="p-2 bg-input text-foreground rounded" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <input id="writeup-url" name="url" className="p-2 bg-input text-foreground rounded" placeholder="URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} />
              <textarea id="writeup-description" name="description" className="p-2 bg-input text-foreground rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                <span className="text-muted-foreground">Published</span>
              </label>
              <div className="flex gap-2">
                <button type="submit" className="bg-primary text-primary-foreground p-2 rounded">{editingId ? 'Save' : 'Publish'}</button>
                {editingId && (
                  <button type="button" className="bg-muted text-foreground p-2 rounded" onClick={() => {
                    setEditingId(null);
                    setTitle(''); setDescription(''); setUrl(''); setPublished(true);
                  }}>Cancel</button>
                )}
              </div>
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
                          <div className="flex gap-4">
                            <button className="text-sm text-destructive" onClick={() => handleDelete(it.id)}>Delete</button>
                            <button className="text-sm text-accent" onClick={() => handleEdit(it)}>Edit</button>
                          </div>
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
