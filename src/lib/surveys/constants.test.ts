import { describe, expect, it } from "vitest";
import { brand } from "@/lib/brand";
import {
  mergeSurveySettings,
  resolveSurveyPublicCopy,
  validateSurveyIntake,
} from "./constants";

describe("survey intake helpers", () => {
  it("keeps existing surveys from requiring new consents", () => {
    const settings = mergeSurveySettings({});
    expect(settings.participationConsentEnabled).toBe(false);
    expect(settings.marketingConsentEnabled).toBe(false);
    expect(settings.profileFields).toEqual([]);
  });

  it("falls back to title and brand consent copy", () => {
    const copy = resolveSurveyPublicCopy({
      title: "Booth survey",
      description: "Tell us what you like.",
      settings: {},
    });
    expect(copy.headline).toBe("Booth survey");
    expect(copy.subtext).toBe("Tell us what you like.");
    expect(copy.participationConsentText).toBe(brand.defaults.surveyParticipationConsent);
    expect(copy.marketingConsentText).toBe(brand.defaults.marketingConsent);
  });

  it("requires enabled profile fields and consents", () => {
    const survey = {
      emailRequired: true,
      settings: {
        participationConsentEnabled: true,
        marketingConsentEnabled: true,
        marketingConsentRequired: true,
        profileFields: [
          {
            id: "1",
            key: "firstName",
            label: "First name",
            type: "text" as const,
            required: true,
          },
        ],
      },
    };

    expect(validateSurveyIntake(survey, {})).toBe("Email is required");
    expect(validateSurveyIntake(survey, { email: "a@b.com" })).toBe("First name is required");
    expect(
      validateSurveyIntake(survey, {
        email: "a@b.com",
        profile: { firstName: "Ada" },
      })
    ).toBe("Please agree to participate before submitting");
    expect(
      validateSurveyIntake(survey, {
        email: "a@b.com",
        profile: { firstName: "Ada" },
        consentParticipation: true,
      })
    ).toBe("Please agree to receive marketing emails");
    expect(
      validateSurveyIntake(survey, {
        email: "a@b.com",
        profile: { firstName: "Ada" },
        consentParticipation: true,
        consentMarketing: true,
      })
    ).toBeNull();
  });
});
