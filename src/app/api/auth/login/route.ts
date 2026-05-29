import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // Fetch user from database
    const userResult = await query(
      "SELECT id, name, email, password_hash FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    // Sign JWT token
    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    // Set cookie httpOnly session
    cookies().set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno no servidor ao tentar fazer login." },
      { status: 500 }
    );
  }
}
