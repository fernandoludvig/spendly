import { cookies, headers } from "next/headers";

export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import { formatBRL } from "@/lib/format";

interface Summary {
  total_income: number;
  total_expenses: number;
  balance: number;
  budget_amount: number | null;
  budget_used_percent: number | null;
}

async function fetchSummary(token: string): Promise<Summary> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const headersList = headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(
    `${protocol}://${host}/api/summary?month=${month}&year=${year}`,
    {
      headers: { Cookie: `session=${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return {
      total_income: 0,
      total_expenses: 0,
      balance: 0,
      budget_amount: null,
      budget_used_percent: null,
    };
  }

  return res.json();
}

export default async function Dashboard() {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    redirect("/login");
  }

  const user = verifyToken(token);
  if (!user) {
    redirect("/login");
  }

  const summary = await fetchSummary(token);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[300px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none" />

      <AppHeader user={user} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Olá, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Aqui está o resumo financeiro da sua conta.
            </p>
          </div>
          <Link
            href="/transactions"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-violet-500/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ver Transações
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:border-slate-700/60 hover:shadow-lg hover:shadow-indigo-500/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Saldo Total</span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div
              className={`text-2xl sm:text-3xl font-bold ${
                summary.balance >= 0 ? "text-white" : "text-rose-400"
              }`}
            >
              {formatBRL(summary.balance)}
            </div>
            {summary.budget_amount !== null && (
              <span className="text-slate-400 text-xs mt-2 block">
                Orçamento: {formatBRL(summary.budget_amount)}
                {summary.budget_used_percent !== null &&
                  ` (${summary.budget_used_percent}% usado)`}
              </span>
            )}
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:border-slate-700/60 hover:shadow-lg hover:shadow-emerald-500/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Receitas</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
              {formatBRL(summary.total_income)}
            </div>
            <span className="text-slate-400 text-xs mt-2 block">Mês atual</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:border-slate-700/60 hover:shadow-lg hover:shadow-rose-500/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Despesas</span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-rose-400">
              {formatBRL(summary.total_expenses)}
            </div>
            <span className="text-slate-400 text-xs mt-2 block">Mês atual</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8 text-center backdrop-blur-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/10 to-indigo-500/10 border border-violet-500/10 flex items-center justify-center mx-auto text-violet-400 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Sucesso na Autenticação!</h2>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            Você está autenticado de forma segura no Spendly. Agora você pode prosseguir para gerenciar suas transações, categorias e limites de gastos.
          </p>
        </div>
      </main>
    </div>
  );
}
