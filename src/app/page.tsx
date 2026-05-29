import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden px-4">
      {/* Background blobs for premium depth */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-4xl text-center relative z-10 flex flex-col items-center">
        {/* Logo Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-extrabold text-2xl shadow-xl shadow-violet-500/25 mb-6">
          S
        </div>
        
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 max-w-2xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-none">
          Domine suas finanças com o Spendly
        </h1>
        
        {/* Subtitle */}
        <p className="text-slate-400 text-base sm:text-xl max-w-xl mb-10 leading-relaxed">
          A ferramenta inteligente, simples e segura para acompanhar suas receitas, despesas e planejar o seu orçamento mensal de forma visual.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm">
          <Link
            href="/register"
            className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl py-4 transition duration-200 shadow-lg shadow-violet-600/20 text-center"
          >
            Criar conta gratuita
          </Link>
          <Link
            href="/login"
            className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl py-4 transition duration-200 text-center"
          >
            Acessar conta
          </Link>
        </div>

        {/* Feature badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-16 text-slate-500 text-sm max-w-2xl w-full border-t border-slate-900 pt-8">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Autenticação Segura</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Orçamentos & Métricas</span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Interface Premium</span>
          </div>
        </div>
      </div>
    </main>
  );
}
