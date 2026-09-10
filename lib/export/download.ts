import type { ExportArtifact } from "./types";

/**
 * Trigger a browser download for an artifact using an object URL and a
 * synthetic anchor click — the standard approach that works without a server
 * round-trip. The object URL is revoked on the next tick, once the click has
 * been handed to the browser.
 */
export function downloadArtifact({ blob, filename }: ExportArtifact): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
