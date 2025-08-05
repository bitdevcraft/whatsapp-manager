// permissions.ts
import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

// Build an AC instance seeded with the default org statements:
const statement = {
  ...defaultStatements,
  business: ["read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

// Owner: keep all actions, including invitation:create
export const owner = ac.newRole({
  business: ["read", "update", "delete"],
  ...ownerAc.statements,
});

// Admin & Member: inherit everything _except_ invitation actions
export const admin = ac.newRole({
  business: ["read", "update", "delete"],
  ...adminAc.statements,
  invitation: [],
});

export const member = ac.newRole({ ...memberAc.statements, invitation: [] });
