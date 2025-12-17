// app/summarize/page.tsx
"use client";

import { useActionState } from "react";
import { summarizePolicy } from "@/app/actions/summarize";
import { PolicySummary } from "@/lib/schemas";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

type ActionState = {
  result?: PolicySummary;
  error?: string;
};

const initialState: ActionState = {};

export default function SummarizePage() {
  const [state, action, isPending] = useActionState(
    summarizePolicy,
    initialState
  );
  const hasResult = state.result && !state.error;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Security Policy Simplifier</h1>
      <p className="text-gray-600 mb-8">
        Paste a dense policy document below, and our AI will translate it into a
        simple, actionable internal memo. (Free users are limited to 5
        summaries/month.)
      </p>

      {/* --- The Form --- */}
      <form action={action} className="space-y-4 mb-8">
        <Textarea
          name="policyText"
          rows={12}
          placeholder="Paste your security policy text here (minimum 100 characters)..."
          required
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Analyzing Policy..." : "Analyze Policy and Check Limit"}
        </Button>
      </form>

      {/* --- Display Errors and Freemium Messages using ALERT --- */}
      {state.error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* --- Display Results using CARD --- */}
      {hasResult && state.result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold text-blue-800">
              {state.result.memoTitle}
            </CardTitle>
            <CardDescription>
              Target Audience:{" "}
              <span className="font-semibold text-gray-700">
                {state.result.targetAudience}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Top 3 Risks */}
            <div>
              <h4 className="text-lg font-bold mb-2 text-red-700">
                Top 3 Risks (If Ignored)
              </h4>
              <div className="p-3 border rounded-md bg-red-50">
                <ul className="list-disc list-outside ml-5 space-y-2 text-gray-700">
                  {state.result.top3Risks.map((risk, index) => (
                    <li key={index} className="text-sm">
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Key Requirements */}
            <div>
              <h4 className="text-lg font-bold mb-3 text-green-700">
                Key Actionable Requirements
              </h4>
              <div className="space-y-3">
                {state.result.keyRequirements.map((req, index) => (
                  <div key={index} className="p-3 border rounded-md bg-gray-50">
                    <p className="font-semibold text-sm text-gray-800">
                      {req.category}:
                    </p>
                    <p className="text-sm text-gray-600">
                      {req.simplifiedAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div>
              <h4 className="text-lg font-bold mt-6 mb-2 text-blue-700">
                Next Step
              </h4>
              <blockquote className="mt-4 border-l-2 border-blue-500 pl-4 italic text-gray-700">
                &ldquo;{state.result.nextStep}&rdquo;
              </blockquote>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
