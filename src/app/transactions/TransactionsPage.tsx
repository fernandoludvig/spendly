"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { JWTPayload } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import { formatBRL } from "@/lib/format";

interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
}

interface Transaction {
  id: number;
  type: "income" | "expense";
  amount: string | number;
  description: string | null;
  category_id: number;
  category_name: string | null;
  date: string;
}

interface TransactionForm {
  type: "income" | "expense";
  amount: string;
  description: string;
  category_id: string;
  date: string;
}

const emptyForm = (): TransactionForm => ({
  type: "expense",
  amount: "",
  description: "",
  category_id: "",
  date: new Date().toISOString().split("T")[0],
});

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}

interface TransactionsPageProps {
  user: JWTPayload;
}

export default function TransactionsPage({ user }: TransactionsPageProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TransactionForm>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const filteredCategories = categories.filter((c) => c.type === form.type);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, catRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/categories"),
      ]);
      if (txRes.ok) setTransactions(await txRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch {
      setError("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingId(tx.id);
    setForm({
      type: tx.type,
      amount: String(tx.amount),
      description: tx.description ?? "",
      category_id: String(tx.category_id),
      date: tx.date.split("T")[0],
    });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description,
      category_id: parseInt(form.category_id, 10),
      date: form.date,
    };

    try {
      const url = editingId
        ? `/api/transactions/${editingId}`
        : "/api/transactions";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao salvar transação.");
        return;
      }

      closeModal();
      await loadData();
    } catch {
      setError("Erro ao salvar transação.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadData();
      }
    } catch {
      setError("Erro ao excluir transação.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[300px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none" />

      <AppHeader user={user} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Transações
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Gerencie suas receitas e despesas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-white text-sm font-semibold transition-all duration-200"
            >
              Dashboard
            </Link>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-violet-500/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Transação
            </button>
          </div>
        </div>

        {error && !modalOpen && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Carregando...</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              Nenhuma transação encontrada. Clique em &quot;Nova Transação&quot; para começar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-4 font-semibold">Data</th>
                    <th className="text-left px-6 py-4 font-semibold">Descrição</th>
                    <th className="text-left px-6 py-4 font-semibold">Categoria</th>
                    <th className="text-left px-6 py-4 font-semibold">Tipo</th>
                    <th className="text-right px-6 py-4 font-semibold">Valor</th>
                    <th className="text-right px-6 py-4 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-6 py-4 text-slate-200">
                        {tx.description || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {tx.category_name || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            tx.type === "income"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          {tx.type === "income" ? "Receita" : "Despesa"}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${
                          tx.type === "income" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatBRL(parseFloat(String(tx.amount)))}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 border border-slate-700 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 transition-colors"
                            title="Excluir"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? "Editar Transação" : "Nova Transação"}
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Tipo
                </label>
                <div className="flex rounded-xl border border-slate-800 overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, type: "expense", category_id: "" }))
                    }
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                      form.type === "expense"
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-slate-800/50 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, type: "income", category_id: "" }))
                    }
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                      form.type === "income"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-800/50 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Receita
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Descrição opcional"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Categoria
                </label>
                <select
                  required
                  value={form.category_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category_id: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  <option value="">Selecione uma categoria</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? "Salvando..." : editingId ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
