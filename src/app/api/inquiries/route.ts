import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { inquirySchema, propertyVisitSchema } from "@/lib/validations/inquiry";
import { contactFormSchema, SUBJECT_OPTIONS } from "@/lib/validations/contact";
import {
  requirementsFormSchema,
  PROPERTY_TYPE_OPTIONS,
  formatBudget,
} from "@/lib/validations/requirements";
import { sendInquiryNotification } from "@/lib/email";
import type { PropertyVisitInsert, InquiryInsert } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    const supabase = await createClient();

    if (type === "visit") {
      // Property visit booking
      const validated = propertyVisitSchema.parse(data);

      const visitData: PropertyVisitInsert = {
        property_id: validated.property_id,
        name: validated.name,
        phone: validated.phone,
        email: validated.email || null,
        preferred_date: validated.preferred_date || null,
        preferred_time: validated.preferred_time || null,
        message: validated.message || null,
      };

      const { error } = await supabase
        .from("property_visits")
        .insert(visitData as never);

      if (error) {
        console.error("Supabase error:", error);
        throw new Error("Failed to save visit request");
      }

      return NextResponse.json({
        success: true,
        message: "Visit request submitted successfully",
      });
    } else if (type === "contact") {
      // Contact form submission
      const validated = contactFormSchema.parse(data);

      // Get the subject label for display
      const subjectLabel =
        SUBJECT_OPTIONS.find((opt) => opt.value === validated.subject)?.label ||
        validated.subject;

      const inquiryData: InquiryInsert = {
        property_id: null,
        name: validated.name,
        phone: validated.phone,
        email: validated.email || null,
        message: validated.message || null,
        inquiry_type: "general",
        requirements_data: {
          subject: validated.subject,
          subject_label: subjectLabel,
        } as any,
      };

      const { error } = await supabase
        .from("inquiries")
        .insert(inquiryData as never);

      if (error) {
        console.error("Supabase error:", error);
        throw new Error("Failed to save inquiry");
      }

      // Send email notification (non-blocking)
      sendInquiryNotification({
        name: validated.name,
        phone: validated.phone,
        email: validated.email || null,
        subject: subjectLabel,
        message: validated.message || null,
      }).catch((err) => {
        console.error("Failed to send email notification:", err);
      });

      return NextResponse.json({
        success: true,
        message: "Message sent successfully! We'll get back to you soon.",
      });
    } else if (type === "requirements") {
      // Requirements form submission
      const validated = requirementsFormSchema.parse(data.requirements_data || data);

      // Build summary for email notification
      const propertyTypes = validated.property_types
        .map((t) => PROPERTY_TYPE_OPTIONS.find((o) => o.value === t)?.label || t)
        .join(", ");

      const budgetRange =
        validated.listing_type === "rent"
          ? `${formatBudget(validated.budget_min, "rent")} - ${formatBudget(validated.budget_max, "rent")}/month`
          : `${formatBudget(validated.budget_min, "sale")} - ${formatBudget(validated.budget_max, "sale")}`;

      const inquiryData: InquiryInsert = {
        property_id: null,
        name: validated.name,
        phone: validated.phone,
        email: validated.email || null,
        message: null,
        inquiry_type: "requirements",
        requirements_data: {
          listing_type: validated.listing_type,
          property_types: validated.property_types,
          budget_min: validated.budget_min,
          budget_max: validated.budget_max,
          floor_preference: validated.floor_preference,
          furnishing: validated.furnishing,
          building_id: validated.building_id || null,
          move_in_timeline: validated.move_in_timeline,
          notes: validated.notes,
          whatsapp_updates: validated.whatsapp_updates,
        } as any,
      };

      const { error } = await supabase
        .from("inquiries")
        .insert(inquiryData as never);

      if (error) {
        console.error("Supabase error:", error);
        throw new Error("Failed to save requirements");
      }

      // Build detailed message for email
      const requirementsSummary = [
        `Looking to: ${validated.listing_type === "rent" ? "Rent" : "Buy"}`,
        `Property Type: ${propertyTypes}`,
        `Budget: ${budgetRange}`,
        validated.furnishing ? `Furnishing: ${validated.furnishing}` : null,
        validated.move_in_timeline ? `Timeline: ${validated.move_in_timeline}` : null,
        validated.notes ? `Notes: ${validated.notes}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      // Send email notification (non-blocking)
      sendInquiryNotification({
        name: validated.name,
        phone: validated.phone,
        email: validated.email || null,
        subject: "Property Requirements",
        message: requirementsSummary,
      }).catch((err) => {
        console.error("Failed to send email notification:", err);
      });

      return NextResponse.json({
        success: true,
        message: "Requirements submitted successfully! We'll contact you soon.",
      });
    } else {
      // General or property-specific inquiry
      const validated = inquirySchema.parse(data);

      const inquiryData: InquiryInsert = {
        property_id: validated.property_id || null,
        name: validated.name,
        phone: validated.phone,
        email: validated.email || null,
        message: validated.message || null,
        inquiry_type: validated.inquiry_type,
        requirements_data: null,
      };

      const { error } = await supabase
        .from("inquiries")
        .insert(inquiryData as never);

      if (error) {
        console.error("Supabase error:", error);
        throw new Error("Failed to save inquiry");
      }

      return NextResponse.json({
        success: true,
        message: "Inquiry submitted successfully",
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Zod v4 uses 'issues' property
      const firstIssue = error.issues?.[0];
      return NextResponse.json(
        { success: false, error: firstIssue?.message || "Validation failed" },
        { status: 400 }
      );
    }

    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit. Please try again." },
      { status: 500 }
    );
  }
}
