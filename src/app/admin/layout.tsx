import { isAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Não bloquear a página de login
  const isLoginPage = true; // vamos verificar pelo path de forma diferente

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-[#ebe3d5] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="GuedesAI" className="h-8 w-auto" />
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/admin"
              className="px-3 py-1.5 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-[#f5f0e8] transition-colors"
            >
              Agentes
            </Link>
            <Link
              href="/admin/criar"
              className="px-3 py-1.5 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-[#f5f0e8] transition-colors"
            >
              Novo Agente
            </Link>
            <span className="text-gray-300 mx-1">|</span>
            <Link
              href="/admin/configuracoes"
              className="px-3 py-1.5 text-sm rounded-md text-amber-700 hover:text-amber-900 hover:bg-amber-50 transition-colors flex items-center gap-1"
            >
              <span className="text-xs">🔒</span>
              Regras Globais
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:inline">Admin</span>
          <LogoutButton />
        </div>
      </header>

      {/* Content area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-[#ebe3d5]">
        GuedesAI © {new Date().getFullYear()} — Simulador de Atendente IA
      </footer>
    </div>
  );
}
