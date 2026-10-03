import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/login/page";

const login = vi.fn();
const replace = vi.fn();

vi.mock("@/lib/auth-context", () => ({ useAuth: () => ({ login }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

describe("customer login", () => {
  beforeEach(() => {
    login.mockReset();
    replace.mockReset();
  });

  it("shows field validation before calling the API", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.click(screen.getByRole("button", { name: "Sign in securely" }));
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("normalizes credentials and routes after a successful login", async () => {
    const user = userEvent.setup();
    login.mockResolvedValue({});
    render(<LoginPage />);
    await user.type(screen.getByLabelText("Email address"), " Customer@Test.com ");
    await user.type(screen.getByLabelText("Password"), "CustomerPassword123!");
    await user.click(screen.getByRole("button", { name: "Sign in securely" }));
    expect(login).toHaveBeenCalledWith("customer@test.com", "CustomerPassword123!");
    expect(replace).toHaveBeenCalledWith("/dashboard");
  });
});
