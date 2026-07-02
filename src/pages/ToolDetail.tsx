import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { isAdmin } from "@/lib/admin";

interface Tool {
  id: string;
  name: string;
  description: string;
  tool_url: string;
  category: string;
  icon_url?: string;
}

const ToolDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    const fetchTool = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) setTool(data);
      setLoading(false);
    };

    fetchTool();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminMode(isAdmin(session?.user?.email ?? null));
    });
  }, [id]);

  const handleDelete = async () => {
    if (!adminMode || !id) return;
    if (!confirm("Delete this tool?")) return;
    const { error } = await supabase.from("tools").delete().eq("id", id);
    if (!error) navigate("/tools");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
        <Navigation />
        <div className="text-center text-primary pt-32">Loading...</div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
        <Navigation />
        <div className="text-center text-muted-foreground pt-32">Tool not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        {/* Back button */}
        <button
          onClick={() => navigate("/tools")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Tools
        </button>

        <Card className="bg-gradient-to-br from-card to-muted border-primary/20">
          {tool.icon_url && (
            <div className="p-6 flex justify-center">
              <img src={tool.icon_url} alt={tool.name} className="w-24 h-24 rounded-xl object-cover border border-border/30" />
            </div>
          )}
          <CardHeader className="text-center">
            <CardTitle className="text-foreground text-3xl">{tool.name}</CardTitle>
            {tool.category && (
              <span className="inline-block mx-auto px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full">
                {tool.category}
              </span>
            )}
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">
              {tool.description}
            </p>

            {tool.tool_url && (
              <Button
                asChild
                variant="outline"
                className="w-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground h-12 text-base"
              >
                <a href={tool.tool_url} target="_blank" rel="noopener noreferrer">
                  Access Tool <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}

            {adminMode && (
              <div className="pt-4 border-t border-border/30">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-destructive hover:underline text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete this tool
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ToolDetail;
