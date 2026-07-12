/** Escape a single CSV field per RFC 4180. */
export function escapeCsvField(value: string | number | boolean | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Join fields into one CSV row with proper escaping. */
export function formatCsvRow(fields: Array<string | number | boolean | null | undefined>): string {
  return fields.map(escapeCsvField).join(",");
}

/** Build a full CSV document from a header row and data rows. */
export function buildCsv(
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>
): string {
  const lines = [formatCsvRow(headers), ...rows.map((row) => formatCsvRow(row))];
  return lines.join("\n");
}
