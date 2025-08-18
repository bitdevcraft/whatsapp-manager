import z from "zod";

const MessageTypes = z.union([
  z.literal("audio"),
  z.literal("contacts"),
  z.literal("document"),
  z.literal("image"),
  z.literal("interactive"),
  z.literal("location"),
  z.literal("reaction"),
  z.literal("sticker"),
  z.literal("template"),
  z.literal("text"),
  z.literal("video"),
  z.literal("button"),
  z.literal("order"),
  z.literal("system"),
  z.literal("unknown"),
  z.literal("statuses"),
]);

export const BaseMessageSchema = z.object({
  messaging_product: z.literal("whatsapp"),
  recipient_type: z.literal("individual"),
  to: z.string(),
  type: MessageTypes,
});
