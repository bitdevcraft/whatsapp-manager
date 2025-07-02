import { ConversationBody } from "@workspace/db/schema";

export interface ConversationContact {
  id: string | null;
  message: ConversationBody | null;
  createdAt: Date;
  contact: {
    name?: string | null;
    phone: string | null;
  };
  isUnread: boolean;
  rn: number;
}
