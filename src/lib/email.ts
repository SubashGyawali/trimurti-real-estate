import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@trimurtirealestate.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface InquiryNotificationData {
  name: string;
  phone: string;
  email?: string | null;
  subject: string;
  message?: string | null;
  propertyTitle?: string;
  propertyUrl?: string;
}

export async function sendInquiryNotification(
  data: InquiryNotificationData
): Promise<{ success: boolean; error?: string }> {
  // Skip email sending if no API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.log("Resend API key not configured, skipping email notification");
    return { success: true };
  }

  try {
    const subjectLine = data.propertyTitle
      ? `New Inquiry: ${data.subject} - ${data.propertyTitle}`
      : `New Contact Form Submission: ${data.subject}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f; border-bottom: 2px solid #d4a853; padding-bottom: 10px;">
          New Inquiry Received
        </h2>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e3a5f; margin-top: 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
          <p><strong>Phone:</strong> <a href="tel:+91${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></p>
          ${data.email ? `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>` : ""}
          <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
        </div>

        ${
          data.message
            ? `
        <div style="background-color: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e3a5f; margin-top: 0;">Message</h3>
          <p style="white-space: pre-wrap;">${escapeHtml(data.message)}</p>
        </div>
        `
            : ""
        }

        ${
          data.propertyTitle
            ? `
        <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e3a5f; margin-top: 0;">Property Details</h3>
          <p><strong>Property:</strong> ${escapeHtml(data.propertyTitle)}</p>
          ${data.propertyUrl ? `<p><a href="${escapeHtml(data.propertyUrl)}" style="color: #3b82f6;">View Property</a></p>` : ""}
        </div>
        `
            : ""
        }

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
          <p>This email was sent from Trimurti Real Estate website.</p>
          <p>Quick Actions:
            <a href="tel:+91${escapeHtml(data.phone)}" style="color: #3b82f6;">Call</a> |
            <a href="https://wa.me/91${escapeHtml(data.phone)}" style="color: #25D366;">WhatsApp</a>
          </p>
        </div>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: subjectLine,
      html: htmlContent,
    });

    if (error) {
      console.error("Failed to send email notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending email notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
