// apps/web/app/(frontend)/(admin)/ing/whatsapp/templates/new/page.tsx
"use client";

import TemplateCreateForm from "./_components/template-create";

export default function NewTemplatePage() {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
        >
          ←
        </button>
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
