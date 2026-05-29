import { JWTPayload } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

interface AppHeaderProps {
  user: JWTPayload;
}

export default function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-violet-500/10">
            S
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Spendly</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-sm font-semibold text-slate-200">{user.name}</span>
            <span className="text-xs text-slate-500">{user.email}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-semibold shadow-inner">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
