"use client";

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
import { Separator } from "@workspace/ui/components/separator";
import { TemplateResponse } from "@workspace/wa-cloud-api";
import React from "react";

import { UniversalPreviewBlob } from "@/components/universal-preview-blob";
import {
  ComponentsValue,
  ParameterValues,
} from "@/features/whatsapp/templates/lib/schema";

import { handleMergeTemplateMessage, MergeData } from "./lib";
import { cn } from "@workspace/ui/lib/utils";

interface Props {
  messageTemplate?: { components?: ComponentsValue[] };
  template: TemplateResponse;
}

export function BubbleChatPreview({ messageTemplate, template }: Props) {
  const data = React.useMemo(
    () => handleMergeTemplateMessage(template, messageTemplate),
    [messageTemplate, template]
  );

  const header = buildInterpolatedText(data.header);
  const body = buildInterpolatedText(data.body);
  const footer = buildInterpolatedText(data.footer);

  return (
    <div className="">
      <Card
        className={cn(
          "text-card-foreground bg-card max-w-sm",
          getHeaderMediaSrc(data.header) ? "pt-0" : ""
        )}
      >
        {/* Header media (if any) */}
        {getHeaderMediaSrc(data.header) && (
          <CardHeader className="w-full p-0">
            <UniversalPreviewBlob
              allowDownload
              modalOnClick
              src={getHeaderMediaSrc(data.header)!}
            />
          </CardHeader>
        )}
        {header && <CardHeader>{header}</CardHeader>}
        {body && <CardContent>{body}</CardContent>}
        <CardFooter className="grid">
          {footer && <div className="text-sm font-light">{footer}</div>}
          {data.buttons.length > 0 && (
            <div className="flex flex-col items-center gap-4">
              <Separator />
              {data.buttons.map((btn, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="ghost"
                >
                  {
                    // @ts-expect-error text
                    btn.template?.text
                  }
                </Button>
              ))}
            </div>
          )}
        </CardFooter>
      </Card>
      {data.cards.length > 0 && (
        <div className="mt-2 grid gap-3 ">
          <Carousel className="w-sm">
            <CarouselContent>
              {data.cards.map((card, idx) => {
                const cHeader = buildInterpolatedText(card.header);
                const cBody = buildInterpolatedText(card.body);
                return (
                  <CarouselItem className="basis-3/4 max-w-sm" key={idx}>
                    <Card
                      className={cn(
                        "bg-card",
                        getHeaderMediaSrc(card.header) ? "pt-0" : ""
                      )}
                    >
                      {getHeaderMediaSrc(card.header) && (
                        <CardHeader className="w-full p-0">
                          <UniversalPreviewBlob
                            allowDownload
                            modalOnClick
                            src={getHeaderMediaSrc(card.header)!}
                          />
                        </CardHeader>
                      )}
                      {cHeader && <CardHeader>{cHeader}</CardHeader>}

                      {cBody && <CardContent>{cBody}</CardContent>}

                      {card.buttons.length > 0 && (
                        <CardFooter className="flex flex-col items-center gap-2">
                          <Separator />
                          {card.buttons.map((btn, i) => (
                            <Button
                              key={i}
                              size="sm"
                              variant="ghost"
                            >
                              {
                                // @ts-expect-error text
                                btn.template?.text
                              }
                            </Button>
                          ))}
                        </CardFooter>
                      )}
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>
      )}
    </div>
  );
}

function buildInterpolatedText(section: MergeData): string {
  const templateText = (
    section.template as unknown as undefined | { text?: string }
  )?.text;
  if (!templateText) return "";

  const params = (
    section.message as unknown as undefined | { parameters?: ParameterValues[] }
  )?.parameters;
  if (!params) return templateText;

  // Build support for both named and positional placeholders
  const byName: Record<string, string> = {};
  const byIndex: string[] = [];

  for (const p of params) {
    if ("text" in p) {
      if ("parameter_name" in p && p.parameter_name) {
        byName[p.parameter_name] = p.text;
      } else {
        byIndex.push(p.text);
      }
    }
  }

  let out = templateText;
  if (Object.keys(byName).length > 0) out = interpolate(out, byName);
  if (byIndex.length > 0) out = interpolate(out, byIndex);
  return out;
}

function getHeaderMediaSrc(section: MergeData): string | undefined {
  const params = (
    section.message as unknown as undefined | { parameters?: ParameterValues[] }
  )?.parameters;
  if (!params) return undefined;

  for (const p of params) {
    if ("image" in p && p.image) {
      const id = p.image.id;
      const link = p.image.link;
      return id ? `/api/whatsapp/files?mediaId=${id}` : (link ?? undefined);
    }
    if ("video" in p && p.video) {
      const id = p.video.id;
      const link = p.video.link;
      return id ? `/api/whatsapp/files?mediaId=${id}` : (link ?? undefined);
    }
    if ("document" in p && p.document) {
      const id = p.document.id;
      const link = p.document.link;
      return id ? `/api/whatsapp/files?mediaId=${id}` : (link ?? undefined);
    }
  }
  return undefined;
}

// Interpolate similar to apps/web/app/(backend)/api/(internal)/whatsapp/actions.ts
function interpolate(
  template: string,
  record: Record<string, unknown> | unknown[]
): string {
  return template.replace(/{{\s*([^{}]+)\s*}}/g, (_match, rawToken) => {
    const token = String(rawToken).trim();

    if (Array.isArray(record) && /^\d+$/.test(token)) {
      // 1-based index in the placeholder → 0-based index in the array
      const value = record[Number(token) - 1];
      return value != null ? String(value) : "";
    }

    if (!Array.isArray(record) && token in record) {
      const value = (record as Record<string, unknown>)[token];
      return value != null ? String(value) : "";
    }

    // Unresolved tokens default to an empty string
    return "";
  });
}
