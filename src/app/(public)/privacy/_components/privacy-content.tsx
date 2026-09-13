import type { ReactNode } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const LAST_UPDATED = "13 September 2026";

const PHONE_DISPLAY = "+91 98194 46163";
const PHONE_TEL = "+919819446163";
const EMAIL = siteConfig.contact.email;
const ADDRESS = `${siteConfig.address.street}, ${siteConfig.address.locality}, ${siteConfig.address.region} - ${siteConfig.address.postalCode}`;
const FOUNDER = siteConfig.founder.name.replace("Mr. ", "");

type Section = {
  id: string;
  number: string;
  title: string;
  body: ReactNode;
};

const sections: Section[] = [
  {
    id: "information-we-collect",
    number: "01",
    title: "Information We Collect",
    body: (
      <>
        <p>
          We collect information you provide directly and information we receive
          automatically when you use our website. The types of information we
          collect include:
        </p>
        <ul className="mt-4 space-y-3 pl-1">
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              <strong className="font-semibold text-foreground">
                Contact information
              </strong>{" "}
              - such as your name, phone number, and email address when you fill
              out our contact form, requirements form, or inquire about a
              property.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              <strong className="font-semibold text-foreground">
                Property preferences
              </strong>{" "}
              - such as budget, apartment size, preferred buildings, and whether
              you are looking to buy or rent.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              <strong className="font-semibold text-foreground">
                Account information
              </strong>{" "}
              - if you create an account, we process your email address, name,
              and password (stored securely and hashed) to manage your account,
              favourites, and property visit bookings.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              <strong className="font-semibold text-foreground">
                Communications
              </strong>{" "}
              - including messages you send us through forms, email, WhatsApp, or
              by phone, and records of those conversations where applicable.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              <strong className="font-semibold text-foreground">
                Technical data
              </strong>{" "}
              - such as your IP address, browser type and version, device type,
              pages visited, and the date and time of your visit, collected to
              keep the site secure and improve performance.
            </span>
          </li>
        </ul>
        <p className="mt-4">
          We do not collect sensitive personal information such as financial
          details, government identifiers, or health information.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    number: "02",
    title: "How We Use Your Information",
    body: (
      <>
        <p>We use the information we collect to:</p>
        <ul className="mt-4 space-y-3 pl-1">
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>Respond to your inquiries and messages promptly.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              Match you with suitable properties based on the preferences you
              share with us.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              Arrange property visits, coordinate with sellers and landlords, and
              keep you updated on the status of your requests.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              Manage your account, favourites list, and saved preferences.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              Improve our website, listings, and services, and ensure their
              technical security.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>Comply with applicable legal and regulatory obligations.</span>
          </li>
        </ul>
        <p className="mt-4">
          We only use your information for purposes we believe are reasonably
          necessary to provide our real estate services. We will not use your
          personal information for purposes unrelated to those described in this
          policy without notifying you.
        </p>
      </>
    ),
  },
  {
    id: "cookies-and-tracking",
    number: "03",
    title: "Cookies and Tracking",
    body: (
      <>
        <p>
          Our website uses cookies and similar technologies to remember your
          preferences, keep you signed in, and understand how visitors use the
          site. Cookies are small text files stored on your device by your
          browser.
        </p>
        <ul className="mt-4 space-y-3 pl-1">
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              <strong className="font-semibold text-foreground">
                Essential cookies
              </strong>{" "}
              - required for the site to function, such as keeping you signed in
              and remembering your search filters.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              <strong className="font-semibold text-foreground">
                Analytics cookies
              </strong>{" "}
              - help us understand aggregate visitor behaviour so we can improve
              the experience.
            </span>
          </li>
        </ul>
        <p className="mt-4">
          You can disable cookies in your browser settings at any time. Please
          note that some parts of the site may not function properly if you do so.
        </p>
      </>
    ),
  },
  {
    id: "third-party-services",
    number: "04",
    title: "Third-Party Services",
    body: (
      <>
        <p>
          We work with a small number of trusted service providers who help us
          run our website and serve you better. These providers process data only
          on our behalf and under appropriate confidentiality obligations:
        </p>
        <ul className="mt-4 space-y-3 pl-1">
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              <strong className="font-semibold text-foreground">
                Supabase
              </strong>{" "}
              - securely hosts our database, authentication, and file storage in
              encrypted, access-controlled environments.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              <strong className="font-semibold text-foreground">
                Resend
              </strong>{" "}
              - delivers transactional emails such as account verification and
              password reset messages.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              <strong className="font-semibold text-foreground">
                WhatsApp and Meta
              </strong>{" "}
              - used for direct communication when you choose to contact us
              through WhatsApp.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              <strong className="font-semibold text-foreground">
                Map providers
              </strong>{" "}
              - such as OpenStreetMap, to display property locations and office
              directions.
            </span>
          </li>
        </ul>
        <p className="mt-4">
          These providers have their own privacy policies, which we encourage you
          to review. When you contact us via WhatsApp, your interaction is also
          subject to Meta's privacy policy.
        </p>
      </>
    ),
  },
  {
    id: "sharing-your-information",
    number: "05",
    title: "Sharing Your Information",
    body: (
      <>
        <p>
          We never sell, rent, or trade your personal information. We share
          information only:
        </p>
        <ul className="mt-4 space-y-3 pl-1">
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              With property owners, sellers, and landlords when necessary to
              arrange a visit or completed transaction you have requested.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              With our service providers (described above) who need it to perform
              their work for us.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              When required by law, a court order, or a government authority, or
              where disclosure is necessary to protect our rights, safety, or
              property.
            </span>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "data-security",
    number: "06",
    title: "Data Security",
    body: (
      <>
        <p>
          Protecting your information is important to us. We employ reasonable
          technical and organisational safeguards, including HTTPS encryption for
          all data transmitted to and from our website, hashed passwords,
          restricted access to data on a need-to-know basis, and managed,
          encrypted hosting infrastructure.
        </p>
        <p className="mt-4">
          No method of transmission over the internet or electronic storage is
          completely secure. While we strive to protect your personal
          information, we cannot guarantee its absolute security. In the unlikely
          event of a data breach, we will notify affected users and the relevant
          authorities as required by applicable law.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    number: "07",
    title: "Data Retention",
    body: (
      <>
        <p>
          We retain personal information only as long as necessary for the
          purposes described in this policy, or as required by law. In general:
        </p>
        <ul className="mt-4 space-y-3 pl-1">
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              Inquiry and contact messages are kept for as long as needed to
              respond to and complete your request.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              Account information is retained while your account remains active.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              Records related to completed transactions may be kept for legal,
              tax, and audit purposes.
            </span>
          </li>
        </ul>
        <p className="mt-4">
          When information is no longer needed, we delete or anonymise it in a
          secure manner.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    number: "08",
    title: "Your Rights",
    body: (
      <>
        <p>
          In line with India's Digital Personal Data Protection Act, 2023 and
          other applicable data protection laws, you have the right to:
        </p>
        <ul className="mt-4 space-y-3 pl-1">
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              Request access to the personal information we hold about you.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>Request correction of inaccurate or incomplete data.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>Request deletion of your personal information.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              Withdraw consent you have given for processing your information, at
              any time.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-gold))]" />
            <span>
              Lodge a complaint with the Data Protection Board of India if you
              believe your rights have been violated.
            </span>
          </li>
        </ul>
        <p className="mt-4">
          To exercise any of these rights, contact us using the details at the
          bottom of this page. We will respond to your request within a
          reasonable period, as required by law.
        </p>
      </>
    ),
  },
  {
    id: "childrens-privacy",
    number: "09",
    title: "Children's Privacy",
    body: (
      <>
        <p>
          Our website and services are intended for individuals who are at least
          18 years of age. We do not knowingly collect personal information from
          children. If you believe a person under 18 has provided us with their
          information, please contact us and we will take steps to delete it.
        </p>
      </>
    ),
  },
  {
    id: "third-party-links",
    number: "10",
    title: "Links to Other Websites",
    body: (
      <>
        <p>
          Our website may contain links to external websites, such as our social
          media profiles or property-related resources. We are not responsible
          for the privacy practices or content of those websites. We encourage
          you to review the privacy policies of any external site you visit.
        </p>
      </>
    ),
  },
  {
    id: "changes-to-this-policy",
    number: "11",
    title: "Changes to This Policy",
    body: (
      <>
        <p>
          We may update this Privacy Policy from time to time to reflect changes
          in our practices, technology, or legal requirements. When we do, we
          will revise the &quot;Last Updated&quot; date at the top of this page.
          We encourage you to review this page periodically to stay informed
          about how we protect your information.
        </p>
      </>
    ),
  },
  {
    id: "contact-us",
    number: "12",
    title: "Contact Us",
    body: (
      <>
        <p>
          If you have any questions, concerns, or requests regarding this Privacy
          Policy or how we handle your personal information, please reach out to
          us. In case of any grievance, please contact our Grievance Officer,{" "}
          <strong className="font-semibold text-foreground">{FOUNDER}</strong>,
          at:
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-6">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <a
                href={`mailto:${EMAIL}`}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {EMAIL}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <a
                href={`tel:${PHONE_TEL}`}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {PHONE_DISPLAY}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">{ADDRESS}</span>
            </li>
          </ul>
        </div>
        <p className="mt-6">
          We aim to respond to all legitimate requests and concerns within 7
          working days.
        </p>
      </>
    ),
  },
];

const tableOfContents = sections.map((section) => ({
  id: section.id,
  number: section.number,
  title: section.title,
}));

export function PrivacyContent() {
  return (
    <main id="top">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--brand-blue))] to-primary py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/5" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4 text-[hsl(var(--brand-gold))]" />
              Last updated: {LAST_UPDATED}
            </span>
            <h1 className="mt-5 font-plus-jakarta text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Privacy Policy
            </h1>
            <p className="mt-6 text-lg text-white/80 md:text-xl">
              We value your trust. Heres how we collect, use, and protect your
              personal information.
            </p>
          </div>
        </div>
      </section>

      {/* Policy Body */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
            {/* Table of Contents */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                <h2 className="font-plus-jakarta text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  On This Page
                </h2>
                <nav aria-label="Privacy policy sections">
                  <ul className="mt-5 space-y-1">
                    {tableOfContents.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="group flex items-baseline gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                        >
                          <span className="font-plus-jakarta text-xs font-semibold text-[hsl(var(--brand-gold))]">
                            {item.number}
                          </span>
                          <span>{item.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>

            {/* Policy Sections */}
            <div className="space-y-6">
              {/* Intro note */}
              <div className="rounded-2xl border-l-4 border-[hsl(var(--brand-gold))] bg-muted/30 p-6 md:p-8">
                <p className="leading-relaxed text-muted-foreground">
                  This Privacy Policy explains the types of information{" "}
                  <strong className="font-semibold text-foreground">
                    {siteConfig.name}
                  </strong>{" "}
                  (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects
                  when you visit our website or use our real estate services,
                  how we use it, and the choices you have. By using our website
                  and services, you agree to the practices described in this
                  policy.
                </p>
              </div>

              {sections.map((section) => (
                <article
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 rounded-2xl border border-border bg-background p-6 shadow-sm md:p-8"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-plus-jakarta text-sm font-bold text-primary">
                      {section.number}
                    </span>
                    <div className="flex-1">
                      <h2 className="font-plus-jakarta text-xl font-bold md:text-2xl">
                        {section.title}
                      </h2>
                      <div className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                        {section.body}
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {/* CTA note */}
              <div className="rounded-2xl bg-gradient-to-br from-[hsl(var(--brand-blue))] to-primary p-8 text-center">
                <h2 className="font-plus-jakarta text-2xl font-bold text-white">
                  Have a Question About Your Data?
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-white/80">
                  We are happy to help. Reach out to us and our team will assist
                  you with any privacy-related request or concern.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
                  <Link
                    href="/contact"
                    className="rounded-xl bg-white px-6 py-3 font-plus-jakarta text-sm font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="#top"
                    className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-plus-jakarta text-sm font-semibold text-white transition-colors hover:bg-white/20"
                  >
                    Back to Top
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}