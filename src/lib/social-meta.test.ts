import { describe, expect, it } from "vitest";
import { resolveAbsoluteUrl, buildOpenGraphImage } from "./social-meta";

describe("social metadata helpers", () => {
  it("turns relative asset paths into fully qualified URLs", () => {
    expect(resolveAbsoluteUrl("/images/Social-Main-Link.jpg")).toBe(
      "https://www.trimurtirealestate.com/images/Social-Main-Link.jpg"
    );
  });

  it("keeps property image URLs absolute and exposes share-ready OG image metadata", () => {
    const image = buildOpenGraphImage(
      "https://images.example.com/house.jpg",
      "Luxury apartment at Kandivali West"
    );

    expect(image.url).toBe("https://images.example.com/house.jpg");
    expect(image.alt).toBe("Luxury apartment at Kandivali West");
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
  });
});
