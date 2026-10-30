import { NextResponse } from "next/server";
import { resolveSlug } from "@/lib/slug-resolver";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);
  const name = resolved?.data.name ?? "Centerform";

  return NextResponse.json(
    {
      name,
      short_name: name,
      description: "Your digital concierge",
      start_url: `/${slug}`,
      scope: "/",
      display: "standalone",
      background_color: "#ffffff",
      orientation: "portrait",
      icons: [
        {
          src: "/icons/logo.png",
          sizes: "1024x1024",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/logo.png",
          sizes: "1024x1024",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
