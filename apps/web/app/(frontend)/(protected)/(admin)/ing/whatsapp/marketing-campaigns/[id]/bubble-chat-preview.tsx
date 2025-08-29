"use client";

import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { TemplateResponse } from "@workspace/wa-cloud-api";
import React from "react";

import {
  ComponentsValue,
  ParameterValues,
} from "@/features/whatsapp/templates/lib/schema";

import { handleMergeTemplateMessage, MergeData, TemplateData } from "./lib";

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
    <div className="border rounded max-w-sm text-wrap p-4 text-black bg-[#dcf8c6] grid gap-2">
      {header && <div>{header}</div>}
      {body && <div>{body}</div>}
      {footer && <div className="text-sm font-light">{footer}</div>}
      {data.buttons.length > 0 && (
        <div className="flex flex-col items-center gap-4">
          <Separator />
          {data.buttons.map((btn, i) => (
            <Button
              className="text-green-900"
              key={i}
              size="sm"
              type="button"
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
      {data.cards.length > 0 && (
        <div className="mt-2 grid gap-3">
          <Separator />
          {data.cards.map((card, idx) => {
            const cHeader = buildInterpolatedText(card.header);
            const cBody = buildInterpolatedText(card.body);
            return (
              <div
                key={idx}
                className="border rounded text-wrap p-3 text-black bg-white/70 grid gap-2"
              >
                {cHeader && <div>{cHeader}</div>}
                {cBody && <div>{cBody}</div>}
                {card.buttons.length > 0 && (
                  <div className="flex flex-col items-center gap-2">
                    <Separator />
                    {card.buttons.map((btn, i) => (
                      <Button
                        className="text-green-900"
                        key={i}
                        size="sm"
                        type="button"
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
              </div>
            );
          })}
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
