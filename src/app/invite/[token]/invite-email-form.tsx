"use client";

import { useActionState } from "react";
import { requestMagicLink } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  token: string;
  emailHint: string | null;
}

export function InviteEmailForm({ token, emailHint }: Props) {
  const boundAction = requestMagicLink.bind(null, token);
  const [state, formAction, isPending] = useActionState(boundAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@yourhotel.com"
          defaultValue={emailHint ?? ""}
          required
          autoFocus
        />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Sending…" : "Send magic link"}
      </Button>
    </form>
  );
}
