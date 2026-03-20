import { resolveSlug } from "@/lib/slug-resolver";
import { getVenueServices } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue") {
    notFound();
  }

  const services = await getVenueServices(resolved.data.id);

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "calc(env(safe-area-inset-top, 16px) + 12px) 20px 0" }}>
        <Link
          href={`/${slug}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            color: "#1A7A6D",
            textDecoration: "none",
            fontWeight: 500,
            marginBottom: 20,
          }}
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        <div style={{ marginBottom: 20 }}>
          <h1 style={{
            fontSize: 22,
            fontWeight: 400,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: "#2D2A26",
            margin: "0 0 8px 0",
          }}>
            Your Room & Stay
          </h1>
          <div style={{ width: "60%", height: 2, background: "#1A7A6D", borderRadius: 1 }} />
        </div>

        <p style={{ fontSize: 14, color: "#8B8680", marginBottom: 24 }}>
          Everything you need during your stay.
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: "0 20px 40px" }}>
        {services.length === 0 ? (
          <p style={{ padding: "48px 0", textAlign: "center", fontSize: 14, color: "#8B8680" }}>
            No services listed yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {services.map((service) => (
              <div
                key={service.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 5,
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#2D2A26", margin: 0 }}>
                    {service.name}
                  </p>
                  {service.description && (
                    <p style={{ fontSize: 13, color: "#8B8680", lineHeight: 1.5, marginTop: 4, marginBottom: 0 }}>
                      {service.description}
                    </p>
                  )}
                </div>
                <span style={{
                  padding: "4px 12px",
                  background: "#EDE8DE",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#8B8680",
                  flexShrink: 0,
                  textTransform: "capitalize",
                }}>
                  {service.category.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
