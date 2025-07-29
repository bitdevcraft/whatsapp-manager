import { baseModelWithOwner } from "./baseModelWithOwner";
import { baseModelWithWorkspace } from "./baseModelWithWorkSpace";

export const baseModelWithWorkspaceAndOwner = {
  ...baseModelWithWorkspace,
  ...baseModelWithOwner,
};
