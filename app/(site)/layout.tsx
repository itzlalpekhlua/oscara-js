import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "../globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { DriftingDiamonds } from "@/components/DriftingDiamonds";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
});

const brand = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
  variable: "--font-brand",
});

const siteName = "Ojaskaraa Builders";
const siteDescription =
  "Ojaskaraa Builders — premium residential and commercial construction, architecture, and design in Bharatpur & Kathmandu, Nepal.";

export const metadata: Metadata = {
  // metadataBase resolves every relative URL below (and any per-page Open
  // Graph image) against the live domain, so shared links and canonicals
  // never fall back to localhost.
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s — ${siteName}` },
  description: siteDescription,
  applicationName: siteName,
  icons: { icon: "/logo-mark.png", apple: "/logo-mark.png" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName,
    title: siteName,
    description: siteDescription,
    url: "/",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  return (
    <html lang="en" className={`${sans.variable} ${brand.variable}`} data-scroll-behavior="smooth">
      <body className="font-sans bg-ink-950 text-bone antialiased">
        <div className="grain-overlay" />
        <DriftingDiamonds />
        <LoadingScreen />
        <Navigation phone={settings?.phone} />
        <main>{children}</main>
        <Footer
          phone={settings?.phone}
          phoneSecondary={settings?.phoneSecondary}
          email={settings?.email}
          locationPrimaryName={settings?.locationPrimaryName}
          locationPrimaryLabel={settings?.locationPrimaryLabel}
          locationSecondaryName={settings?.locationSecondaryName}
          locationSecondaryLabel={settings?.locationSecondaryLabel}
          instagramUrl={settings?.instagramUrl}
          facebookUrl={settings?.facebookUrl}
          tiktokUrl={settings?.tiktokUrl}
          whatsappUrl={settings?.whatsappUrl}
        />
        <FloatingWhatsApp phone={settings?.phone} />
      </body>
    </html>
  );
}
