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

  let categories: Array<{ id: number; slug: string; updated_at: string }> = [];
  try {
    const res = await fetch(`${apiBaseUrl}/customer/sitemap-data/categories`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
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

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xmlContent, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
    },
  });
}
