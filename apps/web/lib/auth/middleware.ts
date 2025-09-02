/* eslint-disable @typescript-eslint/no-explicit-any */
import { TeamDataWithMembers } from "@workspace/db/schema";
import { User } from "better-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getTeamForUser, getUser } from "@/lib/db/queries";

export type ActionState = {
  [key: string]: any; // This allows for additional properties
  error?: string;
  success?: string;
};

type ActionWithTeamFunction<T> = (
  formData: FormData,
  team: TeamDataWithMembers
) => Promise<T>;

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result?.error?.errors[0]?.message };
    }

    return action(result.data, formData);
  };
}

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const user = await getUser();
    if (!user) {
      throw new Error("User is not authenticated");
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result?.error?.errors[0]?.message };
    }

    return action(result.data, formData, user);
  };
}

export function withTeam<T>(action: ActionWithTeamFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) {
      redirect("/sign-in");
    }

    const team = await getTeamForUser();
    if (!team) {
      throw new Error("Team not found");
    }

    return action(formData, team);
  };
}
