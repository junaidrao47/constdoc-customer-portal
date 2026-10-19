import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CatalogEmpty,
  CatalogError,
  FeaturedPackagesSection,
  PackagesSection,
} from "@/components/catalog-sections";
import type { Package } from "@/lib/types";

function makePackage(overrides: Partial<Package> = {}): Package {
  return {
    id: overrides.id ?? "pkg-1",
    name: overrides.name ?? "Starter",
    type: overrides.type ?? "monthly",
    description: overrides.description ?? null,
    isFeatured: overrides.isFeatured ?? false,
    price: overrides.price ?? 1000,
    durationDays: overrides.durationDays ?? 30,
    services: overrides.services ?? [],
  };
}

describe("catalog error state", () => {
  it("shows the message as an alert with a way to reach a human", () => {
    render(<CatalogError message="The catalogue service could not be reached." />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("The catalogue service could not be reached.");
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact");
  });
});

describe("catalog empty state", () => {
  it("renders the title, body and optional call to action", () => {
    render(
      <CatalogEmpty
        title="No packages are published yet."
        body="Build an estimate from individual services instead."
        actionHref="/services#calculator"
        actionLabel="Build an estimate"
      />,
    );

    expect(screen.getByText("No packages are published yet.")).toBeInTheDocument();
    expect(
      screen.getByText("Build an estimate from individual services instead."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Build an estimate" })).toHaveAttribute(
      "href",
      "/services#calculator",
    );
  });

  it("omits the call to action when no action is given", () => {
    render(<CatalogEmpty title="Nothing here." body="Check back soon." />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("package cards", () => {
  it("shows the Featured badge only on featured packages", () => {
    render(
      <PackagesSection
        packages={[
          makePackage({ id: "a", name: "Starter", isFeatured: false }),
          makePackage({ id: "b", name: "Pro", isFeatured: true }),
        ]}
      />,
    );

    // Both cards render...
    expect(screen.getByRole("heading", { name: "Starter" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pro" })).toBeInTheDocument();
    // ...but only the featured one carries the badge.
    expect(screen.getAllByText("Featured")).toHaveLength(1);
  });
});

describe("featured packages section", () => {
  it("renders nothing when no package is featured", () => {
    const { container } = render(
      <FeaturedPackagesSection
        packages={[
          makePackage({ id: "a", isFeatured: false }),
          makePackage({ id: "b", isFeatured: false }),
        ]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("caps the featured row at three packages", () => {
    const packages = Array.from({ length: 5 }, (_, i) =>
      makePackage({ id: `p-${i}`, name: `Package ${i}`, isFeatured: true }),
    );

    render(<FeaturedPackagesSection packages={packages} />);

    // Each card has its own "Get a quote" call to action.
    expect(screen.getAllByRole("link", { name: "Get a quote" })).toHaveLength(3);
  });
});
