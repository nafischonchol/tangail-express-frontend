export default function customImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (!src) return "";

  // Handle media.mohimaa.shop remote images
  if (src.startsWith("https://media.mohimaa.shop")) {
    const path = src.replace("https://media.mohimaa.shop", "");
    return `/api/media-img/w_${width}${path}`;
  }

  // Handle dev.mohimaa.shop remote images
  if (src.startsWith("https://dev.mohimaa.shop")) {
    const path = src.replace("https://dev.mohimaa.shop", "");
    return `/api/dev-img/w_${width}${path}`;
  }

  // Handle local relative paths
  if (src.startsWith("/")) {
    return `${src}?w=${width}&q=${quality || 75}`;
  }

  return src;
}
