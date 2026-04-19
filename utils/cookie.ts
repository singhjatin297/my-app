"use server";

import { cookies } from "next/headers";

export const setCookie = async (name: string, token: string) => {
  if (!token || !name) return;
  const cookieStore = await cookies();
  cookieStore.set(name, token);
};

export const getCookie = async (name: string) => {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value ?? null;
};
