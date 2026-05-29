import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { query } from "@/lib/db";
import { getAuthUser, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const user = getAuthUser(request);
    if (!user) return unauthorizedResponse();

    const result = await query(
      `SELECT t.id, t.user_id, t.category_id, t.type, t.amount, t.description, t.date, t.created_at,
              c.name AS category_name
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = $1
       ORDER BY t.date DESC, t.created_at DESC`,
      [user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Transactions GET error:", error);
    return NextResponse.json(
      { error: "Erro ao listar transações." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = getAuthUser(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { type, amount, description, category_id, date } = body;

    if (!type || amount === undefined || !category_id || !date) {
      return NextResponse.json(
        { error: "Tipo, valor, categoria e data são obrigatórios." },
        { status: 400 }
      );
    }

    if (type !== "income" && type !== "expense") {
      return NextResponse.json(
        { error: "Tipo deve ser income ou expense." },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Valor deve ser um número positivo." },
        { status: 400 }
      );
    }

    const categoryCheck = await query(
      "SELECT id, type FROM categories WHERE id = $1 AND user_id = $2",
      [category_id, user.id]
    );

    if (categoryCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Categoria não encontrada." },
        { status: 404 }
      );
    }

    if (categoryCheck.rows[0].type !== type) {
      return NextResponse.json(
        { error: "A categoria não corresponde ao tipo da transação." },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO transactions (user_id, category_id, type, amount, description, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, category_id, type, amount, description, date, created_at`,
      [
        user.id,
        category_id,
        type,
        parsedAmount,
        description ? String(description).trim() : null,
        date,
      ]
    );

    const inserted = result.rows[0];
    const categoryNameResult = await query(
      "SELECT name FROM categories WHERE id = $1",
      [category_id]
    );

    return NextResponse.json(
      {
        ...inserted,
        category_name: categoryNameResult.rows[0]?.name ?? null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Transactions POST error:", error);
    return NextResponse.json(
      { error: "Erro ao criar transação." },
      { status: 500 }
    );
  }
}
