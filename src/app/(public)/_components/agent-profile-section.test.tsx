import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AgentProfileSection } from "./agent-profile-section";

vi.mock("next/image", () => ({
  default: ({ alt, src, fill, priority, sizes, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img alt={alt} src={src} {...props} />
  ),
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const motion = new Proxy(
    {},
    {
      get: (_, tag: string) =>
        React.forwardRef(({ children, ...props }: any, ref: any) =>
          React.createElement(tag as any, { ref, ...props }, children)
        ),
    }
  );
  return { motion, useInView: () => true };
});

describe("AgentProfileSection", () => {
  it(
    "renders the proprietor spotlight first with simplified contact actions",
    () => {
      render(<AgentProfileSection />);

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        /meet our expert team/i
      );
      expect(
        screen.getByText(/proprietor & principal broker/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/500.*families/i)).toBeInTheDocument();

      expect(screen.getByText(/10 years experience/i)).toBeInTheDocument();
      expect(screen.getByText(/rental properties/i)).toBeInTheDocument();

      expect(screen.queryByText(/founder-led/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/direct line/i)).not.toBeInTheDocument();

      // WhatsApp is a <button> (window.open), not a link — 1 founder + 3 team = 4
      expect(
        screen.getAllByRole("button", { name: /^whatsapp$/i })
      ).toHaveLength(4);

      // Founder tel: display "+91 98194 46163", href is phone without spaces
      expect(
        screen.getByRole("link", { name: "+91 98194 46163" })
      ).toHaveAttribute("href", "tel:+919819446163");
      expect(screen.getAllByRole("link", { name: /^call$/i })).toHaveLength(3);

      expect(screen.getByText("Mr. Niraj Koirala")).toBeInTheDocument();
      expect(screen.getByText("Mr. Devashish Bhattacharya")).toBeInTheDocument();
      expect(screen.getByText("Mr. Subash Gyawali")).toBeInTheDocument();
      expect(screen.getByText("Kartik Sharma")).toBeInTheDocument();

      // Only FounderSpotlight renders mailto; accessible name is "Email" (icon + text)
      expect(document.querySelectorAll('a[href^="mailto:"]')).toHaveLength(1);
      expect(screen.getByRole("link", { name: /^email$/i })).toHaveAttribute(
        "href",
        "mailto:niraj@trimurtirealestate.com"
      );
    },
    15000
  );
});
