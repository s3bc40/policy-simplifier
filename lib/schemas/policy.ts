import { z } from "zod";

// The definitive structure of the AI's output
export const SimplifiedPolicySchema = z.object({
  memoTitle: z
    .string()
    .describe(
      "A concise, non-technical title for the internal memo, e.g., '2026 Data Protection Update'"
    ),
  targetAudience: z
    .enum(["Employees", "Leadership", "Technical Team"])
    .describe("The primary internal group this memo targets."),
  top3Risks: z
    .array(z.string().min(10))
    .max(3)
    .describe(
      "A bulleted list of the top 3 critical risks to the business if this policy is ignored. Use clear, non-technical language."
    ),
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
            "The single, clear action the employee/team must take (e.g., 'Enable two-factor authentication on all company accounts')."
          ),
      })
    )
    .min(5)
    .max(10)
    .describe(
      "5 to 10 actionable, simplified requirements for the target audience."
    ),
  nextStep: z
    .string()
    .describe(
      "A single call-to-action for the reader to complete within 7 days."
    ),
});

// TypeScript utility type for the final structured data
export type SimplifiedPolicy = z.infer<typeof SimplifiedPolicySchema>;

// The System Instruction (Prompt) for the AI
export const POLICY_SIMPLIFIER_SYSTEM_INSTRUCTION = `
  You are a highly experienced and certified Security Consultant specializing in internal policy communication and risk management.
  Your task is to take a dense, verbose security policy, compliance standard, or technical document, and simplify it into a clear, actionable internal memo for a non-technical audience.

  STRICT INSTRUCTIONS:
  1.  DO NOT use security jargon (e.g., "ACL," "IDS," "Zero Trust") without immediate, simple explanation.
  2.  Your output MUST strictly adhere to the provided JSON Schema.
  3.  The goal is to reduce business risk by communicating requirements as concrete, simple actions.
`;
