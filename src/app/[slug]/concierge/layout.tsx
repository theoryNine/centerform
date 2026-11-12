import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return pageMetadata(slug, "Concierge");
}

export default function ConciergeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
