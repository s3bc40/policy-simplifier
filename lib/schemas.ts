// lib/schemas.ts

import { z } from "zod";

// The definitive contract for the AI's output.
export const policySummarySchema = z.object({
  // 1. A clear title.
  memoTitle: z
    .string()
    .describe(
      "A concise, non-technical title for the internal memo, e.g., '2026 Data Protection Update'"
    ),
  // 2. The primary audience.
  targetAudience: z
    .enum(["Employees", "Leadership", "Technical Team"])
    .describe("The primary internal group this memo targets."),
  // 3. Top 3 risks (Crucial for risk mitigation communication).
  top3Risks: z
    .array(z.string().min(10))
    .max(3)
    .describe(
      "A bulleted list of the top 3 critical risks to the business if this policy is ignored. Use clear, non-technical language."
    ),
  // 4. Actionable requirements.
  keyRequirements: z
    .array(
      z.object({
        category: z
          .string()
          .describe(
            "The policy area, e.g., 'Password Management', 'Data Handling'"
          ),
        simplifiedAction: z
          .string()
          .describe(
            "The single, clear action the employee/team must take (e.g., 'Enable two-factor authentication')."
          ),
      })
    )
    .min(5)
    .max(10)
    .describe(
      "5 to 10 actionable, simplified requirements for the target audience."
    ),
  // 5. A single call-to-action.
  nextStep: z
    .string()
    .describe(
      "A single, clear call-to-action for the reader to complete within 7 days."
    ),
});

// TypeScript utility type for the final structured data
export type PolicySummary = z.infer<typeof policySummarySchema>;

// Input validation schema (The user-provided text)
export const inputSchema = z.object({
  policyText: z
    .string()
    .min(
      100,
      "Policy text must be at least 100 characters long to provide meaningful analysis."
    )
    .max(10000, "Policy text cannot exceed 10,000 characters."),
});
