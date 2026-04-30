import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { claimInvite } from "@/lib/invites";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function InviteClaimPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/sign-in");
  }

  const session = await auth();
  if (!session?.user?.id) {
    // Not authenticated — send back through sign-in, then return here.
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/invite/claim?token=${token}`)}`);
  }

  const result = await claimInvite(session.user.id, token);

  if (!result.success) {
    const messages: Record<typeof result.reason, string> = {
      not_found: "This invite link doesn't exist.",
      expired: "This invite link has expired. Please contact your Centerform account manager.",
      already_claimed:
        "This invite has already been used. If you're the owner, you should already have access.",
    };

    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Couldn&apos;t activate invite</CardTitle>
            <CardDescription>{messages[result.reason]}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  redirect("/dashboard");
}
