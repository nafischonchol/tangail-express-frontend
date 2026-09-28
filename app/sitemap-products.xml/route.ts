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

export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://mohimaa.com";
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

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

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

  return new Response(xmlContent, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
    },
  });
}
