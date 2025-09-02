import type { SQL } from "drizzle-orm";

export type EmptyProps<T extends React.ElementType> = Omit<
  React.ComponentProps<T>,
  keyof React.ComponentProps<T>
>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export interface QueryBuilderOpts {
  distinct?: boolean;
  nullish?: boolean;
  orderBy?: SQL;
  where?: SQL;
}

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}
