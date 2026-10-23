import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "@/components/status-badge";

describe("StatusBadge", () => {
  it("renders submitted_to_government in both languages", () => {
    const { rerender } = render(<StatusBadge status="submitted_to_government" locale="en" />);
    expect(screen.getByText("Submitted to government")).toBeInTheDocument();
    rerender(<StatusBadge status="submitted_to_government" locale="es" />);
    expect(screen.getByText("Enviado al gobierno")).toBeInTheDocument();
  });

  it("localizes core document statuses", () => {
    render(<StatusBadge status="rejected" locale="es" />);
    expect(screen.getByText("Rechazado")).toBeInTheDocument();
  });

  it("humanizes an unknown status rather than showing a raw token", () => {
    render(<StatusBadge status="some_future_status" locale="en" />);
    expect(screen.getByText("some future status")).toBeInTheDocument();
  });
});
