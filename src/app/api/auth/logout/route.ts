import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    cookies().set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno no servidor ao tentar fazer logout." },
      { status: 500 }
    );
  }
}
