import { TemplateResponse } from "@workspace/wa-cloud-api";
import {
  ComponentTypes,
  TemplateButton,
} from "@workspace/wa-cloud-api/template";

import { ComponentsValue } from "@/features/whatsapp/templates/lib/schema";

export interface TemplateData extends Base {
  cards: Base[];
  footer: MergeData;
}

export interface TemplateData extends Base {
  cards: Base[];
  footer: MergeData;
}

interface Base {
  body: MergeData;
  buttons: {
    message?: ComponentsValue;
    template?: TemplateButton;
  }[];
  header: MergeData;
}
interface Base {
  body: MergeData;
  buttons: {
    message?: ComponentsValue;
    template?: TemplateButton;
  }[];
  header: MergeData;
}

interface MergeData {
  message?: ComponentsValue;
  template?: ComponentTypes;
}

interface MergeData {
  message?: ComponentsValue;
  template?: ComponentTypes;
}

function buildFromTemplate(
  components: ComponentTypes[] | undefined
): TemplateData {
  const out = emptyTemplateData();

  const toBase = (t: TemplateData): Base => ({
    body: t.body,
    buttons: t.buttons,
    header: t.header,
  });

  for (const comp of components ?? []) {
    switch (comp.type) {
      case "BODY":
        out.body.template = comp;
        break;
      case "BUTTONS":
        out.buttons = (comp.buttons ?? []).map((btn) => ({ template: btn }));
        break;
      case "CAROUSEL":
        out.cards = (comp.cards ?? []).map((card) =>
          toBase(buildFromTemplate(card.components))
        );
        out.cards = (comp.cards ?? []).map((card) => {
          const t = buildFromTemplate(card.components);
          const b: Base = {
            body: t.body,
            buttons: t.buttons,
            header: t.header,
          };
          return b;
        });
        break;
      case "FOOTER":
        out.footer.template = comp;
        break;
      case "HEADER":
        out.header.template = comp;
        break;
    }
  }

  return out;
}

function emptyBase(): Base {
  return { body: {}, buttons: [], header: {} };
}

function emptyTemplateData(): TemplateData {
  return { ...emptyBase(), cards: [], footer: {} };
}

const makeBase = (): Base => ({ body: {}, buttons: [], header: {} });
type ButtonSlot = Base["buttons"][number];
const makeButtonSlot = (): ButtonSlot => ({});

export function handleMergeTemplateMessage(
  template: TemplateResponse,
  messageTemplate?: { components?: ComponentsValue[] }
): TemplateData {
  const merged = buildFromTemplate(template.components);

  applyMessage(merged, messageTemplate?.components);

  return merged;
}

function applyMessage(
  out: Base | TemplateData,
  messageComponents?: ComponentsValue[]
) {
  for (const comp of messageComponents ?? []) {
    switch (comp.type) {
      case "BODY":
        out.body.message = comp;
        break;
      case "BUTTON": {
        const i = comp.index ?? 0;
        const slot = getOrCreate(out.buttons, i, makeButtonSlot);
        slot.message = comp;
        break;
      }
      case "CAROUSEL": {
        if ("cards" in out) {
          comp.cards?.forEach((cardMsg, i) => {
            const cardBase = getOrCreate(out.cards, i, makeBase);
            applyMessage(cardBase, cardMsg.components ?? []);
          });
        }
        break;
      }
      case "FOOTER":
        if ("footer" in out) out.footer.message = comp;
        break;
      case "HEADER":
        out.header.message = comp;
        break;
    }
  }

  console.log(out);
}

function getOrCreate<T>(arr: T[], i: number, factory: () => T): T {
  while (arr.length <= i) arr.push(factory());
  return arr[i] as T;
}
