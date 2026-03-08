import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AgentProfileSection } from "./agent-profile-section";

vi.mock("next/image", () => ({
  default: ({ alt, src, fill, priority, sizes, ...props }: any) => (
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
          React.createElement(tag, { ref, ...props }, children)
        ),
    }
  );

  return {
    motion,
    useInView: () => true,
  };
});

describe("AgentProfileSection", () => {
  it(
    "renders the proprietor spotlight first with simplified contact actions",
    () => {
      render(<AgentProfileSection />);

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        /meet the people behind your dream home/i
      );

      expect(
        screen
          .getAllByRole("heading", { level: 3 })
          .map((heading) => heading.textContent)
      ).toEqual([
        "Mr. Niraj Koirala",
        "Mrs. Anita Koirala",
        "Mr. Rahul Sharma",
      ]);

      expect(
        screen.getByText(/proprietor & principal broker/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/guided 500\+ families through mhada sales, rentals/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/helps families shortlist practical rental options/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/handles mhada transfers, registration, and documentation/i)
      ).toBeInTheDocument();

      expect(screen.queryByText(/founder-led/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/direct line/i)).not.toBeInTheDocument();

      expect(
        screen.getByRole("link", {
          name: /chat with mr\. niraj koirala on whatsapp/i,
        })
      ).toHaveAttribute(
        "href",
        expect.stringContaining("https://wa.me/919819446163")
      );
      expect(
        screen.getByRole("link", {
          name: /call mr\. niraj koirala/i,
        })
      ).toHaveAttribute("href", "tel:+919819446163");

      expect(
        screen.getByRole("link", { name: /niraj@trimurtirealestate\.com/i })
      ).toHaveAttribute("href", "mailto:niraj@trimurtirealestate.com");
      expect(
        screen.getByRole("link", { name: /anita@trimurtirealestate\.com/i })
      ).toHaveAttribute("href", "mailto:anita@trimurtirealestate.com");
      expect(
        screen.getByRole("link", { name: /rahul@trimurtirealestate\.com/i })
      ).toHaveAttribute("href", "mailto:rahul@trimurtirealestate.com");

      expect(document.querySelectorAll('a[href^="tel:"]')).toHaveLength(3);
      expect(document.querySelectorAll('a[href^="mailto:"]')).toHaveLength(3);
      expect(document.querySelectorAll('a[href^="https://wa.me/"]')).toHaveLength(3);
    },
    15000
  );
});
