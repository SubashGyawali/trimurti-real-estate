// src/lib/data/building-images.ts
// Local building images from /public/Building Images/ folder
// Used for hero section carousel and CTA banner backgrounds

export interface BuildingImage {
  src: string;
  alt: string;
}

/**
 * Array of building images for hero carousel and CTA banner
 * Images are from local properties covered by Trimurti Real Estate
 */
export const buildingImages: BuildingImage[] = [
  {
    src: "/Building Images/Avarai Abrol.JPG",
    alt: "Avarai Abrol Building in Kandivali West",
  },
  {
    src: "/Building Images/Bhoomi Park O wing.JPG",
    alt: "Bhoomi Park O Wing residential complex",
  },
  {
    src: "/Building Images/Bhoomi Park Swimming pool.JPG",
    alt: "Bhoomi Park Swimming Pool amenities",
  },
  {
    src: "/Building Images/Club house bhoomi park.JPG",
    alt: "Bhoomi Park Club House facilities",
  },
  {
    src: "/Building Images/IMG_2161.JPG",
    alt: "Residential building in Kandivali West",
  },
  {
    src: "/Building Images/IMG_7690.JPG",
    alt: "Modern apartment complex in Kandivali",
  },
  {
    src: "/Building Images/IMG_8143.JPG",
    alt: "MHADA residential building exterior",
  },
  {
    src: "/Building Images/IMG_8146.JPG",
    alt: "Apartment building in MHADA Complex",
  },
  {
    src: "/Building Images/IMG_8174.JPG",
    alt: "Residential towers in Kandivali West",
  },
  {
    src: "/Building Images/Marina Garden.JPG",
    alt: "Marina Garden residential complex",
  },
  {
    src: "/Building Images/Mhada 30.JPG",
    alt: "MHADA Building 30 in Kandivali",
  },
  {
    src: "/Building Images/Mhada 55, 56.JPG",
    alt: "MHADA Buildings 55 and 56",
  },
  {
    src: "/Building Images/Mhada 55.JPG",
    alt: "MHADA Building 55 exterior view",
  },
  {
    src: "/Building Images/Pancharatna.JPG",
    alt: "Pancharatna residential building",
  },
  {
    src: "/Building Images/Royal Oarsis Podium View.JPG",
    alt: "Royal Oasis Podium View",
  },
  {
    src: "/Building Images/Royal Oarsis View.JPG",
    alt: "Royal Oasis building view",
  },
  {
    src: "/Building Images/Royal Oasis Main Gate.JPG",
    alt: "Royal Oasis Main Gate entrance",
  },
  {
    src: "/Building Images/Royal Oasis Podium.JPG",
    alt: "Royal Oasis Podium area",
  },
  {
    src: "/Building Images/Royal Oasis Swimming Pool.JPG",
    alt: "Royal Oasis Swimming Pool amenities",
  },
  {
    src: "/Building Images/SBI Bhoomi park.JPG",
    alt: "SBI Bhoomi Park complex",
  },
];

/**
 * Get a random building image
 * @returns A random BuildingImage from the array
 */
export function getRandomBuildingImage(): BuildingImage {
  return buildingImages[Math.floor(Math.random() * buildingImages.length)];
}

/**
 * Get a random building image index that's different from the current one
 * @param currentIndex The current image index to avoid
 * @returns A new random index different from the current one
 */
export function getNextRandomIndex(currentIndex: number): number {
  if (buildingImages.length <= 1) return 0;

  let nextIndex: number;
  do {
    nextIndex = Math.floor(Math.random() * buildingImages.length);
  } while (nextIndex === currentIndex);

  return nextIndex;
}
