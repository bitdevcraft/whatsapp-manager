import { createSearchParamsCache, parseAsArrayOf } from "nuqs/server";
import z from "zod";

export const dashboardSearchParams = createSearchParamsCache({
  dateRange: parseAsArrayOf(z.coerce.number()).withDefault(getThisMonthRange()),
});

export type GetDashboardSchema = Awaited<
  ReturnType<typeof dashboardSearchParams.parse>
>;

function getThisMonthRange(): number[] {
  const now = new Date();
  // start at 00:00:00.000 on the 1st
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  // end at 23:59:59.999 on the last day
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return [start.getTime(), end.getTime()];
}
