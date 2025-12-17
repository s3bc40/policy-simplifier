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
import { AlertCircle, Loader2 } from "lucide-react";

type ActionState = {
  result?: PolicySummary;
  error?: string;
};

const initialState: ActionState = {};

export function SummarizeForm() {
  const [state, action, isPending] = useActionState(
    summarizePolicy,
    initialState
  );
  const hasResult = state.result && !state.error;

  return (
    <div className="space-y-6">
      {/* --- The Form --- */}
      <form action={action} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Policy Document</CardTitle>
            <CardDescription>
              Paste your security policy below (minimum 100 characters)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              name="policyText"
              rows={12}
              placeholder="Paste your security policy text here..."
              required
              disabled={isPending}
              className="resize-none"
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Policy...
                </>
              ) : (
                "Analyze Policy and Check Limit"
              )}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* --- Display Errors --- */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* --- Display Results --- */}
      {hasResult && state.result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{state.result.memoTitle}</CardTitle>
            <CardDescription>
              Target Audience:{" "}
              <span className="font-semibold text-foreground">
                {state.result.targetAudience}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Top 3 Risks */}
            <div>
              <h4 className="text-lg font-bold mb-3 text-destructive">
                Top 3 Risks (If Ignored)
              </h4>
              <div className="p-4 border rounded-lg bg-destructive/5">
                <ul className="list-disc list-outside ml-5 space-y-2">
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
              <h4 className="text-lg font-bold mb-3 text-green-600 dark:text-green-400">
                Key Actionable Requirements
              </h4>
              <div className="space-y-3">
                {state.result.keyRequirements.map((req, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-muted/50"
                  >
                    <p className="font-semibold text-sm mb-1">{req.category}</p>
                    <p className="text-sm text-muted-foreground">
                      {req.simplifiedAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Step */}
            <div>
              <h4 className="text-lg font-bold mb-3 text-primary">Next Step</h4>
              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                &quot;{state.result.nextStep}&quot;
              </blockquote>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
