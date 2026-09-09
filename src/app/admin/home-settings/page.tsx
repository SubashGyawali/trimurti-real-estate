import { Metadata } from "next";
import { getAllAdminGalleryImages } from "@/lib/data/gallery";
import { HomeSettingsClient } from "./home-settings-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home Page Settings - Admin | Trimurti Real Estate",
};

export default async function HomeSettingsPage() {
  const initialImages = await getAllAdminGalleryImages();

  return <HomeSettingsClient initialImages={initialImages} />;
}
