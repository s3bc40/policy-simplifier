import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createCheckoutSession } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, ArrowLeft } from "lucide-react";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Buy Credits</h1>
            <Link href="/summarize">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Summarize
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Each policy summary uses 1 credit
          </p>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-4xl">
        {/* Current Status */}
        {user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">
                {profile?.credits || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Available credits for policy summaries
              </p>
            </CardContent>
          </Card>
        )}

        {!user && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
            <CardHeader>
              <CardTitle>Sign in to Purchase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create an account or sign in to start with 5 free credits and
                purchase more whenever you need them.
              </p>
              <div className="flex gap-2">
                <Link href="/auth/login">
                  <Button>Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline">Create Account</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Choose Your Package</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 20 Credits */}
            <Card>
              <CardHeader>
                <CardTitle>20 Credits</CardTitle>
                <CardDescription>Try it out</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-3xl font-bold">$2.99</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    $0.15 per credit
                  </p>
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>20 policy summaries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Never expires</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Perfect for testing</span>
                  </li>
                </ul>

                <form action={createCheckoutSession}>
                  <input type="hidden" name="priceKey" value="CREDITS_20" />
                  <Button type="submit" className="w-full">
                    Buy Now
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* 75 Credits */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle>75 Credits</CardTitle>
                <CardDescription>Most popular</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-3xl font-bold">$9.99</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    $0.13 per credit
                  </p>
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>75 policy summaries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Never expires</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>15% savings</span>
                  </li>
                </ul>

                <form action={createCheckoutSession}>
                  <input type="hidden" name="priceKey" value="CREDITS_75" />
                  <Button type="submit" className="w-full">
                    Buy Now
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* 200 Credits */}
            <Card>
              <CardHeader>
                <CardTitle>200 Credits</CardTitle>
                <CardDescription>Best value</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-3xl font-bold">$24.99</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    $0.12 per credit
                  </p>
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>200 policy summaries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Never expires</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>20% savings</span>
                  </li>
                </ul>

                <form action={createCheckoutSession}>
                  <input type="hidden" name="priceKey" value="CREDITS_200" />
                  <Button type="submit" className="w-full">
                    Buy Now
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 space-y-4">
          <h3 className="text-lg font-bold">Frequently Asked Questions</h3>

          <div className="space-y-3">
            <div>
              <p className="font-medium">How long do credits last?</p>
              <p className="text-sm text-muted-foreground">
                Credits never expire. Use them anytime, no time limits.
              </p>
            </div>

            <div>
              <p className="font-medium">Can I get a refund?</p>
              <p className="text-sm text-muted-foreground">
                Contact support within 30 days for a full refund if you
                haven&apos;t used the credits.
              </p>
            </div>

            <div>
              <p className="font-medium">Do credits roll over?</p>
              <p className="text-sm text-muted-foreground">
                Yes! Unused credits accumulate, so you can save them for later.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
