import { describe, it, expect } from "vitest";
import {
  DEFAULT_BUILDING_IMAGES,
  buildingImages,
  getRandomBuildingImage,
  getNextRandomIndex,
  type BuildingImage,
} from "./building-images";

describe("Building Images Data & Helpers", () => {
  it("exports default building images with valid src and alt", () => {
    expect(DEFAULT_BUILDING_IMAGES.length).toBeGreaterThan(0);
    expect(buildingImages).toBe(DEFAULT_BUILDING_IMAGES);

    for (const image of DEFAULT_BUILDING_IMAGES) {
      expect(image.src).toBeDefined();
      expect(image.src.length).toBeGreaterThan(0);
      expect(image.alt).toBeDefined();
      expect(image.alt.length).toBeGreaterThan(0);
    }
  });

  it("getRandomBuildingImage returns an image from the custom list or fallback", () => {
    const customImages: BuildingImage[] = [
      { src: "/test-1.jpg", alt: "Test 1" },
      { src: "/test-2.jpg", alt: "Test 2" },
    ];

    const random = getRandomBuildingImage(customImages);
    expect(customImages).toContainEqual(random);

    const defaultRandom = getRandomBuildingImage();
    expect(DEFAULT_BUILDING_IMAGES).toContainEqual(defaultRandom);
  });

  it("getNextRandomIndex cycles index without repeating current index when length > 1", () => {
    const customImages: BuildingImage[] = [
      { src: "/test-1.jpg", alt: "Test 1" },
      { src: "/test-2.jpg", alt: "Test 2" },
      { src: "/test-3.jpg", alt: "Test 3" },
    ];

    for (let i = 0; i < 20; i++) {
      const nextIndex = getNextRandomIndex(1, customImages);
      expect(nextIndex).not.toBe(1);
      expect(nextIndex).toBeGreaterThanOrEqual(0);
      expect(nextIndex).toBeLessThan(customImages.length);
    }
  });

  it("getNextRandomIndex returns 0 when length <= 1", () => {
    const singleImage: BuildingImage[] = [{ src: "/only.jpg", alt: "Only" }];
    expect(getNextRandomIndex(0, singleImage)).toBe(0);
  });
});
