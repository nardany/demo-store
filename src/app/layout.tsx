import type { Metadata } from "next";
import { Noto_Sans_Armenian } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar, type NavCategory } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { MobileCallBar } from "@/components/MobileCallBar";
import { db } from "@/lib/db";
import { site } from "@/lib/site";

const sans = Noto_Sans_Armenian({
  subsets: ["armenian", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.nameLatin} — ${site.tagline}`, template: `%s | ${site.nameLatin}` },
  description: site.description,
  icons: { icon: site.icons.icon, apple: site.icons.apple },
  openGraph: { siteName: site.nameLatin, locale: "hy_AM", type: "website", images: [site.images.og] },
};

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "SportingGoodsStore",
  name: site.nameLatin,
  telephone: site.phoneRaw,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${site.address.street}, ${site.address.venue}, ${site.address.pavilion}`,
    addressLocality: site.address.city,
    addressCountry: "AM",
  },
  openingHours: `Mo-Su ${site.hours.open}-${site.hours.close}`,
  sameAs: [site.social.instagram, site.social.facebook].filter(Boolean),
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let promoText = "";
  let categories: NavCategory[] = [];

  try {
    const [promo, cats] = await Promise.all([
      db.promoBanner.findFirst({ where: { isActive: true }, orderBy: { updatedAt: "desc" } }),
      db.category.findMany({
        where: { parentId: null },
        include: { children: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    ]);
    promoText = promo?.text ?? "";
    categories = cats;
  } catch (err) {
    console.error("Failed to load layout data:", err);
  }

  return (
    <html lang="hy" className={sans.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PromoBanner text={promoText} />
          <Navbar categories={categories} />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileCallBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
