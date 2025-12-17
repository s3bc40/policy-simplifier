import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Sparkles, Zap, Shield } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted">
      {/* Header/Nav */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">PolicySimplifier</span>
        </div>
        <div className="flex gap-3 items-center">
          <ModeToggle />
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/login">Get Started Free</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Turn Complex Policies into{" "}
            <span className="text-primary">Clear Summaries</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            AI-powered policy analysis that saves you hours. Paste any policy
            document and get structured, actionable summaries in seconds.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/auth/login">
                Start Summarizing Free
                <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            ✨ 5 free summaries per month • No credit card required
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Zap className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold">Instant Results</h3>
              <p className="text-muted-foreground">
                Powered by Google Gemini AI. Get comprehensive summaries in
                under 10 seconds.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-2">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your documents are processed securely. We never store your
                policy content.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-2">
              <FileText className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold">Structured Output</h3>
              <p className="text-muted-foreground">
                Get organized summaries with key points, requirements, and
                compliance notes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto bg-primary text-primary-foreground">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-3xl font-bold">
              Ready to simplify your policies?
            </h2>
            <p className="text-lg opacity-90">
              Join businesses using PolicySimplifier to save time on compliance
              and security reviews.
            </p>
            <Button size="lg" variant="secondary" asChild className="mt-4">
              <Link href="/auth/login">
                Get Started Now
                <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 PolicySimplifier. Built with Next.js & Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
