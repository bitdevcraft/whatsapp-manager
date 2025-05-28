import { waApi } from "../agent";

export async function fetchTemplate() {
  const result = await waApi.syncTemplate();
}
