import { NewUser, Team } from "@workspace/db/schema";
import { compare, hash } from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

import { env } from "@/env/server";

const key = new TextEncoder().encode(env.AUTH_SECRET);
const SALT_ROUNDS = 10;

type SessionData = {
  currentTeam?: { id: string };
  expires: string;
  user: { id: string };
};

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await verifyToken(session);
}

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function setSession(user: NewUser, team?: null | Team) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    expires: expiresInOneDay.toISOString(),
    user: { id: user.id! },
  };

  if (team) {
    session.currentTeam = { id: team.id };
  }

  const encryptedSession = await signToken(session);
  (await cookies()).set("session", encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  });
}

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 day from now")
    .sign(key);
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload as SessionData;
}
