import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { query } from "@/lib/db";
import { getAuthUser, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const user = getAuthUser(request);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    const now = new Date();
    const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;
    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();

    if (isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Mês inválido." },
        { status: 400 }
      );
    }

    if (isNaN(year) || year < 2000) {
      return NextResponse.json(
        { error: "Ano inválido." },
        { status: 400 }
      );
    }

    const totalsResult = await query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses
       FROM transactions
       WHERE user_id = $1
         AND EXTRACT(MONTH FROM date) = $2
         AND EXTRACT(YEAR FROM date) = $3`,
      [user.id, month, year]
    );

    const totalIncome = parseFloat(totalsResult.rows[0].total_income);
    const totalExpenses = parseFloat(totalsResult.rows[0].total_expenses);
    const balance = totalIncome - totalExpenses;

    const budgetResult = await query(
      "SELECT amount FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3",
      [user.id, month, year]
    );

    let budgetAmount: number | null = null;
    let budgetUsedPercent: number | null = null;

    if (budgetResult.rows.length > 0) {
      budgetAmount = parseFloat(budgetResult.rows[0].amount);
      if (budgetAmount > 0) {
        budgetUsedPercent = Math.round((totalExpenses / budgetAmount) * 10000) / 100;
      } else {
        budgetUsedPercent = 0;
      }
    }

    return NextResponse.json({
      total_income: totalIncome,
      total_expenses: totalExpenses,
      balance,
      budget_amount: budgetAmount,
      budget_used_percent: budgetUsedPercent,
    });
  } catch (error) {
    console.error("Summary GET error:", error);
    return NextResponse.json(
      { error: "Erro ao obter resumo financeiro." },
      { status: 500 }
    );
  }
}
