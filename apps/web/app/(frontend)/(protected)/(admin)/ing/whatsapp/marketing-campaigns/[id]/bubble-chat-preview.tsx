'use client';

import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';
import { TemplateResponse } from '@workspace/wa-cloud-api';
import React from 'react';

import {
  ComponentsValue,
  ParameterValues,
} from '@/features/whatsapp/templates/lib/schema';

import { handleMergeTemplateMessage, TemplateData } from './lib';

interface Props {
  messageTemplate?: { components?: ComponentsValue[] };
  template: TemplateResponse;
}

export function BubbleChatPreview({ messageTemplate, template }: Props) {
  const data = React.useMemo(
    () => handleMergeTemplateMessage(template, messageTemplate),
    [messageTemplate, template]
  );

  const header = buildText(data.header);
  const body = buildText(data.body);
  const footer = buildText(data.footer);

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
              {btn.template?.text}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

function applyParameters(text: string, params: ParameterValues[]): string {
  return params.reduce((acc, param, idx) => {
    const placeholder = `{{${idx + 1}}}`;
    const value = extractParam(param);
    return acc.replace(placeholder, value);
  }, text);
}

function buildText(section: TemplateData['body']): string {
  const templateText = (
    (section.template as unknown as undefined | { text?: string })?.text
  );
  if (!templateText) return '';
  const params = (
    (section.message as unknown as undefined | { parameters?: ParameterValues[] })
      ?.parameters
  );
  if (!params) return templateText;
  return applyParameters(templateText, params);
}

function extractParam(p: ParameterValues): string {
  if ('text' in p) return p.text;
  if ('coupon_code' in p) return p.coupon_code;
  if ('currency' in p) return p.currency.fallback_value;
  if ('date_time' in p) return p.date_time.fallback_value;
  if ('document' in p) return p.document.caption ?? '';
  if ('image' in p) return p.image.caption ?? '';
  if ('video' in p) return p.video.caption ?? '';
  return '';
}

