import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { getPublicStoreSetup } from "@/lib/api/storeSetup";
import { getPublicSeoSettings } from "@/lib/api/seo";
import { StoreSetupProvider } from "@/context/StoreSetupContext";
import TrackingScripts from "@/components/TrackingScripts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mohimaa.com";
const defaultOgImage = `${siteUrl}/images/hero_banner_1.png`;

export async function generateMetadata(): Promise<Metadata> {
  const [storeRes, seoRes] = await Promise.all([
    getPublicStoreSetup().catch(() => ({ success: false, resources: null })),
    getPublicSeoSettings().catch(() => ({ success: false, resources: null })),
  ]);

  const storeSetup = storeRes.success ? storeRes.resources : null;
  const seo = seoRes.success ? seoRes.resources : null;
  const storeName = storeSetup?.store_name || "Mohima Premium Beauty";

  const otherVerification: Record<string, string> = {};
  if (seo?.bing_webmaster_id) {
    otherVerification["msvalidate.01"] = seo.bing_webmaster_id;
  }
  if (seo?.baidu_webmaster_id) {
    otherVerification["baidu-site-verification"] = seo.baidu_webmaster_id;
  }

  return {
    metadataBase: new URL(siteUrl),
    title: `${storeName} | Curated K-Beauty & Luxury Skincare`,
    description: "Experience the glow with Mohima's premium collection of authentic Korean beauty and luxury skincare. Curated routines for glass skin, hydration, and radiant health.",
    alternates: {
      canonical: siteUrl,
    },
    robots: {
      index: !seo?.robots_meta_content?.noindex,
      follow: !seo?.robots_meta_content?.nofollow,
      ...(seo?.robots_meta_content?.noarchive ? { noarchive: true } : {}),
      ...(seo?.robots_meta_content?.nosnippet ? { nosnippet: true } : {}),
      ...(seo?.robots_meta_content?.noimageindex ? { noimageindex: true } : {}),
    },
    verification: {
      google: seo?.google_search_console_id || undefined,
      yandex: seo?.yandex_webmaster_id || undefined,
      other: Object.keys(otherVerification).length > 0 ? otherVerification : undefined,
    },
    openGraph: {
      title: `${storeName} | Curated K-Beauty & Luxury Skincare`,
      description: "Experience the glow with Mohima's premium collection of authentic Korean beauty and luxury skincare.",
      url: siteUrl,
      siteName: storeName,
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: storeName,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${storeName} | Curated K-Beauty & Luxury Skincare`,
      description: "Experience the glow with Mohima's premium collection of authentic Korean beauty and luxury skincare.",
      images: [defaultOgImage],
    },
  };
}

export default async function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [storeRes, seoRes] = await Promise.all([
    getPublicStoreSetup().catch(() => ({ success: false, resources: null })),
    getPublicSeoSettings().catch(() => ({ success: false, resources: null })),
  ]);

  const storeSetup = storeRes.success ? storeRes.resources : null;
  const seo = seoRes.success ? seoRes.resources : null;
  const storeName = storeSetup?.store_name || "Mohima Premium Beauty";
  const storeLogo = storeSetup?.logo || defaultOgImage;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: storeName,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: storeLogo,
        },
        description:
          "Premium collection of authentic Korean beauty and luxury skincare.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: storeName,
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/catalog?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212] antialiased`}>
      <TrackingScripts seo={seo} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StoreSetupProvider initialData={storeSetup}>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </StoreSetupProvider>
    </div>
  );
}
