import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PackageCard, ServiceCard } from "@/components/cards";
import type { Package, Service } from "@/lib/types";

const service: Service = {
  id: "svc-1",
  name: "Compliance review",
  description: "Full compliance support.",
  basePrice: 1500,
  category: { id: "cat-1", name: "Permits", slug: "permits" },
};

function makePackage(serviceCount: number): Package {
  return {
    id: "pkg-1",
    name: "Premium",
    type: "premium",
    description: null,
    isFeatured: true,
    price: 25000,
    durationDays: 365,
    category: { id: "cat-1", name: "Permits", slug: "permits" },
    services: Array.from({ length: serviceCount }, (_, i) => ({
      id: `s-${i}`,
      name: `Service ${i}`,
      description: null,
      basePrice: 100,
    })),
  };
}

describe("ServiceCard", () => {
  it("shows the category badge, a 'from' price and a detail link", () => {
    render(<ServiceCard service={service} locale="en" />);
    expect(screen.getByText("Permits")).toBeInTheDocument();
    expect(screen.getByText(/From/)).toBeInTheDocument();
    expect(screen.getByText(/1,500\.00/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View service/i })).toHaveAttribute(
      "href",
      "/services/compliance-review-svc-1",
    );
  });
});

describe("PackageCard", () => {
  it("lists at most four services and a '+N more' when there are more", () => {
    render(<PackageCard pkg={makePackage(6)} locale="en" />);
    expect(screen.getByText("Service 0")).toBeInTheDocument();
    expect(screen.getByText("Service 3")).toBeInTheDocument();
    expect(screen.queryByText("Service 4")).not.toBeInTheDocument();
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("omits '+N more' when four or fewer services", () => {
    render(<PackageCard pkg={makePackage(3)} locale="en" />);
    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
  });
});
