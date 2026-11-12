import type { Metadata, Viewport } from "next";
import { Nunito_Sans, Source_Sans_3 } from "next/font/google";
import { AuthSessionProvider } from "@/components/session-provider";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Centerform",
  description: "Your digital concierge",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Centerform",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon.ico", sizes: "48x48" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F0E8" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1A17" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} ${nunitoSans.variable} antialiased`} suppressHydrationWarning>
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <script
          dangerouslySetInnerHTML={{
            // The worker caches /_next/static/ cache-first, which serves stale chunks against a dev
            // server (Turbopack reuses chunk names) and breaks HMR. Only register it in production,
            // and clean up one left over from an earlier dev session.
            __html:
              process.env.NODE_ENV === "production"
                ? `if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");`
                : `if ("serviceWorker" in navigator) { navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); }); if (window.caches) caches.delete("centerform-static-v1"); }`,
          }}
        />
      </body>
    </html>
  );
}
