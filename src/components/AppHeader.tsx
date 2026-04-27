import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";

export function AppHeader() {
  const { location } = useRouterState();
  const path = location.pathname;
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/receitas", label: "receitas" },
    { to: "/minhas-receitas", label: "minhas receitas" },
    { to: "/minha-despensa", label: "minha despensa" },
  ] as const;

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 bg-charcoal/85 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 grid grid-cols-3 items-center">
        <Link to="/" className="font-display italic text-2xl text-blush tracking-tight font-mono">
          receitahub
        </Link>

        <nav className="flex items-center justify-center gap-10">
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

        <div className="flex items-center justify-end gap-5 text-sm">
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
      </div>
    </header>
  );
}
