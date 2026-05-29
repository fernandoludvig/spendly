import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { query, seedDefaultCategories } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos os campos (nome, email e senha) são obrigatórios." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "O formato do e-mail é inválido." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase().trim(),
    ]);

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Este e-mail já está sendo utilizado." },
        { status: 409 }
      );
    }

    // Hash password with bcryptjs (salt size 12)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into database
    const insertResult = await query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name.trim(), email.toLowerCase().trim(), passwordHash]
    );

    const newUser = insertResult.rows[0];

    await seedDefaultCategories(newUser.id);

    // Sign JWT token
    const token = signToken({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });

    // Set cookie httpOnly session
    cookies().set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno no servidor ao tentar registrar." },
      { status: 500 }
    );
  }
}
