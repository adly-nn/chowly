import { cookies } from "next/headers";

export type Role = "customer" | "waiter";

export interface Session {
  role: Role;
  customerId: string;
  waiterId: string;
}

const COOKIE_NAME = "chowly_session";

const DEFAULT_SESSION: Session = {
  role: "customer",
  customerId: "C001",
  waiterId: "W001",
};

export async function getSession(): Promise<Session> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return DEFAULT_SESSION;

  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return { ...DEFAULT_SESSION, ...parsed };
  } catch {
    return DEFAULT_SESSION;
  }
}

export async function setSession(session: Session): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, encodeURIComponent(JSON.stringify(session)), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
