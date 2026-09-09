// src/lib/data/building-images.ts
// Building images data and helper utilities
// Used for hero section carousel and CTA banner backgrounds

export interface BuildingImage {
  id?: string;
  src: string;
  alt: string;
  display_order?: number;
  is_active?: boolean;
}

/**
 * Default fallback array of building images for hero carousel and CTA banner
 * Images are from local properties covered by Trimurti Real Estate
 */
export const DEFAULT_BUILDING_IMAGES: BuildingImage[] = [
  {
    src: "/Building Images/ChatGPT Image Sunset View Balcany.png",
    alt: "Sunset balcony view of residential towers in Kandivali West",
    display_order: 0,
    is_active: true,
  },
  {
    src: "/Building Images/IMG_8146.JPG",
    alt: "Apartment building in Kandivali West",
    display_order: 1,
    is_active: true,
  },
  {
    src: "/Building Images/Avarai Abrol.JPG",
    alt: "Avarai Abrol Building in Kandivali West",
    display_order: 2,
    is_active: true,
  },
  {
    src: "/Building Images/Bhoomi Park O wing.JPG",
    alt: "Bhoomi Park O Wing residential complex",
    display_order: 1,
    is_active: true,
  },
  {
    src: "/Building Images/Bhoomi Park Swimming pool.JPG",
    alt: "Bhoomi Park Swimming Pool amenities",
    display_order: 2,
    is_active: true,
  },
  {
    src: "/Building Images/Club house bhoomi park.JPG",
    alt: "Bhoomi Park Club House facilities",
    display_order: 3,
    is_active: true,
  },
  {
    src: "/Building Images/IMG_2161.JPG",
    alt: "Residential building in Kandivali West",
    display_order: 4,
    is_active: true,
  },
  {
    src: "/Building Images/IMG_7690.JPG",
    alt: "Modern apartment complex in Kandivali",
    display_order: 5,
    is_active: true,
  },
  {
    src: "/Building Images/IMG_8143.JPG",
    alt: "Residential building exterior in Kandivali West",
    display_order: 6,
    is_active: true,
  },
  {
    src: "/Building Images/IMG_8146.JPG",
    alt: "Apartment building in Kandivali West",
    display_order: 7,
    is_active: true,
  },
  {
    src: "/Building Images/IMG_8174.JPG",
    alt: "Residential towers in Kandivali West",
    display_order: 8,
    is_active: true,
  },
  {
    src: "/Building Images/Marina Garden.JPG",
    alt: "Marina Garden residential complex",
    display_order: 9,
    is_active: true,
  },
  {
    src: "/Building Images/Mhada 30.JPG",
    alt: "Residential building in Kandivali",
    display_order: 10,
    is_active: true,
  },
  {
    src: "/Building Images/Mhada 55, 56.JPG",
    alt: "Residential buildings in Kandivali West",
    display_order: 11,
    is_active: true,
  },
  {
    src: "/Building Images/Mhada 55.JPG",
    alt: "Building exterior view in Kandivali West",
    display_order: 12,
    is_active: true,
  },
  {
    src: "/Building Images/Pancharatna.JPG",
    alt: "Pancharatna residential building",
    display_order: 13,
    is_active: true,
  },
  {
    src: "/Building Images/Royal Oarsis Podium View.JPG",
    alt: "Royal Oasis Podium View",
    display_order: 14,
    is_active: true,
  },
  {
    src: "/Building Images/Royal Oarsis View.JPG",
    alt: "Royal Oasis building view",
    display_order: 15,
    is_active: true,
  },
  {
    src: "/Building Images/Royal Oasis Main Gate.JPG",
    alt: "Royal Oasis Main Gate entrance",
    display_order: 16,
    is_active: true,
  },
  {
    src: "/Building Images/Royal Oasis Podium.JPG",
    alt: "Royal Oasis Podium area",
    display_order: 17,
    is_active: true,
  },
  {
    src: "/Building Images/Royal Oasis Swimming Pool.JPG",
    alt: "Royal Oasis Swimming Pool amenities",
    display_order: 18,
    is_active: true,
  },
  {
    src: "/Building Images/SBI Bhoomi park.JPG",
    alt: "SBI Bhoomi Park complex",
    display_order: 19,
    is_active: true,
  },
];

/**
 * Backward compatibility alias for default building images
 */
export const buildingImages: BuildingImage[] = DEFAULT_BUILDING_IMAGES;

/**
 * Get a random building image from an array (or defaults)
 * @param images Optional custom image array
 * @returns A random BuildingImage
 */
export function getRandomBuildingImage(images: BuildingImage[] = DEFAULT_BUILDING_IMAGES): BuildingImage {
  const pool = images.length > 0 ? images : DEFAULT_BUILDING_IMAGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get a random building image index that's different from the current one
 * @param currentIndex The current image index to avoid
 * @param images Optional custom image array
 * @returns A new random index different from the current one
 */
export function getNextRandomIndex(
  currentIndex: number,
  images: BuildingImage[] = DEFAULT_BUILDING_IMAGES
): number {
  const pool = images.length > 0 ? images : DEFAULT_BUILDING_IMAGES;
  if (pool.length <= 1) return 0;

  let nextIndex: number;
  do {
    nextIndex = Math.floor(Math.random() * pool.length);
  } while (nextIndex === currentIndex);

  return nextIndex;
}
