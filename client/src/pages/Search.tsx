import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import DashboardLayout from "@/components/DashboardLayout";
import { Search as SearchIcon, Brain, Loader2, Globe, ArrowRight, Database } from "lucide-react";

const EXAMPLE_QUERIES = [
  "Which sites use WordPress?",
  "Sites with Google Analytics",
  "Businesses in e-commerce",
  "Sites with low SEO scores",
  "Companies using Shopify",
];

export default function Search() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const { data: results, isLoading } = trpc.analysis.searchRag.useQuery(
    { query: submittedQuery },
    { enabled: submittedQuery.length >= 3 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 3) setSubmittedQuery(query.trim());
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to search</h2>
          <Button asChild><a href={getLoginUrl()}>Sign In</a></Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" /> RAG Knowledge Search
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Search across all your analysed websites using natural language. Powered by your RAG knowledge base.
          </p>
        </div>

        {/* Search Form */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search your knowledge base..."
                  className="pl-10 bg-background"
                />
              </div>
              <Button type="submit" disabled={query.trim().length < 3} className="gap-2 shrink-0">
                <SearchIcon className="w-4 h-4" /> Search
              </Button>
            </form>

            {/* Example queries */}
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Try these:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUERIES.map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => { setQuery(q); setSubmittedQuery(q); }}
                    className="text-xs px-3 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {submittedQuery && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {isLoading ? "Searching..." : `${results?.length || 0} results for "${submittedQuery}"`}
              </h3>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : !results || results.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <Database className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground text-sm">No results found. Try a different query or analyse more websites to build your knowledge base.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {results.map((result) => (
                  <Card key={result.id} className="bg-card border-border card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Globe className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-medium text-sm">{result.domain}</span>
                              <Badge variant="outline" className="text-xs capitalize">{result.chunkType}</Badge>
                            </div>
                            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">{result.content}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => navigate(`/report/${result.analysisId}`)}
                          className="gap-1 text-xs shrink-0"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!submittedQuery && (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="font-medium mb-2">Your RAG Knowledge Base</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Every website you analyse is automatically indexed here. Search across all your business intelligence data using natural language.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
