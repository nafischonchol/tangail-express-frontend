import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tangailexpress.com";
const defaultOgImage = `${siteUrl}/logo.jpeg`;

export async function generateMetadata(): Promise<Metadata> {
  const [storeRes, seoRes] = await Promise.all([
    getPublicStoreSetup().catch(() => ({ success: false, resources: null })),
    getPublicSeoSettings().catch(() => ({ success: false, resources: null })),
  ]);

  const storeSetup = storeRes.success ? storeRes.resources : null;
  const seo = seoRes.success ? seoRes.resources : null;
  const storeName = storeSetup?.store_name || "Tangail Express | টাঙ্গাইল এক্সপ্রেস";

  const otherVerification: Record<string, string> = {};
  if (seo?.bing_webmaster_id) {
    otherVerification["msvalidate.01"] = seo.bing_webmaster_id;
  }
  if (seo?.baidu_webmaster_id) {
    otherVerification["baidu-site-verification"] = seo.baidu_webmaster_id;
  }

  return {
    metadataBase: new URL(siteUrl),
    title: `${storeName} - জিরো ফ্রিকশন হোম বাজার ডেলিভারি সার্ভিস`,
    description:
      "অফিস থেকে ফেরার পথে বাজারের টেনশন? বাজারের লিস্ট দিন (লিখে, ছবি দিয়ে বা মুখে বলে), আমরা নিখুঁতভাবে বাজার পৌঁছে দিব আপনার ঘরে।",
    alternates: {
      canonical: siteUrl,
    },
    icons: {
      icon: "/icon.png",
      shortcut: "/icon.png",
      apple: "/icon.png",
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
      title: `${storeName} - টাঙ্গাইল শহরের ১ নম্বর হোম বাজার সার্ভিস`,
      description:
        "অফিস থেকে ফেরার পথে বাজারের টেনশন? বাজারের লিস্ট দিন, তাজা শাকসবজি, দেশি মাছ ও মাংস পৌঁছে দিব বাসায়।",
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
      title: `${storeName} - টাঙ্গাইল শহরের ১ নম্বর হোম বাজার সার্ভিস`,
      description:
        "অফিস থেকে ফেরার পথে বাজারের টেনশন? বাজারের লিস্ট দিন, আমরা পৌঁছে দিব বাসায়।",
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
  const storeName = storeSetup?.store_name || "Tangail Express (টাঙ্গাইল এক্সপ্রেস)";
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
          "টাঙ্গাইল শহরের ১ নম্বর হোম বাজার ও গ্রোসারি ডেলিভারি সার্ভিস।",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: storeName,
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
    ],
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-[#f5f7f6] text-gray-900 antialiased`}>
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
