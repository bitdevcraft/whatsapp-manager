import {
  ComponentSchema,
  MessageTemplateValues,
} from "@/features/whatsapp/templates/lib/schema";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel";
import { TemplateResponse } from "@workspace/wa-cloud-api";
import {
  ComponentTypes,
  TemplateBody,
  TemplateButtons,
  TemplateCarousel,
  TemplateFooter,
  TemplateFormat,
  TemplateHeader,
} from "@workspace/wa-cloud-api/template";
import z from "zod";

interface Props {
  template: TemplateResponse;
  messageTemplate?: MessageTemplateValues;
}

export function SingleTemplatePreview({ template, messageTemplate }: Props) {
  const base = template.components.filter((comp) =>
    ["HEADER", "BODY", "FOOTER", "BUTTONS"].includes(comp.type)
  );
  const carousel = template.components.filter((comp) =>
    ["CAROUSEL"].includes(comp.type)
  );

  const messageComponents = messageTemplate?.components ?? [];

  return (
    <div>
      <p className="text-sm font-light">
        This is a preview of the template without the data
      </p>
      <div className="space-y-2 border bg-muted p-4">
        <Card>
          {base.map((component, idx) => (
            <ComponentPreview
              key={idx}
              component={component}
              messageComponents={messageComponents}
            />
          ))}
        </Card>
        {carousel.map((component, idx) => (
          <ComponentPreview
            key={idx}
            component={component}
            messageComponents={messageComponents}
          />
        ))}
      </div>
    </div>
  );
}

export function ComponentPreview({
  component,
  messageComponents,
  ...props
}: React.ComponentProps<"div"> & {
  component: ComponentTypes;
  messageComponents?: z.infer<typeof ComponentSchema>[];
}) {
  const type = component.type;

  if (type === "CAROUSEL") {
    return <ComponentCarouselPreview component={component} />;
  }

  const cIdx = messageComponents?.findIndex((c) => c.type === type) ?? -1;

  return (
    <div {...props}>
      <div>
        {type === "HEADER" && <ComponentHeaderPreview component={component} />}
        {type === "BODY" && <ComponentBodyPreview component={component} />}
        {type === "FOOTER" && <ComponentFooterPreview component={component} />}
        {type === "BUTTONS" && <ComponentButtonPreview component={component} />}
      </div>
    </div>
  );
}

export function ComponentHeaderPreview({
  component,
}: {
  component: TemplateHeader;
}) {
  const format: TemplateFormat = component.format;
  return (
    <CardHeader>
      {format === "TEXT" && <p>{component.text}</p>}
      {format === "IMAGE" && (
        <img
          src={
            component.example?.header_handle
              ? (component.example?.header_handle[0] ?? "")
              : ""
          }
          alt={""}
          className="aspect-3/2 object-cover w-full"
        />
      )}
      {format === "VIDEO" && (
        <video width={320} height={240} controls className="w-full">
          <source
            src={
              component.example?.header_handle
                ? (component.example?.header_handle[0] ?? "")
                : ""
            }
            type="video/mp4"
          />
          <source
            src={
              component.example?.header_handle
                ? (component.example?.header_handle[0] ?? "")
                : ""
            }
            type="video/ogg"
          ></source>
          Your browser does not support the video tag.
        </video>
      )}
      {format === "DOCUMENT" && <></>}
    </CardHeader>
  );
}

export function ComponentBodyPreview({
  component,
}: {
  component: TemplateBody;
}) {
  return <CardContent>{component.text as string}</CardContent>;
}

export function ComponentFooterPreview({
  component,
}: {
  component: TemplateFooter;
}) {
  return <CardFooter>{component.text as string}</CardFooter>;
}

export function ComponentButtonPreview({
  component,
}: {
  component: TemplateButtons;
}) {
  return (
    <div className="flex flex-col">
      {component.buttons.map((btn, i) => (
        <Button
          key={i}
          variant="ghost"
          size="sm"
          className="text-green-900"
          type="button"
        >
          {btn.type}
        </Button>
      ))}
    </div>
  );
}

export function ComponentCarouselPreview({
  component,
}: {
  component: TemplateCarousel;
}) {
  return (
    <Carousel>
      <CarouselContent>
        {component.cards.map((card, idx) => (
          <CarouselItem key={idx} className="basis-3/4">
            <Card>
              {card.components.map((comp, i) => (
                <ComponentPreview
                  key={`${idx}-${i}-${comp.type}`}
                  component={comp}
                />
              ))}
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
