"use client";

import { useActionState, useState } from "react";
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
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";

type ActionState = {
  result?: PolicySummary;
  error?: string;
};

const initialState: ActionState = {};

// Skeleton Loader Component
function SkeletonLoader() {
  return (
    <Card>
      <CardHeader>
        <div className="h-8 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top 3 Risks Skeleton */}
        <div>
          <div className="h-6 bg-muted rounded animate-pulse mb-3 w-1/3" />
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Key Requirements Skeleton */}
        <div>
          <div className="h-6 bg-muted rounded animate-pulse mb-3 w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg bg-muted/50">
                <div className="h-4 bg-muted rounded animate-pulse mb-2 w-1/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* Next Step Skeleton */}
        <div>
          <div className="h-6 bg-muted rounded animate-pulse mb-3 w-1/3" />
          <div className="h-4 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SummarizeForm() {
  const [state, action, isPending] = useActionState(
    summarizePolicy,
    initialState
  );
  const [shouldShowForm, setShouldShowForm] = useState(true);
  const hasResult = state.result && !state.error;

  const handleReset = () => {
    setShouldShowForm(true);
    // Reset the form by reloading the page or clearing state
    // Since useActionState doesn't provide a reset, we'll reload
    window.location.href = "/summarize";
  };

  return (
    <div className="space-y-6">
      {/* --- The Form --- */}
      {shouldShowForm && (
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
      )}

      {/* --- Display Loading Skeleton --- */}
      {isPending && <SkeletonLoader />}

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
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {state.result.memoTitle}
              </CardTitle>
              <CardDescription>
                Target Audience:{" "}
                <span className="font-semibold text-foreground">
                  {state.result.targetAudience}
                </span>
              </CardDescription>
            </div>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
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
