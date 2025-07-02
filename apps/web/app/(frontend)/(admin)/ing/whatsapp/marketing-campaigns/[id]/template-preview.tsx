import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { TemplateResponse } from "@workspace/wa-cloud-api";

interface SingleTemplatePreviewProps {
  template: TemplateResponse;
}

export function SingleTemplatePreview({
  template,
}: SingleTemplatePreviewProps) {
  return (
    <Card className="max-w-md mx-auto bg-[#DCF8C6] w-full text-black">
      {template.components.map((component, idx) => {
        if (component.type === "HEADER") {
          return (
            <div key={idx} className="font-bold text-lg px-4 ">
              {component.text as string}
            </div>
          );
        }
        if (component.type === "BODY") {
          return (
            <div key={idx} className="text-base whitespace-pre-line px-4">
              {component.text as string}
            </div>
          );
        }
        if (component.type === "FOOTER") {
          return (
            <div key={idx} className="text-xs px-4">
              {component.text as string}
            </div>
          );
        }
        if (component.type === "BUTTONS" && component.buttons) {
          return (
            <div
              key={idx}
              className="flex gap-2 mt-4 flex-wrap justify-center items-center flex-col border-t-1 pt-2"
            >
              {component.buttons.map((btn, i) => (
                <Button
                  key={i}
                  variant="link"
                  size="sm"
                  className="text-green-900"
                >
                  {btn.type}
                </Button>
              ))}
            </div>
          );
        }

        return null;
      })}
    </Card>
  );
}
