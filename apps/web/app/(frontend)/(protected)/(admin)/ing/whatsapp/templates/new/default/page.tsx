// apps/web/app/(frontend)/(admin)/ing/whatsapp/templates/new/page.tsx
"use client";

import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";

import TemplateCreateForm from "../_components/template-create-default-form";

export default function NewTemplatePage() {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button onClick={() => window.history.back()} variant="ghost">
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Create New Template</h1>
          <p className="text-muted-foreground">
            Create a new WhatsApp message template
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6 bg-background/60">
        <TemplateCreateForm />
      </div>
    </div>
  );
}
