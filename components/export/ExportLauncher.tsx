"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ExportDrawer } from "./ExportDrawer";

/**
 * Dashboard entry point for the advanced export flow: a button that opens the
 * export drawer. Kept as its own client island so the dashboard page stays lean.
 */
export function ExportLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <span aria-hidden className="mr-1">↧</span>
        Export
      </Button>
      <ExportDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
