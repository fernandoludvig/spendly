import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { query } from "@/lib/db";
import { getAuthUser, unauthorizedResponse } from "@/lib/api-auth";

type RouteParams = { params: { id: string } };

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = getAuthUser(request);
    if (!user) return unauthorizedResponse();

    const transactionId = parseInt(params.id, 10);
    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: "ID de transação inválido." },
        { status: 400 }
      );
    }

    const existing = await query(
      "SELECT id FROM transactions WHERE id = $1 AND user_id = $2",
      [transactionId, user.id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: "Transação não encontrada." },
        { status: 404 }
      );
    }

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
      `UPDATE transactions
       SET category_id = $1, type = $2, amount = $3, description = $4, date = $5
       WHERE id = $6 AND user_id = $7
       RETURNING id, user_id, category_id, type, amount, description, date, created_at`,
      [
        category_id,
        type,
        parsedAmount,
        description ? String(description).trim() : null,
        date,
        transactionId,
        user.id,
      ]
    );

    const categoryNameResult = await query(
      "SELECT name FROM categories WHERE id = $1",
      [category_id]
    );

    return NextResponse.json({
      ...result.rows[0],
      category_name: categoryNameResult.rows[0]?.name ?? null,
    });
  } catch (error) {
    console.error("Transactions PUT error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar transação." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = getAuthUser(request);
    if (!user) return unauthorizedResponse();

    const transactionId = parseInt(params.id, 10);
    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: "ID de transação inválido." },
        { status: 400 }
      );
    }

    const result = await query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id",
      [transactionId, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Transação não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Transactions DELETE error:", error);
    return NextResponse.json(
      { error: "Erro ao excluir transação." },
      { status: 500 }
    );
  }
}
