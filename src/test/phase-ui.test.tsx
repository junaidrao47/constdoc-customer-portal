import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "@/components/status-badge";
import { SegmentedProgress } from "@/components/phases-stepper";
import type { PhaseStatus } from "@/lib/types";

describe("StatusBadge with phase/account prefixes", () => {
  it("labels phase statuses from the phase.status namespace", () => {
    const { rerender } = render(<StatusBadge status="in_progress" prefix="phase.status" locale="en" />);
    expect(screen.getByText("In progress")).toBeInTheDocument();
    rerender(<StatusBadge status="completed" prefix="phase.status" locale="es" />);
    expect(screen.getByText("Completada")).toBeInTheDocument();
  });

  it("labels account statuses from the account.status namespace", () => {
    render(<StatusBadge status="pending_approval" prefix="account.status" locale="en" />);
    expect(screen.getByText("Pending approval")).toBeInTheDocument();
  });
});

describe("SegmentedProgress", () => {
  it("renders one segment per phase status", () => {
    const statuses: PhaseStatus[] = ["completed", "in_progress", "not_started"];
    const { container } = render(<SegmentedProgress statuses={statuses} />);
    expect(container.querySelectorAll("span")).toHaveLength(3);
  });

  it("renders a single empty bar when there are no phases", () => {
    const { container } = render(<SegmentedProgress statuses={[]} />);
    expect(container.querySelectorAll("span")).toHaveLength(0);
    expect(container.querySelector("div")).toBeInTheDocument();
  });
});
