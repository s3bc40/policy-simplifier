import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SummarizeForm } from "@/components/summarize-form";
import { LogoutButton } from "@/components/logout-button";
import { ModeToggle } from "@/components/mode-toggle";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SummarizePage() {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">PolicySimplifier</span>
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <div className="text-sm text-muted-foreground">
                {profile.subscription_tier === "FREE" ? (
                  <span>{profile.credits || 0} credits available</span>
                ) : (
                  <span className="text-primary font-medium">
                    Premium (Unlimited)
                  </span>
                )}
              </div>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/billing">Buy Credits</Link>
            </Button>
            <ModeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Security Policy Simplifier
          </h1>
          <p className="text-muted-foreground">
            Paste a dense policy document below, and our AI will translate it
            into a simple, actionable internal memo. (Free users are limited to
            5 summaries/month.)
          </p>
        </div>

        <SummarizeForm />
      </main>
    </div>
  );
}
