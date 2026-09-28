import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogFilterClient from "@/components/CatalogFilterClient";
import { getFilterableData, filterProducts } from "@/lib/api/products";

interface SingleSlugPageProps {
  params: Promise<{
    slug1: string;
  }>;
}

export async function generateMetadata({ params }: SingleSlugPageProps): Promise<Metadata> {
  const { slug1 } = await params;
  if (!slug1) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mohimaa.com";
  const canonicalUrl = `${siteUrl}/${slug1}`;
  const defaultOgImage = `${siteUrl}/images/hero_banner_1.png`;

  const filterableRes = await getFilterableData();
  const categories = filterableRes?.resources?.categories || [];
  const brands = filterableRes?.resources?.brands || [];

  const isCategorySlug = (catList: typeof categories, targetSlug: string): boolean => {
    for (const cat of catList) {
      if (cat.slug === targetSlug) return true;
      if (cat.children && cat.children.length > 0) {
        if (isCategorySlug(cat.children as any, targetSlug)) return true;
      }
    }
    return false;
  };

  const isCat = isCategorySlug(categories, slug1);
  const isBrand = brands.some((b) => b.slug === slug1);

  let seo: any = null;
  if (isCat) {
    const res = await filterProducts({ category_slug: slug1, per_page: 1 });
    seo = (res as any)?.resources?.seo || (res as any)?.seo;
  } else if (isBrand) {
    const resBrand = await filterProducts({ brand_slug: slug1, per_page: 1 });
    seo = (resBrand as any)?.resources?.seo || (resBrand as any)?.seo;
  }

  const title = seo?.meta_title || seo?.name || slug1;
  const description = seo?.meta_description || `Discover authentic ${title} products at Mohima Premium Beauty.`;
  const keywords = seo?.meta_keyword
    ? Array.isArray(seo.meta_keyword)
      ? seo.meta_keyword.join(", ")
      : seo.meta_keyword
    : undefined;

  const rawImg = seo?.meta_image;
  const ogImageUrl = rawImg
    ? (rawImg.startsWith("http") ? rawImg : `${siteUrl}${rawImg}`)
    : defaultOgImage;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Mohima Premium Beauty",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SingleSlugPage({ params }: SingleSlugPageProps) {
  const { slug1 } = await params;

  if (!slug1) {
    notFound();
  }

  // Fetch filterable data to resolve whether slug1 is a category or brand
  const res = await getFilterableData();
  const categories = res?.resources?.categories || [];
  const brands = res?.resources?.brands || [];

  // Helper to check recursively if slug matches any category or sub-category
  const isCategorySlug = (catList: typeof categories, targetSlug: string): boolean => {
    for (const cat of catList) {
      if (cat.slug === targetSlug) return true;
      if (cat.children && cat.children.length > 0) {
        if (isCategorySlug(cat.children as any, targetSlug)) return true;
      }
    }
    return false;
  };

  const isCat = isCategorySlug(categories, slug1);
  const isBrand = brands.some((b) => b.slug === slug1);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mohimaa.com";
  const canonicalUrl = `${siteUrl}/${slug1}`;
  const matchedCat = categories.find((c) => c.slug === slug1);
  const matchedBrand = brands.find((b) => b.slug === slug1);
  const displayName = matchedCat?.name || matchedBrand?.name || slug1;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `${displayName} | Mohima Premium Beauty`,
        description: `Discover authentic ${displayName} products at Mohima Premium Beauty.`,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: displayName,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  if (isCat) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CatalogFilterClient initialCategorySlug={slug1} />
      </>
    );
  }

  if (isBrand) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CatalogFilterClient initialBrandSlug={slug1} />
      </>
    );
  }

  // If slug1 is neither a category nor a brand, trigger Next.js 404
  notFound();
}
