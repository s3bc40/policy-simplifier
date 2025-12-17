"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { inputSchema, policySummarySchema, PolicySummary } from "@/lib/schemas";
import { z } from "zod";

// Business Logic Constant
const FREE_LIMIT = 5;

// Define the response state structure for the frontend
type ActionState = {
  result?: PolicySummary;
  error?: string;
};

// Main Server Action function
export async function summarizePolicy(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const policyText = formData.get("policyText") as string;

  // ----------------------------------------------------
  // Step 1: Input Validation
  // ----------------------------------------------------
  try {
    inputSchema.parse({ policyText });
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Return the first input validation error message
      return { error: err.issues[0].message };
    }
    return { error: "Invalid form input." };
  }

  // ----------------------------------------------------
  // Step 2: Authentication & Gate Check
  // ----------------------------------------------------
  const sessionClient = await createSessionClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return { error: "Authentication required. Please log in to continue." };
  }

  // Fetch user profile and freemium status
  const { data: profile, error: selectError } = await sessionClient
    .from("profiles")
    .select("role, monthly_uses")
    .eq("id", user.id)
    .single();

  if (selectError || !profile) {
    console.error("Profile Fetch Error:", selectError);
    return { error: "Could not retrieve user profile for usage check." };
  }

  const { role, monthly_uses } = profile;

  if (role === "FREE" && monthly_uses >= FREE_LIMIT) {
    return {
      error: `Free tier limit of ${FREE_LIMIT} uses reached. Please upgrade to PREMIUM.`,
    };
  }

  // ----------------------------------------------------
  // Step 3: Call Gemini with Structured Output
  // ----------------------------------------------------
  try {
    const systemPrompt = `You are an expert Security Consultant specializing in internal policy communication and risk management. Your task is to analyze security policy text and simplify it into a clear, actionable internal memo for a non-technical audience.

You MUST respond with ONLY valid JSON (no markdown, no extra text) matching this exact structure:
{
  "memoTitle": "string - A concise, non-technical title",
  "targetAudience": "string - One of: 'Employees', 'Leadership', or 'Technical Team'",
  "top3Risks": ["string", "string", "string"] - Exactly 3 risks, each at least 10 characters,
  "keyRequirements": [
    {"category": "string - Policy area like 'Password Management'", "simplifiedAction": "string - Single clear action to take"},
    ... 5 to 10 requirements total
  ],
  "nextStep": "string - Single clear call-to-action within 7 days"
}`;

    const userPrompt = `Analyze and simplify this policy into an internal memo:

${policyText}

Remember: Return ONLY the JSON object, no markdown formatting, no extra text.`;

    const { text: jsonResponse } = await generateText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.2,
    });

    if (!jsonResponse || jsonResponse.trim().length === 0) {
      console.error(
        "Gemini Response Error: Text content was empty or missing."
      );
      return {
        error:
          "AI processing failed to return a policy summary. Please try again with different text.",
      };
    }

    // Extract JSON from the response (handle markdown code blocks if present)
    let jsonString = jsonResponse.trim();
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    // Parse and validate against schema
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr, "Response:", jsonString);
      return {
        error:
          "AI response was not valid JSON. Please try again with different policy text.",
      };
    }

    // Final validation: Parse the AI's response to ensure it matches the schema
    const summaryData = policySummarySchema.parse(parsedJson);

    // ----------------------------------------------------
    // Step 4: Update Usage (Use Admin Client)
    // ----------------------------------------------------
    if (role === "FREE") {
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ monthly_uses: monthly_uses + 1 })
        .eq("id", user.id);

      if (updateError) {
        console.error("Usage Tracking Error:", updateError);
      } else {
        // Revalidate the summarize page to refresh usage count display
        revalidatePath("/summarize");
      }
    }

    return { result: summaryData };
  } catch (err) {
    console.error("AI or Validation Error:", err);
    return {
      error:
        "An unexpected error occurred during AI processing or data validation.",
    };
  }
}
