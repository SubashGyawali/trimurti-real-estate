import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { RequirementsForm } from "@/components/forms/requirements-form";
import type { Building } from "@/types";

export const metadata: Metadata = {
  title: "Tell Us Your Requirements | Trimurti Real Estate",
  description:
    "Let us know what you're looking for. Fill out our simple form and we'll find matching properties in Kandivali West, Mumbai.",
  openGraph: {
    title: "Tell Us Your Requirements | Trimurti Real Estate",
    description:
      "Fill out our simple form to help us find your perfect property.",
  },
};

export default async function RequirementsPage() {
  const supabase = await createClient();

  // Fetch buildings for dropdown
  const { data: buildings } = await supabase
    .from("buildings")
    .select("*")
    .order("name");

  return (
    <main className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--brand-blue))] to-primary py-12 md:py-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/5" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-plus-jakarta text-3xl font-bold text-white md:text-4xl">
              Tell Us What You're Looking For
            </h1>
            <p className="mt-4 text-white/80">
              Fill out this quick form and we'll match you with the perfect
              properties in Kandivali West
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-xl rounded-2xl bg-background p-6 shadow-lg md:p-8">
            <RequirementsForm buildings={(buildings as Building[]) || []} />
          </div>
        </div>
      </section>
    </main>
  );
}
