import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification:
    "Your magic link has expired or has already been used. Go back to your invite email and request a new link.",
  Default: "An error occurred during sign-in. Please try again.",
};

export default async function InviteErrorPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const message = ERROR_MESSAGES[error ?? "Default"] ?? ERROR_MESSAGES.Default;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign-in error</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <a href="/sign-in" className="text-sm text-primary underline">
            Back to sign in
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
