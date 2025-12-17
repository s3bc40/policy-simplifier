import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/summarize";

  if (code) {
    const supabase = await createClient();

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user has a profile in your profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      // If no profile exists, create one (for OAuth users)
      if (!profile) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: data.user.id,
          subscription_tier: "FREE",
          credits: 5,
        });

        if (insertError) {
          console.error("Error creating user profile:", insertError);
          console.error("Details:", insertError.details);
        }
      }

      // Redirect to intended destination
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // If error or no code, redirect to error page
  return NextResponse.redirect(new URL("/auth/error", requestUrl.origin));
}
