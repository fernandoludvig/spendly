import { NextResponse } from "next/server";
import { getSession, JWTPayload } from "@/lib/auth";

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
}

export function getAuthUser(request: Request): JWTPayload | null {
  return getSession(request);
}
