import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Check your inbox</CardTitle>
          <CardDescription>
            We sent you a magic link. Click it to sign in and activate your Centerform account.
            <br />
            <br />
            The link expires in 24 hours. You can close this tab.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
