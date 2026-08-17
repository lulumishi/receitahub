import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PLAN_EMOJI, PLAN_LABEL } from "@/lib/plans";

export function AppHeader() {
  const { location } = useRouterState();
  const path = location.pathname;
  const { session, signOut } = useAuth();
  const { tier } = useSubscription();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navItems = session
    ? ([
        { to: "/receitas", label: "receitas" },
        { to: "/minhas-receitas", label: "minhas receitas" },
        { to: "/minha-despensa", label: "minha despensa" },
        { to: "/planos", label: "planos" },
        { to: "/foto", label: "foto" },
        { to: "/dieta", label: "dieta" },
      ] as const)
    : ([
        { to: "/receitas", label: "receitas" },
        { to: "/planos", label: "planos" },
      ] as const);

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 bg-charcoal/85 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between gap-4">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="font-display italic text-2xl text-blush tracking-tight font-mono shrink-0"
        >
          receitahub
        </Link>

        <nav className="hidden xl:flex items-center justify-center gap-7 flex-1">
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

        <div className="hidden xl:flex items-center justify-end gap-5 text-sm shrink-0">
          {session ? (
            <>
              <Link
                to="/planos"
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                  path === "/planos"
                    ? "border-blush text-blush"
                    : "border-border text-cream/60 hover:border-blush hover:text-blush"
                }`}
              >
                <span>{PLAN_EMOJI[tier]}</span>
                {PLAN_LABEL[tier]}
              </Link>
              <Link
                to="/perfil"
                className={`transition truncate max-w-[160px] ${
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
          className="xl:hidden text-cream p-2 -mr-2"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="xl:hidden border-t border-border bg-charcoal/95 backdrop-blur-xl">
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
                  to="/planos"
                  onClick={() => setOpen(false)}
                  className={`text-sm py-2 ${
                    path === "/planos" ? "text-blush" : "text-cream/70 hover:text-cream"
                  }`}
                >
                  {PLAN_EMOJI[tier]} plano {PLAN_LABEL[tier]}
                </Link>
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
