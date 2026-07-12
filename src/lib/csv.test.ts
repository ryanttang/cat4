import { describe, expect, it } from "vitest";
import { buildCsv, escapeCsvField, formatCsvRow } from "@/lib/csv";

describe("escapeCsvField", () => {
  it("returns empty string for nullish values", () => {
    expect(escapeCsvField(null)).toBe("");
    expect(escapeCsvField(undefined)).toBe("");
  });

  it("quotes fields containing commas", () => {
    expect(escapeCsvField("Smith, John")).toBe('"Smith, John"');
  });

  it("escapes double quotes", () => {
    expect(escapeCsvField('Say "hello"')).toBe('"Say ""hello"""');
  });
});

describe("formatCsvRow", () => {
  it("joins escaped fields", () => {
    expect(formatCsvRow(["a", "b,c", 1])).toBe('a,"b,c",1');
  });
});

describe("buildCsv", () => {
  it("builds a document with header and rows", () => {
    const csv = buildCsv(["Name", "Email"], [["Jane", "jane@example.com"]]);
    expect(csv).toBe("Name,Email\nJane,jane@example.com");
  });
});
