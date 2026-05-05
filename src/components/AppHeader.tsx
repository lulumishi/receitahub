import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AppHeader() {
  const { location } = useRouterState();
  const path = location.pathname;
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navItems = session
    ? ([
        { to: "/receitas", label: "receitas" },
        { to: "/minhas-receitas", label: "minhas receitas" },
        { to: "/minha-despensa", label: "minha despensa" },
        { to: "/lista-compras", label: "lista de compras" },
      ] as const)
    : ([{ to: "/receitas", label: "receitas" }] as const);

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 bg-charcoal/85 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between lg:grid lg:grid-cols-3">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="font-display italic text-2xl text-blush tracking-tight font-mono"
        >
          receitahub
        </Link>

        <nav className="hidden lg:flex items-center justify-center gap-10">
          {navItems.map((item) => {
            const active = path === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative text-sm transition ${
                  active ? "text-blush" : "text-cream/70 hover:text-cream"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-blush" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center justify-end gap-5 text-sm">
          {session ? (
            <>
              <Link
                to="/perfil"
                className={`transition truncate max-w-[180px] ${
                  path === "/perfil" ? "text-blush" : "text-cream/70 hover:text-cream"
                }`}
              >
                {session.user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="text-cream/70 hover:text-blush transition"
              >
                sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-cream/70 hover:text-cream transition">
                logar
              </Link>
              <Link
                to="/cadastro"
                className="text-blush hover:text-blush-deep transition italic font-display"
              >
                cadastrar
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="menu"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden text-cream p-2 -mr-2"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-charcoal/95 backdrop-blur-xl">
          <nav className="flex flex-col px-6 py-4 gap-3">
            {navItems.map((item) => {
              const active = path === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`text-sm py-2 transition ${
                    active ? "text-blush" : "text-cream/70 hover:text-cream"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="h-px bg-border my-2" />
            {session ? (
              <>
                <Link
                  to="/perfil"
                  onClick={() => setOpen(false)}
                  className={`text-sm py-2 truncate ${
                    path === "/perfil" ? "text-blush" : "text-cream/70 hover:text-cream"
                  }`}
                >
                  {session.user.email}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm py-2 text-left text-cream/70 hover:text-blush transition"
                >
                  sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="text-sm py-2 text-cream/70 hover:text-cream transition"
                >
                  logar
                </Link>
                <Link
                  to="/cadastro"
                  onClick={() => setOpen(false)}
                  className="text-sm py-2 text-blush hover:text-blush-deep transition italic font-display"
                >
                  cadastrar
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
