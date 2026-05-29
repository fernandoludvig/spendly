import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "spendly-super-secret-jwt-key-2024";

export interface JWTPayload {
  id: number;
  name: string;
  email: string;
}

export function signToken(payload: JWTPayload): string {
  // Signs token with 7 days expiration
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function getSession(request: NextRequest | Request): JWTPayload | null {
  let token: string | undefined;

  // 1. Try to read from request.cookies if it exists (NextRequest)
  if ('cookies' in request && typeof request.cookies.get === 'function') {
    token = request.cookies.get("session")?.value;
  }

  // 2. Fallback: Parse the Cookie header manually (Standard Request)
  if (!token) {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies["session"];
    }
  }

  if (!token) return null;

  return verifyToken(token);
}
