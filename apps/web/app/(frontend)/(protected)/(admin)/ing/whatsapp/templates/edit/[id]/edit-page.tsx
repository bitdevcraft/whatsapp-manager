"use client";

import { getTemplateById } from "@/features/whatsapp/templates/lib/queries";
import {
  TemplateCarouselCreateSchema,
  TemplateCreateSchema,
} from "@/types/validations/templates/template-schema";
import React from "react";
import TemplateCreateForm from "../../new/_components/template-create-default-form";
import TemplateCarouselCreateForm from "../../new/_components/template-create-carousel-form";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";

interface Props {
  promises: Promise<[Awaited<ReturnType<typeof getTemplateById>>]>;
}
export function EditPage({ promises }: Props) {
  const [data] = React.use(promises);

  if (!data) return null;

  const carouselTemplate = TemplateCarouselCreateSchema.safeParse(data.content);
  const defaultTemplate = TemplateCreateSchema.safeParse(data.content);

  if (carouselTemplate.success)
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button onClick={() => window.history.back()} variant="ghost">
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Create New Template</h1>
            <p className="text-muted-foreground">
              Update the details of the existing template
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-6 bg-background/60">
          <TemplateCarouselCreateForm
            initialValues={carouselTemplate.data}
            id={data.id}
          />
        </div>
      </div>
    );

  if (defaultTemplate.success)
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button onClick={() => window.history.back()} variant="ghost">
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Edit Template</h1>
            <p className="text-muted-foreground">
              Update the details of the existing template
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-6 bg-background/60">
          <TemplateCreateForm
            initialValues={defaultTemplate.data}
            id={data.id}
          />
        </div>
      </div>
    );

  return null;
}
