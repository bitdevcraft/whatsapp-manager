/* eslint-disable perfectionist/sort-union-types */
import { ConversationBody } from "@workspace/db/schema";

export interface ConversationContact {
  contact: {
    name?: string | null;
    phone: string | null;
  };
  createdAt: Date;
  id: string | null;
  isUnread: boolean;
  message: ConversationBody | null;
  rn: number;
}
