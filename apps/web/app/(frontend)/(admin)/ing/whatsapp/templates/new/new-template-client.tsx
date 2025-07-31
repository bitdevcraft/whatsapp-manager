"use client";

import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { useTitle } from "@/components/provider/title-provider";
import { useEffect } from "react";
import dynamic from 'next/dynamic';

// Import the form component with no SSR
const TemplateForm = dynamic(
  () => import('./_components/template-form'),
  { 
    ssr: false,
    loading: () => <div>Loading form...</div>
  }
);

export default function NewTemplateClient() {
  const router = useRouter();
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("New WhatsApp Template");
  }, [setTitle]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Create New Template</h1>
          <p className="text-muted-foreground">
            Create a new WhatsApp message template
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <TemplateForm />
      </div>
    </div>
  );
}
