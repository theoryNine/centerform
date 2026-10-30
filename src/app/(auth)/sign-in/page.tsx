"use client";

import { useActionState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signInWithMagicLink, signInWithCredentials } from "./actions";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithMagicLink, null);

  // Dev-only credentials form — hidden in production via env check on the server.
  const isDev = process.env.NODE_ENV === "development";
  const [devState, devFormAction, isDevPending] = useActionState(signInWithCredentials, null);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a magic link to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? "Sending…" : "Send magic link"}
            </Button>
          </form>

          {isDev && (
            <details className="rounded border p-3 text-sm text-muted-foreground">
              <summary className="cursor-pointer select-none font-medium">
                Dev credentials (local only)
              </summary>
              <form action={devFormAction} className="mt-3 space-y-3">
                <Input name="email" type="email" placeholder="any@email.com" required />
                <Input name="password" type="password" placeholder="any password" required />
                {devState?.error && (
                  <p className="text-sm text-destructive">{devState.error}</p>
                )}
                <Button variant="outline" size="sm" type="submit" disabled={isDevPending}>
                  {isDevPending ? "Signing in…" : "Sign in (dev)"}
                </Button>
              </form>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
