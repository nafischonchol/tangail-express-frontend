export const revalidate = 3600;

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(request: Request, context: any) {
  const params = await context?.params;
  let id = params?.id;
  if (!id) {
    const url = new URL(request.url);
    const match = url.pathname.match(/sitemap-(.+)\.xml/);
    if (match) {
      id = match[1];
    }
  }
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://mohimaa.com";
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  let xmlContent = "";

  if (id === "static") {
    const staticRoutes = [
      "",
      "/catalog",
      "/brands",
      "/new-arrivals",
      "/best-sellings",
      "/contact",
      "/privacy",
      "/terms",
      "/returns",
      "/shipping",
      "/faq",
      "/how-to-use",
      "/why-us",
    ];

    const urls = staticRoutes
      .map(
        (route) => `  <url>
    <loc>${escapeXml(`${siteUrl}${route}`)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${route === "" ? "daily" : "weekly"}</changefreq>
    <priority>${route === "" ? "1.0" : "0.6"}</priority>
  </url>`,
      )
      .join("\n");

    xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  } else if (id === "category") {
    let categories: Array<{ id: number; slug: string; updated_at: string }> =
      [];
    try {
      const res = await fetch(
        `${apiBaseUrl}/customer/sitemap-data/categories`,
        {
          headers: { Accept: "application/json" },
          next: { revalidate: 3600 },
        },
      );
      if (res.ok) {
        const data = await res.json();
        categories = data?.resources?.categories || [];
      }
    } catch (e) {
      console.error(e);
    }

    const urls = categories
      .map(
        (item) => `  <url>
    <loc>${escapeXml(`${siteUrl}/${item.slug}`)}</loc>
    <lastmod>${new Date(item.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
      )
      .join("\n");

    xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  } else if (id === "brand") {
    let brands: Array<{ id: number; slug: string; updated_at: string }> = [];
    try {
      const res = await fetch(`${apiBaseUrl}/customer/sitemap-data/brands`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const data = await res.json();
        brands = data?.resources?.brands || [];
      }
    } catch (e) {
      console.error(e);
    }

    const urls = brands
      .map(
        (item) => `  <url>
    <loc>${escapeXml(`${siteUrl}/${item.slug}`)}</loc>
    <lastmod>${new Date(item.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
      )
      .join("\n");

    xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  } else if (id === "products") {
    let products: Array<{
      name?: string;
      slug_url: string;
      image?: string;
      updated_at: string;
    }> = [];
    try {
      const res = await fetch(`${apiBaseUrl}/customer/sitemap-data/products`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const data = await res.json();
        products = data?.resources?.products || [];
      }
    } catch (e) {
      console.error(e);
    }

    const urls = products
      .map((item) => {
        const productUrl = `${siteUrl}/product/${item.slug_url}`;
        let imageXml = "";
        if (item.image) {
          imageXml = `
    <image:image>
      <image:loc>${escapeXml(item.image)}</image:loc>
      ${item.name ? `<image:title>${escapeXml(item.name)}</image:title>` : ""}
    </image:image>`;
        }

        return `  <url>
    <loc>${escapeXml(productUrl)}</loc>
    <lastmod>${new Date(item.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageXml}
  </url>`;
      })
      .join("\n");

    xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
  } else {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(xmlContent, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
    },
  });
}
