import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  return NextResponse.json(
    {
      name: "Centerform",
      short_name: "Centerform",
      description: "Your digital concierge",
      start_url: `/${slug}`,
      scope: "/",
      display: "standalone",
      background_color: "#ffffff",
      orientation: "portrait",
      icons: [
        {
          src: "/icons/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
