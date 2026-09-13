import { siteConfig } from "@/lib/site-config";

export function resolveAbsoluteUrl(path: string): string {
  if (!path) return path;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = siteConfig.url.replace(/\/$/, "");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildOpenGraphImage(
  imageUrl: string,
  alt: string,
  width = 1200,
  height = 630
) {
  return {
    url: resolveAbsoluteUrl(imageUrl),
    width,
    height,
    alt,
    type: "image/jpeg",
  };
}
