/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import React from "react";

export interface TemplateLike {
  category: string;
  components: Component[];
  language: string;
  name: string;
}

type Component = {
  buttons?: Array<{ text: string; type: string; }>;
  cards?: Array<{ card_index?: number; components: Component[]; }>;
  example?: Record<string, any> & { body_text?: string[][]; header_handle?: string[]; };
  format?: "DOCUMENT" | "IMAGE" | "PRODUCT" | "TEXT" | "VIDEO" | string;
  text?: string;
  type: "BODY" | "BUTTONS" | "CAROUSEL" | "FOOTER" | "HEADER";
};

export function TemplatePreview({ template }: { template: TemplateLike }) {
  const renderHeader = (comp: Component) => {
    if (comp.format === "TEXT") {
      return <div className="font-bold text-base px-3 py-2">{comp.text || ""}</div>;
    }
    const src = comp.example?.header_handle?.[0];
    if (comp.format === "IMAGE" && src) {
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <div className="px-3 pt-2">
          <img src={src} alt="Header image" className="rounded-md max-h-64 w-full object-cover" />
        </div>
      );
    }
    if (comp.format === "VIDEO" && src) {
      return (
        <div className="px-3 pt-2">
          <video className="rounded-md w-full" controls src={src} />
        </div>
      );
    }
    if (comp.format === "DOCUMENT" && src) {
      return (
        <div className="px-3 pt-2">
          <a className="text-sm underline" href={src} rel="noreferrer" target="_blank">
            View document
          </a>
        </div>
      );
    }
    return null;
  };

  const renderButtons = (comp: Component) => {
    return (
      <div className="flex gap-2 mt-3 flex-wrap justify-center items-center px-3 pb-3">
        {(comp.buttons || []).map((btn, i) => (
          <Button key={i} size="sm" variant="outline">
            {btn.text || btn.type}
          </Button>
        ))}
      </div>
    );
  };

  const renderComponent = (comp: Component, key?: React.Key) => {
    if (comp.type === "HEADER") return <div key={key}>{renderHeader(comp)}</div>;
    if (comp.type === "BODY")
      return (
        <div className="px-3 py-2 whitespace-pre-line text-sm" key={key}>
          {comp.text || ""}
        </div>
      );
    if (comp.type === "FOOTER")
      return (
        <div className="px-3 pb-2 text-xs text-muted-foreground" key={key}>
          {comp.text || ""}
        </div>
      );
    if (comp.type === "BUTTONS") return <div key={key}>{renderButtons(comp)}</div>;
    if (comp.type === "CAROUSEL") {
      const cards = comp.cards || [];
      return (
        <div className="px-3 py-2 space-y-3" key={key}>
          {cards.map((card, idx) => (
            <Card className="p-2 space-y-2" key={idx}>
              {(card.components || []).map((c, i) => renderComponent(c, i))}
            </Card>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white text-black border">
      <div className="px-3 pt-3 pb-1 text-xs text-muted-foreground">
        {template.name} • {template.language} • {template.category}
      </div>
      {template.components.map((c, idx) => renderComponent(c, idx))}
    </Card>
  );
}


