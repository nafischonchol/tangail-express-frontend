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
