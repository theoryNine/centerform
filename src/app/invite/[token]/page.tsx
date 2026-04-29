import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getInviteByToken } from "@/lib/invites";
import { InviteEmailForm } from "./invite-email-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const invite = await getInviteByToken(token);

  // If already signed in, skip the email form and go straight to claim.
  const session = await auth();
  if (session?.user?.id && invite && !invite.claimed_by) {
    redirect(`/invite/claim?token=${encodeURIComponent(token)}`);
  }

  if (!invite) {
    return <InviteErrorCard title="Invalid invite" message="This invite link doesn't exist." />;
  }

  const now = new Date().toISOString();
  if (invite.expires_at < now) {
    return (
      <InviteErrorCard
        title="Invite expired"
        message="This invite link has expired. Please contact your Centerform account manager for a new one."
      />
    );
  }

  if (invite.claimed_by !== null) {
    return (
      <InviteErrorCard
        title="Already claimed"
        message="This invite has already been used. If you're the owner, sign in to access your dashboard."
        linkHref="/sign-in"
        linkLabel="Sign in"
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Centerform</CardTitle>
          <CardDescription>
            You&apos;ve been invited to manage <strong>{invite.venue_name}</strong>. Enter your work
            email to get started — we&apos;ll send you a magic link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteEmailForm token={token} emailHint={invite.email_hint} />
        </CardContent>
      </Card>
    </div>
  );
}

function InviteErrorCard({
  title,
  message,
  linkHref,
  linkLabel,
}: {
  title: string;
  message: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {linkHref && linkLabel && (
          <CardContent className="text-center">
            <a href={linkHref} className="text-sm text-primary underline">
              {linkLabel}
            </a>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
