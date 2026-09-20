import { describe, expect, it } from "vitest";
import { formatSurveyAnswerValue } from "./results";

describe("formatSurveyAnswerValue", () => {
  it("formats empty values as a dash", () => {
    expect(formatSurveyAnswerValue(null)).toBe("—");
    expect(formatSurveyAnswerValue("")).toBe("—");
    expect(formatSurveyAnswerValue([])).toBe("—");
  });

  it("joins multi-select answers", () => {
    expect(formatSurveyAnswerValue(["Indica", "Hybrid"])).toBe("Indica, Hybrid");
  });

  it("stringifies objects and scalars", () => {
    expect(formatSurveyAnswerValue(8)).toBe("8");
    expect(formatSurveyAnswerValue({ score: 10 })).toBe('{"score":10}');
  });
});
