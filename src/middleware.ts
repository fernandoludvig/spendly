import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "spendly-super-secret-jwt-key-2024";

// Web Cryptography API based JWT Verification for Edge Runtime
function base64urlToArrayBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) {
    base64 += "=".repeat(4 - pad);
  }
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

async function verifyToken(token: string): Promise<any | null> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(JWT_SECRET);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const message = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = base64urlToArrayBuffer(signatureB64);

    const isValid = await crypto.subtle.verify("HMAC", key, signature, message);
    if (!isValid) return null;

    const payloadStr = new TextDecoder().decode(base64urlToArrayBuffer(payloadB64));
    const payload = JSON.parse(payloadStr);

    // Check expiration if present
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;

  const user = token ? await verifyToken(token) : null;

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/transactions")) {
    if (!user) {
      const url = new URL("/login", request.url);
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from /login and /register
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (user) {
      const url = new URL("/dashboard", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/login", "/register"],
};
