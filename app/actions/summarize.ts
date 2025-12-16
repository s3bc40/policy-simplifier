"use server";

import { createClient as createSessionClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { GoogleGenAI } from "@google/genai";
import { inputSchema, policySummarySchema, PolicySummary } from "@/lib/schemas";
import { z } from "zod";

// Initialize the Gemini API client (The environment key is safe in a Server Action)
const ai = new GoogleGenAI({});

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
      error: `Free tier limit of ${FREE_LIMIT} uses reached. Please upgrade to PRO.`,
    };
  }

  // ----------------------------------------------------
  // Step 3: Call Gemini with Structured Output
  // ----------------------------------------------------
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert Security Consultant specializing in internal policy communication and risk management. Your task is to analyze the dense security policy text provided below and strictly simplify it into a clear, actionable internal memo for a non-technical audience. Policy Text: "${policyText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: policySummarySchema.toJSONSchema(),
        // Set temperature lower for factual, deterministic output
        temperature: 0.2,
      },
    });

    if (!response.text || response.text.trim().length === 0) {
      console.error(
        "Gemini Response Error: Text content was empty or missing."
      );
      return {
        error:
          "AI processing failed to return a policy summary. Please try again with different text.",
      };
    }
    const jsonString = response.text.trim();

    // Final validation: Parse the AI's response to ensure it matches the schema
    const summaryData = policySummarySchema.parse(JSON.parse(jsonString));

    // ----------------------------------------------------
    // Step 4: Decrement Usage (Use Admin Client)
    // ----------------------------------------------------
    if (role === "FREE") {
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ monthly_uses: monthly_uses + 1 })
        .eq("id", user.id);

      if (updateError) {
        console.error("Usage Tracking Error:", updateError);
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
