"use client";

import { Template } from "@workspace/db/schema";
import { Dialog, DialogContent } from "@workspace/ui/components/dialog";
import * as React from "react";

export function EditTemplateDialog({
  onOpenChange,
  open,
  template,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  template: null | Template;
}) {
  if (!template) return null;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Edit Template</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-muted/20">
              <p className="text-sm text-muted-foreground mb-2">Template ID: {template.id}</p>
              <p className="text-sm text-muted-foreground">Name: {template.content?.name}</p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  // Open the edit page in a new tab
                  window.open(`/ing/whatsapp/templates/${template.id}/edit`, "_blank");
                  onOpenChange(false);
                }}
                type="button"
              >
                Open in Full Editor
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
