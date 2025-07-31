"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card";
import { Form } from "@workspace/ui/components/form";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { MessageTemplateSchema } from "@/features/whatsapp/templates/lib/schema";
import { StepBasicInfo } from "./form-steps/step-basic-info";
import { StepContent } from "./form-steps/step-content";
import { StepButtons } from "./form-steps/step-buttons";
import { StepReview } from "./form-steps/step-review";

type FormValues = z.infer<typeof MessageTemplateSchema>;

const steps = [
  { id: "basic", label: "Basic Info" },
  { id: "content", label: "Content" },
  { id: "buttons", label: "Buttons" },
  { id: "review", label: "Review & Submit" },
];

export function TemplateForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(MessageTemplateSchema),
    defaultValues: {
      name: "",
      language: {
        policy: "deterministic",
        code: "en",
      },
      category: "MARKETING",
      components: [
        {
          type: "BODY",
          text: "",
        },
      ],
    },
  });

  const nextStep = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch('/api/(internal)/whatsapp/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          status: 'PENDING', // Default status for locally created templates
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create template');
      }

      const result = await response.json();
      toast.success("Template created successfully!");
      router.push("/ing/whatsapp/templates");
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create template. Please try again.");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepBasicInfo form={form} />;
      case 1:
        return <StepContent form={form} />;
      case 2:
        return <StepButtons form={form} />;
      case 3:
        return <StepReview form={form} />;
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`ml-2 text-sm ${
                  index <= currentStep ? "font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className="w-16 h-px bg-border mx-2" />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">{renderStep()}</CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="space-x-2">
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit">
                  Create Template
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
