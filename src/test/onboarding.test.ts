import { describe, expect, it } from "vitest";
import {
  buildOnboardingPayload,
  emptyForm,
  firstIncompleteStep,
  validateStep,
  type OnboardingForm,
} from "@/lib/onboarding";
import type { Onboarding } from "@/lib/types";

function fullForm(): OnboardingForm {
  return {
    persona: "company",
    legalName: "Acme SA de CV",
    contactName: "Ana López",
    phone: "5512345678",
    state: "Veracruz",
    city: "Xalapa",
    notificationEmails: ["ops@acme.mx"],
    needs: ["permit"],
  };
}

describe("validateStep", () => {
  it("requires a persona on step 1 with a localized message", () => {
    expect(validateStep(0, emptyForm(), "en").persona).toBe("Choose an option.");
    expect(validateStep(0, emptyForm(), "es").persona).toBe("Elige una opción.");
    expect(validateStep(0, fullForm(), "en")).toEqual({});
  });

  it("requires contact details and at least one valid email on step 2", () => {
    const errors = validateStep(1, emptyForm(), "en");
    expect(errors.legalName).toBe("Enter the legal name.");
    expect(errors.phone).toBe("Enter a valid phone number.");
    expect(errors.notificationEmails).toBe("Add at least one email.");
    expect(validateStep(1, fullForm(), "en")).toEqual({});
  });

  it("rejects an invalid email and a too-short phone", () => {
    const form = { ...fullForm(), phone: "12", notificationEmails: ["not-an-email"] };
    const errors = validateStep(1, form, "en");
    expect(errors.phone).toBe("Enter a valid phone number.");
    expect(errors.notificationEmails).toBe("Invalid email.");
  });

  it("never blocks on step 3 (needs are optional)", () => {
    expect(validateStep(2, emptyForm(), "en")).toEqual({});
  });
});

describe("firstIncompleteStep", () => {
  const base: Onboarding = {
    persona: null,
    legalName: null,
    contactName: null,
    notificationEmails: [],
    phone: null,
    state: null,
    city: null,
    needs: [],
    completedAt: null,
    completed: false,
  };

  it("resumes at the first unfinished step", () => {
    expect(firstIncompleteStep(base, "en")).toBe(0);
    expect(firstIncompleteStep({ ...base, persona: "company" }, "en")).toBe(1);
    expect(
      firstIncompleteStep(
        {
          ...base,
          persona: "company",
          legalName: "Acme",
          contactName: "Ana",
          phone: "5512345678",
          state: "Veracruz",
          city: "Xalapa",
          notificationEmails: ["a@b.mx"],
        },
        "en",
      ),
    ).toBe(2);
  });
});

describe("buildOnboardingPayload", () => {
  it("includes only individually-valid fields plus the mapped locale", () => {
    const form = { ...fullForm(), phone: "12", notificationEmails: ["ok@a.mx", "bad"] };
    const payload = buildOnboardingPayload(form, "en");
    expect(payload.phone).toBeUndefined(); // too short, omitted so autosave stays valid
    expect(payload.notificationEmails).toEqual(["ok@a.mx"]);
    expect(payload.locale).toBe("en");
    expect(payload.persona).toBe("company");
  });

  it("maps the Spanish UI locale to es-MX", () => {
    expect(buildOnboardingPayload(fullForm(), "es").locale).toBe("es-MX");
  });
});
