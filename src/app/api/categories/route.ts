import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { query } from "@/lib/db";
import { getAuthUser, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const user = getAuthUser(request);
    if (!user) return unauthorizedResponse();

    const result = await query(
      "SELECT id, user_id, name, type FROM categories WHERE user_id = $1 ORDER BY type, name",
      [user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: "Erro ao listar categorias." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = getAuthUser(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { name, type } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Nome e tipo são obrigatórios." },
        { status: 400 }
      );
    }

    if (type !== "income" && type !== "expense") {
      return NextResponse.json(
        { error: "Tipo deve ser income ou expense." },
        { status: 400 }
      );
    }

    const trimmedName = String(name).trim();
    if (!trimmedName) {
      return NextResponse.json(
        { error: "Nome da categoria é inválido." },
        { status: 400 }
      );
    }

    const result = await query(
      "INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING id, user_id, name, type",
      [user.id, trimmedName, type]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Categories POST error:", error);
    return NextResponse.json(
      { error: "Erro ao criar categoria." },
      { status: 500 }
    );
  }
}
