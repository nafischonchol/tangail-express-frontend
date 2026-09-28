import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;

    if (!path || path.length < 2) {
      return new NextResponse("Invalid image path format", { status: 400 });
    }

    const imagePath = path.slice(1).join("/");
    const targetUrl = `https://dev.mohimaa.shop/${imagePath}`;

    const response = await fetch(targetUrl, {
      headers: {
        Accept: request.headers.get("accept") || "image/*",
      },
    });

    if (!response.ok) {
      return new NextResponse("Image not found", { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("Image proxy error:", err);
    return new NextResponse(`Failed to fetch image: ${err?.message || err}`, { status: 500 });
  }
}
